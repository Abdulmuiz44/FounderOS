import { getGASignals } from '../signals/ga.js';
import { getHubSpotSignals } from '../signals/hubspot.js';
import { getGitHubSignals } from '../signals/github.js';
import { detectPatterns } from '../patterns/detectPatterns.js';
import { generateInsightCandidates } from '../insights/generateInsightCandidates.js';
import { callLLM } from '../../services/llm.js';
import { FounderBrief } from '../../types/brief.js';

export async function generateFounderBrief(): Promise<FounderBrief> {
  // a) Collect real signals (asynchronously)
  const signals = [
    ...(await getGASignals()),
    ...(await getHubSpotSignals()),
    ...(await getGitHubSignals())
  ];

  // b) Detect patterns
  const patterns = detectPatterns(signals);

  // c) Generate insight candidates
  const insights = generateInsightCandidates(patterns);

  // d) Pass structured data to callLLM
  const rawResponse = await callLLM({
    signals,
    patterns,
    insights
  });

  // e) Parse the raw markdown response into FounderBrief object
  return parseBrief(rawResponse);
}

function parseBrief(raw: string): FounderBrief {
  const sections = raw.split('# ').filter(s => s.trim().length > 0);
  
  let executiveSummary = '';
  let keyObservations: string[] = [];
  let meaning = '';
  let founderFocus: string[] = [];

  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();

    if (title.includes('executive summary')) {
      executiveSummary = content;
    } else if (title.includes('key observations')) {
      keyObservations = lines.slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.replace('-', '').trim());
    } else if (title.includes('likely means')) {
      meaning = content;
    } else if (title.includes('founder focus')) {
      founderFocus = lines.slice(1)
        .filter(l => /^\d+\./.test(l.trim()))
        .map(l => l.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim());
    }
  });

  return {
    executiveSummary,
    keyObservations,
    meaning,
    founderFocus
  };
}