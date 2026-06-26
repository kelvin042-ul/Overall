import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiLock, FiShield, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VendorLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sign in with Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            const user = data.user;

            // Get vendor profile from Supabase
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', user.id)
                .single();

            if (vendorError || !vendorData) {
                toast.error('No vendor account found');
                await supabase.auth.signOut();
                return;
            }

            if (vendorData.status !== 'active') {
                toast.error('Your account is suspended. Contact support.');
                await supabase.auth.signOut();
                return;
            }

            localStorage.setItem('userRole', 'vendor');
            localStorage.setItem('vendorId', vendorData.id);
            localStorage.setItem('vendorTier', vendorData.tier);

            toast.success(`Welcome back, ${vendorData.business_name}!`);
            navigate('/vendor/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-black rounded-full mb-4">
                        <FiShield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Vendor Login</h1>
                    <p className="text-gray-600 mt-2">Access your seller dashboard</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                    placeholder="vendor@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Logging in...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have a vendor account?{' '}
                            <Link to="/vendor/signup" className="text-black font-medium hover:underline">
                                Sign up here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-black transition-colors">
                            ← Back to Store
                        </Link>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <FiAlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Vendor Benefits</p>
                            <p className="text-xs text-blue-600 mt-1">
                                • 5% commission only on sales<br />
                                • Free product listings (up to 50)<br />
                                • Weekly payouts<br />
                                • 24/7 vendor support
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLoginPage;