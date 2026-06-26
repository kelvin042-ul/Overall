import { FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';

const EarningsChart = ({ orders, vendor }) => {
    // Calculate monthly earnings
    const monthlyData = {};
    orders.forEach(order => {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[month]) {
            monthlyData[month] = { sales: 0, commission: 0, earnings: 0 };
        }
        const orderTotal = order.vendorTotal || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        monthlyData[month].sales += orderTotal;
        monthlyData[month].commission += orderTotal * (vendor?.commissionRate || 5) / 100;
        monthlyData[month].earnings += orderTotal - (orderTotal * (vendor?.commissionRate || 5) / 100);
    });

    const months = Object.keys(monthlyData).slice(-6);
    const maxEarnings = Math.max(...Object.values(monthlyData).map(d => d.earnings), 0);

    const totalSales = orders.reduce((sum, order) => {
        const orderTotal = order.vendorTotal || order.items?.reduce((s, item) => s + (item.price * item.quantity), 0) || 0;
        return sum + orderTotal;
    }, 0);

    const totalCommission = totalSales * (vendor?.commissionRate || 5) / 100;
    const netEarnings = totalSales - totalCommission;

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <FiDollarSign /> Total Sales
                    </div>
                    <p className="text-2xl font-bold">₦{totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <FiTrendingUp /> Platform Fee ({vendor?.commissionRate || 5}%)
                    </div>
                    <p className="text-2xl font-bold text-red-600">-₦{totalCommission.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <FiDollarSign /> Your Earnings
                    </div>
                    <p className="text-2xl font-bold text-green-600">₦{netEarnings.toLocaleString()}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FiCalendar /> Monthly Earnings (Last 6 Months)
                </h3>

                {months.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No sales data yet</p>
                ) : (
                    <div className="space-y-3">
                        {months.map(month => (
                            <div key={month}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{month}</span>
                                    <span className="font-bold">₦{monthlyData[month].earnings.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                                        style={{ width: `${(monthlyData[month].earnings / maxEarnings) * 100}%` }}
                                    >
                                        {monthlyData[month].earnings > 0 && `${Math.round((monthlyData[month].earnings / maxEarnings) * 100)}%`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarningsChart;