function getRealtimePrice(securityId,exchangeSegment,instrument) {
  
    var url = `${BASE_URL}/charts/intraday`;
    var options = {
        method: 'post',
        headers: {
            'access-token': `${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        payload: JSON.stringify({
            securityId: securityId,
            exchangeSegment: exchangeSegment,
            instrument: instrument
        }),
        'muteHttpExceptions': true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    var statusCode = response.getResponseCode();
    var responseContent = response.getContentText();

    if (statusCode != 200) {

      logMessage("REALTIME PRICE: Error getting price. Examine the error: " + responseContent);
      return false;

    } else {
      return data.close.pop();
    };
}
