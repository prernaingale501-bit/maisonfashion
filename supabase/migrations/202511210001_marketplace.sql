create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin', 'vendor', 'customer');
create type public.vendor_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  business_name text not null,
  store_name text not null,
  email text not null,
  phone text not null,
  business_address jsonb not null default '{}'::jsonb,
  gst_number text,
  pan_number text,
  bank_details jsonb not null default '{}'::jsonb,
  categories text[] not null default '{}',
  status public.vendor_status not null default 'pending',
  commission_rate numeric(5,2) not null default 15.00 check (commission_rate between 0 and 100),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vendors_owner_idx on public.vendors(owner_id);
create index vendors_status_idx on public.vendors(status);

create table public.vendor_documents (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now()
);
create index vendor_documents_vendor_idx on public.vendor_documents(vendor_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  material text,
  care_instructions text,
  status public.product_status not null default 'draft',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  average_rating numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_vendor_idx on public.products(vendor_id);
create index products_category_status_idx on public.products(category_id, status);
create index products_brand_idx on public.products(brand_id);
create index products_published_idx on public.products(published_at desc) where status = 'published';

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images(product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  size text,
  color text,
  color_code text,
  price_adjustment numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants(product_id);

create table public.inventory (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= quantity),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(wishlist_id, product_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses(user_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_order numeric(12,2) not null default 0,
  max_uses integer,
  uses_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  address_id uuid references public.addresses(id) on delete set null,
  status public.order_status not null default 'pending',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  total numeric(12,2) not null check (total >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  shipping_address jsonb not null,
  billing_address jsonb,
  tracking_number text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, placed_at desc);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  product_name text not null,
  sku text,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  commission_amount numeric(12,2) not null default 0,
  fulfillment_status text not null default 'pending' check (fulfillment_status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  created_at timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_vendor_idx on public.order_items(vendor_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check (provider in ('razorpay', 'cod')),
  provider_order_id text unique,
  provider_payment_id text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  status public.payment_status not null default 'pending',
  signature_verified boolean not null default false,
  webhook_event_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments(order_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);
create index reviews_product_idx on public.reviews(product_id, created_at desc);

create table public.vendor_commissions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  rate numeric(5,2) not null check (rate between 0 and 100),
  gross_amount numeric(12,2) not null,
  commission_amount numeric(12,2) not null,
  net_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index vendor_commissions_vendor_idx on public.vendor_commissions(vendor_id, created_at desc);

create table public.vendor_payouts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed')),
  reference text,
  period_start date,
  period_end date,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index vendor_payouts_vendor_idx on public.vendor_payouts(vendor_id, created_at desc);

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'received', 'refunded')),
  refund_amount numeric(12,2) not null default 0,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index returns_vendor_idx on public.returns(vendor_id, created_at desc);
create index returns_customer_idx on public.returns(user_id, created_at desc);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text not null,
  destination_url text,
  placement text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin') $$;

create or replace function public.owns_vendor(target_vendor uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.vendors where id = target_vendor and owner_id = auth.uid() and status = 'approved') $$;

create or replace function public.is_vendor_member(target_vendor uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.vendors where id = target_vendor and owner_id = auth.uid()) $$;

create or replace function public.vendor_can_view_order(target_order uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
      from public.order_items oi
     where oi.order_id = target_order
       and public.is_vendor_member(oi.vendor_id)
  )
$$;

create or replace function public.vendor_update_fulfillment(
  target_item uuid,
  next_status text,
  tracking text default null
)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if next_status not in ('processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unsupported fulfillment status';
  end if;
  update public.order_items
     set fulfillment_status = next_status,
         tracking_number = case when next_status = 'shipped' then tracking else tracking_number end
   where id = target_item
     and public.owns_vendor(vendor_id);
  if not found then
    raise exception 'Order item not found or access denied';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_documents enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.vendor_commissions enable row level security;
alter table public.vendor_payouts enable row level security;
alter table public.returns enable row level security;
alter table public.banners enable row level security;

create policy "Profiles are visible to their owner and admins" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Customers can create their own profile" on public.profiles for insert with check (id = auth.uid() and role = 'customer');
create policy "Profiles can be updated by owner and admins" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

create policy "Vendors can read own application" on public.vendors for select using (owner_id = auth.uid() or public.is_admin());
create policy "Profiles can apply to sell" on public.vendors for insert with check (owner_id = auth.uid() and status = 'pending');
create policy "Owners can update pending applications" on public.vendors for update using ((owner_id = auth.uid() and status = 'pending') or public.is_admin()) with check ((owner_id = auth.uid() and status = 'pending') or public.is_admin());
create policy "Admins can delete vendors" on public.vendors for delete using (public.is_admin());
create policy "Vendor documents visible to owner and admins" on public.vendor_documents for select using (public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Vendor owners can upload application documents" on public.vendor_documents for insert with check (public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Vendor owners can remove own documents" on public.vendor_documents for delete using (public.is_vendor_member(vendor_id) or public.is_admin());

create policy "Active categories are public" on public.categories for select using (is_active or public.is_admin());
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Active brands are public" on public.brands for select using (is_active or public.is_admin());
create policy "Admins manage brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());

create policy "Published products are public" on public.products for select using (status = 'published' or public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Approved vendors create products" on public.products for insert with check (public.owns_vendor(vendor_id));
create policy "Vendors update own products" on public.products for update using (public.owns_vendor(vendor_id) or public.is_admin()) with check (public.owns_vendor(vendor_id) or public.is_admin());
create policy "Vendors delete own products" on public.products for delete using (public.owns_vendor(vendor_id) or public.is_admin());
create policy "Product images follow product access" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.is_vendor_member(p.vendor_id) or public.is_admin())));
create policy "Product owners manage images" on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_vendor(p.vendor_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_vendor(p.vendor_id) or public.is_admin())));
create policy "Variants follow product access" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or public.is_vendor_member(p.vendor_id) or public.is_admin())));
create policy "Product owners manage variants" on public.product_variants for all using (exists (select 1 from public.products p where p.id = product_id and (public.owns_vendor(p.vendor_id) or public.is_admin()))) with check (exists (select 1 from public.products p where p.id = product_id and (public.owns_vendor(p.vendor_id) or public.is_admin())));
create policy "Inventory is public for published products" on public.inventory for select using (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id where v.id = variant_id and (p.status = 'published' or public.is_vendor_member(p.vendor_id) or public.is_admin())));
create policy "Product owners manage inventory" on public.inventory for all using (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id where v.id = variant_id and (public.owns_vendor(p.vendor_id) or public.is_admin()))) with check (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id where v.id = variant_id and (public.owns_vendor(p.vendor_id) or public.is_admin())));

create policy "Customers manage own carts" on public.carts for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Cart items belong to own cart" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()) or public.is_admin());
create policy "Customers manage own wishlists" on public.wishlists for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Wishlist items belong to own wishlist" on public.wishlist_items for all using (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.wishlists w where w.id = wishlist_id and w.user_id = auth.uid()) or public.is_admin());
create policy "Customers manage own addresses" on public.addresses for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Active coupons are public" on public.coupons for select using ((is_active and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at > now())) or public.is_admin());
create policy "Admins manage coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "Customers and admins read orders" on public.orders for select using (user_id = auth.uid() or public.is_admin() or public.vendor_can_view_order(id));
create policy "Admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "Order items visible to buyer, vendor, or admin" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()) or public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Payments visible to buyer and admins" on public.payments for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()) or public.is_admin());
create policy "Admins manage payment records" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "Published reviews are public" on public.reviews for select using (is_published or user_id = auth.uid() or public.is_admin());
create policy "Customers review purchased items" on public.reviews for insert with check (
  user_id = auth.uid()
  and order_item_id is not null
  and exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.id = order_item_id and oi.product_id = product_id and o.user_id = auth.uid() and o.status = 'delivered'
  )
);
create policy "Review authors and admins update reviews" on public.reviews for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "Vendors read own commissions" on public.vendor_commissions for select using (public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Admins manage commissions" on public.vendor_commissions for all using (public.is_admin()) with check (public.is_admin());
create policy "Vendors read own payouts" on public.vendor_payouts for select using (public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Admins manage payouts" on public.vendor_payouts for all using (public.is_admin()) with check (public.is_admin());
create policy "Returns visible to customer vendor and admins" on public.returns for select using (user_id = auth.uid() or public.is_vendor_member(vendor_id) or public.is_admin());
create policy "Customers request own returns" on public.returns for insert with check (user_id = auth.uid());
create policy "Vendors update own returns" on public.returns for update using (public.owns_vendor(vendor_id) or public.is_admin()) with check (public.owns_vendor(vendor_id) or public.is_admin());
create policy "Active banners are public" on public.banners for select using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or public.is_admin());
create policy "Admins manage banners" on public.banners for all using (public.is_admin()) with check (public.is_admin());

grant execute on function public.vendor_update_fulfillment(uuid, text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-documents', 'vendor-documents', false, 10485760, array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy "Public can view product media" on storage.objects for select using (bucket_id = 'product-media');
create policy "Vendor can upload product media to own folder" on storage.objects for insert to authenticated with check (
  bucket_id = 'product-media' and (public.owns_vendor((storage.foldername(name))[1]::uuid) or public.is_admin())
);
create policy "Vendor can update own product media" on storage.objects for update to authenticated using (
  bucket_id = 'product-media' and (public.owns_vendor((storage.foldername(name))[1]::uuid) or public.is_admin())
) with check (bucket_id = 'product-media' and (public.owns_vendor((storage.foldername(name))[1]::uuid) or public.is_admin()));
create policy "Vendor can delete own product media" on storage.objects for delete to authenticated using (
  bucket_id = 'product-media' and (public.owns_vendor((storage.foldername(name))[1]::uuid) or public.is_admin())
);
create policy "Vendor can access own documents" on storage.objects for select to authenticated using (
  bucket_id = 'vendor-documents' and (public.is_vendor_member((storage.foldername(name))[1]::uuid) or public.is_admin())
);
create policy "Vendor can upload own documents" on storage.objects for insert to authenticated with check (
  bucket_id = 'vendor-documents' and (public.is_vendor_member((storage.foldername(name))[1]::uuid) or public.is_admin())
);
create policy "Vendor can delete own documents" on storage.objects for delete to authenticated using (
  bucket_id = 'vendor-documents' and (public.is_vendor_member((storage.foldername(name))[1]::uuid) or public.is_admin())
);
