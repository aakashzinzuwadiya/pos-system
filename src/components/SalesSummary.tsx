import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

interface SalesSummaryProps {
  filterDates: { startDate: string; endDate: string };
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ filterDates }) => {
  const [filteredSalesData, setFilteredSalesData] = useState<{ [date: string]: { Cash: number; Card: number; Guest: number } }>({});
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

//   // Fetch sales data within the date range provided in filterDates
  useEffect(() => {
    if (filterDates.startDate && filterDates.endDate) {
      const fetchData = async () => {
        try {
          const response = await axios.post<{ [date: string]: { Cash: number; Card: number; Guest: number } }>(`${process.env.REACT_APP_API_URL}/salessummary`, filterDates);
          setFilteredSalesData(response.data);
        } catch (error) {
          console.error('Error fetching sales summary FE:', error);
        }
      };

      fetchData();
    }
  }, [filterDates]);

//   // Export filtered sales data as CSV
  const exportData = () => {
    const today = new Date().toLocaleString('en-GB', {
      dateStyle: 'short',
    });
    const csvData = Object.entries(filteredSalesData).map(([date, summary]) => ({
      Date: date,
      Cash: summary.Cash.toFixed(2),
      Card: summary.Card.toFixed(2),
      Guest: summary.Guest.toFixed(2),
      Total: (summary.Cash + summary.Card + summary.Guest).toFixed(2),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.id = 'export-sales-summary';
    link.href = url;
    link.setAttribute('download', 'sales_summary-' + today + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col bg-white shadow-md p-6 border border-gray-200 rounded-lg w-full max-w-screen-xl overflow-hidden">
      <button id="export-sales-summary" style={{ display: 'none' }} onClick={exportData}></button>
      <div className="overflow-y-auto">
        <table className="shadow-sm border border-gray-300 rounded-md w-full overflow-hidden text-left">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-4 py-2 border-r text-right">Date</th>
              <th className="px-4 py-2 border-r text-right">Cash</th>
              <th className="px-4 py-2 border-r text-right">Card</th>
              <th className="px-4 py-2 border-r text-right">Guest</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(filteredSalesData).map((date) => {
              const { Cash, Card, Guest } = filteredSalesData[date];
              const total = Cash + Card + Guest;
              return (
                <tr key={date} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-2 border-b font-bold text-right">{date}</td>
                  <td className="px-4 py-2 border-b text-right">
                    {currencySymbol}{Cash.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b text-right">
                    {currencySymbol}{Card.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b text-right">
                    {currencySymbol}{Guest.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border-b font-bold text-right">
                    {currencySymbol}{total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesSummary;