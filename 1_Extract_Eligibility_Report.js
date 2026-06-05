// ============================================================
// ModMed Eligibility Report -> Availity Batch Paste-Box (.txt)
// ============================================================
// Extracts patient demographics from the ModMed Eligibility
// Report view (Appt Flow → View Eligibility Report) and writes
// one plain-text file per unique payer, formatted for
// Availity Essentials' batch eligibility paste box.
//
// ------------------------------------------------------------
// DISCLAIMER — READ BEFORE USING
// ------------------------------------------------------------
// 1. NOT MEDICAL, LEGAL, OR FINANCIAL ADVICE. This script is
//    provided for educational purposes only. AI-generated cost
//    estimates downstream of this script can be wrong — verify
//    all output with your biller before billing.
//
// 2. PHI RESPONSIBILITY STAYS WITH YOUR PRACTICE. All
//    responsibility for protecting patient health information
//    and complying with HIPAA, payer contracts, and applicable
//    regulations remains with your practice. Do NOT install,
//    modify, or run this script (or any modification of it) in
//    your browser, EMR, clearinghouse account, or any other
//    patient-facing system without first consulting an IT
//    professional and legal counsel thoroughly versed in PHI
//    protection and HIPAA compliance for your jurisdiction and
//    your specific configuration.
// ------------------------------------------------------------
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
//   Downloads ONE plain-text file per unique payer to your
//   Downloads folder. Each file contains ONLY the two fields
//   Availity's batch paste box expects, no header row:
//
//     availity_<payer_slug>.txt
//
//   Example contents (one line per patient):
//     W123456789, 01/15/1962
//     A987654321, 07/22/1948
//     B445566778, 03/03/1971
//
//   Filename examples: availity_medicare.txt, availity_bcbs_ppo.txt
//
//   Workflow: open the file for the payer you're about to
//   submit, Cmd+A → Cmd+C (or Ctrl+A → Ctrl+C), then paste into
//   Availity's batch eligibility paste box for that payer.
//   Because there's no header row, your select-all grabs only
//   data lines — nothing to delete before submitting.
//
//   Why split by payer? Availity's batch endpoint runs one
//   payer's roster at a time. Splitting up front matches
//   Availity's expected workflow.
//
// HIPAA
//   This script runs ENTIRELY in your local browser. No patient
//   data is transmitted anywhere. The text files write to your
//   local Downloads folder. The next step (Availity batch paste)
//   is the first place PHI leaves your machine — and Availity is
//   a HIPAA-covered vendor with a signed BAA.
//
// ADAPTING THIS SCRIPT
//   If your EMR is not ModMed, paste this script + the companion
//   DoximityAsk_AI_to_AI_Guide.pdf into Claude or another modern
//   AI. Tell it the name of your EMR and point at one row's DOM
//   (right-click the row → Inspect → copy outer HTML). The AI
//   can adapt the #reportTable selector and column-mapping
//   logic to your tool.
// ============================================================

(function () {
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

  // Map columns by header text (Payer, Policy Number) and the
  // Patient cell (used to extract DOB).
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
  if (idx.policy === undefined) {
    console.log('ERROR: Could not locate the Policy Number column.');
    return;
  }

  // Collect rows, grouped by payer for separate Availity submissions.
  var groupedRows = {};
  var totalCount = 0, skipped = 0;

  rows.forEach(function (row) {
    var cells = row.querySelectorAll('td');
    if (cells.length < 2 || !cells[idx.patient]) { skipped++; return; }

    var patientText = (cells[idx.patient].innerText || '').trim();
    if (!patientText) { skipped++; return; }

    // The Patient cell stacks name, DOB, MRN, PMS ID on separate
    // lines. Regex-match anywhere for DOB. Robust to whatever
    // separator the cell uses.
    var dobMatch = patientText.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    var dob = dobMatch ? dobMatch[0] : '';

    var member = cells[idx.policy] ? (cells[idx.policy].innerText || '').trim() : '';
    var payer = idx.payer !== undefined && cells[idx.payer]
      ? (cells[idx.payer].innerText || '').trim() : '';

    if (!payer) payer = 'UNKNOWN';
    if (!member || !dob) { skipped++; return; }

    if (!groupedRows[payer]) groupedRows[payer] = [];
    groupedRows[payer].push({ member: member, dob: dob });
    totalCount++;
  });

  if (totalCount === 0) {
    console.log('ERROR: 0 rows extracted. Skipped ' + skipped + ' rows missing member ID or DOB.');
    return;
  }

  // Sanitize the payer name for use as a filename.
  function sanitize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  var payers = Object.keys(groupedRows);
  console.log('=== EXTRACTION SUMMARY ===');
  console.log('Total patients: ' + totalCount);
  console.log('Distinct payers: ' + payers.length);
  if (skipped > 0) {
    console.log('Skipped rows (missing member ID or DOB): ' + skipped);
  }
  payers.forEach(function (p) {
    console.log('  ' + p + ': ' + groupedRows[p].length + ' patient(s)');
  });
  console.log('=== TRIGGERING DOWNLOADS ===');

  // Stagger downloads by 300ms each to avoid Chrome's multi-download throttling.
  payers.forEach(function (payer, i) {
    setTimeout(function () {
      // Plain-text output: one line per patient, "member_id, dob"
      // No header row, so Cmd+A copy from the file grabs only data.
      var lines = groupedRows[payer].map(function (r) {
        return r.member + ', ' + r.dob;
      }).join('\n') + '\n';

      var blob = new Blob([lines], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'availity_' + sanitize(payer) + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log('  Downloaded: ' + a.download + ' (' + groupedRows[payer].length + ' row(s))');
    }, i * 300);
  });

  console.log('Next step: open each .txt file, Cmd+A (or Ctrl+A) to select all, Cmd+C / Ctrl+C to copy, and paste into Availity Essentials\' batch eligibility paste box for that payer (Patient Registration → Eligibility and Benefits → Batch).');
})();
