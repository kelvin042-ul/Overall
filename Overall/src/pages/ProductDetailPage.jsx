import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import FAQModal from '../components/FAQModal';
import ChatWidget from '../components/ChatWidget';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showFAQModal, setShowFAQModal] = useState(false);
    const [vendorPolicies, setVendorPolicies] = useState(null);

    useEffect(() => {
        if (productId) {
            loadProduct();
        }
        window.scrollTo(0, 0);
    }, [productId]);

    // Add effect to load vendor policies when product loads:
    useEffect(() => {
        if (product?.vendorId) {
            loadVendorPolicies(product.vendorId);
        }
    }, [product]);

    const loadVendorPolicies = async (vendorId) => {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('shipping_policy, return_policy, warranty_info, payment_policy, business_name')
                .eq('id', vendorId)
                .single();

            if (!error && data) {
                setVendorPolicies(data);
            }
        } catch (error) {
            console.error('Error loading vendor policies:', error);
        }
    };


    const loadProduct = async () => {
        setLoading(true);
        try {
            // Load product from Supabase
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (!data) {
                toast.error('Product not found');
                navigate('/shop');
                return;
            }

            // Transform to match component structure
            const productData = {
                id: data.id,
                name: data.name,
                price: data.price,
                description: data.description,
                category: data.category,
                subcategory: data.subcategory,
                imageUrl: data.image_url,
                vendorId: data.vendor_id,
                vendorName: data.vendor_name,
                stock: data.stock,
                soldCount: data.sold_count,
                isNewArrival: data.is_new_arrival,
                createdAt: data.created_at
            };

            setProduct(productData);

            // Load related products from same category
            if (data.category) {
                const { data: relatedData, error: relatedError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', data.category)
                    .neq('id', productId)
                    .limit(4);

                if (!relatedError && relatedData) {
                    const transformedRelated = relatedData.map(p => ({
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
                    setRelatedProducts(transformedRelated);
                }
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
        toast.success(`Added ${quantity} × ${product.name} to cart`);
    };

    const increaseQuantity = () => {
        if (quantity < (product?.stock || 10)) {
            setQuantity(q => q + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    if (loading) {
        return (
            <>
                <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading product...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600">Product not found</p>
                        <Link to="/shop" className="mt-4 inline-block text-black underline">Continue Shopping</Link>
                    </div>
                </div>
            </>
        );
    }

    const isNewArrival = product.isNewArrival === true;

    return (
        <>
            <div className="pt-20 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link to="/" className="hover:text-black">Home</Link>
                        <FiChevronRight className="w-4 h-4" />
                        <Link to="/shop" className="hover:text-black">Shop</Link>
                        <FiChevronRight className="w-4 h-4" />
                        <Link to={`/shop?category=${product.category}`} className="hover:text-black">{product.category}</Link>
                        <FiChevronRight className="w-4 h-4" />
                        <span className="text-black">{product.name}</span>
                    </div>

                    {/* Product Main Section */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                            {/* Product Image */}
                            <div>
                                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/500'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div>
                                {/* Badges */}
                                <div className="flex gap-2 mb-3">
                                    {isNewArrival && (
                                        <span className="bg-black text-white text-xs px-3 py-1 rounded-full">NEW ARRIVAL</span>
                                    )}
                                    {product.stock > 0 ? (
                                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">IN STOCK</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">OUT OF STOCK</span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                                {/* Vendor */}
                                <p className="text-sm text-gray-500 mb-4">
                                    Sold by: <span className="font-medium text-black">{product.vendorName || 'Direct Seller'}</span>
                                </p>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-3xl font-bold">₦{product.price?.toLocaleString()}</span>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="font-medium mb-2">Product Description</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <h3 className="font-medium mb-2">Quantity</h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={decreaseQuantity}
                                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                                        <button
                                            onClick={increaseQuantity}
                                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <FiPlus />
                                        </button>
                                        <span className="text-sm text-gray-500 ml-2">{product.stock || 0} available</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mb-6">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                                    >
                                        <FiShoppingCart className="w-5 h-5" />
                                        Add to Cart
                                    </button>
                                    <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                                        <FiHeart className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                                        <FiShare2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Shipping Info - DYNAMIC from vendor */}
                                <div className="border-t pt-6 space-y-3">
                                    {vendorPolicies?.free_shipping_threshold > 0 && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiTruck className="w-5 h-5 text-gray-400" />
                                            <span>Free shipping on orders over ₦{vendorPolicies.free_shipping_threshold.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {vendorPolicies?.shipping_cost > 0 && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiTruck className="w-5 h-5 text-gray-400" />
                                            <span>Shipping: ₦{vendorPolicies.shipping_cost.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {!vendorPolicies?.free_shipping_threshold && !vendorPolicies?.shipping_cost && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiTruck className="w-5 h-5 text-gray-400" />
                                            <span>Contact seller for shipping details</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <FiShield className="w-5 h-5 text-gray-400" />
                                        <span>{vendorPolicies?.warranty_info || 'Standard warranty applies'}</span>
                                    </div>
                                </div>

                                {/* FAQ Link */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 italic">
                                        Have questions?{' '}
                                        <button
                                            onClick={() => setShowFAQModal(true)}
                                            className="text-green-600 underline font-medium hover:text-green-700"
                                        >
                                            View seller policies →
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.map(related => (
                                    <ProductCard key={related.id} product={related} onAddToCart={addToCart} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {product && (
                <ChatWidget
                    vendorId={product.vendorId}
                    vendorName={product.vendorName}
                    productId={product.id}
                    productName={product.name}
                />
            )}
            {/* FAQ Modal */}
            <FAQModal
                isOpen={showFAQModal}
                onClose={() => setShowFAQModal(false)}
                vendor={vendorPolicies}
            />
        </>
    );
};

export default ProductDetailPage;