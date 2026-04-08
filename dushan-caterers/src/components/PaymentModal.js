// src/components/PaymentModal.js
import React, { useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Cloudinary config — loaded from .env
const CLOUDINARY_CLOUD =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "ddihoujg1";
const CLOUDINARY_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "ReceiptUploader";
import toast from "react-hot-toast";

const GOLD = "#D4AF37";
const DARK = "#1A1A1A";

// ── BANK DETAILS ──────────────────────────────────────────────────────────────
const BANK_DETAILS = {
  bankName: "Bank of Ceylon",
  accountName: "Dushan Caterers (PVT) LTD",
  accountNumber: "8001234567",
  branch: "Colombo Main Branch",
  branchCode: "001",
  swiftCode: "BCEYLKLX",
};

// ── PAYHERE CONFIG ────────────────────────────────────────────────────────────
// Replace these with your real PayHere merchant credentials from payhere.lk
const PAYHERE_MERCHANT_ID = "YOUR_MERCHANT_ID"; // e.g. "1211149"
const PAYHERE_NOTIFY_URL = "https://your-backend.com/payhere/notify"; // your server endpoint

export default function PaymentModal({
  order,
  currentUser,
  onClose,
  onPaymentSuccess,
}) {
  const [method, setMethod] = useState("payhere"); // 'payhere' | 'manual'
  const [slip, setSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const advanceAmount = Math.round((order.totalAmount || 0) * 0.3);
  const balance = (order.totalAmount || 0) - advanceAmount;

  // ── PayHere Payment ─────────────────────────────────────────────────────────
  const handlePayHere = () => {
    if (!window.payhere) {
      toast.error("PayHere is not loaded. Please refresh the page.");
      return;
    }

    const payment = {
      sandbox: true, // ← set to false in production
      merchant_id: PAYHERE_MERCHANT_ID,
      notify_url: PAYHERE_NOTIFY_URL,
      order_id: order.orderId,
      items: `Advance Payment – ${order.eventType} (${order.orderId})`,
      amount: advanceAmount.toFixed(2),
      currency: "LKR",
      first_name: currentUser?.displayName?.split(" ")[0] || "Customer",
      last_name: currentUser?.displayName?.split(" ").slice(1).join(" ") || "",
      email: currentUser?.email || "",
      phone: order.customerPhone || "0777000000",
      address: order.venue || "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",
    };

    window.payhere.onCompleted = async (orderId) => {
      try {
        await updateDoc(doc(db, "orders", order.id), {
          advancePaid: advanceAmount,
          status: "confirmed",
          paymentMethod: "payhere",
          paymentDate: new Date().toISOString(),
        });
        toast.success("Payment successful! Your order is confirmed.");
        onPaymentSuccess?.();
        onClose();
      } catch {
        toast.error("Payment recorded but update failed. Contact support.");
      }
    };

    window.payhere.onDismissed = () => {
      toast("Payment cancelled.");
    };

    window.payhere.onError = (error) => {
      toast.error(`Payment error: ${error}`);
    };

    window.payhere.startPayment(payment);
  };

  // ── Manual Slip Upload ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setSlip(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const handleSlipUpload = async () => {
    if (!slip) {
      toast.error("Please select a payment slip first");
      return;
    }
    setUploading(true);
    try {
      // Upload to Cloudinary using unsigned upload preset — no API key needed
      const formData = new FormData();
      formData.append("file", slip);
      formData.append("upload_preset", CLOUDINARY_PRESET);
      formData.append("folder", "payment-slips");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) throw new Error("Cloudinary upload failed");

      const data = await response.json();
      const downloadURL = data.secure_url; // HTTPS URL of uploaded image

      // Save URL to Firestore order document
      await updateDoc(doc(db, "orders", order.id), {
        advancePaid: advanceAmount,
        status: "confirmed",
        paymentMethod: "manual",
        paymentSlipUrl: downloadURL,
        paymentSlipName: slip.name,
        paymentDate: new Date().toISOString(),
        paymentNote: "Manual bank transfer — slip uploaded by customer",
      });

      toast.success("Payment slip uploaded! Admin will verify shortly.");
      onPaymentSuccess?.();
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h3 style={S.headerTitle}>Pay Advance</h3>
            <p style={S.headerSub}>
              {order.orderId} — {order.eventType}
            </p>
          </div>
          <button style={S.closeBtn} onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Amount Summary */}
        <div style={S.amountBox}>
          <div style={S.amountRow}>
            <span style={{ color: "#888", fontSize: 13 }}>
              Total Order Value
            </span>
            <span style={{ fontWeight: 700 }}>
              LKR {(order.totalAmount || 0).toLocaleString()}
            </span>
          </div>
          <div style={S.amountRow}>
            <span style={{ color: "#888", fontSize: 13 }}>
              Advance Required (30%)
            </span>
            <span style={{ fontWeight: 800, color: GOLD, fontSize: 18 }}>
              LKR {advanceAmount.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              ...S.amountRow,
              paddingTop: 8,
              borderTop: "1px dashed #ddd",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 12, color: "#aaa" }}>
              Balance after event
            </span>
            <span style={{ fontSize: 12, color: "#aaa" }}>
              LKR {balance.toLocaleString()}
            </span>
          </div>
          <div style={S.balanceNote}>
            <i
              className="bi bi-info-circle-fill"
              style={{ marginRight: 6, color: GOLD }}
            />
            Please complete the balance payment of{" "}
            <strong>LKR {balance.toLocaleString()}</strong> after the event.
          </div>
        </div>

        {/* Method Tabs */}
        <div style={S.tabs}>
          <button
            style={{ ...S.tab, ...(method === "manual" ? S.tabActive : {}) }}
            onClick={() => setMethod("manual")}
          >
            <i className="bi bi-bank" style={{ marginRight: 6 }} />
            Bank Transfer
          </button>
        </div>

        {/* Manual Bank Transfer */}
        {method === "manual" && (
          <div style={S.section}>
            <p style={S.sectionDesc}>
              Transfer the advance amount to the bank account below, then upload
              your payment slip for verification by our team.
            </p>

            {/* Bank Details */}
            <div style={S.bankBox}>
              <div style={S.bankTitle}>
                <i
                  className="bi bi-bank"
                  style={{ marginRight: 8, color: GOLD }}
                />
                Bank Account Details
              </div>
              {Object.entries({
                "Bank Name": BANK_DETAILS.bankName,
                "Account Name": BANK_DETAILS.accountName,
                "Account Number": BANK_DETAILS.accountNumber,
                Branch: BANK_DETAILS.branch,
                "Branch Code": BANK_DETAILS.branchCode,
                "SWIFT Code": BANK_DETAILS.swiftCode,
              }).map(([label, value]) => (
                <div key={label} style={S.bankRow}>
                  <span style={S.bankLabel}>{label}</span>
                  <span style={S.bankValue}>{value}</span>
                  <button
                    style={S.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(value);
                      toast.success(`${label} copied!`);
                    }}
                  >
                    <i className="bi bi-copy" />
                  </button>
                </div>
              ))}
              <div style={S.bankAmount}>
                Transfer Amount:{" "}
                <strong style={{ color: GOLD }}>
                  LKR {advanceAmount.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Slip Upload */}
            <div style={{ marginTop: 20 }}>
              <label style={S.uploadLabel}>Upload Payment Slip</label>
              <div style={S.uploadArea} onClick={() => fileRef.current.click()}>
                {slipPreview ? (
                  <img
                    src={slipPreview}
                    alt="slip"
                    style={{
                      maxHeight: 160,
                      maxWidth: "100%",
                      borderRadius: 8,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#aaa" }}>
                    <i
                      className="bi bi-cloud-upload-fill"
                      style={{
                        fontSize: 36,
                        color: "#ddd",
                        display: "block",
                        marginBottom: 8,
                      }}
                    />
                    <span style={{ fontSize: 13 }}>
                      Click to upload your payment slip
                    </span>
                    <br />
                    <span style={{ fontSize: 11 }}>
                      JPG, PNG, PDF — max 5MB
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {slip && (
                <p style={{ fontSize: 12, color: "#4CAF50", marginTop: 6 }}>
                  <i
                    className="bi bi-check-circle-fill"
                    style={{ marginRight: 4 }}
                  />
                  {slip.name}
                </p>
              )}
            </div>

            <button
              style={{
                ...S.payBtn,
                opacity: uploading ? 0.7 : 1,
                marginTop: 16,
              }}
              onClick={handleSlipUpload}
              disabled={uploading || !slip}
            >
              {uploading ? (
                <>
                  <i
                    className="bi bi-hourglass-split"
                    style={{ marginRight: 8 }}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <i
                    className="bi bi-cloud-upload-fill"
                    style={{ marginRight: 8 }}
                  />
                  Submit Payment Slip
                </>
              )}
            </button>
            <p style={S.secureNote}>
              <i
                className="bi bi-clock-fill"
                style={{ marginRight: 4, color: "#FF9800" }}
              />
              Our team will verify your payment within 24 hours and confirm your
              order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    zIndex: 3000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflowY: "auto",
    fontFamily: "Jost,sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px 16px",
    borderBottom: "2px solid #f5f5f5",
  },
  headerTitle: {
    fontFamily: "Cormorant Garamond,serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    margin: 0,
  },
  headerSub: { fontSize: 12, color: "#888", margin: "4px 0 0" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#888",
  },
  amountBox: {
    background: "#FFFBF0",
    border: `1px solid ${GOLD}30`,
    borderRadius: 10,
    margin: "16px 24px",
    padding: 16,
  },
  amountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    marginBottom: 8,
  },
  balanceNote: {
    background: "#FFF3E0",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    color: "#E65100",
    marginTop: 10,
    display: "flex",
    alignItems: "flex-start",
  },
  tabs: { display: "flex", gap: 8, padding: "0 24px 16px" },
  tab: {
    flex: 1,
    padding: "10px",
    border: "2px solid #eee",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Jost,sans-serif",
    color: "#888",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { borderColor: GOLD, background: `${GOLD}15`, color: DARK },
  section: { padding: "0 24px 24px" },
  sectionDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 1.7,
    marginBottom: 16,
  },
  payMethods: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  payBadge: {
    padding: "4px 12px",
    border: "1px solid #ddd",
    borderRadius: 20,
    fontSize: 11,
    color: "#555",
    fontWeight: 600,
  },
  payBtn: {
    width: "100%",
    padding: "13px",
    background: DARK,
    color: GOLD,
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Jost,sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  secureNote: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bankBox: {
    background: "#F8F8F8",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
  },
  bankTitle: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
  },
  bankRow: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #eee",
    fontSize: 13,
  },
  bankLabel: { color: "#888", width: 130, flexShrink: 0 },
  bankValue: { fontWeight: 600, flex: 1 },
  copyBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#aaa",
    fontSize: 13,
    padding: "0 4px",
  },
  bankAmount: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  uploadLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: DARK,
    marginBottom: 8,
  },
  uploadArea: {
    border: "2px dashed #ddd",
    borderRadius: 10,
    padding: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    transition: "border 0.2s",
  },
};
