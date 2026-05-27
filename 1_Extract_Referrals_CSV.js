// ============================================================
// ModMed Referrals -> Availity Batch Eligibility CSV
// ============================================================
// Extracts referred-patient demographics from the ModMed
// Referrals / New Patient task view and writes a CSV in the
// exact column order Availity Essentials expects for batch
// eligibility verification.
//
// PREREQUISITES
//   1. Be on the ModMed Referrals (or New-Patient task) page
//      in Chrome, filtered to whatever date range you want
//      verified (e.g. "Next 7 days").
//   2. Set pagination to show ALL rows, not 10 per page.
//   3. Open Chrome Developer Console:
//        Cmd+Option+J (Mac)  /  Ctrl+Shift+J (Windows)
//      Chrome may show a paste warning. Type:
//        allow pasting
//      and press Enter.
//   4. Paste this entire script into the console and hit Enter.
//
// OUTPUT
//   Downloads a file called  availity_batch.csv  to your
//   Downloads folder, with the columns:
//
//   last_name, first_name, dob, member_id, payer, provider_npi
//
// HIPAA
//   This script runs ENTIRELY in your local browser. No patient
//   data is transmitted anywhere. The CSV writes to your local
//   Downloads folder. The next step (Availity batch upload) is
//   the first place PHI leaves your machine -- and Availity is
//   a HIPAA-covered vendor with a signed BAA.
//
// ADAPTING THIS SCRIPT
//   If your EMR is not ModMed, you do not need to rewrite this
//   by hand. Paste this script + the companion AI Reference PDF
//   into Claude or another modern AI, tell it your EMR, and ask
//   it to adapt the DOM walk to your system. See the Adaptation
//   section of the AI Reference for details.
// ============================================================

(function () {
  var DEFAULT_NPI = '';   // Optional: set your provider NPI here, e.g. '1234567890'
                          // Availity will accept a blank NPI column and use
                          // the default associated with your account.

  var table = document.querySelector('.p-datatable-table');
  if (!table) {
    console.log('ERROR: Cannot find referrals table. Are you on the Referrals page with the table visible?');
    return;
  }

  var rows = table.querySelectorAll('tbody tr');
  if (rows.length === 0) {
    console.log('ERROR: Table found, but no rows. Check your filter and pagination.');
    return;
  }

  // Column header indices vary by ModMed configuration.
  // We look up by header text rather than hard-coding indices.
  var headerCells = table.querySelectorAll('thead th');
  var idx = {};
  headerCells.forEach(function (th, i) {
    var label = (th.innerText || '').trim().toLowerCase();
    if (label.indexOf('name') !== -1 && idx.name === undefined) idx.name = i;
    if (label.indexOf('dob') !== -1 || label.indexOf('birth') !== -1) idx.dob = i;
    if (label.indexOf('member') !== -1 || label.indexOf('insurance id') !== -1) idx.member = i;
    if (label.indexOf('payer') !== -1 || label.indexOf('insurance') !== -1) idx.payer = i;
  });

  if (idx.name === undefined) {
    console.log('ERROR: Could not locate a Name column. Inspect headers manually:',
                Array.from(headerCells).map(function (th) { return th.innerText; }));
    return;
  }

  var csv = 'last_name,first_name,dob,member_id,payer,provider_npi\n';
  var count = 0;
  var skipped = 0;

  rows.forEach(function (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 2) { skipped++; return; }

    var nameText = (cells[idx.name] && cells[idx.name].innerText || '').trim();
    if (!nameText) { skipped++; return; }

    // Names typically render as "Last, First M" -- split on the first comma.
    var commaPos = nameText.indexOf(',');
    var last  = commaPos >= 0 ? nameText.slice(0, commaPos).trim() : nameText;
    var first = commaPos >= 0 ? nameText.slice(commaPos + 1).trim().split(/\s+/)[0] : '';

    var dob    = idx.dob    !== undefined ? (cells[idx.dob].innerText    || '').trim() : '';
    var member = idx.member !== undefined ? (cells[idx.member].innerText || '').trim() : '';
    var payer  = idx.payer  !== undefined ? (cells[idx.payer].innerText  || '').trim() : '';

    // CSV-escape any embedded commas or quotes by wrapping in quotes.
    function esc(v) {
      if (v == null) return '';
      v = String(v).replace(/\r?\n/g, ' ').trim();
      if (v.indexOf(',') !== -1 || v.indexOf('"') !== -1) {
        return '"' + v.replace(/"/g, '""') + '"';
      }
      return v;
    }

    csv += [esc(last), esc(first), esc(dob), esc(member), esc(payer), esc(DEFAULT_NPI)].join(',') + '\n';
    count++;
  });

  if (count === 0) {
    console.log('ERROR: 0 rows extracted. Skipped ' + skipped + ' empty rows. Check pagination and filter.');
    return;
  }

  var blob = new Blob([csv], { type: 'text/csv' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'availity_batch.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log('Wrote availity_batch.csv with ' + count + ' patient rows (' + skipped + ' skipped).');
  console.log('Next step: log in to Availity Essentials and upload this file under Eligibility & Benefits -> Batch.');
})();
