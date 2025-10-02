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
      transaction.items.map((item) => {
        let dateString;
        if (transaction.date instanceof Date) {
          dateString = transaction.date.toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'medium',
          });
        } else if (typeof transaction.date === 'string' || typeof transaction.date === 'number') {
          dateString = new Date(transaction.date).toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'medium',
          });
        } else if (transaction.date && transaction.date.seconds) {
          dateString = new Date(transaction.date.seconds * 1000).toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'medium',
          });
        } else {
          dateString = '';
        }

        // Ensure price and quantity are numbers before using toFixed
        const price = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : Number(item.quantity) || 0;
        const totalAmount = typeof transaction.totalAmount === 'number' ? transaction.totalAmount : Number(transaction.totalAmount) || 0;

        return {
          OrderID: transaction.orderId,
          Date: dateString,
          Item: item.name,
          ItemPrice: price.toFixed(2),
          ItemQuantity: quantity,
          ItemTotal: (price * quantity).toFixed(2),
          TotalAmount: totalAmount.toFixed(2),
          PaymentMethod: transaction.paymentMethod,
          UserEmail: transaction.email
        };
      })
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
    <div className="flex flex-col bg-white shadow-md p-4 border border-gray-300 rounded-lg w-full h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-primary text-lg">Transactions List</h2>
        {showExport && (
          <button
            onClick={handleExportCSV}
            className="flex items-center bg-green-500 hover:bg-green-600 shadow-md px-3 py-2 rounded-md text-white transition duration-150"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Table Headers */}
      <div className="gap-4 grid grid-cols-6 bg-gray-100 p-2 border-gray-300 border-b rounded-t-md font-semibold text-gray-800">
        <div className="col-span-2">Order ID</div>
        <div className="text-center">Items</div>
        {showExport && <div className="text-center">Total ({currencySymbol})</div>}
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Transactions List Container */}
      <div className="flex-grow overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="flex-grow mt-4 text-center">No transactions available.</p>
        ) : (
          <ul className="space-y-2">
            {currentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="items-center gap-4 grid grid-cols-6 bg-gray-50 shadow-sm hover:shadow-lg p-2 rounded-md transition duration-200"
              >
                {/* Transaction ID */}
                <div className="col-span-2 font-medium text-gray-800 truncate">
                  {transaction.orderId}
                </div>

                {/* Items Count */}
                <div className="text-gray-600 text-center">{transaction.items.length}</div>

                {/* Total Amount */}
                {showExport && <div className="font-semibold text-green-600 text-center">{`${process.env.REACT_APP_CURRENCY_SYMBOL}${transaction.totalAmount}`}</div>}

                {/* Actions */}
                <div className="flex justify-end items-end space-x-2 col-span-2">
                  <button
                    onClick={() => onShow(transaction)}
                    className="bg-blue-500 hover:bg-blue-600 shadow-md px-3 py-1 rounded-md text-white transition duration-150"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {showExport && onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="bg-red-500 hover:bg-red-600 shadow-md px-3 py-1 rounded-md text-white transition duration-150"
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
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-gray-800 transition duration-150"
          >
            Previous
          </button>
          <span className="py-2 font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-gray-800 transition duration-150"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
