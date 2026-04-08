# 🍽️ Dushan Caterers – AI Assisted Catering Management Web Application

> Best Outdoor Catering in Sri Lanka – Crystallize the uniqueness of a grand ceremony.

---

## 🚀 Project Overview

A full-stack AI-powered catering management web application built with **React.js**, **Node.js**, **Firebase**, and integrated AI features. Developed as CS25 Group Project.

---

## 📁 Project Structure

```
dushan-caterers/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js          # Responsive navbar with scroll effect
│   │   ├── Footer.js          # Full footer with links
│   │   └── AIChatbot.js       # AI chatbot with smart responses
│   ├── context/
│   │   └── AuthContext.js     # Firebase Auth context
│   ├── firebase/
│   │   └── config.js          # Firebase configuration
│   ├── pages/
│   │   ├── Home.js            # Landing page with hero, services, testimonials
│   │   ├── Menu.js            # Full menu with search & filters
│   │   ├── CustomizeMenu.js   # AI menu builder with real-time billing
│   │   ├── Auth.js            # Login & Register pages
│   │   ├── Dashboard.js       # Customer order management
│   │   ├── AdminPanel.js      # Admin management system
│   │   ├── About.js           # About page
│   │   └── Contact.js         # Contact form
│   ├── utils/
│   │   ├── menuData.js        # All menu items and packages
│   │   └── pdfGenerator.js    # PDF quotation & chef menu generation
│   ├── styles/
│   │   └── global.css         # Global styles with Cormorant Garamond + Jost fonts
│   ├── App.js                 # Routes & auth-protected routes
│   └── index.js               # Entry point
└── package.json
```

---

## ✨ Features

### Customer Features
- ✅ **User Registration & Login** (Firebase Auth)
- ✅ **AI Chatbot** (Dushi) for 24/7 support and menu recommendations  
- ✅ **Menu Browsing** with search, category filters, and dietary filters
- ✅ **3-Step Menu Customization** with event details
- ✅ **AI Recommendation Engine** – suggests menu based on event type & guest count
- ✅ **Real-Time Bill Preview** – live price calculation as you select items
- ✅ **Package Selection** – Budget / Standard / Premium packages
- ✅ **PDF Quotation Download** – professional branded PDF
- ✅ **Order Submission** – saved to Firebase Firestore
- ✅ **Customer Dashboard** – view all orders, status, amounts
- ✅ **Advance Payment Tracking** – 30% advance system

### Admin Features
- ✅ **Admin Dashboard** – stats overview (orders, revenue, customers)
- ✅ **Order Management** – view, update status, record payments
- ✅ **Customer Management** – view all registered customers with unique IDs
- ✅ **PDF Generation** – quotation PDFs + chef menu handover sheets
- ✅ **Reports** – monthly summary, top events, popular items

### AI Features
- ✅ **AI Chatbot** – context-aware responses for menus, pricing, events
- ✅ **Smart Menu Recommendations** – AI-powered package suggestions
- ✅ **Quick Replies** – preset buttons for common queries

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6 |
| Styling | Custom CSS, Google Fonts (Cormorant Garamond + Jost) |
| Backend/DB | Firebase Firestore |
| Auth | Firebase Authentication |
| PDF | jsPDF + jsPDF-AutoTable |
| Notifications | react-hot-toast |
| AI | Rule-based AI engine (extensible to OpenAI API) |

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "dushan-caterers"
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Copy your config and replace in `src/firebase/config.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 3: Create Admin User
After registering a user, go to Firebase Console → Firestore → users collection → find the user document → change `role` from `"customer"` to `"admin"`.

### Step 4: Run the Application
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firebase Firestore Structure

```
users/
  {uid}/
    uid, name, email, phone, role, customerId, createdAt

orders/
  {orderId}/
    userId, customerName, customerEmail
    eventType, eventDate, guestCount, venue
    items: [{id, name, price, unit, ...}]
    totalAmount, advancePaid
    status: pending | confirmed | completed | cancelled
    orderId, createdAt
```

---

## 🎨 Color Palette

| Color | Value | Usage |
|-------|-------|-------|
| Gold | `#D4AF37` | Primary accent |
| Dark | `#1A1A1A` | Backgrounds, text |
| Cream | `#F8F5EB` | Page background |
| White | `#FFFFFF` | Cards |

---

## 📦 Build for Production

```bash
npm run build
```

Deploy the `build/` folder to **Vercel** or **Netlify** (free tier).

---

## 👥 Team – CS25 Group 25

| Student ID | Name | Role |
|-----------|------|------|
| 2526016 | S.H. Nawagamuwa | Project Manager |
| 2525821 | R.A.D.I. Ranathunga | Startup Manager |
| 2526017 | N.Y. Senarathne | Risk Manager |
| 2433429 | M.I. Lemky Ahamed | QA Manager |
| 2526023 | A.I.P.J. Vithana | Schedule Manager |

**Client:** Mr. Dushantha Ranathunga  
**Supervisor:** Dr. Yasas Jayaweera  

---

## 📄 License

This project is developed for academic purposes at SCU.
