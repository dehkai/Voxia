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

// New service method to count "pending" travel requests
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

// New service method to get accepted travel requests
const getAcceptedTravelRequests = async () => {
    return await TravelRequest.find({ status: 'accepted' });  // Query only accepted travel requests
  };
  

module.exports = {
  getEmployeeCount,
  getTravelRequestCount,
  getPendingTravelRequestCount,
  getAllTravelRequests,
  getAllEmployees,
  getAcceptedTravelRequests,
};
