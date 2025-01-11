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

// New route for updating travel request status (PUT method)
router.put('/travel-requests/:id/status', DashboardController.updateTravelRequestStatus);

// Route to get the status of the latest travel request by user email
router.get('/travel-requests/:user_email/latest-status', DashboardController.getLatestTravelRequestStatusByUserEmail);

// Route to get the travel request count for the current user
router.get('/travel-request-count/:userEmail', DashboardController.getTravelRequestCountByUser);

// Route to get the accepted travel request count for the current user
router.get('/accepted-travel-request-count/:userEmail', DashboardController.getAcceptedTravelRequestCountByUser);

// Route to get travel requests for the current user
router.get('/travel-requests/:userEmail', DashboardController.getAllTravelRequestsByCurrentUser);


module.exports = {
    dashboardRoutes: router
};
