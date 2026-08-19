function lastSquareOffOrder() { 

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

        logMessage("LAST SQUAREOFF: Today is not a trading day. Bye bye!");
        
        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size.
    var quantity = quantity * lotSize;

    var realTimePrice = getRealtimePrice(securityId, exchangeSegment, instrument);
    
    if (realTimePrice == false) {

        logMessage("LAST SQUAREOFF: Error fetching real-time price, examing the error logs.");
        sendEmail("LAST SQUAREOFF: Error fetching real-time price, examing the error logs.");

        deleteSpecificTrigger("masterTrigger");
        return;
    }

        logMessage("LAST SQUAREOFF: " + indexName + " expiry and the current price is " + realTimePrice);
        
    // logMessage("LAST SQUAREOFF: Generating 2-strike OTM symbols & fetching the security IDs.");

    // var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM');

    // // Round the real-time price to the nearest strike price increment
    // var roundedPrice = Math.round(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
    
    // // Generate symbols with the rounded price
    // var callValue = roundedPrice + (strikePriceIncrement * 2);
    // var putValue = roundedPrice - (strikePriceIncrement * 2);
    
    // // Format symbols in uppercase
    // var callSymbol = `${indexName} ${formattedDate} ${callValue} CALL`.toUpperCase();
    // var putSymbol = `${indexName} ${formattedDate} ${putValue} PUT`.toUpperCase();

    // var callSecurityId = getSecurityId(callSymbol);
    // var putSecurityId = getSecurityId(putSymbol);

    //   logMessage("LAST SQUAREOFF: Generated " + callSymbol + " and fetched security ID: " + callSecurityId);
    //   logMessage("LAST SQUAREOFF: Generated " + putSymbol + " and fetched security ID: " + putSecurityId);
    

    // calculating the acceptable difference.
    var acceptStrikeDiff = (strikePriceIncrement / 1.75);

    // fetching the stored values.
    var callSecurityIdStored = sheet.getRange("B2").getValue(); 
    var callSymbolStored = sheet.getRange("C2").getValue(); 
    var callValueStored = sheet.getRange("D2").getValue(); 
    var putSecurityIdStored = sheet.getRange("B3").getValue(); 
    var putSymbolStored = sheet.getRange("C3").getValue(); 
    var putValueStored = sheet.getRange("D3").getValue(); 

    // calculating the value and price difference of stored value and real-time price.
    if (callValueStored) {
      var callValueStoredDiff = callValueStored - realTimePrice; 
        
        logMessage("LAST SQUAREOFF: Stored value difference for CALL is " + callValueStoredDiff.toFixed(2) + " and acceptable value " + acceptStrikeDiff.toFixed(2));
    }
    
    if (putValueStored) {
      var putValueStoredDiff = realTimePrice - putValueStored;
        
        logMessage("LAST SQUAREOFF: Stored value difference for PUT is " + putValueStoredDiff.toFixed(2) + " and acceptable value " + acceptStrikeDiff.toFixed(2));
    }

    // comparing if the strike value saved in spreadsheet is within acceptable limit and not false
    if (callValueStoredDiff < acceptStrikeDiff && callSymbolStored && callSecurityIdStored) {
  
        logMessage("LAST SQUAREOFF: Index price " + realTimePrice + " is nearing to CALL, exiting for safety...");
        logMessage("LAST SQUAREOFF: Placing the square-off CALL order for " + callSymbolStored + " at market price for quantity: " + quantity);
            
      var orderStatus = executeOrder("BUY", optionSegment, "MARKET", callSecurityIdStored, quantity, "0", "CALL");

      if (orderStatus == false) {
        
        logMessage("LAST SQUAREOFF: Error executing CALL buy order, examine the error logs.");
        sendEmail("LAST SQUAREOFF: Error executing CALL buy order, examine the error logs.");
        
        return;
      }
      
      var callStrikePrice = getRealtimePrice(callSecurityIdStored,optionSegment,optionInstrument);

      if (callStrikePrice) {

        logMessage("LAST SQUAREOFF: Executed for " + callSymbolStored + " at " + callStrikePrice);
      
      }

      if (orderStatus == true) {   
        // condition to set the stored values for CALL row to false/empty.
        sheet.getRange("B2").setValue('');
        sheet.getRange("C2").setValue(''); 
        sheet.getRange("D2").setValue(''); 
        logMessage("LAST SQUAREOFF: Erased stored CALL details.")
      }

      return; 

    } else if (putValueStoredDiff < acceptStrikeDiff && putSymbolStored && putSecurityIdStored) {
  
        logMessage("LAST SQUAREOFF: Index price " + realTimePrice + " is nearing to PUT, exiting for safety...");
        logMessage("LAST SQUAREOFF: Placing the square-off PUT order for " + putSymbolStored + " at market price for quantity: " + quantity);
      
      var orderStatus = executeOrder("BUY", optionSegment, "MARKET", putSecurityIdStored, quantity, "0", "PUT");

      if (orderStatus == false) {
        
        logMessage("LAST SQUAREOFF: Error executing PUT buy order, examine the error logs.");
        sendEmail("LAST SQUAREOFF: Error executing PUT buy order, examine the error logs.");
        
        return;
      }
      
      var putStrikePrice = getRealtimePrice(putSecurityIdStored,optionSegment,optionInstrument);

      if (putStrikePrice) {

        logMessage("LAST SQUAREOFF: Executed for " + putSymbolStored + " at " + putStrikePrice);

      }

      if (orderStatus == true) {   
        // condition to set the stored values for CALL row to false/empty.
        sheet.getRange("B3").setValue('');
        sheet.getRange("C3").setValue(''); 
        sheet.getRange("D3").setValue(''); 
        logMessage("LAST SQUAREOFF: Erased stored PUT details.")
      }

      return; 

    } else {
  
        logMessage("LAST SQUAREOFF: Both CALL & PUT are within the OTM or squared-off, exiting...")

      return;

    }

}
