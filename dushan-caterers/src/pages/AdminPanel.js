// src/pages/AdminPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateQuotationPDF, generateChefMenuPDF } from '../utils/pdfGenerator';
import { MenuManagerTab } from './MenuManager';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOLD = '#D4AF37';
const DARK = '#1A1A1A';
const CREAM = '#F8F5EB';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { id: 'orders',    label: 'Orders',    icon: 'bi-clipboard-fill' },
  { id: 'customers', label: 'Customers', icon: 'bi-people-fill' },
  { id: 'analytics', label: 'Analytics', icon: 'bi-bar-chart-fill' },
  { id: 'reports',   label: 'Reports',   icon: 'bi-file-earmark-text-fill' },
  { id: 'menus',     label: 'Menus',     icon: 'bi-journal-richtext' },
  { id: 'payments',  label: 'Payments',  icon: 'bi-credit-card-fill' },
];

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordSnap, usrSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
      ]);
      const ordersData = ordSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
      setCustomers(usrSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
    } catch {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status }));
      toast.success(`Status → ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const recordPayment = async (orderId, amount) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { advancePaid: Number(amount), status: 'confirmed' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, advancePaid: Number(amount), status: 'confirmed' } : o));
      toast.success('Payment recorded');
    } catch { toast.error('Update failed'); }
  };

  // Derived stats
  const totalRevenue    = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalAdvance    = orders.reduce((s, o) => s + (o.advancePaid || 0), 0);
  const totalBalance    = totalRevenue - totalAdvance;
  const pendingCount    = orders.filter(o => o.status === 'pending').length;
  const confirmedCount  = orders.filter(o => o.status === 'confirmed').length;
  const completedCount  = orders.filter(o => o.status === 'completed').length;
  const totalGuests     = orders.reduce((s, o) => s + (o.guestCount || 0), 0);

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || (o.customerName || '').toLowerCase().includes(term)
      || (o.orderId || '').toLowerCase().includes(term)
      || (o.eventType || '').toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 64 }}>
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarLogo}>
            <img src="/assets/DushanCaterersLOGO.png" alt="DC Logo" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} />
            {sidebarOpen && <div>
              <div style={styles.logoTitle}>Dushan</div>
              <div style={styles.logoSub}>Admin Panel</div>
            </div>}
          </div>
          <button style={styles.collapseBtn} onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? <i className='bi bi-chevron-left'/> : <i className='bi bi-chevron-right'/>}
          </button>
        </div>

        {sidebarOpen && (
          <div style={styles.adminProfile}>
            <div style={styles.adminAvatar}>
              {(currentUser?.email || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={styles.adminName}>Admin User</div>
              <div style={styles.adminEmail}>{currentUser?.email}</div>
            </div>
          </div>
        )}

        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              style={{ ...styles.navItem, ...(active === item.id ? styles.navItemActive : {}) }}
              onClick={() => setActive(item.id)}
            >
              <i className={`bi ${item.icon}`} style={{...styles.navIcon, fontSize:16}}/>
              {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
              {active === item.id && <div style={styles.navIndicator} />}
            </button>
          ))}
        </nav>

        <button style={styles.refreshBtn} onClick={fetchData}>
          <i className="bi bi-arrow-clockwise"/>
          {sidebarOpen && <span>Refresh Data</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ ...styles.main, marginLeft: sidebarOpen ? 240 : 64 }}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              {NAV_ITEMS.find(n => n.id === active)?.label}
            </h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.liveIndicator}>
              <span style={styles.liveDot} />
              <span style={{ fontSize: 11, color: '#4CAF50', fontWeight: 600 }}>LIVE</span>
            </div>
            <div style={styles.topBarStat}>
              <span style={styles.topBarStatVal}>{orders.length}</span>
              <span style={styles.topBarStatLabel}>Orders</span>
            </div>
            <div style={styles.topBarStat}>
              <span style={styles.topBarStatVal}>{customers.length}</span>
              <span style={styles.topBarStatLabel}>Users</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={{ color: '#888', marginTop: 16 }}>Loading data...</p>
          </div>
        ) : (
          <div style={styles.content}>
            {active === 'dashboard' && <DashboardTab orders={orders} customers={customers}
              totalRevenue={totalRevenue} totalAdvance={totalAdvance} totalBalance={totalBalance}
              pendingCount={pendingCount} confirmedCount={confirmedCount} completedCount={completedCount}
              totalGuests={totalGuests} onViewOrder={o => { setSelectedOrder(o); setActive('orders'); }}
              onStatusChange={updateStatus} />}

            {active === 'orders' && <OrdersTab orders={filteredOrders} allOrders={orders}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
              onStatusChange={updateStatus} onPaymentRecord={recordPayment} />}

            {active === 'customers' && <CustomersTab customers={customers} orders={orders} />}

            {active === 'analytics' && <AnalyticsTab orders={orders} customers={customers}
              totalRevenue={totalRevenue} totalAdvance={totalAdvance} />}

            {active === 'reports' && <ReportsTab orders={orders} customers={customers} />}
            {active === 'payments' && <PaymentsTab orders={orders} onRefresh={fetchData} />}
            {active === 'menus'    && <MenuManagerTab />}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .admin-card { animation: fadeIn 0.3s ease; }
        .order-row:hover { background: #FFFBF0 !important; }
        .nav-btn:hover { background: rgba(212,175,55,0.1) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ orders, customers, totalRevenue, totalAdvance, totalBalance,
  pendingCount, confirmedCount, completedCount, totalGuests, onViewOrder, onStatusChange }) {

  const statCards = [
    { label: 'Registered Users',  value: customers.length, icon: 'bi-people-fill', color: '#6C63FF', sub: 'Total accounts' },
    { label: 'Total Orders',      value: orders.length,    icon: 'bi-clipboard-fill', color: GOLD, sub: 'All time' },
    { label: 'Pending',           value: pendingCount,     icon: 'bi-hourglass-split', color: '#FF9800', sub: 'Awaiting confirm' },
    { label: 'Confirmed',         value: confirmedCount,   icon: 'bi-check-circle-fill', color: '#4CAF50', sub: 'Active orders' },
    { label: 'Completed',         value: completedCount,   icon: 'bi-flag-fill', color: '#2196F3', sub: 'Done' },
    { label: 'Total Guests',      value: totalGuests.toLocaleString(), icon: 'bi-cup-hot-fill', color: '#E91E63', sub: 'Across all events' },
    { label: 'Total Order Value', value: `LKR ${(totalRevenue/1000).toFixed(0)}K`, icon: 'bi-currency-exchange', color: GOLD, sub: 'Gross revenue' },
    { label: 'Advance Collected', value: `LKR ${(totalAdvance/1000).toFixed(0)}K`, icon: 'bi-credit-card-fill', color: '#4CAF50', sub: '30% deposits' },
    { label: 'Balance Due',       value: `LKR ${(totalBalance/1000).toFixed(0)}K`, icon: 'bi-arrow-up-circle-fill', color: '#FF5722', sub: 'Outstanding' },
  ];

  const recentOrders = orders.slice(0, 6);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Stat Grid */}
      <div style={styles.statGrid}>
        {statCards.map((s, i) => (
          <div key={i} style={styles.statCard} className="admin-card">
            <div style={{ ...styles.statIcon, background: s.color + '20', color: s.color }}>
              <i className={`bi ${s.icon}`} style={{fontSize:22}}/>
            </div>
            <div style={styles.statVal}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statSub}>{s.sub}</div>
            <div style={{ ...styles.statAccent, background: s.color }} />
          </div>
        ))}
      </div>

      {/* Two columns: recent orders + event breakdown */}
      <div style={styles.dashRow}>
        <div style={{ ...styles.dashCard, flex: 2 }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Orders</h3>
            <span style={styles.cardBadge}>{orders.length} total</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>{['Order ID','Customer','Event','Date','Guests','Total','Advance','Balance','Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="order-row" style={styles.tr}
                    onClick={() => onViewOrder(o)} title="Click to view details">
                    <td style={styles.td}><span style={styles.orderId}>{o.orderId}</span></td>
                    <td style={styles.td}><strong>{o.customerName}</strong></td>
                    <td style={styles.td}>{o.eventType}</td>
                    <td style={styles.td}>{o.eventDate}</td>
                    <td style={styles.td}>{o.guestCount}</td>
                    <td style={styles.td}>LKR {(o.totalAmount||0).toLocaleString()}</td>
                    <td style={{ ...styles.td, color: '#4CAF50', fontWeight: 700 }}>LKR {(o.advancePaid||0).toLocaleString()}</td>
                    <td style={{ ...styles.td, color: '#FF5722', fontWeight: 700 }}>LKR {((o.totalAmount||0)-(o.advancePaid||0)).toLocaleString()}</td>
                    <td style={styles.td}><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event breakdown */}
        <div style={{ ...styles.dashCard, flex: 1 }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Events Breakdown</h3>
          </div>
          <EventBreakdown orders={orders} />
        </div>
      </div>
    </div>
  );
}

// ── ORDERS TAB ───────────────────────────────────────────────────────────────
function OrdersTab({ orders, allOrders, statusFilter, setStatusFilter, searchTerm, setSearchTerm,
  selectedOrder, setSelectedOrder, onStatusChange, onPaymentRecord }) {
  const [paymentInput, setPaymentInput] = useState({});

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', gap: 20 }}>
      {/* Orders list */}
      <div style={{ flex: selectedOrder ? 1 : 'unset', width: selectedOrder ? 'auto' : '100%' }}>
        {/* Filters */}
        <div style={styles.filterBar}>
          <input style={styles.searchInput} placeholder="Search by name, order ID, event..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div style={styles.statusFilters}>
            {['all','pending','confirmed','completed','cancelled'].map(s => (
              <button key={s} style={{ ...styles.filterBtn, ...(statusFilter===s ? styles.filterBtnActive : {}) }}
                onClick={() => setStatusFilter(s)}>
                {s === 'all' ? `All (${allOrders.length})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${allOrders.filter(o=>o.status===s).length})`}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.cardWrap}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>{['Order ID','Customer','Phone','Event Type','Event Date','Venue','Guests','Total Bill','Advance Paid','Balance Due','Status','Actions'].map(h=>(
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign:'center', padding:40, color:'#888' }}>No orders found</td></tr>
                )}
                {orders.map(o => {
                  const balance = (o.totalAmount||0) - (o.advancePaid||0);
                  return (
                    <tr key={o.id} className="order-row" style={styles.tr}>
                      <td style={styles.td}><span style={styles.orderId}>{o.orderId}</span></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight:700 }}>{o.customerName}</div>
                        <div style={{ fontSize:11, color:'#888' }}>{o.customerEmail}</div>
                      </td>
                      <td style={styles.td}>{o.customerPhone || '—'}</td>
                      <td style={styles.td}>{o.eventType}</td>
                      <td style={styles.td}>{o.eventDate}</td>
                      <td style={styles.td}>{o.venue || '—'}</td>
                      <td style={styles.td}>{o.guestCount}</td>
                      <td style={{ ...styles.td, fontWeight:700 }}>LKR {(o.totalAmount||0).toLocaleString()}</td>
                      <td style={{ ...styles.td, color:'#4CAF50', fontWeight:700 }}>LKR {(o.advancePaid||0).toLocaleString()}</td>
                      <td style={{ ...styles.td, color: balance>0?'#FF5722':'#4CAF50', fontWeight:700 }}>
                        LKR {balance.toLocaleString()}
                      </td>
                      <td style={styles.td}><StatusBadge status={o.status} /></td>
                      <td style={styles.td}>
                        <div style={{ display:'flex', flexDirection:'column', gap:6, minWidth:160 }}>
                          <select style={styles.selectSm} value={o.status}
                            onChange={e => onStatusChange(o.id, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <div style={{ display:'flex', gap:4 }}>
                            <button style={styles.btnSm} onClick={async () => {
                              try {
                                const fresh = await getDoc(doc(db, 'orders', o.id));
                                setSelectedOrder(fresh.exists() ? { id: fresh.id, ...fresh.data() } : o);
                              } catch { setSelectedOrder(o); }
                            }}><i className="bi bi-eye-fill"/>View</button>
                            <button style={{ ...styles.btnSm, background: DARK, color: GOLD }}
                              onClick={() => generateQuotationPDF(o, { name: o.customerName })}>PDF</button>
                            <button style={{ ...styles.btnSm, background: '#555', color: '#fff' }}
                              onClick={() => generateChefMenuPDF(o)}>Chef</button>
                          </div>
                          <div style={{ display:'flex', gap:4 }}>
                            <input style={styles.payInput} type="number"
                              placeholder="Advance LKR"
                              value={paymentInput[o.id]||''}
                              onChange={e => setPaymentInput(p=>({...p,[o.id]:e.target.value}))} />
                            <button style={{ ...styles.btnSm, background:'#4CAF50', color:'#fff' }}
                              onClick={() => { onPaymentRecord(o.id, paymentInput[o.id]); setPaymentInput(p=>({...p,[o.id]:''})); }}>
                              
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div style={styles.detailPanel}>
          <div style={styles.detailHeader}>
            <div>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', margin:0 }}>Order Details</h3>
              <span style={styles.orderId}>{selectedOrder.orderId}</span>
            </div>
            <button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}><i className="bi bi-x-lg"/></button>
          </div>

          <StatusBadge status={selectedOrder.status} large />

          <Section title="Customer Info" icon="bi-person-fill">
            <Row label="Name"    value={selectedOrder.customerName} />
            <Row label="Email"   value={selectedOrder.customerEmail} />
            <Row label="Phone"   value={selectedOrder.customerPhone || '—'} />
            <Row label="Cust ID" value={selectedOrder.customerId || '—'} />
          </Section>

          <Section title="Event Info" icon="bi-calendar-event-fill">
            <Row label="Event Type" value={selectedOrder.eventType} />
            <Row label="Event Date" value={selectedOrder.eventDate} />
            <Row label="Venue"      value={selectedOrder.venue || '—'} />
            <Row label="Guests"     value={selectedOrder.guestCount} />
          </Section>

          <Section title="Payment" icon="bi-currency-exchange">
            <Row label="Total Bill"   value={`LKR ${(selectedOrder.totalAmount||0).toLocaleString()}`} highlight />
            <Row label="Advance Paid" value={`LKR ${(selectedOrder.advancePaid||0).toLocaleString()}`} color="#4CAF50" />
            <Row label="Balance Due"  value={`LKR ${((selectedOrder.totalAmount||0)-(selectedOrder.advancePaid||0)).toLocaleString()}`} color="#FF5722" />
            <Row label="Per Person"   value={`LKR ${Math.round((selectedOrder.totalAmount||0)/(selectedOrder.guestCount||1)).toLocaleString()}`} />
          </Section>

          {/* ── Payment Slip ── */}
          <Section title="Payment Slip" icon="bi-receipt">
            {selectedOrder.paymentSlipUrl ? (
              <div>
                {/* Image preview */}
                <div style={{ border:'1px solid #eee', borderRadius:10, overflow:'hidden', background:'#f9f9f9', marginBottom:8 }}>
                  {selectedOrder.paymentSlipUrl.toLowerCase().includes('.pdf') ? (
                    <a href={selectedOrder.paymentSlipUrl} target="_blank" rel="noreferrer"
                      style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:24, textDecoration:'none' }}>
                      <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize:52, color:'#E53935', marginBottom:8 }}/>
                      <span style={{ fontSize:12, color:'#888' }}>Click to open PDF</span>
                    </a>
                  ) : (
                    <img
                      src={selectedOrder.paymentSlipUrl}
                      alt="Payment Slip"
                      title="Click to view full size"
                      style={{ width:'100%', maxHeight:260, objectFit:'contain', cursor:'zoom-in', display:'block' }}
                      onClick={() => window.open(selectedOrder.paymentSlipUrl, '_blank')}
                    />
                  )}
                </div>

                {/* File name + open link */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:11, color:'#aaa', display:'flex', alignItems:'center', gap:4 }}>
                    <i className="bi bi-paperclip" style={{ color:GOLD }}/>
                    {selectedOrder.paymentSlipName || 'payment-slip'}
                  </span>
                  <a href={selectedOrder.paymentSlipUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize:11, color:GOLD, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    <i className="bi bi-box-arrow-up-right"/>Open full size
                  </a>
                </div>

                {/* Download + Verify buttons */}
                <div style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(selectedOrder.paymentSlipUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedOrder.paymentSlipName || 'payment-slip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        toast.success('Downloading payment slip...');
                      } catch {
                        // Fallback — open in new tab if blob download fails
                        window.open(selectedOrder.paymentSlipUrl, '_blank');
                      }
                    }}
                    style={{ flex:1, padding:'8px', background:'#1A1A1A', color:GOLD, border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Jost,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <i className="bi bi-download"/>Download
                  </button>
                  {!selectedOrder.paymentVerified ? (
                    <button onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'orders', selectedOrder.id), { paymentVerified: true, status: 'confirmed' });
                        setSelectedOrder(prev => ({ ...prev, paymentVerified: true, status: 'confirmed' }));
                        toast.success('Payment verified & order confirmed!');
                      } catch { toast.error('Verification failed. Try again.'); }
                    }}
                    style={{ flex:1, padding:'8px', background:'#4CAF50', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Jost,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <i className="bi bi-check-circle-fill"/>Verify ✓
                    </button>
                  ) : (
                    <div style={{ flex:1, padding:'8px', background:'#E8F5E9', border:'1px solid #A5D6A7', borderRadius:8, fontSize:12, fontWeight:700, color:'#2E7D32', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <i className="bi bi-check-circle-fill"/>Verified ✓
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#ccc' }}>
                <i className="bi bi-receipt" style={{ fontSize:36, display:'block', marginBottom:6 }}/>
                <span style={{ fontSize:12 }}>No payment slip uploaded yet</span>
              </div>
            )}
          </Section>

          {/* Menu Items */}
          <Section title="Menu Items" icon="bi-list-ul">
            <div style={{ maxHeight: 160, overflowY: 'auto' }}>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={styles.menuItem}>
                  <span>{item.name}</span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>LKR {((item.price||0)*(selectedOrder.guestCount||1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Section>

          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button style={styles.detailBtn} onClick={() => generateQuotationPDF(selectedOrder, { name: selectedOrder.customerName })}>
              <><i className="bi bi-file-earmark-pdf-fill" style={{marginRight:6}}/>Download PDF</>
            </button>
            <button style={{ ...styles.detailBtn, background:'#555' }} onClick={() => generateChefMenuPDF(selectedOrder)}>
              <><i className="bi bi-person-badge-fill" style={{marginRight:6}}/>Chef Sheet</>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CUSTOMERS TAB ─────────────────────────────────────────────────────────────
function CustomersTab({ customers, orders }) {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c =>
    (c.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.email||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ ...styles.filterBar, marginBottom: 16 }}>
        <input style={styles.searchInput} placeholder="Search customers..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ ...styles.statCard, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:8 }}>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: '1.2rem' }}>{customers.length}</span>
          <span style={{ fontSize: 12, color: '#888' }}>Registered Users</span>
        </div>
      </div>

      <div style={styles.cardWrap}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>{['Customer ID','Name','Email','Phone','Total Orders','Total Spent','Advance Paid','Balance Due','Joined','Activity'].map(h=>(
                <th key={h} style={styles.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const cOrders = orders.filter(o => o.userId === c.uid);
                const totalSpent = cOrders.reduce((s,o)=>s+(o.totalAmount||0),0);
                const totalAdv   = cOrders.reduce((s,o)=>s+(o.advancePaid||0),0);
                const totalBal   = totalSpent - totalAdv;
                return (
                  <tr key={c.id} className="order-row" style={styles.tr}>
                    <td style={styles.td}><span style={styles.orderId}>{c.customerId||'—'}</span></td>
                    <td style={styles.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={styles.avatarSm}>{(c.name||'U')[0].toUpperCase()}</div>
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td style={styles.td}>{c.email}</td>
                    <td style={styles.td}>{c.phone||'—'}</td>
                    <td style={styles.td}><span style={styles.countBadge}>{cOrders.length}</span></td>
                    <td style={{ ...styles.td, fontWeight:700 }}>LKR {totalSpent.toLocaleString()}</td>
                    <td style={{ ...styles.td, color:'#4CAF50', fontWeight:700 }}>LKR {totalAdv.toLocaleString()}</td>
                    <td style={{ ...styles.td, color: totalBal>0?'#FF5722':'#4CAF50', fontWeight:700 }}>LKR {totalBal.toLocaleString()}</td>
                    <td style={styles.td}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    <td style={styles.td}>
                      <div style={styles.activityBar}>
                        <div style={{ ...styles.activityFill, width: `${Math.min(cOrders.length * 20, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ orders, customers, totalRevenue, totalAdvance }) {
  // Event type distribution
  const eventTypes = orders.reduce((acc,o) => { acc[o.eventType]=(acc[o.eventType]||0)+1; return acc; }, {});
  const eventEntries = Object.entries(eventTypes).sort((a,b)=>b[1]-a[1]);
  const maxEvents = Math.max(...Object.values(eventTypes), 1);

  // Monthly revenue
  const monthlyData = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    if (!isNaN(d)) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      monthlyData[key] = (monthlyData[key]||0) + (o.totalAmount||0);
    }
  });
  const monthlyEntries = Object.entries(monthlyData).sort();
  const maxMonthly = Math.max(...Object.values(monthlyData), 1);

  // Status distribution
  const statusData = {
    pending: orders.filter(o=>o.status==='pending').length,
    confirmed: orders.filter(o=>o.status==='confirmed').length,
    completed: orders.filter(o=>o.status==='completed').length,
    cancelled: orders.filter(o=>o.status==='cancelled').length,
  };
  const statusColors = { pending:'#FF9800', confirmed:'#4CAF50', completed:'#2196F3', cancelled:'#F44336' };

  // Popular items
  const itemCounts = {};
  orders.forEach(o => (o.items||[]).forEach(item => { itemCounts[item.name]=(itemCounts[item.name]||0)+1; }));
  const topItems = Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxItem = Math.max(...topItems.map(i=>i[1]),1);

  const collectionRate = totalRevenue > 0 ? Math.round((totalAdvance/totalRevenue)*100) : 0;

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Revenue', value:`LKR ${(totalRevenue/1000).toFixed(1)}K`, icon:'bi-currency-exchange', color:'#4CAF50' },
          { label:'Collected', value:`LKR ${(totalAdvance/1000).toFixed(1)}K`, icon:'bi-credit-card-fill', color:GOLD },
          { label:'Outstanding', value:`LKR ${((totalRevenue-totalAdvance)/1000).toFixed(1)}K`, icon:'bi-arrow-up-circle-fill', color:'#FF5722' },
          { label:'Collection Rate', value:`${collectionRate}%`, icon:'bi-graph-up-arrow', color:'#6C63FF' },
        ].map((k,i)=>(
          <div key={i} style={styles.kpiCard}>
            <div style={{ fontSize:28, marginBottom:8 }}><i className={`bi ${k.icon}`}/></div>
            <div style={{ fontSize:'1.6rem', fontWeight:800, color:k.color, fontFamily:'Cormorant Garamond,serif' }}>{k.value}</div>
            <div style={{ fontSize:12, color:'#888', textTransform:'uppercase', letterSpacing:1 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Monthly Revenue Chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}><i className="bi bi-bar-chart-line-fill" style={{marginRight:6}}/>Monthly Revenue (LKR)</h4>
          {monthlyEntries.length === 0 ? (
            <div style={styles.emptyChart}>No data yet</div>
          ) : (
            <div style={styles.barChart}>
              {monthlyEntries.map(([month, val]) => (
                <div key={month} style={styles.barGroup}>
                  <div style={styles.barLabel}>LKR {(val/1000).toFixed(0)}K</div>
                  <div style={styles.barWrap}>
                    <div style={{ ...styles.bar, height: `${(val/maxMonthly)*100}%`, background: `linear-gradient(to top, ${GOLD}, #f0d060)` }} />
                  </div>
                  <div style={styles.barXLabel}>{month.split('-')[1]}/{month.split('-')[0].slice(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Type Distribution */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}><i className="bi bi-pie-chart-fill" style={{marginRight:6}}/>Event Type Distribution</h4>
          {eventEntries.length === 0 ? (
            <div style={styles.emptyChart}>No data yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {eventEntries.map(([type, count]) => (
                <div key={type}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13 }}>
                    <span style={{ fontWeight:600 }}>{type}</span>
                    <span style={{ color:GOLD, fontWeight:700 }}>{count} orders</span>
                  </div>
                  <div style={styles.hBarWrap}>
                    <div style={{ ...styles.hBar, width:`${(count/maxEvents)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Status Donut */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}><i className="bi bi-donut" style={{marginRight:6}}/>Order Status Overview</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {Object.entries(statusData).map(([status, count]) => {
              const total = Object.values(statusData).reduce((a,b)=>a+b,0);
              const pct = total > 0 ? Math.round((count/total)*100) : 0;
              return (
                <div key={status}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ fontWeight:600, textTransform:'capitalize' }}>{status}</span>
                    <span style={{ color: statusColors[status], fontWeight:700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={styles.hBarWrap}>
                    <div style={{ ...styles.hBar, width:`${pct}%`, background: statusColors[status] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Items */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}><i className="bi bi-trophy-fill" style={{marginRight:6}}/>Most Ordered Items</h4>
          {topItems.length === 0 ? (
            <div style={styles.emptyChart}>No data yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {topItems.map(([name, count], i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ ...styles.rankBadge, background: i<3?GOLD:'#eee', color: i<3?DARK:'#666' }}>{i+1}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{name}</div>
                    <div style={styles.hBarWrap}>
                      <div style={{ ...styles.hBar, width:`${(count/maxItem)*100}%`, background: i<3?GOLD:'#ccc' }} />
                    </div>
                  </div>
                  <span style={{ fontSize:12, color:GOLD, fontWeight:700 }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REPORTS TAB ───────────────────────────────────────────────────────────────
function ReportsTab({ orders, customers }) {
  const now = new Date();
  const thisMonth = orders.filter(o => {
    const d = new Date(o.createdAt); return !isNaN(d) && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  });
  const lastMonth = orders.filter(o => {
    const d = new Date(o.createdAt);
    const lm = new Date(now.getFullYear(), now.getMonth()-1);
    return !isNaN(d) && d.getMonth()===lm.getMonth() && d.getFullYear()===lm.getFullYear();
  });

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
        {/* This Month */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-calendar-month-fill" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>This Month</h4>
          </div>
          <ReportRow label="New Orders"       value={thisMonth.length} />
          <ReportRow label="Revenue"          value={`LKR ${thisMonth.reduce((s,o)=>s+(o.totalAmount||0),0).toLocaleString()}`} highlight />
          <ReportRow label="Advance Collected" value={`LKR ${thisMonth.reduce((s,o)=>s+(o.advancePaid||0),0).toLocaleString()}`} />
          <ReportRow label="Total Guests"     value={thisMonth.reduce((s,o)=>s+(o.guestCount||0),0).toLocaleString()} />
          <ReportRow label="New Customers"    value={customers.filter(c=>{ const d=new Date(c.createdAt); return !isNaN(d)&&d.getMonth()===now.getMonth(); }).length} />
        </div>

        {/* Last Month */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-calendar2-week-fill" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>Last Month</h4>
          </div>
          <ReportRow label="Orders"           value={lastMonth.length} />
          <ReportRow label="Revenue"          value={`LKR ${lastMonth.reduce((s,o)=>s+(o.totalAmount||0),0).toLocaleString()}`} highlight />
          <ReportRow label="Advance Collected" value={`LKR ${lastMonth.reduce((s,o)=>s+(o.advancePaid||0),0).toLocaleString()}`} />
          <ReportRow label="Total Guests"     value={lastMonth.reduce((s,o)=>s+(o.guestCount||0),0).toLocaleString()} />
        </div>

        {/* All Time */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-bar-chart-fill" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>All Time</h4>
          </div>
          <ReportRow label="Total Orders"     value={orders.length} />
          <ReportRow label="Total Revenue"    value={`LKR ${orders.reduce((s,o)=>s+(o.totalAmount||0),0).toLocaleString()}`} highlight />
          <ReportRow label="Total Advance"    value={`LKR ${orders.reduce((s,o)=>s+(o.advancePaid||0),0).toLocaleString()}`} />
          <ReportRow label="Total Guests"     value={orders.reduce((s,o)=>s+(o.guestCount||0),0).toLocaleString()} />
          <ReportRow label="Customers"        value={customers.length} />
          <ReportRow label="Avg Order Value"  value={`LKR ${Math.round(orders.reduce((s,o)=>s+(o.totalAmount||0),0)/(orders.length||1)).toLocaleString()}`} />
        </div>

        {/* Top Events */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-balloon-fill" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>Top Events</h4>
          </div>
          {Object.entries(orders.reduce((acc,o)=>{ acc[o.eventType]=(acc[o.eventType]||0)+1; return acc; },{}))
            .sort((a,b)=>b[1]-a[1]).slice(0,6).map(([type,count])=>(
            <ReportRow key={type} label={type} value={`${count} orders`} />
          ))}
        </div>

        {/* Popular Items */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-list-stars" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>Popular Items</h4>
          </div>
          {Object.entries(orders.flatMap(o=>o.items||[]).reduce((acc,item)=>{ acc[item.name]=(acc[item.name]||0)+1; return acc; },{}))
            .sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,count])=>(
            <ReportRow key={name} label={name} value={`${count}x ordered`} />
          ))}
        </div>

        {/* Payment Status */}
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
            <i className="bi bi-credit-card-2-front-fill" style={{...styles.reportIcon, fontSize:24}}/>
            <h4 style={styles.reportTitle}>Payment Summary</h4>
          </div>
          <ReportRow label="Orders with Advance" value={orders.filter(o=>(o.advancePaid||0)>0).length} />
          <ReportRow label="Orders Pending Payment" value={orders.filter(o=>(o.advancePaid||0)===0).length} />
          <ReportRow label="Total Collected" value={`LKR ${orders.reduce((s,o)=>s+(o.advancePaid||0),0).toLocaleString()}`} highlight />
          <ReportRow label="Total Outstanding" value={`LKR ${orders.reduce((s,o)=>s+((o.totalAmount||0)-(o.advancePaid||0)),0).toLocaleString()}`} />
          <ReportRow label="Avg Advance/Order" value={`LKR ${Math.round(orders.reduce((s,o)=>s+(o.advancePaid||0),0)/(orders.length||1)).toLocaleString()}`} />
        </div>
      </div>
    </div>
  );
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────────
function StatusBadge({ status, large }) {
  const cfg = {
    pending:   { bg:'#FFF3E0', color:'#FF9800', label:'PENDING' },
    confirmed: { bg:'#E8F5E9', color:'#4CAF50', label:'CONFIRMED' },
    completed: { bg:'#E3F2FD', color:'#2196F3', label:'COMPLETED' },
    cancelled: { bg:'#FFEBEE', color:'#F44336', label:'CANCELLED' },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{ background:c.bg, color:c.color, padding: large?'6px 14px':'3px 10px',
      borderRadius:20, fontSize: large?13:11, fontWeight:700, whiteSpace:'nowrap', display:'inline-block' }}>
      {c.label}
    </span>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase',
        letterSpacing:1, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${CREAM}`, display:'flex', alignItems:'center', gap:6 }}>
        {icon && <i className={`bi ${icon}`} style={{color:'#D4AF37'}}/>}{title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, highlight, color }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13 }}>
      <span style={{ color:'#888' }}>{label}</span>
      <span style={{ fontWeight:highlight?700:500, color: color||(highlight?GOLD:DARK) }}>{value}</span>
    </div>
  );
}

function ReportRow({ label, value, highlight }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'7px 0',
      fontSize:13, borderBottom:'1px solid #f5f5f5' }}>
      <span style={{ color:'#666' }}>{label}</span>
      <strong style={{ color: highlight?GOLD:DARK }}>{value}</strong>
    </div>
  );
}

function EventBreakdown({ orders }) {
  const counts = orders.reduce((acc,o) => { acc[o.eventType]=(acc[o.eventType]||0)+1; return acc; }, {});
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const max = Math.max(...entries.map(e=>e[1]), 1);
  const colors = [GOLD,'#6C63FF','#4CAF50','#FF9800','#E91E63','#2196F3'];

  if (!entries.length) return <div style={styles.emptyChart}>No orders yet</div>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12, padding:'8px 0' }}>
      {entries.map(([type, count], i) => (
        <div key={type}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
            <span style={{ fontWeight:600 }}>{type}</span>
            <span style={{ color:colors[i%colors.length], fontWeight:700 }}>{count}</span>
          </div>
          <div style={styles.hBarWrap}>
            <div style={{ ...styles.hBar, width:`${(count/max)*100}%`, background:colors[i%colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}


// ── PAYMENTS TAB ─────────────────────────────────────────────────────────────
function PaymentsTab({ orders, onRefresh }) {
  const slipOrders = orders.filter(o => o.paymentSlipUrl || o.paymentMethod);
  const pendingVerification = orders.filter(o => o.paymentSlipUrl && !o.paymentVerified);
  const verified = orders.filter(o => o.paymentVerified);

  const verifyPayment = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentVerified: true, status: 'confirmed' });
      toast.success('Payment verified & order confirmed!');
      onRefresh();
    } catch { toast.error('Verification failed'); }
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Payments', value: slipOrders.length, icon:'bi-credit-card-fill', color:'#6C63FF' },
          { label:'Pending Verification', value: pendingVerification.length, icon:'bi-hourglass-split', color:'#FF9800' },
          { label:'Verified', value: verified.length, icon:'bi-check-circle-fill', color:'#4CAF50' },
        ].map((k,i) => (
          <div key={i} style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:k.color+'20', color:k.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              <i className={`bi ${k.icon}`}/>
            </div>
            <div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', fontWeight:700, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:1 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending verification */}
      {pendingVerification.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', marginBottom:16, color:'#FF9800' }}>
            <i className="bi bi-hourglass-split" style={{ marginRight:8 }}/>Pending Verification ({pendingVerification.length})
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {pendingVerification.map(o => (
              <SlipCard key={o.id} order={o} onVerify={verifyPayment} />
            ))}
          </div>
        </div>
      )}

      {/* All payments */}
      <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', marginBottom:16 }}>
        <i className="bi bi-list-ul" style={{ marginRight:8 }}/>All Payments ({slipOrders.length})
      </h3>
      {slipOrders.length === 0 ? (
        <div style={{ textAlign:'center', color:'#ccc', padding:60, background:'#fff', borderRadius:12 }}>
          <i className="bi bi-credit-card" style={{ fontSize:48, display:'block', marginBottom:12 }}/>
          No payments recorded yet
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {slipOrders.map(o => (
            <SlipCard key={o.id} order={o} onVerify={verifyPayment} />
          ))}
        </div>
      )}
    </div>
  );
}

function SlipCard({ order, onVerify }) {
  const advance = order.advancePaid || Math.round((order.totalAmount||0)*0.20);
  const balance = (order.totalAmount||0) - advance;

  return (
    <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
      {/* Slip preview */}
      <div style={{ flexShrink:0 }}>
        {order.paymentSlipUrl ? (
          order.paymentSlipUrl.includes('.pdf') ? (
            <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer"
              style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:100, height:100, background:'#f5f5f5', borderRadius:8, color:'#D4AF37', fontSize:12, fontWeight:700, gap:6, textDecoration:'none' }}>
              <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize:36 }}/>PDF
            </a>
          ) : (
            <img src={order.paymentSlipUrl} alt="slip"
              style={{ width:100, height:100, objectFit:'cover', borderRadius:8, cursor:'pointer', border:'1px solid #eee' }}
              onClick={() => window.open(order.paymentSlipUrl,'_blank')}
            />
          )
        ) : (
          <div style={{ width:100, height:100, background:'#f5f5f5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc' }}>
            <i className="bi bi-credit-card-fill" style={{ fontSize:36 }}/>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div>
            <span style={{ background:'#1A1A1A', color:'#D4AF37', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700 }}>{order.orderId}</span>
            <span style={{ marginLeft:8, fontWeight:700, fontSize:14 }}>{order.customerName}</span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {order.paymentVerified
              ? <span style={{ background:'#E8F5E9', color:'#2E7D32', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}><i className="bi bi-check-circle-fill" style={{ marginRight:4 }}/>Verified</span>
              : order.paymentSlipUrl
              ? <span style={{ background:'#FFF3E0', color:'#E65100', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}><i className="bi bi-hourglass-split" style={{ marginRight:4 }}/>Pending</span>
              : <span style={{ background:'#E3F2FD', color:'#1565C0', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>PayHere</span>
            }
          </div>
        </div>
        <div style={{ display:'flex', gap:16, fontSize:12, color:'#888', flexWrap:'wrap', marginBottom:10 }}>
          <span><i className="bi bi-calendar-event" style={{ marginRight:4 }}/>{order.eventDate}</span>
          <span><i className="bi bi-people-fill" style={{ marginRight:4 }}/>{order.guestCount} guests</span>
          <span><i className="bi bi-tag-fill" style={{ marginRight:4 }}/>{order.eventType}</span>
          <span><i className="bi bi-clock" style={{ marginRight:4 }}/>{order.paymentDate ? new Date(order.paymentDate).toLocaleDateString() : 'N/A'}</span>
          <span style={{ color: order.paymentMethod==='payhere'?'#6C63FF':'#FF9800', fontWeight:600 }}>
            {order.paymentMethod==='payhere' ? 'PayHere' : 'Bank Transfer'}
          </span>
        </div>
        <div style={{ display:'flex', gap:16, fontSize:13 }}>
          <span>Total: <strong>LKR {(order.totalAmount||0).toLocaleString()}</strong></span>
          <span>Advance: <strong style={{ color:'#4CAF50' }}>LKR {advance.toLocaleString()}</strong></span>
          <span>Balance: <strong style={{ color:'#FF5722' }}>LKR {balance.toLocaleString()}</strong></span>
        </div>
        {order.paymentNote && (
          <div style={{ marginTop:6, fontSize:11, color:'#aaa', fontStyle:'italic' }}>{order.paymentNote}</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        {order.paymentSlipUrl && (
          <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer"
            style={{ padding:'6px 14px', background:'#1A1A1A', color:'#D4AF37', borderRadius:8, fontSize:12, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
            <i className="bi bi-eye-fill"/>View Slip
          </a>
        )}
        {!order.paymentVerified && order.paymentSlipUrl && (
          <button onClick={() => onVerify(order.id)}
            style={{ padding:'6px 14px', background:'#4CAF50', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <i className="bi bi-check-circle-fill"/>Verify
          </button>
        )}
      </div>
    </div>
  );
}


// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = {
  root:         { display:'flex', minHeight:'100vh', background:'#F4F1E8', fontFamily:'Jost,sans-serif', paddingTop:80 },
  sidebar:      { position:'fixed', top:80, left:0, bottom:0, background:DARK, display:'flex',
                  flexDirection:'column', transition:'width 0.25s', zIndex:100, overflowX:'hidden' },
  sidebarTop:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 16px 12px' },
  sidebarLogo:  { display:'flex', alignItems:'center', gap:10 },
  logoBadge:    { width:36, height:36, background:GOLD, borderRadius:8, display:'flex', alignItems:'center',
                  justifyContent:'center', fontWeight:800, fontSize:14, color:DARK, flexShrink:0 },
  logoTitle:    { color:'#fff', fontWeight:700, fontSize:14, fontFamily:'Cormorant Garamond,serif', lineHeight:1.2 },
  logoSub:      { color:'#888', fontSize:10, textTransform:'uppercase', letterSpacing:1 },
  collapseBtn:  { background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:12, padding:4,
                  transition:'color 0.2s' },
  adminProfile: { display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderTop:'1px solid #333',
                  borderBottom:'1px solid #333', marginBottom:8 },
  adminAvatar:  { width:36, height:36, borderRadius:'50%', background:GOLD, color:DARK,
                  display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 },
  adminName:    { color:'#fff', fontSize:13, fontWeight:700 },
  adminEmail:   { color:'#888', fontSize:10, marginTop:1 },
  nav:          { flex:1, padding:'8px 8px', display:'flex', flexDirection:'column', gap:2 },
  navItem:      { display:'flex', alignItems:'center', gap:12, padding:'10px 12px', border:'none',
                  background:'none', color:'#aaa', cursor:'pointer', borderRadius:8, fontSize:13,
                  fontFamily:'Jost,sans-serif', transition:'all 0.2s', position:'relative', textAlign:'left' },
  navItemActive:{ background:'rgba(212,175,55,0.15)', color:GOLD },
  navIcon:      { fontSize:16, flexShrink:0, width:20, textAlign:'center' },
  navLabel:     { fontWeight:600 },
  navIndicator: { position:'absolute', right:0, top:'20%', bottom:'20%', width:3,
                  background:GOLD, borderRadius:'3px 0 0 3px' },
  refreshBtn:   { display:'flex', alignItems:'center', gap:8, padding:'12px 20px', background:'none',
                  border:'none', color:'#666', cursor:'pointer', fontSize:12, fontFamily:'Jost,sans-serif',
                  borderTop:'1px solid #333' },
  main:         { flex:1, transition:'margin-left 0.25s', minHeight:'100vh', display:'flex', flexDirection:'column' },
  topBar:       { background:'#fff', padding:'16px 28px', display:'flex', justifyContent:'space-between',
                  alignItems:'center', borderBottom:'1px solid #eee', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  pageTitle:    { fontFamily:'Cormorant Garamond,serif', fontSize:'1.6rem', fontWeight:700, color:DARK, margin:0 },
  pageSubtitle: { fontSize:11, color:'#888', margin:'2px 0 0', textTransform:'uppercase', letterSpacing:1 },
  topBarRight:  { display:'flex', alignItems:'center', gap:16 },
  liveIndicator:{ display:'flex', alignItems:'center', gap:6 },
  liveDot:      { width:8, height:8, borderRadius:'50%', background:'#4CAF50',
                  animation:'pulse 1.5s infinite' },
  topBarStat:   { display:'flex', flexDirection:'column', alignItems:'center', padding:'4px 12px',
                  borderLeft:'1px solid #eee' },
  topBarStatVal:{ fontWeight:800, fontSize:'1.1rem', color:GOLD, fontFamily:'Cormorant Garamond,serif' },
  topBarStatLabel:{ fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:0.5 },
  loadingWrap:  { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' },
  spinner:      { width:40, height:40, border:`3px solid ${CREAM}`, borderTopColor:GOLD,
                  borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  content:      { padding:24, flex:1 },
  statGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 },
  statCard:     { background:'#fff', borderRadius:12, padding:16, textAlign:'center',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', cursor:'default' },
  statIcon:     { width:44, height:44, borderRadius:12, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:20, margin:'0 auto 10px' },
  statVal:      { fontFamily:'Cormorant Garamond,serif', fontSize:'1.5rem', fontWeight:700, color:DARK },
  statLabel:    { fontSize:11, color:'#555', fontWeight:600, marginTop:2 },
  statSub:      { fontSize:10, color:'#aaa', marginTop:2 },
  statAccent:   { position:'absolute', bottom:0, left:0, right:0, height:3 },
  dashRow:      { display:'flex', gap:20 },
  dashCard:     { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  cardHeader:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  cardTitle:    { fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', fontWeight:700, margin:0 },
  cardBadge:    { background:CREAM, color:'#888', fontSize:11, padding:'3px 10px', borderRadius:20 },
  table:        { width:'100%', borderCollapse:'collapse' },
  th:           { background:DARK, color:GOLD, padding:'10px 12px', textAlign:'left',
                  fontSize:11, letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap' },
  tr:           { cursor:'pointer', transition:'background 0.15s' },
  td:           { padding:'10px 12px', fontSize:13, borderBottom:'1px solid #f5f5f5', whiteSpace:'nowrap' },
  orderId:      { background:DARK, color:GOLD, padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700 },
  filterBar:    { display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' },
  searchInput:  { padding:'8px 14px', border:'1px solid #ddd', borderRadius:8, fontSize:13,
                  fontFamily:'Jost,sans-serif', outline:'none', minWidth:260 },
  statusFilters:{ display:'flex', gap:6, flexWrap:'wrap' },
  filterBtn:    { padding:'6px 14px', border:'1px solid #ddd', borderRadius:20, background:'#fff',
                  fontSize:12, cursor:'pointer', fontFamily:'Jost,sans-serif', transition:'all 0.2s' },
  filterBtnActive:{ background:DARK, color:GOLD, border:`1px solid ${DARK}` },
  cardWrap:     { background:'#fff', borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' },
  selectSm:     { padding:'4px 8px', fontSize:12, border:'1px solid #ddd', borderRadius:6,
                  fontFamily:'Jost,sans-serif', cursor:'pointer' },
  btnSm:        { padding:'4px 10px', fontSize:11, border:'none', borderRadius:6, cursor:'pointer',
                  background:'#eee', color:DARK, fontWeight:600, transition:'all 0.2s', whiteSpace:'nowrap' },
  payInput:     { padding:'4px 8px', fontSize:12, border:'1px solid #ddd', borderRadius:6, width:90,
                  fontFamily:'Jost,sans-serif' },
  detailPanel:  { width:320, flexShrink:0, background:'#fff', borderRadius:12, padding:20,
                  boxShadow:'0 4px 20px rgba(0,0,0,0.1)', height:'fit-content',
                  maxHeight:'80vh', overflowY:'auto', position:'sticky', top:24 },
  detailHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  closeBtn:     { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#888', lineHeight:1 },
  menuItem:     { display:'flex', justifyContent:'space-between', padding:'5px 0',
                  borderBottom:'1px solid #f5f5f5', fontSize:12 },
  detailBtn:    { flex:1, padding:'8px', background:DARK, color:GOLD, border:'none',
                  borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'Jost,sans-serif' },
  avatarSm:     { width:28, height:28, borderRadius:'50%', background:GOLD, color:DARK,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 },
  countBadge:   { background:`${GOLD}20`, color:'#8B6914', padding:'2px 10px', borderRadius:20,
                  fontSize:12, fontWeight:700 },
  activityBar:  { width:80, height:6, background:'#f0f0f0', borderRadius:3, overflow:'hidden' },
  activityFill: { height:'100%', background:`linear-gradient(to right,${GOLD},#f0d060)`, borderRadius:3 },
  kpiCard:      { background:'#fff', borderRadius:12, padding:20, textAlign:'center',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  chartCard:    { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  chartTitle:   { fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem', fontWeight:700,
                  margin:'0 0 16px', paddingBottom:8, borderBottom:`2px solid ${GOLD}` },
  barChart:     { display:'flex', alignItems:'flex-end', gap:10, height:160, padding:'0 4px' },
  barGroup:     { display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 },
  barLabel:     { fontSize:9, color:'#888', textAlign:'center' },
  barWrap:      { width:'100%', height:120, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  bar:          { width:'100%', maxWidth:40, borderRadius:'4px 4px 0 0', transition:'height 0.5s ease', minHeight:4 },
  barXLabel:    { fontSize:10, color:'#555', fontWeight:600 },
  hBarWrap:     { height:8, background:'#f0f0f0', borderRadius:4, overflow:'hidden' },
  hBar:         { height:'100%', background:`linear-gradient(to right,${GOLD},#f0d060)`,
                  borderRadius:4, transition:'width 0.5s ease' },
  rankBadge:    { width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0 },
  emptyChart:   { textAlign:'center', color:'#ccc', padding:40, fontSize:13 },
  reportCard:   { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  reportHeader: { display:'flex', alignItems:'center', gap:10, marginBottom:16,
                  paddingBottom:10, borderBottom:`2px solid ${GOLD}` },
  reportIcon:   { fontSize:24 },
  reportTitle:  { fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem', fontWeight:700, margin:0 },
};