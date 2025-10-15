import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductAnalyticsType } from 'types';
import Papa from 'papaparse';

interface ProductAnalyticsProps {
  filterDates: { startDate: string; endDate: string };
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const clampToToday = (dateStr: string) => {
  const todayStr = getTodayDateString();
  return dateStr > todayStr ? todayStr : dateStr;
};

const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({ filterDates }) => {
  const [openTables, setOpenTables] = useState<{ [date: string]: boolean }>({});
  const [analyticsData, setAnalyticsData] = useState<
    { date: string; products: ProductAnalyticsType[] }[]
  >([]);
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    // Set default dates to today if not provided, and clamp to today if in future
    let startDate = filterDates.startDate || getTodayDateString();
    let endDate = filterDates.endDate || getTodayDateString();

    startDate = clampToToday(startDate);
    endDate = clampToToday(endDate);

    if (startDate && endDate) {
      const fetchData = async () => {
        try {
          const response = await axios.post<
            { date: string; products: ProductAnalyticsType[] }[]
          >(`${process.env.REACT_APP_API_URL}/productanalytics`, { startDate, endDate });

          const sortedData = response.data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setAnalyticsData(sortedData);
        } catch (error) {
          console.error('Error fetching product analytics:', error);
        }
      };

      fetchData();
    }
  }, [filterDates]);

  const exportData = () => {
    const today = new Date().toLocaleString('en-GB', {
      dateStyle: 'short',
    });

    const csvData = analyticsData.flatMap(({ date, products }) =>
      products.map((product) => ({
        Date: date,
        ProductName: product.productName,
        TotalQuantitySold: product.totalQuantitySold,
        TotalRevenue: typeof product.totalRevenue === 'string' ? parseFloat(product.totalRevenue) : product.totalRevenue,
      }))
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.id = 'export-product-analytics';
    link.href = url;
    link.setAttribute('download', 'product_analytics-' + today + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleTable = (date: string) => {
    setOpenTables((prevOpenTables) => ({
      ...prevOpenTables,
      [date]: !prevOpenTables[date],
    }));
  };

  return (
    <div className="w-full overflow-hidden">
      <button id="export-product-analytics" style={{ display: 'none' }} onClick={exportData}></button>
      <div className="overflow-y-auto">
        {analyticsData.map(({ date, products }) => {
          const totalRevenue = products
            .reduce((total, item) => total + (typeof item.totalRevenue === 'string' ? parseFloat(item.totalRevenue) : item.totalRevenue), 0)
            .toFixed(2);

          return (
            <div key={date} className="mb-4">
              <div
                className="flex justify-between items-center bg-gray-200 p-2 rounded-md cursor-pointer"
                onClick={() => toggleTable(date)}
              >
                <h3 className="font-bold text-gray-800 text-lg">{date}</h3>
                <span>{openTables[date] ? '-' : '+'}</span>
              </div>

              {openTables[date] && (
                <div className="expanded-table-container mt-2 max-h-60 overflow-hidden">
                  <table className="shadow-sm border border-gray-300 rounded-md w-full overflow-hidden text-left">
                    <thead className="top-0 sticky bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden text-white">
                      <tr>
                        <th className="px-4 py-2 border-r text-right">Product Name</th>
                        <th className="px-4 py-2 border-r text-right">Total Quantity Sold</th>
                        <th className="px-4 py-2 border-r text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="overflow-y-auto">
                      {products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition">
                          <td className="px-4 py-2 border-b text-right">{product.productName}</td>
                          <td className="px-4 py-2 border-b text-right">{product.totalQuantitySold}</td>
                          <td className="px-4 py-2 border-b text-right">
                            {currencySymbol}
                            {product.totalRevenue}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-4 py-2 border-t text-right">Total</td>
                        <td className="px-4 py-2 border-t text-right"></td>
                        <td className="px-4 py-2 border-t text-right">
                          {currencySymbol}
                          {totalRevenue}
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
  );
};

export default ProductAnalytics;