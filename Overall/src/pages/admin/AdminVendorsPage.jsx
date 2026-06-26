import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiSearch, FiTrash2, FiUserX, FiUserCheck, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminVendorsPage = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState('all');

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVendors(data || []);
        } catch (error) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const updateVendorTier = async (vendorId, newTier) => {
        try {
            const commissionRate = newTier === 'premium' ? 2 : 5;
            const maxProducts = newTier === 'premium' ? 500 : 50;

            const { error } = await supabase
                .from('vendors')
                .update({
                    tier: newTier,
                    commission_rate: commissionRate,
                    max_products: maxProducts
                })
                .eq('id', vendorId);

            if (error) throw error;

            toast.success(`Vendor tier updated to ${newTier}`);
            loadVendors();
        } catch (error) {
            toast.error('Failed to update tier');
        }
    };

    const updateVendorStatus = async (vendorId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const { error } = await supabase
                .from('vendors')
                .update({ status: newStatus })
                .eq('id', vendorId);

            if (error) throw error;

            toast.success(`Vendor ${newStatus}`);
            loadVendors();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteVendor = async (vendorId, businessName) => {
        if (!window.confirm(`Delete vendor "${businessName}" permanently? This will also delete their products.`)) return;

        try {
            // Delete vendor's products first
            await supabase.from('products').delete().eq('vendor_id', vendorId);

            // Delete vendor
            const { error } = await supabase.from('vendors').delete().eq('id', vendorId);

            if (error) throw error;

            toast.success('Vendor deleted');
            loadVendors();
        } catch (error) {
            toast.error('Failed to delete vendor');
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'all' || vendor.tier === filterTier;
        return matchesSearch && matchesTier;
    });

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
                <h1 className="text-2xl font-bold">Vendors Management</h1>
                <p className="text-gray-500 text-sm">Manage all marketplace sellers</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by business name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>
                <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                    <option value="all">All Tiers</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                </select>
            </div>

            {filteredVendors.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No vendors found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left">
                                <th className="px-6 py-3 text-sm font-medium">Business</th>
                                <th className="px-6 py-3 text-sm font-medium">Contact</th>
                                <th className="px-6 py-3 text-sm font-medium">Niche</th>
                                <th className="px-6 py-3 text-sm font-medium">Tier</th>
                                <th className="px-6 py-3 text-sm font-medium">Status</th>
                                <th className="px-6 py-3 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium">{vendor.business_name}</p>
                                            <p className="text-xs text-gray-500">ID: {vendor.id?.slice(0, 8)}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{vendor.email}</p>
                                        <p className="text-xs text-gray-500">{vendor.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm">{vendor.niche || 'Not set'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                const newTier = vendor.tier === 'premium' ? 'basic' : 'premium';
                                                updateVendorTier(vendor.id, newTier);
                                            }}
                                            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${vendor.tier === 'premium'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <FiStar className="w-3 h-3" />
                                            {vendor.tier || 'basic'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${vendor.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {vendor.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateVendorStatus(vendor.id, vendor.status)}
                                                className={`p-1 rounded ${vendor.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                                title={vendor.status === 'active' ? 'Suspend' : 'Activate'}
                                            >
                                                {vendor.status === 'active' ? <FiUserX /> : <FiUserCheck />}
                                            </button>
                                            <button
                                                onClick={() => deleteVendor(vendor.id, vendor.business_name)}
                                                className="p-1 text-red-600 hover:text-red-800 rounded"
                                                title="Delete Vendor"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminVendorsPage;