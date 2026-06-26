import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiSearch, FiTrash2, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;

            // Load vendors to get business names
            const { data: vendorsData, error: vendorsError } = await supabase
                .from('vendors')
                .select('id, business_name');

            if (vendorsError) throw vendorsError;

            // Create vendor lookup map
            const vendorMap = {};
            (vendorsData || []).forEach(v => {
                vendorMap[v.id] = v.business_name;
            });

            // Attach vendor names to products
            const productsWithVendors = (productsData || []).map(p => ({
                ...p,
                vendorName: vendorMap[p.vendor_id] || 'Unknown Vendor'
            }));

            setProducts(productsWithVendors);
            setVendors(vendorsData || []);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const toggleProductStatus = async (productId, currentStatus) => {
        const newStatus = !currentStatus;
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: newStatus })
                .eq('id', productId);

            if (error) throw error;

            toast.success(`Product ${newStatus ? 'activated' : 'deactivated'}`);
            loadData();
        } catch (error) {
            toast.error('Failed to update product');
        }
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            toast.success('Product deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <p className="text-gray-500 text-sm">View and manage all products across vendors</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by product or vendor name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No products found</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {currentProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                                {product.image_url && (
                                    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleProductStatus(product.id, product.is_active)}
                                                className="p-1 rounded hover:bg-gray-100"
                                                title={product.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {product.is_active ? <FiEye className="w-4 h-4 text-green-600" /> : <FiEyeOff className="w-4 h-4 text-red-600" />}
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-1 rounded hover:bg-gray-100 text-red-600"
                                                title="Delete"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold mt-1">₦{product.price?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">Vendor: {product.vendorName}</p>
                                    <p className="text-xs text-gray-500">{product.category}/{product.subcategory}</p>
                                    <p className="text-xs text-gray-400 mt-2">Stock: {product.stock || 0} | Sold: {product.sold_count || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminProductsPage;