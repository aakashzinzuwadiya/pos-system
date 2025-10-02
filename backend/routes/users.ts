import express from 'express';
import { login, register, updatePassword, deleteUser, getAllUsers, handleUpdateUser } from '../controllers/userController';

const router = express.Router();

router.get('/', getAllUsers);
router.put('/:id', handleUpdateUser);
router.post('/login', login);
router.post('/register', register);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);

export default router;
