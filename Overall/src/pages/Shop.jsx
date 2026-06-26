import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    // Load search history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            setSearchHistory(JSON.parse(saved));
        }
    }, []);

    // Save search history
    const saveToHistory = (term) => {
        if (!term.trim()) return;
        const updated = [term, ...searchHistory.filter(s => s !== term)].slice(0, 5);
        setSearchHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    // Get URL params on load
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const subcategoryParam = searchParams.get('subcategory');
        const searchParam = searchParams.get('search');

        if (categoryParam) setSelectedCategory(categoryParam);
        if (subcategoryParam) setSelectedSubcategory(subcategoryParam);
        if (searchParam) {
            setSearchTerm(searchParam);
            saveToHistory(searchParam);
        }
    }, [searchParams]);

    // Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Transform to match component structure
                const transformedProducts = (data || []).map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    description: p.description,
                    category: p.category,
                    subcategory: p.subcategory,
                    imageUrl: p.image_url,
                    vendorId: p.vendor_id,
                    vendorName: p.vendor_name,
                    stock: p.stock,
                    soldCount: p.sold_count,
                    isNewArrival: p.is_new_arrival,
                    createdAt: p.created_at
                }));

                setProducts(transformedProducts);

                // Extract unique categories
                const uniqueCategories = [...new Set(transformedProducts.map(p => p.category).filter(Boolean))];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products
    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by subcategory
        if (selectedSubcategory) {
            filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, selectedSubcategory, searchTerm]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSelectedSubcategory('');
        setSearchParams({ category });
    };

    const handleSubcategoryClick = (subcategory) => {
        setSelectedSubcategory(subcategory);
        setSearchParams({ category: selectedCategory, subcategory });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            saveToHistory(searchTerm);
            setSearchParams({ search: searchTerm });
            setShowHistory(false);
        }
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSearchTerm('');
        setSearchParams({});
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };

    // Get unique subcategories for selected category
    const subcategories = [...new Set(
        products.filter(p => p.category === selectedCategory).map(p => p.subcategory).filter(Boolean)
    )];

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
                {/* Search Bar with History */}
                <div className="mb-8 relative">
                    <form onSubmit={handleSearch} className="relative max-w-md">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowHistory(true)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-black"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                            <FiSearch className="w-5 h-5 text-gray-400" />
                        </button>
                    </form>

                    {/* Search History Dropdown */}
                    {showHistory && searchHistory.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="flex justify-between items-center px-3 py-2 border-b">
                                <span className="text-xs text-gray-500">Recent Searches</span>
                                <button onClick={clearHistory} className="text-xs text-red-500">Clear</button>
                            </div>
                            {searchHistory.map((term, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSearchTerm(term);
                                        setSearchParams({ search: term });
                                        setShowHistory(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <FiTrendingUp className="w-3 h-3 text-gray-400" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Filter Buttons */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <button
                            onClick={() => handleCategoryClick('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Subcategory Filters */}
                    {selectedCategory && subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {subcategories.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => handleSubcategoryClick(sub)}
                                    className={`px-3 py-1 rounded-full text-xs transition ${selectedSubcategory === sub ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {(selectedCategory || selectedSubcategory || searchTerm) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                Category: {selectedCategory}
                                <button onClick={() => setSelectedCategory('')} className="ml-1 text-gray-500 hover:text-black">×</button>
                            </span>
                        )}
                        {selectedSubcategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {selectedSubcategory}
                                <button onClick={() => setSelectedSubcategory('')} className="ml-1 text-gray-500 hover:text-black">×</button>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                Search: {searchTerm}
                                <button onClick={() => setSearchTerm('')} className="ml-1 text-gray-500 hover:text-black">×</button>
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-sm text-gray-500 underline">Clear all</button>
                    </div>
                )}

                {/* Results Count */}
                <p className="text-gray-500 mb-4">{filteredProducts.length} products found</p>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found</p>
                        <button onClick={clearFilters} className="mt-2 text-black underline">Clear filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Shop;