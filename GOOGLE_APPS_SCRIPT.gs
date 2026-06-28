const SHEET_NAME = 'Bookings';
const EXPENSES_SHEET_NAME = 'Expenses';
const PNL_SHEET_NAME = 'Monthly P&L';

const BOOKING_HEADERS = [
  'Timestamp',
  'Booking ID',
  'Booking Type',
  'Bungalow',
  'Guest Name',
  'Phone',
  'Email',
  'Check-in Date',
  'Check-out Date',
  'Day-use Date',
  'Preferred Start Time',
  'Guests',
  'Periods',
  'Unit Price',
  'Total Price',
  'Payment Status',
  'Booking Status',
  'Notes',
  'Source'
];

const EXPENSE_HEADERS = [
  'Date',
  'Month',
  'Bungalow',
  'Category',
  'Description',
  'Amount',
  'Payment Method',
  'Notes'
];

function doGet() {
  setupSheets();
  return ContentService
    .createTextOutput('DhourShweirBungalows booking endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    setupSheets();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents || '{}');
    const bookingId = data.bookingId || ('DSB-' + new Date().getTime());

    sheet.appendRow([
      new Date(),
      bookingId,
      data.bookingType || '',
      data.bungalow || '',
      data.guestName || '',
      data.phone || '',
      data.email || '',
      data.checkInDate || '',
      data.checkOutDate || '',
      data.dayUseDate || '',
      data.preferredStartTime || '',
      data.guests || '',
      data.periods || '',
      data.unitPrice || '',
      data.totalPrice || '',
      data.paymentStatus || 'Pending full Whish payment',
      data.bookingStatus || 'Request received - pending manual confirmation',
      data.notes || '',
      data.source || 'Website'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, bookingId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let bookings = ss.getSheetByName(SHEET_NAME);
  if (!bookings) bookings = ss.insertSheet(SHEET_NAME);
  ensureHeaders(bookings, BOOKING_HEADERS);

  let expenses = ss.getSheetByName(EXPENSES_SHEET_NAME);
  if (!expenses) expenses = ss.insertSheet(EXPENSES_SHEET_NAME);
  ensureHeaders(expenses, EXPENSE_HEADERS);

  let pnl = ss.getSheetByName(PNL_SHEET_NAME);
  if (!pnl) pnl = ss.insertSheet(PNL_SHEET_NAME);
  setupPnlSheet(pnl);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const missing = headers.some((header, index) => existing[index] !== header);
  if (missing) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function setupPnlSheet(sheet) {
  const headers = ['Month', 'Confirmed Revenue', 'Pending Revenue', 'Expenses', 'Net Profit'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);

  if (!sheet.getRange('A2').getValue()) {
    sheet.getRange('A2').setFormula('=SORT(UNIQUE(FILTER(TEXT(Bookings!A2:A,"yyyy-mm"),Bookings!A2:A<>"")))');
  }
  sheet.getRange('B2').setFormula('=ARRAYFORMULA(IF(A2:A="","",SUMIFS(Bookings!O:O,TEXT(Bookings!A:A,"yyyy-mm"),A2:A,Bookings!Q:Q,"Confirmed")))');
  sheet.getRange('C2').setFormula('=ARRAYFORMULA(IF(A2:A="","",SUMIFS(Bookings!O:O,TEXT(Bookings!A:A,"yyyy-mm"),A2:A,Bookings!Q:Q,"<>Confirmed")))');
  sheet.getRange('D2').setFormula('=ARRAYFORMULA(IF(A2:A="","",SUMIFS(Expenses!F:F,Expenses!B:B,A2:A)))');
  sheet.getRange('E2').setFormula('=ARRAYFORMULA(IF(A2:A="","",B2:B-D2:D))');
}
