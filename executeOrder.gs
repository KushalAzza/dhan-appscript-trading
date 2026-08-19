function executeOrder(transactionType, exchangeSegment, orderType, securityId, quantity, price, drvOptionType) {
 var url = `${BASE_URL}/orders`;
  var options = {
    method: 'POST',
    headers: {
      'access-token': `${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    payload: JSON.stringify({
      dhanClientId: `${DHAN_CLIENT_ID}`,
      transactionType: transactionType,
      exchangeSegment: exchangeSegment,
      productType: 'MARGIN',
      orderType: orderType,
      validity: 'IOC',
      securityId: securityId,
      quantity: quantity,
      price: price,
      drvOptionType: drvOptionType,
      drvStrikePrice: ''
    }),
    muteHttpExceptions: true
  };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    var statusCode = response.getResponseCode();
    var orderData = response.getContentText();
    if (statusCode != 200) {

      logMessage("EXECUTION: Order was not placed. Order data: " + orderData);

      return false;
    }
    var orderNum = data.orderId;
  // Checking for order status after placing the order.

  Utilities.sleep(500);

  var url = `${BASE_URL}/orders/${orderNum}`;
    var options = {
    method: 'GET',
    headers: {
      'access-token': `${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    var statusData = response.getContentText();
    var statusCode = response.getResponseCode();
    var orderStatus = data.orderStatus;

  
  if (orderStatus == "TRADED" && statusCode == 200) {

     logMessage("EXECUTION: Order ID is " + orderNum + " excuted. Order data: " + orderData + " and status: " + statusData);

    return true;
  } else if ((orderStatus == "TRANSIT" || orderStatus == "PENDING" ) && statusCode == 200 ) {

      logMessage("EXECUTION: Order ID is " + orderNum + " is in TRANSIT or PENDING status, checking again...");
    
    Utilities.sleep(2000);
    // checking again if the order is in transit or pending
    var url = `${BASE_URL}/orders/${orderNum}`;
    var options = {
    method: 'GET',
    headers: {
      'access-token': `${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    'muteHttpExceptions': true
  };
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    var statusCode = response.getResponseCode();
    var orderStatus = data.orderStatus;
    
      if (orderStatus == "TRADED" && statusCode == 200) {

          logMessage("EXECUTION: Order ID is " + orderNum + " excuted. Order data: " + orderData + " and status: " + statusData);

          return true;
      } else {
          var url = `${BASE_URL}/orders/${orderNum}`;
          var options = {
          method: 'DELETE',
            headers: {
              'access-token': `${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          'muteHttpExceptions': true
        };
        var response = UrlFetchApp.fetch(url, options);

          logMessage("EXECUTION: Order ID is " + orderNum + " has been deleted.");
        
        return false;
      }

  } else if ((orderStatus == "CANCELLED" || orderStatus == "REJECTED" || orderStatus == "EXPIRED") && statusCode == 200 ) {

      logMessage ("EXECUTION: Order ID " + orderNum + " could not be completed.");
      logMessage ("EXECUTION: The order was CANCELLED, REJECTED, or EXPIRED. Order data: " + orderData + " and status: " + statusData);

    return false;
  } else {

      logMessage ("EXECUTION: Order ID " + orderNum + " could not be completed.");
      logMessage ("EXECUTION: Something went wrong, please check this: " + orderData + " and status: " + statusData);

    return false;
  }
}
