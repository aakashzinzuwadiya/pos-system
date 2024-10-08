// src/components/TransactionDetailsModal.tsx
import React from 'react';
import { Transaction } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal'; // Assuming you have a Modal component

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null; // If no transaction, don't render anything

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction?.orderId || 'Order Details'}>
      <div className="p-4">
            {/* Date and Time on Top Right */}
            <div className="text-sm font-semibold mb-2 flex justify-end w-full">
              {/* Date aligned to the right */}
              <span className="text-right">
                {transaction && new Date(transaction.date.toMillis()).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' })}
              </span>
            </div>

            {/* Transaction Items List */}
            <ul className="space-y-2">
              {transaction.items.map((item) => (
                <li key={item.id} className="border-b border-dashed py-2 flex justify-between text-lg font-bold text-gray-800">
                  <span>{item.name}</span>
                  <span>{item.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Print Button */}
            <div className="mt-4 flex justify-center">
              <button onClick={handlePrint} className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition">
                Print
              </button>
            </div>
          </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
