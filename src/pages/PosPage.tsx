// src/pages/PosPage.tsx
import React, { useState, useEffect } from 'react';
import Cart from '../components/Cart';
import { getProductsFromLocalStorage } from '../utils/localStorage';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

const PosPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const currencySymbol = process.env.REACT_APP_CURRENCY_SYMBOL || '$';

  useEffect(() => {
    const storedProducts = getProductsFromLocalStorage();
    setProducts(storedProducts);
  }, []);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      const newItem = { ...product, quantity: 1 };
      setCart([...cart, newItem]);
    }
  };

  const handleIncreaseQuantity = (id: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (id: number) => {
    const updatedCart = cart
      .map((item) => (item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);
    setCart(updatedCart);
  };

  return (
    <div className="min-h-screen max-h-screen bg-pos-page bg-cover bg-center flex items-center justify-center p-4 overflow-hidden">
      <div className="relative z-10 bg-white/90 border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-7xl h-[90vh] flex">

        {/* Product List Section: 20% width */}
        <div className="w-1/5 p-4 h-full overflow-y-auto">
          <h1 className="text-lg font-semibold mb-4 text-center text-primary">Product List</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddToCart(product)}
                className="bg-secondary text-white p-4 rounded-md shadow-md hover:bg-green-600"
              >
                {product.name} - {currencySymbol}{product.price}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Section: 80% width */}
        <div className="w-4/5 p-4 h-full border-l border-gray-300 overflow-y-auto">
          <Cart cartItems={cart} onIncrease={handleIncreaseQuantity} onDecrease={handleDecreaseQuantity} />
        </div>
      </div>
    </div>
  );
};

export default PosPage;
