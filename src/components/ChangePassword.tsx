// src/pages/ChangePassword.tsx
import React, { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { auth } from 'firebaseConfig';
import { toast } from 'react-toastify';

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
        toast.success('Password updated successfully!');
        setNewPassword('');
      } catch (error) {
        toast.error('Failed to update password!');
        console.error('Password change error:', error);
      }
    } else {
      toast.error('User is not logged in!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Change Password</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Enter new password"
          />
        </div>
        <button
          onClick={handleChangePassword}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
