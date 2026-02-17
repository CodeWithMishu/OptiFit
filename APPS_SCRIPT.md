# Apps Script webhook for OptiFit

This file contains the complete Google Apps Script to accept form-encoded or JSON POSTs and append rows to your Google Sheet.

1. Open https://script.google.com and create a new project.
2. Replace the default `Code.gs` with the script below.
3. Set `SPREADSHEET_ID` and `SHEET_NAME` if different.
4. Save and `Deploy -> New deployment -> Web app`.
   - Execute as: `Me`
   - Who has access: `Anyone` (or `Anyone, even anonymous`)
5. Copy the Web app `exec` URL and set it as `NEXT_PUBLIC_APPS_SCRIPT_URL` in your frontend environment.

---

```javascript
// Apps Script: OptiFit webhook to append rows to a single sheet
const SPREADSHEET_ID = '1GMHaD7-PFVKTKwTAO2fK4g6_he1btqC1WhZWu-ZbRHM';
const SHEET_NAME = 'Sheet1';

const HEADERS = [
  'Timestamp','Name','Age','DOB','Gender','Mobile','Address','Ward No','Booth/PS No',
  'Right SPH','Right CYL','Right Axis','Right Prism','Right Base',
  'Left SPH','Left CYL','Left Axis','Left Prism','Left Base',
  'Face Shape','Confidence %','Frame Size','Recommended Frames',
  'Face Length (mm)','Forehead Width (mm)','Cheekbone Width (mm)',
  'Jaw Width (mm)','Temple Width (mm)','Nose Bridge (mm)'
];

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const empty = firstRow.every(c => c === '');
  if (empty) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function parseRequest_(e) {
  let out = {};
  try {
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      Object.keys(e.parameter).forEach(k => {
        const v = e.parameter[k];
        if (typeof v === 'string') {
          try { out[k] = JSON.parse(v); } catch (err) { out[k] = v; }
        } else {
          out[k] = v;
        }
      });
    } else if (e && e.postData && e.postData.contents) {
      try { out = JSON.parse(e.postData.contents); } catch (err) { out = {}; }
    }
  } catch (err) {
    out = {};
  }
  return out;
}

function appendRowFromBody_(body) {
  const rx = body.prescription || {};
  const right = rx.rightEye || {};
  const left = rx.leftEye || {};

  const frameSuggestions = Array.isArray(body.frameSuggestion)
    ? body.frameSuggestion.map(f => (f.type || f)).join(', ')
    : (body.frameSuggestion || '');

  const row = [
    new Date().toISOString(),
    body.name || '',
    body.age || '',
    body.dob || '',
    body.gender || '',
    body.mobile || '',
    body.address || '',
    body.wardNo || '',
    body.boothNo || '',
    right.spherical ?? '',
    right.cylindrical ?? '',
    right.axis ?? '',
    right.prism ?? '',
    right.base ?? '',
    left.spherical ?? '',
    left.cylindrical ?? '',
    left.axis ?? '',
    left.prism ?? '',
    left.base ?? '',
    body.faceShape || '',
    body.confidence || '',
    body.frameSize || '',
    frameSuggestions,
    body.faceLengthMm || '',
    body.foreheadWidthMm || '',
    body.cheekboneWidthMm || '',
    body.jawWidthMm || '',
    body.templeWidthMm || '',
    body.noseBridgeWidthMm || ''
  ];

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  sheet.appendRow(row);
}

function doPost(e) {
  try {
    const body = parseRequest_(e);
    appendRowFromBody_(body);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Apps Script ready' })).setMimeType(ContentService.MimeType.JSON);
}
```

---

Tips
- If you prefer security, add a `SHARED_SECRET` constant and require `secret` in the payload; validate it in `doPost`.
- If you see 405 on POST, ensure you deployed as **Web app** and are using the `.../exec` URL.
