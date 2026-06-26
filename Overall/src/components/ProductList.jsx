import { useState } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductList = ({ products, onEdit, onDelete, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No products yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Product" to get started</p>
            </div>
        );
    }

    return (
        <div>
            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-black"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left">
                            <th className="px-4 py-3 text-sm">Product</th>
                            <th className="px-4 py-3 text-sm">Price</th>
                            <th className="px-4 py-3 text-sm">Stock</th>
                            <th className="px-4 py-3 text-sm">Sold</th>
                            <th className="px-4 py-3 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {product.imageUrl && (
                                            <img src={product.imageUrl} className="w-8 h-8 object-cover rounded" />
                                        )}
                                        <span className="text-sm">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium">₦{product.price?.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock || 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{product.soldCount || 0}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => onEdit(product)} className="text-blue-600 hover:text-blue-800">
                                            <FiEdit2 />
                                        </button>
                                        <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-800">
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
        </div>
    );
};

export default ProductList;