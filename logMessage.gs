function logMessage(message) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(logSheet);
    var timestamp = new Date(); // Get the current date and time
    sheet.appendRow([timestamp, message]); // Append the timestamp and message
}

function sendEmail(body) {
  var recipient = "emailAddress";
  var subject = "Project Marginull: NOTIFICATION ALERT";
  MailApp.sendEmail(recipient, subject, body);
}

function clearSheet() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheet);
    sheet.getRange("B2").setValue('');
    sheet.getRange("C2").setValue(''); 
    sheet.getRange("D2").setValue(''); 
    sheet.getRange("B3").setValue(''); 
    sheet.getRange("C3").setValue(''); 
    sheet.getRange("D3").setValue(''); 

  logMessage("CLEAR SHEET: Clearing the stored data from dataSheet at 04:00 PM.");

}

function checkKeyExpiry() {
  // Open the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheet);
  
  // Get the expiry date from cell B7
  var expiryDate = sheet.getRange('B7').getValue();
  
  // Calculate the number of days between today and the expiry date
  var today = new Date();
  var expiry = new Date(expiryDate);
  var diffTime = expiry - today;
  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Check if the key is about to expire in 25 days or less
  if (diffDays <= 5 && diffDays >= 0) {
    // Call the sendEmail function (ensure this function is defined elsewhere in your script)
    logMessage('The access key is going to expire on ' + expiryDate + '. Please take necessary action within ' + diffDays + ' days');
    sendEmail('The access key is going to expire on ' + expiryDate + '. Please take necessary action within ' + diffDays + ' days');
  }
}
