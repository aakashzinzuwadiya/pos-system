import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal'; // Assuming you have a modal component

interface UpdatePasswordModalProps {
  userId: string;
  userName: string; // Add userName prop
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ userId, userName, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Call the backend API to update the password
      await axios.put(`/api/users/${userId}/password`, { newPassword });
      setSuccessMessage('Password updated successfully');
      setError('');
    } catch (err) {
      console.error('Failed to update password:', err);
      setError('Failed to update password');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Update Password for ${userName}`}> {/* Show user name in the title */}
      <div className="p-4">
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        
        <label className="block mb-4 font-medium text-md">{userName}</label>
        <label className="block mb-2 font-medium text-sm">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded-md w-full"
        />

        <label className="block mb-2 font-medium text-sm">Confirm New Password</label>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded-md w-full"
        />

        <button
          onClick={handlePasswordUpdate}
          className="bg-green-500 hover:bg-green-600 shadow-md py-2 rounded-md w-full text-white transition"
        >
          Update Password
        </button>
      </div>
    </Modal>
  );
};

export default UpdatePasswordModal;