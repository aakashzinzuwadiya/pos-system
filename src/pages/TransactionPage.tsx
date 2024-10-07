// src/pages/TransactionPage.tsx
import React, { useEffect, useState } from 'react';
import TransactionList from '../components/TransactionList';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
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
      <div className="h-screen w-screen p-4 bg-gray-100 overflow-hidden">
        <div className="h-screen flex flex-col overflow-auto pb-5">
          <TransactionList
            transactions={transactions}
            onShow={handleShowTransaction} // Pass the show function to the TransactionList
            onDelete={isAdmin ? handleDeleteTransaction : undefined} // Only show delete for admin
          />
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
