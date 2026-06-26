import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

const categories = {
    'Cloths': ['Men', 'Women', 'Children'],
    'Bags': ['Men', 'Women', 'Children'],
    'Shoes': ['Men', 'Women', 'Kids'],
    'Electronics': ['Phones', 'Laptops', 'Accessories'],
    'Accessories': ['Watches', 'Jewelry', 'Bags'],
    'Furniture': ['Beds', 'Tables', 'Chairs'],
    'Others': []
};

const ProductForm = ({ initialData, onSubmit, onClose, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        price: initialData?.price || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        subcategory: initialData?.subcategory || '',
        imageUrl: initialData?.imageUrl || initialData?.image_url || '',
        stock: initialData?.stock || '',
        isNewArrival: initialData?.isNewArrival || initialData?.is_new_arrival || false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.description || !formData.category) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            toast.error('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (₦) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock *</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-black"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                required
                            >
                                <option value="">Select Category</option>
                                {Object.keys(categories).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subcategory</label>
                            <select
                                value={formData.subcategory}
                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                disabled={!formData.category}
                            >
                                <option value="">Select Subcategory</option>
                                {formData.category && categories[formData.category]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Image</label>
                        <ImageUpload
                            onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                            currentImageUrl={formData.imageUrl}
                        />
                    </div>

                    {/* New Arrival Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isNewArrival"
                            checked={formData.isNewArrival}
                            onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isNewArrival" className="text-sm">Mark as New Arrival</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;