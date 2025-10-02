import { Product, Transaction } from '../types';
import axios from 'axios';

export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
  return response.data as Product[];
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const response = await axios.post<{ id: string }>(`${process.env.REACT_APP_API_URL}/products`, product);
  return response.data.id;
};

export const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<void> => {
  await axios.put(`${process.env.REACT_APP_API_URL}/products/${id}`, product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL}/transactions`);
  return response.data as Transaction[];
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  await axios.put(`${process.env.REACT_APP_API_URL}/transactions/${id}`, updates);
};
