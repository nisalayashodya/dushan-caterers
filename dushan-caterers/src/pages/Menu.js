// src/pages/Menu.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Menu() {
  const [menus, setMenus]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activecat, setActivecat] = useState('All');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        // Simple fetch — filter and sort in JS to avoid Firestore index requirement
        const snap = await getDocs(collection(db, 'menuCards'));
        const all  = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        const active = all
          .filter(m => m.active !== false)
          .sort((a, b) => (a.order || 99) - (b.order || 99));
        setMenus(active);
      } catch { setMenus([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  const categories = ['All', ...Array.from(new Set(menus.map(m => m.category)))];
  const filtered   = menus.filter(m => {
    const matchCat    = activecat === 'All' || m.category === activecat;
    const matchSearch = !search ||
      m.packageName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', background: '#F4F1E8' }}>
      <div className="page-header">
        <h1>Our <span>Menus</span></h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 13, letterSpacing: 2 }}>
          BROWSE & DOWNLOAD OUR CATERING MENUS
        </p>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Search + Category Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 14 }} />
            <input className="form-control" placeholder="Search menus..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40, borderRadius: 30, border: '1px solid #ddd', background: 'white', fontFamily: 'Jost,sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActivecat(cat)} style={{
                padding: '7px 18px', borderRadius: 25,
                border: `1.5px solid ${activecat === cat ? '#D4AF37' : '#ddd'}`,
                background: activecat === cat ? '#1A1A1A' : 'white',
                color: activecat === cat ? '#D4AF37' : '#666',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Jost,sans-serif', transition: 'all 0.2s',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            Loading menus...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#aaa' }}>
            <i className="bi bi-journal-richtext" style={{ fontSize: 48, display: 'block', marginBottom: 16, color: '#ddd' }} />
            <p style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.3rem' }}>No menus available yet.</p>
            <p style={{ fontSize: 13 }}>Please check back soon.</p>
          </div>
        ) : (
          <div className="menu-pdf-grid">
            {filtered.map((menu, i) => (
              <MenuPDFCard key={menu.docId} menu={menu} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 70, background: '#1A1A1A', borderRadius: 20, padding: '50px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: '#D4AF3715', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, background: '#D4AF3710', borderRadius: '50%', pointerEvents: 'none' }} />
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', color: 'white', fontSize: '2rem', marginBottom: 10, position: 'relative' }}>
            Want a custom menu for your event?
          </h2>
          <p style={{ color: '#888', position: 'relative', marginBottom: 20 }}>
            Use our AI-powered tool to build the perfect menu and get an instant price estimate.
          </p>
          <Link to="/customize" className="btn btn-gold" style={{ position: 'relative' }}>
            <i className="bi bi-pencil-square" style={{ marginRight: 6 }} />Customize Your Menu
          </Link>
        </div>
      </div>

      <style>{`
        .menu-pdf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        @media(max-width:600px) {
          .menu-pdf-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
        }
        @media(max-width:400px) {
          .menu-pdf-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function MenuPDFCard({ menu, index }) {
  const [hovered, setHovered] = useState(false);

  const openPDF = () => {
    if (menu.pdfUrl) window.open(menu.pdfUrl, '_blank');
  };

  const downloadPDF = async (e) => {
    e.stopPropagation();
    if (!menu.pdfUrl) return;
    try {
      const res  = await fetch(menu.pdfUrl);
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${menu.packageName || menu.category}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(menu.pdfUrl, '_blank');
    }
  };

  return (
    <div
      onClick={openPDF}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1A1A1A',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: menu.pdfUrl ? 'pointer' : 'default',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.12)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        animation: `cardIn 0.5s ease ${index * 0.06}s both`,
        border: hovered ? '1px solid #D4AF3740' : '1px solid transparent',
      }}>

      {/* PDF Preview / Thumbnail */}
      <div style={{ position: 'relative', height: 200, background: '#111', overflow: 'hidden' }}>
        {menu.thumbnailUrl ? (
          <img src={menu.thumbnailUrl} alt={menu.packageName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A1A1A, #2A2520)' }}>
            {/* Decorative background text */}
            <div style={{ position: 'absolute', fontSize: 120, fontFamily: 'Cormorant Garamond,serif', color: '#D4AF3708', fontWeight: 700, letterSpacing: -5, userSelect: 'none' }}>
              {menu.packageLabel || menu.category?.charAt(0) || 'M'}
            </div>
            <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 52, color: '#D4AF37', marginBottom: 10, position: 'relative' }} />
            <div style={{ fontSize: 12, color: '#888', fontFamily: 'Jost,sans-serif', position: 'relative' }}>PDF Menu</div>
          </div>
        )}

        {/* Overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered && menu.pdfUrl ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bi bi-eye-fill" style={{ fontSize: 28, color: '#D4AF37', display: 'block', marginBottom: 6 }} />
            <span style={{ color: 'white', fontSize: 12, fontFamily: 'Jost,sans-serif', fontWeight: 600 }}>View Menu</span>
          </div>
        </div>

        {/* Package label badge */}
        {menu.packageLabel && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#D4AF37', color: '#1A1A1A', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, fontFamily: 'Cormorant Garamond,serif' }}>
            {menu.packageLabel}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 10, color: '#D4AF37', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', marginBottom: 4 }}>
          {menu.category}
        </div>
        <h3 style={{ fontFamily: 'Cormorant Garamond,serif', color: 'white', fontSize: '1.3rem', margin: '0 0 8px', fontWeight: 600 }}>
          {menu.packageName}
        </h3>
        {menu.price && (
          <div style={{ fontFamily: 'Cormorant Garamond,serif', color: '#D4AF37', fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>
            Rs. {Number(menu.price).toLocaleString()}
            <span style={{ fontSize: 11, color: '#666', fontFamily: 'Jost,sans-serif', fontWeight: 400, marginLeft: 4 }}>/{menu.priceUnit || 'per plate'}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {menu.pdfUrl ? (
            <>
              <button onClick={openPDF}
                style={{ flex: 1, padding: '8px', background: '#D4AF37', color: '#1A1A1A', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <i className="bi bi-eye-fill" />View
              </button>
              <button onClick={downloadPDF}
                style={{ flex: 1, padding: '8px', background: 'transparent', color: '#D4AF37', border: '1px solid #D4AF3740', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <i className="bi bi-download" />Download
              </button>
            </>
          ) : (
            <div style={{ flex: 1, padding: '8px', background: '#2A2A2A', color: '#555', borderRadius: 8, fontSize: 12, fontFamily: 'Jost,sans-serif', textAlign: 'center' }}>
              Coming Soon
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}