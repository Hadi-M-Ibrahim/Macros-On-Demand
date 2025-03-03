function filterRowsWithoutMacros() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // keep header row
    var filteredData = [data[0]];
    
    // loop through the data (starting from row 2) and keep rows where all macros are present
    for (var i = 1; i < data.length; i++) {
      if (data[i][9] && data[i][10] && data[i][15] && data[i][18]) {
        filteredData.push(data[i]);
      }
    }
    
    // clear the current sheet (contents only)
    sheet.clearContents();
    
    // write the filtered data back to the sheet
    sheet.getRange(1, 1, filteredData.length, filteredData[0].length)
         .setValues(filteredData);
  }
  