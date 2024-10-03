// src/utils/localStorage.ts

const STORAGE_KEY = 'pos-products';

export const getProductsFromLocalStorage = () => {
  const products = localStorage.getItem(STORAGE_KEY);
  return products ? JSON.parse(products) : [];
};

export const saveProductsToLocalStorage = (products: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};
