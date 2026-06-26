import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import EarningsChart from '../../components/EarningsChart';
import UpgradeModal from '../../components/UpgradeModal';

const VendorDashboardPage = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        await loadVendorData(session.user.id);
    };

    const loadVendorData = async (authId) => {
        setLoading(true);
        try {
            // 1. Get vendor profile from Supabase using auth_id
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (vendorError) throw vendorError;
            if (!vendorData) {
                navigate('/login');
                return;
            }
            setVendor(vendorData);

            // 2. Get vendor's products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('vendor_id', vendorData.id)
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData || []);

            // 3. Get orders containing this vendor's products
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('*, orders(*)')
                .eq('vendor_id', vendorData.id);

            if (orderItemsError) throw orderItemsError;

            // Process orders for display
            const vendorOrders = (orderItemsData || []).map(item => ({
                id: item.orders?.id,
                order_number: item.orders?.order_number,
                customer_name: item.orders?.customer_name,
                customer_phone: item.orders?.customer_phone,
                address: item.orders?.address,
                status: item.orders?.status,
                created_at: item.orders?.created_at,
                vendorTotal: item.vendor_earning,
                vendorItems: [item]
            }));

            setOrders(vendorOrders);

        } catch (error) {
            console.error('Error loading vendor data:', error);
            toast.error('Failed to load dashboard: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (newTier) => {
        const vendorId = vendor?.id;
        if (!vendorId) return;

        try {
            const commissionRate = newTier === 'premium' ? 2 : newTier === 'enterprise' ? 1 : 5;
            const maxProducts = newTier === 'premium' ? 500 : newTier === 'enterprise' ? 999999 : 50;

            const { error } = await supabase
                .from('vendors')
                .update({
                    tier: newTier,
                    commission_rate: commissionRate,
                    max_products: maxProducts,
                    updated_at: new Date().toISOString()
                })
                .eq('id', vendorId);

            if (error) throw error;

            toast.success(`Upgraded to ${newTier}!`);
            await loadVendorData(vendor.auth_id);
        } catch (error) {
            toast.error('Upgrade failed');
        }
    };

    const totalSales = orders.reduce((sum, o) => sum + (o.vendorTotal || 0), 0);
    const totalCommission = totalSales * (vendor?.commission_rate || 5) / 100;
    const netEarnings = totalSales - totalCommission;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const productLimit = vendor?.max_products || 50;
    const productUsagePercent = (products.length / productLimit) * 100;

    if (loading) {
        return (
            <VendorLayout>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            {/* Upgrade Banner */}
            {vendor?.tier === 'basic' && productUsagePercent > 70 && (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <p className="font-medium text-purple-800">📈 You're growing fast!</p>
                            <p className="text-sm text-purple-700">Upgrade to Premium for lower commission and more products.</p>
                        </div>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Sales</p>
                            <p className="text-2xl font-bold">₦{totalSales.toLocaleString()}</p>
                        </div>
                        <FiShoppingBag className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Your Earnings</p>
                            <p className="text-2xl font-bold">₦{netEarnings.toLocaleString()}</p>
                        </div>
                        <FiDollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Products</p>
                            <p className="text-2xl font-bold">{products.length}/{productLimit}</p>
                        </div>
                        <FiPackage className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min(productUsagePercent, 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Orders</p>
                            <p className="text-2xl font-bold">{pendingOrders}</p>
                        </div>
                        <FiTruck className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Earnings Chart */}
            <div className="mb-8">
                <EarningsChart orders={orders} vendor={vendor} />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        View All →
                    </button>
                </div>

                {orders.slice(0, 5).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                    <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="border-b pb-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">#{order.order_number || order.id?.slice(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₦{order.vendorTotal?.toLocaleString()}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal
                    onClose={() => setShowUpgradeModal(false)}
                    currentTier={vendor?.tier || 'basic'}
                    onUpgrade={handleUpgrade}
                />
            )}
        </VendorLayout>
    );
};

export default VendorDashboardPage;