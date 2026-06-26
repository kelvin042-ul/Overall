import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiEdit2, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import EarningsChart from '../../components/EarningsChart';

const VendorEarningsPage = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountName: '',
        accountNumber: '',
        bankName: ''
    });

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
            // Get vendor
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (vendorError) throw vendorError;
            setVendor(vendorData);
            setBankDetails(vendorData.bank_details || { accountName: '', accountNumber: '', bankName: '' });

            // Get order items for earnings
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('*, orders(*)')
                .eq('vendor_id', vendorData.id);

            if (orderItemsError) throw orderItemsError;

            const vendorOrders = (orderItemsData || []).map(item => ({
                id: item.orders?.id,
                created_at: item.orders?.created_at,
                vendorTotal: item.vendor_earning
            }));

            setOrders(vendorOrders);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load earnings');
        } finally {
            setLoading(false);
        }
    };

    const updateBankDetails = async (e) => {
        e.preventDefault();
        if (!vendor) return;

        try {
            const { error } = await supabase
                .from('vendors')
                .update({ bank_details: bankDetails })
                .eq('id', vendor.id);

            if (error) throw error;

            toast.success('Bank details updated!');
            setShowBankModal(false);
        } catch (error) {
            toast.error('Failed to update bank details');
        }
    };

    const totalSales = orders.reduce((sum, o) => sum + (o.vendorTotal || 0), 0);
    const totalCommission = totalSales * (vendor?.commission_rate || 5) / 100;
    const netEarnings = totalSales - totalCommission;

    if (loading) {
        return (
            <VendorLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Earnings</h1>
                <p className="text-gray-500 text-sm">Track your sales and payout history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Total Sales</p>
                            <p className="text-3xl font-bold">₦{totalSales.toLocaleString()}</p>
                        </div>
                        <FiCreditCard className="w-10 h-10 opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Platform Fee ({vendor?.commission_rate || 5}%)</p>
                            <p className="text-3xl font-bold">₦{totalCommission.toLocaleString()}</p>
                        </div>
                        <FiCreditCard className="w-10 h-10 opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Your Earnings</p>
                            <p className="text-3xl font-bold">₦{netEarnings.toLocaleString()}</p>
                        </div>
                        <FiCreditCard className="w-10 h-10 opacity-80" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Payout Information</h2>
                    <button onClick={() => setShowBankModal(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <FiEdit2 /> Update Bank Details
                    </button>
                </div>
                {vendor?.bank_details?.accountName ? (
                    <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Account Name:</span> {vendor.bank_details.accountName}</p>
                        <p><span className="text-gray-500">Account Number:</span> {vendor.bank_details.accountNumber}</p>
                        <p><span className="text-gray-500">Bank Name:</span> {vendor.bank_details.bankName}</p>
                    </div>
                ) : (
                    <p className="text-yellow-600 text-sm">No bank details added. Add your bank information to receive payouts.</p>
                )}
                <p className="text-xs text-gray-400 mt-4">Payouts are processed monthly on the 5th of each month.</p>
            </div>

            <EarningsChart orders={orders} vendor={vendor} />

            {showBankModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Bank Details</h2>
                        <form onSubmit={updateBankDetails} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Account Name"
                                value={bankDetails.accountName}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                className="w-full border p-2 rounded focus:outline-none focus:border-black"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Account Number"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                className="w-full border p-2 rounded focus:outline-none focus:border-black"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Bank Name"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                className="w-full border p-2 rounded focus:outline-none focus:border-black"
                                required
                            />
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">Save</button>
                                <button type="button" onClick={() => setShowBankModal(false)} className="border px-6 py-2 rounded hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </VendorLayout>
    );
};

export default VendorEarningsPage;