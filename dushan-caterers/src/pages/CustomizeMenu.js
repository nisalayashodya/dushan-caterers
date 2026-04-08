// src/pages/CustomizeMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { menuCategories, eventPackages, eventTypes } from '../utils/menuData';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { getMenuRecommendation } from '../utils/gemini';
import toast from 'react-hot-toast';


const ADVANCE_PERCENT = 0.30;

export default function CustomizeMenu() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState({ eventType: '', eventDate: '', guestCount: 50, venue: '' });
  const [selectedItems, setSelectedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [aiSuggested, setAiSuggested] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalAmount = Object.values(selectedItems).reduce(
    (sum, item) => sum + item.price * (item.unit === 'each' ? (item.quantity || eventDetails.guestCount) : eventDetails.guestCount), 0
  );
  const advanceAmount = Math.round(totalAmount * ADVANCE_PERCENT);

  const toggleItem = (item, catName) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[item.id]) {
        delete newItems[item.id];
      } else {
        newItems[item.id] = { ...item, categoryName: catName };
      }
      return newItems;
    });
  };

  const getAIRecommendation = async () => {
    setAiLoading(true);
    setAiMessage('Dushi AI is analyzing your event...');
    setAiSuggested(false);

    // Build flat list of all menu items for Gemini
    const allItems = menuCategories.flatMap(cat =>
      cat.items.map(item => ({ ...item, category: cat.name }))
    );

    try {
      const result = await getMenuRecommendation({
        eventType:    eventDetails.eventType || 'General Event',
        guestCount:   eventDetails.guestCount,
        budget:       Math.round(totalAmount / (eventDetails.guestCount || 1)) || 1000,
        dietaryNeeds: 'None specified',
        menuItems:    allItems,
      });

      if (result && result.recommendedItems && result.recommendedItems.length > 0) {
        // Match Gemini's recommendations to actual menu items
        const newItems = {};
        result.recommendedItems.forEach(recName => {
          menuCategories.forEach(cat => {
            const match = cat.items.find(i =>
              i.name.toLowerCase().includes(recName.toLowerCase()) ||
              recName.toLowerCase().includes(i.name.toLowerCase())
            );
            if (match) newItems[match.id] = { ...match, categoryName: cat.name };
          });
        });

        if (Object.keys(newItems).length > 0) {
          setSelectedItems(newItems);
          setAiSuggested(true);
          setAiMessage(`${result.reasoning || 'AI recommendations applied!'} ${result.tips || ''}`);
          toast.success('Gemini AI recommendations applied!');
        } else {
          // Fallback to rule-based if no matches found
          fallbackRecommendation();
        }
      } else {
        fallbackRecommendation();
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
      fallbackRecommendation();
    }

    setAiLoading(false);
  };

  // Fallback rule-based recommendation if Gemini fails
  const fallbackRecommendation = () => {
    const budget = totalAmount / (eventDetails.guestCount || 50);
    const pkg = eventPackages.find(p => {
      if (budget < 800) return p.id === 'pkg-budget';
      if (budget < 1500) return p.id === 'pkg-standard';
      return p.id === 'pkg-premium';
    }) || eventPackages[1];

    const newItems = {};
    pkg.recommended.forEach(recId => {
      menuCategories.forEach(cat => {
        const item = cat.items.find(i => i.id === recId);
        if (item) newItems[item.id] = { ...item, categoryName: cat.name };
      });
    });
    setSelectedItems(newItems);
    setAiSuggested(true);
    setAiMessage('Recommendations applied based on your event package.');
    toast.success('Recommendations applied!');
  };

  const handleSubmit = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (Object.keys(selectedItems).length === 0) { toast.error('Please select at least one menu item.'); return; }
    setSubmitting(true);
    try {
      const orderData = {
        userId: currentUser.uid,
        customerName: currentUser.displayName,
        customerEmail: currentUser.email,
        ...eventDetails,
        items: Object.values(selectedItems),
        totalAmount,
        advancePaid: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderId: 'DC-' + Date.now().toString().slice(-8)
      };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderRef(orderData.orderId);
      setSubmitted(true);
      toast.success('Order submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit order. Please try again.');
    }
    setSubmitting(false);
  };

  const downloadPDF = () => {
    generateQuotationPDF({
      ...eventDetails,
      items: Object.values(selectedItems),
      totalAmount,
      advancePaid: 0
    }, { name: currentUser?.displayName || 'Customer' });
  };

  if (submitted) {
    return (
      <div style={{ paddingTop: 120, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 500, padding: '40px 20px' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}><i className="bi bi-check-circle-fill" style={{color:'#4CAF50'}}/></div>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', marginBottom: 12 }}>Order Submitted!</h2>
          <p style={{ color: '#888', marginBottom: 8 }}>Order Reference: <strong>{orderRef}</strong></p>
          <p style={{ color: '#888', marginBottom: 24 }}>Advance Payment Required: <strong>LKR {advanceAmount.toLocaleString()}</strong> (30%)</p>
          <p style={{ color: '#555', marginBottom: 32, lineHeight: 1.7 }}>
            Our team will contact you within 24 hours to confirm your booking. You can view and pay for your order in the dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={downloadPDF}><i className="bi bi-file-earmark-pdf-fill me-1"/>Download Quote PDF</button>
            <button className="btn btn-dark" onClick={() => navigate('/dashboard')}><i className="bi bi-grid-fill me-1"/>View My Orders</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="page-header">
        <h1>Customize <span>Your Menu</span></h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 13, letterSpacing: 2 }}>
          BUILD YOUR PERFECT CATERING EXPERIENCE
        </p>
      </div>

      {/* Progress Steps */}
      <div className="container" style={{ padding: '30px 20px 0' }}>
        <div className="steps-bar">
          {[{ n: 1, label: 'Event Details' }, { n: 2, label: 'Select Menu' }, { n: 3, label: 'Review & Submit' }].map(s => (
            <div key={s.n} className={`step-item ${step >= s.n ? 'active' : ''} ${step === s.n ? 'current' : ''}`}>
              <div className="step-num">{s.n}</div>
              <div className="step-label">{s.label}</div>
              {s.n < 3 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '20px' }}>
        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="step-content">
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', marginBottom: 24 }}>Tell us about your event</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select className="form-control" value={eventDetails.eventType} onChange={e => setEventDetails({ ...eventDetails, eventType: e.target.value })}>
                  <option value="">Select event type...</option>
                  {eventTypes.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]}
                  value={eventDetails.eventDate} onChange={e => setEventDetails({ ...eventDetails, eventDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Guests *</label>
                <input type="number" className="form-control" min="10" max="5000"
                  value={eventDetails.guestCount} onChange={e => setEventDetails({ ...eventDetails, guestCount: parseInt(e.target.value) || 50 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Venue / Location</label>
                <input type="text" className="form-control" placeholder="Event venue or address"
                  value={eventDetails.venue} onChange={e => setEventDetails({ ...eventDetails, venue: e.target.value })} />
              </div>
            </div>

            {/* Package Suggestions */}
            <h4 style={{ marginTop: 32, marginBottom: 16, fontFamily: 'Cormorant Garamond', fontSize: '1.4rem' }}>Choose a Package (Optional)</h4>
            <div className="packages-grid">
              {eventPackages.map(pkg => (
                <div key={pkg.id} className="package-card" onClick={() => {
                  const newItems = {};
                  pkg.recommended.forEach(recId => {
                    menuCategories.forEach(cat => {
                      const item = cat.items.find(i => i.id === recId);
                      if (item) newItems[item.id] = { ...item, categoryName: cat.name };
                    });
                  });
                  setSelectedItems(newItems);
                  toast.success(`${pkg.name} applied!`);
                }}>
                  <div className="pkg-icon">{pkg.icon}</div>
                  <h4>{pkg.name}</h4>
                  <div className="pkg-price">{pkg.priceRange}</div>
                  <p>{pkg.description}</p>
                  <div className="pkg-guests">Min. {pkg.minGuests} guests</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32 }}>
              <button className="btn btn-gold"
                disabled={!eventDetails.eventType || !eventDetails.eventDate || !eventDetails.guestCount}
                onClick={() => setShowConfirmModal(true)}>
                Continue to Menu Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Menu Selection */}
        {step === 2 && (
          <div className="step-content">
            <div className="menu-builder-header">
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.8rem' }}>Select Menu Items</h3>
              <button className="btn btn-dark btn-sm" onClick={getAIRecommendation} disabled={aiLoading}>
                {aiLoading ? <><i className="bi bi-hourglass-split me-1"/>Thinking...</> : <><i className="bi bi-stars me-1"/>AI Recommend</>}
              </button>
            </div>
            {aiSuggested && aiMessage && <div className="ai-note">{aiMessage}</div>}
            {aiLoading && <div className="ai-note"><i className="bi bi-robot" style={{marginRight:6}}/>Dushi AI is analyzing your event type and guest count to find the perfect menu combination...</div>}

            <div className="menu-builder">
              {/* Category Tabs */}
              <div className="category-tabs">
                {menuCategories.map(cat => (
                  <button key={cat.id} className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Items */}
              <div className="items-list">
                {menuCategories.find(c => c.id === activeCategory)?.items.map(item => (
                  <div key={item.id}
                    className={`item-row ${selectedItems[item.id] ? 'selected' : ''}`}
                    onClick={() => toggleItem(item, menuCategories.find(c => c.id === activeCategory)?.name)}>
                    <div className="item-check"><i className={selectedItems[item.id] ? 'bi bi-check-lg' : 'bi bi-plus-lg'}/></div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-desc-small">{item.description}</div>
                      {item.dietary?.length > 0 && <div className="item-dietary">{item.dietary.join(' • ')}</div>}
                    </div>
                    <div className="item-price-col">
                      <div className="item-price">LKR {item.price.toLocaleString()}</div>
                      <div className="item-unit">{item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Preview */}
              <div className="bill-preview">
                <h4><i className="bi bi-bar-chart-fill me-1"/>Real-Time Bill Preview</h4>
                <div className="bill-event">{eventDetails.eventType} • {eventDetails.guestCount} Guests</div>
                {Object.values(selectedItems).length === 0 ? (
                  <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>Select items to see your bill</p>
                ) : (
                  <>
                    <div className="bill-items">
                      {Object.values(selectedItems).map(item => (
                        <div key={item.id} className="bill-row">
                          <span>{item.name}</span>
                          <span>LKR {(item.price * eventDetails.guestCount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bill-divider" />
                    <div className="bill-total">
                      <span>Total</span>
                      <span>LKR {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="bill-advance">
                      <span>Advance (30%)</span>
                      <span>LKR {advanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="bill-per-person">
                      Per person: LKR {Math.round(totalAmount / eventDetails.guestCount).toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}><i className="bi bi-arrow-left me-1"/>Back</button>
              <button className="btn btn-gold" disabled={Object.keys(selectedItems).length === 0} onClick={() => setStep(3)}>
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="step-content">
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.8rem', marginBottom: 24 }}>Review Your Order</h3>
            <div className="grid-2" style={{ gap: 32 }}>
              <div>
                <div className="review-section">
                  <h4>Event Details</h4>
                  <div className="review-row"><span>Event Type</span><strong>{eventDetails.eventType}</strong></div>
                  <div className="review-row"><span>Date</span><strong>{eventDetails.eventDate}</strong></div>
                  <div className="review-row"><span>Guests</span><strong>{eventDetails.guestCount}</strong></div>
                  <div className="review-row"><span>Venue</span><strong>{eventDetails.venue || 'TBC'}</strong></div>
                </div>

                <div className="review-section" style={{ marginTop: 20 }}>
                  <h4>Selected Items ({Object.keys(selectedItems).length})</h4>
                  {Object.values(selectedItems).map(item => (
                    <div key={item.id} className="review-row">
                      <span>{item.name}</span>
                      <strong>LKR {(item.price * eventDetails.guestCount).toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="final-bill">
                  <h4><i className="bi bi-receipt me-1"/>Final Quotation</h4>
                  <div className="fb-row"><span>Subtotal</span><span>LKR {totalAmount.toLocaleString()}</span></div>
                  <div className="fb-row"><span>Per Person</span><span>LKR {Math.round(totalAmount / eventDetails.guestCount).toLocaleString()}</span></div>
                  <div className="fb-divider" />
                  <div className="fb-total"><span>Total Amount</span><span>LKR {totalAmount.toLocaleString()}</span></div>
                  <div className="fb-advance"><span>Advance Required (30%)</span><span>LKR {advanceAmount.toLocaleString()}</span></div>
                  <div className="fb-note">Balance of LKR {(totalAmount - advanceAmount).toLocaleString()} due on event day</div>

                  {!currentUser && (
                    <div className="login-prompt">
                      <p>Please login to submit your order and pay the advance.</p>
                      <button className="btn btn-gold btn-sm" onClick={() => navigate('/login')}>Login to Continue</button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-outline" style={{ width: '100%', marginBottom: 10 }} onClick={downloadPDF}>
                    <><i className="bi bi-file-earmark-pdf-fill" style={{marginRight:6}}/>Download Quote as PDF</>
                  </button>
                  <button className="btn btn-gold" style={{ width: '100%' }}
                    disabled={submitting || !currentUser}
                    onClick={handleSubmit}>
                    {submitting ? <><i className="bi bi-hourglass-split me-1"/>Submitting...</> : <><i className="bi bi-check-circle-fill me-1"/>Submit Order & Pay Advance</>}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}><i className="bi bi-arrow-left me-1"/>Edit Menu</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Event Details Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="confirm-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="confirm-modal-header">
              <div className="confirm-icon">📋</div>
              <h3>Confirm Your Event Details</h3>
              <p>Please review the information below before continuing.</p>
            </div>

            {/* Details */}
            <div className="confirm-details">
              <div className="confirm-row">
                <div className="confirm-label">
                  <i className="bi bi-calendar-event-fill" /> Event Type
                </div>
                <div className="confirm-value">{eventDetails.eventType}</div>
              </div>
              <div className="confirm-row">
                <div className="confirm-label">
                  <i className="bi bi-calendar-check-fill" /> Event Date
                </div>
                <div className="confirm-value">
                  {new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
              <div className="confirm-row">
                <div className="confirm-label">
                  <i className="bi bi-people-fill" /> Number of Guests
                </div>
                <div className="confirm-value">{eventDetails.guestCount} guests</div>
              </div>
              <div className="confirm-row">
                <div className="confirm-label">
                  <i className="bi bi-geo-alt-fill" /> Venue / Location
                </div>
                <div className="confirm-value">{eventDetails.venue || <span style={{color:'#aaa',fontStyle:'italic'}}>Not specified</span>}</div>
              </div>
            </div>

            <p className="confirm-note">
              <i className="bi bi-info-circle me-1" />
              You can go back and edit these details if anything looks incorrect.
            </p>

            {/* Actions */}
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirmModal(false)}>
                <i className="bi bi-arrow-left me-1" /> Go Back & Edit
              </button>
              <button className="btn btn-gold" onClick={() => { setShowConfirmModal(false); setStep(2); }}>
                <i className="bi bi-check-circle-fill me-1" /> Yes, Looks Good!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .steps-bar { display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
        .step-item { display: flex; align-items: center; gap: 8px; }
        .step-num {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--cream-dark);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
          transition: all 0.3s;
        }
        .step-item.active .step-num { background: var(--gold); color: var(--dark); }
        .step-label { font-size: 13px; font-weight: 600; color: #aaa; }
        .step-item.active .step-label { color: var(--dark); }
        .step-line { width: 60px; height: 2px; background: var(--cream-dark); margin: 0 8px; }
        .step-content { max-width: 900px; }
        .packages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .package-card {
          border: 2px solid var(--cream-dark);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .package-card:hover { border-color: var(--gold); transform: translateY(-3px); }
        .pkg-icon { font-size: 36px; margin-bottom: 10px; }
        .package-card h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; margin-bottom: 4px; }
        .pkg-price { color: var(--gold); font-weight: 700; font-size: 13px; margin-bottom: 8px; }
        .package-card p { font-size: 12px; color: #888; line-height: 1.5; }
        .pkg-guests { margin-top: 10px; font-size: 11px; color: #aaa; }
        .menu-builder-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .ai-note { background: #FFF9E6; border: 1px solid #D4AF37; border-radius: 8px; padding: 10px 16px; font-size: 13px; margin-bottom: 16px; }
        .menu-builder { display: grid; grid-template-columns: 180px 1fr 260px; gap: 20px; min-height: 500px; }
        .category-tabs { display: flex; flex-direction: column; gap: 4px; }
        .cat-tab {
          padding: 12px 14px;
          border: none;
          border-radius: 8px;
          background: none;
          text-align: left;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .cat-tab:hover, .cat-tab.active { background: var(--gold); color: var(--dark); }
        .items-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; max-height: 520px; padding-right: 8px; }
        .item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 2px solid var(--cream-dark);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .item-row:hover { border-color: var(--gold); }
        .item-row.selected { border-color: var(--gold); background: #FFFBF0; }
        .item-check {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--cream-dark);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .item-row.selected .item-check { background: var(--gold); color: var(--dark); }
        .item-info { flex: 1; }
        .item-name { font-weight: 600; font-size: 14px; }
        .item-desc-small { font-size: 11px; color: #888; margin-top: 2px; }
        .item-dietary { font-size: 10px; color: #4CAF50; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .item-price-col { text-align: right; }
        .item-price { font-weight: 700; font-size: 14px; }
        .item-unit { font-size: 10px; color: #aaa; }
        .bill-preview {
          background: var(--dark);
          border-radius: 12px;
          padding: 20px;
          color: white;
          position: sticky;
          top: 120px;
          max-height: 520px;
          overflow-y: auto;
        }
        .bill-preview h4 { font-family: 'Cormorant Garamond', serif; color: var(--gold); font-size: 1.2rem; margin-bottom: 6px; }
        .bill-event { font-size: 11px; color: #666; margin-bottom: 12px; }
        .bill-items { margin-bottom: 12px; }
        .bill-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; color: #ccc; }
        .bill-divider { border-top: 1px solid #333; margin: 10px 0; }
        .bill-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 15px; color: white; }
        .bill-advance { display: flex; justify-content: space-between; font-size: 13px; color: var(--gold); margin-top: 8px; padding: 8px; background: rgba(212,175,55,0.1); border-radius: 6px; }
        .bill-per-person { text-align: center; font-size: 11px; color: #666; margin-top: 10px; }
        .review-section { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .review-section h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--cream-dark); }
        .review-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid var(--cream); }
        .review-row span { color: #888; }
        .final-bill { background: var(--dark); border-radius: 12px; padding: 24px; color: white; }
        .final-bill h4 { font-family: 'Cormorant Garamond', serif; color: var(--gold); font-size: 1.3rem; margin-bottom: 16px; }
        .fb-row { display: flex; justify-content: space-between; font-size: 14px; color: #888; padding: 6px 0; }
        .fb-divider { border-top: 1px solid #333; margin: 12px 0; }
        .fb-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; color: white; margin-bottom: 10px; }
        .fb-advance { display: flex; justify-content: space-between; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); padding: 10px; border-radius: 8px; color: var(--gold); font-size: 14px; margin-bottom: 10px; }
        .fb-note { font-size: 11px; color: #666; text-align: center; margin-bottom: 16px; }
        .login-prompt { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 14px; text-align: center; margin-top: 12px; }
        .login-prompt p { font-size: 13px; color: #aaa; margin-bottom: 10px; }
        @media (max-width: 768px) {
          .menu-builder { grid-template-columns: 1fr; }
          .category-tabs { flex-direction: row; flex-wrap: wrap; }
          .packages-grid { grid-template-columns: 1fr; }
        }
        /* ── Confirmation Modal ── */
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .confirm-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .confirm-modal-header {
          background: var(--dark);
          padding: 28px 28px 24px;
          text-align: center;
        }
        .confirm-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        .confirm-modal-header h3 {
          font-family: 'Cormorant Garamond', serif;
          color: white;
          font-size: 1.6rem;
          margin-bottom: 6px;
        }
        .confirm-modal-header p {
          color: #888;
          font-size: 13px;
        }
        .confirm-details {
          padding: 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          gap: 16px;
        }
        .confirm-row:last-child { border-bottom: none; }
        .confirm-label {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .confirm-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--dark);
          text-align: right;
        }
        .confirm-note {
          margin: 0 28px 4px;
          padding: 10px 14px;
          background: #FFF9E6;
          border: 1px solid #D4AF37;
          border-radius: 8px;
          font-size: 12px;
          color: #888;
        }
        .confirm-actions {
          display: flex;
          gap: 10px;
          padding: 20px 28px 28px;
        }
        .confirm-actions .btn { flex: 1; justify-content: center; }
      `}</style>
    </div>
  );
}