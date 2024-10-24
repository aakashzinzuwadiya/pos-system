import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, deleteUser, updateUserPassword } from '../firebaseService'; // Ensure updateUserPassword is implemented in firebaseService
import { User } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faKey } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import NavBar from './NavBar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from 'firebaseConfig';

type UserRole = 'admin' | 'user';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null); // Track selected user for password update
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Track password modal visibility
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('user');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const usersList = await getUsers();
            setUsers(usersList);
        };
        fetchUsers();
    }, []);

    // Function to open password update modal
    const handleOpenPasswordModal = (user: User) => {
        setSelectedUserForPassword(user); // Set the user whose password is being updated
        setIsPasswordModalOpen(true); // Open the modal
    };

    const handleClosePasswordModal = () => {
        setSelectedUserForPassword(null); // Reset selected user
        setIsPasswordModalOpen(false); // Close the modal
    };

    const handleAddUser = async () => {
        if (!newUserEmail || !newUserPassword || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newUserPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            // Create the new user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
            const firebaseUser = userCredential.user;

            // Add the new user to Firestore (or wherever you store your user details)
            const newUser: Omit<User, 'id'> = {
                email: newUserEmail,
                role: newUserRole,
            };

            await addUser({ id: firebaseUser.uid, ...newUser });

            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add user:', error);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setNewUserEmail(user.email);
        setNewUserRole(user.role);
        setIsModalOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const updatedUser: Omit<User, 'id'> = { email: newUserEmail, role: newUserRole };
            await updateUser(editingUser.id, updatedUser);
            setUsers(users.map((user) => (user.id === editingUser.id ? { id: editingUser.id, ...updatedUser } : user)));
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUser(id);
            setUsers(users.filter((user) => user.id !== id));
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleChangePassword = async () => {
        if (!selectedUserForPassword || !newPassword || !confirmNewPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            await updateUserPassword(selectedUserForPassword.id, newPassword);
            alert('Password updated successfully!');
            handleClosePasswordModal();
        } catch (error) {
            console.error('Failed to update password:', error);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setNewUserEmail('');
        setNewUserRole('user');
        setNewUserPassword('');
        setConfirmPassword('');
    };

    const handleOpenModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    return (
        <>
            <NavBar />
            <div className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-primary">Users</h2>
                    <button
                        onClick={handleOpenModal}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600"
                    >
                        Add User
                    </button>
                </div>

                {/* User Table */}
                <div className="flex-grow overflow-y-auto">
                    <table className="w-full bg-white rounded-lg border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-left font-semibold">
                                <th className="px-4 py-2 border-b">Email</th>
                                <th className="px-4 py-2 border-b">Role</th>
                                {/* <th className="px-4 py-2 border-b text-center">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-4">
                                        No users available.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-100">
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{user.role}</td>
                                        {/* <td className="px-4 py-2 text-center space-x-2">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="px-2 py-1 bg-blue-500 text-white rounded-md shadow-md mx-1 hover:bg-blue-600"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenPasswordModal(user)}
                                                className="px-2 py-1 bg-yellow-500 text-white rounded-md shadow-md mx-1 hover:bg-yellow-600"
                                            >
                                                <FontAwesomeIcon icon={faKey} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="px-2 py-1 bg-red-500 text-white rounded-md shadow-md mx-1 hover:bg-red-600"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Adding/Editing User */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add User'}>
                <div className="p-4">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    />
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    {!editingUser && (
                        <>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                            />
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-4"
                            />
                        </>
                    )}
                    <button
                        onClick={editingUser ? handleUpdateUser : handleAddUser}
                        className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600 transition"
                    >
                        {editingUser ? 'Update User' : 'Add User'}
                    </button>
                </div>
            </Modal>

            {/* Modal for Changing Password */}
            <Modal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} title="Change Password">
                <div className="p-4">
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
                        onClick={handleChangePassword}
                        className="w-full bg-green-500 text-white py-2 rounded-md shadow-md hover:bg-green-600 transition"
                    >
                        Change Password
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default UserManagement;
