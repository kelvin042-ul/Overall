import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .limit(50);

                if (error) throw error;

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
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                />
            ))}
        </div>
    );
};

export default FeaturedProducts;