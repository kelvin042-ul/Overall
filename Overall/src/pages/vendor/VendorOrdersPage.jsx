import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import OrderList from '../../components/OrderList';

const VendorOrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        await loadVendorAndOrders(session.user.id);
    };

    const loadVendorAndOrders = async (authId) => {
        setLoading(true);
        try {
            // Get vendor
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (vendorError) throw vendorError;
            setVendor(vendorData);

            // Get order items for this vendor with order details
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('*, orders(*)')
                .eq('vendor_id', vendorData.id)
                .order('created_at', { ascending: false });

            if (orderItemsError) throw orderItemsError;

            // Group by order
            const ordersMap = new Map();
            (orderItemsData || []).forEach(item => {
                const order = item.orders;
                if (!ordersMap.has(order.id)) {
                    ordersMap.set(order.id, {
                        id: order.id,
                        order_number: order.order_number,
                        customer_name: order.customer_name,
                        customer_phone: order.customer_phone,
                        address: order.address,
                        status: order.status,
                        created_at: order.created_at,
                        vendorItems: [],
                        vendorTotal: 0
                    });
                }
                const orderObj = ordersMap.get(order.id);
                orderObj.vendorItems.push(item);
                orderObj.vendorTotal += item.vendor_earning;
            });

            setOrders(Array.from(ordersMap.values()));
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast.success(`Order ${newStatus}`);
            await loadVendorAndOrders(vendor?.auth_id);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.vendorTotal || 0), 0)
    };

    return (
        <VendorLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-gray-500 text-sm">Track and manage customer orders</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            </div>

            <OrderList
                orders={orders}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
            />
        </VendorLayout>
    );
};

export default VendorOrdersPage;