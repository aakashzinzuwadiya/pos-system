import React, { useEffect, useState } from 'react';
import { usePos } from 'context/PosContext';
import Papa from 'papaparse';

interface SalesSummaryProps {
    filterDates: { startDate: string; endDate: string };
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ filterDates }) => {
    const { getSalesSummary } = usePos();
    const [filteredSalesData, setFilteredSalesData] = useState<{ [date: string]: { Cash: number; Card: number; Guest: number } }>({});
    const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

    // Fetch sales data within the date range provided in filterDates
    useEffect(() => {
        if (filterDates.startDate && filterDates.endDate) {
            const start = new Date(filterDates.startDate);
            const end = new Date(filterDates.endDate);
            const data: { [date: string]: { Cash: number; Card: number; Guest: number } } = {};

            for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
                const summary = getSalesSummary(new Date(day));
                data[day.toISOString().split('T')[0]] = summary;
            }
            setFilteredSalesData(data);
        }
    }, [filterDates, getSalesSummary]);

    // Export filtered sales data as CSV
    const exportData = () => {
        const today = new Date().toLocaleString('en-GB', {
            dateStyle: 'short',
          });
        const csvData = Object.entries(filteredSalesData).map(([date, summary]) => ({
            Date: date,
            Cash: summary.Cash.toFixed(2),
            Card:summary.Card.toFixed(2),
            Guest:summary.Guest.toFixed(2),
            Total:(summary.Cash + summary.Card + summary.Guest).toFixed(2),
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
        <div className="w-full max-w-screen-xl bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col overflow-hidden">
            <button id="export-sales-summary" style={{ display: 'none' }} onClick={exportData}></button>
            <div className="overflow-y-auto">
                <table className="w-full text-left border border-gray-300 overflow-hidden rounded-md shadow-sm">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-2 px-4 border-r text-right">Date</th>
                            <th className="py-2 px-4 border-r text-right">Cash</th>
                            <th className="py-2 px-4 border-r text-right">Card</th>
                            <th className="py-2 px-4 border-r text-right">Guest</th>
                            <th className="py-2 px-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(filteredSalesData).map((date) => {
                            const { Cash, Card, Guest } = filteredSalesData[date];
                            const total = Cash + Card + Guest;
                            return (
                                <tr key={date} className="hover:bg-gray-100 transition">
                                    <td className="py-2 px-4 border-b text-right font-bold">{date}</td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {currencySymbol}{Cash.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {currencySymbol}{Card.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right">
                                        {currencySymbol}{Guest.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-4 border-b text-right font-bold">
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
