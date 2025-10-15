import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from '../types';
import Papa from 'papaparse'; // Import PapaParse for CSV export

const buttonBase = "p-2 rounded-md transition cursor-pointer font-semibold text-white";
const buttonHover = "hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600";

interface TransactionListProps {
  transactions: Transaction[];
  onShow: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showExport?: boolean;
  buttonClass?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onShow,
  onDelete,
  showExport,
  buttonClass = `${buttonBase} ${buttonHover}`,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate the total number of pages
  const totalPages = Math.max(1, Math.ceil(transactions.length / itemsPerPage));

  // Ensure currentPage is valid when transactions change
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

    // If current page is now empty and not the first page, go to previous page
    if (currentPage > 1 && currentTransactions.length === 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [transactions, currentPage, itemsPerPage]);

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

  // Always show pagination controls, even for tablet views
  return (
    <div className="flex flex-col bg-white shadow-md p-4 border border-gray-300 rounded-lg w-full h-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-primary text-lg">Transactions List</h2>
        {showExport && (
          <button
            className={buttonClass}
            onClick={handleExportCSV}
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
                {showExport && <div className="font-semibold text-blue-600 text-center">{`${process.env.REACT_APP_CURRENCY_SYMBOL}${transaction.totalAmount}`}</div>}

                {/* Actions */}
                <div className="flex justify-end items-end space-x-2 col-span-2">
                  <button
                    className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow px-3 py-2 rounded-md text-white transition"
                    onClick={() => onShow(transaction)}                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  {showExport && onDelete && (
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="hover:bg-red-700 bg-gradient-to-br from-red-500 to-red-700 shadow px-3 py-2 rounded-md text-white transition"
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
      <div className="flex sm:flex-row flex-col justify-between items-center gap-2 mt-4">
        <div className="text-gray-700 text-sm">
          {`Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, transactions.length)} of ${transactions.length} transactions`}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="py-2 font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
