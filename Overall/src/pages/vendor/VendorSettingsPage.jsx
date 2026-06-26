import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';

const VendorSettingsPage = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({
        businessName: '',
        phone: '',
        niche: '',
        shipping_policy: '',
        return_policy: '',
        warranty_info: '',
        payment_policy: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/vendor/login');
            return;
        }
        await loadVendorData(session.user.id);
    };

    const loadVendorData = async (authId) => {
        try {
            const { data: vendorData, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (error) throw error;

            setVendor(vendorData);
            setProfileForm({
                businessName: vendorData.business_name || '',
                phone: vendorData.phone || '',
                niche: vendorData.niche || ''
            });
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('vendors')
                .update({
                    business_name: profileForm.businessName,
                    phone: profileForm.phone,
                    niche: profileForm.niche
                })
                .eq('id', vendor.id);

            if (error) throw error;

            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordForm.newPassword
            });

            if (error) throw error;

            toast.success('Password updated successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setSaving(false);
        }
    };

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
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your account and profile</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FiUser className="w-6 h-6 text-black" />
                        <h2 className="text-xl font-bold">Profile Information</h2>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Business Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={profileForm.businessName}
                                    onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={vendor?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Niche/Category</label>
                            <select
                                value={profileForm.niche}
                                onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            >
                                <option value="">Select your niche</option>
                                <option value="Cloths">Cloths</option>
                                <option value="Shoes">Shoes</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Free shipping above (₦)</label>
                                <input
                                    type="number"
                                    value={profileForm.free_shipping_threshold || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, free_shipping_threshold: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="e.g., 50000"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave empty for no free shipping</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Base shipping cost (₦)</label>
                                <input
                                    type="number"
                                    value={profileForm.shipping_cost || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, shipping_cost: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="e.g., 2000"
                                />
                            </div>
                        </div>

                        {/* FAQ Section for Customers */}
                        <div className="mt-8 border-t pt-6">
                            <h3 className="font-bold text-lg mb-4">Customer FAQ (Visible on your products)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Shipping Policy</label>
                                    <textarea
                                        rows="2"
                                        value={profileForm.shipping_policy || ''}
                                        onChange={(e) => setProfileForm({ ...profileForm, shipping_policy: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                                        placeholder="e.g., Ships within 3-5 business days. Free shipping on orders over ₦50,000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Return Policy</label>
                                    <textarea
                                        rows="2"
                                        value={profileForm.return_policy || ''}
                                        onChange={(e) => setProfileForm({ ...profileForm, return_policy: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                                        placeholder="e.g., Returns accepted within 14 days. Item must be unused."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Warranty Information</label>
                                    <textarea
                                        rows="2"
                                        value={profileForm.warranty_info || ''}
                                        onChange={(e) => setProfileForm({ ...profileForm, warranty_info: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                                        placeholder="e.g., 30-day warranty against manufacturing defects"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                        >
                            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FiLock className="w-6 h-6 text-black" />
                        <h2 className="text-xl font-bold">Change Password</h2>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                        >
                            <FiShield /> {saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold mb-2">Account Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Account Type</p>
                        <p className="font-medium capitalize">{vendor?.tier || 'Basic'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Commission Rate</p>
                        <p className="font-medium">{vendor?.commission_rate || 5}%</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Max Products</p>
                        <p className="font-medium">{vendor?.max_products || 50}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Member Since</p>
                        <p className="font-medium">{new Date(vendor?.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
};

export default VendorSettingsPage;