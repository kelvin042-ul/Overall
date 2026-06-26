import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

// Hardcoded categories - loads instantly, no Firebase delay
const categories = {
    'Cloths': ['Men', 'Women', 'Children'],
    'Furniture': ['Table', 'Chairs', 'Sofas', 'Beds'],
    'Bags': ['Backpack', 'Messenger', 'Tote', 'Travel'],
    'Shoes': ['Men', 'Women', 'Kids'],
    'Jewelries': ['Necklaces', 'Earrings', 'Rings', 'Bracelets'],
    'Accessories': ['Watches', 'Belts', 'Hats', 'Sunglasses']
};

const CategoryMenu = () => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
    const navigate = useNavigate();

    const handleCategoryClick = (category, subcategory) => {
        navigate(`/shop?category=${category}&subcategory=${subcategory}`);
        setActiveCategory(null);
        setMobileOpenCategory(null);
    };

    return (
        <>
            {/* Desktop Menu */}
            <div className="hidden md:block relative">
                <div className="flex gap-6">
                    {Object.keys(categories).map((category) => (
                        <div
                            key={category}
                            className="relative"
                            onMouseEnter={() => setActiveCategory(category)}
                            onMouseLeave={() => setActiveCategory(null)}
                        >
                            <button className="flex items-center gap-1 text-sm font-medium hover:text-gray-600 py-2 transition-colors">
                                {category} <FiChevronDown className="w-3 h-3 transition-transform duration-200" />
                            </button>

                            {activeCategory === category && (
                                <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50">
                                    {categories[category].map((subcategory) => (
                                        <button
                                            key={subcategory}
                                            onClick={() => handleCategoryClick(category, subcategory)}
                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                        >
                                            {subcategory}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden space-y-2">
                {Object.keys(categories).map((category) => (
                    <div key={category} className="border-b border-gray-100">
                        <button
                            onClick={() => setMobileOpenCategory(mobileOpenCategory === category ? null : category)}
                            className="w-full flex justify-between items-center py-3 text-left font-medium"
                        >
                            {category}
                            <FiChevronRight className={`w-4 h-4 transition-transform duration-200 ${mobileOpenCategory === category ? 'rotate-90' : ''
                                }`} />
                        </button>
                        {mobileOpenCategory === category && (
                            <div className="pb-3 pl-4 space-y-2">
                                {categories[category].map((subcategory) => (
                                    <button
                                        key={subcategory}
                                        onClick={() => handleCategoryClick(category, subcategory)}
                                        className="block w-full text-left py-2 text-sm text-gray-600 hover:text-black transition-colors"
                                    >
                                        {subcategory}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CategoryMenu;