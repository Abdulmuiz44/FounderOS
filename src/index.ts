import { getGASignals } from './core/signals/ga';
import { getHubSpotSignals } from './core/signals/hubspot';
import { getGitHubSignals } from './core/signals/github';
import { generateBuilderBrief } from './core/engine/generateBuilderBrief';

async function main() {
  console.log("--------------------------------------------------");
  console.log("  FounderOS v1.0 - The OS for AI Builders       ");
  console.log("--------------------------------------------------\n");

  try {
    // Show data being processed
    const signals = [
      ...(await getGASignals()),
      ...(await getHubSpotSignals()),
      ...(await getGitHubSignals())
    ];

    console.log("📊 LIVE SIGNALS COLLECTED:");
    console.table(signals.map(s => ({
      Source: s.source,
      Metric: s.metric,
      Current: s.current,
      Previous: s.previous,
      Delta: `${s.deltaPercent}%`,
      Dir: s.direction,
      Severity: s.severity
    })));
    console.log("\n");

    const brief = await generateBuilderBrief();

    console.log("📄 EXECUTIVE SUMMARY");
    console.log(brief.executiveSummary);
    console.log("\n");

    console.log("🔍 KEY OBSERVATIONS");
    brief.keyObservations.forEach((obs: string) => console.log(`• ${obs}`));
    console.log("\n");

    console.log("🧠 WHAT THIS LIKELY MEANS");
    console.log(brief.meaning);
    console.log("\n");

    console.log("🎯 FOUNDER FOCUS (NEXT 7 DAYS)");
    brief.founderFocus.forEach((focus: string, i: number) => console.log(`${i + 1}. ${focus}`));
    console.log("\n");

  } catch (error) {
    console.error("Error generating brief:", error);
  }
}

main();