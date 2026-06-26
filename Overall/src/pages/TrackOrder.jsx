import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FiPackage, FiCheckCircle, FiTruck, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const trackOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('orderId', '==', orderId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const orderData = querySnapshot.docs[0].data();
                setOrder({ id: querySnapshot.docs[0].id, ...orderData });
            } else {
                toast.error('Order not found');
                setOrder(null);
            }
        } catch (error) {
            toast.error('Error tracking order');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <FiPackage className="w-8 h-8 text-yellow-500" />;
            case 'Processing': return <FiAlertCircle className="w-8 h-8 text-blue-500" />;
            case 'Shipped': return <FiTruck className="w-8 h-8 text-purple-500" />;
            case 'Delivered': return <FiMapPin className="w-8 h-8 text-green-500" />;
            default: return <FiPackage className="w-8 h-8 text-gray-500" />;
        }
    };

    const getStatusStep = (currentStatus) => {
        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = steps.indexOf(currentStatus);

        return steps.map((step, index) => (
            <div key={step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentIndex ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                        {index <= currentIndex ? <FiCheckCircle /> : index + 1}
                    </div>
                    <p className="mt-2 text-sm font-medium">{step}</p>
                    {index < steps.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${index < currentIndex ? 'bg-black' : 'bg-gray-200'
                            }`} style={{ transform: 'translateX(10%)' }} />
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>

            <form onSubmit={trackOrder} className="mb-12">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter your Order ID (e.g., ORD-1234567890)"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-black"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {loading ? 'Tracking...' : 'Track Order'}
                    </button>
                </div>
            </form>

            {order && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">Order #{order.orderId}</h2>
                        <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            {getStatusStep(order.status)}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-bold mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>₦{order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="border-t border-gray-200 mt-6 pt-6">
                        <h3 className="font-bold mb-2">Shipping Information</h3>
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-sm">{order.phone}</p>
                        <p className="text-sm">{order.address}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;