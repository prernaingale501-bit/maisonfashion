import { createClient } from 'npm:@supabase/supabase-js@2'

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!secret || !supabaseUrl || !serviceKey) return new Response('Webhook is not configured', { status: 500 })

  const signature = request.headers.get('x-razorpay-signature')
  const eventId = request.headers.get('x-razorpay-event-id')
  const rawBody = await request.text()
  if (!signature || !eventId || !constantTimeEqual(await hmacHex(secret, rawBody), signature)) {
    return new Response('Invalid webhook signature', { status: 401 })
  }

  let event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid webhook payload', { status: 400 })
  }

  if (!['payment.captured', 'payment.failed'].includes(event.event ?? '')) {
    return new Response('Event ignored', { status: 200 })
  }
  const entity = event.payload?.payment?.entity
  if (typeof entity?.order_id !== 'string' || typeof entity.id !== 'string' || typeof entity.amount !== 'number') {
    return new Response('Payment details missing', { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const { data: payment, error: lookupError } = await supabase
    .from('payments')
    .select('id, order_id, amount, status')
    .eq('provider_order_id', entity.order_id)
    .maybeSingle()
  if (lookupError) return new Response('Unable to verify payment record', { status: 500 })
  if (!payment) return new Response('Payment order not found', { status: 404 })
  if (Math.round(Number(payment.amount) * 100) !== entity.amount) return new Response('Payment amount mismatch', { status: 400 })

  const nextStatus = event.event === 'payment.captured' ? 'paid' : 'failed'
  if (payment.status !== nextStatus) {
    const { error: updateError } = await supabase.from('payments').update({
      provider_payment_id: entity.id,
      status: nextStatus,
      signature_verified: true,
      webhook_event_id: eventId,
      paid_at: nextStatus === 'paid' ? new Date().toISOString() : null,
    }).eq('id', payment.id)
    if (updateError) return new Response('Unable to record payment result', { status: 500 })
    if (nextStatus === 'paid') {
      const { error: orderError } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', payment.order_id)
      if (orderError) return new Response('Payment recorded; order update requires retry', { status: 500 })
    }
  }

  return new Response('ok', { status: 200 })
})
