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
    const travelRequestCount = await DashboardService.getTravelRequestCount(); // Call the service method
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
    const pendingRequestCount = await DashboardService.getPendingTravelRequestCount(); // Call the new service method
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
    const travelRequests = await DashboardService.getAllTravelRequests(); // Call the service method to fetch all travel requests
    return res.status(200).json({
      success: true,
      message: 'Travel requests retrieved successfully',
      data: { travelRequests }, // Return the travel request data
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
    const employees = await DashboardService.getAllEmployees(); // Call the service method to fetch all employees
    return res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: { employees }, // Return the employee data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

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

module.exports = {
  getEmployeeCount,
  getTravelRequestCount,
  getPendingTravelRequestCount,
  getAllTravelRequests,
  getAllEmployees,
  getAcceptedTravelRequests,
};
