# Insurance Verification + Patient Cost Estimate Workflow

A three-phase workflow for solo and small-group practices to automate insurance eligibility verification and patient cost estimation, end to end, without dedicated staff.

Companion to the upcoming Doximity Op-Med article *"I Use Doximity Ask to Run My Practice With Zero Employees"* (link added when the article publishes) and the [Medium walkthrough with the prompt and scripts](https://medium.com/@orenfass/the-doximity-ask-prompt-that-verifies-my-patients-insurance-and-estimates-their-fees-yours-to-7cbb0d0b249e).

## What's in this repo

| File | What it is |
|---|---|
| `1_Extract_Referrals_CSV.js` | Browser-console script that walks a ModMed referrals table and writes an Availity-formatted CSV. Adapt to your EMR with the AI Reference below. |
| `Availity_Batch_Upload_Template.csv` | The exact column format Availity Essentials expects for batch eligibility intake. |
| `Sample_Availity_Output.csv` | A de-identified sample of what Availity returns after a batch run. Use this to test the prompt before running real data. |
| `DoxGPT_Prompt_Template.md` | The Doximity Ask cost-estimate prompt with four clearly marked sections you customize for your practice. |
| `Cost_Estimate_Tutorial.pdf` | Step-by-step human walkthrough of all three phases. Start here. |
| `AI_Reference_DoxGPT_Pipeline.pdf` | The architecture reference you paste into Claude or another modern AI if your EMR / clearinghouse / LLM is different from the worked example. |
| `LICENSE` | MIT. |

## Quick start

1. Read `Cost_Estimate_Tutorial.pdf` end to end.
2. Open `DoxGPT_Prompt_Template.md` and edit the four bracketed sections to match your practice (practice name, fee schedule, planned procedures, mutually-exclusive procedures).
3. Run the workflow once on a single patient using a row from `Sample_Availity_Output.csv` to verify your customized prompt produces the output shape you want.
4. Run on a real patient batch from your own EMR.

## Adapting to a different EMR or LLM

If you do not use ModMed + Availity + Doximity Ask, paste `AI_Reference_DoxGPT_Pipeline.pdf` into Claude or another modern AI along with the name of your EMR, your clearinghouse, and your HIPAA-covered LLM. The AI now has a working architectural blueprint to adapt rather than inventing one from scratch.

## HIPAA

PHI in this workflow stays inside three BAA-covered vendors — your EMR, your clearinghouse (Availity in the worked example), and Doximity Ask. Do not paste Availity output into personal ChatGPT / Claude / Gemini / Grok accounts. Do not email Availity output through personal Gmail.

The browser-console script in `1_Extract_Referrals_CSV.js` runs entirely on your local machine inside your already-logged-in EMR session — no PHI leaves your browser. The first place PHI moves off your machine is the Availity batch upload, which is BAA-covered.

## License

MIT. Take it. Modify it. Ship it. Attribution welcome but not required.

## Related resources

- Doximity Op-Med article — the narrative behind why I built this (link added when the article publishes)
- [Medium walkthrough](https://medium.com/@orenfass/the-doximity-ask-prompt-that-verifies-my-patients-insurance-and-estimates-their-fees-yours-to-7cbb0d0b249e) — the prompt and scripts with full context
- *The Autonomous Practice Blueprint* — guided course with video walkthroughs and the rest of the automations (link added soon)
- *The Autonomous Physician* (book) — [available on Amazon](https://www.amazon.com/dp/B0GX32PL2X)

---

*Oren Fass, MD — Denton Eye Consultants, Denton, Texas*
