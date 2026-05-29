// ============================================================
// ModMed Eligibility Report -> Availity Batch CSV(s)
// ============================================================
// Extracts patient demographics from the ModMed Eligibility
// Report view (Appt Flow → View Eligibility Report) and writes
// one CSV per unique payer, formatted for Availity Essentials
// batch eligibility upload.
//
// PREREQUISITES
//   1. Be on the ModMed Eligibility Report page in Chrome.
//      Path: Appt Flow → View Eligibility Report (badge link
//      on the right side of the day header).
//   2. Filter to whatever date range you want verified
//      (e.g. "Next 7 days"). Set pagination to show ALL rows,
//      not 10 per page.
//   3. Open Chrome Developer Console:
//        Cmd+Option+J (Mac)  /  Ctrl+Shift+J (Windows)
//      Chrome may show a paste warning. Type:
//        allow pasting
//      and press Enter.
//   4. Paste this entire script into the console and hit Enter.
//   5. The first time you run this on a multi-payer day,
//      Chrome prompts:
//        "This site is attempting to download multiple files"
//      Click Allow. Chrome remembers this for the rest of the
//      session.
//
// OUTPUT
//   Downloads ONE CSV per unique payer to your Downloads folder,
//   each formatted for Availity batch eligibility intake:
//
//     availity_<payer_slug>.csv
//
//   Example: availity_medicare_of_texas.csv, availity_bcbs_ppo.csv
//
//   Columns (Availity's required order):
//     last_name, first_name, dob, member_id, payer, provider_npi
//
//   Why split by payer? Availity's batch endpoint runs one
//   payer's roster at a time. Uploading mixed payers in one
//   file forces Availity to reject the batch or process slowly.
//   Splitting up front matches Availity's expected workflow.
//
// HIPAA
//   This script runs ENTIRELY in your local browser. No patient
//   data is transmitted anywhere. The CSV(s) write to your local
//   Downloads folder. The next step (Availity batch upload) is
//   the first place PHI leaves your machine — and Availity is
//   a HIPAA-covered vendor with a signed BAA.
//
// ADAPTING THIS SCRIPT
//   If your EMR is not ModMed, paste this script + the companion
//   AI Reference PDF into Claude or another modern AI. Tell it
//   the name of your EMR and point at one row's DOM (right-click
//   the row → Inspect → copy outer HTML). The AI can adapt the
//   #reportTable selector and column-mapping logic to your tool.
// ============================================================

(function () {
  var DEFAULT_NPI = '';   // Optional: set your provider NPI here, e.g. '1234567890'

  var table = document.querySelector('#reportTable');
  if (!table) {
    console.log('ERROR: Cannot find #reportTable. Are you on the Eligibility Report page (Appt Flow → View Eligibility Report)?');
    return;
  }

  var rows = table.querySelectorAll('tbody tr');
  if (rows.length === 0) {
    console.log('ERROR: Table found, but no rows. Check the date range and pagination.');
    return;
  }

  // Map columns by header text (Patient, Payer, Policy Number).
  var headerCells = table.querySelectorAll('thead th, thead td');
  var idx = {};
  headerCells.forEach(function (th, i) {
    var label = (th.innerText || '').trim().toLowerCase();
    if (label === 'patient') idx.patient = i;
    if (label === 'payer') idx.payer = i;
    if (label === 'policy number') idx.policy = i;
  });

  if (idx.patient === undefined) {
    console.log('ERROR: Could not locate the Patient column.');
    return;
  }

  // Collect rows, grouped by payer for separate Availity uploads.
  var groupedRows = {};
  var totalCount = 0, skipped = 0;

  rows.forEach(function (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 2 || !cells[idx.patient]) { skipped++; return; }

    var patientText = (cells[idx.patient].innerText || '').trim();
    if (!patientText) { skipped++; return; }

    // The Patient cell stacks name, DOB, MRN, PMS ID on separate
    // lines. Take the first line for name; regex-match anywhere
    // for DOB. This is robust to whatever separator the cell uses.
    var firstLine = patientText.split(/[\n\r]/)[0].trim();
    var commaPos = firstLine.indexOf(',');
    var last  = commaPos >= 0 ? firstLine.slice(0, commaPos).trim() : firstLine;
    var first = commaPos >= 0 ? firstLine.slice(commaPos + 1).trim().split(/\s+/)[0] : '';

    var dobMatch = patientText.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    var dob = dobMatch ? dobMatch[0] : '';

    var member = idx.policy !== undefined && cells[idx.policy]
      ? (cells[idx.policy].innerText || '').trim() : '';
    var payer = idx.payer !== undefined && cells[idx.payer]
      ? (cells[idx.payer].innerText || '').trim() : '';

    if (!payer) payer = 'UNKNOWN';

    if (!groupedRows[payer]) groupedRows[payer] = [];
    groupedRows[payer].push({last: last, first: first, dob: dob, member: member, payer: payer});
    totalCount++;
  });

  if (totalCount === 0) {
    console.log('ERROR: 0 rows extracted. Skipped ' + skipped + ' empty rows.');
    return;
  }

  // CSV-escape any field containing a comma or quote.
  function esc(v) {
    if (v == null) return '';
    v = String(v).replace(/\r?\n/g, ' ').trim();
    if (v.indexOf(',') !== -1 || v.indexOf('"') !== -1) {
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  }

  // Sanitize the payer name for use as a filename.
  function sanitize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  var payers = Object.keys(groupedRows);
  console.log('=== EXTRACTION SUMMARY ===');
  console.log('Total patients: ' + totalCount);
  console.log('Distinct payers: ' + payers.length);
  payers.forEach(function (p) {
    console.log('  ' + p + ': ' + groupedRows[p].length + ' patient(s)');
  });
  console.log('=== TRIGGERING DOWNLOADS ===');

  // Stagger downloads by 300ms each to avoid Chrome's multi-download throttling.
  payers.forEach(function (payer, i) {
    setTimeout(function () {
      var csv = 'last_name,first_name,dob,member_id,payer,provider_npi\n';
      groupedRows[payer].forEach(function (r) {
        csv += [esc(r.last), esc(r.first), esc(r.dob), esc(r.member), esc(r.payer), esc(DEFAULT_NPI)].join(',') + '\n';
      });

      var blob = new Blob([csv], { type: 'text/csv' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'availity_' + sanitize(payer) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log('  Downloaded: ' + a.download + ' (' + groupedRows[payer].length + ' row(s))');
    }, i * 300);
  });

  console.log('Next step: log into Availity Essentials and upload each CSV separately under Eligibility & Benefits → Batch.');
})();
