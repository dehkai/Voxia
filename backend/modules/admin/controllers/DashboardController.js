const DashboardService = require('../services/DashboardService');

// Controller method to get the employee count
const getEmployeeCount = async (req, res) => {
  try {
    const employeeCount = await DashboardService.getEmployeeCount();
    return res.status(200).json({
      success: true,
      message: 'Employee count retrieved successfully',
      data: { employeeCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// Controller method to get the travel request count
const getTravelRequestCount = async (req, res) => {
  try {
    const travelRequestCount = await DashboardService.getTravelRequestCount();
    return res.status(200).json({
      success: true,
      message: 'Travel request count retrieved successfully',
      data: { travelRequestCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// Controller method to get the count of "pending" travel requests
const getPendingTravelRequestCount = async (req, res) => {
  try {
    const pendingRequestCount = await DashboardService.getPendingTravelRequestCount();
    return res.status(200).json({
      success: true,
      message: 'Pending travel request count retrieved successfully',
      data: { pendingRequestCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// Controller method to get all travel requests (not just the count)
const getAllTravelRequests = async (req, res) => {
  try {
    const travelRequests = await DashboardService.getAllTravelRequests();
    return res.status(200).json({
      success: true,
      message: 'Travel requests retrieved successfully',
      data: { travelRequests },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// New controller method to get all employees (users with role: 'employee')
const getAllEmployees = async (req, res) => {
  try {
    const employees = await DashboardService.getAllEmployees();
    return res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: { employees },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// Controller method to get accepted travel requests
const getAcceptedTravelRequests = async (req, res) => {
  try {
    const acceptedTravelRequests = await DashboardService.getAcceptedTravelRequests();
    return res.status(200).json({
      success: true,
      message: 'Accepted travel requests retrieved successfully',
      data: { acceptedTravelRequests },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

// Controller method to update the status of a travel request
const updateTravelRequestStatus = async (req, res) => {
  const { id } = req.params; // Get the travel request ID from the URL
  const { status } = req.body; // Get the new status from the request body

  try {
    const updatedTravelRequest = await DashboardService.updateTravelRequestStatus(id, status);
    return res.status(200).json({
      success: true,
      message: 'Travel request status updated successfully',
      data: { updatedTravelRequest },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

module.exports = {
  getEmployeeCount,
  getTravelRequestCount,
  getPendingTravelRequestCount,
  getAllTravelRequests,
  getAllEmployees,
  getAcceptedTravelRequests,
  updateTravelRequestStatus, // Export the new method
};
