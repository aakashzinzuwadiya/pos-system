// src/components/TransactionList.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onShow: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onShow, onDelete }) => {
  return (
    <div className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-primary">Transaction List</h2>

      {/* Table Headers */}
      <div className="grid grid-cols-6 gap-4 p-2 font-semibold text-gray-800 bg-gray-100 border-b border-gray-300 rounded-t-md">
        <div className="col-span-2">Order ID</div>
        <div className="text-center">Items Count</div>
        <div className="text-center">Total Amount</div>
        <div className="text-center col-span-2">Actions</div>
      </div>

      {/* Transactions List */}
      <div className="flex-grow overflow-y-auto mb-4">
        {transactions.length === 0 ? (
          <p className="text-center flex-grow mt-4">No transactions available.</p>
        ) : (
          <div className="flex-grow overflow-y-auto">
            <ul className="space-y-2">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="grid grid-cols-6 gap-4 items-center bg-gray-50 p-2 rounded-md shadow-sm hover:shadow-lg transition duration-200"
                >

                  {/* Transaction ID */}
                  <div className="col-span-2 font-medium text-gray-800 truncate">{transaction.orderId}</div>

                  {/* Items Count */}
                  <div className="text-center text-gray-600">{transaction.items.length}</div>

                  {/* Total Amount */}
                  <div className="text-center font-semibold text-green-600">{`${process.env.REACT_APP_CURRENCY_SYMBOL}${transaction.totalAmount.toFixed(2)}`}</div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => onShow(transaction)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition duration-150"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {onDelete && (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
