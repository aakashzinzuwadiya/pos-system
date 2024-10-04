// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import TransactionList from '../components/TransactionList';
import TransactionDetailsModal from '../components/TransactionDetailsModal'; // Import the new component
import Modal from '../components/Modal';
import { getProducts, addProduct, updateProduct, deleteProduct, getTransactions } from '../firebaseService';
import { Product, Transaction } from '../types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // Selected transaction state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); // State for transaction modal

  useEffect(() => {
    const fetchProducts = async () => {
      const productsList = await getProducts();
      setProducts(productsList);
    };

    const fetchTransactions = async () => {
      const transactionsList = await getTransactions();
      setTransactions(transactionsList);
    };

    fetchProducts();
    fetchTransactions();
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
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete product.');
      console.error("Error deleting product:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    // Implement the function to delete a transaction from Firestore
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
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
    <div className="h-screen flex items-center justify-center bg-admin-page bg-cover bg-center overflow-hidden m-0 mb-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="relative z-10 bg-white/90 border border-gray-200 rounded-lg shadow-lg w-4/5 h-full p-4 pb-10 sm:pb-6 lg:pb-10 flex flex-col">
        <div className="flex flex-col lg:flex-row h-full space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="w-full lg:w-1/2 flex flex-col overflow-auto">
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAddProduct={handleOpenModal}
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col overflow-auto">
            <TransactionList
              transactions={transactions}
              onShow={handleShowTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
          <ProductForm onSave={handleAddProduct} editingProduct={editingProduct} />
        </Modal>

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AdminPage;
