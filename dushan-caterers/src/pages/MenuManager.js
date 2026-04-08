// src/pages/MenuManager.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const GOLD = '#D4AF37';
const DARK = '#1A1A1A';

const CATEGORIES = [
  'Birthday Party Menu', 'Funeral Menu Lunch', 'Funeral Menu Dinner',
  'Alms Giving', 'Bana Pirith', 'Party Menu', 'Malabatha',
  'Home Coming', 'Bite Menu', 'Special Box Order',
];

const EMPTY_FORM = {
  category: 'Birthday Party Menu',
  packageName: '', packageLabel: '',
  price: '', priceUnit: 'per plate',
  note: '10% Service Charge will be Added to your Total Bill',
  pdfUrl: '', thumbnailUrl: '',
  order: 99, active: true,
};

const CLOUDINARY_CLOUD  = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME  || 'ddihoujg1';
const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ReceiptUploader';

async function uploadToCloudinary(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  formData.append('folder', folder);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url;
}

export function MenuManagerTab() {
  const [menus, setMenus]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [pdfUploading, setPdfUploading]   = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'menuCards'));
      const all  = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      setMenus(all.sort((a, b) => (a.order || 99) - (b.order || 99)));
    } catch { toast.error('Failed to load menus'); }
    setLoading(false);
  };

  useEffect(() => { fetchMenus(); }, []);

  const openAdd = () => { setEditDoc(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (m) => {
    setEditDoc(m.docId);
    setForm({ category: m.category||'', packageName: m.packageName||'', packageLabel: m.packageLabel||'', price: m.price||'', priceUnit: m.priceUnit||'per plate', note: m.note||'', pdfUrl: m.pdfUrl||'', thumbnailUrl: m.thumbnailUrl||'', order: m.order||99, active: m.active !== false });
    setShowForm(true);
  };

  const handleDelete = async (docId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteDoc(doc(db, 'menuCards', docId)); toast.success('Deleted!'); fetchMenus(); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (m) => {
    try {
      await updateDoc(doc(db, 'menuCards', m.docId), { active: !m.active });
      toast.success(m.active ? 'Hidden from website' : 'Now visible on website');
      fetchMenus();
    } catch { toast.error('Update failed'); }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast.error('Please upload a PDF or image file');
      return;
    }
    setPdfUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'menu-pdfs');
      setForm(f => ({ ...f, pdfUrl: url }));
      toast.success('PDF uploaded!');
    } catch { toast.error('PDF upload failed'); }
    setPdfUploading(false);
  };

  const handleThumbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'menu-thumbnails');
      setForm(f => ({ ...f, thumbnailUrl: url }));
      toast.success('Thumbnail uploaded!');
    } catch { toast.error('Thumbnail upload failed'); }
    setThumbUploading(false);
  };

  const handleSave = async () => {
    if (!form.category || !form.packageName) {
      toast.error('Category and Package Name are required'); return;
    }
    setSaving(true);
    const data = {
      category: form.category, packageName: form.packageName,
      packageLabel: form.packageLabel, price: Number(form.price) || 0,
      priceUnit: form.priceUnit || 'per plate', note: form.note,
      pdfUrl: form.pdfUrl, thumbnailUrl: form.thumbnailUrl,
      order: Number(form.order) || 99, active: form.active,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (editDoc) {
        await updateDoc(doc(db, 'menuCards', editDoc), data);
        toast.success('Menu updated!');
      } else {
        await addDoc(collection(db, 'menuCards'), { ...data, createdAt: new Date().toISOString() });
        toast.success('Menu added!');
      }
      setShowForm(false); fetchMenus();
    } catch (e) { console.error(e); toast.error('Save failed'); }
    setSaving(false);
  };

  const allCats = ['All', ...Array.from(new Set(menus.map(m => m.category)))];
  const filtered = filterCat === 'All' ? menus : menus.filter(m => m.category === filterCat);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', margin: 0 }}>Menu Management</h3>
          <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Upload PDF menus — they appear on the website instantly</p>
        </div>
        <button onClick={openAdd}
          style={{ padding: '10px 20px', background: DARK, color: GOLD, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="bi bi-plus-circle-fill" />Add New Menu
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {allCats.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filterCat === cat ? GOLD : '#ddd'}`, background: filterCat === cat ? DARK : '#fff', color: filterCat === cat ? GOLD : '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Jost,sans-serif', transition: 'all 0.2s' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, color: '#ccc' }}>
          <i className="bi bi-file-earmark-pdf" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
          <p>No menus yet. Click "Add New Menu" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {filtered.map(menu => (
            <div key={menu.docId} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', opacity: menu.active ? 1 : 0.55, border: '1px solid #eee' }}>
              {/* Top bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${DARK}, ${GOLD})` }} />

              {/* Thumbnail */}
              <div style={{ height: 130, background: '#F8F5EB', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {menu.thumbnailUrl ? (
                  <img src={menu.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <i className="bi bi-file-earmark-pdf-fill" style={{ fontSize: 44, color: GOLD, display: 'block', marginBottom: 4 }} />
                    <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'Jost,sans-serif' }}>No thumbnail</span>
                  </div>
                )}
                {!menu.active && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#FF9800', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, fontFamily: 'Jost,sans-serif' }}>HIDDEN</div>
                )}
                {menu.packageLabel && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: DARK, color: GOLD, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                    {menu.packageLabel}
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Jost,sans-serif', marginBottom: 3 }}>{menu.category}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.2rem', fontWeight: 600, marginBottom: 4 }}>{menu.packageName}</div>
                {menu.price > 0 && (
                  <div style={{ fontSize: 13, color: '#888', fontFamily: 'Jost,sans-serif', marginBottom: 10 }}>
                    Rs. {Number(menu.price).toLocaleString()} <span style={{ fontSize: 11 }}>/{menu.priceUnit}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {menu.pdfUrl && (
                    <a href={menu.pdfUrl} target="_blank" rel="noreferrer"
                      style={{ padding: '4px 10px', background: '#F8F5EB', color: DARK, borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-file-earmark-pdf-fill" style={{ color: GOLD }} />View PDF
                    </a>
                  )}
                  {!menu.pdfUrl && (
                    <span style={{ padding: '4px 10px', background: '#FFF3E0', color: '#E65100', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>No PDF</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(menu)}
                    style={{ flex: 1, padding: '6px', background: DARK, color: GOLD, border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <i className="bi bi-pencil-fill" />Edit
                  </button>
                  <button onClick={() => handleToggle(menu)}
                    style={{ flex: 1, padding: '6px', background: menu.active ? '#E8F5E9' : '#FFF3E0', color: menu.active ? '#2E7D32' : '#E65100', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <i className={`bi ${menu.active ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`} />{menu.active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(menu.docId, menu.packageName)}
                    style={{ padding: '6px 10px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif' }}>
                    <i className="bi bi-trash-fill" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.3rem', margin: 0 }}>{editDoc ? 'Edit Menu' : 'Add New Menu'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}><i className="bi bi-x-lg" /></button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Category */}
              <div>
                <label style={L}>Category *</label>
                <select style={I} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Package Name + Label */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={L}>Package Name *</label>
                  <input style={I} placeholder="e.g. Package A" value={form.packageName} onChange={e => setForm(f => ({ ...f, packageName: e.target.value }))} />
                </div>
                <div>
                  <label style={L}>Badge</label>
                  <input style={I} placeholder="A / B / C" value={form.packageLabel} onChange={e => setForm(f => ({ ...f, packageLabel: e.target.value }))} />
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={L}>Price (Rs.)</label>
                  <input style={I} type="number" placeholder="1450" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label style={L}>Price Unit</label>
                  <input style={I} placeholder="per plate" value={form.priceUnit} onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))} />
                </div>
              </div>

              {/* PDF Upload */}
              <div style={{ background: '#F8F5EB', border: '2px dashed #D4AF3780', borderRadius: 10, padding: 16 }}>
                <label style={{ ...L, color: DARK, marginBottom: 10 }}>
                  <i className="bi bi-file-earmark-pdf-fill" style={{ color: GOLD, marginRight: 6 }} />Upload Menu PDF *
                </label>
                <input type="file" accept="application/pdf,image/*" onChange={handlePDFUpload}
                  style={{ fontSize: 12, fontFamily: 'Jost,sans-serif', width: '100%' }} />
                {pdfUploading && (
                  <div style={{ fontSize: 12, color: GOLD, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="bi bi-hourglass-split" />Uploading PDF...
                  </div>
                )}
                {form.pdfUrl && !pdfUploading && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-check-circle-fill" style={{ color: '#4CAF50' }} />
                    <a href={form.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>PDF uploaded — click to preview</a>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label style={L}>
                  <i className="bi bi-image" style={{ color: GOLD, marginRight: 6 }} />Thumbnail Image
                  <span style={{ color: '#aaa', fontWeight: 400 }}> (optional — shown on card)</span>
                </label>
                <input type="file" accept="image/*" onChange={handleThumbUpload}
                  style={{ fontSize: 12, fontFamily: 'Jost,sans-serif', width: '100%' }} />
                {thumbUploading && (
                  <div style={{ fontSize: 12, color: GOLD, marginTop: 6 }}>Uploading thumbnail...</div>
                )}
                {form.thumbnailUrl && !thumbUploading && (
                  <img src={form.thumbnailUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                )}
              </div>

              {/* Note */}
              <div>
                <label style={L}>Note</label>
                <input style={I} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>

              {/* Order + Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={L}>Display Order</label>
                  <input style={I} type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
                </div>
                <div>
                  <label style={L}>Visibility</label>
                  <select style={I} value={String(form.active)} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}>
                    <option value="true">Visible on website</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid #eee', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '9px 20px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'Jost,sans-serif' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || pdfUploading || thumbUploading}
                style={{ padding: '9px 24px', background: DARK, color: GOLD, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost,sans-serif', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                {saving ? <><i className="bi bi-hourglass-split" />Saving...</> : <><i className="bi bi-check-circle-fill" />{editDoc ? 'Update' : 'Add Menu'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const L = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, fontFamily: 'Jost,sans-serif' };
const I = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontFamily: 'Jost,sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fafafa' };