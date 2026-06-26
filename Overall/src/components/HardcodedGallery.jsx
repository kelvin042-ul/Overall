import { hardcodedProducts } from '../data/hardcodedProducts';

const HardcodedGallery = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {hardcodedProducts.map(product => (
                <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                            }}
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">${product.price.toLocaleString()}</span>
                            <span className="text-xs text-red-500 bg-gray-100 px-2 py-0.5 rounded">
                                {product.category}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HardcodedGallery;