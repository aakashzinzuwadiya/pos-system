import React, { useEffect, useState } from 'react';
import { usePos } from 'context/PosContext';
import { ProductAnalyticsType } from 'types';
import NavBar from './NavBar';
import Papa from 'papaparse';
import './ProductAnalytics.css';

const ProductAnalytics: React.FC = () => {
  const { getProductAnalytics } = usePos();
  const todayDate = new Date().toISOString().split('T')[0];
  const [filteredDataByDate, setFilteredDataByDate] = useState<{ [date: string]: ProductAnalyticsType[] }>({});
  const [startDate, setStartDate] = useState<string>(todayDate);
  const [endDate, setEndDate] = useState<string>(todayDate);
  const [openTables, setOpenTables] = useState<{ [date: string]: boolean }>({});
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    handleFilterByDate();
  }, []);

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

    const analyticsData: { [date: string]: ProductAnalyticsType[] } = {};
    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateAnalytics = getProductAnalytics(new Date(day));
      const formattedDate = formatDate(day);
      analyticsData[formattedDate] = dateAnalytics;
    }

    setFilteredDataByDate(analyticsData);

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
            {Object.keys(filteredDataByDate).map((date) => {
              const dateData = filteredDataByDate[date];
              const totalQuantitySold = dateData.reduce((total, item) => total + item.totalQuantitySold, 0);
              const totalRevenue = dateData.reduce((total, item) => total + item.totalRevenue, 0);

              return (
                <div key={date} className="mb-4">
                  <div
                    className="cursor-pointer bg-gray-200 p-2 rounded-md flex justify-between items-center"
                    onClick={() => toggleTable(date)}
                  >
                    <h3 className="text-lg font-bold text-gray-800">{date}</h3>
                    <span>{openTables[date] ? '-' : '+'}</span>
                  </div>

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
                          {dateData.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-100 transition">
                              <td className="py-2 px-4 border-b text-right">{product.productName}</td>
                              <td className="py-2 px-4 border-b text-right">
                                {currencySymbol}{product.price.toFixed(2)}
                              </td>
                              <td className="py-2 px-4 border-b text-right">{product.totalQuantitySold}</td>
                              <td className="py-2 px-4 border-b text-right">
                                {currencySymbol}{product.totalRevenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-100 font-bold">
                            <td className="py-2 px-4 border-t text-right">Total</td>
                            <td className="py-2 px-4 border-t text-right"></td>
                            <td className="py-2 px-4 border-t text-right"></td>
                            <td className="py-2 px-4 border-t text-right">
                              {currencySymbol}{totalRevenue.toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductAnalytics;
