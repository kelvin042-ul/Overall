import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiSearch, FiTruck, FiCheckCircle, FiPackage, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast.success(`Order ${newStatus}`);
            loadOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'shipped': return <FiTruck className="w-5 h-5 text-blue-500" />;
            case 'processing': return <FiPackage className="w-5 h-5 text-purple-500" />;
            default: return <FiClock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-purple-100 text-purple-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <p className="text-gray-500 text-sm">Track and manage all customer orders</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
                    <p className="text-sm text-gray-500">Shipped</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    <p className="text-sm text-gray-500">Delivered</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order number or customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(order.status)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                    <p className="font-mono text-sm mt-1">Order #{order.order_number?.slice(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold">₦{order.total_amount?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Commission: ₦{order.platform_commission?.toLocaleString()}</p>
                                    <select
                                        value={order.status || 'Pending'}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className="mt-2 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <p className="font-medium text-sm mb-1">Customer Information</p>
                                    <p className="text-sm">{order.customer_name}</p>
                                    <p className="text-sm text-gray-600">{order.customer_email}</p>
                                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                                    <p className="text-sm text-gray-600">{order.address}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-1">Items</p>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-1">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="border-t mt-2 pt-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Vendor Earnings Split:</span>
                                        </div>
                                        {Object.entries(order.vendor_earnings || {}).map(([vendorId, amount]) => (
                                            <div key={vendorId} className="flex justify-between text-xs text-gray-600">
                                                <span>Vendor {vendorId.slice(0, 6)}</span>
                                                <span>₦{amount?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;