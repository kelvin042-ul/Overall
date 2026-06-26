import { useState } from 'react';
import { FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { getAvailableCurrencies, getUserCurrency, setUserCurrency, CURRENCY_SYMBOLS } from '../../utils/currencyConverter';

const CurrencySelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(getUserCurrency());
    const currencies = getAvailableCurrencies();

    const handleCurrencyChange = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        setUserCurrency(currencyCode);
        setIsOpen(false);
        // Reload page to update all prices (or use context for real-time update)
        window.location.reload();
    };

    const getCurrencySymbol = (code) => {
        return CURRENCY_SYMBOLS[code] || code;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
                <FiDollarSign className="w-4 h-4" />
                <span>{getCurrencySymbol(selectedCurrency)}</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {currencies.map(currency => (
                        <button
                            key={currency.code}
                            onClick={() => handleCurrencyChange(currency.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center ${selectedCurrency === currency.code ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                                }`}
                        >
                            <span>{currency.symbol} {currency.code}</span>
                            <span className="text-xs text-gray-500">{currency.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;