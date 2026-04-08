// src/pages/Auth.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function Login() {
  const { login, loginWithGoogle, forgotPassword, resendVerificationEmail,
          sendAdminVerification, currentUser, userRole, roleLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]                   = useState('login');
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResend, setShowResend]     = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !roleLoading && userRole) {
      navigate(userRole === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [currentUser, userRole, roleLoading, navigate]);

  // ── Email/Password Login ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);

    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);
      const role   = result.role || 'customer';

      toast.success('Welcome back! A Login notification has been sent to your email.');

      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('LOGIN ERROR:', error);
      if (error.code === 'auth/email-not-verified') {
        // Auto-send verification email on first blocked attempt
        try {
          await sendAdminVerification(form.email.trim().toLowerCase(), form.password);
          toast.error(
            `Verification email sent to ${form.email}. Please Verify your email to Log in.`,
            { duration: 8000 }
          );
        } catch (verifyErr) {
          if (verifyErr.code === 'auth/already-verified') {
            toast.error('Email already verified. Please try logging in again.');
          } else {
            toast.error(`Verification email sent to ${form.email}. Please Verify your email to Log in.`, { duration: 8000 });
          }
        }
        setShowResend(true);
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        toast.error('Incorrect email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Please register first.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  // ── Resend Verification ───────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(form.email.trim().toLowerCase(), form.password);
      toast.success('Verification email sent! Please check your inbox.');
      setShowResend(false);
    } catch {
      toast.error('Could not resend. Check your credentials and try again.');
    }
    setResendLoading(false);
  };

  // ── Forgot Password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { toast.error('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      toast.success('Password reset email sent! Check your inbox.');
      setTab('login');
      setForgotEmail('');
    } catch (error) {
      toast.error(error.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Failed to send reset email. Try again.');
    }
    setLoading(false);
  };

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { role } = await loginWithGoogle();
      toast.success('Signed in with Google! A login notification has been sent.');
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.');
      }
    }
    setGoogleLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/assets/DushanCaterersLOGO.png" alt="Dushan Caterers" className="auth-logo" />
          <h2>{tab === 'forgot' ? 'Reset Password' : 'Welcome Back'}</h2>
          <p>{tab === 'forgot' ? 'Enter your email to receive a reset link' : 'Login to manage your catering orders'}</p>
        </div>

        {/* ── FORGOT PASSWORD ── */}
        {tab === 'forgot' ? (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" required
                placeholder="your@email.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-gold" style={{ width:'100%', marginTop:8 }} disabled={loading}>
              {loading
                ? <><i className="bi bi-hourglass-split" style={{marginRight:6}}/>Sending...</>
                : <><i className="bi bi-envelope-fill" style={{marginRight:6}}/>Send Reset Email</>}
            </button>
            <button type="button" onClick={() => setTab('login')}
              style={{ width:'100%', marginTop:10, padding:'10px', background:'none', border:'1px solid #ddd', borderRadius:8, cursor:'pointer', fontSize:13, fontFamily:'Jost,sans-serif', color:'#888' }}>
              <i className="bi bi-arrow-left" style={{marginRight:6}}/>Back to Login
            </button>
          </form>

        ) : (
          /* ── LOGIN FORM ── */
          <>
            <button onClick={handleGoogle} disabled={googleLoading} style={googleBtnStyle}>
              {googleLoading ? (
                <><i className="bi bi-hourglass-split" style={{marginRight:8}}/>Connecting...</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight:8}}>
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
                    <path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l7.9-6z"/>
                    <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.7-3.7-13.6-9.3l-7.9 6C6.6 42.6 14.6 48 24 48z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div style={dividerStyle}>
              <span style={{ background:'#fff', padding:'0 12px', color:'#aaa', fontSize:12 }}>or login with email</span>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display:'flex', justifyContent:'space-between' }}>
                  <span>Password</span>
                  <button type="button" onClick={() => setTab('forgot')}
                    style={{ background:'none', border:'none', color:'var(--gold)', cursor:'pointer', fontSize:12, fontWeight:600, padding:0 }}>
                    Forgot password?
                  </button>
                </label>
                <input type="password" className="form-control" required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} />
              </div>

              {showResend && (
                <div style={verifyBannerStyle}>
                  <i className="bi bi-envelope-exclamation-fill" style={{color:'#FF9800', fontSize:18}} />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:13}}>Email not verified</div>
                    <div style={{fontSize:12, color:'#666', marginTop:2}}>
                      Check your inbox for <strong>{form.email}</strong>. Also check spam/junk.
                    </div>
                  </div>
                  <button type="button" onClick={handleResend} disabled={resendLoading}
                    style={{padding:'5px 12px', background:'#FF9800', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0}}>
                    {resendLoading ? 'Sending...' : 'Resend'}
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-gold" style={{width:'100%', marginTop:8}} disabled={loading}>
                {loading
                  ? <><i className="bi bi-hourglass-split" style={{marginRight:6}}/>Logging in...</>
                  : <><i className="bi bi-box-arrow-in-right" style={{marginRight:6}}/>Login</>}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account?{' '}
                <Link to="/register" style={{color:'var(--gold)', fontWeight:600}}>Register here</Link>
              </p>
              <p style={{marginTop:8}}>
                <small style={{color:'#aaa'}}>Admin? Login with your admin credentials.</small>
              </p>
            </div>
          </>
        )}
      </div>
      <AuthStyles />
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function Register() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]               = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 6)       { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup(form.email.trim().toLowerCase(), form.password, form.name, form.phone);
      toast.success('Account created! Please check your email to verify before logging in.', { duration: 6000 });
      navigate('/login');
    } catch (error) {
      toast.error(
        error.message?.includes('email-already-in-use')
          ? 'Email already registered. Please login instead.'
          : 'Registration failed. Please try again.'
      );
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { role } = await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.');
      }
    }
    setGoogleLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth:500}}>
        <div className="auth-brand">
          <img src="/assets/DushanCaterersLOGO.png" alt="Dushan Caterers" className="auth-logo" />
          <h2>Create Account</h2>
          <p>Join Dushan Caterers to customize your menus</p>
        </div>

        <button onClick={handleGoogle} disabled={googleLoading} style={googleBtnStyle}>
          {googleLoading ? (
            <><i className="bi bi-hourglass-split" style={{marginRight:8}}/>Connecting...</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight:8}}>
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.5 13.3l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
                <path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l7.9-6z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.7-3.7-13.6-9.3l-7.9 6C6.6 42.6 14.6 48 24 48z"/>
              </svg>
              Sign up with Google
            </>
          )}
        </button>

        <div style={dividerStyle}>
          <span style={{background:'#fff', padding:'0 12px', color:'#aaa', fontSize:12}}>or register with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{gap:16}}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" required placeholder="Your full name"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" placeholder="0777 XXX XXX"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" required placeholder="your@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <small style={{color:'#888', fontSize:11, marginTop:4, display:'block'}}>
              <i className="bi bi-info-circle" style={{marginRight:4}}/>
              A verification email will be sent. You must verify it before logging in.
            </small>
          </div>

          <div className="grid-2" style={{gap:16}}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" required placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" required placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn btn-gold" style={{width:'100%', marginTop:8}} disabled={loading}>
            {loading
              ? <><i className="bi bi-hourglass-split" style={{marginRight:6}}/>Creating account...</>
              : <><i className="bi bi-person-plus-fill" style={{marginRight:6}}/>Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?{' '}
            <Link to="/login" style={{color:'var(--gold)', fontWeight:600}}>Login here</Link>
          </p>
        </div>
      </div>
      <AuthStyles />
    </div>
  );
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const googleBtnStyle = {
  width:'100%', padding:'11px 16px',
  background:'#fff', color:'#333',
  border:'1px solid #ddd', borderRadius:8,
  cursor:'pointer', fontSize:14, fontWeight:600,
  fontFamily:'Jost,sans-serif',
  display:'flex', alignItems:'center', justifyContent:'center',
  gap:4, marginBottom:16, transition:'all 0.2s',
  boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
};

const dividerStyle = {
  position:'relative', textAlign:'center',
  marginBottom:20, borderTop:'1px solid #eee', marginTop:4,
};

const verifyBannerStyle = {
  background:'#FFF8E7', border:'1px solid #FFD54F',
  borderRadius:8, padding:'10px 12px',
  display:'flex', alignItems:'center', gap:10,
  marginBottom:12, fontSize:13,
};

function AuthStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%);
        padding: 100px 20px 40px;
      }
      .auth-card {
        background: white; border-radius: 16px; padding: 40px;
        width: 100%; max-width: 420px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      .auth-brand { text-align: center; margin-bottom: 28px; }
      .auth-logo {
        width: 80px; height: 80px; border-radius: 50%;
        margin: 0 auto 16px; display: block; object-fit: cover;
      }
      .auth-brand h2 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; margin-bottom: 6px; }
      .auth-brand p  { color: #888; font-size: 14px; }
      .auth-footer   { text-align: center; margin-top: 24px; font-size: 14px; }
    `}</style>
  );
}