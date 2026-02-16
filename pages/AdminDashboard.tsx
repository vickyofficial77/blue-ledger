import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ProductStatus, UserRole } from '../types';
import { 
  Menu, 
  X, 
  Users, 
  Package, 
  MessageSquare, 
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  BarChart3,
  ShoppingBag,
  Mail,
  Building2,
  TrendingUp,
  DollarSign
} from 'lucide-react';

type ToastType = 'success' | 'error';
type Toast = { text: string; type: ToastType } | null;

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

// Color palette
const PRIMARY_COLOR = '#2563eb'; // Blue-600
const ACCENT_COLOR = '#10b981'; // Emerald-500

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

type Page = 'products' | 'workers' | 'messages';

// Format Rwandan Francs
const formatRWF = (amount: number): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Advanced search helper
const advancedSearch = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase().trim();
  const terms = lowerQuery.split(/\s+/).filter(term => term.length > 0);
  
  return items.filter(item => {
    return terms.every(term => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === 'number') {
          return value.toString().includes(term);
        }
        return false;
      });
    });
  });
};

// Memoized input components to prevent re-renders
const InputField = React.memo(({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  label,
  required = false 
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  label?: string;
  required?: boolean;
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <input
      type={type}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
));

InputField.displayName = 'InputField';

const NumberInputField = React.memo(({
  value,
  onChange,
  placeholder,
  label,
  min = 0,
  required = false
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  min?: number;
  required?: boolean;
}) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <input
      type="number"
      min={min}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
));

NumberInputField.displayName = 'NumberInputField';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    category: ''
  });

  const adminUid = profile?.uid || '';
  const companyId = useMemo(() => s((profile as any)?.companyId || profile?.uid), [profile]);
  const companyName = useMemo(() => s((profile as any)?.companyName) || 'Company', [profile]);

  // Toast
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<number | null>(null);
  
  const showToast = useCallback((text: string, type: ToastType) => {
    setToast({ text, type });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  // Products
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productForm, setProductForm] = useState({ name: '', category: '', price: '', qty: '1' });
  const [savingProduct, setSavingProduct] = useState(false);
  const [restockById, setRestockById] = useState<Record<string, number>>({});
  const [restockingId, setRestockingId] = useState<string | null>(null);

  // Workers
  const [workers, setWorkers] = useState<WorkerDoc[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '' });
  const [creatingWorker, setCreatingWorker] = useState(false);

  // Messages
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    const totalWorkers = workers.length;
    const totalMessages = messages.length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.qtyCurrent), 0);
    const totalSoldValue = products.reduce((sum, p) => sum + (p.price * p.qtySold), 0);
    const totalSold = products.reduce((sum, p) => sum + p.qtySold, 0);
    const activeWorkers = workers.filter(w => w.isActive !== false).length;
    const lowStockProducts = products.filter(p => p.qtyCurrent < 10).length;
    const outOfStockProducts = products.filter(p => p.qtyCurrent === 0).length;

    return {
      totalProducts,
      totalWorkers,
      totalMessages,
      totalStockValue,
      totalSoldValue,
      totalSold,
      activeWorkers,
      lowStockProducts,
      outOfStockProducts
    };
  }, [products, workers, messages]);

  // Filtered data based on search and date
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(product => {
        const productDate = product.updatedAt?.toDate?.() || new Date();
        return productDate.toDateString() === selectedDate.toDateString();
      });
    }
    
    // Filter by advanced search filters
    if (advancedSearchFilters.minPrice) {
      const min = parseFloat(advancedSearchFilters.minPrice);
      if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
    }
    
    if (advancedSearchFilters.maxPrice) {
      const max = parseFloat(advancedSearchFilters.maxPrice);
      if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);
    }
    
    if (advancedSearchFilters.minStock) {
      const min = parseInt(advancedSearchFilters.minStock, 10);
      if (!isNaN(min)) filtered = filtered.filter(p => p.qtyCurrent >= min);
    }
    
    if (advancedSearchFilters.maxStock) {
      const max = parseInt(advancedSearchFilters.maxStock, 10);
      if (!isNaN(max)) filtered = filtered.filter(p => p.qtyCurrent <= max);
    }
    
    if (advancedSearchFilters.category) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase().includes(advancedSearchFilters.category.toLowerCase())
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      if (searchMode === 'basic') {
        filtered = advancedSearch(filtered, searchQuery, ['name', 'category', 'status']);
      } else {
        // Advanced search: search in all text fields
        filtered = advancedSearch(filtered, searchQuery, [
          'name', 'category', 'status'
        ]);
      }
    }
    
    return filtered;
  }, [products, selectedDate, searchQuery, searchMode, advancedSearchFilters]);

  const filteredWorkers = useMemo(() => {
    let filtered = workers;
    
    if (searchQuery) {
      filtered = advancedSearch(filtered, searchQuery, ['name', 'email', 'role']);
    }
    
    return filtered;
  }, [workers, searchQuery]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(message => {
        const messageDate = message.createdAt?.toDate?.() || new Date();
        return messageDate.toDateString() === selectedDate.toDateString();
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = advancedSearch(filtered, searchQuery, ['fromName', 'fromEmail', 'text']);
    }
    
    return filtered;
  }, [messages, selectedDate, searchQuery]);

  // Export functionality
  const exportData = useCallback(() => {
    let data: any[] = [];
    let filename = '';
    
    switch (currentPage) {
      case 'products':
        data = filteredProducts.map(p => ({
          Name: p.name,
          Category: p.category,
          'Price (RWF)': p.price,
          Stock: p.qtyCurrent,
          Sold: p.qtySold,
          'Total Value (RWF)': p.price * p.qtyCurrent,
          Status: p.status,
          'Last Updated': p.updatedAt?.toDate?.()?.toLocaleString() || 'N/A'
        }));
        filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'workers':
        data = filteredWorkers.map(w => ({
          Name: w.name,
          Email: w.email,
          Role: w.role,
          Status: w.isActive === false ? 'Inactive' : 'Active',
          'Created At': w.createdAt?.toDate?.()?.toLocaleString() || 'N/A'
        }));
        filename = `workers_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'messages':
        data = filteredMessages.map(m => ({
          From: m.fromName,
          Email: m.fromEmail,
          Message: m.text,
          'Sent At': m.createdAt?.toDate?.()?.toLocaleString() || 'N/A'
        }));
        filename = `messages_${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }
    
    if (data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${data.length} records`, 'success');
  }, [currentPage, filteredProducts, filteredWorkers, filteredMessages, showToast]);

  // Navigation
  const navItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ] as const;

  // Optimized handlers using useCallback
  const handleProductFormChange = useCallback((field: keyof typeof productForm, value: string) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleWorkerFormChange = useCallback((field: keyof typeof workerForm, value: string) => {
    setWorkerForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAdvancedFilterChange = useCallback((field: keyof typeof advancedSearchFilters, value: string) => {
    setAdvancedSearchFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedSearchFilters({
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      category: ''
    });
  }, []);

  // Data fetching
  useEffect(() => {
    if (!adminUid || !companyId) return;

    setLoadingProducts(true);
    const unsubProducts = db
      .collection('products')
      .where('companyId', '==', companyId)
      .onSnapshot(
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
    const unsubWorkers = db
      .collection('users')
      .where('role', '==', UserRole.WORKER)
      .where('companyId', '==', companyId)
      .where('createdBy', '==', adminUid)
      .onSnapshot(
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
    const unsubMessages = db
      .collection('messages')
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .onSnapshot(
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MessageDoc[];
          setMessages(list);
          setLoadingMessages(false);
        },
        (err) => {
          console.error('messages stream error:', err);
          setLoadingMessages(false);
        }
      );

    return () => {
      unsubProducts();
      unsubWorkers();
      unsubMessages();
    };
  }, [adminUid, companyId]);

  // ---------- Add product ----------
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUid || !companyId) return;

    setSavingProduct(true);
    setToast(null);

    try {
      const qty = Math.max(0, Math.floor(toNum(productForm.qty, 0)));

      await db.collection('products').add({
        companyId,
        name: s(productForm.name),
        category: s(productForm.category),
        price: Math.max(0, toNum(productForm.price, 0)),

        qtyUploaded: qty,
        qtySold: 0,
        qtyCurrent: qty,
        status: qty === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE,

        createdBy: adminUid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

        lastSoldAt: null,
        lastSoldByUid: null,
        lastSoldByName: null,
      });

      setProductForm({ name: '', category: '', price: '', qty: '1' });
      showToast('Product added ✅', 'success');
    } catch (err: any) {
      console.error('add product failed:', err);
      showToast(err?.message || 'Failed to add product (rules/connection).', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // ---------- Delete product ----------
  const deleteProduct = useCallback(async (id: string) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await db.collection('products').doc(id).delete();
      showToast('Product deleted ✅', 'success');
    } catch (err: any) {
      console.error('delete product failed:', err);
      showToast(err?.message || 'Delete failed.', 'error');
    }
  }, [showToast]);

  // ---------- Restock ----------
  const updateRestock = useCallback((id: string, raw: string) => {
    setRestockById((p) => ({ ...p, [id]: clampInt(raw, 1, 1000000) }));
  }, []);

  const restock = useCallback(async (p: ProductDoc) => {
    const add = clampInt(restockById[p.id] ?? 1, 1, 1000000);
    setRestockingId(p.id);
    setToast(null);

    const ref = db.collection('products').doc(p.id);

    try {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Not found.');

        const cur = snap.data() as any;

        // tenant safety (client-side)
        if (String(cur.companyId) !== String(companyId)) throw new Error('Not your company.');

        const uploaded = Number(cur.qtyUploaded ?? 0);
        const current = Number(cur.qtyCurrent ?? 0);
        const sold = Number(cur.qtySold ?? 0);

        const nextUploaded = uploaded + add;
        const nextCurrent = current + add;

        tx.update(ref, {
          qtyUploaded: nextUploaded,
          qtyCurrent: nextCurrent,
          qtySold: sold,
          status: nextCurrent === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      showToast(`Restocked +${add} ✅`, 'success');
    } catch (err: any) {
      console.error('restock failed:', err);
      showToast(err?.message || 'Restock failed.', 'error');
    } finally {
      setRestockingId(null);
    }
  }, [companyId, restockById, showToast]);

  // ---------- Delete message ----------
  const deleteMessage = useCallback(async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await db.collection('messages').doc(id).delete();
      showToast('Message deleted ✅', 'success');
    } catch (err: any) {
      console.error('delete message failed:', err);
      showToast(err?.message || 'Delete message failed (rules).', 'error');
    }
  }, [showToast]);

  // ---------- Create worker ----------
  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !companyId) return;

    const name = s(workerForm.name);
    const email = s(workerForm.email);
    const password = workerForm.password;

    if (!name || !email || !password) {
      showToast('Fill worker name/email/password.', 'error');
      return;
    }

    setCreatingWorker(true);
    setToast(null);

    const defaultApp = firebase.apps[0];
    const options = (defaultApp?.options || {}) as any;

    const secondaryConfig = {
      apiKey: options.apiKey,
      authDomain: options.authDomain,
      projectId: options.projectId,
      storageBucket: options.storageBucket,
      messagingSenderId: options.messagingSenderId,
      appId: options.appId,
    };

    let secondaryApp: firebase.app.App | null = null;

    try {
      secondaryApp = firebase.initializeApp(secondaryConfig, `WorkerCreator_${Date.now()}`);

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
      console.error('create worker failed:', err);
      showToast(err?.message || 'Worker create failed.', 'error');
    } finally {
      try {
        if (secondaryApp) await secondaryApp.delete();
      } catch {}
      setCreatingWorker(false);
    }
  };

  // ---------- Delete worker doc ----------
  const deleteWorkerDoc = useCallback(async (uid: string) => {
    if (!window.confirm('Delete this worker Firestore profile?')) return;
    try {
      await db.collection('users').doc(uid).delete();
      showToast('Worker removed from Firestore ✅', 'success');
    } catch (err: any) {
      console.error('delete worker failed:', err);
      showToast(err?.message || 'Delete worker failed.', 'error');
    }
  }, [showToast]);

  // Calendar navigation
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate || new Date());
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  }, [selectedDate]);

  // Auth gate
  if (profile?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-2xl font-semibold text-gray-800 mb-2">Unauthorized</div>
          <div className="text-gray-600">You don't have permission to access this page.</div>
        </div>
      </div>
    );
  }

  // Calendar Component
  const CalendarView = useMemo(() => {
    const displayDate = selectedDate || new Date();
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-lg font-bold text-gray-900">
              {displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                type="button"
              >
                Clear Filter
              </button>
            )}
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              {selectedDate ? `Selected: ${displayDate.toLocaleDateString()}` : 'All Dates'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              type="button"
              className={`min-h-[40px] flex items-center justify-center text-sm rounded-lg transition-all duration-200
                ${day ? 'cursor-pointer hover:bg-gray-50 hover:shadow-sm' : ''}
                ${day === displayDate.getDate() ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}
                ${selectedDate && day === selectedDate.getDate() ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' : ''}
              `}
              onClick={() => day && setSelectedDate(new Date(year, month, day))}
            >
              {day || ''}
            </button>
          ))}
        </div>
      </div>
    );
  }, [selectedDate, navigateDate]);

  // Dashboard Stats Component
  const DashboardStats = useMemo(() => {
    const stats = [
      {
        label: 'Total Products',
        value: formatNumber(dashboardStats.totalProducts),
        change: '+12%',
        icon: ShoppingBag,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-blue-500'
      },
      {
        label: 'Active Workers',
        value: formatNumber(dashboardStats.activeWorkers),
        change: '+5%',
        icon: Users,
        color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        textColor: 'text-emerald-500'
      },
      {
        label: 'Total Messages',
        value: formatNumber(dashboardStats.totalMessages),
        change: '+23%',
        icon: Mail,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textColor: 'text-purple-500'
      },
      {
        label: 'Stock Value',
        value: formatRWF(dashboardStats.totalStockValue),
        change: '+8%',
        icon: BarChart3,
        color: 'bg-gradient-to-r from-amber-500 to-amber-600',
        textColor: 'text-amber-500',
        subValue: `(${formatNumber(dashboardStats.totalProducts)} items)`
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
            {stat.subValue && (
              <div className="text-xs text-gray-400 mt-1">{stat.subValue}</div>
            )}
          </div>
        ))}
      </div>
    );
  }, [dashboardStats]);

  // Products Page
  const ProductsPage = useMemo(() => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage inventory and track product performance</p>
          </div>
          <button 
            type="button"
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
        
        {DashboardStats}
      </div>

      {CalendarView}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSearchMode(searchMode === 'basic' ? 'advanced' : 'basic')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                searchMode === 'basic' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {searchMode === 'basic' ? 'Switch to Advanced' : 'Switch to Basic'}
            </button>
            {(Object.values(advancedSearchFilters).some(v => v) || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  clearAdvancedFilters();
                }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                type="button"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              searchMode === 'basic' 
                ? "Search products by name, category, or status..." 
                : "Enter search terms (supports multiple words)..."
            }
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchMode === 'advanced' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (RWF)</label>
              <input
                type="number"
                min="0"
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={advancedSearchFilters.minPrice}
                onChange={(e) => handleAdvancedFilterChange('minPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (RWF)</label>
              <input
                type="number"
                min="0"
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={advancedSearchFilters.maxPrice}
                onChange={(e) => handleAdvancedFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock</label>
              <input
                type="number"
                min="0"
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={advancedSearchFilters.minStock}
                onChange={(e) => handleAdvancedFilterChange('minStock', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock</label>
              <input
                type="number"
                min="0"
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={advancedSearchFilters.maxStock}
                onChange={(e) => handleAdvancedFilterChange('maxStock', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                placeholder="Category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={advancedSearchFilters.category}
                onChange={(e) => handleAdvancedFilterChange('category', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>
            Showing {filteredProducts.length} of {products.length} products
            {selectedDate && ` for ${selectedDate.toLocaleDateString()}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Total Value: {formatRWF(filteredProducts.reduce((sum, p) => sum + (p.price * p.qtyCurrent), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h2>
        <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            label="Product Name"
            placeholder="Enter product name"
            value={productForm.name}
            onChange={(value) => handleProductFormChange('name', value)}
            required
          />
          <InputField
            label="Category"
            placeholder="Enter category"
            value={productForm.category}
            onChange={(value) => handleProductFormChange('category', value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (RWF)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">RWF</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className="w-full pl-14 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={productForm.price}
                onChange={(e) => handleProductFormChange('price', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <NumberInputField
                label="Quantity"
                placeholder="1"
                value={productForm.qty}
                onChange={(value) => handleProductFormChange('qty', value)}
                min={0}
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingProduct}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm"
            >
              {savingProduct ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
            <div className="flex items-center space-x-2">
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-lg">
                <span className="font-medium">Low Stock:</span> {dashboardStats.lowStockProducts}
              </div>
              <div className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg">
                <span className="font-medium">Out of Stock:</span> {dashboardStats.outOfStockProducts}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (RWF)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingProducts ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery || selectedDate ? 'No products match your search criteria' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatRWF(product.price)}</div>
                      <div className="text-xs text-gray-500">
                        Value: {formatRWF(product.price * product.qtyCurrent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatNumber(product.qtyCurrent)}</div>
                      <div className="text-sm text-gray-500">of {formatNumber(product.qtyUploaded)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatNumber(product.qtySold)}</div>
                      <div className="text-xs text-gray-500">
                        Revenue: {formatRWF(product.price * product.qtySold)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        product.status === ProductStatus.AVAILABLE
                          ? product.qtyCurrent < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                        {product.qtyCurrent < 10 && product.qtyCurrent > 0 && ' (Low)'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            value={restockById[product.id] ?? 1}
                            onChange={(e) => updateRestock(product.id, e.target.value)}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => restock(product)}
                            disabled={restockingId === product.id}
                            className="p-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ), [
    CalendarView,
    DashboardStats,
    productForm, 
    filteredProducts, 
    products,
    loadingProducts, 
    restockById, 
    restockingId, 
    savingProduct,
    searchQuery,
    searchMode,
    selectedDate,
    advancedSearchFilters,
    dashboardStats.lowStockProducts,
    dashboardStats.outOfStockProducts,
    handleProductFormChange,
    handleAdvancedFilterChange,
    addProduct,
    updateRestock,
    restock,
    deleteProduct,
    exportData,
    clearAdvancedFilters
  ]);

  // Workers Page
  const WorkersPage = useMemo(() => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
            <p className="text-gray-600 mt-1">Manage team members and permissions</p>
          </div>
          <button 
            type="button"
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
        
        {DashboardStats}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search workers by name, email, or role..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>
            Showing {filteredWorkers.length} of {workers.length} workers
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Add Worker Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Worker</h2>
        <form onSubmit={createWorker} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Full Name"
            placeholder="Enter worker name"
            value={workerForm.name}
            onChange={(value) => handleWorkerFormChange('name', value)}
            required
          />
          <InputField
            label="Email Address"
            placeholder="worker@company.com"
            value={workerForm.email}
            onChange={(value) => handleWorkerFormChange('email', value)}
            type="email"
            required
          />
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <InputField
                label="Temporary Password"
                placeholder="Enter password"
                value={workerForm.password}
                onChange={(value) => handleWorkerFormChange('password', value)}
                type="password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creatingWorker}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm"
            >
              {creatingWorker ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loadingWorkers ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchQuery ? 'No workers match your search criteria' : 'No workers found'}
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <div key={worker.uid} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{worker.name}</div>
                      <div className="text-sm text-gray-500">{worker.email}</div>
                      <div className="text-xs text-gray-400 mt-1">Role: {worker.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className={`px-3 py-1.5 rounded-full font-medium ${
                        worker.isActive === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {worker.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteWorkerDoc(worker.uid)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ), [
    DashboardStats,
    workerForm, 
    filteredWorkers, 
    workers,
    loadingWorkers, 
    creatingWorker,
    searchQuery,
    handleWorkerFormChange,
    createWorker,
    deleteWorkerDoc,
    exportData
  ]);

  // Messages Page
  const MessagesPage = useMemo(() => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Communications from your team</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Mark all as read
            </button>
            <button 
              type="button"
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {DashboardStats}
      </div>

      {CalendarView}

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages by sender, email, or content..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>
            Showing {filteredMessages.length} of {messages.length} messages
            {selectedDate && ` for ${selectedDate.toLocaleDateString()}`}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loadingMessages ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchQuery || selectedDate ? 'No messages match your search criteria' : 'No messages found'}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{message.fromName}</div>
                      <div className="text-sm text-gray-500">{message.fromEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                      {message.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMessage(message.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {message.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ), [
    CalendarView,
    DashboardStats,
    filteredMessages, 
    messages,
    loadingMessages,
    searchQuery,
    selectedDate,
    deleteMessage,
    exportData
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-700'
              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-700'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{toast.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="ml-4 lg:ml-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-semibold hidden sm:block">
                      {companyName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="text-gray-600">Company ID:</span>
                <span className="font-mono text-gray-900 ml-1 font-medium">{companyId}</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto shadow-lg
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 truncate">{companyName}</div>
                  <div className="text-xs text-gray-500">Admin Panel</div>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(item.id as Page);
                      setSearchQuery('');
                      setSelectedDate(null);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${currentPage === item.id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Today</div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Content */}
            {currentPage === 'products' && ProductsPage}
            {currentPage === 'workers' && WorkersPage}
            {currentPage === 'messages' && MessagesPage}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;