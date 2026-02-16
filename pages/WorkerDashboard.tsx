import React, { useEffect, useMemo, useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ProductStatus, UserRole } from '../types';
import { 
  Package, 
  MessageSquare, 
  LogOut,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  Bell,
  Activity,
  Building2
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
};

type ViewType = 'products' | 'messages';

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

const clampInt = (v: unknown, min: number, max: number) => {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};

const s = (v: unknown) => String(v ?? '').trim();

const WorkerDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('products');

  const companyId = useMemo(() => s((profile as any)?.companyId), [profile]);
  const workerName = useMemo(() => s(profile?.name) || 'Worker', [profile?.name]);
  const workerEmail = useMemo(
    () => s(profile?.email) || s(firebase.auth().currentUser?.email) || '',
    [profile?.email]
  );
  const companyName = useMemo(() => s((profile as any)?.companyName) || 'Company', [profile]);

  // products
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [qtyById, setQtyById] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  // chat
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [chatText, setChatText] = useState('');
  const [sending, setSending] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  const showToast = (text: string, ok: boolean) => {
    setToast({ text, ok });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.status === ProductStatus.AVAILABLE).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.qtyCurrent), 0);
    const totalSoldToday = products.reduce((sum, p) => {
      const today = new Date().toDateString();
      const lastSold = p.updatedAt?.toDate?.();
      return sum + (lastSold?.toDateString() === today ? p.qtySold : 0);
    }, 0);
    const lowStockProducts = products.filter(p => p.qtyCurrent < 10 && p.qtyCurrent > 0).length;
    const outOfStockProducts = products.filter(p => p.qtyCurrent === 0).length;

    return {
      totalProducts,
      availableProducts,
      totalStockValue,
      totalSoldToday,
      lowStockProducts,
      outOfStockProducts
    };
  }, [products]);

  // stream products
  useEffect(() => {
    if (!profile?.uid || !companyId) return;

    setLoadingProducts(true);
    const q = db.collection('products').where('companyId', '==', companyId);

    const unsub = q.onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProductDoc[];
        // show available first, then sold
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

  // stream chat (worker sees own + admin sees all; here worker sees own)
  useEffect(() => {
    if (!profile?.uid || !companyId) return;

    setLoadingChat(true);

    const q = db
      .collection('messages')
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc')
      .limit(50);

    const unsub = q.onSnapshot(
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MessageDoc[];
        // worker UI shows only own (rules already enforce this, but also filter for UI)
        const mine = list.filter((m) => m.fromUid === profile.uid);
        setMessages(mine);
        setLoadingChat(false);
      },
      (err) => {
        console.error('chat stream error:', err);
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
    if (!companyId) {
      showToast('Missing companyId in worker profile.', false);
      return;
    }
    if (!workerEmail) {
      showToast('Missing email in worker profile.', false);
      return;
    }

    const max = Math.max(1, Number(p.qtyCurrent ?? 0));
    const units = clampInt(qtyById[p.id] ?? 1, 1, max);

    setBusyId(p.id);

    const ref = db.collection('products').doc(p.id);

    try {
      await db.runTransaction(async (tx) => {
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

        const nextStatus =
          nextCurrent === 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE;

        tx.update(ref, {
          qtyCurrent: nextCurrent,
          qtySold: nextSold,
          status: nextStatus,
          lastSoldByUid: profile.uid,
          lastSoldByName: workerName,
          lastSoldAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          // qtyUploaded remains unchanged by worker (rules enforce)
          qtyUploaded: uploaded,
        });
      });

      showToast(`Sold ${units} unit(s) successfully ✅`, true);
    } catch (err: any) {
      console.error('sell failed:', err);
      showToast(err?.message || 'Sell failed (rules/connection).', false);
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

  if (profile?.role !== UserRole.WORKER) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</div>
          <div className="text-gray-600">You don't have permission to access this dashboard.</div>
        </div>
      </div>
    );
  }

  // Dashboard Stats Component
  const DashboardStats = useMemo(() => {
    const stats = [
      {
        label: 'Available Products',
        value: formatNumber(dashboardStats.availableProducts),
        icon: ShoppingBag,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        change: '+5%',
        subLabel: `Total: ${dashboardStats.totalProducts}`
      },
      {
        label: 'Stock Value',
        value: formatRWF(dashboardStats.totalStockValue),
        icon: TrendingUp,
        color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        change: '+12%',
        subLabel: 'Current inventory'
      },
      {
        label: 'Sold Today',
        value: formatNumber(dashboardStats.totalSoldToday),
        icon: Activity,
        color: 'bg-gradient-to-r from-amber-500 to-amber-600',
        change: '+8%',
        subLabel: 'Daily sales'
      },
      {
        label: 'Low Stock',
        value: formatNumber(dashboardStats.lowStockProducts),
        icon: AlertCircle,
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        change: 'Attention',
        subLabel: `${dashboardStats.outOfStockProducts} out of stock`
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
              <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                stat.label === 'Low Stock' 
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
            {stat.subLabel && (
              <div className="text-xs text-gray-400 mt-1">{stat.subLabel}</div>
            )}
          </div>
        ))}
      </div>
    );
  }, [dashboardStats]);

  // Products View
  const ProductsView = useMemo(() => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage sales and track inventory in real-time</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
              <span className="font-medium">Role:</span> Worker
            </div>
          </div>
        </div>
        
        {DashboardStats}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
            <div className="flex items-center space-x-2">
              <div className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg">
                <span className="font-medium">Available:</span> {dashboardStats.availableProducts}
              </div>
              {dashboardStats.lowStockProducts > 0 && (
                <div className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-lg">
                  <span className="font-medium">Low Stock:</span> {dashboardStats.lowStockProducts}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Metrics</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sell Units</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingProducts ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="w-12 h-12 text-gray-300" />
                      <div className="text-gray-600">No products available for your company</div>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const max = Math.max(1, Number(p.qtyCurrent ?? 0));
                  const canSell = Number(p.qtyCurrent ?? 0) > 0 && String(p.status) === 'available';
                  const stockValue = p.price * p.qtyCurrent;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500">{p.category}</div>
                        <div className="text-sm font-medium text-blue-600 mt-1">
                          {formatRWF(p.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">In Stock:</span>
                            <span className="font-semibold text-gray-900">{formatNumber(p.qtyCurrent)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Sold:</span>
                            <span className="font-semibold text-gray-900">{formatNumber(p.qtySold)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Value:</span>
                            <span className="font-medium text-emerald-600">{formatRWF(stockValue)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          p.status === ProductStatus.AVAILABLE
                            ? p.qtyCurrent < 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.status === ProductStatus.AVAILABLE && p.qtyCurrent < 10 && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {p.status}
                          {p.qtyCurrent < 10 && p.qtyCurrent > 0 && ' (Low)'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min={1}
                            max={max}
                            disabled={!canSell}
                            value={qtyById[p.id] ?? 1}
                            onChange={(e) => updateQty(p.id, e.target.value, max)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-60"
                          />
                          <div className="text-xs text-gray-500">
                            Max: {formatNumber(max)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          disabled={!canSell || busyId === p.id}
                          onClick={() => sellUnits(p)}
                          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                            canSell
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          } disabled:opacity-50`}
                        >
                          {busyId === p.id ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Confirm Sale'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ), [products, loadingProducts, qtyById, busyId, DashboardStats, dashboardStats, updateQty, sellUnits]);

  // Messages View
  const MessagesView = useMemo(() => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Communicate with your company admin</p>
          </div>
          <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
            <span className="font-medium">Total Messages:</span> {messages.length}
          </div>
        </div>
        
        {DashboardStats}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
                <p className="text-sm text-gray-500">Send a message to your admin</p>
              </div>
            </div>

            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Type your message here... Describe any issues, requests, or updates for the admin."
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={800}
                  rows={5}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {chatText.length}/800 characters
                  </div>
                  <div className="text-xs text-gray-500">
                    Messages are stored permanently
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                  Messages are delivered instantly
                </div>
                <button
                  type="submit"
                  disabled={sending || !s(chatText)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Message History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
              <Bell className="w-5 h-5 text-blue-500" />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {loadingChat ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <div className="text-gray-500 mt-2">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <div className="text-gray-600">No messages yet</div>
                  <div className="text-sm text-gray-500 mt-1">Send your first message!</div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">You</div>
                          <div className="text-xs text-gray-500">{m.fromEmail}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {m.createdAt?.toDate?.()?.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) || 'Just now'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap mt-3">
                      {m.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-3">
                      {m.createdAt?.toDate?.()?.toLocaleDateString() || 'Today'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [messages, loadingChat, chatText, sending, DashboardStats, sendMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-lg border-l-4 ${
            toast.ok
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 text-green-700'
              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 text-red-700'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.ok ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">{toast.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
                <p className="text-sm bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-semibold hidden sm:block">
                  {companyName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-600">Welcome back,</div>
                <div className="font-semibold text-gray-900">{workerName}</div>
              </div>
              <div className="hidden sm:block text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-gray-900 ml-1 font-medium">{companyId?.slice(0, 8)}...</span>
              </div>
              <button
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

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('products')}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                    currentView === 'products'
                      ? 'bg-white border border-b-0 border-gray-200 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Products</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView('messages')}
                  className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                    currentView === 'messages'
                      ? 'bg-white border border-b-0 border-gray-200 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          {currentView === 'products' ? ProductsView : MessagesView}
        </div>
      </main>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
            <div>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{workerName}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="font-mono">{companyId?.slice(0, 12)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;