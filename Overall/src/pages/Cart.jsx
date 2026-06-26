import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const total = getCartTotal();

    const handleCheckout = () => {
        if (cart.length === 0) {
            return;
        }
        window.location.href = '/checkout';
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/shop" className="inline-block bg-black text-white px-6 py-3 rounded-lg">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex gap-4 border-b border-gray-200 py-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                <img src={item.imageUrl || '/api/placeholder/100/100'} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-gray-600">₦{item.price.toLocaleString()}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border border-gray-300 rounded">
                                        <FiMinus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border border-gray-300 rounded">
                                        <FiPlus className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500">
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₦{total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₦{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;