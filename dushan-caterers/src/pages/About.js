// src/pages/About.js
import React from 'react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Mr. Dushantha Ranathunga', role: 'Founder & Head Chef', emoji: 'bi-person-badge-fill' },
  { name: 'Operations Team', role: 'Event Management', emoji: 'bi-clipboard2-check-fill' },
  { name: 'Culinary Team', role: 'Master Chefs', emoji: 'bi-stars' },
  { name: 'Service Team', role: 'Guest Relations', emoji: 'bi-people-fill' }
];

const values = [
  { icon: 'bi-star-fill', title: 'Quality', desc: 'We never compromise on the quality of ingredients or presentation.' },
  { icon: 'bi-heart-fill', title: 'Passion', desc: 'Every dish is prepared with love and dedication to culinary excellence.' },
  { icon: 'bi-bullseye', title: 'Precision', desc: 'From timing to portions, every detail is planned with precision.' },
  { icon: 'bi-handshake-fill', title: 'Trust', desc: 'We build lasting relationships with every client we serve.' }
];

export default function About() {
  return (
    <div style={{ paddingTop: 100 }}>
      <div className="page-header">
        <h1>About <span>Us</span></h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 13, letterSpacing: 2 }}>OUR STORY OF PASSION AND DEDICATION</p>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        {/* Story */}
        <div className="about-grid">
          <div>
            <p className="section-sub" style={{ textAlign: 'left' }}>Our Story</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.5rem', lineHeight: 1.2, marginBottom: 12 }}>
              Crystallizing the <span style={{ color: 'var(--gold)' }}>Uniqueness</span> of Every Ceremony
            </h2>
            <div className="gold-line"></div>
            <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 16 }}>
              Founded with a simple vision — to make every event extraordinary through exceptional food — Dushan Caterers has grown into Sri Lanka's most trusted outdoor catering service. Our journey began with humble beginnings and a passion for authentic Sri Lankan cuisine.
            </p>
            <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 24 }}>
              Today, we combine decades of culinary expertise with cutting-edge AI technology to deliver personalized catering experiences for weddings, corporate events, birthdays, and all life's grand celebrations.
            </p>
            <Link to="/customize" className="btn btn-gold">Customize Your Menu</Link>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=600" alt="About" style={{ width: '100%', borderRadius: 12, height: 400, objectFit: 'cover' }} />
          </div>
        </div>

        {/* Values */}
        <div style={{ marginTop: 80 }}>
          <p className="section-sub">What Drives Us</p>
          <h2 className="section-title">Our Core <span style={{ color: 'var(--gold)' }}>Values</span></h2>
          <div className="gold-line center"></div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon"><i className={`bi ${v.icon}`} /></div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginTop: 80 }}>
          <p className="section-sub">The People Behind</p>
          <h2 className="section-title">Our <span style={{ color: 'var(--gold)' }}>Team</span></h2>
          <div className="gold-line center"></div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div key={i} className="team-card">
                <div className="team-emoji"><i className={`bi ${m.emoji}`} /></div>
                <h4>{m.name}</h4>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feature */}
        <div className="ai-about-card" style={{ marginTop: 80 }}>
          <div className="ai-about-text">
            <h2><span style={{ color: 'var(--gold)' }}>About Our Website</span></h2>
            <div className="gold-line"></div>
            <p>As part of our commitment to innovation, we've integrated AI into our catering management system. Our AI chatbot and recommendation engine analyze your event requirements to suggest perfect menu combinations, provide real-time pricing, and generate professional quotations instantly.</p>
            <div className="ai-feat-list">
              <div><i className="bi bi-robot me-1"/> AI Menu Recommendations</div>
              <div><i className="bi bi-chat-dots-fill me-1"/> 24/7 Chatbot Support</div>
              <div><i className="bi bi-bar-chart-fill me-1"/> Real-time Bill Preview</div>
              <div><i className="bi bi-file-earmark-pdf-fill me-1"/> Instant PDF Quotations</div>
            </div>
          </div>
          <div className="ai-about-visual">
            <div className="ai-circle"><i className="bi bi-robot" style={{fontSize:72,color:'#D4AF37'}}/></div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .values-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .value-card { background: white; border-radius: 12px; padding: 28px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: all 0.3s; }
        .value-card:hover { transform: translateY(-4px); border-bottom: 3px solid var(--gold); }
        .value-icon { font-size: 36px; margin-bottom: 12px; }
        .value-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; margin-bottom: 8px; }
        .value-card p { font-size: 13px; color: #888; line-height: 1.6; }
        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .team-card { background: white; border-radius: 12px; padding: 28px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
        .team-emoji { font-size: 48px; margin-bottom: 12px; }
        .team-card h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; margin-bottom: 6px; }
        .team-card p { font-size: 13px; color: var(--gold); font-weight: 600; }
        .ai-about-card { background: var(--dark); border-radius: 16px; padding: 50px; display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
        .ai-about-text h2 { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: white; margin-bottom: 10px; }
        .ai-about-text p { color: #888; line-height: 1.8; margin-bottom: 20px; }
        .ai-feat-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .ai-feat-list div { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); color: var(--gold); padding: 6px 14px; border-radius: 20px; font-size: 12px; }
        .ai-circle { width: 150px; height: 150px; background: rgba(212,175,55,0.1); border: 2px solid rgba(212,175,55,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 72px; }
        @media (max-width: 768px) {
          .about-grid, .values-grid, .team-grid { grid-template-columns: 1fr; }
          .ai-about-card { grid-template-columns: 1fr; }
          .ai-circle { display: none; }
        }
      `}</style>
    </div>
  );
}