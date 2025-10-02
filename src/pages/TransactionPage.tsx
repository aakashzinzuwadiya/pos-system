import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TransactionList from '../components/TransactionList';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import NavBar from '../components/NavBar';
import { Transaction } from '../types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Assuming you have a way to determine if the user is an admin

  const fetchTransactions = async () => {
    try {
      const response = await axios.get<Transaction[]>('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions.');
    }
  };

  const handleDeleteTransaction = async (transactionId: any) => {
    try {
      await axios.delete(`/api/transactions/${transactionId}`);
      setTransactions((prevTransactions) => prevTransactions.filter((transaction) => transaction.id !== transactionId));
      toast.success('Transaction deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete transaction.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleShowTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <>
      <ToastContainer />
      <NavBar />
      <div className="pt-[1%] pb-[5%] w-screen h-screen">
        <div className="flex flex-col justify-center items-center w-full h-full overflow-hidden">
          <div className="flex flex-col w-full max-w-screen-lg h-full overflow-hidden">
            <div className="flex-grow p-4 overflow-y-auto">
              <TransactionList
                transactions={transactions}
                onShow={handleShowTransaction}
                onDelete={isAdmin ? handleDeleteTransaction : undefined}
                showExport={isAdmin}
              />
            </div>
          </div>
        </div>
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      </div>
    </>
  );
};

export default TransactionPage;