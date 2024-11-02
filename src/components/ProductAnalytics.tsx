import React, { useEffect, useState } from 'react';
import { usePos } from 'context/PosContext';
import { ProductAnalyticsType } from 'types';
import Papa from 'papaparse';

interface ProductAnalyticsProps {
  filterDates: { startDate: string; endDate: string };
}

const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({ filterDates }) => {
  const { getProductAnalytics } = usePos();
  const [openTables, setOpenTables] = useState<{ [date: string]: boolean }>({});
  const [filteredDataByDate, setFilteredDataByDate] = useState<{ [date: string]: ProductAnalyticsType[] }>({});
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    if (filterDates.startDate && filterDates.endDate) {
      const start = new Date(filterDates.startDate);
      const end = new Date(filterDates.endDate);
      const data: { [date: string]: ProductAnalyticsType[] } = {};

      for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
        const dateAnalytics = getProductAnalytics(new Date(day));
        data[day.toISOString().split('T')[0]] = dateAnalytics;
      }
      setFilteredDataByDate(data);
    }
  }, [filterDates, getProductAnalytics]);

  const exportData = () => {
    const today = new Date().toLocaleString('en-GB', {
      dateStyle: 'short',
    });

    const csvData = Object.entries(filteredDataByDate).flatMap(([date, products]) =>
      products.map((product) => ({
        Date: date, // Set the date for each product entry
        ProductName: product.productName,
        TotalQuantitySold: product.totalQuantitySold,
        TotalRevenue: product.totalRevenue.toFixed(2),
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
      {/* Render analytics data */}
      <button id="export-product-analytics" style={{ display: 'none' }} onClick={exportData}></button>
      {/* Render your Product Analytics table here */}
      <div className="overflow-y-auto">
        {Object.keys(filteredDataByDate).map((date) => {
          const dateData = filteredDataByDate[date];
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
                    <thead className="bg-blue-500 text-white sticky top-0 overflow-hidden">
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
  );
};

export default ProductAnalytics;
