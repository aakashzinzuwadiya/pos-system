import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from '../types';
import Papa from 'papaparse'; // Import PapaParse for CSV export

interface TransactionListProps {
  transactions: Transaction[];
  onShow: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showExport?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onShow,
  onDelete,
  showExport,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate the total number of pages
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Get the transactions to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  // Handle CSV Export
  const handleExportCSV = () => {
    const today = new Date().toLocaleString('en-GB', {
      dateStyle: 'short',
    });

    const csvData = transactions.flatMap((transaction) =>
      transaction.items.map((item) => ({
        OrderID: transaction.orderId,
        Date: new Date(transaction.date.toMillis()).toLocaleString('en-GB', {
          dateStyle: 'short',
          timeStyle: 'medium',
        }),
        Item: item.name,
        ItemPrice: item.price.toFixed(2),
        TotalAmount: transaction.totalAmount.toFixed(2),
        UserEmail: transaction.email
      }))
    );    

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Transactions-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">Transactions List</h2>
        {showExport && (
          <button
            onClick={handleExportCSV}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition duration-150"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-6 gap-4 p-2 font-semibold text-gray-800 bg-gray-100 border-b border-gray-300 rounded-t-md">
        <div className="col-span-2">Order ID</div>
        <div className="text-center">Items</div>
        {showExport && <div className="text-center">Total ({currencySymbol})</div>}
        <div className="text-right col-span-2">Actions</div>
      </div>

      {/* Transactions List Container */}
      <div className="flex-grow overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-center flex-grow mt-4">No transactions available.</p>
        ) : (
          <ul className="space-y-2">
            {currentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="grid grid-cols-6 gap-4 items-center bg-gray-50 p-2 rounded-md shadow-sm hover:shadow-lg transition duration-200"
              >
                {/* Transaction ID */}
                <div className="col-span-2 font-medium text-gray-800 truncate">
                  {transaction.orderId}
                </div>

                {/* Items Count */}
                <div className="text-center text-gray-600">{transaction.items.length}</div>

                {/* Total Amount */}
                {showExport && <div className="text-center font-semibold text-green-600">{`${process.env.REACT_APP_CURRENCY_SYMBOL}${transaction.totalAmount.toFixed(
                  2
                )}`}</div>}

                {/* Actions */}
                <div className="col-span-2 flex justify-end items-end space-x-2">
                  <button
                    onClick={() => onShow(transaction)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition duration-150"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {showExport && onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition duration-150"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        {/* Show total records out of records being shown */}
        <div className="text-gray-700 text-sm">
          {`Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, transactions.length)} of ${transactions.length} transactions`}
        </div>

        {/* Pagination Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition duration-150 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400 transition duration-150 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
