function getSecurityId(customSymbol) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(scripSheet);
  
  // Get the range of headers
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Find the index of the "SEM_CUSTOM_SYMBOL" and "SEM_SMST_SECURITY_ID" headers
  var customSymbolIndex = headers.indexOf("SEM_CUSTOM_SYMBOL");
  var securityIdIndex = headers.indexOf("SEM_SMST_SECURITY_ID");
  
  if (customSymbolIndex === -1 || securityIdIndex === -1) {
    logMessage("SECURITY ID: One or both headers are missing.");
    sendEmail("SECURITY ID: One or both headers are missing.");
    return;
  }
  
  // Get all data rows
  var dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  var data = dataRange.getValues();
  
  // Find the row with the matching custom symbol
  for (var i = 0; i < data.length; i++) {
    if (data[i][customSymbolIndex] === customSymbol) {
      // Get the value in the "SEM_SMST_SECURITY_ID" column of the matching row
      var securityId = data[i][securityIdIndex];
      
      // Remove decimal points using toFixed(0) if the result is a number
      if (typeof securityId === 'number') {
        securityId = securityId.toFixed(0); // Convert number to string without decimal points
      }
      
      return securityId;
    }
  }
  
  // If custom symbol is not found, return a message
  logMessage("SECURITY ID: Custom symbol not found.");
  sendEmail("SECURITY ID: Custom symbol not found.");
  return;
}
