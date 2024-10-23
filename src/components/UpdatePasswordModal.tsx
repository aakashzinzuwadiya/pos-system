import React, { useState } from 'react';
import { updateUserPassword } from '../firebaseService'; // Import the Firebase service for updating passwords
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
      // Call the Firebase service to update the password
      await updateUserPassword(userId, newPassword);
      setSuccessMessage('Password updated successfully');
      setError('');
    } catch (err) {
      console.error('Failed to update password:', err);
      setError('Failed to update password');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Update Password`}> {/* Show user name in the title */}
      <div className="p-4">
        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        
        <label className="block text-md font-medium mb-4">{userName}</label>
        <label className="block text-sm font-medium mb-2">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />

        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />

        <button
          onClick={handlePasswordUpdate}
          className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600 transition"
        >
          Update Password
        </button>
      </div>
    </Modal>
  );
};

export default UpdatePasswordModal;
