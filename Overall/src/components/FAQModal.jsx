import React from 'react';
import { FiX, FiTruck, FiRefreshCw, FiShield, FiCreditCard } from 'react-icons/fi';

const FAQModal = ({ isOpen, onClose, vendor }) => {
    if (!isOpen) return null;

    // If no vendor or no policies
    if (!vendor) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">No Policies Yet</h2>
                    <p className="text-gray-500 mb-4">This seller hasn't added their policies yet.</p>
                    <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    // Build array of policies that actually have content
    const policies = [];

    if (vendor.shipping_policy) {
        policies.push({ icon: FiTruck, title: 'Shipping Policy', content: vendor.shipping_policy });
    }
    if (vendor.return_policy) {
        policies.push({ icon: FiRefreshCw, title: 'Return Policy', content: vendor.return_policy });
    }
    if (vendor.warranty_info) {
        policies.push({ icon: FiShield, title: 'Warranty', content: vendor.warranty_info });
    }
    if (vendor.payment_policy) {
        policies.push({ icon: FiCreditCard, title: 'Payment Methods', content: vendor.payment_policy });
    }

    if (policies.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">No Policies Yet</h2>
                    <p className="text-gray-500 mb-4">This seller hasn't added their policies yet.</p>
                    <button onClick={onClose} className="bg-green-600 text-white px-6 py-2 rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-bold">Seller Policies</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {policies.map((Policy, idx) => (
                        <div key={idx}>
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <Policy.icon className="w-5 h-5" />
                                <h3 className="font-semibold">{Policy.title}</h3>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {Policy.content}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQModal;