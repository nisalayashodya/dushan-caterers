// src/pages/Contact.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventType: '', guests: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate email send (integrate EmailJS for real sending)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent! We will contact you soon.');
    }, 1500);
  };

  return (
    <div style={{ paddingTop: 100 }}>
      <div className="page-header">
        <h1>Contact <span>Us</span></h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 13, letterSpacing: 2 }}>GET IN TOUCH WITH DUSHAN CATERERS</p>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', marginBottom: 8 }}>Let's Plan Your Perfect Event</h2>
            <div className="gold-line"></div>
            <p style={{ color: '#555', marginBottom: 32, lineHeight: 1.8 }}>
              Ready to create an unforgettable experience? Our catering team is here to help you plan the perfect menu for your special occasion. Reach out through any of the channels below.
            </p>

            {[
              { icon: 'bi-telephone-fill', label: 'Phone', value: '0777 510 513', sub: 'Mon–Sun, 8:00AM – 5:00PM' },
              { icon: 'bi-envelope-fill', label: 'Email', value: 'dushan@dushancaterers.lk', sub: 'We reply within 24 hours' },
              { icon: 'bi-whatsapp', label: 'WhatsApp', value: '0777 510 513', sub: 'Quick responses available' },
              { icon: 'bi-geo-alt-fill', label: 'Location', value: 'Sri Lanka', sub: 'Serving island-wide' }
            ].map((c, i) => (
              <div key={i} className="contact-item">
                <div className="contact-icon"><i className={`bi ${c.icon}`} /></div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                  <div className="contact-sub">{c.sub}</div>
                </div>
              </div>
            ))}

            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d506696.6929234124!2d79.6951!3d6.9271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2s!4v1620000000000"
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: 10, marginTop: 24 }}
                loading="lazy"
                title="Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.6rem', marginBottom: 24 }}>Send Us a Message</h3>
            {submitted ? (
              <div className="success-msg">
                <div style={{ fontSize: 60 }}><i className="bi bi-check-circle-fill" style={{color:'#4CAF50'}}/></div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll contact you within 24 hours to discuss your event.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-control" required placeholder="Full name"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" required placeholder="07XX XXX XXX"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="your@email.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select className="form-control" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}>
                      <option value="">Select...</option>
                      {['Wedding', 'Birthday', 'Corporate', 'Religious', 'Graduation', 'Other'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. of Guests</label>
                    <input type="number" className="form-control" placeholder="Approx. guests"
                      value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Message *</label>
                  <textarea className="form-control" rows="5" required
                    placeholder="Tell us about your event, date, requirements..."
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <><i className="bi bi-hourglass-split me-1"/>Sending...</> : <><i className="bi bi-send-fill me-1"/>Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .contact-item { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; }
        .contact-icon { width: 44px; height: 44px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .contact-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; }
        .contact-value { font-weight: 600; font-size: 15px; color: var(--dark); margin: 2px 0; }
        .contact-sub { font-size: 12px; color: #888; }
        .contact-form-card { background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
        textarea.form-control { resize: vertical; }
        .success-msg { text-align: center; padding: 40px 20px; }
        .success-msg h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; margin: 16px 0 8px; }
        .success-msg p { color: #888; line-height: 1.7; }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}