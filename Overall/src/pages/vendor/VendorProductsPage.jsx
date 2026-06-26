import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import VendorLayout from '../../components/VendorLayout';
import ProductForm from '../../components/ProductForm';

const VendorProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        await loadVendorAndProducts(session.user.id);
    };

    const loadVendorAndProducts = async (authId) => {
        setLoading(true);
        try {
            // Get vendor
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (vendorError) throw vendorError;
            setVendor(vendorData);

            // Get products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('vendor_id', vendorData.id)
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (productData) => {
        if (!vendor) return;

        try {
            const productToSave = {
                vendor_id: vendor.id,
                vendor_name: vendor.business_name,
                name: productData.name,
                price: parseFloat(productData.price),
                description: productData.description,
                category: productData.category,
                subcategory: productData.subcategory,
                image_url: productData.imageUrl || '',
                stock: parseInt(productData.stock),
                is_new_arrival: productData.isNewArrival || false,
                is_active: true
            };

            const { error } = await supabase
                .from('products')
                .insert(productToSave);

            if (error) throw error;

            toast.success('Product added successfully!');
            await loadVendorAndProducts(vendor.auth_id);
        } catch (error) {
            console.error('Add product error:', error);
            toast.error('Failed to add product: ' + error.message);
            throw error;
        }
    };

    const handleEditProduct = async (productData) => {
        if (!vendor || !editingProduct) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: productData.name,
                    price: parseFloat(productData.price),
                    description: productData.description,
                    category: productData.category,
                    subcategory: productData.subcategory,
                    image_url: productData.imageUrl || '',
                    stock: parseInt(productData.stock),
                    is_new_arrival: productData.isNewArrival || false
                })
                .eq('id', editingProduct.id)
                .eq('vendor_id', vendor.id);

            if (error) throw error;

            toast.success('Product updated!');
            await loadVendorAndProducts(vendor.auth_id);
            setEditingProduct(null);
        } catch (error) {
            toast.error('Failed to update product');
            throw error;
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Delete this product permanently?')) return;
        if (!vendor) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)
                .eq('vendor_id', vendor.id);

            if (error) throw error;

            toast.success('Product deleted');
            await loadVendorAndProducts(vendor.auth_id);
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const openEditForm = (product) => {
        // Transform product data to match form structure
        const productForForm = {
            ...product,
            imageUrl: product.image_url,
            isNewArrival: product.is_new_arrival
        };
        setEditingProduct(productForForm);
        setShowProductForm(true);
    };

    const closeForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
    };

    // Filter products by search
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Calculate stats
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    if (loading) {
        return (
            <VendorLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            {/* Header with Stats */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="text-gray-500 text-sm">Manage your product listings</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Stock</p>
                    <p className="text-2xl font-bold">{totalStock}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Inventory Value</p>
                    <p className="text-2xl font-bold">₦{totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="relative max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    />
                </div>
                <button
                    onClick={() => setShowProductForm(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                >
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No products found</p>
                    <button onClick={() => setShowProductForm(true)} className="mt-2 text-black underline">
                        Add your first product
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-left">
                                    <th className="px-4 py-3 text-sm font-medium">Product</th>
                                    <th className="px-4 py-3 text-sm font-medium">Category</th>
                                    <th className="px-4 py-3 text-sm font-medium">Subcategory</th>
                                    <th className="px-4 py-3 text-sm font-medium">Price</th>
                                    <th className="px-4 py-3 text-sm font-medium">Stock</th>
                                    <th className="px-4 py-3 text-sm font-medium">Sold</th>
                                    <th className="px-4 py-3 text-sm font-medium">New</th>
                                    <th className="px-4 py-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {product.image_url && (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <span className="text-sm font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{product.category || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{product.subcategory || '-'}</td>
                                        <td className="px-4 py-3 font-medium">₦{product.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{product.sold_count || 0}</td>
                                        <td className="px-4 py-3">
                                            {product.is_new_arrival ? (
                                                <span className="text-xs bg-black text-white px-2 py-1 rounded">NEW</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditForm(product)} className="text-blue-600 hover:text-blue-800">
                                                    <FiEdit2 />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border rounded disabled:opacity-50"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
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

            {/* Product Form Modal */}
            {showProductForm && (
                <ProductForm
                    initialData={editingProduct}
                    onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
                    onClose={closeForm}
                    isEditing={!!editingProduct}
                />
            )}
        </VendorLayout>
    );
};

export default VendorProductsPage;