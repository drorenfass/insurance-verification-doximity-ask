# Doximity Ask — Eligibility Cost Calculator — Setup Prompt (Use Once)

This is a **Setup Prompt** for [Doximity Ask](https://www.doximity.com), Doximity's HIPAA-compliant AI. You paste it into Doximity Ask **once**, along with your raw fee schedule and practice details. Doximity Ask reads your data, populates the embedded daily-use template, and returns a complete **Daily-Use Prompt** that you save and reuse with each patient.

The Setup Prompt itself does **not** run any calculations and does **not** ask for an Availity report. Its only job is to take your raw fee schedule and hand you back a personalized Daily-Use Prompt with your data baked in.

## Disclaimer — read before proceeding

**1. Not medical, legal, or financial advice.** This file is shared for educational purposes only and is not a substitute for professional billing, legal, IT, or compliance guidance. AI-generated cost estimates can be wrong — verify every output against your fee schedule, the patient's eligibility data, and your in-house biller or billing consultant before relying on it for real billing.

**2. PHI responsibility stays with your practice.** All responsibility for protecting patient health information (PHI) and complying with HIPAA, payer contracts, plan documents, and applicable regulations remains with your practice. Do not modify your browser, EMR, clearinghouse account, or any other patient-facing system based on this material without first consulting an IT professional and legal counsel who are thoroughly versed in PHI protection and HIPAA compliance for your jurisdiction and your specific configuration.

> **⚠️ IMPORTANT — ABOUT YOUR FEE SCHEDULE:**
>
> The Daily-Use Prompt that Doximity Ask returns will contain your **real contracted allowables**. Those rates are confidential under most insurance contracts and should not be shared, posted, or pasted into any non-BAA-covered tool. Keep the returned Daily-Use Prompt in Doximity Ask's Saved Prompts, a password manager, or a private encrypted note. Do not commit it to a public repo, do not paste it into ChatGPT/Claude/Gemini/Grok personal accounts, and do not email it through personal Gmail.

---

## How to use this Setup Prompt

1. Open Doximity Ask (doximity.com → Ask). Click **+ New Question**.
2. Copy the entire **Setup Prompt block** below (everything between `=== START OF SETUP PROMPT ===` and `=== END OF SETUP PROMPT ===`) and paste it into the chat box.
3. Below the prompt, paste:
   - **Your raw fee schedule** — a table or list with CPT codes, descriptions, and contracted allowables for each payer you bill. Any format is fine: markdown table, CSV-style, text list, or attach a PDF via the paperclip icon.
   - **Your practice details** — practice name, solo/group, specialty, city, state. (Optional. If you skip these, the Daily-Use Prompt comes back with placeholders for you to fill in manually.)
4. Hit **Ask**. Doximity Ask returns your populated Daily-Use Prompt.
5. **Save the returned Daily-Use Prompt.** Use Doximity Ask's Saved Prompts feature, a password manager, or any private encrypted note. This is the file you'll reuse for every patient.

You only run this Setup Prompt once. For each patient after that, open a fresh Doximity Ask session, paste your saved Daily-Use Prompt followed by the patient's Availity report, and hit Ask.

---

## The Setup Prompt — copy everything between the `===` lines below

```
=== START OF SETUP PROMPT ===

INSTRUCTION TO DOXIMITY ASK: You are helping a physician set up a billing-calculator tool. The user has pasted (or attached) their raw fee schedule and possibly some practice details somewhere in this message. Your single task is to generate a complete, ready-to-use prompt for the user — it is given as a template at the bottom of this message. Substitute the user's data into the template and return the populated result back to the user.

DO NOT run any calculations. DO NOT ask the user any questions. DO NOT request an Availity report. DO NOT add commentary before or after the output. DO NOT invent or extrapolate fee schedule data the user did not provide — accuracy here matters more than completeness. Your only output is the populated DAILY-USE PROMPT TEMPLATE below, with the user's actual data substituted into the placeholders.

How to populate the template:

1. Replace [YOUR PRACTICE NAME], [solo/group], [specialty], [City, State] with the user's actual practice details if provided. If any of these are not provided, leave them as placeholders for the user to fill in manually.

2. Replace the empty FEE SCHEDULE table with a populated version containing ONLY data the user has explicitly provided in their raw fee schedule. Specifically:
   - Include a column for each insurance payer the user has actual allowable values for.
   - Do NOT include columns for payers the user did not provide data for, even if those payers are common or implied.
   - Do NOT invent, estimate, copy, or extrapolate allowables. If a row is missing a value for some payer in the user's data, leave that single cell empty (preferably remove the column instead).
   - Do NOT carry values across columns (for example, do not copy BCBS HMO values into a Cigna column because the user didn't provide Cigna data).
   - The INSURANCE FALLBACK rule already handles patients whose payer isn't listed — they'll be routed to the Medicare allowable. So omitting a payer column is the correct, honest behavior; inventing one is a hallucination that risks under- or over-collection.

3. Replace the [List groups...] placeholder in the MUTUALLY EXCLUSIVE CODES line with code pairs you identify from the user's fee schedule. Common ophthalmology examples: 92004 / 92014 (new vs. established comprehensive eye exam — only one per visit); 66984 / 66982 (regular vs. complex cataract surgery on the same eye). If no mutually exclusive pairs apply, write "None apply to this fee schedule."

4. Delete any parenthetical guidance lines under the FEE SCHEDULE table (the lines that begin with "Replace [Payer 1]..." in the template).

5. Return the entire populated daily-use prompt as a single continuous block of text, ready for the user to copy and save. Do not include the "DAILY-USE PROMPT TEMPLATE START / END" markers in your output.

DAILY-USE PROMPT TEMPLATE START — populate the placeholders below and return the result:

DISCLAIMER: This tool produces AI-generated patient cost estimates only. It is not financial, legal, or billing advice. Every case should be reviewed by a qualified medical biller or billing professional before charging the patient. The practice remains responsible for compliance with HIPAA, payer contracts, plan documents, and applicable regulations.

You are a professional medical biller for [YOUR PRACTICE NAME], a [solo/group] [specialty] practice in [City, State]. Your task: using the fee schedule below and the patient's Availity benefits report that follows this prompt, compute the per-procedure cost the patient would owe for every CPT code in the fee schedule, and the conservative total to collect today. Return the OUTPUT sections in the specified order — do not explain or summarize this prompt.

PRACTICE POLICY: Collect the conservative (highest) amount the patient could owe today given their benefits and the fee schedule. The goal is never to undercollect; if fewer codes are actually performed, the patient gets credited later. Always recommend collecting at least the listed visit copay even if the Availity report shows OOP max remaining as $0 or otherwise indicates zero patient responsibility — copay refunds are easier than chasing undercollections, and OOP-cap readings from Availity can be unreliable. Flag any of the following: auth required or auth info unknown, inactive coverage, PCP referral required and not on file, mismatched payer name, OOP max reported as met (verify with patient/plan), or any data needed for the calculation that is missing or ambiguous (state your assumption when this happens).

FEE SCHEDULE (allowables, $) — every CPT code below is treated as a potentially-performed procedure for this patient:

| CPT | Description | Self-Pay | [Payer 1] | [Payer 2] | [Payer 3] |
|-----|-------------|----------|-----------|-----------|-----------|
|     |             |          |           |           |           |

(Replace [Payer 1], [Payer 2], [Payer 3] with the user's actual payer names. Add or remove payer columns as needed to match the user's data. The Self-Pay column is for cash-pay reference only and is not used in the calculation.)

INSURANCE FALLBACK: If the patient's insurance is not in the columns above, use the Medicare allowable.

MUTUALLY EXCLUSIVE CODES: [List groups identified from the fee schedule, e.g., "92004 / 92014 — only one per visit (new vs. established patient comprehensive eye exam)."] For each mutually exclusive group, compute totals for every valid combination; show the breakdown for all combinations, then recommend collection for the combination with the highest patient owed (conservative).

HOW TO CALCULATE: Apply standard US insurance billing principles using the allowables in the fee schedule above (or the Medicare fallback), the patient's deductible / coinsurance / copay / OOP max remaining as reported in the Availity benefits report. Use real-world billing conventions — copays are typically per-visit (not per-procedure) and may differ by service category (office visit, diagnostic, surgery); deductibles deplete sequentially across procedures; OOP max remaining caps the patient's total responsibility for the day, EXCEPT that the listed visit copay should still be recommended for collection per practice policy above. Where the report is ambiguous, apply judgment, state your assumption clearly, and add a flag. When in doubt, default to the outcome that would result in collecting more rather than less.

OUTPUT (return in this exact order, with no preamble):

1. Patient summary line — name, plan, member status, deductible remaining, OOP max remaining.

2. Per-procedure breakdown (table) — for EVERY CPT code in the fee schedule above: code, description, allowable used, what applies to deductible, what applies to coinsurance, copay assigned, owed.

3. Total to collect up front today — for each mutex combination, list contributing line items (allowables, deductible portion, coinsurance portion, copay) and show line-by-line addition leading to the total so a biller can audit the arithmetic. Label the conservative (highest) combination as the amount to collect, assuming every fee-schedule code is performed (worst case).

4. Flags — auth review required, inactive coverage, missing or ambiguous data, mismatched payer name, PCP referral requirement, OOP max reported as met, etc. Include the assumption you made for any flagged item.

5. One-line front-desk summary — a single sentence the front desk can read at a glance (e.g., "Collect $487.32 from Jane Doe today; auth pending for 92133.").

The Availity report follows immediately after this prompt.

DAILY-USE PROMPT TEMPLATE END

User's raw fee schedule and practice details follow below this prompt.

=== END OF SETUP PROMPT ===
```

Below the Setup Prompt, paste your raw fee schedule and practice details.

---

## Tips

- **Newlines auto-submit?** If pasting introduces newlines that submit each line as its own message, attach your fee schedule as a PDF instead (paperclip icon), or paste through TextEdit (Mac) or Notepad (Windows) first and Find & Replace newlines (`\n` → space) before pasting into Doximity Ask.

- **Empty payer columns are a hazard.** Doximity Ask may interpret an empty cell as $0 instead of falling back to Medicare. The Setup Prompt instructs Doximity Ask to omit columns it has no data for, but if any empty columns slip through into your returned Daily-Use Prompt, manually delete them before saving.

- **Validate before relying on it.** Run your Daily-Use Prompt on five real patients and have your biller spot-check the recommended collections. The Daily-Use Prompt's output includes line-by-line math for exactly this purpose.

- **Save separate Daily-Use Prompts for different visit types.** If your fee schedule mixes routine codes with surgical codes, the worst-case total can balloon to include a surgery the patient isn't getting. Consider running the Setup Prompt multiple times — once per visit type (new patient eval, postop, surgery day) — and saving a Daily-Use Prompt for each, with only the codes realistic for that visit type.

---

## Why the prompt is structured this way

Earlier iterations encoded explicit per-procedure billing formulas. Real billing logic is far more complex than any short formula can capture (multi-tier copays, multiple-procedure reductions, NCCI edits, modifier rules, plan carve-outs). The current Setup Prompt trusts Doximity Ask's frontier-model billing knowledge to apply standard principles, while keeping the practice-specific data (fee schedule, mutex codes) and a strict output format. Validate on a handful of your own patients with your biller before relying on it.

Five structural elements in the Daily-Use Prompt matter more than they look:

1. **Fee schedule in the prompt body** — not in Doximity Ask's memory. Every run uses the exact schedule you saved. No drift between what the model "knows" and what your contracts actually say.
2. **Insurance fallback to Medicare** — prevents Doximity Ask from hallucinating an allowable for a payer it has no data on.
3. **Conservative collection posture with refund-after** — single number out, refund anything not performed. Avoids under-collection on visits that grow in scope.
4. **Mutually exclusive procedures clause** — prevents double-counting CPTs that cannot both bill at the same visit.
5. **Flag rules for auth required, inactive coverage, missing data** — the model is instructed to flag for staff review rather than produce a confident dollar amount when the data doesn't support one.

When adapting to a different specialty, you change the fee schedule and the mutex pairs. The five structural elements stay as written.

---

*Companion to: `Cost_Estimate_Tutorial.pdf` (this bundle), `DoximityAsk_AI_to_AI_Guide.pdf` (this bundle), and Module 5 — Insurance Verification & Patient Cost Estimates of the full course.*

*Created by Oren Fass, MD — Denton Eye Consultants*
