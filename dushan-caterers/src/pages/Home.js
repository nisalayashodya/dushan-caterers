// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const heroSlides = [
  { bg: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.6) 100%), url("https://images.unsplash.com/photo-1555244162-803834f70033?w=1600") center/cover', title: 'Grand Ceremonies', subtitle: 'Deserve Grand Catering' },
  { bg: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.6) 100%), url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600") center/cover', title: 'Authentic Sri Lankan', subtitle: 'Flavors for Every Occasion' },
  { bg: 'linear-gradient(135deg, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.6) 100%), url("https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1600") center/cover', title: 'Turning Your Vision', subtitle: 'Into a Delectable Reality' }
];

const services = [
  { icon: 'bi-heart-fill',       title: 'Wedding Catering',    desc: 'Make your special day unforgettable with our grand wedding menus crafted with love and tradition.' },
  { icon: 'bi-balloon-fill',     title: 'Birthday Parties',    desc: 'Celebrate milestones with vibrant menus tailored to your taste and budget.' },
  { icon: 'bi-briefcase-fill',   title: 'Corporate Events',    desc: 'Professional catering for corporate functions, conferences and office gatherings.' },
  { icon: 'bi-flower1',          title: 'Religious Ceremonies',desc: 'Authentic traditional menus for almsgivings and religious occasions.' },
  { icon: 'bi-mortarboard-fill', title: 'Graduations',         desc: 'Honor achievements with carefully curated menus for graduation celebrations.' },
  { icon: 'bi-stars',            title: 'Custom Events',       desc: 'Whatever the occasion, we craft menus that perfectly match your vision.' }
];

const testimonials = [
  { name: 'Priyantha Perera', event: 'Wedding',        rating: 5, text: 'Dushan Caterers made our wedding day absolutely magical. The food was exceptional and the service was flawless!' },
  { name: 'Kamini Silva',     event: 'Birthday Party', rating: 5, text: 'Amazing service! The AI menu customization tool helped us plan the perfect menu within our budget.' },
  { name: 'Roshan Fernando',  event: 'Corporate Event',rating: 5, text: 'Professional, punctual, and delicious. Our corporate event was a great success thanks to Dushan Caterers.' }
];

const stats = [
  { value: '10+',    label: 'Years Experience' },
  { value: '2500+',  label: 'Events Catered' },
  { value: '50000+', label: 'Guests Served' },
  { value: '98%',    label: 'Client Satisfaction' }
];

const menuPreview = [
  { name: 'Chicken Biriyani',   cat: 'Biriyani',     price: 650, icon: 'bi-stars' },
  { name: 'Watalappan',         cat: 'Desserts',     price: 200, icon: 'bi-cake2-fill' },
  { name: 'Chicken Curry',      cat: 'Rice & Curry', price: 350, icon: 'bi-shop' },
  { name: 'Chicken Patties',    cat: 'Short Eats',   price: 120, icon: 'bi-bag-heart-fill' },
  { name: 'Prawn Curry',        cat: 'Rice & Curry', price: 500, icon: 'bi-tsunami' },
  { name: 'King Coconut Water', cat: 'Beverages',    price: 120, icon: 'bi-cup-straw' }
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero" style={{ background: heroSlides[slide].bg }}>
        <div className="hero-content container">
          <div className="hero-badge">
            <i className="bi bi-star-fill" style={{marginRight:6}}/>Best Outdoor Catering Service Provider in Sri Lanka<i className="bi bi-star-fill" style={{marginLeft:6}}/>
          </div>
          <img src="/assets/DushanCaterersLOGO.png" alt="Dushan Caterers" className="brand-logo-circle" style={{borderRadius:'50%',objectFit:'cover'}} />
          <h1 className="hero-script">Dushan Caterers</h1>
          <h2 className="hero-title">{heroSlides[slide].title}</h2>
          <p className="hero-sub">{heroSlides[slide].subtitle}</p>
          <div className="hero-actions">
            <Link to="/customize" className="btn btn-gold"><i className="bi bi-pencil-square" style={{marginRight:8}}/>Customize Your Menu</Link>
            <Link to="/contact" className="btn btn-outline"><i className="bi bi-envelope-fill" style={{marginRight:8}}/>Get a Quote</Link>
          </div>
          <div className="hero-scroll">
            {heroSlides.map((_, i) => <span key={i} className={`dot ${i===slide?'active':''}`} onClick={()=>setSlide(i)}/>)}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container stats-grid">
          {stats.map((s,i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="about-snippet container">
        <div className="about-text">
          <p className="section-sub" style={{textAlign:'left'}}>Who We Are</p>
          <h2 className="section-title" style={{textAlign:'left', fontSize:'2.8rem'}}>
            Sri Lanka's Premier <span style={{color:'var(--gold)'}}>Outdoor Catering</span> Service
          </h2>
          <div className="gold-line"></div>
          <p>For over a decade, Dushan Caterers has been turning grand ceremonies into unforgettable memories. We specialize in delivering authentic Sri Lankan cuisine with modern presentation, exceptional service, and a commitment to excellence.</p>
          <p style={{marginTop:14}}>Our AI-powered menu customization system allows you to design your perfect menu, preview real-time pricing, and receive intelligent recommendations — all from the comfort of your home.</p>
          <div style={{marginTop:24, display:'flex', gap:16, flexWrap:'wrap'}}>
            <Link to="/about" className="btn btn-dark"><i className="bi bi-info-circle-fill" style={{marginRight:8}}/>Learn More About Us</Link>
            <Link to="/menu" className="btn btn-outline"><i className="bi bi-menu-button-wide-fill" style={{marginRight:8}}/>View Our Menus</Link>
          </div>
        </div>
        <div className="about-image">
          <div className="img-frame">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600" alt="Catering"/>
            <div className="img-badge">Since 2013</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="container">
          <p className="section-sub">What We Offer</p>
          <h2 className="section-title">Our Catering <span style={{color:'var(--gold)'}}>Services</span></h2>
          <div className="gold-line center"></div>
          <div className="services-grid">
            {services.map((s,i) => (
              <div key={i} className="service-card">
                <div className="service-icon"><i className={`bi ${s.icon}`}/></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Banner */}
      <section className="ai-banner">
        <div className="container ai-banner-inner">
          <div className="ai-badge"><i className="bi bi-robot" style={{marginRight:6}}/>AI-Powered</div>
          <h2>Design Your Menu with <span>Artificial Intelligence</span></h2>
          <p>Our intelligent system recommends the perfect menu based on your event type, guest count, and budget. Get real-time price estimates and instant quotes.</p>
          <div style={{display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', marginTop:28}}>
            <Link to="/customize" className="btn btn-gold"><i className="bi bi-pencil-square" style={{marginRight:8}}/>Start Customizing</Link>
            <a href="#chatbot-info" className="btn btn-outline"><i className="bi bi-chat-dots-fill" style={{marginRight:8}}/>Chat with AI Assistant</a>
          </div>
          <div className="ai-features">
            <div className="ai-feat"><i className="bi bi-lightning-charge-fill" style={{marginRight:6}}/>Real-time pricing</div>
            <div className="ai-feat"><i className="bi bi-bullseye" style={{marginRight:6}}/>Smart recommendations</div>
            <div className="ai-feat"><i className="bi bi-file-earmark-pdf-fill" style={{marginRight:6}}/>Instant PDF quotes</div>
            <div className="ai-feat"><i className="bi bi-shield-lock-fill" style={{marginRight:6}}/>Secure payments</div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="menu-preview container">
        <p className="section-sub">A Taste of Our Offerings</p>
        <h2 className="section-title">Featured <span style={{color:'var(--gold)'}}>Menu Items</span></h2>
        <div className="gold-line center"></div>
        <div className="menu-preview-grid">
          {menuPreview.map((item,i) => (
            <div key={i} className="menu-preview-card">
              <div className="menu-icon-wrap"><i className={`bi ${item.icon}`}/></div>
              <div className="menu-cat">{item.cat}</div>
              <h4>{item.name}</h4>
              <div className="menu-price">From LKR {item.price.toLocaleString()}/person</div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center', marginTop:40}}>
          <Link to="/menu" className="btn btn-dark"><i className="bi bi-menu-button-wide-fill" style={{marginRight:8}}/>View Full Menu</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <p className="section-sub">What Our Clients Say</p>
          <h2 className="section-title">Customer <span style={{color:'var(--gold)'}}>Reviews</span></h2>
          <div className="gold-line center"></div>
          <div className="testimonials-grid">
            {testimonials.map((t,i) => (
              <div key={i} className="testimonial-card">
                <div className="stars">
                  {Array.from({length:t.rating}).map((_,j)=><i key={j} className="bi bi-star-fill"/>)}
                </div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-event">{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card">
          <h2>Ready to Plan Your Perfect Event?</h2>
          <p>Customize your menu, get an instant quote, and book Dushan Caterers for your next grand ceremony.</p>
          <div style={{display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap'}}>
            <Link to="/customize" className="btn btn-gold"><i className="bi bi-pencil-square" style={{marginRight:8}}/>Customize My Menu</Link>
            <Link to="/contact" className="btn btn-outline"><i className="bi bi-envelope-fill" style={{marginRight:8}}/>Contact Us</Link>
          </div>
        </div>
      </section>

      <style>{`
        .home { padding-top: 100px; }
        .hero { min-height: 90vh; display: flex; align-items: center; justify-content: center; transition: background 1s ease; position: relative; }
        .hero-content { text-align: center; color: white; animation: fadeIn 1s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hero-badge { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; display: inline-flex; align-items: center; padding: 8px 24px; border-radius: 30px; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
        .brand-logo-circle { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; box-shadow: 0 0 0 4px rgba(212,175,55,0.3); object-fit: cover; display: block; }
        .hero-script { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 3rem; color: #D4AF37; margin-bottom: 8px; }
        .hero-title { font-family: 'Jost', sans-serif; font-size: clamp(2rem, 5vw, 4rem); font-weight: 700; text-transform: uppercase; letter-spacing: 4px; line-height: 1.1; margin-bottom: 12px; }
        .hero-sub { font-size: 1.1rem; color: rgba(255,255,255,0.8); margin-bottom: 36px; font-style: italic; }
        .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .hero-scroll { margin-top: 40px; display: flex; gap: 8px; justify-content: center; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; }
        .dot.active { background: #D4AF37; width: 24px; border-radius: 4px; }
        .stats-bar { background: #1A1A1A; padding: 30px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-item { text-align: center; border-right: 1px solid #2A2A2A; }
        .stat-item:last-child { border-right: none; }
        .stat-value { font-size: 2.5rem; font-weight: 700; color: #D4AF37; font-family: 'Cormorant Garamond', serif; }
        .stat-label { font-size: 12px; color: #888; letter-spacing: 1px; text-transform: uppercase; }
        .about-snippet { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 80px 20px; }
        .about-text p { color: #555; line-height: 1.8; }
        .img-frame { position: relative; border-radius: 12px; overflow: hidden; }
        .img-frame img { width: 100%; height: 400px; object-fit: cover; display: block; }
        .img-badge { position: absolute; bottom: 20px; left: 20px; background: #D4AF37; color: #1A1A1A; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 18px; font-family: 'Cormorant Garamond', serif; }
        .services-section { background: #1A1A1A; padding: 80px 0; }
        .services-section .section-title, .services-section .section-sub { color: white; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px; }
        .service-card { background: #2A2A2A; border: 1px solid #3A3A3A; border-radius: 12px; padding: 28px; text-align: center; transition: all 0.3s; }
        .service-card:hover { border-color: #D4AF37; transform: translateY(-4px); }
        .service-icon { font-size: 40px; margin-bottom: 16px; color: #D4AF37; }
        .service-card h3 { font-family: 'Cormorant Garamond', serif; color: #D4AF37; font-size: 1.3rem; margin-bottom: 10px; }
        .service-card p { color: #888; font-size: 13px; line-height: 1.7; }
        .ai-banner { background: linear-gradient(135deg, #D4AF37 0%, #A8870C 100%); padding: 80px 0; text-align: center; }
        .ai-banner-inner { max-width: 700px; margin: 0 auto; }
        .ai-badge { background: rgba(0,0,0,0.15); display: inline-flex; align-items: center; padding: 6px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; color: #1A1A1A; letter-spacing: 2px; }
        .ai-banner h2 { font-size: 2.8rem; color: #1A1A1A; margin-bottom: 16px; font-family: 'Cormorant Garamond', serif; }
        .ai-banner h2 span { text-decoration: underline; }
        .ai-banner p { color: rgba(26,26,26,0.75); font-size: 16px; }
        .ai-features { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-top: 32px; }
        .ai-feat { background: rgba(0,0,0,0.1); padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; color: #1A1A1A; display: inline-flex; align-items: center; }
        .menu-preview { padding: 80px 20px; }
        .menu-preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .menu-preview-card { background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 16px rgba(0,0,0,0.08); transition: all 0.3s; border-top: 3px solid transparent; }
        .menu-preview-card:hover { border-top-color: #D4AF37; transform: translateY(-4px); }
        .menu-icon-wrap { font-size: 40px; margin-bottom: 12px; color: #D4AF37; }
        .menu-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; font-weight: 600; }
        .menu-preview-card h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; margin: 8px 0; }
        .menu-price { font-size: 13px; color: #888; }
        .testimonials-section { background: var(--cream-dark); padding: 80px 0; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .testimonial-card { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
        .stars { color: #D4AF37; font-size: 16px; margin-bottom: 12px; display: flex; gap: 3px; }
        .testimonial-card p { color: #555; font-style: italic; font-size: 14px; line-height: 1.8; margin-bottom: 20px; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar { width: 40px; height: 40px; background: #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1A1A1A; font-size: 16px; }
        .author-name { font-weight: 600; font-size: 14px; }
        .author-event { font-size: 12px; color: #888; }
        .cta-section { padding: 60px 20px; }
        .cta-card { background: #1A1A1A; border-radius: 16px; padding: 60px; text-align: center; }
        .cta-card h2 { font-family: 'Cormorant Garamond', serif; color: white; font-size: 2.5rem; margin-bottom: 12px; }
        .cta-card p { color: #888; margin-bottom: 32px; }
        @media (max-width: 768px) {
          .hero { min-height: 80vh; }
          .hero-title { font-size: 1.8rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .about-snippet { grid-template-columns: 1fr; }
          .services-grid, .menu-preview-grid, .testimonials-grid { grid-template-columns: 1fr; }
          .cta-card { padding: 30px 20px; }
        }
      `}</style>
    </div>
  );
}