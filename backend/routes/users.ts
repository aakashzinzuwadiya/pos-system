import express from 'express';
import { login, register, updatePassword, deleteUser, getAllUsers, handleUpdateUser, hardResetTransactions } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.put('/:id', handleUpdateUser);
router.post('/login', login);
router.post('/register', register);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);
router.post('/hardReset', hardResetTransactions);

export default router;
