import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return respond({ error: 'Authentication required' }, 401)

  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
  const config = Object.fromEntries(required.map((key) => [key, Deno.env.get(key)]))
  const missing = required.filter((key) => !config[key])
  if (missing.length) return respond({ error: `Server configuration missing: ${missing.join(', ')}` }, 500)

  let orderId: string
  try {
    const body = await request.json()
    orderId = body.orderId
    if (typeof orderId !== 'string' || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return respond({ error: 'A valid orderId is required' }, 400)
    }
  } catch {
    return respond({ error: 'Invalid JSON body' }, 400)
  }

  const client = createClient(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const token = authorization.slice('Bearer '.length)
  const { data: authData, error: authError } = await client.auth.getUser(token)
  if (authError || !authData.user) return respond({ error: 'Invalid or expired session' }, 401)

  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id, user_id, status, total')
    .eq('id', orderId)
    .eq('user_id', authData.user.id)
    .maybeSingle()
  if (orderError) return respond({ error: 'Unable to verify order ownership' }, 500)
  if (!order) return respond({ error: 'Order not found' }, 404)
  if (!['pending', 'confirmed'].includes(order.status)) return respond({ error: 'Order is not payable' }, 409)

  const amount = Math.round(Number(order.total) * 100)
  if (!Number.isSafeInteger(amount) || amount <= 0) return respond({ error: 'Order total is invalid' }, 400)

  const { data: existingPayment, error: paymentReadError } = await client
    .from('payments')
    .select('provider_order_id, amount, currency, status')
    .eq('order_id', order.id)
    .eq('provider', 'razorpay')
    .eq('status', 'pending')
    .maybeSingle()
  if (paymentReadError) return respond({ error: 'Unable to verify payment status' }, 500)
  if (existingPayment?.provider_order_id && Number(existingPayment.amount) * 100 === amount) {
    return respond({ keyId: config.RAZORPAY_KEY_ID!, razorpayOrderId: existingPayment.provider_order_id, amount, currency: existingPayment.currency })
  }

  const credentials = btoa(`${config.RAZORPAY_KEY_ID}:${config.RAZORPAY_KEY_SECRET}`)
  const providerResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: order.id,
      notes: { marketplace_order_id: order.id, customer_id: authData.user.id },
    }),
  })
  const providerOrder = await providerResponse.json()
  if (!providerResponse.ok || typeof providerOrder.id !== 'string') {
    console.error('Razorpay order creation failed', providerResponse.status, providerOrder.error?.code)
    return respond({ error: 'Payment provider could not create the order' }, 502)
  }

  const { error: saveError } = await client.from('payments').insert({
    order_id: order.id,
    provider: 'razorpay',
    provider_order_id: providerOrder.id,
    amount: Number(order.total),
    currency: 'INR',
    status: 'pending',
  })
  if (saveError) {
    console.error('Could not persist payment order', saveError.code)
    return respond({ error: 'Unable to save payment details' }, 500)
  }

  return respond({ keyId: config.RAZORPAY_KEY_ID!, razorpayOrderId: providerOrder.id, amount, currency: 'INR' })
})
