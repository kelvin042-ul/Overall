import { useState } from 'react';
import { FiDollarSign, FiChevronDown } from 'react-icons/fi';

const currencies = [
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const UnitConverter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

    const handleCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        setIsOpen(false);
        localStorage.setItem('preferredCurrency', currency.code);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
                <FiDollarSign className="w-4 h-4" />
                <span>{selectedCurrency.symbol} {selectedCurrency.code}</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {currencies.map(currency => (
                        <button
                            key={currency.code}
                            onClick={() => handleCurrencyChange(currency)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${selectedCurrency.code === currency.code ? 'bg-gray-100 font-medium' : ''
                                }`}
                        >
                            <span>{currency.symbol}</span>
                            <span>{currency.code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnitConverter;