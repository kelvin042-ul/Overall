import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiLock, FiPhone, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VendorSignupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        niche: ''
    });

    const niches = ['Clothes', 'Shoes', 'Electronics', 'Accessories', 'Furniture', 'Bags', 'Others'];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // 1. Sign up with Supabase Auth (email confirmation disabled)
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        business_name: formData.businessName,
                        role: 'vendor'
                    }
                }
            });

            if (signUpError) throw signUpError;

            const user = authData.user;

            // 2. Create vendor profile in Supabase vendors table
            const vendorData = {
                auth_id: user.id,
                business_name: formData.businessName,
                email: formData.email,
                phone: formData.phone || null,
                niche: formData.niche || null,
                tier: 'basic',
                commission_rate: 5,
                max_products: 50,
                status: 'active',
                total_earnings: 0,
                pending_payout: 0,
                total_sales: 0,
                product_count: 0
            };

            const { error: vendorError } = await supabase
                .from('vendors')
                .insert(vendorData);

            if (vendorError) throw vendorError;

            toast.success('Account created successfully! Please login.');

            // Redirect to LOGIN page, not dashboard
            navigate('/vendor/login');

        } catch (error) {
            console.error('Signup error:', error);
            if (error.message?.includes('duplicate key')) {
                toast.error('Email already registered. Please login.');
            } else {
                toast.error('Signup failed: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Start Selling Today</h1>
                    <p className="text-gray-600 mt-2">Join thousands of successful vendors on our platform</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <FiCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">No Setup Fee</p>
                        <p className="text-xs text-gray-500">Start for free</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <FiCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">5% Commission</p>
                        <p className="text-xs text-gray-500">Only on sales</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <FiCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Free Support</p>
                        <p className="text-xs text-gray-500">24/7 assistance</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Business Name *</label>
                            <div className="relative">
                                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Your Store Name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address *</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Password *</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="+234 812 345 6789"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">What are you selling? *</label>
                            <select
                                required
                                value={formData.niche}
                                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            >
                                <option value="">Select your niche</option>
                                {niches.map(niche => (
                                    <option key={niche} value={niche}>{niche}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Creating Account...' : 'Start Selling Now'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Already have a vendor account?{' '}
                            <Link to="/vendor/login" className="text-black font-medium hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSignupPage;