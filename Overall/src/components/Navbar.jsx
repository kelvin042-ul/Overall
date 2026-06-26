import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import UnitConverter from './UnitConverter';
import TopBanner from './TopBanner';

// Hardcoded categories
const categories = {
    'Cloths': ['Men', 'Women', 'Children'],
    'Furniture': ['Table', 'Chairs', 'Sofas', 'Beds'],
    'Bags': ['Backpack', 'Messenger', 'Tote', 'Travel'],
    'Shoes': ['Men', 'Women', 'Kids'],
    'Jewelries': ['Necklaces', 'Earrings', 'Rings', 'Bracelets'],
    'Accessories': ['Watches', 'Belts', 'Hats', 'Sunglasses']
};

// More menu items (what sidebar was supposed to show)
const moreMenuItems = {
    'Trending': ['Best Sellers', 'New Arrivals', 'Top Rated'],
    'Help': ['Track Order', 'FAQs', 'Returns Policy', 'Contact Us'],
    'Resources': ['Vendor Guide', 'Shipping Info', 'Payment Methods'],
    'Deals': ['Flash Sales', 'Bundle Offers', 'Clearance']
};

const Navbar = () => {
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeMoreItem, setActiveMoreItem] = useState(null);
    const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    // Check Supabase auth on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser?.email) {
                const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
                setIsAdmin(adminEmails.includes(currentUser.email));
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser?.email) {
                const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
                setIsAdmin(adminEmails.includes(currentUser.email));
            } else {
                setIsAdmin(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setMobileSearchOpen(false);
        }
    };

    const handleCategoryClick = (category, subcategory) => {
        navigate(`/shop?category=${category}&subcategory=${subcategory}`);
        setActiveCategory(null);
        setMobileMenuOpen(false);
        setMobileOpenCategory(null);
    };

    const handleMoreItemClick = (section, item) => {
        if (item === 'Best Sellers') navigate('/shop?sort=best-sellers');
        else if (item === 'New Arrivals') navigate('/shop?sort=newest');
        else if (item === 'Flash Sales') navigate('/shop?deals=flash');
        else if (item === 'Track Order') navigate('/track-order');
        else navigate(`/shop?q=${item.toLowerCase()}`);
        setActiveMoreItem(null);
    };

    const toggleMobileCategory = (category) => {
        setMobileOpenCategory(mobileOpenCategory === category ? null : category);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        navigate('/');
    };

    return (
        <>
            <TopBanner />

            <nav className={`sticky top-0 w-full bg-white border-b border-gray-200 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''
                }`}>
                {/* TOP ROW - Logo, Search, Icons */}
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <Link to="/" className="text-2xl font-bold tracking-tighter flex-shrink-0">
                            STORE
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:block flex-1 max-w-md">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-black"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <FiSearch className="w-5 h-5 text-gray-400 hover:text-black" />
                                </button>
                            </form>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <UnitConverter />
                            <Link to="/vendor/signup" className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-green-600 text-white text-xs md:text-sm rounded-full hover:bg-green-700">
                                Sell
                            </Link>
                            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                <FiSearch className="w-5 h-5" />
                            </button>
                            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
                                <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Menu - Shows when logged in */}
                            {user && (
                                <div className="relative group">
                                    <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full">
                                        <FiUser className="w-5 h-5" />
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Login Icon - Shows when not logged in */}
                            {!user && !isAdmin && (
                                <Link to="/login" className="hidden md:block p-2 hover:bg-gray-100 rounded-full">
                                    <FiUser className="w-5 h-5" />
                                </Link>
                            )}

                            {isAdmin && (
                                <Link to="/admin/dashboard" className="hidden md:block text-sm px-3 py-1 rounded-full bg-black text-white">
                                    Admin
                                </Link>
                            )}
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
                                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW - Categories + MORE button */}
                <div className="hidden lg:block border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-8 py-3">
                            {Object.keys(categories).map((category) => (
                                <div
                                    key={category}
                                    className="relative"
                                    onMouseEnter={() => setActiveCategory(category)}
                                    onMouseLeave={() => setActiveCategory(null)}
                                >
                                    <button className="flex items-center gap-1 text-base font-medium hover:text-gray-600 transition-colors">
                                        {category}
                                        {activeCategory === category ? (
                                            <FiChevronUp className="w-4 h-4" />
                                        ) : (
                                            <FiChevronDown className="w-4 h-4" />
                                        )}
                                    </button>

                                    {activeCategory === category && (
                                        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50 animate-fadeIn">
                                            {categories[category].map((subcategory) => (
                                                <button
                                                    key={subcategory}
                                                    onClick={() => handleCategoryClick(category, subcategory)}
                                                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                                                >
                                                    {subcategory}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* MORE Button - with glow effect, spaced further, purple gradient background on hover */}
                            <div
                                className="relative ml-auto"
                                onMouseEnter={() => setActiveMoreItem('more')}
                                onMouseLeave={() => setActiveMoreItem(null)}
                            >
                                <button className="flex items-center gap-1 px-5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium animate-glow-more hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md">
                                    More
                                    {activeMoreItem === 'more' ? (
                                        <FiChevronUp className="w-4 h-4" />
                                    ) : (
                                        <FiChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {activeMoreItem === 'more' && (
                                    <div className="absolute top-full right-0 mt-1 w-64 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-xl rounded-lg overflow-hidden z-50 animate-slideDown">
                                        {Object.entries(moreMenuItems).map(([section, items]) => (
                                            <div key={section}>
                                                <div className="px-4 py-2 bg-purple-100 text-purple-800 font-semibold text-sm">
                                                    {section}
                                                </div>
                                                {items.map((item) => (
                                                    <button
                                                        key={item}
                                                        onClick={() => handleMoreItemClick(section, item)}
                                                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors text-gray-700"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
                <div className="fixed top-16 left-0 right-0 bg-white border-b z-40 md:hidden p-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pr-24 border rounded-full focus:outline-none focus:border-black"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-1.5 rounded-full text-sm">
                            Search
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Menu Overlay - Accordion style */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 lg:hidden overflow-y-auto" style={{ top: '64px' }}>
                    <div className="p-4">
                        {/* Mobile User Info */}
                        {user && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium">{user.email}</p>
                                {isAdmin && <p className="text-xs text-purple-600">Admin Account</p>}
                                <button
                                    onClick={handleLogout}
                                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}

                        {Object.keys(categories).map((category) => (
                            <div key={category} className="border-b border-gray-100">
                                <button
                                    onClick={() => toggleMobileCategory(category)}
                                    className="w-full flex justify-between items-center py-3 text-left font-semibold text-base"
                                >
                                    {category}
                                    {mobileOpenCategory === category ? (
                                        <FiChevronUp className="w-5 h-5" />
                                    ) : (
                                        <FiChevronDown className="w-5 h-5" />
                                    )}
                                </button>
                                {mobileOpenCategory === category && (
                                    <div className="pb-3 pl-4 space-y-2">
                                        {categories[category].map((sub) => (
                                            <button
                                                key={sub}
                                                onClick={() => handleCategoryClick(category, sub)}
                                                className="block w-full text-left py-2 text-sm text-gray-600"
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* More section in mobile */}
                        <div className="border-b border-gray-100">
                            <button
                                onClick={() => toggleMobileCategory('more')}
                                className="w-full flex justify-between items-center py-3 text-left font-semibold text-base text-purple-600"
                            >
                                More
                                {mobileOpenCategory === 'more' ? (
                                    <FiChevronUp className="w-5 h-5" />
                                ) : (
                                    <FiChevronDown className="w-5 h-5" />
                                )}
                            </button>
                            {mobileOpenCategory === 'more' && (
                                <div className="pb-3 pl-4 space-y-3">
                                    {Object.entries(moreMenuItems).map(([section, items]) => (
                                        <div key={section}>
                                            <div className="font-medium text-sm text-purple-600 mt-2">{section}</div>
                                            {items.map((item) => (
                                                <button
                                                    key={item}
                                                    onClick={() => handleMoreItemClick(section, item)}
                                                    className="block w-full text-left py-1.5 text-sm text-gray-600"
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes glowMore {
                    0% {
                        box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 20px 5px rgba(139, 92, 246, 0.6);
                        transform: scale(1.02);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.25s ease-out;
                }
                
                .animate-glow-more {
                    animation: glowMore 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};

export default Navbar;