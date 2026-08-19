function firstShortOrder() { 

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dataSheet);
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var quantity = quantity * lotSize;

    var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM');

    var realTimePrice = getRealtimePrice(securityId, exchangeSegment, instrument);
    
    if (realTimePrice == false) {

        logMessage("DECAY ORDER: Error fetching real-time price, examine the error logs.");
        sendEmail("DECAY ORDER: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;
    }

      logMessage("SHORT ORDER: " + indexName + " expiry and the price is " + realTimePrice);
      logMessage("SHORT ORDER: Generating 2-strike OTM symbols & fetching the security IDs.");

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = Math.round(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
    
    // Generate symbols with the rounded price
    var callValue = roundedPrice + (strikePriceIncrement * 2);
    var putValue = roundedPrice - (strikePriceIncrement * 2);
    
    // Format symbols in uppercase
    var callSymbol = `${indexName} ${formattedDate} ${callValue} CALL`.toUpperCase();
    var putSymbol = `${indexName} ${formattedDate} ${putValue} PUT`.toUpperCase();

    var callSecurityId = getSecurityId(callSymbol);
    var putSecurityId = getSecurityId(putSymbol);

      logMessage("SHORT ORDER: Generated " + callSymbol + " and fetched security ID: " + callSecurityId);
      logMessage("SHORT ORDER: Generated " + putSymbol + " and fetched security ID: " + putSecurityId);
    
    // placing order for CALL and PUT for firstShortOrder()

      logMessage("SHORT ORDER: Placing for " + callSymbol + " at market price for quantity: " + quantity);
    
    var orderStatus = executeOrder("SELL", optionSegment, "MARKET", callSecurityId, quantity, "0", "CALL");
  
    if (orderStatus) {
    var callStrikePrice = getRealtimePrice(callSecurityId,optionSegment,optionInstrument);

      if (callStrikePrice) {

        logMessage("SHORT ORDER: Executed for " + callSymbol + " at " + callStrikePrice);
      
      }

        sheet.getRange("B2").setValue(callSecurityId); 
        sheet.getRange("C2").setValue(callSymbol); 
        sheet.getRange("D2").setValue(callValue); 

        logMessage ("SHORT ORDER: CALL details stored in dataSheet");

    } else {

        logMessage("SHORT ORDER: Error executing order, examine the error logs.");
        sendEmail("SHORT ORDER: Error executing order, examine the error logs.");
      return;
    }

        logMessage("SHORT ORDER: Placing for " + putSymbol + " at market price for quantity: " + quantity);

    var orderStatus = executeOrder("SELL", optionSegment, "MARKET", putSecurityId, quantity, "0", "PUT");

    if (orderStatus) {
      var putStrikePrice = getRealtimePrice(putSecurityId,optionSegment,optionInstrument);
      
      if (putStrikePrice) {

        logMessage("SHORT ORDER: Executed for " + putSymbol + " at " + putStrikePrice);
  
      }

        sheet.getRange("B3").setValue(putSecurityId); 
        sheet.getRange("C3").setValue(putSymbol);
        sheet.getRange("D3").setValue(putValue); 
        logMessage ("SHORT ORDER: PUT details stored in dataSheet");

    } else {

        logMessage("SHORT ORDER: Error executing order, examine the error logs.");
        sendEmail("SHORT ORDER: Error executing order, examine the error logs.");

      return;
    }

}
