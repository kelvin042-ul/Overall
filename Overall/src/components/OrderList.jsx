import { useState } from 'react';
import { FiSearch, FiTruck, FiCheckCircle, FiPackage, FiClock } from 'react-icons/fi';

const OrderList = ({ orders, onUpdateStatus, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <FiCheckCircle className="w-4 h-4 text-green-500" />;
            case 'shipped': return <FiTruck className="w-4 h-4 text-blue-500" />;
            case 'processing': return <FiPackage className="w-4 h-4 text-purple-500" />;
            default: return <FiClock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No orders yet</p>
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 max-w-xs">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by customer or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            {/* Orders */}
            <div className="space-y-3">
                {filteredOrders.map(order => {
                    const vendorItems = order.vendorItems || order.items || [];
                    const orderTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                    return (
                        <div key={order.id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-start flex-wrap gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(order.status)}
                                        <span className="text-sm font-medium">Order #{order.id.slice(0, 8)}</span>
                                    </div>
                                    <p className="text-sm mt-1">{order.customerName}</p>
                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₦{orderTotal.toLocaleString()}</p>
                                    <select
                                        value={order.status || 'Pending'}
                                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                        className="mt-2 text-sm border rounded px-2 py-1"
                                    >
                                        <option>Pending</option>
                                        <option>Processing</option>
                                        <option>Shipped</option>
                                        <option>Delivered</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t text-sm">
                                <p className="font-medium mb-1">Items:</p>
                                {vendorItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderList;