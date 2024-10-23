// src/pages/TransactionPage.tsx
import React, { useEffect, useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import { usePos } from '../context/PosContext';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import { Transaction } from '../types';

const TransactionPage: React.FC = () => {
  const { transactions, fetchTransactions, handleDeleteTransaction } = usePos();
  const { isAdmin } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // State to store selected transaction for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Function to handle showing transaction details in the modal
  const handleShowTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <NavBar />
      {/* Outer Container */}
      <div className="h-screen w-screen pt-[1%] pb-[5%]">
        {/* Flex container for layout control */}
        <div className="h-full w-full flex flex-col items-center justify-center overflow-hidden">
          {/* Transaction List Container with scroll */}
          <div className="w-full max-w-screen-lg h-full flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4">
              <TransactionList
                transactions={transactions}
                onShow={handleShowTransaction} // Pass the show function to the TransactionList
                onDelete={isAdmin ? handleDeleteTransaction : undefined} // Only show delete for admin
                showExport={isAdmin} // Show export button only for admin users
              />
            </div>
          </div>
        </div>

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transaction={selectedTransaction} // Pass the selected transaction to the modal
        />
      </div>
    </>
  );
};

export default TransactionPage;
