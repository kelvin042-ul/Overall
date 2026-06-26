import { useState } from 'react';
import { FiX, FiCheck, FiStar, FiPackage, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UpgradeModal = ({ onClose, currentTier, onUpgrade }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('premium');

    const plans = {
        basic: {
            name: 'Basic',
            price: 'Free',
            features: ['50 products max', '5% commission', 'Basic support', 'Monthly payouts'],
            icon: FiPackage,
            color: 'gray'
        },
        premium: {
            name: 'Premium',
            price: '₦50,000/month',
            features: ['500 products max', '2% commission', 'Priority support', 'Weekly payouts', 'Featured listings'],
            icon: FiStar,
            color: 'purple'
        },
        enterprise: {
            name: 'Enterprise',
            price: '₦200,000/month',
            features: ['Unlimited products', '1% commission', '24/7 dedicated support', 'Daily payouts', 'Featured listings', 'Marketing tools'],
            icon: FiZap,
            color: 'gold'
        }
    };

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Upgraded to ${plans[selectedPlan].name} plan!`);
            onUpgrade(selectedPlan);
            onClose();
        } catch (error) {
            toast.error('Upgrade failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6 text-center">
                        Choose the plan that best fits your business needs
                    </p>

                    {/* Current Tier Badge */}
                    <div className="text-center mb-6">
                        <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm">
                            Current Plan: <strong className="capitalize">{currentTier || 'Basic'}</strong>
                        </span>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {Object.entries(plans).map(([key, plan]) => {
                            const Icon = plan.icon;
                            const isCurrent = currentTier === key;
                            const isSelected = selectedPlan === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedPlan(key)}
                                    className={`text-left p-6 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-black shadow-lg'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${isCurrent ? 'opacity-75' : ''}`}
                                    disabled={isCurrent}
                                >
                                    <Icon className={`w-10 h-10 mb-4 ${plan.color === 'purple' ? 'text-purple-600' :
                                            plan.color === 'gold' ? 'text-yellow-500' :
                                                'text-gray-500'
                                        }`} />
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <p className="text-2xl font-bold mb-4">{plan.price}</p>
                                    <ul className="space-y-2 text-sm">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <FiCheck className="w-4 h-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {isCurrent && (
                                        <div className="mt-4 text-center text-sm text-gray-500">Current Plan</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={handleUpgrade}
                            disabled={loading || currentTier === selectedPlan}
                            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : `Upgrade to ${plans[selectedPlan].name}`}
                        </button>
                        <button onClick={onClose} className="flex-1 border py-3 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        You can upgrade or downgrade at any time. Changes take effect immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;