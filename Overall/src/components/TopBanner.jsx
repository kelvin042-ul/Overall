import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const TopBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Hide banner when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="bg-red-600 text-white text-sm py-2 px-4 transition-all duration-300 relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4 mx-auto md:mx-0">
                    <span>🚚 Free shipping on orders over ₦50,000</span>
                    <span className="hidden md:inline">|</span>
                    <span className="hidden md:inline">🎉 New vendors get 0% commission for first month</span>
                    <span className="md:hidden">🎉 New vendors special</span>
                </div>
                <button
                    onClick={handleClose}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-700 rounded-full transition"
                >
                    <FiX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TopBanner;