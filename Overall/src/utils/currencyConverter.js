// Exchange rates (you can update these or fetch from API)
// For now, using approximate rates
const EXCHANGE_RATES = {
    NGN: 1,
    USD: 0.00065,    // 1 NGN = 0.00065 USD
    EUR: 0.00060,    // 1 NGN = 0.00060 EUR
    GBP: 0.00052,    // 1 NGN = 0.00052 GBP
    GHS: 0.009,      // 1 NGN = 0.009 GHS
    KES: 0.085,      // 1 NGN = 0.085 KES
    ZAR: 0.012,      // 1 NGN = 0.012 ZAR
    CAD: 0.00088,    // 1 NGN = 0.00088 CAD
    AUD: 0.00098,    // 1 NGN = 0.00098 AUD
};

// Currency symbols
const CURRENCY_SYMBOLS = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    KES: 'KSh',
    ZAR: 'R',
    CAD: 'C$',
    AUD: 'A$',
};

// Currency names
const CURRENCY_NAMES = {
    NGN: 'Nigerian Naira',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    GHS: 'Ghanaian Cedi',
    KES: 'Kenyan Shilling',
    ZAR: 'South African Rand',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency (NGN, USD, etc.)
 * @param {string} to - Target currency
 * @returns {number} - Converted amount
 */
export const convertCurrency = (amount, from, to) => {
    if (!amount || amount <= 0) return 0;

    // Convert to NGN first (base currency)
    const amountInNGN = amount / (EXCHANGE_RATES[from] || 1);
    // Then convert to target currency
    const convertedAmount = amountInNGN * (EXCHANGE_RATES[to] || 1);

    return Math.round(convertedAmount * 100) / 100;
};

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted string (e.g., "₦1,000" or "$50.00")
 */
export const formatCurrencyWithSymbol = (amount, currency = 'NGN') => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formattedAmount = amount.toLocaleString(undefined, {
        minimumFractionDigits: currency === 'NGN' ? 0 : 2,
        maximumFractionDigits: currency === 'NGN' ? 0 : 2
    });
    return `${symbol}${formattedAmount}`;
};

/**
 * Get all available currencies
 * @returns {array} - List of currencies with code, name, symbol
 */
export const getAvailableCurrencies = () => {
    return Object.keys(EXCHANGE_RATES).map(code => ({
        code,
        name: CURRENCY_NAMES[code],
        symbol: CURRENCY_SYMBOLS[code]
    }));
};

/**
 * Get exchange rate between two currencies
 * @param {string} from - Source currency
 * @param {string} to - Target currency
 * @returns {number} - Exchange rate
 */
export const getExchangeRate = (from, to) => {
    const rateInNGN = EXCHANGE_RATES[from] || 1;
    const rateOutNGN = EXCHANGE_RATES[to] || 1;
    return rateOutNGN / rateInNGN;
};

/**
 * Update exchange rates (call this periodically or fetch from API)
 * @param {object} newRates - New exchange rates object
 */
export const updateExchangeRates = (newRates) => {
    Object.assign(EXCHANGE_RATES, newRates);
};

// Save user's preferred currency in localStorage
export const getUserCurrency = () => {
    return localStorage.getItem('preferredCurrency') || 'NGN';
};

export const setUserCurrency = (currency) => {
    localStorage.setItem('preferredCurrency', currency);
};

export default {
    convertCurrency,
    formatCurrencyWithSymbol,
    getAvailableCurrencies,
    getExchangeRate,
    getUserCurrency,
    setUserCurrency,
    CURRENCY_SYMBOLS,
    CURRENCY_NAMES
};