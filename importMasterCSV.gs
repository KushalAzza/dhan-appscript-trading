function importMasterCSV() {

  var csvUrl = 'https://images.dhan.co/api-data/api-scrip-master.csv';
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(scripSheet);
  
  // Fetch the CSV file content from the URL
  var response = UrlFetchApp.fetch(csvUrl);
  var csvContent = response.getContentText();
  
  // Parse the CSV content
  var rows = Utilities.parseCsv(csvContent);
  
  // Assuming the first row contains headings
  if (rows.length < 1) return; // No data available
  
  var headers = rows[0];
  var dataRows = rows.slice(1);
  
  // Find the indices of the relevant columns
  var instrumentColumnIndex = headers.indexOf("SEM_INSTRUMENT_NAME");
  var expiryDateColumnIndex = headers.indexOf("SEM_EXPIRY_DATE");
  var symbolColumnIndex = headers.indexOf("SM_SYMBOL_NAME");
  
  // Check if the columns exist
  if (instrumentColumnIndex === -1 || expiryDateColumnIndex === -1 || symbolColumnIndex === -1) {
    logMessage("IMPORT CSV: Required columns are missing.");
    sendEmail("IMPORT CSV: Required columns are missing.");
    return;
  }
  
  // Get the current time
  var now = new Date();
  var threshold = new Date(now.getTime() + 18 * 60 * 60 * 1000); // in next 18 hours ago, temporary added 2 value.
  
  // Filter rows based on the conditions
  var filteredRows = dataRows.filter(function(row) {
    var instrumentValue = row[instrumentColumnIndex];
    var expiryDateValue = new Date(row[expiryDateColumnIndex]);
    var symbolValue = row[symbolColumnIndex];
    
    // Check if the row matches the instrument criteria and the expiry date is within the last 72 hours
    return instrumentValue === "OPTIDX" &&
           expiryDateValue <= threshold &&
           expiryDateValue >= now &&
           symbolValue !== "SX50OPT";
  });
  // Add the header back to the filtered rows
  filteredRows.unshift(headers);
  
  // Clear the existing content in the sheet
  sheet.clear();
  
  // Set the values in the sheet
  sheet.getRange(1, 1, filteredRows.length, filteredRows[0].length).setValues(filteredRows);

}
