// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { getProductsFromLocalStorage, saveProductsToLocalStorage } from '../utils/localStorage';

interface Product {
  id: number;
  name: string;
  price: number;
}

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const storedProducts = getProductsFromLocalStorage();
    setProducts(storedProducts);
  }, []);

  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      const updatedProducts = products.map((p) => (p.id === product.id ? product : p));
      setProducts(updatedProducts);
      saveProductsToLocalStorage(updatedProducts);
      setEditingProduct(null);
    } else {
      const newProducts = [...products, product];
      setProducts(newProducts);
      saveProductsToLocalStorage(newProducts);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (id: number) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    saveProductsToLocalStorage(updatedProducts);
  };

  return (
    <div className="min-h-screen max-h-screen bg-admin-page bg-cover bg-center flex items-center justify-center p-4 overflow-hidden">
      <div className="relative z-10 bg-white/90 border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-5xl h-[90vh] flex flex-col justify-between">
        {/* Reduced Header Font Size and Margin */}
        <h1 className="text-2xl font-semibold mb-4 text-center text-primary">Admin Dashboard</h1>

        {/* Product Form Section */}
        <div className="mb-4">
          <ProductForm onSave={handleAddProduct} editingProduct={editingProduct} />
        </div>

        {/* Product List Section with Scroll */}
        <div className="flex-grow overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-md p-4 h-[40vh]">
          <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
