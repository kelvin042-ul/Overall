import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
    FiHome,
    FiShoppingBag,
    FiPackage,
    FiHelpCircle,
    FiGrid,
    FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const productsSnapshot = await getDocs(collection(db, 'products'));
            const products = productsSnapshot.docs.map(doc => doc.data());

            const counts = {};
            products.forEach(product => {
                if (product.category) {
                    counts[product.category] = (counts[product.category] || 0) + 1;
                }
            });

            const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
            setCategoryCounts(counts);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/shop?category=${category}`);
        onClose();
    };

    const navLinks = [
        { icon: FiHome, label: 'Home', path: '/' },
        { icon: FiShoppingBag, label: 'Shop', path: '/shop' },
        { icon: FiPackage, label: 'Track Order', path: '/track-order' },
        { icon: FiHelpCircle, label: 'Help & FAQs', path: '/faq' },
    ];

    return (
        <>
            {/* Overlay - darkens background when sidebar is open */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 transition-transform duration-300 transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0`}
                onClick={onClose}
            />

            {/* Sidebar Panel - slides from left, does NOT push content */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-full overflow-y-auto pb-20">
                    {/* Navigation Links - NO DUPLICATE NAVBAR ITEMS */}
                    <div className="p-4 border-b">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Navigation
                        </h3>
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Shop by Category
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    navigate('/shop');
                                    onClose();
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex justify-between items-center text-sm"
                            >
                                <span>All Products</span>
                                <span className="text-xs text-gray-500">{Object.values(categoryCounts).reduce((a, b) => a + b, 0)}</span>
                            </button>

                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex justify-between items-center text-sm"
                                >
                                    <span>{category}</span>
                                    <span className="text-xs text-gray-500">{categoryCounts[category] || 0}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sell on Platform Button */}
                    <div className="p-4 border-t mt-4">
                        <Link
                            to="/vendor/signup"
                            onClick={onClose}
                            className="block w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition"
                        >
                            Sell on Platform
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;