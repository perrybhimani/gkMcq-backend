import express from 'express';
import authRoutes from "./auth.route";
import adminRoutes from './admin.route'
import userRoutes from './user.route';
import { authorize } from "../beans/auth";

const router = express.Router();

/*list APIs */
router.use('/auth', authRoutes);

router.use(authorize)

/* authorized routes APIs */
router.use('/user', userRoutes);
router.use('/admin', adminRoutes)

module.exports = router;
