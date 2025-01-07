const express = require('express');
const router = express.Router();
const DashboardController = require('../admin/controllers/DashboardController');

// Route to get employee count
router.get('/employee-count', DashboardController.getEmployeeCount);

// Route to get travel request count
router.get('/travel-request-count', DashboardController.getTravelRequestCount);

// New route to get the count of pending travel requests
router.get('/pending-travel-request-count', DashboardController.getPendingTravelRequestCount);

// Route for fetching all travel requests
router.get('/travel-requests', DashboardController.getAllTravelRequests);

// New route to get all employees (users with role: 'employee')
router.get('/employees', DashboardController.getAllEmployees);

// Route for fetching accepted travel requests
router.get('/accepted-travel-requests', DashboardController.getAcceptedTravelRequests);

module.exports = {
    dashboardRoutes: router
};
