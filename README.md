# Insurance Verification + Patient Cost Estimate Workflow

A three-phase workflow for solo and small-group practices to automate insurance eligibility verification and patient cost estimation, end to end, without dedicated staff.

Companion to the upcoming Doximity Op-Med article *"I Use Doximity Ask to Run My Practice With Zero Employees"* (link added when the article publishes) and the [Medium walkthrough with the prompt and scripts](https://medium.com/@orenfass/the-doximity-ask-prompt-that-verifies-my-patients-insurance-and-estimates-their-fees-yours-to-7cbb0d0b249e).

## Disclaimer — read before proceeding

**1. Not medical, legal, or financial advice.** This repository and any provided or linked code, handouts, instructions, or lessons are shared for educational purposes only. They do not constitute medical, billing, legal, or financial advice. AI-generated cost estimates can be wrong — verify every output against your fee schedule, the patient's eligibility data, and your in-house biller or billing consultant before relying on it for real billing. The fee schedule example contains illustrative placeholder values, not real contracted rates. The author is a practicing ophthalmologist sharing one example of his workflow, not providing professional advice for your practice.

**2. PHI responsibility stays with your practice.** All responsibility for protecting patient health information (PHI) and complying with HIPAA, payer contracts, plan documents, and applicable regulations remains with your practice. Do not modify your browser, EMR, clearinghouse account, or any other patient-facing system based on this material without first consulting an IT professional and legal counsel who are thoroughly versed in PHI protection and HIPAA compliance for your jurisdiction and your specific configuration.

## How the prompt works — two-prompt design

The cost-estimate tool uses **two prompts**, not one. This separation is what makes the workflow reliable in production.

1. **Setup Prompt (one-time use).** You paste this into Doximity Ask along with your raw fee schedule and practice details. Doximity Ask reads your data, populates the embedded template, and returns a complete **Daily-Use Prompt** with your contracted allowables baked in. You save that returned prompt — in Doximity Ask's Saved Prompts, a password manager, or a private note.
2. **Daily-Use Prompt (per-patient use).** For each patient, in a fresh Doximity Ask session, paste your saved Daily-Use Prompt followed by that patient's Availity benefits report. Doximity Ask returns a per-procedure breakdown, the total to collect up front today, any flags requiring staff review, and a one-line front-desk summary.

You only run the Setup Prompt once. Everything else is daily reuse of the saved prompt. Your contracted rates never leave the chain — they live only in your private saved Daily-Use Prompt.

## What's in this repo

| File | What it is |
|---|---|
| `1_Extract_Eligibility_Report.js` | Browser-console script that walks ModMed's Eligibility Report (Appt Flow → View Eligibility Report) and writes one Availity-formatted CSV per unique payer. Adapt to your EMR with the AI Reference below. |
| `Availity_Batch_Upload_Template.csv` | The exact column format Availity Essentials expects for batch eligibility intake. |
| `Sample_Availity_Output_Medicare.csv` | De-identified sample Availity response for a **traditional Medicare** batch — Active, Pending, Inactive, deductible variations, Plan G and Plan F Medigap edge cases. |
| `Sample_Availity_Output_BCBS_PPO.csv` | De-identified sample Availity response for a **BCBS commercial PPO** batch — varied deductibles, auth-required edge case for outpatient surgery, OOP-nearly-met scenario, Pending, Inactive. |
| `Sample_Availity_Output_Humana_MA_HMO.csv` | De-identified sample Availity response for a **Humana Medicare Advantage HMO** batch — Auth Info Unknown, PCP referral required, $0-copay scenarios, Pending, Inactive. |
| `DoximityAsk_Setup_Prompt.md` | The Setup Prompt you paste into Doximity Ask once, with your raw fee schedule, to generate your personal Daily-Use Prompt. |
| `Cost_Estimate_Tutorial.pdf` | Step-by-step human walkthrough of all three phases, including the one-time Setup → Daily-Use generation step. Start here. |
| `DoximityAsk_AI_to_AI_Guide.pdf` | An **AI-to-AI guide** — paste this into Claude or another modern AI if your EMR / clearinghouse / LLM is different from the worked example. It hands the AI an architectural blueprint to adapt rather than asking it to invent one from scratch. |
| `LICENSE` | MIT. |

## Quick start

1. Read `Cost_Estimate_Tutorial.pdf` end to end.
2. **One-time setup:** open `DoximityAsk_Setup_Prompt.md`, paste it into a fresh Doximity Ask session along with your raw fee schedule and practice details (name, specialty, city, state). Doximity Ask returns your populated Daily-Use Prompt. Save it somewhere you can reopen — Doximity Ask's Saved Prompts, a password manager, or a private encrypted note.
3. **Per-patient use:** in a fresh Doximity Ask session, paste your saved Daily-Use Prompt followed by a row from one of the `Sample_Availity_Output_*.csv` files (Medicare, BCBS PPO, or Humana MA HMO). Confirm the output shape looks right. Run a couple rows from each sample to exercise the different plan-type scenarios (auth required, Pending, Inactive, Medigap).
4. Run on a real patient batch from your own EMR. Validate the first five outputs with your biller before relying on any of them for live collection.

## Adapting to a different EMR or LLM

If you do not use ModMed + Availity + Doximity Ask, paste `DoximityAsk_AI_to_AI_Guide.pdf` into Claude or another modern AI along with the name of your EMR, your clearinghouse, and your HIPAA-covered LLM. The AI now has a working architectural blueprint to adapt rather than inventing one from scratch.

## HIPAA

PHI in this workflow stays inside three BAA-covered vendors — your EMR, your clearinghouse (Availity in the worked example), and Doximity Ask. Do not paste Availity output into personal ChatGPT / Claude / Gemini / Grok accounts. Do not email Availity output through personal Gmail.

The browser-console script in `1_Extract_Eligibility_Report.js` runs entirely on your local machine inside your already-logged-in EMR session — no PHI leaves your browser. The first place PHI moves off your machine is the Availity batch upload, which is BAA-covered.

## License

MIT. Take it. Modify it. Ship it. Attribution welcome but not required.

## Related resources

- Doximity Op-Med article — the narrative behind why I built this (link added when the article publishes)
- [Medium walkthrough](https://medium.com/@orenfass/the-doximity-ask-prompt-that-verifies-my-patients-insurance-and-estimates-their-fees-yours-to-7cbb0d0b249e) — the prompt and scripts with full context
- *The Autonomous Practice Blueprint* — guided course with video walkthroughs and the rest of the automations (link added soon)
- *The Autonomous Physician* (book) — [available on Amazon](https://www.amazon.com/dp/B0GX32PL2X)

---

*Oren Fass, MD — Denton Eye Consultants, Denton, Texas*
