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
    onClose();
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
            .printable ul {
              width: 100%;
            }
            .printable li {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dashed #ccc;
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .printable li span:first-child {
              text-align: left;
              flex: 1;
            }
            .printable li span:last-child {
              text-align: right;
              flex: 1;
            }
          }
        `}
      </style>
      <Modal className="printable" isOpen={isOpen} onClose={onClose} title={transaction?.orderId || 'Order Details'} handleButton={handlePrint} showButton={true}>
        <div className="printable p-4">
          {/* Transaction Items List */}
          <ul className="space-y-2 mt-10">
            {transaction.items.map((item) => (
              <li key={item.id} className="border-b border-dashed py-2 flex justify-between items-center text-lg font-bold text-gray-800">
                <span className="flex-1 text-left">{item.name}</span> {/* Name left-aligned */}
                <span className="flex-1 text-right">{item.quantity}</span> {/* Quantity right-aligned */}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default TransactionDetailsModal;
