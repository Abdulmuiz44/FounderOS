import { generateFounderBrief } from './core/engine/generateFounderBrief';
import { sendBriefEmail } from './services/email';

async function runWeeklyJob() {
  console.log("--------------------------------------------------");
  console.log(`  FounderOS Weekly Job - ${new Date().toISOString()}`);
  console.log("--------------------------------------------------\n");

  try {
    console.log("🔄 Generating Founder Brief...");
    const brief = await generateFounderBrief();
    console.log("✅ Brief generated successfully.");

    console.log("📨 Sending email...");
    await sendBriefEmail(brief);
    console.log("✅ Workflow completed.");

  } catch (error) {
    console.error("❌ Critical failure in weekly job:", error);
    process.exit(1);
  }
}

// Execute the job
runWeeklyJob();
