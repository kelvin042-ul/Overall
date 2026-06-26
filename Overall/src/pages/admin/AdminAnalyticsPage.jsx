import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiTrendingUp, FiDollarSign, FiUsers, FiPackage, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalVendors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageOrderValue: 0,
        topVendors: [],
        topProducts: [],
        monthlyData: {}
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Get all vendors
            const { data: vendors, error: vendorsError } = await supabase
                .from('vendors')
                .select('id, business_name, total_earnings');

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

            const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
            const totalCommission = orders?.reduce((sum, o) => sum + (o.platform_commission || 0), 0) || 0;
            const averageOrderValue = orders?.length > 0 ? totalRevenue / orders.length : 0;

            // Calculate top vendors by earnings
            const vendorSales = {};
            orders?.forEach(order => {
                Object.entries(order.vendor_earnings || {}).forEach(([vendorId, amount]) => {
                    vendorSales[vendorId] = (vendorSales[vendorId] || 0) + amount;
                });
            });

            const topVendors = Object.entries(vendorSales)
                .map(([vendorId, sales]) => {
                    const vendor = vendors?.find(v => v.id === vendorId);
                    return { name: vendor?.business_name || vendorId.slice(0, 8), sales };
                })
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            // Calculate top products
            const productSales = {};
            orders?.forEach(order => {
                order.items?.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
                });
            });

            const topProducts = Object.entries(productSales)
                .map(([name, quantity]) => ({ name, quantity }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            // Calculate monthly data
            const monthlyData = {};
            orders?.forEach(order => {
                if (order.created_at) {
                    const date = new Date(order.created_at);
                    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                    if (!monthlyData[month]) {
                        monthlyData[month] = { revenue: 0, orders: 0, commission: 0 };
                    }
                    monthlyData[month].revenue += order.total_amount || 0;
                    monthlyData[month].orders += 1;
                    monthlyData[month].commission += order.platform_commission || 0;
                }
            });

            setAnalytics({
                totalVendors: vendors?.length || 0,
                totalProducts: products?.length || 0,
                totalOrders: orders?.length || 0,
                totalRevenue: totalRevenue,
                totalCommission: totalCommission,
                averageOrderValue: averageOrderValue,
                topVendors: topVendors,
                topProducts: topProducts,
                monthlyData: monthlyData
            });

        } catch (error) {
            console.error('Error loading analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
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
                <h1 className="text-2xl font-bold">Platform Analytics</h1>
                <p className="text-gray-500 text-sm">Comprehensive marketplace insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Revenue</p>
                            <p className="text-3xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <FiDollarSign className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Platform Commission</p>
                            <p className="text-3xl font-bold">₦{analytics.totalCommission.toLocaleString()}</p>
                        </div>
                        <FiTrendingUp className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Orders</p>
                            <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                        </div>
                        <FiShoppingBag className="w-10 h-10 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Active Vendors</p>
                            <p className="text-3xl font-bold">{analytics.totalVendors}</p>
                        </div>
                        <FiUsers className="w-10 h-10 opacity-80" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <FiPackage className="w-6 h-6 text-gray-400" />
                        <h3 className="font-bold">Total Products</h3>
                    </div>
                    <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                    <p className="text-sm text-gray-500 mt-1">Across all vendors</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <FiTrendingUp className="w-6 h-6 text-gray-400" />
                        <h3 className="font-bold">Average Order Value</h3>
                    </div>
                    <p className="text-3xl font-bold">₦{analytics.averageOrderValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <FiCalendar className="w-6 h-6 text-gray-400" />
                        <h3 className="font-bold">Platform Health</h3>
                    </div>
                    <p className="text-3xl font-bold">{((analytics.totalOrders / (analytics.totalVendors || 1))).toFixed(1)}</p>
                    <p className="text-sm text-gray-500 mt-1">Orders per vendor avg</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">🏆 Top Performing Vendors</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {analytics.topVendors.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No sales data yet</div>
                        ) : (
                            analytics.topVendors.map((vendor, idx) => (
                                <div key={idx} className="px-6 py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                                        <span className="font-medium">{vendor.name}</span>
                                    </div>
                                    <span className="font-bold">₦{vendor.sales.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-bold">🔥 Top Selling Products</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {analytics.topProducts.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No product sales yet</div>
                        ) : (
                            analytics.topProducts.map((product, idx) => (
                                <div key={idx} className="px-6 py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                                        <span className="font-medium">{product.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{product.quantity} sold</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-bold">Monthly Performance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="text-left">
                                <th className="px-6 py-3 text-sm font-medium">Month</th>
                                <th className="px-6 py-3 text-sm font-medium">Orders</th>
                                <th className="px-6 py-3 text-sm font-medium">Revenue</th>
                                <th className="px-6 py-3 text-sm font-medium">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(analytics.monthlyData).map(([month, data]) => (
                                <tr key={month}>
                                    <td className="px-6 py-4 text-sm font-medium">{month}</td>
                                    <td className="px-6 py-4 text-sm">{data.orders}</td>
                                    <td className="px-6 py-4 font-medium">₦{data.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-4">₦{data.commission.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;