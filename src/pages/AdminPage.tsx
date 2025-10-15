// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import TransactionList from '../components/TransactionList';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import Modal from '../components/Modal';
import { getProducts, addProduct, updateProduct, deleteProduct, getTransactions, updateTransaction } from '../services/mysqlService'; // Update import to mysqlService
import { Product, Transaction } from '../types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../components/NavBar';
import Loading from 'components/Loading';
import UserManagement from '../components/UserManagement';

import './AdminPage.css';

const buttonBase = "p-2 rounded-md transition cursor-pointer font-semibold text-white";
const buttonHover = "hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600";

const AdminPage: React.FC = () => {

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // Selected transaction state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); // State for transaction modal
  const [loading, setLoading] = useState(false);

  // Fetch products from MySQL
  const fetchProducts = async () => {
    const productsList = await getProducts();
    setProducts(productsList || []);
  };

  // Fetch transactions from MySQL and sort by date (latest first)
  const fetchTransactions = async () => {
    const transactionsList = await getTransactions();
    // Filter out deleted transactions and sort by date in descending order
    const sortedTransactions = transactionsList
      .filter((t) => !t.is_deleted)
      .sort((a, b) => new Date(b.date.seconds * 1000).getTime() - new Date(a.date.seconds * 1000).getTime());
    setTransactions(sortedTransactions);
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts();
    fetchTransactions();
    setLoading(false);
  }, []);

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, product);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { id: editingProduct.id, ...product } : p))
        );
        setEditingProduct(null);
        toast.success('Product updated successfully!');
      } else {
        const newProductId = await addProduct(product);
        setProducts((prev) => [...prev, { id: newProductId, ...product }]);
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to add or update product.');
      console.error("Error handling product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id)); // Remove from state immediately
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete product.');
      console.error("Error deleting product:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const transaction = transactions.find((t) => t.id === id);
      if (transaction) {
        await updateTransaction(id, { is_deleted: true });
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        toast.success('Transaction deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete transaction.');
      console.error("Error deleting transaction:", error);
    }
  };

  const handleShowTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <NavBar />
      {/* Show Loading Indicator if loading is true */}
      {loading && <Loading />}
      <div className="flex justify-center items-center bg-admin-page bg-cover bg-center m-0 mb-5 p-4 h-screen overflow-hidden">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        <div className="z-10 relative flex flex-col bg-white/90 shadow-lg mb-10 p-4 sm:pb-6 lg:pb-10 border border-gray-200 rounded-lg h-full">
          <div
            className={`flex lg:flex-row flex-col lg:space-x-4 space-y-4 lg:space-y-0 h-full ${
              window.innerWidth < 1024 && window.innerWidth >= 640
                ? 'max-h-[calc(2*6rem+4rem)]'
                : ''
            }`}
            style={
              window.innerWidth < 1024 && window.innerWidth >= 640
                ? { height: 'calc(2 * 6rem + 4rem)', minHeight: '0', overflowY: 'auto' }
                : {}
            }
          >
            <div className="flex flex-col w-full lg:w-1/2 overflow-auto">
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAddProduct={handleOpenModal}
              />
            </div>

            <div className="flex flex-col w-full lg:w-1/2 overflow-auto">
              <TransactionList
                transactions={transactions}
                onShow={handleShowTransaction}
                onDelete={handleDeleteTransaction}
                showExport={true}
                buttonClass={`${buttonBase} ${buttonHover}`}
              />
            </div>
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
            <ProductForm onSave={handleAddProduct} editingProduct={editingProduct} />
          </Modal>

          <TransactionDetailsModal
            transaction={selectedTransaction}
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            buttonClass={`${buttonBase} ${buttonHover}`}
          />
        </div>
      </div>
    </>
  );
};

export default AdminPage;
