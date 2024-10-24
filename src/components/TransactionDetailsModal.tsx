// src/components/TransactionDetailsModal.tsx
import React from 'react';
import { Transaction } from '../types';
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
  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null; // If no transaction, don't render anything

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden; // Hide everything in the body by default when printing
            }
            .printable, .printable * {
              visibility: visible; // Only elements inside .printable are visible
            }
            .printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%; // Ensure it uses the full width available for a standard paper size
              margin: 0;
              padding: 20px; // Adjust padding to ensure content is not too cramped
              box-shadow: none; // Remove shadows or any other effects not needed in print
            }
          }
        `}
      </style>
      <Modal isOpen={isOpen} onClose={onClose} title={transaction?.orderId || 'Order Details'} handleButton={handlePrint} showButton={true}>
        <div className="printable p-4">
          {/* Transaction Items List */}
          <span className="mb-10 font-bold">{transaction?.orderId}</span>
          <ul className="space-y-2">
            {transaction.items.map((item) => (
              <li key={item.id} className="border-b border-dashed py-2 flex justify-between text-lg font-bold text-gray-800">
                <span>{item.name}</span>
                <span>{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default TransactionDetailsModal;
