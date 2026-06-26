/**
 * Calculate commission for a single product
 * @param {number} price - Product price
 * @param {number} commissionRate - Vendor's commission rate (5 for basic, 2 for premium)
 * @returns {object} - Platform commission and vendor earning
 */
export const calculateProductCommission = (price, commissionRate = 5) => {
    const platformCommission = (price * commissionRate) / 100;
    const vendorEarning = price - platformCommission;

    return {
        platformCommission: Math.round(platformCommission),
        vendorEarning: Math.round(vendorEarning),
        commissionRate: commissionRate
    };
};

/**
 * Calculate commission for an entire order with multiple vendors
 * @param {array} items - Cart items with vendorId and price
 * @param {object} vendorRates - Object mapping vendorId to commissionRate
 * @returns {object} - Total platform commission and vendor earnings breakdown
 */
export const calculateOrderCommission = (items, vendorRates) => {
    const vendorEarnings = {};
    let totalPlatformCommission = 0;
    let totalVendorEarnings = 0;

    items.forEach(item => {
        const commissionRate = vendorRates[item.vendorId] || 5;
        const { platformCommission, vendorEarning } = calculateProductCommission(
            item.price * item.quantity,
            commissionRate
        );

        vendorEarnings[item.vendorId] = (vendorEarnings[item.vendorId] || 0) + vendorEarning;
        totalPlatformCommission += platformCommission;
        totalVendorEarnings += vendorEarning;
    });

    return {
        platformCommission: totalPlatformCommission,
        vendorEarnings: vendorEarnings,
        vendorEarningsTotal: totalVendorEarnings,
        totalAmount: totalPlatformCommission + totalVendorEarnings
    };
};

/**
 * Calculate vendor's net earnings after commission
 * @param {number} totalSales - Vendor's total sales
 * @param {number} commissionRate - Vendor's commission rate
 * @returns {object} - Commission amount and net earnings
 */
export const calculateVendorNetEarnings = (totalSales, commissionRate = 5) => {
    const commission = (totalSales * commissionRate) / 100;
    const netEarnings = totalSales - commission;

    return {
        grossSales: totalSales,
        commission: Math.round(commission),
        netEarnings: Math.round(netEarnings),
        commissionRate: commissionRate
    };
};

/**
 * Calculate platform revenue from all vendors
 * @param {array} orders - Array of order objects with vendorEarnings
 * @returns {object} - Total platform revenue breakdown
 */
export const calculatePlatformRevenue = (orders) => {
    let totalSales = 0;
    let totalCommission = 0;
    let totalVendorPayout = 0;

    orders.forEach(order => {
        totalSales += order.totalAmount || 0;
        totalCommission += order.platformCommission || 0;
        totalVendorPayout += order.vendorEarningsTotal || 0;
    });

    return {
        totalSales,
        totalCommission,
        totalVendorPayout,
        platformRevenue: totalCommission
    };
};

export default {
    calculateProductCommission,
    calculateOrderCommission,
    calculateVendorNetEarnings,
    calculatePlatformRevenue
};