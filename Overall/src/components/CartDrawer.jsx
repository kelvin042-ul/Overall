import { useState, useEffect } from 'react';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setTotal(getCartTotal());
    }, [cart, getCartTotal]);

    const handleCheckout = () => {
        onClose();
        window.location.href = '/checkout';
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${isOpen ? 'opacity-50 visible' : 'opacity-0 invisible'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl transition-transform duration-300 transform z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FiShoppingBag /> Cart ({cart.length})
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Your cart is empty</p>
                            <button onClick={onClose} className="mt-4 text-black underline">
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3 border-b pb-4">
                                    <img
                                        src={item.imageUrl || '/api/placeholder/80/80'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm">{item.name}</h3>
                                        <p className="text-sm font-bold mt-1">₦{item.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 border rounded"
                                            >
                                                <FiMinus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 border rounded"
                                            >
                                                <FiPlus className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="ml-auto text-red-500"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="border-t p-4 space-y-3">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>₦{total.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800"
                        >
                            Checkout
                        </button>
                        <button onClick={onClose} className="w-full text-center text-sm text-gray-500">
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;