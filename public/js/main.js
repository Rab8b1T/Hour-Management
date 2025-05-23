// Common functionality shared across all pages

// API base URL - dynamically determine based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : '/api';

// List of all available sections
const ALL_SECTIONS = [
  'Morning Run',
  'Exercise',
  'Cooking',
  'DSA',
  'Development',
  'Sketching',
  'Office',
  'BGMI',
  'COC',
  'Social Media',
  'Movies/Anime',
  'Sleep',
  'Competitive Programming',
  'Nothing'
];

// Section categories
const SECTION_CATEGORIES = {
  Health: ['Morning Run', 'Exercise', 'Cooking'],
  'Self Progress': ['DSA', 'Development', 'Competitive Programming'],
  Entertainment: ['BGMI', 'COC', 'Social Media', 'Movies/Anime'],
  Office: ['Office'],
  Sketching: ['Sketching'],
  Sleep: ['Sleep'],
  Nothing: ['Nothing']
};

// Format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
}

// Format date as a more readable string (e.g., April 13, 2025)
function formatReadableDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Get the current date in YYYY-MM-DD format
function getCurrentDate() {
  return formatDate(new Date());
}

// Get the start of the current week (Sunday)
function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = today.getDate() - day;
  return formatDate(new Date(today.setDate(diff)));
}

// Calculate the end date of a week given the start date
function getWeekEndDate(startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return formatDate(end);
}

// Format date range for display (e.g., "April 13 - April 19, 2025")
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { month: 'long', day: 'numeric' };
  const yearOptions = { year: 'numeric' };
  
  let startStr = start.toLocaleDateString(undefined, options);
  let endStr = end.toLocaleDateString(undefined, options) + ', ' + 
               end.toLocaleDateString(undefined, yearOptions).split(',')[1].trim();
  
  return `${startStr} - ${endStr}`;
}

// Display an error message
function showError(message) {
  alert('Error: ' + message);
  console.error(message);
}

// Update the today's date display on all pages
function updateDateDisplay() {
  const todayDateEl = document.getElementById('today-date');
  if (todayDateEl) {
    todayDateEl.textContent = formatReadableDate(new Date());
  }
}

// Make API call with error handling
async function fetchAPI(endpoint, method = 'GET', data = null) {
  try {
    // Prepare the request options
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body data for POST and PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    // Build the full URL
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Log request for debugging
    console.log(`Making ${method} request to: ${url}`);
    
    const response = await fetch(url, options);
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.msg || `API request failed with status ${response.status}`;
      } catch (e) {
        errorMessage = `API request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Parse and return the response
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  updateDateDisplay();
  
  // Log environment information for debugging
  console.log('Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');
  console.log('API Base URL:', API_BASE_URL);
});