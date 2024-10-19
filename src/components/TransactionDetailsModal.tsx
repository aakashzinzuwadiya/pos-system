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
    <Modal isOpen={isOpen} onClose={onClose} title={transaction?.orderId || 'Order Details'} handleButton={handlePrint}>
      <div className="p-4">
        {/* Transaction Items List */}
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
  );
};

export default TransactionDetailsModal;
