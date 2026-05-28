# DoxGPT Cost-Estimate Prompt — Template

This is the prompt that turns a row of Availity eligibility data into a structured patient cost estimate. Paste it into DoxGPT, then paste the Availity row (or attach the Availity output PDF) right below it, then hit Ask.

DoxGPT runs on a HIPAA Business Associate Agreement signed by Doximity, so PHI in this workflow stays inside the BAA chain — Availity → DoxGPT → your screen. No PHI passes through any non-covered AI service.

The template below is the working structure used by a solo ophthalmology practice. To adapt it to your practice you only need to change four sections, all clearly marked: **PRACTICE NAME**, **PRACTICE POLICY**, **FEE SCHEDULE**, and **PLANNED PROCEDURES**. Everything else — the calculation logic, the flag rules, the output shape — works as written.

> **⚠️ IMPORTANT — ABOUT THE FEE SCHEDULE EXAMPLE BELOW:**
>
> The rate values in the example fee schedule are **illustrative placeholders, not real contracted rates from any insurance carrier**. They are intended to demonstrate the data format only. You **must** replace every value with your own contracted allowables before using this prompt for real patient cost estimation. Sharing real contracted private-payer rates publicly may violate the confidentiality terms of your insurance contracts.

---

## How to use it

1. Open DoxGPT (doximity.com → GPT) and click **New Chat**.
2. Paste the prompt below from `You are` through `front-desk summary.` in one go.
3. Immediately after the prompt, paste the patient's row from your Availity batch output — or click the paperclip and attach the Availity PDF.
4. Hit **Ask**.

DoxGPT returns: a per-procedure breakdown, the total to collect up front today, any flags requiring staff review, and a one-line front-desk-ready summary.

If your paste introduces newlines that auto-submit each line, paste into TextEdit / Notes first, do Find & Replace on newlines (Match Regex → replace `\n` with a space), then re-paste into DoxGPT.

---

## The prompt — copy from `You are` through `front-desk summary.`

> You are a professional medical biller for **[PRACTICE NAME — e.g. a solo ophthalmology practice in your city]**. Your job: for the patient below, compute the amount the practice should collect up front today, assuming every planned procedure may be performed.
>
> **PRACTICE POLICY:** Collect up front for any amount the patient would be expected to owe based on deductible remaining, co-insurance, copay, and OOP remaining. If any planned procedure has Auth Required or Auth Info Unknown, flag for staff review. If member status is not Active Coverage, flag for rescheduling.
>
> **FEE SCHEDULE (allowables, $) — CPT, Description, Self-Pay, Payer A, Payer B:**
>
> *⚠️ ILLUSTRATIVE PLACEHOLDERS — not real contracted rates. Replace every value with your own contracted allowables before production use. Keep the column order. Add or remove payer columns to match the carriers you contract with.*
>
> 92004,New PT OV,300,180,165; 92014,Est PT OV,200,120,110; 92250,Fundus,80,50,40; 92134,OCT M,80,50,40; 92133,OCT N,80,50,40; 92136,IOL M,80,50,40; 92025,Topo,80,50,40; 92886,Spec,80,50,40; 92083,HVF,150,90,80; 76514,Pachy,50,30,25; 92020,Gonio,50,30,25; 76512,B Scan,80,60,50; 66821,YAG Cap,700,420,380; 66761,YAG PI,700,400,360; 67031,YAG Vitreo,700,450,420; 68761,Punctal Plugs,250,150,140; 66984,CE SX,1200,700,650; 66982,CE SX Complex,1500,900,850; 65800,Paracentesis,250,150,140; 65426,Pterygia SX,1500,800,750; 65778,AMT,2000,1500,1400.
>
> **INSURANCE FALLBACK:** If the patient's insurance is not in the columns above, use the most conservative (highest) allowable column you have for that procedure, or set a default fallback column in your own prompt.
>
> **CALCULATION:**
> 1. Look up allowable for the patient's insurance column.
> 2. If deductible not met, amount_owed += min(allowable, deductible_remaining) per procedure.
> 3. After deductible: amount_owed += allowable × (coinsurance% / 100) + copay.
> 4. Cap visit total at OOP_max_remaining.
>
> **PLANNED PROCEDURES (worst-case bundle for autonomous estimate; refund any non-performed):**
> *Replace with the procedures you commonly bundle. The worst-case approach overestimates collection and refunds the difference — which is the conservative posture both for compliance and for patient trust.*
>
> 92004 New PT OV, 92014 Est PT OV, 92083 HVF, 66821 YAG Cap, 66761 YAG PI, 92025 Topo, 92886 Spec, 92136 IOL M, 76512 B Scan, 92134 OCT M.
>
> **NOTE:** 92004 / 92014 are mutually exclusive (only one per visit) and 66821 / 66761 are mutually exclusive — show breakdown for all, then collect the higher-total scenario.
>
> **OUTPUT:** Patient summary line; per-procedure breakdown (code, description, allowable, applied to deductible, coinsurance, copay, owed); total to collect up front today (showing both scenarios and the conservative higher one); flags (auth review, etc.); one-line front-desk summary.

---

## Customization checklist

Before you run this in production, edit the four bracketed sections:

1. **PRACTICE NAME** — your practice name and specialty. This anchors the model in your specialty's billing conventions.
2. **FEE SCHEDULE** — replace **every** example value with your own contracted allowables. The example rates are illustrative placeholders only. Format: `CPT,Description,SelfPay,Payer1,Payer2,...`. Add columns to match the carriers you actually contract with. Use real payer names (e.g. "Aetna PPO", "BCBS HMO") in YOUR private copy — do not publish or share your real rates externally, as private-payer allowables are confidential under most contracts.
3. **PLANNED PROCEDURES** — replace the bundle with the procedures you commonly perform at a typical visit. If different visit types have different bundles, consider saving multiple template versions (e.g. `New Patient Bundle`, `Post-Op Bundle`, `Glaucoma Workup Bundle`).
4. **NOTE on mutually exclusive procedures** — list any of your bundled procedures that cannot both be billed for the same visit, so the model knows to show two scenarios and recommend the conservative one.

---

## Why the prompt is structured this way

A few choices in this prompt matter more than they look:

**The fee schedule lives in the prompt, not in DoxGPT's memory.** Every run uses the exact schedule you paste. There is no risk of drift between what the model "knows" and what your contracts actually say.

**The insurance fallback for uncontracted payers** prevents the model from hallucinating an allowable for a carrier it has no data on. The most conservative column is a reasonable default that protects against under-collection.

**Worst-case planned bundle + refund posture** lets the model give one number instead of a probabilistic range. Practices that try to estimate only the procedures likely to happen end up under-collecting on visits where more procedures are needed. Over-collect, then refund what you don't perform.

**The mutually exclusive procedures clause** keeps the model from double-counting CPTs that cannot both bill at the same visit. Without it, the estimate inflates by the cost of the cheaper option.

**Flag rules for Auth Required and Inactive coverage** keep the model from inventing a number when it shouldn't. If the patient needs prior auth or has lapsed coverage, the only correct output is "flag for staff review" — not a confident dollar amount.

These five guardrails are what separate a usable cost estimator from a hallucinating one. They are the IP of the prompt.

---

## A note on data going into DoxGPT

DoxGPT operates under Doximity's HIPAA BAA. PHI sent to DoxGPT stays in the BAA chain.

What does NOT stay in the chain:

- Pasting the Availity row into a generic ChatGPT, Claude, Gemini, or Grok account. Personal accounts on those services do not have BAAs that cover individual physician use.
- Sharing the DoxGPT output via personal Gmail, iMessage, or any other channel that does not have a signed BAA with your practice.

The chain is only as strong as its weakest link. Module 10 of the full course covers how to set up a HIPAA-compliant email so the cost-estimate output can move through your practice without breaking the chain.

---

## A note on sharing this template

You may freely share this template, fork it, modify it for your specialty, and redistribute it. What you should **not** do is publish your own filled-in version with your real contracted private-payer allowables. Those rates are confidential under your contracts. Keep your filled-in version private — in a personal note, an encrypted password manager, or a Doximity Ask saved-prompt — and share only the template structure.

---

*Companion to: Lesson 5.3 — DoxGPT Cost Analysis Prompt.*
