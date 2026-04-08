// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import emailjs from 'emailjs-com';

// ── EmailJS Config from .env ────────────────────────────────────────────────
const EMAILJS_SERVICE_ID        = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_CUSTOMER_TEMPLATE = process.env.REACT_APP_EMAILJS_CUSTOMER_TEMPLATE;
const EMAILJS_PUBLIC_KEY        = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
// Login notification sent to user's own email only — no separate admin alert needed

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }
emailjs.init(EMAILJS_PUBLIC_KEY);

// ── Read role from Firestore ────────────────────────────────────────────────
// Check order:
// 1. users/{uid}       → read role field (customers registered via website)
// 2. admin/{uid}       → if document exists → admin (direct UID match)
// 3. admin collection  → search by email field (fallback)
async function getRoleFromFirestore(uid, email) {
  try {
    // 1. Check users collection by UID
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return (userSnap.data().role || 'customer').trim().toLowerCase();
    }

    // 2. Check admin collection directly by UID (document ID = uid)
    const adminUidSnap = await getDoc(doc(db, 'admin', uid));
    if (adminUidSnap.exists()) {
      console.log('Admin found by UID in admin collection');
      return 'admin';
    }

    // 3. Check admin collection by email field
    if (email) {
      const adminQuery = query(
        collection(db, 'admin'),
        where('email', '==', email.trim().toLowerCase())
      );
      const adminSnap = await getDocs(adminQuery);
      if (!adminSnap.empty) {
        console.log('Admin found by email in admin collection');
        return 'admin';
      }
    }

    return 'customer';
  } catch (err) {
    console.error('getRoleFromFirestore error:', err);
    return 'customer';
  }
}

// ── Send login notification email ──────────────────────────────────────────
// Every login (admin or customer) sends a notification to their OWN email only
// No separate alert email — just a simple "you have logged in" to their inbox
async function sendLoginNotification(user, role) {
  try {
    const loginTime = new Date().toLocaleString('en-LK', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CUSTOMER_TEMPLATE, {
      user_name:  user.displayName || (role === 'admin' ? 'Admin' : 'Customer'),
      user_email: user.email,
      login_time: loginTime,
      to_email:   user.email,  // always sent to the logged-in user's own email
    }, EMAILJS_PUBLIC_KEY);

  } catch (err) {
    console.warn('Login notification email failed (non-critical):', err);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole]       = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [loading, setLoading]         = useState(true);

  // ── Register ──────────────────────────────────────────────────────────────
  async function signup(email, password, name, phone) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    // Send verification email
    try {
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      console.log('Verification email sent to:', email);
    } catch (e) {
      console.error('Verification email error:', e);
    }

    // Save to Firestore as customer
    const customerId = 'DC' + Date.now().toString().slice(-6);
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid, name, email, phone,
      role: 'customer', customerId,
      createdAt: new Date().toISOString(),
    });

    // Force sign out — must verify email before logging in
    await signOut(auth);
    return result;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Block unverified users
    if (!result.user.emailVerified) {
      try {
        await sendEmailVerification(result.user, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        });
      } catch (e) {
        console.warn('Could not resend verification:', e);
      }
      await signOut(auth);
      throw { code: 'auth/email-not-verified' };
    }

    // Get role from Firestore (checks users + admin collections)
    const role = await getRoleFromFirestore(result.user.uid, result.user.email);
    console.log('Login role detected:', role);

    // Send login notification
    await sendLoginNotification(result.user, role);

    return { ...result, role };
  }

  // ── Google Sign-In ────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result  = await signInWithPopup(auth, provider);
    const user    = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    let role = 'customer';
    if (userDoc.exists()) {
      // Existing user — get their role
      role = await getRoleFromFirestore(user.uid, user.email);
    } else {
      // New Google user — create Firestore doc
      const customerId = 'DC' + Date.now().toString().slice(-6);
      await setDoc(userRef, {
        uid: user.uid, name: user.displayName || '',
        email: user.email, phone: '',
        role: 'customer', customerId,
        provider: 'google',
        createdAt: new Date().toISOString(),
      });
      // Check if they exist in admin collection
      role = await getRoleFromFirestore(user.uid, user.email);
    }

    await sendLoginNotification(user, role);
    return { result, isAdmin: role === 'admin', role };
  }

  // ── Forgot Password ───────────────────────────────────────────────────────
  async function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email.trim().toLowerCase(), {
      url: `${window.location.origin}/login`,
    });
  }

  // ── Resend Verification Email ─────────────────────────────────────────────
  async function resendVerificationEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/login`,
      });
    }
    await signOut(auth);
  }

  // ── Send verification email for manually created admin accounts ─────────────
  // The admin account was created manually in Firebase Console
  // so Firebase never auto-sent a verification email for it
  // This function triggers that email on first login attempt
  async function sendAdminVerification(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.emailVerified) {
        await signOut(auth);
        throw { code: 'auth/already-verified' };
      }
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      console.log('Admin verification email sent to:', email);
      await signOut(auth);
    } catch (err) {
      throw err;
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function logout() { return signOut(auth); }

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setRoleLoading(true);

      if (user) {
        const role = await getRoleFromFirestore(user.uid, user.email);
        console.log('Auth state role:', role, 'for:', user.email);
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setRoleLoading(false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser, userRole, roleLoading,
    signup, login, logout,
    forgotPassword, loginWithGoogle, resendVerificationEmail, sendAdminVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}