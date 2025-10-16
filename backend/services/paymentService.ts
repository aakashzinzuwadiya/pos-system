import dbConnection from "../../config/databaseconnection";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  notifyKitchen: boolean;
}

interface PaymentDetails {
  paymentMethod: string;
  cart: CartItem[];
  email: string;
  cashReceived?: number;
}

export const savePayment = async (paymentDetails: PaymentDetails) => {
  const { paymentMethod, cart, email, cashReceived } = paymentDetails;
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const orderId = generateOrderId(); // Function to generate unique order ID
  const transactionDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const connection = await dbConnection.getConnection();
  await connection.beginTransaction();

  try {
    const [result]: any = await connection.query(
      `INSERT INTO transactions (email, is_deleted, order_id, payment_method, total_amount, transaction_date, change_amount)
       VALUES (?, FALSE, ?, ?, ?, ?, ?)`,
      [email, orderId, paymentMethod, totalAmount, transactionDate, cashReceived ? cashReceived - totalAmount : 0]
    );

    const [transactionIdResult]: any = await connection.query('SELECT LAST_INSERT_ID() as id');
    const transactionId = transactionIdResult[0].id;

    for (const item of cart) {
      await connection.query(
        `INSERT INTO transaction_items (transaction_id, category, item_id, name, price, quantity, notifyKitchen)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, item.category, item.id, item.name, item.price, item.quantity, item.notifyKitchen]
      );
    }

    await connection.commit();

    const transaction = {
      id: transactionId,
      items: cart,
      totalAmount,
      date: {
        seconds: Math.floor(new Date(transactionDate).getTime() / 1000),
        nanoseconds: new Date(transactionDate).getMilliseconds() * 1e6,
      },
      paymentMethod,
      isDeleted: false,
      change: cashReceived ? cashReceived - totalAmount : 0,
      orderId,
      email,
    };

    return transaction;
  } catch (error) {
    await connection.rollback();
    console.error('Error saving payment:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};