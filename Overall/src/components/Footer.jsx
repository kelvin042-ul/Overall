import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-black text-white mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">STORE</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Your one-stop marketplace for quality products from trusted vendors across Nigeria.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <FiYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/shop" className="text-gray-400 hover:text-white transition">Shop</Link></li>
                            <li><Link to="/track-order" className="text-gray-400 hover:text-white transition">Track Order</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                            <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                        </ul>
                    </div>

                    {/* For Vendors */}
                    <div>
                        <h3 className="font-bold mb-4">For Vendors</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/vendor/signup" className="text-gray-400 hover:text-white transition">Sell on STORE</Link></li>
                            <li><Link to="/vendor/login" className="text-gray-400 hover:text-white transition">Vendor Login</Link></li>
                            <li><Link to="/vendor/earnings" className="text-gray-400 hover:text-white transition">Vendor Earnings</Link></li>
                            <li><Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing Plans</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiMapPin className="w-4 h-4" />
                                <span>Lagos, Nigeria</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiPhone className="w-4 h-4" />
                                <span>+234 812 345 6789</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiMail className="w-4 h-4" />
                                <span>support@store.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} STORE Marketplace. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;