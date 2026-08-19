// function sendMailNotifications(){
//   sendEmail("Check the Project API Logs, required columns are missing in CSV file.");
//   Logger.log("Send mail completed.");
// }

// // Simulated function to fetch real-time index price
// function fetchRealTimePrice(indexName) {
//   // // Replace with actual implementation to fetch real-time price
//   // // For example, using a URL Fetch service or API
//   // var simulatedPrices = {
//   //   "MIDCPNIFTY": 13185.49,
//   //   "FINNIFTY": 19506,
//   //   "BANKNIFTY": 42060,
//   //   "NIFTY": 25224.90,
//   //   "SENSEX": 59049
//   // };
//   // return simulatedPrices[indexName] || null;

// }

    // // Fetch real-time index price
    // var url = `${BASE_URL}/charts/intraday`;
    // var options = {
    //     method: 'post',
    //     headers: {
    //         'access-token': `${ACCESS_TOKEN}`,
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'
    //     },
    //     payload: JSON.stringify({
    //         securityId: secId,
    //         exchangeSegment: exSegment,
    //         instrument: instrt
    //     })
    // };
    
    // var response = UrlFetchApp.fetch(url, options);
    // var data = JSON.parse(response.getContentText());


// function fetchIntradayData(indexName) {
//   // var url = 'https://api.dhan.co/charts/intraday';
//   var url = 'https://api.dhan.co/charts/historical';
//   var options = {
//     method: 'post',
//     headers: {
//       'access-token': `${ACCESS_TOKEN}`, 
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     // payload: JSON.stringify({
//     //   securityId: secId,
//     //   exchangeSegment: exSegment,
//     //   instrument: instrt
//     // })
//     payload: JSON.stringify({
//       symbol: "NIFTY",
//       exchangeSegment: "IDX_I",
//       instrument: "INDEX",
//       expiryCode: 0,
//       fromDate: "2024-08-23",
//       toDate: "2024-08-24"
//     })
//   };
//     var response = UrlFetchApp.fetch(url, options);
//     var data = JSON.parse(response.getContentText());
//     Logger.log(data.close[0]); // Logs the response data in the Google Apps Script logs
// }

// function placeOrder() {
//   var url = `${BASE_URL}/orders`;
//   var options = {
//     method: 'post',
//     headers: {
//       'access-token': `${ACCESS_TOKEN}`,
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     payload: JSON.stringify({
//       dhanClientId: `${DHAN_CLIENT_ID}`,
//       transactionType: 'BUY',
//       exchangeSegment: 'NSE_FNO',
//       productType: 'MARGIN',
//       orderType: 'LIMIT',
//       validity: 'IOC',
//       securityId: '61135',
//       quantity: '50',
//       price: '0.10',
//       drvOptionType: 'PUT',
//       drvStrikePrice: ''
//     }),
//     muteHttpExceptions: true
//   };
//     var response = UrlFetchApp.fetch(url, options);
//     var data = JSON.parse(response.getContentText());
//     Logger.log(data);
// }


// testing script for security id
// function getSecurityId() {
//   var result = getSecurityId("BANKEX 02 SEP 55700 PUT");
//   Logger.log(result); // Check the logs to see the result
// }



//   function generateSymbol(){
//     // Get today's date
//     var today = new Date();
//     // Adjust the dayOfWeek while testing during weekends.
//     var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

//     // Determine the index name and strike price increment based on the day of the week
//     var indexName;
//     var strikePriceIncrement;
//     var secId;
//     var exSegment;
//     var instrt;
//   switch (dayOfWeek) {
//     case 1: // Monday
//       indexName = "MIDCPNIFTY";
//       strikePriceIncrement = 25;
//       secId = "442";
//       exSegment = "IDX_I";
//       instrt = "INDEX";
//       break;
//     case 2: // Tuesday
//       indexName = "FINNIFTY";
//       strikePriceIncrement = 50;
//       secId = "27";
//       exSegment = "IDX_I";
//       instrt = "INDEX";
//       break;
//     case 3: // Wednesday
//       indexName = "BANKNIFTY";
//       strikePriceIncrement = 100;
//       secId = "25";
//       exSegment = "IDX_I";
//       instrt = "INDEX";
//       break;
//     case 4: // Thursday
//       indexName = "NIFTY";
//       strikePriceIncrement = 50;
//       secId = "13";
//       exSegment = "IDX_I";
//       instrt = "INDEX";
//       break;
//     case 5: // Friday
//       indexName = "SENSEX";
//       strikePriceIncrement = 100;
//       secId = "51";
//       exSegment = "IDX_I";
//       instrt = "INDEX";
//       break;
//     default:
//       Logger.log("Today is not a trading day!");
//       return;
//   }
  
//   // Format the date for today
//   var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM');
  
//   // Simulate fetching real-time index price (replace this with actual data fetch)
//   // var realTimePrice = fetchRealTimePrice(indexName); // Assume this function gets the real-time price 
//   // remaining script is moved into Repo.gs

//   // var url = `${BASE_URL}/charts/intraday`; // Activate during trading days along with it's payload information
//   var url = `${BASE_URL}/charts/historical`; // Activate during weekends  along with it's payload information
//   var options = {
//     method: 'post',
//     headers: {
//       'access-token': `${ACCESS_TOKEN}`, 
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     // payload: JSON.stringify({
//     //   securityId: secId,
//     //   exchangeSegment: exSegment,
//     //   instrument: instrt
//     // })
//     payload: JSON.stringify({
//       symbol: indexName,
//       exchangeSegment: exSegment,
//       instrument: instrt,
//       expiryCode: 0,
//       fromDate: "2024-08-23",
//       toDate: "2024-08-24"
//     })
//   };
//     var response = UrlFetchApp.fetch(url, options);
//     var data = JSON.parse(response.getContentText());
//     var realTimePrice = data.close[0];
//     Logger.log( indexName + " real-time price is " + realTimePrice);
  
//   if (realTimePrice === null) {
//     Logger.log("Error fetching real-time price.");
//     return
//   }

  
//   // Round the real-time price to the nearest strike price increment
//   var roundedPrice = Math.round(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
  
//   // Generate symbols with the rounded price
//   var callValue = roundedPrice + (strikePriceIncrement * 2);
//   var putValue = roundedPrice - (strikePriceIncrement * 2);
  
//   // Format symbols in uppercase
//   var callSymbol = `${indexName} ${formattedDate} ${callValue} CALL`.toUpperCase();
//   var putSymbol = `${indexName} ${formattedDate} ${putValue} PUT`.toUpperCase();

//   var callSecId = getSecurityId(callSymbol);
//   var putSecId = getSecurityId(putSymbol);

//   Logger.log("Adjusted CALL option per current price: " + callSymbol + " and corresponding security ID: " + callSecId);
//   Logger.log("Adjusted PUT option per current price: " + putSymbol + " and corresponding security ID: " + putSecId);

// }

// // Logger.log ("Erasing the value after squaring-off CALL option in B2 & C2")
    // // sheet.getRange("B2").setValue('');
    // // sheet.getRange("C2").setValue(''); 

    // // Logger.log ("Erasing the value after squaring-off PUT option in B3 & C3")
    // // sheet.getRange("B3").setValue(''); 
    // // sheet.getRange("C3").setValue(''); 

    // Logger.log ("Last square off orders are now completed. Bye! Bye!")

// // comparing if the strike value saved in spreadsheet and current strike is same.
// if (callValueStored > realTimePrice && realTimePrice > putValueStored) {
//   Logger.log ("Last short-sold CALL & PUT are OTM, exiting...")
//   return; 
// }
