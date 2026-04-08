// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDQhNX7b5Exqr-8HBaTAC4tw_P3y0rzoNg",
  authDomain: "dushancaterers-bf375.firebaseapp.com",
  databaseURL: "https://dushancaterers-bf375-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dushancaterers-bf375",
  storageBucket: "dushancaterers-bf375.firebasestorage.app",
  messagingSenderId: "904465504467",
  appId: "1:904465504467:web:cb9c8243b25a2c4dba5c26",
  measurementId: "G-J83LQCJ94R"
};
const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;