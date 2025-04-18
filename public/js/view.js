// View page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the date input with today's date
    const dateInput = document.getElementById('date-input');
    dateInput.value = getCurrentDate();
    
    // Update the selected date display
    updateSelectedDateDisplay();
    
    // Add event listener for date change
    dateInput.addEventListener('change', function() {
      updateSelectedDateDisplay();
      loadRecordsForDate(dateInput.value);
    });
    
    // Load records for today
    loadRecordsForDate(getCurrentDate());
  });
  
  // Update the selected date display
  function updateSelectedDateDisplay() {
    const dateInput = document.getElementById('date-input');
    const selectedDate = document.getElementById('selected-date');
    
    selectedDate.textContent = formatReadableDate(dateInput.value);
  }
  
  // Load records for a specific date
  async function loadRecordsForDate(date) {
    try {
      const response = await fetchAPI(`/hours/${date}`);
      
      // Ensure records is an array
      const records = response.records || [];
      
      // Show the data container and hide the no-data message
      document.getElementById('data-container').style.display = 'block';
      document.getElementById('no-data-message').classList.add('hidden');
      
      // Update the table with the records
      updateRecordsTable(records);
      
      // Update the category list
      updateCategoryList(records);
    } catch (error) {
      if (error.message.includes('404')) {
        // No records for this date
        document.getElementById('data-container').style.display = 'none';
        document.getElementById('no-data-message').classList.remove('hidden');
      } else {
        showError('Failed to load records: ' + error.message);
      }
    }
  }
  
  // Update the records table
  function updateRecordsTable(records) {
    const tableBody = document.getElementById('view-table-body');
    tableBody.innerHTML = '';
    
    // Sort the records to put "Nothing" last
    const sortedRecords = [...records].sort((a, b) => {
      if (a.section === 'Nothing') return 1;
      if (b.section === 'Nothing') return -1;
      return a.section.localeCompare(b.section);
    });
    
    sortedRecords.forEach(record => {
      const row = document.createElement('tr');
      if (record.section === 'Nothing') {
        row.classList.add('nothing-section');
      }
      
      row.innerHTML = `
        <td>${record.section}</td>
        <td>${record.hours.toFixed(1)}</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // Update the category list
  function updateCategoryList(records) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    
    // Group records by category
    const categorySections = {};
    let totalHours = 0;
    
    records.forEach(record => {
      totalHours += record.hours;
      
      // Find which category this section belongs to
      for (const [category, sections] of Object.entries(SECTION_CATEGORIES)) {
        if (sections.includes(record.section)) {
          if (!categorySections[category]) {
            categorySections[category] = [];
          }
          categorySections[category].push(record);
          break;
        }
      }
    });
    
    // Create category items
    for (const [category, categoryRecords] of Object.entries(categorySections)) {
      const li = document.createElement('li');
      
      // Calculate total hours for this category
      const categoryHours = categoryRecords.reduce((sum, record) => sum + record.hours, 0);
      const percentage = ((categoryHours / totalHours) * 100).toFixed(1);
      
      // Create section names string
      const sectionNames = categoryRecords.map(record => 
        `${record.section} (${record.hours.toFixed(1)}h)`
      ).join(', ');
      
      li.innerHTML = `
        <span class="category-name">${category}: ${categoryHours.toFixed(1)}h (${percentage}%)</span>
        <span class="category-items">${sectionNames}</span>
      `;
      
      categoryList.appendChild(li);
    }
  }