import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import NavBar from 'components/NavBar';
import Loading from '../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartItem, Product } from 'types';
import './PosPage.css';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { getProducts } from 'services/mysqlService';

/* ---------- Inline SVG icons (no icon packages) ---------- */
const IconPlus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const IconMinus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6h10Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- Config ---------- */
const CURRENCY = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';
const chipBase =
  'px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap min-h-[40px] min-w-[44px]';

const categoryColors: Record<string, string> = {
  Beverages: 'bg-indigo-100 text-indigo-800',
  Food: 'bg-teal-100 text-teal-800',
  Desserts: 'bg-rose-100 text-rose-800',
  Uncategorized: 'bg-gray-100 text-gray-800',
  All: 'bg-slate-200 text-slate-800',
};

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState(0);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedTransaction, setSavedTransaction] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  /* ---------- Fetch products ---------- */
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getProducts();
        setProducts(res as Product[]);
      } catch {
        toast.error('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    setUserEmail(localStorage.getItem('userEmail'));
  }, []);

  /* ---------- Derivations ---------- */
  const grouped = useMemo(() => {
    return products.reduce<Record<string, Product[]>>((acc, p) => {
      const c = p.category || 'Uncategorized';
      (acc[c] ||= []).push(p);
      return acc;
    }, {});
  }, [products]);

  const categories = useMemo(() => ['All', ...Object.keys(grouped)], [grouped]);

  const visibleProducts = useMemo(
    () => (activeCategory === 'All' ? products : grouped[activeCategory] || []),
    [activeCategory, products, grouped]
  );

  const itemCount = useMemo(
    () => cart.reduce((n, i) => n + i.quantity, 0),
    [cart]
  );
  const subTotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.quantity, 0),
    [cart]
  );
  const grandTotal = useMemo(() => +(subTotal).toFixed(2), [subTotal]);

  /* ---------- Cart ops ---------- */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const match = prev.find((i) => i.id === product.id);
      if (match) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increase = (id: string) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));

  const decrease = (id: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
      )
    );

  const remove = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared successfully!');
  };

  /* ---------- Payments ---------- */
  const handlePayment = async (paymentMethod: 'Card' | 'Cash' | 'Guest') => {
    setShowPaymentModal(false);
    if (paymentMethod === 'Cash') {
      setShowCashModal(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment`, {
        paymentMethod,
        cart,
        email: userEmail || 'admin@gmail.com',
        kitchenItems: cart.filter(item => item.notifyKitchen), // send kitchen items
      });
      setSavedTransaction(response.data);
      setShowTransactionModal(true);
    } catch {
      toast.error('Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCashTransaction = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment`, {
        paymentMethod: 'Cash',
        cart,
        cashReceived,
        email: userEmail || 'admin@gmail.com',
        kitchenItems: cart.filter(item => item.notifyKitchen),
      });
      setSavedTransaction(response.data);
      setShowCashModal(false);
      setShowTransactionModal(true);
    } catch {
      toast.error('Failed to process cash payment.');
    } finally {
      setLoading(false);
    }
  };

  const resetStates = () => {
    setCashReceived(0);
    setShowTransactionModal(false);
    setCart([]);
  };

  /* ---------- A11y: categories arrow-key nav ---------- */
  const catRowRef = useRef<HTMLDivElement>(null);
  const onCatKeyDown = (e: React.KeyboardEvent) => {
    if (!catRowRef.current) return;
    const chips = Array.from(catRowRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const idx = chips.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight' ? (idx + 1) % chips.length : (idx - 1 + chips.length) % chips.length;
      chips[next].focus();
    }
  };

  /* ---------- Render ---------- */
  return (
    <>
      <ToastContainer />
      {loading && <Loading />}

      {/* dvh-safe wrapper to fix iPad Safari toolbars */}
      <div className="flex flex-col bg-slate-50 h-[100dvh] supports-[height:100dvh]:h-[100dvh] overflow-hidden">
        <header className="top-0 z-30 sticky">
          <NavBar />
        </header>

        <main
          className="flex-1 gap-5 grid grid-cols-1 md:grid-cols-[7fr_5fr] lg:grid-cols-[2fr_1fr] mx-auto px-4 py-4 w-full max-w-[1600px] min-h-0"
          aria-label="Point of sale"
        >
          {/* ---------------- LEFT: Products ---------------- */}
          <section
            className="flex flex-col bg-white shadow p-4 rounded-2xl min-w-0 h-full min-h-0 overflow-hidden"
            aria-label="Products"
          >
            {/* Category chips */}
            <div
              ref={catRowRef}
              role="tablist"
              aria-label="Product categories"
              onKeyDown={onCatKeyDown}
              className="flex gap-2 mb-3 pb-1 overflow-x-auto [scrollbar-width:thin]"
            >
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveCategory(cat)}
                    className={`${chipBase} ${focusRing} ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Product grid (no images) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className={`gap-4 grid ${
                window.innerWidth < 1024 && window.innerWidth >= 640
                  ? 'grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
              }`}>
                {(visibleProducts.length > 200 ? visibleProducts.slice(0, 200) : visibleProducts).map(
                  (p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`flex flex-col bg-white shadow-sm p-4 border-2 rounded-2xl transition-all duration-150
                        ${categoryColors[p.category || 'Uncategorized'] || categoryColors.Uncategorized}
                        hover:border-indigo-600 hover:bg-indigo-50 focus:border-indigo-700 focus:bg-indigo-100
                        active:border-indigo-700 active:bg-indigo-200
                        ${focusRing}
                      `}
                      style={{ cursor: 'pointer' }}
                      aria-label={`Add ${p.name} to cart`}
                      onBlur={e => e.currentTarget.blur()} // Remove focus highlight after click
                    >
                      <div className="mb-3 text-left">
                        <h3 className="mt-3 font-semibold text-slate-900 text-lg line-clamp-2">
                          {p.name}
                        </h3>
                      </div>
                      <div className="flex justify-start mt-auto">
                        <div className="font-extrabold text-indigo-600 text-xl text-left">
                          {CURRENCY}
                          {p.price}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          {/* ---------------- RIGHT: Current Order ---------------- */}
          <aside
            className="flex flex-col bg-white shadow rounded-2xl min-w-0 h-full min-h-0 overflow-hidden"
            aria-label="Order"
          >
            {/* Gradient header like your screenshot */}
            <div className="flex justify-between items-center bg-gradient-to-br from-indigo-500 to-purple-400 px-5 py-4 rounded-t-2xl text-white">
              <h2 className="drop-shadow-sm font-extrabold text-2xl">Order</h2>
              <span className="bg-blue-100 ml-2 px-3 py-1 rounded-full font-semibold text-blue-700 text-sm">
                {cart.length} items
              </span>
            </div>

            {/* Items list */}
            <div className="flex-1 px-4 py-3 min-h-0 overflow-y-auto overscroll-contain">
              {cart.length === 0 ? (
                <p className="mt-8 text-slate-500 text-center">Your cart is empty.</p>
              ) : (
                <ul className="space-y-3">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center bg-white shadow-sm px-4 py-3 border border-slate-200 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-base truncate">
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-slate-500 text-sm">
                              {CURRENCY}
                              {Number(item.price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="ml-3 font-bold text-slate-900 text-base text-right shrink-0">
                            {CURRENCY}
                            {Number(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => decrease(item.id)}
                            aria-label={`Decrease ${item.name}`}
                            disabled={item.quantity <= 1}
                            className={`${focusRing} inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 enabled:hover:bg-slate-50 disabled:opacity-40`}
                          >
                            <IconMinus className="w-5 h-5" />
                          </button>
                          <span
                            aria-live="polite"
                            className="min-w-[2ch] font-semibold text-base text-center"
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increase(item.id)}
                            aria-label={`Increase ${item.name}`}
                            className={`${focusRing} inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50`}
                          >
                            <IconPlus className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => remove(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className={`${focusRing} ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50`}
                          >
                            <IconTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sticky summary + checkout */}
            <div className="bottom-0 pb-[max(env(safe-area-inset-bottom),0px)] sticky bg-slate-50/80 backdrop-blur mt-2 px-5 py-4 border-slate-200 border-t rounded-b-2xl">
              <div className="space-y-2 text-slate-700 text-sm">
                <div className="flex justify-between items-center font-extrabold text-base">
                  <span>Total</span>
                  <span className="text-slate-900">
                    {CURRENCY}
                    {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 mb-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0}
                  title={cart.length === 0 ? 'Add items to checkout' : ''}
                  className={`${focusRing} flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Checkout
                </button>
                <button
                  onClick={clearCart}
                  className={`${focusRing} rounded-lg border border-red-200 bg-white px-4 py-2 font-medium text-red-600 hover:bg-red-50`}
                >
                  Clear
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* -------- Payment Method Modal (Card / Cash / Guest) -------- */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Choose Payment Method"
        buttonLabel=""
        handleButton={() => {}}
        showButton={false}
      >
        <div className="p-2">
          <div className="gap-3 grid sm:grid-cols-3">
            <button
              onClick={() => handlePayment('Card')}
              className={`${focusRing} rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700`}
              aria-label="Pay by Card"
            >
              Card
            </button>
            <button
              onClick={() => handlePayment('Cash')}
              className={`${focusRing} rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700`}
              aria-label="Pay by Cash"
            >
              Cash
            </button>
            <button
              onClick={() => handlePayment('Guest')}
              className={`${focusRing} rounded-lg bg-yellow-500 px-4 py-3 text-white hover:bg-yellow-600`}
              aria-label="Pay by Guest"
            >
              Guest
            </button>
          </div>
          <p className="mt-3 text-slate-500 text-xs">Select a method to complete the order.</p>
        </div>
      </Modal>

      {/* -------- Cash Details Modal (existing) -------- */}
      <Modal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        title="Cash Payment Details"
        buttonLabel="Confirm Payment"
        handleButton={handleCashTransaction}
        showButton={cashReceived >= grandTotal}
      >
        <div className="p-4">
          <label className="block mb-2 font-semibold text-lg">
            Total Amount: {CURRENCY}
            {grandTotal.toFixed(2)}
          </label>

          <label className="block mb-2 font-semibold text-lg">Cash Received:</label>
          <input
            type="number"
            value={cashReceived === 0 ? '' : cashReceived}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(v)) setCashReceived(v === '' ? 0 : parseFloat(v));
            }}
            className={`${focusRing} w-full rounded-md border border-gray-300 p-2`}
            aria-label="Cash received"
            inputMode="decimal"
          />

          <div className="mt-4 font-semibold text-lg">
            Change:{' '}
            <span className="text-emerald-600">
              {CURRENCY}
              {(cashReceived > 0 ? cashReceived - grandTotal : 0).toFixed(2)}
            </span>
          </div>

          {cashReceived > 0 && cashReceived < grandTotal && (
            <p className="mt-2 text-red-600 text-sm">Please enter a valid amount.</p>
          )}
        </div>
      </Modal>

      {/* -------- Transaction Summary -------- */}
      <TransactionDetailsModal
        transaction={savedTransaction}
        isOpen={showTransactionModal}
        onClose={() => resetStates()}
      />
    </>
  );
};

export default PosPage;
