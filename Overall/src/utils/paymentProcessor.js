import PaystackPop from '@paystack/inline-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (only if Stripe public key exists)
let stripePromise = null;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

/**
 * Process Paystack payment (Nigerian vendors - NGN)
 * @param {object} options - Payment options
 * @returns {Promise} - Payment result
 */
export const processPaystackPayment = (options) => {
    return new Promise((resolve, reject) => {
        const paystack = new PaystackPop();

        paystack.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            email: options.email,
            amount: options.amount * 100, // Paystack uses kobo
            firstName: options.firstName,
            lastName: options.lastName,
            phone: options.phone,
            metadata: {
                orderId: options.orderId,
                custom_fields: [
                    { display_name: "Order ID", variable_name: "order_id", value: options.orderId }
                ]
            },
            onSuccess: (transaction) => {
                resolve({
                    success: true,
                    reference: transaction.reference,
                    transaction: transaction
                });
            },
            onCancel: () => {
                reject({ success: false, message: 'Payment cancelled by user' });
            },
            onError: (error) => {
                reject({ success: false, message: error.message });
            }
        });
    });
};

/**
 * Process Stripe payment (International vendors - USD, EUR, etc.)
 * @param {object} options - Payment options
 * @returns {Promise} - Payment result
 */
export const processStripePayment = async (options) => {
    if (!stripePromise) {
        throw new Error('Stripe is not configured');
    }

    try {
        const stripe = await stripePromise;

        // Call your backend to create a payment intent
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: options.amount,
                currency: options.currency || 'usd',
                orderId: options.orderId
            })
        });

        const { clientSecret } = await response.json();

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: options.cardElement,
                billing_details: {
                    name: options.customerName,
                    email: options.email
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return {
            success: true,
            reference: result.paymentIntent.id,
            transaction: result.paymentIntent
        };
    } catch (error) {
        throw { success: false, message: error.message };
    }
};

/**
 * Determine payment method based on vendor's currency/country
 * @param {string} currency - NGN, USD, EUR, etc.
 * @returns {string} - 'paystack' or 'stripe'
 */
export const getPaymentMethod = (currency) => {
    switch (currency?.toUpperCase()) {
        case 'NGN':
            return 'paystack';
        default:
            return 'stripe';
    }
};

/**
 * Format amount for display based on currency
 * @param {number} amount - Amount in base unit
 * @param {string} currency - Currency code
 * @returns {string} - Formatted amount
 */
export const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export default {
    processPaystackPayment,
    processStripePayment,
    getPaymentMethod,
    formatCurrency
};