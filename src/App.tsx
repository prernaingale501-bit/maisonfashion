import { useMemo, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft,
  ChevronRight, Heart, Instagram, Menu, Minus, Plus, Search, ShieldCheck,
  ShoppingBag, SlidersHorizontal, Sparkles, Truck, UserRound, X,
} from 'lucide-react'

type Product = {
  id: number
  name: string
  brand: string
  price: number
  oldPrice?: number
  category: string
  tag?: string
  image: string
  alt: string
  color: string
}

const products: Product[] = [
  { id: 1, name: 'The Sculpted Wool Coat', brand: 'STUDIO NICHOLSON', price: 42800, category: 'Clothing', tag: 'NEW ARRIVAL', image: 'photo-1539109136881-3be0616acf4b', alt: 'Model wearing a sculptural beige trench coat', color: 'Warm stone' },
  { id: 2, name: 'Relaxed Tailored Trouser', brand: 'TOTEME', price: 18900, oldPrice: 24500, category: 'Clothing', tag: 'ONLY A FEW LEFT', image: 'photo-1483985988355-763728e1935b', alt: 'Woman in refined minimalist tailoring', color: 'Espresso' },
  { id: 3, name: 'Soft Grain Shoulder Bag', brand: 'HEREU', price: 32600, category: 'Accessories', image: 'photo-1584917865442-de89df76afd3', alt: 'Handcrafted leather shoulder bag', color: 'Black' },
  { id: 4, name: 'Linen Blend Overshirt', brand: 'A.P.C.', price: 14200, oldPrice: 17800, category: 'Clothing', tag: '−20%', image: 'photo-1591047139829-d91aecb6caea', alt: 'Minimal linen shirt in natural tones', color: 'Ivory' },
  { id: 5, name: 'Leather Ballet Flat', brand: 'NEOUS', price: 27900, category: 'Footwear', tag: 'NEW ARRIVAL', image: 'photo-1543163521-1bf539c55dd2', alt: 'Refined leather flat shoes', color: 'Merlot' },
  { id: 6, name: 'Everyday Cashmere Knit', brand: 'ARCH4', price: 36500, category: 'Clothing', image: 'photo-1576566588028-4147f3842f27', alt: 'Soft cashmere knitwear in cream', color: 'Oatmeal' },
  { id: 7, name: 'Suede Weekend Tote', brand: 'LITTLE LIFFNER', price: 39800, category: 'Accessories', tag: 'EDITOR’S PICK', image: 'photo-1590874103328-eac38a683ce7', alt: 'Suede tote bag for everyday use', color: 'Chocolate' },
  { id: 8, name: 'The Sunday Set', brand: 'LESET', price: 21400, oldPrice: 26700, category: 'Clothing', image: 'photo-1485230895905-ec40ba36b9bc', alt: 'Effortless modern two piece outfit', color: 'Soft grey' },
]

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`
const imageUrl = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

function App() {
  const [page, setPage] = useState<'home' | 'shop' | 'product' | 'account' | 'vendor' | 'admin' | 'checkout'>('home')
  const [activeProduct, setActiveProduct] = useState<Product>(products[0])
  const [bag, setBag] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [bagOpen, setBagOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [category, setCategory] = useState('All pieces')
  const [sort, setSort] = useState('Recommended')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [pin, setPin] = useState('')
  const [pinChecked, setPinChecked] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const visibleProducts = useMemo(() => {
    let items = products.filter((p) => category === 'All pieces' || p.category === category)
    if (query.trim()) items = items.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase()))
    if (sort === 'Price: Low to High') items = [...items].sort((a, b) => a.price - b.price)
    if (sort === 'Price: High to Low') items = [...items].sort((a, b) => b.price - a.price)
    return items
  }, [category, query, sort])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }
  const goShop = (kind = 'All pieces') => {
    setCategory(kind)
    setQuery('')
    setPage('shop')
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const searchShop = () => {
    setCategory('All pieces')
    setSearchOpen(false)
    setPage('shop')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openProduct = (product: Product) => {
    setActiveProduct(product)
    setSize('')
    setQuantity(1)
    setPinChecked(false)
    setPage('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const addBag = (product: Product, count = 1) => {
    setBag((items) => [...items, ...Array.from({ length: count }, () => product)])
    notify('Added to your bag')
  }
  const toggleFavorite = (id: number) => setFavorites((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  return (
    <div className="app-shell">
      <div className="announcement">COMPLIMENTARY SHIPPING ON ALL ORDERS ABOVE ₹15,000 <span>—</span> DISCOVER THE AUTUMN EDIT</div>
      <header className="site-header">
        <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={19} /></button>
        <button className="wordmark" onClick={() => setPage('home')}>maison<span>.</span></button>
        <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`}>
          <button onClick={() => goShop('Clothing')}>WOMEN</button>
          <button onClick={() => goShop('Clothing')}>MEN</button>
          <button onClick={() => goShop('All pieces')}>DESIGNERS</button>
          <button onClick={() => goShop('All pieces')}>NEW IN</button>
          <button onClick={() => goShop('Footwear')}>SHOES & BAGS</button>
          <button onClick={() => goShop('Accessories')}>OBJECTS</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /><span>SEARCH</span></button>
          <button className="icon-button" aria-label="My account" onClick={() => setPage('account')}><UserRound size={18} /></button>
          <button className="icon-button" aria-label="Wishlist" onClick={() => { setCategory('All pieces'); setPage('shop'); notify(`${favorites.length} saved pieces`) }}><Heart size={18} /><span className="action-count">{favorites.length || ''}</span></button>
          <button className="icon-button bag-trigger" aria-label="Shopping bag" onClick={() => setBagOpen(true)}><ShoppingBag size={18} /><span>BAG ({bag.length})</span></button>
        </div>
        {searchOpen && <div className="search-panel"><Search size={18} /><input autoFocus placeholder="Search designers, pieces, stories..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchShop()} /><button onClick={searchShop}>VIEW RESULTS <ArrowRight size={14} /></button><button className="bare-icon" onClick={() => { setSearchOpen(false); setQuery('') }} aria-label="Close search"><X size={18} /></button></div>}
      </header>

      <main>
        {page === 'home' && <HomePage goShop={goShop} openProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addBag={addBag} onSubscribe={(value) => { setEmail(value); setSubscribed(true) }} onEmailChange={setEmail} subscribed={subscribed} email={email} />}
        {page === 'shop' && <ShopPage products={visibleProducts} category={category} setCategory={setCategory} sort={sort} setSort={setSort} onProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addBag={addBag} onFilter={() => setFilterOpen(!filterOpen)} filterOpen={filterOpen} />}
        {page === 'product' && <ProductPage product={activeProduct} onBack={() => setPage('shop')} addBag={addBag} buyNow={(product, count) => { addBag(product, count); setPage('checkout') }} size={size} setSize={setSize} quantity={quantity} setQuantity={setQuantity} pin={pin} setPin={setPin} pinChecked={pinChecked} checkPin={() => setPinChecked(true)} favorite={favorites.includes(activeProduct.id)} toggleFavorite={() => toggleFavorite(activeProduct.id)} openProduct={openProduct} />}
        {page === 'account' && <AccountPage onBack={() => setPage('home')} />}
        {page === 'vendor' && <VendorPage onBack={() => setPage('home')} notify={notify} />}
        {page === 'admin' && <AdminPage onBack={() => setPage('home')} />}
        {page === 'checkout' && <CheckoutPage bag={bag} onBack={() => setBagOpen(true)} onComplete={() => { setBag([]); setBagOpen(false); setPage('home'); notify('Demo order complete — no payment was processed.') }} />}
      </main>

      {page === 'home' && <Footer goShop={goShop} setPage={setPage} />}
      {page !== 'home' && page !== 'vendor' && page !== 'admin' && page !== 'checkout' && <Footer goShop={goShop} setPage={setPage} />}

      {bagOpen && <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setBagOpen(false)}><aside className="bag-drawer"><div className="drawer-heading"><div><span className="eyebrow">YOUR EDIT</span><h2>Shopping bag <span>({bag.length})</span></h2></div><button className="bare-icon" onClick={() => setBagOpen(false)} aria-label="Close bag"><X size={20} /></button></div>{bag.length ? <><div className="bag-items">{bag.map((item, index) => <div className="bag-item" key={`${item.id}-${index}`}><img src={imageUrl(item.image, 240)} alt={item.alt} /><div><span className="eyebrow">{item.brand}</span><strong>{item.name}</strong><span>{money(item.price)}</span><button className="remove-link" onClick={() => setBag((prev) => prev.filter((_, i) => i !== index))}>REMOVE</button></div></div>)}</div><div className="bag-bottom"><div className="shipping-note"><Truck size={16} /> Complimentary shipping unlocked</div><div className="subtotal"><span>Subtotal</span><strong>{money(bag.reduce((sum, item) => sum + item.price, 0))}</strong></div><p>Taxes and delivery calculated at checkout.</p><button className="button button-dark full-button" onClick={() => { setBagOpen(false); setPage('checkout') }}>CONTINUE TO CHECKOUT <ArrowRight size={15} /></button><button className="continue-link" onClick={() => setBagOpen(false)}>CONTINUE DISCOVERING</button></div></> : <div className="empty-bag"><ShoppingBag size={30} strokeWidth={1} /><h3>Your bag is taking a moment.</h3><p>When you find something you love, it will be waiting here.</p><button className="button button-outline" onClick={() => { setBagOpen(false); goShop() }}>DISCOVER THE COLLECTION</button></div>}</aside></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}
export default App

function HomePage({ goShop, openProduct, favorites, toggleFavorite, addBag, onSubscribe, onEmailChange, subscribed, email }: {
  goShop: (kind?: string) => void; openProduct: (p: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void; addBag: (p: Product) => void
  onSubscribe: (value: string) => void; onEmailChange: (value: string) => void; subscribed: boolean; email: string
}) {
  return <>
    <section className="hero">
      <img className="hero-image" src={imageUrl('photo-1539109136881-3be0616acf4b', 2200)} alt="Model in an oversized ivory coat in a sunlit city" />
      <div className="hero-shade" />
      <div className="hero-copy"><span className="hero-kicker">THE NEW SEASON, CONSIDERED</span><h1>Clothes to<br />come home to.</h1><p>An edit of forever pieces, found<br />in the places you least expect.</p><button className="button button-light" onClick={() => goShop()}>EXPLORE THE AUTUMN EDIT <ArrowRight size={15} /></button></div>
      <div className="hero-index"><span>01</span><i /><span>03</span></div>
      <span className="hero-caption">AUTUMN / WINTER 2025 — A STUDY IN SOFT STRUCTURE</span>
    </section>

    <section className="intro-section content-width"><div><span className="eyebrow">A DIFFERENT KIND OF DISCOVERY</span><h2>Good things take<br /><em>good finding.</em></h2></div><div className="intro-text"><p>Maison brings together the designers, makers and independent labels we think deserve a place in your wardrobe. A little less, a lot more considered.</p><button className="text-link" onClick={() => goShop()}>OUR POINT OF VIEW <ArrowUpRight size={15} /></button></div></section>

    <section className="category-section content-width"><SectionHeading eyebrow="FIND YOUR WAY" title="The wardrobe, in chapters." link="VIEW ALL" onClick={() => goShop()} /><div className="category-grid">
      {[
        ['WOMEN', 'photo-1483985988355-763728e1935b', 'A softer kind of statement', 'Clothing'],
        ['MEN', 'photo-1516257984-b1b4d707412e', 'Made to wear, again and again', 'Clothing'],
        ['SHOES & BAGS', 'photo-1543163521-1bf539c55dd2', 'The finishing touch', 'Footwear'],
        ['THE SMALL THINGS', 'photo-1584917865442-de89df76afd3', 'Objects worth keeping', 'Accessories'],
      ].map(([label, image, copy, category], index) => <button className={`category-tile category-tile-${index}`} key={label} onClick={() => goShop(category)}><img src={imageUrl(image, 720)} alt={copy} /><div className="category-overlay"><span>{label}</span><b>{copy}</b><ArrowUpRight size={17} /></div></button>)}
    </div></section>

    <section className="product-section content-width"><SectionHeading eyebrow="JUST ARRIVED" title="New to the conversation." link="SHOP NEW IN" onClick={() => goShop()} /><ProductGrid products={products.slice(0, 4)} onProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addBag={addBag} /></section>

    <section className="manifesto"><div className="manifesto-image"><img src={imageUrl('photo-1529139574466-a303027c1d8b', 1200)} alt="Editorial portrait in understated tailoring" /><span>AN EXERCISE IN GETTING DRESSED</span></div><div className="manifesto-copy"><span className="eyebrow">THE MAISON APPROACH</span><h2>Less, but<br /><em>better found.</em></h2><p>We look for the pieces that make getting dressed feel like coming back to yourself. Thoughtful fabric. Quiet confidence. Nothing to prove.</p><button className="text-link" onClick={() => goShop()}>DISCOVER OUR DESIGNERS <ArrowRight size={15} /></button><span className="manifesto-number">01 / 04</span></div></section>

    <section className="product-section content-width"><SectionHeading eyebrow="THE MAISON LIST" title="Pieces with a point of view." link="EXPLORE THE EDIT" onClick={() => goShop()} /><ProductGrid products={products.slice(4, 8)} onProduct={openProduct} favorites={favorites} toggleFavorite={toggleFavorite} addBag={addBag} /></section>

    <section className="designer-section"><div className="designer-copy"><span className="eyebrow">IN GOOD COMPANY</span><h2>Names to<br /><em>know by heart.</em></h2><p>Independent minds. Distinctive signatures.<br />A designer directory worth getting lost in.</p><button className="button button-outline" onClick={() => goShop()}>MEET THE DESIGNERS <ArrowRight size={15} /></button></div><div className="designer-marquee"><div className="designer-image"><img src={imageUrl('photo-1534528741775-53994a69daeb', 800)} alt="Designer fashion portrait" /><span>THE AUTUMN<br />PORTRAIT</span></div><div className="designer-list">{['TOTEME', 'STUDIO NICHOLSON', 'A.P.C.', 'NEOUS', 'HEREU', 'ARCH4'].map((brand, i) => <button key={brand} onClick={() => goShop()}><span>0{i + 1}</span>{brand}<ArrowUpRight size={14} /></button>)}</div></div></section>

    <section className="quote-section"><span className="eyebrow">A NOTE FROM THE COMMUNITY</span><div className="quote-stars">★★★★★</div><blockquote>“The kind of shop that makes you feel like someone has already done the looking for you.”</blockquote><span className="quote-credit">ELLA M. — MAISON CUSTOMER SINCE 2022</span><div className="quote-arrows"><button aria-label="Previous review"><ChevronLeft size={17} /></button><span>01 / 03</span><button aria-label="Next review"><ChevronRight size={17} /></button></div></section>

    <section className="newsletter"><div><span className="eyebrow">LETTERS FROM MAISON</span><h2>A considered note,<br /><em>now and then.</em></h2><p>New finds, thoughtful reads and the occasional very good thing.<br />No noise. We promise.</p></div><form onSubmit={(e) => { e.preventDefault(); onSubscribe(email) }}><label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label><div className="newsletter-input"><input id="newsletter-email" type="email" placeholder="you@somewhere.com" required value={email} onChange={(e) => onEmailChange(e.target.value)} /><button type="submit" aria-label="Subscribe"><ArrowRight size={17} /></button></div><span>{subscribed ? 'Thank you. You’re on the list.' : 'By subscribing, you agree to our Privacy Policy.'}</span></form></section>
  </>
}

function SectionHeading({ eyebrow, title, link, onClick }: { eyebrow: string; title: string; link: string; onClick: () => void }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="text-link" onClick={onClick}>{link} <ArrowRight size={15} /></button></div>
}

function ProductGrid({ products: items, onProduct, favorites, toggleFavorite, addBag }: { products: Product[]; onProduct: (p: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void; addBag: (p: Product) => void }) {
  return <div className="product-grid">{items.map((product) => <article className="product-card" key={product.id}>
    <div className="product-image-wrap"><button className="product-image-button" onClick={() => onProduct(product)}><img className="product-image" src={imageUrl(product.image, 760)} alt={product.alt} /><img className="product-image-hover" src={imageUrl(['photo-1539109136881-3be0616acf4b', 'photo-1483985988355-763728e1935b', 'photo-1584917865442-de89df76afd3', 'photo-1591047139829-d91aecb6caea'][product.id % 4], 760)} alt="" /></button>{product.tag && <span className="product-tag">{product.tag}</span>}<button className={`favorite-button ${favorites.includes(product.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label="Save to wishlist"><Heart size={17} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} /></button><button className="quick-add" onClick={() => addBag(product)}>QUICK ADD <Plus size={14} /></button></div>
    <div className="product-meta"><span className="product-brand">{product.brand}</span><button className="product-title" onClick={() => onProduct(product)}>{product.name}</button><div className="product-price"><span>{money(product.price)}</span>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div>
  </article>)}</div>
}

function ShopPage({ products: items, category, setCategory, sort, setSort, onProduct, favorites, toggleFavorite, addBag, onFilter, filterOpen }: {
  products: Product[]; category: string; setCategory: (value: string) => void; sort: string; setSort: (value: string) => void; onProduct: (p: Product) => void; favorites: number[]; toggleFavorite: (id: number) => void; addBag: (p: Product) => void; onFilter: () => void; filterOpen: boolean
}) {
  const categories = ['All pieces', 'Clothing', 'Footwear', 'Accessories']
  return <div className="shop-page content-width"><div className="breadcrumbs"><button>HOME</button><ChevronRight size={12} /><span>SHOP</span></div><div className="shop-intro"><span className="eyebrow">A WARDROBE, WELL FOUND</span><h1>{category === 'All pieces' ? 'The collection.' : category + '.'}</h1><p>Considered pieces from the designers we believe in.</p></div><div className="shop-toolbar"><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="shop-controls"><button className={`filter-button ${filterOpen ? 'selected' : ''}`} onClick={onFilter}><SlidersHorizontal size={15} /> FILTER</button><label className="sort-control">SORT BY <select value={sort} onChange={(e) => setSort(e.target.value)}>{['Recommended', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Selling', 'Top Rated'].map((x) => <option key={x}>{x}</option>)}</select><ChevronDown size={13} /></label></div></div>
    {filterOpen && <div className="filter-drawer"><div><span>DESIGNER</span><label><input type="checkbox" /> Toteme</label><label><input type="checkbox" /> Studio Nicholson</label><label><input type="checkbox" /> A.P.C.</label></div><div><span>SIZE</span><div className="filter-sizes">{['XS', 'S', 'M', 'L', 'XL'].map((s) => <button key={s}>{s}</button>)}</div></div><div><span>PRICE</span><label className="price-range">₹5,000 <input type="range" min="5000" max="50000" /> ₹50,000</label></div><div><span>AVAILABILITY</span><label><input type="checkbox" /> In stock</label><label><input type="checkbox" /> Sale pieces</label></div></div>}
    <div className="result-count">{items.length} PIECES <span>MADE TO BE WORN, AND WORN AGAIN.</span></div>{items.length ? <ProductGrid products={items} onProduct={onProduct} favorites={favorites} toggleFavorite={toggleFavorite} addBag={addBag} /> : <div className="empty-results"><Sparkles size={25} /><h3>A little quiet here.</h3><p>Try a different search or browse the full collection.</p></div>}
    <div className="load-more"><span>YOU’VE SEEN {items.length} OF 8 PIECES</span><i><b /></i><button className="button button-outline" onClick={() => setCategory('All pieces')}>VIEW THE FULL COLLECTION <ArrowDown size={14} /></button></div>
  </div>
}

function ProductPage({ product, onBack, addBag, buyNow, size, setSize, quantity, setQuantity, pin, setPin, pinChecked, checkPin, favorite, toggleFavorite, openProduct }: {
  product: Product; onBack: () => void; addBag: (p: Product, count?: number) => void; buyNow: (p: Product, count: number) => void; size: string; setSize: (value: string) => void; quantity: number; setQuantity: (value: number) => void; pin: string; setPin: (value: string) => void; pinChecked: boolean; checkPin: () => void; favorite: boolean; toggleFavorite: () => void; openProduct: (p: Product) => void
}) {
  const [activeImage, setActiveImage] = useState(0)
  const [sizeError, setSizeError] = useState(false)
  const photos = [product.image, 'photo-1539109136881-3be0616acf4b', 'photo-1529139574466-a303027c1d8b']
  return <div className="detail-page content-width"><div className="breadcrumbs"><button onClick={onBack}>SHOP</button><ChevronRight size={12} /><span>{product.brand}</span></div><div className="detail-layout"><div className="detail-gallery"><div className="detail-thumbs">{photos.map((photo, i) => <button className={activeImage === i ? 'active' : ''} key={`${photo}-${i}`} onClick={() => setActiveImage(i)}><img src={imageUrl(photo, 160)} alt="" /></button>)}</div><div className="detail-main-image"><img src={imageUrl(photos[activeImage], 1200)} alt={product.alt} /><span className="zoom-hint">MOVE TO DISCOVER</span></div></div><div className="detail-copy"><span className="eyebrow">{product.brand}</span><h1>{product.name}</h1><div className="detail-price">{money(product.price)} {product.oldPrice && <><del>{money(product.oldPrice)}</del><span>−20%</span></>}</div><p className="detail-description">A quiet essential, considered in every detail. Cut from exceptional materials and made for the everyday ritual of getting dressed.</p><div className="detail-color"><span>COLOUR: <b>{product.color}</b></span><i style={{ background: '#c4b8a8' }} /></div><div className="size-label"><span>SELECT SIZE</span><button onClick={() => document.getElementById('size-guide')?.scrollIntoView({ behavior: 'smooth' })}>SIZE GUIDE <ArrowUpRight size={12} /></button></div><div className="size-options">{['XS', 'S', 'M', 'L', 'XL'].map((s) => <button className={size === s ? 'chosen' : ''} key={s} onClick={() => { setSize(s); setSizeError(false) }}>{s}</button>)}</div>{sizeError && <p className="size-error">Please select a size before continuing.</p>}<div className="detail-quantity"><span>QUANTITY</span><div><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={13} /></button><b>{quantity}</b><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={13} /></button></div></div><div className="detail-purchase"><button className="button button-dark" onClick={() => size ? addBag(product, quantity) : setSizeError(true)}>ADD TO BAG — {money(product.price * quantity)} <ArrowRight size={15} /></button><button className="button button-outline" onClick={() => size ? buyNow(product, quantity) : setSizeError(true)}>BUY NOW</button></div><button className="detail-wishlist" onClick={toggleFavorite}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'SAVED TO YOUR WISHLIST' : 'ADD TO WISHLIST'}</button><div className="delivery-check"><span>DELIVERY & AVAILABILITY</span><form onSubmit={(e) => { e.preventDefault(); checkPin() }}><input placeholder="Enter your PIN code" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} /><button>CHECK</button></form>{pinChecked && <p className={pin.length === 6 ? 'success-text' : 'size-error'}>{pin.length === 6 ? <><Check size={14} /> Delivery available to {pin} in 3–5 days.</> : 'Please enter a valid 6-digit PIN code.'}</p>}<p><Truck size={14} /> Complimentary delivery over ₹15,000</p></div><div className="detail-accordion"><details open><summary>THE DETAILS <Plus size={14} /></summary><p>Thoughtful construction meets everyday ease. 100% responsibly sourced materials. Made with care in Portugal.</p></details><details><summary>DELIVERY & RETURNS <Plus size={14} /></summary><p>Complimentary shipping over ₹15,000. Returns accepted within 14 days of delivery.</p></details><details id="size-guide"><summary>SIZE & FIT <Plus size={14} /></summary><p>True to size. Our model is 178cm and wears a size S.</p></details></div></div></div><section className="related-section"><SectionHeading eyebrow="MORE TO CONSIDER" title="You might also find." link="VIEW ALL" onClick={onBack} /><ProductGrid products={products.filter((p) => p.id !== product.id).slice(0, 4)} onProduct={openProduct} favorites={[]} toggleFavorite={() => {}} addBag={addBag} /></section></div>
}

function AccountPage({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [sent, setSent] = useState(false)
  return <div className="account-page content-width"><div className="account-intro"><span className="eyebrow">YOUR MAISON</span><h1>{mode === 'login' ? 'Welcome back.' : mode === 'register' ? 'A place of your own.' : 'A way back in.'}</h1><p>Sign in for a more personal kind of discovery.</p><button className="text-link" onClick={onBack}>← BACK TO THE COLLECTION</button></div><form className="account-form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>{mode === 'register' && <label>YOUR NAME<input required placeholder="First and last name" /></label>}<label>EMAIL ADDRESS<input type="email" required placeholder="you@somewhere.com" /></label>{mode !== 'forgot' && <label>PASSWORD<input type="password" required placeholder="At least 8 characters" minLength={8} /></label>}{sent ? <p className="success-text"><Check size={15} /> {mode === 'forgot' ? 'Reset link sent. Check your email.' : 'Your details have been received.'}</p> : <button className="button button-dark full-button">{mode === 'forgot' ? 'SEND RESET LINK' : mode === 'register' ? 'CREATE ACCOUNT' : 'SIGN IN'} <ArrowRight size={15} /></button>}{mode === 'login' && <button className="text-link center-link" type="button" onClick={() => setMode('forgot')}>FORGOT YOUR PASSWORD?</button>}<div className="or-divider">OR</div><button className="button button-outline full-button" type="button" onClick={() => setSent(true)}>CONTINUE WITH GOOGLE</button><p className="form-switch">{mode === 'login' ? 'New to Maison?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setSent(false) }}>{mode === 'login' ? 'CREATE AN ACCOUNT' : 'SIGN IN'}</button></p></form></div>
}

function VendorPage({ onBack, notify }: { onBack: () => void; notify: (message: string) => void }) {
  const [tab, setTab] = useState('Overview')
  const [applying, setApplying] = useState(false)
  const nav = ['Overview', 'Products', 'Orders', 'Inventory', 'Payouts']
  if (applying) return <VendorApplication onCancel={() => setApplying(false)} onSubmitted={() => notify('Application submitted for admin review.')} />
  return <div className="dashboard-page"><div className="dashboard-top"><button className="text-link" onClick={onBack}><ArrowLeft size={15} /> MAISON MARKETPLACE</button><div className="dashboard-user"><span className="status-dot" /> VERDE STUDIO <span className="vendor-tag">VERIFIED PARTNER</span></div></div><div className="dashboard-title"><div><span className="eyebrow">VERDE STUDIO / SELLER PORTAL</span><h1>Good morning, Amara.</h1><p>Here’s what’s happening with your store today.</p></div><div className="dashboard-title-actions"><button className="button button-outline" onClick={() => setApplying(true)}>REGISTER A STORE</button><button className="button button-dark" onClick={() => notify('New product form is ready to connect.')}>+ ADD A PRODUCT</button></div></div><div className="dashboard-tabs">{nav.map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div><div className="metric-grid"><Metric label="GROSS SALES" value="₹4,82,600" note="+12.8% from last month" /><Metric label="ORDERS" value="128" note="18 awaiting fulfilment" /><Metric label="PRODUCTS LIVE" value="46" note="3 low in stock" /><Metric label="NEXT PAYOUT" value="₹1,24,800" note="Scheduled 28 Nov" /></div><div className="dashboard-columns"><div className="dashboard-card"><div className="card-title"><div><span className="eyebrow">YOUR PERFORMANCE</span><h3>Sales over time</h3></div><select aria-label="Sales period"><option>Last 30 days</option><option>Last 7 days</option></select></div><div className="chart-area"><div className="chart-y"><span>₹5L</span><span>₹4L</span><span>₹3L</span><span>₹2L</span><span>₹1L</span></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-label="Sales trending upward"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b69d79" stopOpacity=".24" /><stop offset="1" stopColor="#b69d79" stopOpacity="0" /></linearGradient></defs><path d="M0 164 C35 146 40 158 65 143 S102 152 130 122 S169 145 197 118 S236 130 265 92 S301 111 330 101 S369 113 395 78 S434 97 460 61 S505 83 531 54 S576 73 602 32 S625 41 640 14 L640 190 L0 190 Z" fill="url(#chartFill)" /><path d="M0 164 C35 146 40 158 65 143 S102 152 130 122 S169 145 197 118 S236 130 265 92 S301 111 330 101 S369 113 395 78 S434 97 460 61 S505 83 531 54 S576 73 602 32 S625 41 640 14" fill="none" stroke="#98794f" strokeWidth="2" /></svg></div><div className="chart-x"><span>OCT 27</span><span>NOV 03</span><span>NOV 10</span><span>NOV 17</span><span>NOV 24</span></div></div><div className="dashboard-card"><div className="card-title"><div><span className="eyebrow">NEEDS YOUR ATTENTION</span><h3>Recent orders</h3></div><button className="text-link" onClick={() => setTab('Orders')}>VIEW ALL <ArrowRight size={13} /></button></div><div className="order-list">{[['#MS-2841', 'Aarav K.', 'Today, 10:42', '₹18,900', 'Ready to ship'], ['#MS-2839', 'Priya S.', 'Today, 09:18', '₹32,600', 'Processing'], ['#MS-2836', 'Meera R.', 'Yesterday', '₹14,200', 'Processing'], ['#MS-2832', 'Rohan D.', 'Yesterday', '₹42,800', 'Ready to ship']].map(([id, name, date, total, status]) => <div className="order-row" key={id}><span>{id}</span><span>{name}<small>{date}</small></span><b>{total}</b><i className={status === 'Processing' ? 'badge-pending' : 'badge-ready'}>{status}</i></div>)}</div></div></div><div className="dashboard-bottom"><p><ShieldCheck size={16} /> Your store and customer data are protected by Maison.</p><button onClick={() => notify('Support will be in touch shortly.')}>SELLER SUPPORT <ArrowUpRight size={13} /></button></div></div>
}

function VendorApplication({ onCancel, onSubmitted }: { onCancel: () => void; onSubmitted: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  return <div className="application-page content-width"><div className="breadcrumbs"><button onClick={onCancel}>SELLER PORTAL</button><ChevronRight size={12} /><span>SELL WITH MAISON</span></div><div className="application-heading"><span className="eyebrow">A THOUGHTFUL MARKETPLACE, TOGETHER</span><h1>Bring us your point of view.</h1><p>Tell us about your business. Our team reviews every application personally.</p></div>{submitted ? <div className="application-success"><Check size={24} /><h2>Your application is with us.</h2><p>We’ll review your details and get back to you within 3–5 business days.</p><span className="vendor-tag">PENDING ADMIN APPROVAL</span><button className="button button-outline" onClick={onCancel}>RETURN TO DASHBOARD</button></div> : <form className="application-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); onSubmitted() }}><section><span className="checkout-step">01</span><div><h3>Your business</h3><div className="form-grid"><label>BUSINESS NAME<input required placeholder="Registered legal name" /></label><label>STORE NAME<input required placeholder="How customers will find you" /></label><label>OWNER NAME<input required placeholder="Full name" /></label><label>PRODUCT CATEGORIES<select required defaultValue=""><option value="" disabled>Select a category</option><option>Clothing</option><option>Footwear</option><option>Accessories</option><option>Multiple categories</option></select></label></div></div></section><section><span className="checkout-step">02</span><div><h3>Contact & registration</h3><div className="form-grid"><label>BUSINESS EMAIL<input type="email" required placeholder="studio@yourbrand.com" /></label><label>MOBILE NUMBER<input type="tel" required placeholder="+91" /></label><label>GST NUMBER<input required placeholder="15-character GSTIN" maxLength={15} /></label><label>PAN NUMBER<input required placeholder="10-character PAN" maxLength={10} /></label><label className="wide-field">BUSINESS ADDRESS<input required placeholder="Registered business address" /></label><label>BANK ACCOUNT NUMBER<input required placeholder="Account number" /></label><label>IFSC CODE<input required placeholder="Bank IFSC" /></label></div></div></section><section><span className="checkout-step">03</span><div><h3>Verification documents</h3><label className="upload-field">BUSINESS REGISTRATION / GST CERTIFICATE<input type="file" accept=".pdf,.png,.jpg,.jpeg" required /></label><p className="upload-note">PDF or image · up to 10 MB. Your documents are only visible to our verification team.</p></div></section><div className="application-actions"><button type="button" className="button button-outline" onClick={onCancel}>CANCEL</button><button className="button button-dark">SUBMIT FOR REVIEW <ArrowRight size={15} /></button></div></form>}</div>
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-card"><span className="eyebrow">{label}</span><strong>{value}</strong><span>{note}</span></div>
}

function AdminPage({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState('Overview')
  return <div className="dashboard-page admin-dashboard"><div className="dashboard-top"><button className="text-link" onClick={onBack}><ArrowLeft size={15} /> MAISON MARKETPLACE</button><div className="dashboard-user">ADMINISTRATION <span className="vendor-tag">SUPER ADMIN</span></div></div><div className="dashboard-title"><div><span className="eyebrow">MAISON / CONTROL ROOM</span><h1>The whole picture.</h1><p>Marketplace overview · Saturday, 22 November 2025</p></div><button className="button button-outline">DOWNLOAD REPORT <ArrowDown size={14} /></button></div><div className="dashboard-tabs">{['Overview', 'Orders', 'Vendors', 'Products', 'Customers', 'Payouts'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div><div className="metric-grid"><Metric label="MARKETPLACE REVENUE" value="₹82.4L" note="+18.6% vs last month" /><Metric label="TOTAL ORDERS" value="2,481" note="312 this week" /><Metric label="ACTIVE VENDORS" value="86" note="12 new this month" /><Metric label="NEEDS APPROVAL" value="04" note="Vendor applications" /></div><div className="dashboard-columns"><div className="dashboard-card"><div className="card-title"><div><span className="eyebrow">MARKETPLACE PERFORMANCE</span><h3>Revenue overview</h3></div><select aria-label="Period"><option>Last 30 days</option><option>Last 7 days</option></select></div><div className="chart-area"><div className="chart-y"><span>₹1Cr</span><span>₹75L</span><span>₹50L</span><span>₹25L</span><span>₹0</span></div><svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-label="Marketplace revenue chart"><defs><linearGradient id="adminFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b69d79" stopOpacity=".24" /><stop offset="1" stopColor="#b69d79" stopOpacity="0" /></linearGradient></defs><path d="M0 160 C38 144 47 153 74 138 S109 149 137 117 S174 128 203 107 S242 128 270 87 S306 100 336 81 S378 107 402 63 S441 82 473 57 S512 76 539 41 S575 61 604 23 S625 30 640 10 L640 190 L0 190 Z" fill="url(#adminFill)" /><path d="M0 160 C38 144 47 153 74 138 S109 149 137 117 S174 128 203 107 S242 128 270 87 S306 100 336 81 S378 107 402 63 S441 82 473 57 S512 76 539 41 S575 61 604 23 S625 30 640 10" fill="none" stroke="#98794f" strokeWidth="2" /></svg></div><div className="chart-x"><span>OCT 27</span><span>NOV 03</span><span>NOV 10</span><span>NOV 17</span><span>NOV 24</span></div></div><div className="dashboard-card"><div className="card-title"><div><span className="eyebrow">TO REVIEW</span><h3>Vendor applications</h3></div><button className="text-link">VIEW ALL <ArrowRight size={13} /></button></div><div className="vendor-list">{[['Atelier Serein', 'Luxury womenswear', '18 Nov 2025'], ['Form & Field', 'Contemporary menswear', '17 Nov 2025'], ['Nila Studio', 'Handcrafted accessories', '16 Nov 2025'], ['Sunday People', 'Slow fashion', '15 Nov 2025']].map((x) => <div className="vendor-row" key={x[0]}><div className="vendor-avatar">{x[0][0]}</div><div><b>{x[0]}</b><span>{x[1]} · {x[2]}</span></div><button>REVIEW <ArrowRight size={12} /></button></div>)}</div></div></div><div className="dashboard-bottom"><p><ShieldCheck size={16} /> All marketplace systems operational.</p><span>LAST UPDATED JUST NOW</span></div></div>
}

function CheckoutPage({ bag, onBack, onComplete }: { bag: Product[]; onBack: () => void; onComplete: () => void }) {
  const [payment, setPayment] = useState('Razorpay — UPI, cards & net banking')
  const total = bag.reduce((sum, item) => sum + item.price, 0)
  return <div className="checkout-page content-width"><div className="breadcrumbs"><button onClick={onBack}>YOUR BAG</button><ChevronRight size={12} /><span>CHECKOUT</span></div><div className="checkout-title"><span className="eyebrow">A FEW MORE DETAILS</span><h1>Almost yours.</h1><p className="demo-checkout-note">DEMO PREVIEW — DETAILS ARE NOT SENT OR STORED, AND NO PAYMENT WILL BE TAKEN.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={(e) => { e.preventDefault(); onComplete() }}><section><span className="checkout-step">01</span><div><h3>Contact details</h3><div className="form-grid"><label>EMAIL ADDRESS<input type="email" required placeholder="you@somewhere.com" /></label><label>PHONE NUMBER<input type="tel" required placeholder="+91" /></label></div></div></section><section><span className="checkout-step">02</span><div><h3>Delivery address</h3><div className="form-grid"><label>FIRST NAME<input required placeholder="First name" /></label><label>LAST NAME<input required placeholder="Last name" /></label><label className="wide-field">ADDRESS<input required placeholder="House number and street name" /></label><label>CITY<input required placeholder="City" /></label><label>PIN CODE<input required placeholder="6-digit PIN" maxLength={6} /></label></div></div></section><section><span className="checkout-step">03</span><div><h3>Payment</h3><div className="payment-options">{['Razorpay — UPI, cards & net banking', 'Cash on delivery'].map((method) => <label key={method}><input type="radio" name="payment" checked={payment === method} onChange={() => setPayment(method)} /> {method}</label>)}</div></div></section><button className="button button-dark full-button">PLACE DEMO ORDER <ArrowRight size={15} /></button><p className="secure-note"><ShieldCheck size={14} /> Demo only. Connect Supabase and payment credentials to accept orders.</p></form><aside className="checkout-summary"><span className="eyebrow">YOUR ORDER</span>{bag.map((item, i) => <div className="checkout-product" key={`${item.id}-${i}`}><img src={imageUrl(item.image, 180)} alt={item.alt} /><div><span className="eyebrow">{item.brand}</span><b>{item.name}</b><span>Size: M</span><strong>{money(item.price)}</strong></div></div>)}<div className="summary-row"><span>Subtotal</span><b>{money(total)}</b></div><div className="summary-row"><span>Delivery</span><b>{total > 15000 ? 'Complimentary' : money(450)}</b></div><div className="summary-row summary-total"><span>Total incl. taxes</span><b>{money(total + (total > 15000 ? 0 : 450))}</b></div></aside></div></div>
}

function Footer({ goShop, setPage }: { goShop: (kind?: string) => void; setPage: (page: 'home' | 'shop' | 'product' | 'account' | 'vendor' | 'admin' | 'checkout') => void }) {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><button className="wordmark" onClick={() => setPage('home')}>maison<span>.</span></button><p>A more considered way<br />to find what you love.</p><div className="social-links"><button aria-label="Instagram"><Instagram size={16} /></button><button className="social-pinterest">p</button></div></div><div className="footer-links"><div><span>DISCOVER</span><button onClick={() => goShop()}>New arrivals</button><button onClick={() => goShop('Clothing')}>Clothing</button><button onClick={() => goShop('Footwear')}>Shoes & bags</button><button onClick={() => goShop('Accessories')}>Accessories</button></div><div><span>MAISON</span><button>Our story</button><button>Designers</button><button>Journal</button><button>Careers</button></div><div><span>HERE TO HELP</span><button>Contact us</button><button>Shipping & returns</button><button>FAQs</button><button>Size guide</button></div><div className="footer-sell"><span>INDEPENDENT DESIGNER?</span><p>Bring your point of view<br />to a new audience.</p><button onClick={() => setPage('vendor')}>SELL WITH MAISON <ArrowUpRight size={13} /></button><button className="admin-entry" onClick={() => setPage('admin')}>ADMIN PORTAL</button></div></div></div><div className="footer-bottom"><span>© MAISON MARKETPLACE 2025</span><div><button>PRIVACY</button><button>TERMS</button><button>ACCESSIBILITY</button></div><span>MADE WITH INTENTION, EVERYWHERE.</span></div></footer>
}
