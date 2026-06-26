export const sendWhatsAppMessage = (phoneNumber, message) => {
    // Remove any non-digit characters from phone number
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

export const notifyAdminOnOrder = (order, adminPhone) => {
    const message = `🛒 NEW ORDER #${order.orderId}\n\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nTotal: ₦${order.total.toLocaleString()}\n\nItems:\n${order.items.map(item => `- ${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nAddress: ${order.address}\n\nPlease log in to admin dashboard to update status.`;
    sendWhatsAppMessage(adminPhone, message);
};

export const notifyCustomerOnShipping = (order, customerPhone) => {
    const message = `📦 Your order #${order.orderId} has been ${order.status.toLowerCase()}!\n\nOrder Status: ${order.status}\n\nTrack your order anytime at our website.\n\nThank you for shopping with us!`;
    sendWhatsAppMessage(customerPhone, message);
};

export const notifyCustomerOnDelivery = (order, customerPhone) => {
    const message = `✅ Your order #${order.orderId} has been delivered!\n\nThank you for shopping with us. We hope you enjoy your purchase!\n\nPlease leave us a review if you loved our service.`;
    sendWhatsAppMessage(customerPhone, message);
};