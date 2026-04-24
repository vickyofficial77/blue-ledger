import React, { useEffect, useMemo, useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ProductStatus, UserRole } from '../types';
import {
  Activity,
  AlertCircle,
  Bell,
  Building2,
  CheckCircle,
  Heart,
  ImageIcon,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  TrendingUp,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type ProductDoc = {
  id: string;
  companyId: string;
  name: string;
  category: string;
  price: number;
  qtyUploaded: number;
  qtySold: number;
  qtyCurrent: number;
  status: string;
  imageUrls?: string[];
  updatedAt?: any;
};

type MessageDoc = {
  id: string;
  companyId: string;
  fromUid: string;
  fromName: string;
  fromEmail?: string;
  text: string;
  createdAt?: any;

  // ✅ Admin like fields
  likedByAdmin?: boolean;
  likedAt?: any;
  likedByUid?: string | null;
  likedByName?: string | null;
};

type ViewType = 'products' | 'messages';

const formatRWF = (amount: number): string =>
  new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (num: number): string => new Intl.NumberFormat('en-US').format(num || 0);

const clampInt = (v: unknown, min: number, max: number) => {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};

const s = (v: unknown) => String(v ?? '').trim();
const tsSeconds = (t: any) => (t?.seconds ? Number(t.seconds) : 0);

const ProductPhotoStack = ({
  urls = [],
  name,
  onOpen,
}: {
  urls?: string[];
  name: string;
  onOpen?: (index: number) => void;
}) => {
  if (!urls.length) {
    return (
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  const firstUrl = urls[0];
  const extraCount = Math.max(0, urls.length - 1);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(0)}
      className="group relative shrink-0 rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
      title={urls.length > 1 ? `View ${urls.length} images` : 'View image'}
    >
      <img
        src={firstUrl}
        alt={`${name} 1`}
        className="h-20 w-20 rounded-3xl border-4 border-white object-cover shadow-md ring-1 ring-slate-200 transition group-hover:scale-105"
      />
      {extraCount > 0 && (
        <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-slate-950 px-2 text-[11px] font-black text-white ring-2 ring-white">
          +{extraCount}
        </span>
      )}
    </button>
  );
};

const WorkerDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('products');

  const companyId = useMemo(() => s((profile as any)?.companyId), [profile]);
  const workerName = useMemo(() => s(profile?.name) || 'Worker', [profile?.name]);
  const workerEmail = useMemo(() => s(profile?.email) || s(firebase.auth().currentUser?.email) || '', [profile?.email]);
  const companyName = useMemo(() => s((profile as any)?.companyName) || 'Company', [profile]);

  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [chatText, setChatText] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');

  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number; title: string } | null>(null);

  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const openImageLightbox = (urls: string[] = [], title: string, index = 0) => {
    if (!urls.length) return;
    setLightbox({ urls, title, index: Math.max(0, Math.min(index, urls.length - 1)) });
  };

  const showPrevImage = () => {
    setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev));
  };

  const showNextImage = () => {
    setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev));
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category, p.status].some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  const filteredMessages = useMemo(() => {
    const q = messageSearch.toLowerCase().trim();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.text, m.fromName, m.fromEmail, m.likedByAdmin ? 'liked admin liked' : ''].some((value) =>
        String(value || '').toLowerCase().includes(q)
      )
    );
  }, [messages, messageSearch]);

  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => p.status === ProductStatus.AVAILABLE).length;
    const totalStockValue = products.reduce((sum, p) => sum + p.price * p.qtyCurrent, 0);
    const totalSoldToday = products.reduce((sum, p) => {
      const today = new Date().toDateString();
      const lastSold = p.updatedAt?.toDate?.();
      return sum + (lastSold?.toDateString() === today ? p.qtySold : 0);
    }, 0);
    const lowStockProducts = products.filter((p) => p.qtyCurrent < 10 && p.qtyCurrent > 0).length;
    const outOfStockProducts = products.filter((p) => p.qtyCurrent === 0).length;
    const likedMessages = messages.filter((m) => m.likedByAdmin === true).length;

    return { totalProducts, availableProducts, totalStockValue, totalSoldToday, lowStockProducts, outOfStockProducts, likedMessages };
  }, [products, messages]);

  useEffect(() => {
    if (!profile?.uid || !companyId) return;

    setLoadingProducts(true);
    const unsub = db.collection('products').where('companyId', '==', companyId).onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProductDoc[];

        list.sort((a, b) => {
          const av = String(a.status) === 'available' ? 0 : 1;
          const bv = String(b.status) === 'available' ? 0 : 1;
          if (av !== bv) return av - bv;
          return (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0);
        });

        setProducts(list);
        setQtyById((prev) => {
          const next = { ...prev };
          for (const p of list) if (next[p.id] === undefined) next[p.id] = 1;
          return next;
        });
        setLoadingProducts(false);
      },
      (err) => {
        console.error('products stream error:', err);
        setLoadingProducts(false);
      }
    );

    return () => unsub();
  }, [profile?.uid, companyId]);

  useEffect(() => {
    if (!profile?.uid || !companyId) return;

    setLoadingChat(true);

    // ✅ No orderBy here: avoids index problems, still receives realtime updates.
    const unsub = db
      .collection('messages')
      .where('companyId', '==', companyId)
      .where('fromUid', '==', profile.uid)
      .onSnapshot(
        (snap) => {
          const mine = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) })) as MessageDoc[];

          mine.sort((a, b) => tsSeconds(b.createdAt) - tsSeconds(a.createdAt));

          setMessages(mine);
          setLoadingChat(false);
        },
      (err) => {
        console.error('chat stream error:', err);
        showToast('Unable to load messages. Check Firestore rules/companyId.', false);
        setLoadingChat(false);
      }
    );

    return () => unsub();
  }, [profile?.uid, companyId]);

  const updateQty = (productId: string, raw: string, max: number) => {
    setQtyById((p) => ({ ...p, [productId]: clampInt(raw, 1, max) }));
  };

  const sellUnits = async (p: ProductDoc) => {
    if (!profile?.uid) return;
    if (!companyId) return showToast('Missing companyId in worker profile.', false);
    if (!workerEmail) return showToast('Missing email in worker profile.', false);

    const max = Math.max(1, Number(p.qtyCurrent ?? 0));
    const units = clampInt(qtyById[p.id] ?? 1, 1, max);
    setBusyId(p.id);

    try {
      await db.runTransaction(async (tx) => {
        const ref = db.collection('products').doc(p.id);
        const snap = await tx.get(ref);

        if (!snap.exists) throw new Error('Product not found.');

        const cur = snap.data() as any;
        if (String(cur.companyId) !== String(companyId)) throw new Error('Not your company.');

        const currentQty = Number(cur.qtyCurrent ?? 0);
        const currentSold = Number(cur.qtySold ?? 0);
        const uploaded = Number(cur.qtyUploaded ?? 0);

        if (units > currentQty) throw new Error(`Only ${currentQty} left.`);

        const nextCurrent = currentQty - units;
        const nextSold = currentSold + units;

        tx.update(ref, {
          qtyCurrent: nextCurrent,
          qtySold: nextSold,
          status: nextCurrent === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE,
          lastSoldByUid: profile.uid,
          lastSoldByName: workerName,
          lastSoldAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          qtyUploaded: uploaded,
        });
      });

      showToast(`Sold ${units} unit(s) successfully ✅`, true);
    } catch (err: any) {
      console.error('sell failed:', err);
      showToast(err?.message || 'Sell failed.', false);
    } finally {
      setBusyId(null);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !companyId) return;

    const text = s(chatText);
    if (!text) return;

    setSending(true);

    try {
      await db.collection('messages').add({
        companyId,
        fromUid: profile.uid,
        fromName: workerName,
        fromEmail: workerEmail || '',
        text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),

        // ✅ Default like fields so UI/rules are predictable.
        likedByAdmin: false,
        likedAt: null,
        likedByUid: null,
        likedByName: null,
      });

      setChatText('');
      showToast('Message sent to admin ✅', true);
    } catch (err: any) {
      console.error('send message failed:', err);
      showToast(err?.message || 'Failed to send message.', false);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await db.collection('messages').doc(id).delete();
      showToast('Message deleted ✅', true);
    } catch (err: any) {
      console.error('delete message failed:', err);
      showToast(err?.message || 'Delete message failed.', false);
    }
  };

  if (profile?.role !== UserRole.WORKER) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <div className="text-2xl font-black text-slate-900">Unauthorized Access</div>
          <div className="mt-2 text-slate-500">You do not have permission to access this dashboard.</div>
        </div>
      </div>
    );
  }

  const DashboardStats = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        { label: 'Available Products', value: formatNumber(dashboardStats.availableProducts), icon: ShoppingBag, color: 'from-blue-500 to-indigo-600', sub: `Total: ${dashboardStats.totalProducts}` },
        { label: 'Stock Value', value: formatRWF(dashboardStats.totalStockValue), icon: TrendingUp, color: 'from-emerald-500 to-teal-600', sub: 'Current inventory' },
        { label: 'Sold Today', value: formatNumber(dashboardStats.totalSoldToday), icon: Activity, color: 'from-amber-500 to-orange-600', sub: 'Daily sales' },
        { label: 'Admin Likes', value: formatNumber(dashboardStats.likedMessages), icon: Heart, color: 'from-pink-500 to-rose-600', sub: 'Liked messages' },
      ].map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className={`rounded-2xl bg-gradient-to-r ${stat.color} p-3 text-white shadow-lg`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">Live</span>
          </div>
          <div className="text-2xl font-black text-slate-950">{stat.value}</div>
          <div className="text-sm text-slate-500">{stat.label}</div>
          <div className="mt-1 text-xs text-slate-400">{stat.sub}</div>
        </div>
      ))}
    </div>
  );

  const ProductsView = (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Products</h1>
          <p className="mt-1 text-slate-500">Sell products and view image-based inventory in real time.</p>
        </div>
        <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">Role: Worker</div>
      </div>

      {DashboardStats}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Product Inventory</h2>
            <p className="text-sm text-slate-500">Every product can display multiple photos uploaded by admin.</p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="grid place-items-center rounded-3xl bg-slate-50 py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-slate-300" />
            <p className="font-bold text-slate-600">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredProducts.map((p) => {
              const max = Math.max(1, Number(p.qtyCurrent ?? 0));
              const canSell = Number(p.qtyCurrent ?? 0) > 0 && String(p.status) === 'available';
              const stockValue = p.price * p.qtyCurrent;

              return (
                <div key={p.id} className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="flex gap-4">
                    <ProductPhotoStack urls={p.imageUrls} name={p.name} onOpen={(index) => openImageLightbox(p.imageUrls || [], p.name, index)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="truncate text-lg font-black text-slate-950">{p.name}</h3>
                          <p className="text-sm text-slate-500">{p.category}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${p.status === ProductStatus.AVAILABLE ? p.qtyCurrent < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {p.status}{p.qtyCurrent < 10 && p.qtyCurrent > 0 ? ' Low' : ''}
                        </span>
                      </div>
                      <div className="mt-3 text-xl font-black text-blue-600">{formatRWF(p.price)}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs text-slate-400">In stock</div>
                      <div className="font-black text-slate-900">{formatNumber(p.qtyCurrent)}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs text-slate-400">Sold</div>
                      <div className="font-black text-slate-900">{formatNumber(p.qtySold)}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-xs text-slate-400">Value</div>
                      <div className="truncate font-black text-emerald-600">{formatRWF(stockValue)}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-slate-200">
                      <input
                        type="number"
                        min={1}
                        max={max}
                        disabled={!canSell}
                        value={qtyById[p.id] ?? 1}
                        onChange={(e) => updateQty(p.id, e.target.value, max)}
                        className="w-full rounded-xl border-0 bg-transparent px-3 py-2 font-bold outline-none disabled:opacity-50"
                      />
                      <span className="whitespace-nowrap text-xs text-slate-400">Max {formatNumber(max)}</span>
                    </div>
                    <button
                      disabled={!canSell || busyId === p.id}
                      onClick={() => sellUnits(p)}
                      className={`rounded-2xl px-5 py-3 font-black shadow-lg transition ${canSell ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]' : 'bg-slate-100 text-slate-400'} disabled:opacity-60`}
                    >
                      {busyId === p.id ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing</span> : 'Confirm Sale'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const MessagesView = (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Messages</h1>
          <p className="mt-1 text-slate-500">Communicate with your company admin.</p>
        </div>
        <div className="rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-600 shadow-sm ring-1 ring-pink-100">
          ❤️ {dashboardStats.likedMessages} liked by admin
        </div>
      </div>

      {DashboardStats}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><MessageSquare className="h-6 w-6" /></div>
              <div>
                <h2 className="text-xl font-black text-slate-950">New Message</h2>
                <p className="text-sm text-slate-500">Send a message to your admin.</p>
              </div>
            </div>

            <form onSubmit={sendMessage} className="space-y-4">
              <textarea
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type your message here..."
                className="h-44 w-full resize-none rounded-3xl border border-slate-200 px-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                maxLength={800}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-slate-500">
                  <CheckCircle className="mr-1 inline h-4 w-4 text-emerald-500" /> Messages are delivered instantly
                </span>
                <button
                  type="submit"
                  disabled={sending || !s(chatText)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-black text-white shadow-lg disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Recent Messages</h2>
            <Bell className="h-5 w-5 text-blue-600" />
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {loadingChat ? (
              <div className="py-10 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></div>
            ) : filteredMessages.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                No messages found
              </div>
            ) : (
              filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-3xl p-4 ring-1 transition ${
                    m.likedByAdmin
                      ? 'bg-gradient-to-br from-pink-50 to-rose-50 ring-pink-100 shadow-sm'
                      : 'bg-slate-50 ring-slate-200'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`grid h-9 w-9 place-items-center rounded-2xl ${m.likedByAdmin ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        {m.likedByAdmin ? <Heart className="h-4 w-4 fill-current" /> : <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">You</div>
                        <div className="text-xs text-slate-500">{m.fromEmail}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">
                        {m.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMessage(m.id)}
                        className="rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-slate-700">{m.text}</p>

                  {m.likedByAdmin === true && (
                    <div className="mt-3 rounded-2xl border border-pink-100 bg-white/80 p-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1.5 text-xs font-black text-pink-700">
                        <Heart className="h-4 w-4 fill-current" />
                        Admin liked this message
                      </div>
                      <div className="mt-1 text-[11px] text-pink-500">
                        {m.likedByName ? `Liked by ${m.likedByName}` : 'Liked by admin'}
                        {m.likedAt?.toDate?.() ? ` • ${m.likedAt.toDate().toLocaleString()}` : ''}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-400">
                    {m.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-14 text-slate-900">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.text}
        </div>
      )}

      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Building2 className="h-6 w-6" /></div>
            <div>
              <div className="font-black text-slate-950">{companyName}</div>
              <div className="text-xs text-slate-500">Worker Dashboard • {workerName}</div>
            </div>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </nav>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('products')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${currentView === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Package className="h-4 w-4" /> Products
              </button>
              <button
                onClick={() => setCurrentView('messages')}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${currentView === 'messages' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <MessageSquare className="h-4 w-4" /> Messages
                {dashboardStats.likedMessages > 0 && (
                  <span className="ml-1 rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {dashboardStats.likedMessages} liked
                  </span>
                )}
              </button>
            </div>
          </div>

          {currentView === 'products' ? ProductsView : MessagesView}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected / Snapshot live</div>
          <div className="font-mono">{companyId?.slice(0, 12)}...</div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4">
          <button type="button" onClick={() => setLightbox(null)} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>

          <div className="w-full max-w-5xl">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-black text-white">{lightbox.title}</h3>
              <p className="text-sm text-slate-300">{lightbox.index + 1} / {lightbox.urls.length}</p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-white/5">
              <img src={lightbox.urls[lightbox.index]} alt={`${lightbox.title} ${lightbox.index + 1}`} className="max-h-[75vh] w-full object-contain" />

              {lightbox.urls.length > 1 && (
                <>
                  <button type="button" onClick={showPrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button type="button" onClick={showNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25">
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
