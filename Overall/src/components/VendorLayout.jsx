import { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    FiPackage, FiShoppingBag, FiDollarSign, FiSettings,
    FiLogOut, FiMenu, FiX, FiBarChart2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const VendorLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/vendor/inbox', icon: FiMessageCircle, label: 'Inbox' },
        { path: '/vendor/dashboard', icon: FiBarChart2, label: 'Overview' },
        { path: '/vendor/products', icon: FiPackage, label: 'Products' },
        { path: '/vendor/orders', icon: FiShoppingBag, label: 'Orders' },
        { path: '/vendor/earnings', icon: FiDollarSign, label: 'Earnings' },
        { path: '/vendor/settings', icon: FiSettings, label: 'Settings' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('userRole');
        localStorage.removeItem('vendorId');
        localStorage.removeItem('vendorTier');
        toast.success('Logged out');
        navigate('/vendor/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b fixed top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold">Vendor Portal</h1>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                    {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 bg-white border-r w-64 transform transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Vendor Portal</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your store</p>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive(item.path)
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition mt-4"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default VendorLayout;