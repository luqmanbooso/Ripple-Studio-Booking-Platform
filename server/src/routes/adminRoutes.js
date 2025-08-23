const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(allowRoles('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/bookings', adminController.getBookings);
router.get('/reviews', adminController.getReviews);
router.patch('/reviews/:id/approve', adminController.approveReview);

module.exports = router;
