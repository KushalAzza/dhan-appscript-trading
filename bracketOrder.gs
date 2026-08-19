function bracketOrder() { 

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

        logMessage("BRACKET ORDER: Today is not a trading day. Bye bye!");
  
        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // getting the values from data spreadsheet
    var callSecurityIdStored = sheet.getRange("B2").getValue(); 
    var putSecurityIdStored = sheet.getRange("B3").getValue();
    var callSymbolStored = sheet.getRange("C2").getValue(); 
    var putSymbolStored = sheet.getRange("C3").getValue(); 
    var callValueStored = sheet.getRange("D2").getValue(); 
    var putValueStored = sheet.getRange("D3").getValue(); 

    if (!callSecurityIdStored || !putSecurityIdStored || !callValueStored || !putValueStored) {
      logMessage("BRACKET ORDER: Another order in progress...");
      return;
    }

    // multiplying with lot size.
    var quantity = quantity * lotSize;
    
    var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM');

    var realTimePrice = getRealtimePrice(securityId, exchangeSegment, instrument);
    
    if (realTimePrice == false) {

        logMessage("BRACKET ORDER: Error fetching real-time price. Examine the error messages.");
        sendEmail("BRACKET ORDER: Error fetching real-time price. Examine the error messages.");
        deleteSpecificTrigger("masterTrigger");
        return;
    }

        logMessage("BRACKET ORDER: " + indexName + " expiry and the current price is " + realTimePrice);
        // logMessage("BRACKET ORDER: Generating 2-strike OTM symbols & fetching the security IDs.");

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

        // logMessage("BRACKET ORDER: Generated " + callSymbol + " and fetched security ID: " + callSecurityId);
        // logMessage("BRACKET ORDER: Generated " + putSymbol + " and fetched security ID: " + putSecurityId);

    // comparing if the security id saved in spreadsheet and current strike is same.
    if (callSecurityId == callSecurityIdStored && putSecurityId == putSecurityIdStored) {

        logMessage("BRACKET ORDER: Last short-sold CALL & PUT are same and OTM, exiting safely...");

      return; 
    }

    // calculating the difference between stored value and realtime price of index.
    var callValueStoredDiff = callValueStored - realTimePrice; 
    var putValueStoredDiff = realTimePrice - putValueStored;
    var acceptStrikeDiff = (strikePriceIncrement / 1.60);

        logMessage("BRACKET ORDER: Stored value difference for CALL is " + callValueStoredDiff.toFixed(2) + " and acceptable value " + acceptStrikeDiff.toFixed(2));
        logMessage("BRACKET ORDER: Stored value difference for PUT is " + putValueStoredDiff.toFixed(2) + " and acceptable value " + acceptStrikeDiff.toFixed(2));

    // comparing if the strike value saved in spreadsheet and current strike has lesses difference.
    if (callValueStoredDiff < acceptStrikeDiff || putValueStoredDiff < acceptStrikeDiff) {

        logMessage("BRACKET ORDER: Index price " + realTimePrice + " is nearing to strike prices, adjusting the CALL & PUT at current OTM Strike...");
        logMessage("BRACKET ORDER: Placing the square-off CALL & PUT order for " + callSymbolStored + " and " + putSymbolStored + " at market price for quantity: " + quantity);
      
      var orderStatus = executeOrder("BUY", optionSegment, "MARKET", callSecurityIdStored, quantity, "0", "CALL");

      if (orderStatus == false) {
        
        logMessage("BRACKET ORDER: Error executing CALL buy, examine the error logs.");
        sendEmail("BRACKET ORDER: Error executing CALL buy, examine the error logs.");
        
        return;
      } else {
        
        var callStrikePrice = getRealtimePrice(callSecurityIdStored,optionSegment,optionInstrument);
        logMessage("BRACKET ORDER: Square-off order placed for " + callSymbolStored + " when the price was " + callStrikePrice);

        // condition to set the stored values for CALL row to empty.
        sheet.getRange("B2").setValue('');
        sheet.getRange("C2").setValue(''); 
        sheet.getRange("D2").setValue(''); 
        logMessage("BRACKET ORDER: Erased stored CALL details.")
      }

      Utilities.sleep(300);

      var orderStatus = executeOrder("BUY", optionSegment, "MARKET", putSecurityIdStored, quantity, "0", "PUT");

      if (orderStatus == false) {
        
        logMessage("BRACKET ORDER: Error executing PUT buy, examine the error logs.");
        sendEmail("BRACKET ORDER: Error executing PUT buy, examine the error logs.");
        
        return;
      } else {

        var putStrikePrice = getRealtimePrice(putSecurityIdStored,optionSegment,optionInstrument);
        logMessage("BRACKET ORDER: Square-off order placed for " + putSymbolStored + " when the price was " + putStrikePrice);

        // condition to set the stored values for PUT row to empty.
        sheet.getRange("B3").setValue('');
        sheet.getRange("C3").setValue(''); 
        sheet.getRange("D3").setValue(''); 
        logMessage("BRACKET ORDER: Erased stored PUT details.")
      }
      
      // Placing the square-off order after 3 minutes delay

        Utilities.sleep(120000);

      logMessage("BRACKET ORDER: Placing a new short-sell CALL & PUT orders for " + callSymbol + " and " + putSymbol + " at market price for quantity: " + quantity);

      var orderStatus = executeOrder("SELL", optionSegment, "MARKET", callSecurityId, quantity, "0", "CALL");

      if (orderStatus == false) {
        
        logMessage("BRACKET ORDER: Error executing CALL sell, examine the error logs.");
        sendEmail("BRACKET ORDER: Error executing CALL sell, examine the error logs.");
        
        return;
      } else {

        var callStrikePrice = getRealtimePrice(callSecurityId,optionSegment,optionInstrument);
        
        if (callStrikePrice) {
          logMessage("BRACKET ORDER: Short-selling executed for " + callSymbol + " when the current price was " + callStrikePrice);
        }

        // condition to store values for CALL.
        sheet.getRange("B2").setValue(callSecurityId); 
        sheet.getRange("C2").setValue(callSymbol); 
        sheet.getRange("D2").setValue(callValue); 
      }

      Utilities.sleep(300);

      var orderStatus = executeOrder("SELL", optionSegment, "MARKET", putSecurityId, quantity, "0", "PUT");

      if (orderStatus == false) {
        
        logMessage("BRACKET ORDER: Error executing PUT sell, examine the error logs.");
        sendEmail("BRACKET ORDER: Error executing PUT sell, examine the error logs.");
        
        return;
      } else {
        
        var putStrikePrice = getRealtimePrice(putSecurityId,optionSegment,optionInstrument);
       
        if (putStrikePrice) {
        logMessage("BRACKET ORDER: Short-selling executed for " + putSymbol + " when the current price was " + putStrikePrice);
        }
        // condition to store values for PUT.
        sheet.getRange("B3").setValue(putSecurityId); 
        sheet.getRange("C3").setValue(putSymbol);
        sheet.getRange("D3").setValue(putValue);
        
      }
      logMessage("BRACKET ORDER: Stored the value of short-sold CALL & PUT into dataSheet");
      return; 

    } else {

        logMessage("BRACKET ORDER: Both CALL & PUT are within the acceptable OTM limit, exiting for now...");    

      return;
    }
}
