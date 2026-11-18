import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, Search, ShoppingCart, Utensils, X } from 'lucide-react';
import { usePos } from '../context/PosContext';
import { FoodCard } from '../components/pos/FoodCard';
import { CartPanel } from '../components/pos/CartPanel';
import { PortionModal } from '../components/pos/PortionModal';
import { CartItem, MenuItem } from '../types/pos';
import { usePreferences } from '../utils/preferences';
import { formatLkr } from '../utils/billing';

export function PosPage() {
  const { menuItems, categories, addToCart, replaceCartLine, cart, grandTotal, pendingPaymentOrder } = usePos();
  const preferences = usePreferences();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [selection, setSelection] = useState<{ item: MenuItem; line?: CartItem; image?: HTMLImageElement | null } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const cartHeading = useRef<HTMLHeadingElement>(null);
  const cartTrigger = useRef<HTMLButtonElement>(null);
  const cartClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (cartOpen) cartClose.current?.focus();
  }, [cartOpen]);
  const enabledCategories = categories.filter((category) => category.isEnabled);
  const effectiveCategory = enabledCategories.some((category) => category.id === selectedCategory) ? selectedCategory : 'all';
  const query = searchQuery.trim().toLowerCase();
  const visible = menuItems.filter((item) => !item.isHidden &&
    enabledCategories.some((category) => category.id === item.categoryId) &&
    (effectiveCategory === 'all' || item.categoryId === effectiveCategory) &&
    `${item.name} ${item.description}`.toLowerCase().includes(query));
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);

  function add(item: MenuItem, image: HTMLImageElement | null | undefined, quantity: number, notes: string, portion: string) {
    addToCart(item, quantity, notes, portion);
    setAnnouncement(`Added ${quantity} ${item.name}`);
    if (!preferences.animations || preferences.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = [cartHeading.current, cartTrigger.current].find((element) => element?.getClientRects().length);
    target?.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 350 });
    if (!image?.complete || !image.naturalWidth || !target) return;
    const from = image.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const thumbnail = document.createElement('img');
    thumbnail.src = image.currentSrc;
    thumbnail.className = 'cart-flight';
    thumbnail.style.left = `${from.left + from.width / 2 - 27}px`;
    thumbnail.style.top = `${from.top + from.height / 2 - 27}px`;
    document.body.append(thumbnail);
    const animation = thumbnail.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${to.left + 16 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px) scale(.35)`, opacity: 0 },
    ], { duration: 360, easing: 'cubic-bezier(.2,.65,.3,1)' });
    animation.onfinish = animation.oncancel = () => thumbnail.remove();
  }

  const orderPanel = (
    <section className="pos-cart surface" data-open={cartOpen} aria-label="Current order" onKeyDown={(event) => { if (event.key === 'Escape' && cartOpen) { setCartOpen(false); cartTrigger.current?.focus(); } }}>
      <div className="cart-heading">
        <ShoppingCart size={20} />
        <h1 ref={cartHeading}>Current order</h1>
        <span className="order-count">{count} {count === 1 ? 'item' : 'items'}</span>
        <button type="button" ref={cartClose} className="mobile-cart-close" aria-label="Close order" onClick={() => { setCartOpen(false); cartTrigger.current?.focus(); }}><X size={20} /></button>
      </div>
      <CartPanel onEdit={(line) => {
        const product = menuItems.find((item) => item.id === line.menuItem.id);
        if (product?.isAvailable) setSelection({ item: product, line });
      }} />
    </section>
  );

  return (
    <div className="pos-workspace" data-cart-right={!preferences.cartLeft}>
      {preferences.cartLeft && orderPanel}
      <section className="pos-menu surface" aria-labelledby="pos-menu-heading">
        <div className="menu-toolbar">
          <div className="menu-title">
            <div><h2 id="pos-menu-heading">Menu</h2><p>{visible.length} {visible.length === 1 ? 'item' : 'items'}</p></div>
            <div className="menu-search">
              <Search size={19} />
              <input type="search" placeholder="Search menu" aria-label="Search menu" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </div>
          </div>
          <div className="menu-categories" aria-label="Menu categories">
            <button type="button" aria-pressed={effectiveCategory === 'all'} onClick={() => setSelectedCategory('all')}><LayoutGrid size={16} /> All items</button>
            {enabledCategories.map((category) => <button type="button" key={category.id} aria-pressed={effectiveCategory === category.id} onClick={() => setSelectedCategory(category.id)}>{category.name}</button>)}
          </div>
        </div>
        <div className="menu-scroll">
          {visible.length ? <div className="product-grid">{visible.map((item) => (
            <FoodCard key={item.id} item={item} onSelect={(product, image) => setSelection({ item: product, image })} />
          ))}</div> : <div className="menu-empty"><Utensils size={26} /><strong>No matching items</strong><button type="button" className="secondary-action" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Reset filters</button></div>}
        </div>
      </section>
      {!preferences.cartLeft && orderPanel}
      <button type="button" ref={cartTrigger} className="mobile-cart-trigger primary-action" aria-expanded={cartOpen} onClick={() => setCartOpen(true)}>
        <ShoppingCart size={19} /> {pendingPaymentOrder ? 'Pending payment' : `View order (${count})`} <strong>{formatLkr(pendingPaymentOrder?.total ?? grandTotal)}</strong>
      </button>
      <p className="sr-only" role="status">{announcement}</p>
      {selection && <PortionModal item={selection.item} line={selection.line} onClose={() => setSelection(null)} onConfirm={(quantity, notes, portion) => {
        const { item, line, image } = selection;
        if (line) replaceCartLine(line.lineId ?? line.menuItem.id, item, quantity, notes, portion);
        else add(item, image, quantity, notes, portion);
        setSelection(null);
      }} />}
    </div>
  );
}
