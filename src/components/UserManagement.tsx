import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from './NavBar';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faKey, faTrash, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

type UserRole = 'admin' | 'user' | 'vieworders';

interface User {
    id: string;
    email: string;
    role: UserRole;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('user');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeConfirmPassword, setShowChangeConfirmPassword] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
            setUsers(response.data as User[]);
        } catch (error) {
            console.error('There was an error fetching the users!', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newUserEmail, password: newUserPassword, role: newUserRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to add user');
            }

            const newUser = await response.json();
            setUsers([...users, newUser]);
            await fetchUsers();
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add user:', error);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const updatedUser: Omit<User, 'id'> = { email: newUserEmail, role: newUserRole };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            setUsers(users.map((user) => (user.id === editingUser.id ? { id: editingUser.id, ...updatedUser } : user)));
            await fetchUsers();
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDeleteUser = async (id: string, email: string) => {
        const confirmed = window.confirm(`Do you really want to delete user: ${email} ?`);
        if (!confirmed) return;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUsers(users.filter((user) => user.id !== id));
            await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setNewUserEmail(user.email);
        setNewUserRole(user.role);
        setNewUserPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsModalOpen(true);
    };

    const handleOpenPasswordModal = (user: User) => {
        setSelectedUserForPassword(user);
        setNewUserPassword('');
        setConfirmPassword('');
        setShowChangePassword(false);
        setShowChangeConfirmPassword(false);
        setIsPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setShowChangePassword(false);
        setShowChangeConfirmPassword(false);
    };

    const handleChangePassword = async () => {
        if (!selectedUserForPassword || !newUserPassword || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newUserPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/users/${selectedUserForPassword.id}/password`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newPassword: newUserPassword }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update password');
            }

            await fetchUsers();
            setIsPasswordModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to update password:', error);
        }
    };

    const resetForm = () => {
        setNewUserEmail('');
        setNewUserPassword('');
        setConfirmPassword('');
        setNewUserRole('user');
        setEditingUser(null);
        setSelectedUserForPassword(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOpenModal = () => {
        resetForm();
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsModalOpen(true);
    };

    const handleHardReset = async () => {
        const confirmed = window.confirm('Are you sure you want to reset all transactions? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/hardReset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error('Failed to reset transactions');
            }

            await fetchUsers();
            alert('All transactions have been reset.');
        } catch (error) {
            console.error('Failed to reset transactions:', error);
        }
    };

    return (
        <>
            <NavBar />
            <div className="flex flex-col bg-white shadow-md p-4 border border-gray-300 rounded-lg w-full h-full">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="font-semibold text-primary text-lg">Users</h2>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleOpenModal}
                                className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md px-4 py-2 rounded-lg text-white transition"
                            >
                                Add User
                            </button>
                            <button
                                onClick={handleHardReset}
                                className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md px-4 py-2 rounded-lg text-white transition"
                            >
                                Hard Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="flex-grow overflow-y-auto">
                    <table className="bg-white rounded-lg w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white text-left">
                                <th className="px-4 py-2 border-b">ID</th>
                                <th className="px-4 py-2 border-b">Email</th>
                                <th className="px-4 py-2 border-b">Role</th>
                                <th className="px-4 py-2 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center">
                                        No users available.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-100 border-b">
                                        <td className="px-4 py-2">{user.id}</td>
                                        <td className="px-4 py-2">{user.email}</td>
                                        <td className="px-4 py-2">{user.role}</td>
                                        <td className="space-x-2 px-4 py-2 text-center">
                                            <button
                                                title="Edit User"
                                                onClick={() => handleEditUser(user)}
                                                className="hover:bg-indigo-700 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mx-1 px-2 py-1 rounded-md text-white transition"
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </button>
                                            <button
                                                title="Change Password"
                                                onClick={() => handleOpenPasswordModal(user)}
                                                className="hover:bg-yellow-600 bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md mx-1 px-2 py-1 rounded-md text-white transition"
                                            >
                                                <FontAwesomeIcon icon={faKey} />
                                            </button>
                                            <button
                                                title="Delete User"
                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                className="hover:bg-red-700 bg-gradient-to-br from-red-500 to-red-700 shadow-md mx-1 px-2 py-1 rounded-md text-white transition"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
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
                    <label className="block mb-2 font-medium text-sm">Email</label>
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="mb-4 p-2 border border-gray-300 rounded-md w-full"
                        disabled={!!editingUser}
                    />
                    <label className="block mb-2 font-medium text-sm">Role</label>
                    <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="mb-4 p-2 border border-gray-300 rounded-md w-full"
                    >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="vieworders">View Orders</option>
                    </select>
                    {/* Only show password fields when adding a user */}
                    {!editingUser && (
                        <>
                            <label className="block mb-2 font-medium text-sm">Password</label>
                            <div className="relative mb-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="p-2 pr-10 border border-gray-300 rounded-md w-full"
                                />
                                <span
                                    className="top-2 right-2 absolute text-gray-500 cursor-pointer"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <label className="block mb-2 font-medium text-sm">Confirm Password</label>
                            <div className="relative mb-4">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="p-2 pr-10 border border-gray-300 rounded-md w-full"
                                />
                                <span
                                    className="top-2 right-2 absolute text-gray-500 cursor-pointer"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                        </>
                    )}
                    <button
                        onClick={editingUser ? handleUpdateUser : handleAddUser}
                        className={`hover:bg-green-600 bg-gradient-to-br from-green-500 to-green-600 shadow-md py-2 rounded-md w-full text-white transition`}
                    >
                        {editingUser ? 'Update User' : 'Add User'}
                    </button>
                </div>
            </Modal>

            {/* Modal for Changing Password */}
            <Modal isOpen={isPasswordModalOpen} onClose={handleClosePasswordModal} title="Change Password">
                <div className="p-4">
                    <label className="block mb-2 font-medium text-sm">New Password</label>
                    <div className="relative mb-4">
                        <input
                            type={showChangePassword ? "text" : "password"}
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="p-2 pr-10 border border-gray-300 rounded-md w-full"
                        />
                        <span
                            className="top-2 right-2 absolute text-gray-500 cursor-pointer"
                            onClick={() => setShowChangePassword((prev) => !prev)}
                        >
                            <FontAwesomeIcon icon={showChangePassword ? faEyeSlash : faEye} />
                        </span>
                    </div>
                    <label className="block mb-2 font-medium text-sm">Confirm Password</label>
                    <div className="relative mb-4">
                        <input
                            type={showChangeConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="p-2 pr-10 border border-gray-300 rounded-md w-full"
                        />
                        <span
                            className="top-2 right-2 absolute text-gray-500 cursor-pointer"
                            onClick={() => setShowChangeConfirmPassword((prev) => !prev)}
                        >
                            <FontAwesomeIcon icon={showChangeConfirmPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>
                    <button
                        onClick={handleChangePassword}
                        className="hover:bg-yellow-600 bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md py-2 rounded-md w-full text-white transition"
                    >
                        Change Password
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default UserManagement;
