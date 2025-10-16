import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NavBar from 'components/NavBar';

interface KitchenOrderItem {
  instanceReady: any;
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  instanceIndex?: number;
}

const POLL_INTERVAL = 5000; // 5 seconds
const ITEMS_PER_PAGE = 8;

const getHeightStyles = () => {
  const width = window.innerWidth;
  if (width < 1024 && width >= 640) {
    // Tablet portrait/landscape
    return 'h-[62vh] min-h-[62vh] max-h-[62vh]';
  }
  if (width >= 1024 && width < 1440) {
    // Laptop
    return 'h-[70vh] min-h-[70vh] max-h-[70vh]';
  }
  // Desktop large
  return 'h-[80vh] min-h-[80vh] max-h-[80vh]';
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<KitchenOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchKitchenOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders`);
      let data = response.data as KitchenOrderItem[];
      // Filter out instances that are already ready (instanceReady === true)
      const filtered = data.filter(item => !item.instanceReady);
      setOrders(filtered);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Remove flattening here, use orders directly
  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  // Maintain scroll position on refresh for tablet views
  useEffect(() => {
    let prevScroll = 0;
    if (tableContainerRef.current) {
      const containerHeight = tableContainerRef.current.offsetHeight;
      if (containerHeight > 0) {
        prevScroll = tableContainerRef.current.scrollTop;
      }
    }
    return () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.offsetHeight;
        if (containerHeight > 0) {
          tableContainerRef.current.scrollTop = prevScroll;
        }
      }
    };
  }, [orders, currentPage]);

  const handleReady = async (id: string, orderId: string, instanceIndex?: number) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders/order/ready`, { id, orderId, instanceIndex });
      if (response.data) {
        // Remove the item immediately from local state
        setOrders(prevOrders =>
          prevOrders.filter(
            item => !(item.id === id && item.orderId === orderId && item.instanceIndex === instanceIndex)
          )
        );
      }
    } catch (err) {
      // handle error
    }
  };

  return (
    <>
      <NavBar />
      <div className={`flex flex-col mt-4 bg-white shadow-md mx-auto p-6 border border-gray-300 rounded-lg max-w-2xl ${getHeightStyles()}`}>
        {loading && <div>Loading...</div>}
        <div
          ref={tableContainerRef}
          className="flex-grow mb-4 overflow-y-auto"
          style={
            window.innerWidth < 1024 && window.innerWidth >= 640
              ? { minHeight: '0', maxHeight: '100%', height: '100%' }
              : {}
          }
        >
          <table className="shadow border rounded w-full">
            <thead className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <tr>
                <th className="px-4 py-2 border-r">Order ID</th>
                <th className="px-4 py-2 border-r">Item Name</th>
                <th className="px-4 py-2 border-r">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center">No orders available.</td>
                </tr>
              ) : (
                currentOrders.map((item, idx) => (
                  <tr key={`${item.orderId}-${item.id}-${item.instanceIndex ?? idx}`}>
                    <td className="px-4 py-2 border-b">{item.orderId} - {Number(item?.instanceIndex) + 1}</td>
                    <td className="px-4 py-2 border-b">{item.name}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="hover:bg-green-700 bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 rounded font-semibold text-white"
                        onClick={() => handleReady(item.id, item.orderId, item.instanceIndex)}
                      >
                        Ready
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex sm:flex-row flex-col justify-between items-center gap-2 mt-4 w-full">
          <div className="w-full sm:w-auto text-gray-700 text-sm sm:text-left text-center">
            {`Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, orders.length)} of ${orders.length} orders`}
          </div>
          <div className="flex justify-center sm:justify-end space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="py-2 font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 disabled:opacity-50 shadow-md px-4 py-2 rounded-md text-white transition duration-150 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Orders;
