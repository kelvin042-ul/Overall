import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onAddToCart, showVendor = true }) => {
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart({ ...product, quantity: 1 });
            toast.success(`${product.name} added to cart!`);
        }
    };

    const isNewArrival = product.createdAt && (Date.now() - product.createdAt) < 7 * 24 * 60 * 60 * 1000;
    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
            {/* Image - NOW CLICKABLE to product detail page */}
            <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                        src={product.imageUrl || '/api/placeholder/400/400'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges - NEW and OFF */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isNewArrival && (
                            <span className="bg-black text-white text-xs px-2 py-1 rounded">NEW</span>
                        )}
                        {discount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{discount}% OFF</span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-3">
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-1 hover:text-blue-600 transition">
                        {product.name}
                    </h3>
                </Link>

                {showVendor && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.vendorName || 'Vendor'}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">₦{product.price?.toLocaleString()}</span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                        title="Add to Cart"
                    >
                        <FiShoppingCart className="w-4 h-4" />
                    </button>
                </div>

                {/* NEW: View Details button */}
                <Link
                    to={`/product/${product.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-black transition-colors border-t pt-2"
                >
                    <FiEye className="w-3 h-3" /> View Details →
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;