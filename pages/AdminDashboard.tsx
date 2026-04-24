import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ProductStatus, UserRole } from '../types';
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
  Download,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';

type ToastType = 'success' | 'error';
type Toast = { text: string; type: ToastType } | null;
type Page = 'products' | 'workers' | 'messages';

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
  imagePublicIds?: string[];
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
  lastSoldAt?: any;
  lastSoldByUid?: string | null;
  lastSoldByName?: string | null;
};

type WorkerDoc = {
  uid: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  createdBy: string;
  isActive?: boolean;
  createdAt?: any;
  likedByAdmin?: boolean;
  likedAt?: any;
  likedByUid?: string | null;
  likedByName?: string | null;
};

type MessageDoc = {
  id: string;
  companyId: string;
  fromUid: string;
  fromName: string;
  fromEmail?: string;
  text: string;
  createdAt?: any;
};

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

const s = (v: unknown) => String(v ?? '').trim();
const toNum = (v: unknown, fallback = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
};
const clampInt = (v: unknown, min: number, max: number) => {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};
const tsSeconds = (t: any) => (t?.seconds ? Number(t.seconds) : 0);
const tsMillis = (t: any) => (t?.seconds ? Number(t.seconds) * 1000 : 0);
const toDateSafe = (t: any): Date | null => {
  if (!t) return null;
  if (typeof t.toDate === 'function') return t.toDate();
  if (t instanceof Date) return t;
  return null;
};
const sameCalendarDay = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();
const productTouchedOnDate = (p: ProductDoc, date: Date) =>
  sameCalendarDay(toDateSafe(p.updatedAt), date) || sameCalendarDay(toDateSafe(p.createdAt), date) || sameCalendarDay(toDateSafe(p.lastSoldAt), date);
const getLatestMessageTime = (items: MessageDoc[]) => items.reduce((max, message) => Math.max(max, tsMillis(message.createdAt)), 0);

const formatRWF = (amount: number): string =>
  new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (num: number): string => new Intl.NumberFormat('en-US').format(num || 0);

const advancedSearch = <T extends Record<string, any>>(items: T[], query: string, fields: (keyof T)[]) => {
  if (!query.trim()) return items;
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter((item) =>
    terms.every((term) =>
      fields.some((field) => {
        const value = item[field];
        return typeof value === 'string' || typeof value === 'number'
          ? String(value).toLowerCase().includes(term)
          : false;
      })
    )
  );
};

const uploadImagesToCloudinary = async (files: File[]) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Missing Cloudinary env: VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
  }

  const uploads = files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'products');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Cloudinary upload failed. Check upload preset settings.');
    const data = await res.json();
    return { url: data.secure_url as string, publicId: data.public_id as string };
  });

  return Promise.all(uploads);
};

const EmptyImage = () => (
  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
    <Package className="h-6 w-6" />
  </div>
);

const ProductImages = ({
  urls = [],
  name,
  onOpen,
}: {
  urls?: string[];
  name: string;
  onOpen?: (index: number) => void;
}) => {
  if (!urls.length) return <EmptyImage />;

  const firstUrl = urls[0];
  const extraCount = Math.max(0, urls.length - 1);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(0)}
      className="group relative block rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
      title={urls.length > 1 ? `View ${urls.length} product images` : 'View product image'}
    >
      <img
        src={firstUrl}
        alt={`${name} 1`}
        className="h-16 w-16 rounded-2xl border border-white object-cover shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105 group-hover:shadow-lg"
      />
      {extraCount > 0 && (
        <span className="absolute -right-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-slate-950 px-2 text-[11px] font-black text-white shadow-lg ring-2 ring-white">
          +{extraCount}
        </span>
      )}
      <span className="pointer-events-none absolute inset-x-1 bottom-1 rounded-xl bg-slate-950/70 px-2 py-0.5 text-center text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">
        Open
      </span>
    </button>
  );
};

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState({ minPrice: '', maxPrice: '', minStock: '', maxStock: '', category: '' });

  const adminUid = profile?.uid || '';
  const companyId = useMemo(() => s((profile as any)?.companyId || profile?.uid), [profile]);
  const companyName = useMemo(() => s((profile as any)?.companyName) || 'Company', [profile]);
  const adminName = useMemo(() => s(profile?.name) || 'Admin', [profile?.name]);

  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((text: string, type: ToastType) => {
    setToast({ text, type });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', category: '', price: '', qty: '1' });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [restockById, setRestockById] = useState<Record<string, number>>({});
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const [workers, setWorkers] = useState<WorkerDoc[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '' });
  const [creatingWorker, setCreatingWorker] = useState(false);

  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messageSeenStorageKey = useMemo(() => `admin:${adminUid || 'unknown'}:${companyId || 'unknown'}:lastSeenMessagesAt`, [adminUid, companyId]);
  const [lastSeenMessagesAt, setLastSeenMessagesAt] = useState(0);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number; title: string } | null>(null);

  const openImageLightbox = useCallback((urls: string[] = [], title: string, index = 0) => {
    if (!urls.length) return;
    setLightbox({ urls, title, index: Math.max(0, Math.min(index, urls.length - 1)) });
  }, []);

  const closeImageLightbox = useCallback(() => setLightbox(null), []);
  const showPrevImage = useCallback(() => {
    setLightbox((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.urls.length) % prev.urls.length } : prev);
  }, []);
  const showNextImage = useCallback(() => {
    setLightbox((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.urls.length } : prev);
  }, []);

  const dashboardStats = useMemo(() => {
    const visibleProducts = selectedDate ? products.filter((p) => productTouchedOnDate(p, selectedDate)) : products;
    const visibleMessages = selectedDate ? messages.filter((m) => sameCalendarDay(toDateSafe(m.createdAt), selectedDate)) : messages;
    const totalProducts = visibleProducts.length;
    const totalWorkers = workers.length;
    const totalMessages = visibleMessages.length;
    const totalStockValue = visibleProducts.reduce((sum, p) => sum + p.price * p.qtyCurrent, 0);
    const totalSoldValue = visibleProducts.reduce((sum, p) => sum + p.price * p.qtySold, 0);
    const activeWorkers = workers.filter((w) => w.isActive !== false).length;
    const lowStockProducts = visibleProducts.filter((p) => p.qtyCurrent < 10 && p.qtyCurrent > 0).length;
    const outOfStockProducts = visibleProducts.filter((p) => p.qtyCurrent === 0).length;
    return { totalProducts, totalWorkers, totalMessages, totalStockValue, totalSoldValue, activeWorkers, lowStockProducts, outOfStockProducts };
  }, [products, workers, messages, selectedDate]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedDate) {
      filtered = filtered.filter((p) => productTouchedOnDate(p, selectedDate));
    }
    const { minPrice, maxPrice, minStock, maxStock, category } = advancedSearchFilters;
    if (minPrice) filtered = filtered.filter((p) => p.price >= toNum(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= toNum(maxPrice));
    if (minStock) filtered = filtered.filter((p) => p.qtyCurrent >= toNum(minStock));
    if (maxStock) filtered = filtered.filter((p) => p.qtyCurrent <= toNum(maxStock));
    if (category) filtered = filtered.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    if (searchQuery) filtered = advancedSearch(filtered, searchQuery, ['name', 'category', 'status']);
    return filtered;
  }, [products, selectedDate, searchQuery, advancedSearchFilters]);

  const filteredWorkers = useMemo(() => (searchQuery ? advancedSearch(workers, searchQuery, ['name', 'email', 'role']) : workers), [workers, searchQuery]);
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];
    if (selectedDate) filtered = filtered.filter((m) => sameCalendarDay(toDateSafe(m.createdAt), selectedDate));
    if (searchQuery) filtered = advancedSearch(filtered, searchQuery, ['fromName', 'fromEmail', 'text']);
    return filtered;
  }, [messages, selectedDate, searchQuery]);

  const latestMessageTime = useMemo(() => getLatestMessageTime(messages), [messages]);
  const unreadMessagesCount = useMemo(() => currentPage === 'messages' ? 0 : messages.filter((message) => tsMillis(message.createdAt) > lastSeenMessagesAt).length, [currentPage, lastSeenMessagesAt, messages]);

  const markMessagesAsSeen = useCallback(() => {
    const seenAt = latestMessageTime || Date.now();
    setLastSeenMessagesAt(seenAt);
    try { window.localStorage.setItem(messageSeenStorageKey, String(seenAt)); } catch {}
  }, [latestMessageTime, messageSeenStorageKey]);

  const handleNavClick = useCallback((page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    setSearchQuery('');
    if (page === 'messages') markMessagesAsSeen();
  }, [markMessagesAsSeen]);

  useEffect(() => {
    try { setLastSeenMessagesAt(Number(window.localStorage.getItem(messageSeenStorageKey) || 0)); }
    catch { setLastSeenMessagesAt(0); }
  }, [messageSeenStorageKey]);

  useEffect(() => {
    if (currentPage === 'messages' && messages.length) markMessagesAsSeen();
  }, [currentPage, messages.length, markMessagesAsSeen]);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  useEffect(() => {
    if (!adminUid || !companyId) return;

    setLoadingProducts(true);
    const unsubProducts = db.collection('products').where('companyId', '==', companyId).onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProductDoc[];
        list.sort((a, b) => tsSeconds(b.updatedAt) - tsSeconds(a.updatedAt));
        setProducts(list);
        setRestockById((prev) => {
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

    setLoadingWorkers(true);
    const unsubWorkers = db.collection('users').where('role', '==', UserRole.WORKER).where('companyId', '==', companyId).where('createdBy', '==', adminUid).onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => d.data() as WorkerDoc);
        list.sort((a, b) => tsSeconds(b.createdAt) - tsSeconds(a.createdAt));
        setWorkers(list);
        setLoadingWorkers(false);
      },
      (err) => {
        console.error('workers stream error:', err);
        setLoadingWorkers(false);
      }
    );

    setLoadingMessages(true);
    const unsubMessages = db.collection('messages').where('companyId', '==', companyId).onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MessageDoc[];
        list.sort((a, b) => tsSeconds(b.createdAt) - tsSeconds(a.createdAt));
        setMessages(list.slice(0, 200));
        setLoadingMessages(false);
      },
      (err) => {
        console.error('messages stream error:', err);
        setLoadingMessages(false);
        showToast('Unable to load worker messages. Check Firestore rules and companyId.', 'error');
      }
    );

    return () => {
      unsubProducts();
      unsubWorkers();
      unsubMessages();
    };
  }, [adminUid, companyId, showToast]);

  const handleImageSelect = (files: FileList | null) => {
    const selected = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    const merged = [...productImages, ...selected].slice(0, 8);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setProductImages(merged);
    setImagePreviews(merged.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    const next = productImages.filter((_, i) => i !== index);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setProductImages(next);
    setImagePreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUid || !companyId) return;
    const name = s(productForm.name);
    const category = s(productForm.category);
    if (!name || !category) return showToast('Fill product name and category.', 'error');

    setSavingProduct(true);
    setToast(null);
    try {
      const qty = Math.max(0, Math.floor(toNum(productForm.qty, 0)));
      const uploaded = productImages.length ? await uploadImagesToCloudinary(productImages) : [];
      await db.collection('products').add({
        companyId,
        name,
        category,
        price: Math.max(0, toNum(productForm.price, 0)),
        qtyUploaded: qty,
        qtySold: 0,
        qtyCurrent: qty,
        status: qty === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE,
        imageUrls: uploaded.map((img) => img.url),
        imagePublicIds: uploaded.map((img) => img.publicId),
        createdBy: adminUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastSoldAt: null,
        lastSoldByUid: null,
        lastSoldByName: null,
      });
      setProductForm({ name: '', category: '', price: '', qty: '1' });
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setProductImages([]);
      setImagePreviews([]);
      showToast('Product added with images ✅', 'success');
    } catch (err: any) {
      console.error('add product failed:', err);
      showToast(err?.message || 'Failed to add product.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = useCallback(async (id: string) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await db.collection('products').doc(id).delete();
      showToast('Product deleted ✅', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Delete failed.', 'error');
    }
  }, [showToast]);

  const updateRestock = useCallback((id: string, raw: string) => setRestockById((p) => ({ ...p, [id]: clampInt(raw, 1, 1000000) })), []);

  const restock = useCallback(async (p: ProductDoc) => {
    const add = clampInt(restockById[p.id] ?? 1, 1, 1000000);
    setRestockingId(p.id);
    try {
      await db.runTransaction(async (tx) => {
        const ref = db.collection('products').doc(p.id);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Not found.');
        const cur = snap.data() as any;
        if (String(cur.companyId) !== String(companyId)) throw new Error('Not your company.');
        const nextUploaded = Number(cur.qtyUploaded ?? 0) + add;
        const nextCurrent = Number(cur.qtyCurrent ?? 0) + add;
        tx.update(ref, {
          qtyUploaded: nextUploaded,
          qtyCurrent: nextCurrent,
          status: nextCurrent === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      showToast(`Restocked +${add} ✅`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Restock failed.', 'error');
    } finally {
      setRestockingId(null);
    }
  }, [companyId, restockById, showToast]);

  const deleteMessage = useCallback(async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await db.collection('messages').doc(id).delete();
      showToast('Message deleted ✅', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Delete message failed.', 'error');
    }
  }, [showToast]);

  const toggleMessageLike = useCallback(async (message: MessageDoc) => {
    try {
      await db.collection('messages').doc(message.id).update({
        likedByAdmin: !message.likedByAdmin,
        likedAt: !message.likedByAdmin ? firebase.firestore.FieldValue.serverTimestamp() : null,
        likedByUid: !message.likedByAdmin ? adminUid : null,
        likedByName: !message.likedByAdmin ? adminName : null,
      });
      showToast(!message.likedByAdmin ? 'Message liked ✅' : 'Like removed', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update message like.', 'error');
    }
  }, [adminUid, adminName, showToast]);

  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !companyId) return;
    const name = s(workerForm.name);
    const email = s(workerForm.email);
    const password = workerForm.password;
    if (!name || !email || !password) return showToast('Fill worker name/email/password.', 'error');

    setCreatingWorker(true);
    const defaultApp = firebase.apps[0];
    const options = (defaultApp?.options || {}) as any;
    let secondaryApp: firebase.app.App | null = null;
    try {
      secondaryApp = firebase.initializeApp(options, `WorkerCreator_${Date.now()}`);
      const cred = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
      const user = cred.user;
      if (!user) throw new Error('Worker auth not created.');
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        name,
        email,
        role: UserRole.WORKER,
        companyId,
        createdBy: adminUid,
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      showToast(`Worker created: ${name} ✅`, 'success');
      setWorkerForm({ name: '', email: '', password: '' });
      await secondaryApp.auth().signOut();
    } catch (err: any) {
      showToast(err?.message || 'Worker create failed.', 'error');
    } finally {
      try { if (secondaryApp) await secondaryApp.delete(); } catch {}
      setCreatingWorker(false);
    }
  };

  const deleteWorkerDoc = useCallback(async (uid: string) => {
    if (!window.confirm('Delete this worker Firestore profile?')) return;
    try {
      await db.collection('users').doc(uid).delete();
      showToast('Worker removed ✅', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Delete worker failed.', 'error');
    }
  }, [showToast]);

  const exportData = useCallback(() => {
    const data = currentPage === 'products'
      ? filteredProducts.map((p) => ({ Name: p.name, Category: p.category, Price: p.price, Stock: p.qtyCurrent, Sold: p.qtySold, Images: p.imageUrls?.join(' | ') || '' }))
      : currentPage === 'workers'
      ? filteredWorkers.map((w) => ({ Name: w.name, Email: w.email, Role: w.role, Status: w.isActive === false ? 'Inactive' : 'Active' }))
      : filteredMessages.map((m) => ({ From: m.fromName, Email: m.fromEmail, Message: m.text }));
    if (!data.length) return showToast('No data to export', 'error');
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map((row: any) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} records`, 'success');
  }, [currentPage, filteredProducts, filteredWorkers, filteredMessages, showToast]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate || new Date());
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  }, [selectedDate]);

  if (profile?.role !== UserRole.ADMIN) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1><p className="mt-2 text-slate-500">You do not have permission to access this page.</p></div></div>;
  }

  const CalendarView = (() => {
    const displayDate = selectedDate || new Date();
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:max-w-md">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button onClick={() => navigateDate('prev')} className="rounded-xl p-1.5 hover:bg-slate-100" type="button"><ChevronLeft className="h-4 w-4" /></button>
          <div className="text-sm font-bold text-slate-900">{displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          <button onClick={() => navigateDate('next')} className="rounded-xl p-1.5 hover:bg-slate-100" type="button"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={`${day}-${i}`} className="py-1 text-[10px] font-bold text-slate-400">{day}</div>)}
          {days.map((day, index) => (
            <button key={index} type="button" onClick={() => day && setSelectedDate(new Date(year, month, day))} className={`grid h-8 w-8 place-items-center rounded-xl text-xs transition ${day ? 'hover:bg-blue-50' : ''} ${day === displayDate.getDate() ? 'font-bold text-blue-600' : 'text-slate-600'} ${selectedDate && day === selectedDate.getDate() ? 'bg-blue-600 text-white shadow-md' : ''}`}>{day || ''}</button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">{selectedDate ? selectedDate.toLocaleDateString() : 'All dates'}</span>
          {selectedDate && <button type="button" onClick={() => setSelectedDate(null)} className="font-semibold text-blue-600">Clear</button>}
        </div>
      </div>
    );
  })();

  const StatCards = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {[
        { label: 'Total Products', value: formatNumber(dashboardStats.totalProducts), icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
        { label: 'Active Workers', value: formatNumber(dashboardStats.activeWorkers), icon: Users, color: 'from-emerald-500 to-teal-600' },
        { label: 'Messages', value: formatNumber(dashboardStats.totalMessages), icon: Mail, color: 'from-violet-500 to-fuchsia-600' },
        { label: 'Sold Value', value: formatRWF(dashboardStats.totalSoldValue), icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
        { label: 'Stock Value', value: formatRWF(dashboardStats.totalStockValue), icon: BarChart3, color: 'from-amber-500 to-orange-600' },
      ].map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="mb-4 flex items-center justify-between"><div className={`rounded-2xl bg-gradient-to-r ${stat.color} p-3 shadow-lg`}><stat.icon className="h-6 w-6 text-white" /></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Live</span></div>
          <div className="text-2xl font-black text-slate-900">{stat.value}</div><div className="text-sm text-slate-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );

  const ProductsPage = (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div><h1 className="text-3xl font-black text-slate-950">Products</h1><p className="mt-1 text-slate-500">Upload multiple product photos, manage stock, and see Firestore live changes.</p></div><button type="button" onClick={exportData} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800"><Download className="h-4 w-4" /> Export</button></div>
      {StatCards}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><ImagePlus className="h-6 w-6" /></div><div><h2 className="text-xl font-black text-slate-950">Add New Product</h2><p className="text-sm text-slate-500">Cloudinary stores images; Firestore stores product details and image URLs.</p></div></div>
          <form onSubmit={addProduct} className="space-y-5">
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center transition hover:border-blue-400 hover:shadow-lg">
              <UploadCloud className="mb-2 h-10 w-10 text-blue-600" /><span className="text-sm font-black text-slate-900">Click to upload product images</span><span className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP • up to 8 images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageSelect(e.target.files)} />
            </label>
            {imagePreviews.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{imagePreviews.map((src, index) => <div key={src} className="group relative overflow-hidden rounded-2xl border border-slate-200"><img src={src} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" /><button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"><X className="h-4 w-4" /></button></div>)}</div>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Category" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required />
              <input type="number" min="0" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Price (RWF)" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
              <input type="number" min="0" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Quantity" value={productForm.qty} onChange={(e) => setProductForm((p) => ({ ...p, qty: e.target.value }))} required />
            </div>
            <button type="submit" disabled={savingProduct} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-black text-white shadow-xl transition hover:scale-[1.01] disabled:opacity-60">{savingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} {savingProduct ? 'Uploading...' : 'Add Product'}</button>
          </form>
        </div>
        <div>{CalendarView}</div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><h2 className="text-xl font-black text-slate-950">Search & Filter</h2><div className="flex gap-2"><button type="button" onClick={() => setSearchMode(searchMode === 'basic' ? 'advanced' : 'basic')} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{searchMode === 'basic' ? 'Advanced' : 'Basic'}</button><button type="button" onClick={() => { setSearchQuery(''); setAdvancedSearchFilters({ minPrice: '', maxPrice: '', minStock: '', maxStock: '', category: '' }); }} className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">Clear</button></div></div>
        <div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Search products by name, category, status..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        {searchMode === 'advanced' && <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">{(['minPrice','maxPrice','minStock','maxStock','category'] as const).map((key) => <input key={key} type={key === 'category' ? 'text' : 'number'} placeholder={key} className="rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500" value={advancedSearchFilters[key]} onChange={(e) => setAdvancedSearchFilters((p) => ({ ...p, [key]: e.target.value }))} />)}</div>}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-black text-slate-950">Product Inventory</h2>{selectedDate && <p className="text-sm text-slate-500">Showing products changed, created, or sold on {selectedDate.toLocaleDateString()}</p>}</div><div className="flex gap-2 text-xs font-bold"><span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">Low: {dashboardStats.lowStockProducts}</span><span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Out: {dashboardStats.outOfStockProducts}</span></div></div>
        <div className="overflow-x-auto"><table className="w-full"><thead className="bg-white text-left text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Sold</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {loadingProducts ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></td></tr> : filteredProducts.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No products found</td></tr> : filteredProducts.map((product) => <tr key={product.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-4"><ProductImages urls={product.imageUrls} name={product.name} onOpen={(index) => openImageLightbox(product.imageUrls || [], product.name, index)} /><div><div className="font-black text-slate-950">{product.name}</div><div className="text-sm text-slate-500">{product.category}</div></div></div></td><td className="px-5 py-4 font-bold text-slate-900">{formatRWF(product.price)}<div className="text-xs font-normal text-slate-400">Value: {formatRWF(product.price * product.qtyCurrent)}</div></td><td className="px-5 py-4 font-bold">{formatNumber(product.qtyCurrent)}<div className="text-xs font-normal text-slate-400">of {formatNumber(product.qtyUploaded)}</div></td><td className="px-5 py-4 font-bold">{formatNumber(product.qtySold)}<div className="text-xs font-normal text-emerald-600">{formatRWF(product.price * product.qtySold)}</div></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${product.status === ProductStatus.AVAILABLE ? product.qtyCurrent < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{product.status}{product.qtyCurrent < 10 && product.qtyCurrent > 0 ? ' Low' : ''}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><input type="number" min={1} value={restockById[product.id] ?? 1} onChange={(e) => updateRestock(product.id, e.target.value)} className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm" /><button type="button" onClick={() => restock(product)} disabled={restockingId === product.id} className="rounded-xl bg-emerald-600 p-2 text-white disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${restockingId === product.id ? 'animate-spin' : ''}`} /></button><button type="button" onClick={() => deleteProduct(product.id)} className="rounded-xl bg-red-600 p-2 text-white"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
        </tbody></table></div>
      </div>
    </div>
  );

  const WorkersPage = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">Workers</h1>
        <p className="mt-1 text-slate-500">Create, manage, and search workers in your company.</p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-black">Add Worker</h2>
        <form onSubmit={createWorker} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input placeholder="Name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={workerForm.name} onChange={(e) => setWorkerForm((p) => ({ ...p, name: e.target.value }))} required />
          <input type="email" placeholder="Email" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={workerForm.email} onChange={(e) => setWorkerForm((p) => ({ ...p, email: e.target.value }))} required />
          <input type="password" placeholder="Password" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={workerForm.password} onChange={(e) => setWorkerForm((p) => ({ ...p, password: e.target.value }))} required />
          <button disabled={creatingWorker} className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white shadow-lg disabled:opacity-60">{creatingWorker ? 'Creating...' : 'Create Worker'}</button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Worker List</h2>
            <p className="text-sm text-slate-500">Showing {filteredWorkers.length} of {workers.length} workers</p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search worker by name, email, or role..." className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loadingWorkers ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading workers...</td></tr> : filteredWorkers.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">No worker found</td></tr> : filteredWorkers.map((w) => (
                <tr key={w.uid} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold text-slate-900">{w.name}</td><td className="px-5 py-4 text-slate-500">{w.email}</td><td className="px-5 py-4 text-slate-500">{w.role}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{w.isActive === false ? 'Inactive' : 'Active'}</span></td><td className="px-5 py-4"><button type="button" onClick={() => deleteWorkerDoc(w.uid)} className="rounded-xl bg-red-600 p-2 text-white"><Trash2 className="h-4 w-4" /></button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MessagesPage = (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Worker Messages</h1>
          <p className="mt-1 text-slate-500">All messages sent by workers in your company appear here instantly.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          <MessageSquare className="h-4 w-4" />
          {filteredMessages.length} message{filteredMessages.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by worker name, email, or message..."
            className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {loadingMessages ? (
          <div className="col-span-full rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
            Loading worker messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <div className="text-lg font-black text-slate-900">No worker messages yet</div>
            <p className="mt-1 text-sm text-slate-500">When workers send messages, they will show here without refreshing.</p>
          </div>
        ) : (
          filteredMessages.map((m) => (
            <article key={m.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-lg">
                    {s(m.fromName).slice(0, 2).toUpperCase() || 'WK'}
                  </div>
                  <div>
                    <div className="font-black text-slate-950">{m.fromName || 'Worker'}</div>
                    <div className="text-sm text-slate-500">{m.fromEmail || 'No email'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleMessageLike(m)} className={`rounded-xl p-2 transition ${m.likedByAdmin ? 'bg-rose-600 text-white shadow-lg' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`} type="button" title={m.likedByAdmin ? 'Remove like' : 'Like message'}>
                    <Heart className={`h-4 w-4 ${m.likedByAdmin ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => deleteMessage(m.id)} className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white" type="button">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{m.text}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{m.likedByAdmin ? '❤️ Liked by admin' : 'Company: ' + m.companyId}</span>
                <span>{m.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );


  const navItems = [{ id: 'products', label: 'Products', icon: Package }, { id: 'workers', label: 'Workers', icon: Users }, { id: 'messages', label: 'Messages', icon: MessageSquare }] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {toast && <div className={`fixed right-5 top-5 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.text}</div>}
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-slate-950/90 p-4 backdrop-blur-sm" onClick={closeImageLightbox}>
          <div className="mx-auto flex h-full max-w-6xl flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3 text-white">
              <div>
                <h3 className="text-xl font-black">{lightbox.title}</h3>
                <p className="text-sm text-white/60">Image {lightbox.index + 1} of {lightbox.urls.length}</p>
              </div>
              <button type="button" onClick={closeImageLightbox} className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] bg-white/5 ring-1 ring-white/10">
              <img src={lightbox.urls[lightbox.index]} alt={`${lightbox.title} ${lightbox.index + 1}`} className="max-h-full max-w-full object-contain" />
              {lightbox.urls.length > 1 && (
                <>
                  <button type="button" onClick={showPrevImage} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button type="button" onClick={showNextImage} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}
            </div>

            {lightbox.urls.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {lightbox.urls.map((url, index) => (
                  <button key={`${url}-${index}`} type="button" onClick={() => setLightbox((prev) => prev ? { ...prev, index } : prev)} className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition ${index === lightbox.index ? 'border-blue-400 opacity-100' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
                    <img src={url} alt={`${lightbox.title} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 shadow-xl transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-600 p-3 text-white"><Building2 className="h-6 w-6" /></div><div><div className="font-black">{companyName}</div><div className="text-xs text-slate-500">Admin panel</div></div></div><button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X /></button></div><nav className="space-y-2">{navItems.map((item) => { const isMessages = item.id === 'messages'; const showBadge = isMessages && unreadMessagesCount > 0; return (<button key={item.id} onClick={() => handleNavClick(item.id)} className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${currentPage === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}><span className="relative"><item.icon className="h-5 w-5" />{showBadge && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}</span><span className="flex-1 text-left">{item.label}</span>{showBadge && <span className={`grid min-w-6 place-items-center rounded-full px-2 py-0.5 text-xs font-black ${currentPage === item.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</span>}</button>); })}</nav><button onClick={signOut} className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-bold text-slate-700 hover:bg-red-50 hover:text-red-600"><LogOut className="h-5 w-5" /> Logout</button></aside>
      <main className="lg:pl-72"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6"><div className="flex items-center justify-between"><button onClick={() => setSidebarOpen(true)} className="rounded-2xl bg-slate-100 p-2 lg:hidden"><Menu /></button><div className="hidden text-sm font-bold text-slate-500 lg:block">Realtime dashboard</div><div className="flex items-center gap-3">{unreadMessagesCount > 0 && <button type="button" onClick={() => handleNavClick('messages')} className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 ring-1 ring-red-100"><span className="mr-1 inline-flex h-2 w-2 rounded-full bg-red-500" />{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount} new message{unreadMessagesCount > 1 ? 's' : ''}</button>}<div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Snapshot live</div></div></div></header><div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{currentPage === 'products' ? ProductsPage : currentPage === 'workers' ? WorkersPage : MessagesPage}</div></main>
    </div>
  );
};

export default AdminDashboard;
