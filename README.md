Insurance Verification + Patient Cost Estimate Workflow
A three-phase workflow for solo and small-group practices to automate insurance eligibility verification and patient cost estimation, end to end, without dedicated staff.

Companion to the upcoming Doximity Op-Med article "I Use Doximity Ask to Run My Practice With Zero Employees" (link added when the article publishes) and the Medium walkthrough with the prompt and scripts.
What's in this repo
File
What it is
1_Extract_Referrals_CSV.js
Browser-console script that walks a ModMed referrals table and writes an Availity-formatted CSV. Adapt to your EMR with the AI Reference below.
Availity_Batch_Upload_Template.csv
The exact column format Availity Essentials expects for batch eligibility intake.
Sample_Availity_Output.csv
A de-identified sample of what Availity returns after a batch run. Use this to test the prompt before running real data.
DoxGPT_Prompt_Template.md
The Doximity Ask cost-estimate prompt with four clearly marked sections you customize for your practice.
Cost_Estimate_Tutorial.pdf
Step-by-step human walkthrough of all three phases. Start here.
AI_Reference_DoxGPT_Pipeline.pdf
The architecture reference you paste into Claude or another modern AI if your EMR / clearinghouse / LLM is different from the worked example.
LICENSE
MIT.

