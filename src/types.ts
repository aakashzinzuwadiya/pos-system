import { Timestamp } from "firebase/firestore";

export interface Product {
    id: string; // Use 'string' type for Firestore document IDs
    name: string;
    price: number;
}

export interface CartItem {
    id: string; // Ensure CartItem has an `id` of type `string`
    name: string;
    price: number;
    quantity: number;
}

export interface Transaction {
    id: string; // Unique ID for the transaction
    productName?: string; // The name of the product
    quantity?: number; // Quantity of the product in the transaction
    totalAmount: number; // Total amount of the transaction
    items: CartItem[]; // List of items in the transaction
    date: Timestamp; // Date of the transaction
    paymentMethod: string; // Add the paymentMethod property
    orderId?: number; // Add orderId field
    isDeleted?: boolean; // New field for soft delete
    change?: number; // Add the `change` property to the Transaction type
}
