import { generateFounderBrief } from '../src/core/engine/generateFounderBrief.js';
import { sendBriefEmail } from '../src/services/email.js';

export default async function handler(request: any, response: any) {
  console.log("--------------------------------------------------");
  console.log(`  FounderOS Vercel Cron - ${new Date().toISOString()}`);
  console.log("--------------------------------------------------\n");

  try {
    // Basic security check (optional but recommended)
    // const authHeader = request.headers['authorization'];
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return response.status(401).json({ success: false });
    // }

    console.log("🔄 Generating Founder Brief...");
    const brief = await generateFounderBrief();
    
    console.log("📨 Sending email...");
    await sendBriefEmail(brief);
    
    console.log("✅ Workflow completed.");
    return response.status(200).json({ success: true, message: "Brief generated and sent." });

  } catch (error: any) {
    console.error("❌ Critical failure in weekly job:", error);
    return response.status(500).json({ success: false, error: error.message });
  }
}
