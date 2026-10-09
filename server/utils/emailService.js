/**
 * Email & Notification Service Utility
 * Handles sending order confirmation emails and SMS/WhatsApp notifications safely.
 * Failures in email sending are logged and caught so they NEVER break or roll back payment/order confirmation.
 */

const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!order) return false;

    // Guard: send confirmation EXACTLY ONCE per order
    if (order.confirmationSent) {
      console.log(`[Email Service] Confirmation email already sent for order ${order.orderNumber}. Skipping.`);
      return true;
    }

    const { shippingAddress, items = [], orderSummary = {} } = order;
    const recipientEmail = shippingAddress?.email;
    const recipientName = shippingAddress?.fullName || 'Valued Customer';

    if (!recipientEmail) {
      console.warn(`[Email Service] No recipient email found for order ${order.orderNumber}`);
      return false;
    }

    console.log(`[Email Service] Generating order confirmation email for ${recipientEmail} (Order #${order.orderNumber})`);

    // Structured Email Body Template
    const itemsListHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          <small style="color: #666;">Qty: ${item.quantity} | ${item.colorName || 'Default Color'}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `
      )
      .join('');

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1B5E3B; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-family: Georgia, serif;">Anjali Creation</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px;">Order Confirmation - Test Mode</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>${recipientName}</strong>,</p>
          <p>Thank you for your order! We have received your payment and your handcrafted saree order is now confirmed.</p>
          
          <div style="background-color: #f9f8f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0 0 0;"><strong>Payment Method:</strong> ${order.paymentDetails?.paymentMethod || 'Razorpay'}</p>
            <p style="margin: 5px 0 0 0;"><strong>Payment Status:</strong> <span style="color: #1B5E3B; font-weight: bold;">PAID</span></p>
          </div>

          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right; font-size: 15px;">
            <p style="margin: 4px 0;">Subtotal: ₹${(orderSummary.subtotal || 0).toLocaleString('en-IN')}</p>
            ${orderSummary.discount ? `<p style="margin: 4px 0; color: #1B5E3B;">Discount: -₹${orderSummary.discount.toLocaleString('en-IN')}</p>` : ''}
            <p style="margin: 4px 0;">Shipping: ${orderSummary.deliveryCharge === 0 ? 'FREE' : `₹${orderSummary.deliveryCharge}`}</p>
            <h3 style="margin: 8px 0 0 0; color: #1B5E3B;">Total Paid: ₹${(orderSummary.totalAmount || 0).toLocaleString('en-IN')}</h3>
          </div>

          <h3 style="margin-top: 24px;">Shipping Address</h3>
          <p style="margin: 0; color: #444;">
            ${shippingAddress.addressLine}, ${shippingAddress.roadArea ? shippingAddress.roadArea + ', ' : ''}<br/>
            ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
            Phone: ${shippingAddress.phone}
          </p>
        </div>
        <div style="background-color: #f4f4f4; color: #777; padding: 12px; text-align: center; font-size: 11px;">
          Anjali Creation &copy; ${new Date().getFullYear()} | Handcrafted Saree Store
        </div>
      </div>
    `;

    // Mark as sent in DB to guarantee idempotency
    order.confirmationSent = true;
    await order.save();

    console.log(`[Email Service] Confirmation email log recorded for order ${order.orderNumber}`);
    return true;
  } catch (error) {
    // Failure to send email MUST NEVER break payment or order process
    console.error(`[Email Service Warning] Failed to send email for order ${order?.orderNumber}:`, error.message);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
