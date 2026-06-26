import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { FiPrinter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Receipt = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const orderDoc = await getDoc(doc(db, 'orders', orderId));
            if (orderDoc.exists()) {
                setOrder({ id: orderDoc.id, ...orderDoc.data() });
            } else {
                toast.error('Order not found');
            }
        } catch (error) {
            toast.error('Error loading receipt');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <p>Loading receipt...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                <Link to="/" className="text-black underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-white border border-gray-200 rounded-lg p-8 print:border-0">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Order Confirmation</h1>
                    <p className="text-gray-600">Thank you for your purchase!</p>
                    <p className="text-sm text-gray-500 mt-2">Order ID: {order.orderId || order.id}</p>
                </div>

                {/* Order Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
                    <p className="text-green-800 font-medium">✓ Order Status: {order.status || 'Pending'}</p>
                    <p className="text-sm text-green-600 mt-1">You will receive WhatsApp updates on your order status</p>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold mb-3">Shipping Information</h3>
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-sm">{order.email}</p>
                        <p className="text-sm">{order.phone}</p>
                        <p className="text-sm">{order.address}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3">Order Information</h3>
                        <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm">Payment: {order.paymentMethod || 'Paystack'}</p>
                        <p className="text-sm">Status: {order.status || 'Pending'}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <h3 className="font-bold mb-3">Items Ordered</h3>
                    <table className="w-full">
                        <thead className="border-b">
                            <tr className="text-left">
                                <th className="pb-2">Product</th>
                                <th className="pb-2 text-center">Quantity</th>
                                <th className="pb-2 text-right">Price</th>
                                <th className="pb-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="py-3">{item.name}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-right">₦{item.price.toLocaleString()}</td>
                                    <td className="py-3 text-right">₦{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan="3" className="pt-3 text-right">Total:</td>
                                <td className="pt-3 text-right">₦{order.total.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-100 text-black px-6 py-2 rounded-lg hover:bg-gray-200"
                    >
                        <FiPrinter /> Print Receipt
                    </button>
                    <Link
                        to="/track-order"
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                        Track Order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Receipt;