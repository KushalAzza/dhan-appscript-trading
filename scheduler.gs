function createDailyTrigger() {
  // Deletes the previous daily trigger if it exists
  deleteSpecificTrigger("createMasterTrigger");

  // Create a new daily time-based trigger that runs at 8:00 AM
  ScriptApp.newTrigger("createMasterTrigger")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

    logMessage("SCHEDULER: Daily trigger intiated for 8AM daily.");

}

function createMasterTrigger() {
  // Deletes all previous master triggers to avoid duplicates
  deleteSpecificTrigger("masterTrigger");

  // Create a new time-driven trigger that runs every minute
  ScriptApp.newTrigger("masterTrigger")
    .timeBased()
    .everyMinutes(1)
    .create();

    logMessage("SCHEDULER: Intiated for Master scheduler at 1 minute interval.");

}

function deleteSpecificTrigger(functionName) {
  // Get all triggers
  const triggers = ScriptApp.getProjectTriggers();
  
  // Loop through each trigger and delete only those that match the function name
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function masterTrigger() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Run only on weekdays
  if (day < 1 || day > 5) {
    deleteSpecificTrigger("masterTrigger"); 

    logMessage("SCHEDULER: Today is a weekend, Master scheduler has been exited. Bye! Bye!");

    return; // It's a weekend
  }

  // Check if the time is after 4:00 PM
  if (hours >= 16) {
    
    postMarginull()
    deleteSpecificTrigger("masterTrigger"); // Delete only the master trigger after 4:00 PM
    clearSheet(); // clear the data stored in dataSheet

    logMessage("SCHEDULER: Time is 4:00 PM, Master scheduler has been exited. Bye! Bye!");
    return;
  }

  // Call specific functions based on the exact time
  const timeString = `${hours}:${minutes}`;
  switch (timeString) {
    case "9:5":
      
        logMessage("SCHEDULER: Scrip Master Importer has started.");

        importMasterCSV();
        checkKeyExpiry();
      
        logMessage("SCHEDULER: Scrip Master Importer has completed for 09:05 AM.");

      break;
    case "9:35":

        logMessage("SCHEDULER: Buying the decaying order started");

      buyDecayOrder();

        logMessage("SCHEDULER: Buying the decaying order has completed for 09:32 AM.");

      break;
    case "9:37":
      
        logMessage("SCHEDULER: First short-selling orders has started");

      firstShortOrder();

        logMessage("SCHEDULER: First short-selling orders has completed for 09:34 AM.");

      break;
    default:
      if (hours >= 9 && hours <= 15) {

        // bracketOrder scheduler has started from 09:39 AM (580) to 02:45 PM (885)
        if (minutes % 1 === 0 && hours * 60 + minutes >= 579 && hours * 60 + minutes <= 885) {
          
          logMessage("SCHEDULER: Bracket orders adjustment has started");

          bracketOrder();

          logMessage("SCHEDULER: Bracket orders adjustment has completed for 1 minutes interval.");

        }
                // bracketOrder scheduler has started from 02:46 AM (886) to 03:29 PM (929)
        if (minutes % 1 === 0 && hours * 60 + minutes >= 886 && hours * 60 + minutes <= 929) {
          
          logMessage("SCHEDULER: Last square-ff order adjustment has started");

          lastSquareOffOrder();

          logMessage("SCHEDULER: Last square-ff order has completed for 1 minutes interval.");

        }
      }
      break;
  }
}
