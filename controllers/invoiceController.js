const PDFDocument = require('pdfkit');
const Order = require('../models/orderModel');

/**
 * @desc    Generate downloadable PDF Invoice for an order
 * @route   GET /api/orders/:id/invoice
 * @access  Private
 */
const generateOrderInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id || req.params.orderId)
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check: only order owner or admin can download invoice
        if (
            req.user &&
            order.user &&
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to download this invoice' });
        }

        const invoiceId = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
        const invoiceDate = order.paidAt 
            ? new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        // Set response headers for direct download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`);

        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            info: {
                Title: `Invoice - ${invoiceId}`,
                Author: 'Glam Beauty',
                Subject: 'Order Invoice',
                Keywords: 'Glam Beauty, Invoice, Cosmetics, Beauty'
            }
        });

        doc.pipe(res);

        // --- Brand Colors ---
        const primaryColor = '#E11D48'; // Rose-600
        const darkTextColor = '#111827'; // Gray-900
        const mutedTextColor = '#4B5563'; // Gray-600
        const lightBgColor = '#FDF2F4'; // Rose-50
        const borderColor = '#E5E7EB'; // Gray-200

        // --- Header Section ---
        // Brand Name & Tagline
        doc.fillColor(primaryColor)
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('GLAM BEAUTY', 40, 45, { continued: true })
           .fillColor(darkTextColor)
           .font('Helvetica-Oblique')
           .text('  LUXURY BOUTIQUE');

        doc.fillColor(mutedTextColor)
           .fontSize(8.5)
           .font('Helvetica')
           .text('100% Authentic • Dermatologically Certified Cosmetics', 40, 75)
           .text('Email: support@glambeauty.com  |  GSTIN: 27AABCG1234F1Z8', 40, 88);

        // Invoice Metadata Badge (Top-Right)
        doc.rect(380, 40, 175, 60).fillAndStroke(lightBgColor, primaryColor);
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(12)
           .text('TAX INVOICE', 390, 48);

        doc.fillColor(darkTextColor)
           .fontSize(9)
           .font('Helvetica')
           .text(`Invoice No: ${invoiceId}`, 390, 64)
           .text(`Date: ${invoiceDate}`, 390, 76)
           .fillColor('#059669')
           .font('Helvetica-Bold')
           .text(`Status: ${order.isPaid ? 'PAID' : 'PENDING'}`, 390, 88);

        // Horizontal Divider
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(40, 115)
           .lineTo(555, 115)
           .stroke();

        // --- Customer & Order Information ---
        const customerName = order.user?.name || req.user?.name || 'Valued Customer';
        const customerEmail = order.user?.email || req.user?.email || 'N/A';
        const shipping = order.shippingAddress || {};
        const paymentId = order.paymentResult?.razorpay_payment_id || order.paymentResult?.id || 'Razorpay Test';

        // Column 1: Bill To
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('BILLED & SHIPPED TO:', 40, 130);

        doc.fillColor(darkTextColor)
           .font('Helvetica-Bold')
           .fontSize(9.5)
           .text(customerName, 40, 145);

        doc.font('Helvetica')
           .fillColor(mutedTextColor)
           .fontSize(8.5)
           .text(`${shipping.street || ''}`, 40, 158)
           .text(`${shipping.city || ''}, ${shipping.state || ''} ${shipping.zip || ''}`, 40, 170)
           .text(`${shipping.country || 'India'}`, 40, 182)
           .text(`Email: ${customerEmail}`, 40, 194);

        // Column 2: Payment Details
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('PAYMENT DETAILS:', 340, 130);

        doc.font('Helvetica')
           .fillColor(mutedTextColor)
           .fontSize(8.5)
           .text(`Payment Gateway: Razorpay Sandbox`, 340, 145)
           .text(`Payment ID: ${paymentId}`, 340, 158)
           .text(`Payment Method: ${order.paymentMethod || 'Online Payment'}`, 340, 170)
           .text(`Order Reference: #${order._id}`, 340, 182);

        // --- Items Table ---
        const tableTop = 220;
        doc.rect(40, tableTop, 515, 24).fill(primaryColor);

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(8.5)
           .text('#', 48, tableTop + 7)
           .text('ITEM DESCRIPTION', 75, tableTop + 7)
           .text('QTY', 360, tableTop + 7, { width: 35, align: 'center' })
           .text('UNIT PRICE', 405, tableTop + 7, { width: 65, align: 'right' })
           .text('AMOUNT', 480, tableTop + 7, { width: 65, align: 'right' });

        let currentY = tableTop + 24;
        const items = order.orderItems || [];

        items.forEach((item, index) => {
            const rowHeight = 22;
            const isEven = index % 2 === 0;

            if (isEven) {
                doc.rect(40, currentY, 515, rowHeight).fill('#F9FAFB');
            }

            doc.fillColor(darkTextColor)
               .font('Helvetica')
               .fontSize(8.5)
               .text(`${index + 1}`, 48, currentY + 6)
               .text(item.name || 'Cosmetic Item', 75, currentY + 6, { width: 275, ellipsis: true })
               .text(`${item.qty}`, 360, currentY + 6, { width: 35, align: 'center' })
               .text(`INR ${Number(item.price).toFixed(2)}`, 405, currentY + 6, { width: 65, align: 'right' })
               .text(`INR ${(Number(item.price) * Number(item.qty)).toFixed(2)}`, 480, currentY + 6, { width: 65, align: 'right' });

            doc.strokeColor(borderColor)
               .lineWidth(0.5)
               .moveTo(40, currentY + rowHeight)
               .lineTo(555, currentY + rowHeight)
               .stroke();

            currentY += rowHeight;
        });

        // --- Calculation Summary Section ---
        const summaryTop = currentY + 15;
        const itemsTotal = order.itemsPrice || items.reduce((acc, i) => acc + (i.price * i.qty), 0);
        const cgst = (itemsTotal * 0.09);
        const sgst = (itemsTotal * 0.09);
        const shippingFee = order.shippingPrice || (itemsTotal > 299 ? 0 : 50);
        const grandTotal = order.totalPrice || (itemsTotal + shippingFee);

        // Left box: Terms & Return Policy
        doc.rect(40, summaryTop, 260, 95).fillAndStroke('#F9FAFB', borderColor);
        doc.fillColor(darkTextColor)
           .font('Helvetica-Bold')
           .fontSize(8.5)
           .text('TERMS & CONDITIONS', 50, summaryTop + 10);

        doc.fillColor(mutedTextColor)
           .font('Helvetica')
           .fontSize(7.5)
           .text('• 7-day hassle-free returns on sealed & unopened products.', 50, summaryTop + 24)
           .text('• All taxes are calculated according to standard GST laws.', 50, summaryTop + 36)
           .text('• Keep this computer-generated invoice for warranty claims.', 50, summaryTop + 48)
           .text('• For customer support, reach us at support@glambeauty.com.', 50, summaryTop + 60)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('AUTHENTICITY 100% GUARANTEED', 50, summaryTop + 76);

        // Right box: Price Breakdown
        const rightColLabel = 340;
        const rightColVal = 460;
        let priceY = summaryTop + 4;

        doc.fillColor(mutedTextColor)
           .font('Helvetica')
           .fontSize(8.5)
           .text('Bag Subtotal:', rightColLabel, priceY)
           .text(`INR ${Number(itemsTotal).toFixed(2)}`, rightColVal, priceY, { width: 85, align: 'right' });

        priceY += 16;
        doc.text('CGST (9%):', rightColLabel, priceY)
           .text(`INR ${cgst.toFixed(2)}`, rightColVal, priceY, { width: 85, align: 'right' });

        priceY += 16;
        doc.text('SGST (9%):', rightColLabel, priceY)
           .text(`INR ${sgst.toFixed(2)}`, rightColVal, priceY, { width: 85, align: 'right' });

        priceY += 16;
        doc.text('Shipping & Delivery:', rightColLabel, priceY)
           .text(shippingFee === 0 ? 'FREE' : `INR ${Number(shippingFee).toFixed(2)}`, rightColVal, priceY, { width: 85, align: 'right' });

        priceY += 20;
        // Total highlight pill
        doc.rect(rightColLabel - 10, priceY - 4, 225, 24).fill(primaryColor);
        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('GRAND TOTAL:', rightColLabel, priceY + 3)
           .text(`INR ${Number(grandTotal).toFixed(2)}`, rightColVal, priceY + 3, { width: 85, align: 'right' });

        // --- Bottom Signature & Security Watermark ---
        const footerY = 740;
        doc.strokeColor(borderColor)
           .lineWidth(1)
           .moveTo(40, footerY)
           .lineTo(555, footerY)
           .stroke();

        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('GLAM BEAUTY BOUTIQUE VERIFIED', 40, footerY + 10);

        doc.fillColor(mutedTextColor)
           .font('Helvetica')
           .fontSize(7.5)
           .text('This is a computer-generated tax invoice. No signature required.', 40, footerY + 22)
           .text(`Generated on ${new Date().toLocaleString('en-IN')}`, 40, footerY + 32);

        // Digital stamp box
        doc.rect(430, footerY + 6, 125, 34).stroke(primaryColor);
        doc.fillColor(primaryColor)
           .fontSize(7)
           .font('Helvetica-Bold')
           .text('DIGITALLY VERIFIED', 435, footerY + 12, { align: 'center', width: 115 })
           .font('Helvetica')
           .fontSize(6.5)
           .text(`GATEWAY: RAZORPAY`, 435, footerY + 24, { align: 'center', width: 115 });

        doc.end();
    } catch (error) {
        console.error('Invoice generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
        }
    }
};

module.exports = {
    generateOrderInvoice
};
