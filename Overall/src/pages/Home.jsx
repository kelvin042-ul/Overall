import HardcodedGallery from '../components/HardcodedGallery';
import FeaturedProducts from '../components/FeaturedProducts';
import HeroSlider from '../components/HeroSlider';
import { useCart } from '../context/CartContext';

const Home = () => {
    const { addToCart } = useCart();

    return (
        <div className="max-w-7xl mx-auto px-4 py-24">

            <HeroSlider />
            <div className="mb-16"></div>

            {/* Hardcoded Gallery Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6">Editor's Picks</h2>
                <HardcodedGallery />
            </div>

            {/* Featured Products */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
                <FeaturedProducts onAddToCart={addToCart} />
            </div>

            {/* Hot Picks Slider */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6">Hot Picks 🔥</h2>
                <div className="relative overflow-x-auto pb-4">
                    <div className="flex space-x-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-shrink-0 w-64 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                                <h3 className="font-bold">Hot Deal {i}</h3>
                                <p className="text-sm text-gray-600">Limited time offer</p>
                                <p className="text-lg font-bold mt-2">₦{Math.floor(Math.random() * 10000)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Best Bundle Grid */}
            <div>
                <h2 className="text-3xl font-bold mb-6">Best Bundles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 text-white p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-2">Summer Bundle</h3>
                        <p className="mb-4">Save 20% on selected items</p>
                        <button className="bg-white text-black px-6 py-2 rounded-lg font-medium">Shop Now</button>
                    </div>
                    <div className="bg-gray-800 text-white p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-2">Winter Essentials</h3>
                        <p className="mb-4">Get ready for cold weather</p>
                        <button className="bg-white text-black px-6 py-2 rounded-lg font-medium">Shop Now</button>
                    </div>
                    <div className="bg-gray-700 text-white p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-2">Accessory Pack</h3>
                        <p className="mb-4">Complete your look</p>
                        <button className="bg-white text-black px-6 py-2 rounded-lg font-medium">Shop Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;