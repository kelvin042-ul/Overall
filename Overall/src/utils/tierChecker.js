/**
 * Tier configurations
 */
export const TIERS = {
    basic: {
        name: 'Basic',
        maxProducts: 50,
        commissionRate: 5,
        maxMonthlyOrders: 500,
        features: ['50 products max', '5% commission', 'Basic support', 'Monthly payouts'],
        price: 0, // Free
        priceNGN: 0
    },
    premium: {
        name: 'Premium',
        maxProducts: 500,
        commissionRate: 2,
        maxMonthlyOrders: 5000,
        features: ['500 products max', '2% commission', 'Priority support', 'Weekly payouts', 'Featured listings'],
        price: 50, // USD
        priceNGN: 50000 // NGN
    },
    enterprise: {
        name: 'Enterprise',
        maxProducts: Infinity,
        commissionRate: 1,
        maxMonthlyOrders: Infinity,
        features: ['Unlimited products', '1% commission', '24/7 dedicated support', 'Daily payouts', 'Featured listings', 'Marketing tools'],
        price: 200, // USD
        priceNGN: 200000 // NGN
    }
};

/**
 * Check if vendor can add more products
 * @param {object} vendor - Vendor object with tier and current product count
 * @returns {object} - Can add and message
 */
export const canAddProduct = (vendor) => {
    const tierConfig = TIERS[vendor.tier || 'basic'];
    const currentProductCount = vendor.productCount || 0;
    const maxProducts = tierConfig.maxProducts;

    if (currentProductCount >= maxProducts) {
        return {
            allowed: false,
            message: `You've reached the limit of ${maxProducts} products. Upgrade to ${vendor.tier === 'basic' ? 'Premium' : 'Enterprise'} to add more.`,
            upgradeNeeded: true
        };
    }

    return {
        allowed: true,
        message: `You have ${maxProducts - currentProductCount} slots remaining`,
        upgradeNeeded: false
    };
};

/**
 * Check if vendor can receive orders (not exceeded monthly limit)
 * @param {object} vendor - Vendor object
 * @param {number} currentMonthlyOrders - Orders this month
 * @returns {object} - Can accept and message
 */
export const canAcceptOrder = (vendor, currentMonthlyOrders = 0) => {
    const tierConfig = TIERS[vendor.tier || 'basic'];
    const maxOrders = tierConfig.maxMonthlyOrders;

    if (currentMonthlyOrders >= maxOrders) {
        return {
            allowed: false,
            message: `Monthly order limit reached (${maxOrders}). Upgrade to continue selling.`
        };
    }

    return {
        allowed: true,
        message: `${maxOrders - currentMonthlyOrders} orders remaining this month`
    };
};

/**
 * Get vendor's commission rate based on tier
 * @param {string} tier - basic, premium, enterprise
 * @returns {number} - Commission rate percentage
 */
export const getCommissionRate = (tier) => {
    return TIERS[tier || 'basic']?.commissionRate || 5;
};

/**
 * Get tier upgrade price
 * @param {string} fromTier - Current tier
 * @param {string} toTier - Desired tier
 * @param {string} currency - NGN or USD
 * @returns {number} - Upgrade price
 */
export const getUpgradePrice = (fromTier, toTier, currency = 'NGN') => {
    const toTierConfig = TIERS[toTier];
    if (!toTierConfig) return 0;

    if (currency === 'NGN') {
        return toTierConfig.priceNGN;
    }
    return toTierConfig.price;
};

/**
 * Calculate next tier info for vendor
 * @param {object} vendor - Vendor object
 * @returns {object} - Next tier info or null if at max
 */
export const getNextTierInfo = (vendor) => {
    const currentTier = vendor.tier || 'basic';

    if (currentTier === 'basic') {
        return {
            tier: 'premium',
            ...TIERS.premium,
            upgradePrice: TIERS.premium.priceNGN,
            benefit: `Save ${TIERS.basic.commissionRate - TIERS.premium.commissionRate}% on commission`
        };
    }

    if (currentTier === 'premium') {
        return {
            tier: 'enterprise',
            ...TIERS.enterprise,
            upgradePrice: TIERS.enterprise.priceNGN,
            benefit: `Save ${TIERS.premium.commissionRate - TIERS.enterprise.commissionRate}% on commission`
        };
    }

    return null; // Already at enterprise
};

/**
 * Calculate product limit warning
 * @param {object} vendor - Vendor object
 * @returns {object} - Warning level and message
 */
export const getProductLimitWarning = (vendor) => {
    const tierConfig = TIERS[vendor.tier || 'basic'];
    const currentCount = vendor.productCount || 0;
    const maxProducts = tierConfig.maxProducts;
    const percentage = (currentCount / maxProducts) * 100;

    if (percentage >= 90) {
        return {
            level: 'danger',
            message: `Critical: ${maxProducts - currentCount} product slots remaining! Upgrade now.`,
            showUpgradeButton: true
        };
    }

    if (percentage >= 70) {
        return {
            level: 'warning',
            message: `Warning: ${maxProducts - currentCount} product slots remaining. Consider upgrading.`,
            showUpgradeButton: true
        };
    }

    return {
        level: 'info',
        message: `${maxProducts - currentCount} product slots available`,
        showUpgradeButton: false
    };
};

export default {
    TIERS,
    canAddProduct,
    canAcceptOrder,
    getCommissionRate,
    getUpgradePrice,
    getNextTierInfo,
    getProductLimitWarning
};