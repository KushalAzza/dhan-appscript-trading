function buyDecayOrder() {
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, strikePriceIncrement, securityId, exchangeSegment, instrument, optionSegment, optionInstrument;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "MIDCPNIFTY";
        strikePriceIncrement = 25;
        securityId = "442";
        exchangeSegment = "IDX_I";
        instrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "50";
        break;
      case 2: // Tuesday
        indexName = "FINNIFTY";
        strikePriceIncrement = 50;
        securityId = "27";
        exchangeSegment = "IDX_I";
        instrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "BANKNIFTY";
        strikePriceIncrement = 100;
        securityId = "25";
        exchangeSegment = "IDX_I";
        instrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "15";
        break;
      case 4: // Thursday
        indexName = "NIFTY";
        strikePriceIncrement = 50;
        securityId = "13";
        exchangeSegment = "IDX_I";
        instrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 5: // Friday
        indexName = "SENSEX";
        strikePriceIncrement = 100;
        securityId = "51";
        exchangeSegment = "IDX_I";
        instrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      default:
          
          logMessage("DECAY ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }

    // multiple with lot size and doubling the size for hedging.
    var quantity = quantity * lotSize * 2;

    // calculating the entry price based on the strikePriceIncrement

    var limitPrice = (strikePriceIncrement / 25);
    var currentPrice = (strikePriceIncrement / 26.5);

    var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM');

    var realTimePrice = getRealtimePrice(securityId, exchangeSegment, instrument);

    if (realTimePrice == false) {

          logMessage("DECAY ORDER: Error fetching real-time price, examine the error logs.");
          sendEmail("DECAY ORDER: Error fetching real-time price, examine the error logs.");
          deleteSpecificTrigger("masterTrigger");
        return;
    }

      logMessage("DECAY ORDER: " + indexName + " expiry and the real-time price is " + realTimePrice);
      logMessage("DECAY ORDER: Placing at " + currentPrice.toFixed(2) + " with price limit of " + limitPrice.toFixed(2) + " for quantity " + quantity );
        
    var roundedPrice = Math.round(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
    
    // Loop for PUT Buying

    loopCounter = 10;
    var putOrderPlaced = false;

    var currentPutPrice = roundedPrice - (10 * strikePriceIncrement); // Adjust the starting point for PUT loop (10 strike prices below ATM)
    
    while (loopCounter > 0) {
      var putSymbol = `${indexName} ${formattedDate} ${currentPutPrice} PUT`.toUpperCase();
      var putSecurityId = getSecurityId(putSymbol);
      var putStrikePrice = getRealtimePrice(putSecurityId,optionSegment,optionInstrument);

      if (putStrikePrice == false) {

        logMessage("DECAY ORDER: Error fetching PUT strike price, examine the error messages.")
        sendEmail("DECAY ORDER: Error fetching PUT strike price, examine the error messages.");
        return;
      }

        logMessage("DECAY ORDER: Price of " + putSymbol + " is " + putStrikePrice);

      if (putStrikePrice < currentPrice && !putOrderPlaced) {
        var orderStatus =  executeOrder("BUY", optionSegment, "LIMIT", putSecurityId, quantity, limitPrice, "PUT");
        if (orderStatus) {
          var putOrderPlaced = orderStatus;
        } else {

          logMessage("DECAY ORDER: Error executing PUT buy order, examine the error messages.");
          sendEmail("DECAY ORDER: Error executing PUT buy order, examine the error messages.");

          return;  
        }
      }
      if (putOrderPlaced) {

          logMessage("DECAY ORDER: Executed for " + putSymbol + " at " + putStrikePrice + ". Terminating loop!");

          break;
      } 
      Utilities.sleep(300);
      
      currentPutPrice -= strikePriceIncrement;
      loopCounter--;
    }

    // Loop for CALL Buying
    loopCounter = 10;
    var callOrderPlaced = false;
    
    var currentCallPrice = roundedPrice + (11 * strikePriceIncrement); // Adjust the starting point for CALL loop (10 strike prices above ATM)
    
    while (loopCounter > 0) {
      var callSymbol = `${indexName} ${formattedDate} ${currentCallPrice} CALL`.toUpperCase();
      var callSecurityId = getSecurityId(callSymbol);
      var callStrikePrice = getRealtimePrice(callSecurityId, optionSegment, optionInstrument);

      if (callStrikePrice == false) {
          logMessage("DECAY ORDER: Error fetching CALL strike price, examine the error messages.");
          sendEmail("DECAY ORDER: Error fetching CALL strike price, examine the error messages.")
      }

          logMessage("DECAY ORDER: Price of " + callSymbol + " is " + callStrikePrice);

      if (callStrikePrice < currentPrice && !callOrderPlaced) {
        
        var orderStatus =  executeOrder("BUY", optionSegment, "LIMIT", callSecurityId, quantity, limitPrice, "CALL");
        if (orderStatus) {
          var callOrderPlaced = orderStatus;
        } else {

          logMessage("DECAY ORDER: Error executing CALL buy order, examine the error messages.");
          sendEmail("DECAY ORDER: Error executing CALL buy order, examine the error messages.");

          return;  
        }
      }
      if (callOrderPlaced) {

          logMessage("DECAY ORDER: Executed for " + callSymbol + " at " + callStrikePrice + ".  Terminating loop!");

          break;
      } 
      Utilities.sleep(300);
      
      currentCallPrice += strikePriceIncrement;
      loopCounter--;
    }
}
