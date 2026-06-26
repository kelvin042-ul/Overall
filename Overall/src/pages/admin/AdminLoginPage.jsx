import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiMail, FiLock, FiShield, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const user = data.user;
            const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];

            if (adminEmails.includes(user.email)) {
                localStorage.setItem('adminAuthenticated', 'true');
                localStorage.setItem('adminEmail', user.email);
                toast.success('Welcome Admin!');
                navigate('/admin/dashboard');
            } else {
                toast.error('Access denied. Admin only.');
                await supabase.auth.signOut();
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-white/10 rounded-full mb-4">
                        <FiShield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
                    <p className="text-gray-400 mt-2">Secure access to platform management</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-xs text-gray-500 justify-center">
                            <FiAlertCircle className="w-4 h-4" />
                            <span>Authorized personnel only</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;