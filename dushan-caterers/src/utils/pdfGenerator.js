// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateQuotationPDF(order, user) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DUSHAN CATERERS', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Best Outdoor Catering in Sri Lanka', pageWidth / 2, 27, { align: 'center' });
  doc.text('Tel: 0777 510 513  |  Email: dushan@dushancaterers.lk', pageWidth / 2, 35, { align: 'center' });

  // Quotation Title
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CATERING QUOTATION', pageWidth / 2, 58, { align: 'center' });

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(14, 62, pageWidth - 14, 62);

  // Order Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const quoteNo = 'DC-Q' + Date.now().toString().slice(-6);
  const date = new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.text(`Quotation No: ${quoteNo}`, 14, 72);
  doc.text(`Date: ${date}`, pageWidth - 14, 72, { align: 'right' });
  doc.text(`Customer: ${user?.name || order.customerName}`, 14, 80);
  doc.text(`Event Type: ${order.eventType}`, pageWidth - 14, 80, { align: 'right' });
  doc.text(`Event Date: ${order.eventDate}`, 14, 88);
  doc.text(`No. of Guests: ${order.guestCount}`, pageWidth - 14, 88, { align: 'right' });
  doc.text(`Venue: ${order.venue || 'To be confirmed'}`, 14, 96);

  // Items Table
  const tableData = order.items.map(item => [
    item.name,
    item.unit || 'per person',
    item.quantity || order.guestCount,
    `LKR ${item.price.toLocaleString()}`,
    `LKR ${(item.price * (item.quantity || order.guestCount)).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 105,
    head: [['Item', 'Unit', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [212, 175, 55],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [248, 245, 235] },
    columnStyles: {
      0: { cellWidth: 70 },
      4: { fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  const subtotal = order.totalAmount;
  const advancePaid = order.advancePaid || 0;
  const balance = subtotal - advancePaid;

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 80, finalY, pageWidth - 14, finalY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - 80, finalY + 8);
  doc.text(`LKR ${subtotal.toLocaleString()}`, pageWidth - 14, finalY + 8, { align: 'right' });
  doc.text('Advance Paid:', pageWidth - 80, finalY + 16);
  doc.text(`LKR ${advancePaid.toLocaleString()}`, pageWidth - 14, finalY + 16, { align: 'right' });

  doc.setFillColor(26, 26, 26);
  doc.rect(pageWidth - 82, finalY + 20, 68, 12, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Balance Due:', pageWidth - 80, finalY + 28.5);
  doc.text(`LKR ${balance.toLocaleString()}`, pageWidth - 14, finalY + 28.5, { align: 'right' });

  // Notes
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Terms & Conditions:', 14, finalY + 45);
  doc.setFont('helvetica', 'normal');
  doc.text('• 30% advance payment required to confirm booking.', 14, finalY + 53);
  doc.text('• Prices are subject to change based on market conditions.', 14, finalY + 60);
  doc.text('• Cancellation policy: 48 hours notice required.', 14, finalY + 67);

  // Footer
  doc.setFillColor(26, 26, 26);
  doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(8);
  doc.text('Thank you for choosing Dushan Caterers – Crystallize the uniqueness of a grand ceremony', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

  doc.save(`Dushan_Caterers_Quote_${quoteNo}.pdf`);
}

export function generateChefMenuPDF(order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CHEF MENU SHEET', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Dushan Caterers (PVT) LTD', pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Event: ${order.eventType}`, 14, 55);
  doc.text(`Date: ${order.eventDate}`, 14, 63);
  doc.text(`Guests: ${order.guestCount}`, 14, 71);
  doc.text(`Venue: ${order.venue || 'TBC'}`, 14, 79);

  const tableData = order.items.map(item => [
    item.name,
    item.category || '-',
    `${item.quantity || order.guestCount} servings`,
    item.dietary?.join(', ') || 'Non-veg',
    'Prepare by event time'
  ]);

  doc.autoTable({
    startY: 88,
    head: [['Dish Name', 'Category', 'Quantity', 'Dietary', 'Notes']],
    body: tableData,
    headStyles: { fillColor: [212, 175, 55], textColor: [26, 26, 26], fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 245, 235] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Chef_Menu_${order.eventType}_${order.eventDate}.pdf`);
}
