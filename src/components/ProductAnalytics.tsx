import React, { useEffect, useState } from 'react';
import { usePos } from 'context/PosContext';
import { ProductAnalyticsType } from 'types';
import NavBar from './NavBar';
import Papa from 'papaparse'; // For CSV export

const ProductAnalytics: React.FC = () => {
  const { getProductAnalytics, getDaySalesTimestamps } = usePos(); // Add method to get start and end of the day sales
  const [analyticsData, setAnalyticsData] = useState<ProductAnalyticsType[]>([]);
  const [filteredData, setFilteredData] = useState<ProductAnalyticsType[]>([]);
  const [startOfDaySale, setStartOfDaySale] = useState<string | null>(null);
  const [endOfDaySale, setEndOfDaySale] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProductAnalyticsType; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    // Fetch analytics data when the component is mounted
    const data = getProductAnalytics();
    setAnalyticsData(data);
    setFilteredData(data);
    fetchDaySaleTimes(new Date()); // Fetch today's sale times
  }, [getProductAnalytics]);

  // Fetch the start and end of day sale times
  const fetchDaySaleTimes = async (date: Date) => {
    const result = await getDaySalesTimestamps(date);
    setStartOfDaySale(result.startOfDaySale ? new Date(result.startOfDaySale).toLocaleTimeString() : null);
    setEndOfDaySale(result.endOfDaySale ? new Date(result.endOfDaySale).toLocaleTimeString() : null);
  };

  // Handle sorting by each column
  const handleSort = (key: keyof ProductAnalyticsType) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredData(sortedData);
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const csvData = filteredData.map((product) => ({
      Date: new Date(product.date).toLocaleDateString('en-GB'), // Format the date
      ProductName: product.productName,
      TotalQuantitySold: product.totalQuantitySold,
      TotalRevenue: product.totalRevenue.toFixed(2),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Date Filtering (Single Date or Date Range)
  const handleFilterByDate = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert('Start date cannot be later than end date.');
      return;
    }

    // Set the end date to the end of the day
    end.setHours(23, 59, 59, 999);

    const filtered = analyticsData.filter((product) => {
      const productDate = new Date(product.date);
      return productDate >= start && productDate <= end;
    });

    setFilteredData(filtered);
    fetchDaySaleTimes(start); // Fetch sales times for the selected date
  };

  return (
    <>
      <NavBar />
      <div className="w-screen bg-gray-100 flex items-center justify-center py-10 overflow-hidden">
        <div className="w-full max-w-screen-xl bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Product Analytics</h2>

            {/* Date Filter Section */}
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label className="block text-gray-700">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-gray-700">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border rounded-md"
                />
              </div>
              <button
                onClick={handleFilterByDate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
              >
                Filter
              </button>
              <button
                onClick={() => {
                  setFilteredData(analyticsData);
                  setStartDate(new Date().toISOString().split('T')[0]); // Reset to today's date
                  setEndDate(new Date().toISOString().split('T')[0]);   // Reset to today's date
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
              >
                Reset
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
            >
              Export CSV
            </button>
          </div>

          {/* Display Start and End of the Day Sales */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-700">
              <span className="font-semibold">Start of Day Sale: </span>
              {startOfDaySale || 'No sales recorded for this day.'}
            </div>
            <div className="text-sm font-medium text-gray-700">
              <span className="font-semibold">End of Day Sale: </span>
              {endOfDaySale || 'No sales recorded for this day.'}
            </div>
          </div>

          {/* Analytics Table */}
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border border-gray-300 rounded-md shadow-sm">
              <thead className="bg-blue-500 text-white sticky top-0">
                <tr>
                  <th
                    className="py-2 px-4 border-r text-right cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </th>
                  <th
                    className="py-2 px-4 border-r cursor-pointer"
                    onClick={() => handleSort('productName')}
                  >
                    Product Name
                  </th>
                  <th
                    className="py-2 px-4 border-r text-right cursor-pointer"
                    onClick={() => handleSort('totalQuantitySold')}
                  >
                    Total Quantity Sold
                  </th>
                  <th
                    className="py-2 px-4 border-r text-right cursor-pointer"
                    onClick={() => handleSort('totalRevenue')}
                  >
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-100 transition duration-200">
                      <td className="py-2 px-4 border-b text-right">
                        {new Date(product.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">{product.productName}</td>
                      <td className="py-2 px-4 border-b text-right">{product.totalQuantitySold}</td>
                      <td className="py-2 px-4 border-b text-right">
                        {currencySymbol}
                        {product.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-600">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductAnalytics;
