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
    <Modal isOpen={isOpen} onClose={onClose} title={`Transaction ID: ${transaction.id}`}>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Order ID: {transaction.orderId}</h2>
        <ul className="space-y-2">
          {transaction.items.map((item) => (
            <li key={item.id} className="flex justify-between items-center border-b border-dashed py-2">
              <div className="flex-1">
                <span className="font-medium">{item.name}</span> <span className="text-sm text-gray-600">x{item.quantity}</span>
              </div>
              <div className="text-right">
                {currencySymbol}{item.price.toFixed(2)} x {item.quantity} = {currencySymbol}{(item.price * item.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-semibold text-lg">
          <span>Total Amount:</span>
          <span className="text-green-600">
            {currencySymbol}{transaction.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition flex items-center"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-2" />
            Print
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
