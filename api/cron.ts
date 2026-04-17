import { generateBuilderBrief } from '../src/core/engine/generateBuilderBrief';
import { sendBriefEmail } from '../src/services/email';
import { saveBriefToDB } from '../src/services/db';

export default async function handler(request: any, response: any) {
  console.log("--------------------------------------------------");
  console.log(`  FounderOS Vercel Cron - ${new Date().toISOString()}`);
  console.log("--------------------------------------------------\n");

  try {
    console.log("🔄 Generating Builder Brief...");
    const brief = await generateBuilderBrief();

    console.log("💾 Saving to Database...");
    if (process.env.FOUNDER_EMAIL) {
      await saveBriefToDB(brief, process.env.FOUNDER_EMAIL);
    } else {
      console.warn("Skipping DB save: FOUNDER_EMAIL not set");
    }

    console.log("📨 Sending email...");
    await sendBriefEmail(brief);

    console.log("✅ Workflow completed.");
    return response.status(200).json({ success: true, message: "Brief generated, saved, and sent." });

  } catch (error: any) {
    console.error("❌ Critical failure in weekly job:", error);
    return response.status(500).json({ success: false, error: error.message });
  }
}
