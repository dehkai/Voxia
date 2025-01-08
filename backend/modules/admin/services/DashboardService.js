const User = require('../../user/models/User');
const TravelRequest = require('../models/TravelRequest');

// Service method to get the employee count
const getEmployeeCount = async () => {
  try {
    const count = await User.countDocuments({ role: 'employee' });
    return count;
  } catch (error) {
    throw new Error('Error fetching employee count');
  }
};

// Service method to get the travel request count
const getTravelRequestCount = async () => {
  try {
    const count = await TravelRequest.countDocuments(); // Counts all travel requests
    return count;
  } catch (error) {
    throw new Error('Error fetching travel request count');
  }
};

// Service method to count "pending" travel requests
const getPendingTravelRequestCount = async () => {
  try {
    const count = await TravelRequest.countDocuments({ status: 'pending' }); // Counts "pending" status requests
    return count;
  } catch (error) {
    throw new Error('Error fetching pending travel request count');
  }
};

// Service method to get all travel requests
const getAllTravelRequests = async () => {
  try {
    const travelRequests = await TravelRequest.find({}); // Fetch all travel requests from the database
    return travelRequests;
  } catch (error) {
    throw new Error('Error fetching travel requests');
  }
};

// Service method to fetch all employees (new method)
const getAllEmployees = async () => {
  return await User.find({ role: 'employee' }); // Fetch all users with 'employee' role
};

// Service method to get accepted travel requests
const getAcceptedTravelRequests = async () => {
  return await TravelRequest.find({ status: 'accepted' }); // Query only accepted travel requests
};

// Service method to update the status of a travel request
const updateTravelRequestStatus = async (id, status) => {
  try {
    // Validate the status (Optional: You can set a list of valid statuses)
    const validStatuses = ['pending', 'approved', 'rejected', 'PENDING', 'APPROVED', 'REJECTED']; // Add any valid statuses as needed
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    // Find the travel request by ID and update the status
    const travelRequest = await TravelRequest.findById(id);

    if (!travelRequest) {
      throw new Error('Travel request not found');
    }

    // Update the status of the travel request
    travelRequest.status = status;
    await travelRequest.save(); // Save the updated travel request

    return travelRequest; // Return the updated travel request
  } catch (error) {
    throw new Error(`Error updating travel request status: ${error.message}`);
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
