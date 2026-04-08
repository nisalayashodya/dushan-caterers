// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const STATUS_COLORS = { pending:'warning', confirmed:'success', completed:'info', cancelled:'danger' };

export default function Dashboard() {
  const { currentUser }                   = useAuth();
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [payingOrder, setPayingOrder]     = useState(null);

  const fetchOrders = async () => {
    if (!currentUser) return;
    try {
      const q    = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [currentUser]);

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center' }}><div className="spinner" /></div>;

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="page-header">
        <h1>My <span>Dashboard</span></h1>
        <p style={{ color:'#888', marginTop:8, fontSize:13, letterSpacing:2 }}>MANAGE YOUR CATERING ORDERS</p>
      </div>

      <div className="container" style={{ padding:'40px 20px' }}>
        <div className="welcome-card">
          <div className="welcome-avatar">{currentUser?.displayName?.[0] || 'U'}</div>
          <div>
            <h3>Welcome back, {currentUser?.displayName}!</h3>
            <p>{currentUser?.email}</p>
          </div>
          <Link to="/customize" className="btn btn-gold btn-sm" style={{ marginLeft:'auto' }}>
            <i className="bi bi-plus-circle-fill" style={{ marginRight:6 }} />New Order
          </Link>
        </div>

        <div className="dash-stats">
          {[
            { val: orders.length, label: 'Total Orders' },
            { val: orders.filter(o=>o.status==='confirmed').length, label: 'Confirmed' },
            { val: orders.filter(o=>o.status==='pending').length, label: 'Pending' },
            { val: `LKR ${orders.reduce((s,o)=>s+(o.totalAmount||0),0).toLocaleString()}`, label: 'Total Value' },
          ].map((s,i) => (
            <div key={i} className="dash-stat">
              <div className="ds-val">{s.val}</div>
              <div className="ds-label">{s.label}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily:'Cormorant Garamond', fontSize:'1.8rem', marginBottom:20 }}>My Orders</h3>

        {orders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-cup-hot" style={{ fontSize:60, color:'#D4AF37' }} />
            <h3>No orders yet</h3>
            <p>Start customizing your menu for your next event!</p>
            <Link to="/customize" className="btn btn-gold" style={{ marginTop:16 }}>Customize Menu</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const advance      = Math.round((order.totalAmount||0) * 0.30);
              const balance      = (order.totalAmount||0) - (order.advancePaid||0);
              const needsPayment = order.status !== 'cancelled' && !(order.advancePaid > 0);
              const slipUploaded = !!order.paymentSlipUrl;

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-id">{order.orderId}</div>
                      <div className="order-event">{order.eventType}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                      <span className={`badge badge-${STATUS_COLORS[order.status]||'warning'}`}>{order.status?.toUpperCase()}</span>
                      {slipUploaded && (
                        <span style={{ background:'#E8F5E9', color:'#2E7D32', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>
                          <i className="bi bi-check-circle-fill" style={{ marginRight:4 }} />Slip Uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-info">
                      <span><i className="bi bi-calendar-event" style={{ marginRight:4 }} />{order.eventDate}</span>
                      <span><i className="bi bi-people-fill" style={{ marginRight:4 }} />{order.guestCount} guests</span>
                      <span><i className="bi bi-geo-alt-fill" style={{ marginRight:4 }} />{order.venue||'TBC'}</span>
                      <span><i className="bi bi-list-ul" style={{ marginRight:4 }} />{order.items?.length||0} items</span>
                      {order.paymentMethod && (
                        <span style={{ color:'#4CAF50' }}>
                          <i className="bi bi-credit-card-fill" style={{ marginRight:4 }} />
                          {order.paymentMethod==='payhere' ? 'Paid via PayHere' : 'Bank Transfer'}
                        </span>
                      )}
                    </div>
                    <div className="order-amounts">
                      <div className="order-total"><span>Total</span><strong>LKR {(order.totalAmount||0).toLocaleString()}</strong></div>
                      <div className="order-advance"><span>Advance Paid</span><strong style={{ color:'#4CAF50' }}>LKR {(order.advancePaid||0).toLocaleString()}</strong></div>
                      <div className="order-balance"><span>Balance</span><strong style={{ color: balance>0?'#E53935':'#4CAF50' }}>LKR {balance.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  {/* Balance note — shown after advance is paid */}
                  {(order.advancePaid||0) > 0 && balance > 0 && (
                    <div style={{ background:'#FFF8E7', border:'1px solid #D4AF3750', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#7B5800', display:'flex', alignItems:'center', marginTop:10, gap:6 }}>
                      <i className="bi bi-info-circle-fill" style={{ color:'#D4AF37', flexShrink:0 }} />
                      Please do the necessary balance payment of <strong style={{ margin:'0 4px' }}>LKR {balance.toLocaleString()}</strong> after the event.
                    </div>
                  )}

                  <div className="order-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedOrder(order)}>
                      <i className="bi bi-eye-fill" style={{ marginRight:4 }} />View Details
                    </button>
                    <button className="btn btn-dark btn-sm" onClick={() => generateQuotationPDF(order, { name: currentUser?.displayName })}>
                      <i className="bi bi-file-earmark-pdf-fill" style={{ marginRight:4 }} />Download Quote
                    </button>
                    {needsPayment && (
                      <button className="btn btn-gold btn-sm" onClick={() => setPayingOrder(order)}>
                        <i className="bi bi-credit-card-fill" style={{ marginRight:4 }} />Pay Advance — LKR {advance.toLocaleString()}
                      </button>
                    )}
                    {slipUploaded && (
                      <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-sm" style={{ color:'#4CAF50', borderColor:'#4CAF50' }}>
                        <i className="bi bi-file-image" style={{ marginRight:4 }} />View Slip
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details – {selectedOrder.orderId}</h3>
              <button onClick={() => setSelectedOrder(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Event Information</h4>
                {[['Event Type',selectedOrder.eventType],['Date',selectedOrder.eventDate],['Guests',selectedOrder.guestCount],['Venue',selectedOrder.venue||'TBC']].map(([l,v])=>(
                  <div key={l} className="detail-row"><span>{l}</span><strong>{v}</strong></div>
                ))}
                <div className="detail-row"><span>Status</span>
                  <span className={`badge badge-${STATUS_COLORS[selectedOrder.status]}`}>{selectedOrder.status?.toUpperCase()}</span>
                </div>
              </div>
              <div className="detail-section">
                <h4>Payment</h4>
                <div className="detail-row"><span>Total Amount</span><strong>LKR {(selectedOrder.totalAmount||0).toLocaleString()}</strong></div>
                <div className="detail-row"><span>Advance (30%)</span><strong style={{ color:'#4CAF50' }}>LKR {(selectedOrder.advancePaid||0).toLocaleString()}</strong></div>
                <div className="detail-row"><span>Balance Due</span><strong style={{ color:'#E53935' }}>LKR {((selectedOrder.totalAmount||0)-(selectedOrder.advancePaid||0)).toLocaleString()}</strong></div>
                {selectedOrder.paymentMethod && <div className="detail-row"><span>Method</span><strong>{selectedOrder.paymentMethod==='payhere'?'PayHere Online':'Bank Transfer'}</strong></div>}
                {selectedOrder.paymentSlipUrl && (
                  <div className="detail-row"><span>Payment Slip</span>
                    <a href={selectedOrder.paymentSlipUrl} target="_blank" rel="noreferrer" style={{ color:'#D4AF37', fontWeight:700 }}>View Slip</a>
                  </div>
                )}
              </div>
              <div className="detail-section">
                <h4>Menu Items</h4>
                {selectedOrder.items?.map((item,i)=>(
                  <div key={i} className="detail-row"><span>{item.name}</span><strong>LKR {(item.price*selectedOrder.guestCount).toLocaleString()}</strong></div>
                ))}
                <div className="detail-row" style={{ borderTop:'2px solid var(--gold)', marginTop:10, paddingTop:10 }}>
                  <strong>Total</strong><strong style={{ color:'var(--gold)' }}>LKR {selectedOrder.totalAmount?.toLocaleString()}</strong>
                </div>
              </div>
              {(selectedOrder.advancePaid||0)>0 && ((selectedOrder.totalAmount||0)-(selectedOrder.advancePaid||0))>0 && (
                <div style={{ background:'#FFF8E7', border:'1px solid #D4AF37', borderRadius:8, padding:12, fontSize:13, color:'#7B5800', display:'flex', gap:8, alignItems:'center' }}>
                  <i className="bi bi-info-circle-fill" />
                  Please do the necessary balance payment of <strong style={{ marginLeft:4 }}>LKR {((selectedOrder.totalAmount||0)-(selectedOrder.advancePaid||0)).toLocaleString()}</strong> after the event.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-gold" onClick={() => generateQuotationPDF(selectedOrder, { name: currentUser?.displayName })}>
                <i className="bi bi-file-earmark-pdf-fill" style={{ marginRight:6 }} />Download PDF
              </button>
              <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          currentUser={currentUser}
          onClose={() => setPayingOrder(null)}
          onPaymentSuccess={() => { setPayingOrder(null); fetchOrders(); }}
        />
      )}

      <style>{`
        .welcome-card{background:white;border-radius:12px;padding:24px;display:flex;align-items:center;gap:16px;margin-bottom:24px;box-shadow:0 2px 12px rgba(0,0,0,0.07)}
        .welcome-avatar{width:52px;height:52px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:var(--dark)}
        .welcome-card h3{font-family:'Cormorant Garamond',serif;font-size:1.3rem}
        .welcome-card p{font-size:13px;color:#888}
        .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
        .dash-stat{background:white;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
        .ds-val{font-family:'Cormorant Garamond',serif;font-size:2rem;color:var(--gold);font-weight:600}
        .ds-label{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px}
        .empty-state{text-align:center;padding:60px 0}
        .empty-state h3{font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin:16px 0 8px}
        .empty-state p{color:#888}
        .orders-list{display:flex;flex-direction:column;gap:16px}
        .order-card{background:white;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.07);border-left:4px solid var(--gold)}
        .order-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
        .order-id{font-size:12px;color:#888;font-weight:600;letter-spacing:1px}
        .order-event{font-family:'Cormorant Garamond',serif;font-size:1.3rem;margin-top:2px}
        .order-body{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
        .order-info{display:flex;gap:20px;font-size:13px;color:#666;flex-wrap:wrap}
        .order-amounts{display:flex;gap:20px}
        .order-total,.order-advance,.order-balance{text-align:center}
        .order-total span,.order-advance span,.order-balance span{display:block;font-size:11px;color:#aaa;margin-bottom:2px}
        .order-total strong,.order-advance strong,.order-balance strong{font-size:15px;display:block}
        .order-actions{display:flex;gap:10px;margin-top:14px;padding-top:14px;border-top:1px solid var(--cream-dark);flex-wrap:wrap;align-items:center}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal-box{background:white;border-radius:16px;width:100%;max-width:560px;max-height:80vh;overflow-y:auto}
        .modal-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:2px solid var(--cream-dark)}
        .modal-header h3{font-family:'Cormorant Garamond',serif;font-size:1.3rem}
        .modal-header button{background:none;border:none;font-size:20px;cursor:pointer;color:#888}
        .modal-body{padding:24px}
        .detail-section{margin-bottom:20px}
        .detail-section h4{font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:var(--gold);margin-bottom:10px}
        .detail-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--cream);font-size:14px}
        .detail-row span{color:#888}
        .modal-footer{padding:16px 24px;border-top:1px solid var(--cream-dark);display:flex;gap:10px;justify-content:flex-end}
        @media(max-width:768px){.dash-stats{grid-template-columns:repeat(2,1fr)}.order-body{flex-direction:column}}
      `}</style>
    </div>
  );
}