import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    FiLogOut, FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
    FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVendors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        platformCommission: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentVendors, setRecentVendors] = useState([]);

    useEffect(() => {
        checkAdminAuth();
    }, []);

    const checkAdminAuth = async () => {
        const adminAuth = localStorage.getItem('adminAuthenticated');
        const { data: { session } } = await supabase.auth.getSession();

        if (!adminAuth || !session) {
            navigate('/admin-login');
            return;
        }

        await loadDashboardData();
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Get all vendors
            const { data: vendors, error: vendorsError } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (vendorsError) throw vendorsError;

            // Get all products
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*');

            if (productsError) throw productsError;

            // Get all orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            const totalOrders = orders?.length || 0;
            const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
            const platformCommission = orders?.reduce((sum, order) => sum + (order.platform_commission || 0), 0) || 0;
            const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0;

            setRecentOrders(orders?.slice(0, 5) || []);
            setRecentVendors(vendors?.slice(0, 5) || []);
            setStats({
                totalVendors: vendors?.length || 0,
                totalProducts: products?.length || 0,
                totalOrders: totalOrders,
                totalRevenue: totalRevenue,
                platformCommission: platformCommission,
                pendingOrders: pendingOrders
            });

        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminEmail');
        toast.success('Logged out');
        navigate('/admin-login');
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm">Platform performance at a glance</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    <FiLogOut /> Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Vendors</p>
                            <p className="text-2xl font-bold">{stats.totalVendors}</p>
                        </div>
                        <FiUsers className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Products</p>
                            <p className="text-2xl font-bold">{stats.totalProducts}</p>
                        </div>
                        <FiPackage className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold">{stats.totalOrders}</p>
                        </div>
                        <FiShoppingBag className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Orders</p>
                            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                        </div>
                        <FiAlertCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <FiDollarSign className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Platform Commission</p>
                            <p className="text-2xl font-bold">₦{stats.platformCommission.toLocaleString()}</p>
                        </div>
                        <FiTrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">Recent Orders</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentOrders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No orders yet</div>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">#{order.order_number?.slice(0, 8)}</p>
                                            <p className="text-sm text-gray-500">{order.customer_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₦{order.total_amount?.toLocaleString()}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">Recent Vendors</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentVendors.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No vendors yet</div>
                        ) : (
                            recentVendors.map(vendor => (
                                <div key={vendor.id} className="px-6 py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{vendor.business_name}</p>
                                            <p className="text-sm text-gray-500">{vendor.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${vendor.tier === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {vendor.tier || 'basic'}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{vendor.niche}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;