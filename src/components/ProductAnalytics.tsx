import React, { useEffect, useState } from 'react';
import { usePos } from 'context/PosContext';
import { ProductAnalyticsType } from 'types';
import NavBar from './NavBar';
import Papa from 'papaparse';
import './ProductAnalytics.css';

const ProductAnalytics: React.FC = () => {
  const { getProductAnalytics } = usePos();
  const todayDate = new Date().toISOString().split('T')[0]; // Today’s date in YYYY-MM-DD format
  const [filteredDataByDate, setFilteredDataByDate] = useState<{ [date: string]: ProductAnalyticsType[] }>({});
  const [startDate, setStartDate] = useState<string>(todayDate);
  const [endDate, setEndDate] = useState<string>(todayDate);
  const [openTables, setOpenTables] = useState<{ [date: string]: boolean }>({});
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  // Fetch and filter today's data on component mount
  useEffect(() => {
    handleFilterByDate(); // Load data for today on mount
  }, []);

  // const handleFilterByDate = async () => {
  //   if (!startDate || !endDate) {
  //     alert('Please select both start and end dates');
  //     return;
  //   }

  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   end.setHours(23, 59, 59, 999);

  //   if (start > end) {
  //     alert('Start date cannot be later than end date.');
  //     return;
  //   }

  //   // Fetch the latest analytics data
  //   const analyticsData = await getProductAnalytics();

  //   // Helper to format dates as DD-MM-YYYY for consistency
  //   const formatDate = (date: Date) => {
  //     const day = String(date.getDate()).padStart(2, '0');
  //     const month = String(date.getMonth() + 1).padStart(2, '0');
  //     const year = date.getFullYear();
  //     return `${day}-${month}-${year}`;
  //   };

  //   // Filter and group data by date range
  //   const groupedData = analyticsData.reduce<{ [date: string]: ProductAnalyticsType[] }>((acc, product) => {
  //     if (product.date) {
  //       const productDate = formatDate(product.date);
  //       const formattedStartDate = formatDate(start);
  //       const formattedEndDate = formatDate(end);

  //       // Only include product if its date is within the start-end range
  //       if (productDate >= formattedStartDate && productDate <= formattedEndDate) {
  //         if (!acc[productDate]) {
  //           acc[productDate] = [];
  //         }
  //         acc[productDate].push(product);
  //       }
  //     }
  //     return acc;
  //   }, {});

  //   setFilteredDataByDate(groupedData);

  //   // Set initial open state for each date as closed (false)
  //   const initialOpenState = Object.keys(groupedData).reduce((acc, date) => {
  //     acc[date] = false;
  //     return acc;
  //   }, {} as { [date: string]: boolean });
  //   setOpenTables(initialOpenState);
  // };


  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleFilterByDate = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      alert('Start date cannot be later than end date.');
      return;
    }

    // Fetch the analytics data for each date in the range
    const analyticsData: { [date: string]: ProductAnalyticsType[] } = {};
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateAnalytics = getProductAnalytics(new Date(day));
      const formattedDate = formatDate(day); // Helper to format date as 'DD-MM-YYYY'
      analyticsData[formattedDate] = dateAnalytics;
    }

    setFilteredDataByDate(analyticsData);

    // Set initial open state for each date as closed (false)
    const initialOpenState = Object.keys(analyticsData).reduce((acc, date) => {
      acc[date] = false;
      return acc;
    }, {} as { [date: string]: boolean });
    setOpenTables(initialOpenState);
  };


  const toggleTable = (date: string) => {
    setOpenTables((prevOpenTables) => ({
      ...prevOpenTables,
      [date]: !prevOpenTables[date],
    }));
  };

  const handleExportCSV = () => {
    const csvData = Object.values(filteredDataByDate).flat().map((product) => ({
      Date: product.date ? product.date.toLocaleDateString('en-GB') : 'N/A',
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

  return (
    <>
      <NavBar />
      <div className="w-screen bg-gray-100 flex items-center justify-center py-10 overflow-hidden">
        <div className="w-full max-w-screen-xl bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col h-[80vh]">
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
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-y-auto">
            {/* Render Collapsible Tables for Each Date */}
            {Object.keys(filteredDataByDate).map((date) => (
              <div key={date} className="mb-4">
                {/* Collapsible Header */}
                <div
                  className="cursor-pointer bg-gray-200 p-2 rounded-md flex justify-between items-center"
                  onClick={() => toggleTable(date)}
                >
                  <h3 className="text-lg font-bold text-gray-800">{date}</h3>
                  <span>{openTables[date] ? '-' : '+'}</span>
                </div>

                {/* Collapsible Table */}
                {openTables[date] && (
                  <div className="expanded-table-container max-h-60 mt-2 overflow-hidden">
                    <table className="w-full text-left border border-gray-300 overflow-hidden rounded-md shadow-sm">
                      <thead className="bg-blue-500 text-white sticky top-0 overflow-hidden ">
                        <tr>
                          <th className="py-2 px-4 border-r text-right">Product Name</th>
                          <th className="py-2 px-4 border-r text-right">Price</th>
                          <th className="py-2 px-4 border-r text-right">Total Quantity Sold</th>
                          <th className="py-2 px-4 border-r text-right">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="overflow-y-auto">
                        {filteredDataByDate[date].map((product) => (
                          <tr key={product.productId} className="hover:bg-gray-100 transition">
                            <td className="py-2 px-4 border-b text-right">{product.productName}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {currencySymbol}{product.price.toFixed(2)} {/* Display the original price */}
                            </td>
                            <td className="py-2 px-4 border-b text-right">{product.totalQuantitySold}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {currencySymbol}{product.totalRevenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductAnalytics;
