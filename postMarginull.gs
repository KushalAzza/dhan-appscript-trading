function postMarginull() {
  // Fetch and store positions from Dhan API
  fetchAndStorePositionsInSheet();

  // Fetch and store orders from Dhan API
  fetchAndStoreOrdersInSheet();

  // Get the content with positions from the sheet
  var content = generatePositionContentFromSheet();

  // Generate the dynamic title
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheet);
  var dayCounter = 'B8';
  var currentDay = sheet.getRange(dayCounter).getValue();
  var newDay = currentDay + 1;
  sheet.getRange(dayCounter).setValue(newDay);

  var title = "Day " + newDay + ": P&L and Trade Analysis Report for Moneyness Ninja Strategy";

  logMessage("MARGINULL POST: " + title + " is created.");

  // Define the Flarum API endpoint and token
  var apiToken = `${FLARUM_ACCESS_KEY}`;
  var url = `${FLARUM_URL}/api/discussions`;

  // Define the payload for the new discussion
  var payload = {
    "data": {
      "type": "discussions",
      "attributes": {
        "title": title,
        "content": content
      },
      "relationships": {
        "tags": {
          "data": [
            {
              "type": "tags",
              "id": "8" // Adjust this ID as needed to match an existing tag ID
            }
          ]
        }
      }
    }
  };

  // Set up the options for the HTTP request
  var options = {
    'method': 'POST',
    'headers': {
      'Authorization': 'Token ' + apiToken + '; userId=1',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  // Make the HTTP POST request
  var response = UrlFetchApp.fetch(url, options);
  var statusCode = response.getResponseCode();
  var responseContent = response.getContentText();

  // Check the response status code and log the result
  if (statusCode == 201 || statusCode == 200) {
    logMessage("MARGINULL POST: Discussion created successfully.");
  } else {
    logMessage("MARGINULL POST: Error creating discussion thread. Examine the error logs: " + responseContent);
  }
}

////// supporting functions below /////


function fetchAndStorePositionsInSheet() {
  var url = `${BASE_URL}/positions`;
  var options = {
    'method': 'GET',
    'headers': {
      'access-token': `${ACCESS_TOKEN}`,
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200 && data.length > 0) {
      
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(positionsSheet);
      var header = ["Trading Symbol", "Position Type", "Buy Average", "Sell Average", "Net Quantity", "Realized Profit", "Unrealized Profit"];

      // Clear the existing data in the sheet
      sheet.clear();

      // Add headers to the sheet
      sheet.appendRow(header);

      // Iterate over positions and store them in the sheet without formatting or logic
      data.forEach(function(position) {
        var row = [
          position.tradingSymbol,
          position.positionType,
          position.buyAvg,             
          position.sellAvg,            
          position.netQty,
          position.realizedProfit,     
          position.unrealizedProfit
        ];
        sheet.appendRow(row);
      });

      logMessage("MARGINULL POST: Positions successfully stored in the sheet.");
    } else {
      logMessage("MARGINULL POST: Error fetching positions or no positions found");
    }
  } catch (error) {
    logMessage("MARGINULL POST: Error fetching fetching positions. Examine the error logs: " + error);
  }
}

function fetchAndStoreOrdersInSheet() {
  var url = `${BASE_URL}/orders`;
  var options = {
    'method': 'GET',
    'headers': {
      'access-token': `${ACCESS_TOKEN}`,
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200 && data.length > 0) {

      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ordersSheet);
      var header = ["Trading Symbol", "Transaction Type" ,"Quantity", "Price"];

      // Clear the existing data in the sheet
      sheet.clear();

      // Add headers to the sheet
      sheet.appendRow(header);

      // Store orders in the sheet
      data.forEach(function(order) {
        var row = [
          order.tradingSymbol,
          order.transactionType,
          order.quantity,
          order.price
        ];
        sheet.appendRow(row);
      });

      logMessage("MARGINULL POST: Orders successfully stored in the sheet.");
    } else {
      logMessage("MARGINULL POST: Error fetching orders or no orders found.");
    }
  } catch (error) {
    logMessage("MARGINULL POST: Error fetching orders. Examine the error logs: " + error);
  }
}


function generatePositionContentFromSheet() {

  var today = new Date();
  var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "d MMM yyyy");
  var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
  var indexName;
  switch (dayOfWeek) {
      case 1: // Monday
        indexName = "MIDCPNIFTY";
        break;
      case 2: // Tuesday
        indexName = "FINNIFTY";
        break;
      case 3: // Wednesday
        indexName = "BANKNIFTY";
        break;
      case 4: // Thursday
        indexName = "NIFTY";
        break;
      case 5: // Friday
        indexName = "SENSEX";
        break;
      default:
          
          logMessage("MARGINULL POST: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }


  // Initialize a string to build the markdown table content
  var content = "Hey there! ✋ welcome to my another trading report on 🗓️ " + formattedDate + ". Today was " + indexName + " Index weekly expiry hence I traded in it's Option Chain. \n"; 
  content += "### 💰 Profit & Loss Summary 🧾 \n\n";
  content += "Here is my P&L summary table: \n\n";
  content += "| Trading Symbol | Position Type | Buy Average | Sell Average | Net Quantity | Realized Profit | Unrealized Profit |\n";
  content += "|----------------|---------------|-------------|--------------|--------------|-----------------|-------------------|\n";

// Initialize variables to track total realized and unrealized profits
  var totalRealizedProfit = 0;
  var totalUnrealizedProfit = 0;
  var orderCount = 0;

  // Iterate over the rows, starting from the second row to skip the headers
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(positionsSheet);
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var tradingSymbol = data[i][0];
    var positionType = data[i][1];
    var buyAvg = parseFloat(data[i][2]);
    var sellAvg = parseFloat(data[i][3]);
    var netQty = data[i][4];
    var realizedProfit = parseFloat(data[i][5]);
    var unrealizedProfit = parseFloat(data[i][6]);

    // Apply logic for SHORT positions
    if (positionType === "SHORT") {
        unrealizedProfit = (unrealizedProfit * -1);
    }
    if (positionType === "CLOSED") {
        unrealizedProfit = 0;
    }

    // Add to total realized and unrealized profit
    totalRealizedProfit += realizedProfit;
    totalUnrealizedProfit += unrealizedProfit;

    // Apply toFixed(2) to the numeric values
    buyAvg = buyAvg.toFixed(2);
    sellAvg = sellAvg.toFixed(2);
    realizedProfit = realizedProfit.toFixed(2);
    unrealizedProfit = unrealizedProfit.toFixed(2);

    // Append the processed row to the content in markdown format
    content += `| ${tradingSymbol} | ${positionType} | ${buyAvg} | ${sellAvg} | ${netQty} | ${realizedProfit} | ${unrealizedProfit} |\n`;
  }

  // Calculate total P&L (Realized + Unrealized)
  var totalProfitLoss = totalRealizedProfit + totalUnrealizedProfit;

  // Add total P&L to the content
  content += "\n";
  content += `- **Total Realized Profit:** ${totalRealizedProfit.toFixed(2)}\n`;
  content += `- **Total Unrealized Profit:** ${totalUnrealizedProfit.toFixed(2)}\n`;
  content += `- **Total Profit/Loss for the Day:** ${totalProfitLoss.toFixed(2)}\n`;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheet);
  var verifiedLink = sheet.getRange("B9").getValues();
  content += `- ✅ **Verify my P&L:** [View on Dhan](${verifiedLink}) \n\n`;
  content += "> ℹ️ Note: There might be slight discrepancy in calculated profits per table, and one that is appearing in the verified link. Brokerage, GST, STT and all other trading charges are not considered.\n\n";
  content += "**Realized Profit** is calculated based on the closed/squared-off positions, whereas **Unrealized Profit** is calculated based on the open positions. \n\n Per [my strategy](https://marginull.com/d/109-moneyness-ninja-strategy-for-options-trading-by-marginull), I generally leave the open positions to expire if they are out of the money (OTM) to pocket it's moneyness.\n\n";

  content += "\n > 💁🏻‍♂️ I share these trades and P&L reports on every trading day. You can check out my previous reports under [P&L Reports 📔](https://marginull.com/t/pnl) tag.\n\n";
  content += "### Trade Analysis 🕵🏻‍♂️ \n\n";

    // Fetch and append the orders to the content
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ordersSheet);
  var data = sheet.getDataRange().getValues();
  
  var expiryDayMonth = Utilities.formatDate(today, Session.getScriptTimeZone(), "d MMM");
  content += "Here are the trades executed for " + expiryDayMonth + " " + indexName + " expiry for different strike prices: \n\n";
  // orderData logic
  content += "| Trading Symbol | Transaction Type | Quantity | Average Price |\n";
  content += "|----------------|------------------|----------|---------------|\n";

  for (var i = 1; i < data.length; i++) {
    var tradingSymbol = data[i][0];
    var transactionType = data[i][1];
    var quantity = data[i][2];
    var price = data[i][3];

    price = price.toFixed(2);
    orderCount++;

    // Append to content
    content += `| ${tradingSymbol} | ${transactionType} | ${quantity} | ${price} |\n`;
  }
    content += "- **Total Executed Orders**: " + orderCount + ".\n\n";
    if (orderCount < 9) {
    content += "\n\n The " + indexName + " index was relatively flat for the day, with fewer trades executed. \n\n This stable condition is highly favorable for my [Moneyness Ninja 🥷🏻](https://marginull.com/d/109-moneyness-ninja-strategy-for-options-trading-by-marginull) strategy, as it allows for more controlled risk management and receive entire moneyness post time decay. \n \n If the market is sideways be 'Out of the Money' (OTM) till the end, which is key to this strategy's success.\n";
  } else if (orderCount >= 9 && orderCount <= 20) {
    content += "\n\n Today's market exhibited slight volatility 'At the Money' (ATM), resulting in total " + orderCount + " trades. \n\n While the movement in " + indexName + " wasn't extreme, I had to be very cautious, especially when adjusting positions within the Option Chain for choosing correct strike price to stay 'Out of the Money' (OTM). \n \n The [Moneyness Ninja 🥷🏻](https://marginull.com/d/109-moneyness-ninja-strategy-for-options-trading-by-marginull) strategy is all about adapting to these fluctuations, and careful monitoring in such volatility.\n";
  } else if (orderCount > 20) {
    content += "\n\n With over " + orderCount + " trades today, the market displayed heightened volatility. Such conditions pose risks for the [Moneyness Ninja 🥷🏻](https://marginull.com/d/109-moneyness-ninja-strategy-for-options-trading-by-marginull) or any Options Selling strategy for that matter. \n\n It's important to remain highly cautious and consider squaring-off positions to minimize potential losses. \n \n Today's rapid fluctuations don't align with the my strategy's long-term goals. If the volatility persist tommorrow, then I might stay away from the market untill cool-down. It's suggested for new traders as well.\n";
  }
  content += "### Planned Adjustments 📝 \n\n";
  content += "There are no immediate adjustment required to the Marginull strategy. However, these are some of the items I need to work on: \n";
  content += "- Reduce the loss on LONG positions without compromising the hedge margin. \n";
  content += "- When to exit/square-off the trades under high market volatility condition. \n\n";
  content += "### Signing Off ✍🏻 \n\n";
  content += "Thank you 🙏 for taking time to read this report. You can find my previous 📔 [P&L reports here](https://marginull.com/t/pnl). \n\n";
  content += "If you got questions or suggestion to improve this report then drop in below. Follow on [Twitter/X](https://x.com/intent/user?screen_name=TheMarginull) and subscribe to [Marginull YouTube channel](https://www.youtube.com/Marginull?sub_confirmation=1) if you haven't done yet. \n\n";
  content += "See you in next trading session 📈 \n";

  return content;
}
