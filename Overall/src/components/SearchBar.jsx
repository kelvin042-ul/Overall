import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { supabase } from '../lib/supabase';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsExpanded(false);
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target) && !event.target.closest('.mobile-search-trigger')) {
                setShowMobileSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, category, price')
                    .ilike('name', `%${searchTerm}%`)
                    .limit(5);

                if (error) throw error;
                setSuggestions(data || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const saveRecentSearch = (term) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            saveRecentSearch(searchTerm);
            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsExpanded(false);
            setShowMobileSearch(false);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        saveRecentSearch(suggestion.name);
        navigate(`/shop?search=${encodeURIComponent(suggestion.name)}`);
        setSearchTerm('');
        setIsExpanded(false);
        setShowMobileSearch(false);
        setSuggestions([]);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <>
            {/* Desktop Search Bar */}
            <div ref={searchRef} className="hidden md:block relative">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        className="w-[300px] lg:w-[400px] px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-300"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-200"
                    >
                        <FiSearch className="w-5 h-5" />
                    </button>
                </form>

                {isExpanded && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideDown">
                        {isLoading && (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                            </div>
                        )}

                        {suggestions.length > 0 && !isLoading && (
                            <div className="border-b border-gray-100">
                                <div className="px-4 py-2 text-xs text-gray-500 font-medium">SUGGESTIONS</div>
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiPackage className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                            <div>
                                                <p className="text-sm font-medium">{suggestion.name}</p>
                                                <p className="text-xs text-gray-500">{suggestion.category}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">₦{suggestion.price?.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {recentSearches.length > 0 && !searchTerm && !isLoading && (
                            <div>
                                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                                    <span className="text-xs text-gray-500 font-medium">RECENT SEARCHES</span>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                {recentSearches.map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSearchTerm(term);
                                            handleSearch({ preventDefault: () => { } });
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3"
                                    >
                                        <FiTrendingUp className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{term}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchTerm.length >= 2 && suggestions.length === 0 && !isLoading && (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No products found for "{searchTerm}"</p>
                                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
                            </div>
                        )}

                        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center rounded-b-xl">
                            Press Enter to search all products
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Search */}
            <div className="md:hidden">
                <button
                    onClick={() => setShowMobileSearch(true)}
                    className="mobile-search-trigger p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                    <FiSearch className="w-5 h-5" />
                </button>

                {showMobileSearch && (
                    <div ref={mobileSearchRef} className="fixed inset-0 bg-white z-50 animate-slideUp">
                        <div className="p-4">
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setShowMobileSearch(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <FiX className="w-6 h-6" />
                                </button>
                                <form onSubmit={handleSearch} className="flex-1">
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-full focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 text-base"
                                        />
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-full text-sm hover:bg-gray-800 transition-colors"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
                                {isLoading && (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                    </div>
                                )}

                                {suggestions.length > 0 && !isLoading && (
                                    <div>
                                        <div className="px-4 py-2 text-xs text-gray-500 font-medium">SUGGESTIONS</div>
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FiPackage className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">{suggestion.name}</p>
                                                        <p className="text-xs text-gray-500">{suggestion.category}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium">₦{suggestion.price?.toLocaleString()}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {recentSearches.length > 0 && !searchTerm && !isLoading && (
                                    <div>
                                        <div className="flex justify-between items-center px-4 py-2">
                                            <span className="text-xs text-gray-500 font-medium">RECENT SEARCHES</span>
                                            <button onClick={clearRecentSearches} className="text-xs text-red-500 hover:text-red-600 transition-colors">
                                                Clear all
                                            </button>
                                        </div>
                                        {recentSearches.map((term, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSearchTerm(term);
                                                    handleSearch({ preventDefault: () => { } });
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
                                            >
                                                <FiTrendingUp className="w-5 h-5 text-gray-400" />
                                                <span>{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
        </>
    );
};

export default SearchBar;