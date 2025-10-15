import React from 'react';
import { Transaction } from '../types';
import Modal from './Modal'; 

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  buttonClass?: string;
}

const buttonBase = "p-2 rounded-md transition cursor-pointer font-semibold text-white";
const buttonHover = "hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600";

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
  buttonClass = `${buttonBase} ${buttonHover}`,
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
      <Modal isOpen={isOpen} onClose={onClose} title={transaction?.orderId || 'Order Details'}>
        <div className="p-4 printable">
          {/* Transaction Items List */}
          <ul className="space-y-2 mt-10">
            {transaction.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center py-2 border-b border-dashed font-bold text-gray-800 text-lg">
                <span className="flex-1 text-left">{item.name}</span>
                <span className="flex-1 text-right">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className={buttonClass}
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </Modal>
    </>
  );
};

export default TransactionDetailsModal;
