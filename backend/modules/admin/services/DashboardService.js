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

// Service method to get the status of the latest travel request by user email (updated method)
const getLatestTravelRequestStatusByUserEmail = async (user_email) => {
  try {
    // Fetch the latest travel request by user email, sorted by creation date
    const latestTravelRequest = await TravelRequest.findOne({ user_email }).sort({ createdAt: -1 }); // Sorting by creation date in descending order

    if (!latestTravelRequest) {
      return null; // No travel request found for this user
    }

    return latestTravelRequest.status; // Return the status of the latest travel request
  } catch (error) {
    throw new Error('Error fetching latest travel request status');
  }
};

// Service method to get the travel request count by user email
const getTravelRequestCountByUser = async (userEmail) => {
  try {
    const count = await TravelRequest.countDocuments({ user_email: userEmail }); // Count travel requests for the user
    return count;
  } catch (error) {
    throw new Error('Error fetching travel request count for user');
  }
};

// Service method to get the count of accepted travel requests by user email
const getAcceptedTravelRequestCountByUser = async (userEmail) => {
  try {
    const count = await TravelRequest.countDocuments({ 
      user_email: userEmail, 
      status: { $in: ['approved', 'APPROVED'] } 
    });
        return count;
  } catch (error) {
    throw new Error('Error fetching accepted travel request count for user');
  }
};

// Service method to get all travel requests by user email
const getAllTravelRequestsByUserEmail = async (userEmail) => {
  try {
    const travelRequests = await TravelRequest.find({ user_email: userEmail }); // Query travel requests by user email
    return travelRequests;
  } catch (error) {
    throw new Error('Error fetching travel requests for the user');
  }
};

module.exports = {
  getEmployeeCount,
  getTravelRequestCount,
  getPendingTravelRequestCount,
  getAllTravelRequests,
  getAllEmployees,
  getAcceptedTravelRequests,
  updateTravelRequestStatus,
  getLatestTravelRequestStatusByUserEmail,
  getTravelRequestCountByUser,
  getAcceptedTravelRequestCountByUser,
  getAllTravelRequestsByUserEmail,
};
