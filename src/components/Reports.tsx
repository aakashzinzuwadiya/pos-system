import React, { useState, useEffect } from 'react';
import './ProductAnalytics.css';
import NavBar from './NavBar';
// import ProductAnalytics from './ProductAnalytics';
import DateFilter from './DateFilter';
import SalesSummary from './SalesSummary';
import ProductAnalytics from './ProductAnalytics';
// import SalesSummary from './SalesSummary';

const Reports: React.FC = () => {
    const today = new Date().toISOString().split('T')[0]; // Format today's date in YYYY-MM-DD
    const [activeTab, setActiveTab] = useState<'sales-summary' | 'product-analytics'>('product-analytics');
    const [filterDates, setFilterDates] = useState<{ startDate: string; endDate: string }>({
        startDate: today,
        endDate: today
    });

    // Handle filter action and update the state for selected dates
    const handleFilter = (startDate: string, endDate: string) => {
        const todayStr = today;
        const clampedStart = startDate > todayStr ? todayStr : startDate;
        const clampedEnd = endDate > todayStr ? todayStr : endDate;
        setFilterDates({ startDate: clampedStart, endDate: clampedEnd });
    };

    // Handle export action based on the active tab
    const handleExport = () => {
        const exportElementId = activeTab === 'sales-summary' ? 'export-sales-summary' : 'export-product-analytics';
        document.getElementById(exportElementId)?.click();
    };

    return (
        <>
            <NavBar />
            <div className="flex justify-center items-center bg-gray-100 w-screen h-screen overflow-hidden">
                <div className="flex flex-col bg-white shadow-md mb-10 p-6 border border-gray-200 rounded-lg w-full max-w-screen-xl h-full">
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-4 border-gray-300 border-b">
                        <button
                            onClick={() => setActiveTab('product-analytics')}
                            className={`px-4 py-2 font-semibold text-gray-700 ${activeTab === 'product-analytics' ? 'border-b-2 border-blue-500 text-blue-500' : 'hover:text-blue-500'}`}
                        >
                            Product Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('sales-summary')}
                            className={`px-4 py-2 font-semibold text-gray-700 ${activeTab === 'sales-summary' ? 'border-b-2 border-blue-500 text-blue-500' : 'hover:text-blue-500'}`}
                        >
                            Sales Summary
                        </button>
                    </div>

                    {/* Date Filter Section */}
                    <DateFilter onFilter={handleFilter} onExport={handleExport} />

                    {/* Tab Content */}
                    <div className="mb-10 h-full overflow-y-auto">
                        {activeTab === 'sales-summary' && <SalesSummary filterDates={filterDates} />}
                        {activeTab === 'product-analytics' && <ProductAnalytics filterDates={filterDates} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
