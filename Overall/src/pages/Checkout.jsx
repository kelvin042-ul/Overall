import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PaystackPop from '@paystack/inline-js';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vendorRates, setVendorRates] = useState({});
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
        loadVendorRates(savedCart);
    }, []);

    const loadVendorRates = async (cartItems) => {
        const uniqueVendors = [...new Set(cartItems.map(item => item.vendorId))];
        const rates = {};

        for (const vendorId of uniqueVendors) {
            const { data, error } = await supabase
                .from('vendors')
                .select('commission_rate')
                .eq('id', vendorId)
                .single();

            if (!error && data) {
                rates[vendorId] = data.commission_rate || 5;
            }
        }
        setVendorRates(rates);
    };

    // Calculate totals with commission
    const calculateOrderBreakdown = () => {
        const vendorEarnings = {};
        let platformCommission = 0;
        let totalAmount = 0;

        cart.forEach(item => {
            const commissionRate = vendorRates[item.vendorId] || 5;
            const itemTotal = item.price * item.quantity;
            const commission = (itemTotal * commissionRate) / 100;
            const vendorEarning = itemTotal - commission;

            vendorEarnings[item.vendorId] = (vendorEarnings[item.vendorId] || 0) + vendorEarning;
            platformCommission += commission;
            totalAmount += itemTotal;
        });

        return { vendorEarnings, platformCommission, totalAmount };
    };

    const { vendorEarnings, platformCommission, totalAmount } = calculateOrderBreakdown();

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!formData.customerName || !formData.email || !formData.phone || !formData.address) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);

        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            amount: totalAmount * 100,
            email: formData.email,
            onSuccess: async (transaction) => {
                try {
                    // Generate order number
                    const orderNumber = `ORD-${Date.now()}`;

                    // Prepare order items for each vendor
                    const orderItems = cart.map(item => ({
                        vendor_id: item.vendorId,
                        product_id: item.id,
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        vendor_earning: (item.price * item.quantity) * (1 - (vendorRates[item.vendorId] || 5) / 100),
                        commission_rate: vendorRates[item.vendorId] || 5
                    }));

                    // 1. Insert order into Supabase
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            order_number: orderNumber,
                            customer_name: formData.customerName,
                            customer_email: formData.email,
                            customer_phone: formData.phone,
                            address: formData.address,
                            total_amount: totalAmount,
                            platform_commission: platformCommission,
                            vendor_earnings_total: Object.values(vendorEarnings).reduce((a, b) => a + b, 0),
                            status: 'Pending',
                            payment_reference: transaction.reference,
                            payment_method: 'paystack',
                            currency: 'NGN',
                            items: cart,
                            vendor_earnings: vendorEarnings
                        })
                        .select()
                        .single();

                    if (orderError) throw orderError;

                    // 2. Insert order items
                    const orderItemsWithOrderId = orderItems.map(item => ({
                        ...item,
                        order_id: orderData.id
                    }));

                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItemsWithOrderId);

                    if (itemsError) throw itemsError;

                    // 3. Update vendor earnings in vendors table
                    for (const [vendorId, earnings] of Object.entries(vendorEarnings)) {
                        const { data: vendorData } = await supabase
                            .from('vendors')
                            .select('total_earnings, pending_payout, total_sales')
                            .eq('id', vendorId)
                            .single();

                        if (vendorData) {
                            await supabase
                                .from('vendors')
                                .update({
                                    total_earnings: (vendorData.total_earnings || 0) + earnings,
                                    pending_payout: (vendorData.pending_payout || 0) + earnings,
                                    total_sales: (vendorData.total_sales || 0) + 1
                                })
                                .eq('id', vendorId);
                        }
                    }

                    // 4. Update product sold counts
                    for (const item of cart) {
                        const { data: productData } = await supabase
                            .from('products')
                            .select('sold_count, stock')
                            .eq('id', item.id)
                            .single();

                        if (productData) {
                            await supabase
                                .from('products')
                                .update({
                                    sold_count: (productData.sold_count || 0) + item.quantity,
                                    stock: (productData.stock || 0) - item.quantity
                                })
                                .eq('id', item.id);
                        }
                    }

                    // Clear cart
                    localStorage.removeItem('cart');
                    toast.success('Order placed successfully!');
                    navigate(`/track-order`);

                } catch (error) {
                    console.error('Order save error:', error);
                    toast.error('Payment successful but order save failed. Contact support.');
                }
            },
            onCancel: () => {
                toast.error('Payment cancelled');
                setLoading(false);
            }
        });
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-24">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full border p-3 rounded-lg"
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full border p-3 rounded-lg"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                required
                                className="w-full border p-3 rounded-lg"
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <textarea
                                placeholder="Delivery Address"
                                required
                                rows="3"
                                className="w-full border p-3 rounded-lg"
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 rounded-lg font-medium"
                            >
                                {loading ? 'Processing...' : `Pay ₦${totalAmount.toLocaleString()}`}
                            </button>
                        </form>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="font-bold mb-4">Order Summary</h2>
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between mb-2 text-sm">
                                <span>{item.name} x{item.quantity}</span>
                                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>₦{totalAmount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Platform fee already included</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;