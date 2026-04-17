import { FounderProfile } from '../types';

export const PROMPTS = {
  GENERATE_OPPORTUNITIES: (profile: FounderProfile) => `
    Generate 3 unique, viable, and high-potential micro-SaaS or niche startup opportunities based on this founder's profile.
    
    # Founder Profile
    - Interests: ${profile.interests.join(', ')}
    - Skills: ${profile.skills.join(', ')}
    - Budget: ${profile.budget}
    - Time Available: ${profile.hoursPerWeek} hours/week
    - Location: ${profile.location}
    - Preference: ${profile.preference}
    - Business Model Preference: ${profile.businessModelPreference || 'Any'}
    - Revenue Goal: ${profile.revenueGoal || 'Not specified'}
    - Key Problem Space/Industry: ${profile.problemSpace || 'General'}
    - Unfair Advantage/Expertise: ${profile.unfairAdvantage || 'None specified'}
    - Daily Frustrations (Personal Pain): ${profile.dailyFrustrations || 'None specified'}
    - Recent Trends/Excitement (Why Now): ${profile.recentExcitement || 'None specified'}

    # Output Format
    Return a JSON array where each object has:
    - title: string
    - problemStatement: string (Clear, painful problem)
    - targetNiche: string (Specific audience)
    - marketGap: string (Why existing solutions fail)
    - whyNow: string (Market timing)
    - buyerPersona: string (Who writes the check)
  `,

  VALIDATE_OPPORTUNITY: (opportunity: any) => `
    Act as a full validation intelligence engine for startup ideas.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problem_statement}
    Target Niche: ${opportunity.target_niche}
    Market Gap Claim: ${opportunity.market_gap}
    Why Now: ${opportunity.why_now}
    Buyer Persona: ${opportunity.buyer_persona}
    
    # Task
    Use web research, market research reasoning, competitor analysis, demand assessment, and monetization analysis to validate the idea as deeply as possible.
    Be evidence-driven, skeptical, and concrete.

    # Validation Requirements
    1. Search for current market evidence and demand signals.
    2. Identify real direct or adjacent competitors where possible.
    3. Explain whether the market is crowded, fragmented, or underserved.
    4. Assess monetization potential and likely price sensitivity.
    5. Assess MVP complexity and operational burden.
    6. Infer founder fit only from the idea details provided.
    7. Produce a decisive verdict and practical next validation experiments.

    # Output Format
    Return valid JSON only.
    {
      "verdict": "STRONG" | "PROMISING" | "WEAK" | "DO_NOT_BUILD_YET",
      "confidence": number,
      "executiveSummary": "string",
      "demandScore": number,
      "competitionScore": number,
      "monetizationScore": number,
      "complexityScore": number,
      "founderFitScore": number,
      "demandAnalysis": "string",
      "competitionAnalysis": "string",
      "monetizationAnalysis": "string",
      "complexityAnalysis": "string",
      "founderFitAnalysis": "string",
      "marketSizeSummary": "string",
      "demandSignals": [
        {
          "signal": "string",
          "strength": "HIGH" | "MEDIUM" | "LOW",
          "evidence": "string"
        }
      ],
      "marketResearch": ["string"],
      "competitors": [
        {
          "name": "string",
          "url": "string",
          "positioning": "string",
          "targetAudience": "string",
          "pricingHint": "string",
          "strength": "string",
          "weakness": "string",
          "differentiationOpportunity": "string"
        }
      ],
      "customerSegments": ["string"],
      "monetizationInsights": ["string"],
      "launchChannels": ["string"],
      "risks": [
        {
          "risk": "string",
          "severity": "HIGH" | "MEDIUM" | "LOW",
          "mitigation": "string"
        }
      ],
      "validationExperiments": [
        {
          "experiment": "string",
          "goal": "string",
          "execution": "string",
          "successMetric": "string"
        }
      ],
      "searchQueries": ["string"],
      "sources": [
        {
          "title": "string",
          "url": "string",
          "publisher": "string",
          "evidence": "string"
        }
      ]
    }
  `,

  MONETIZATION_MAP: (opportunity: any) => `
    Act as a Chief Revenue Officer. Design the optimal monetization strategy for this business.
    
    # Opportunity
    ${JSON.stringify(opportunity)}
    
    # Output Format (JSON)
    {
      "revenueModel": "Subscription" | "Transactional" | "Freemium" | "Licensing",
      "pricingStrategy": "Brief description of pricing tiers (e.g. $29/mo for Basic)",
      "estimatedArpu": number (Average Revenue Per User in USD),
      "timeToRevenue": "string (e.g. '3 months')",
      "secondaryStreams": ["string", "string"]
    }
  `,

  EXECUTION_PLAN: (opportunity: any) => `
    Act as a CTO and Product Manager. Create a step-by-step execution plan to reach MVP.
    
    # Opportunity
    ${JSON.stringify(opportunity)}
    
    # Output Format (JSON)
    {
      "mvpFeatures": [
        { "feature": "string", "priority": "HIGH", "complexity": "EASY" }
      ],
      "techStack": [
        { "name": "string", "reason": "string", "category": "FRONTEND" }
      ],
      "goToMarket": [
        { "step": "string", "channel": "string", "timeline": "Week 1-2" }
      ]
    }
  `,

  MOM_TEST_SCRIPT: (opportunity: any) => `
    Act as an expert user researcher following "The Mom Test" methodology. Generate a user interview script to validate this opportunity.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problem_statement}
    Target Audience: ${opportunity.target_niche}
    
    # Rules
    1. Do NOT ask "Would you use this?" (that's a bad question).
    2. Focus on past behaviors and specific examples.
    3. Uncover the "pain" and "workarounds".
    4. Keep questions conversational.

    # Output Format (JSON)
    {
      "screenerQuestions": ["string", "string"],
      "deepDiveQuestions": [
        { "question": "string", "goal": "What we want to learn" }
      ],
      "redFlags": ["string" (e.g. "If they say X, they are not a customer")]
    }
  `,

  COMPETITOR_SPY: (opportunity: any) => `
    Act as a competitive intelligence analyst. Identify 3-5 potential competitors (direct or indirect) for this startup idea and analyze them.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problem_statement}
    Target Audience: ${opportunity.target_niche}
    Market Gap: ${opportunity.market_gap}
    
    # Goal
    Find existing players that solve this problem and explain how we can win.

    # Output Format (JSON)
    {
      "competitors": [
        {
          "name": "string (Company Name or 'Excel/Sheets')",
          "url": "string (optional valid URL if known, else null)",
          "strength": "What they do well",
          "weakness": "What they are missing or do poorly",
          "differentiationOpportunity": "How this startup beats them"
        }
      ],
      "marketGapSummary": "A concise summary of the open space in the market."
    }
  `,

  WAITLIST_PAGE: (opportunity: any) => `
    Act as a high-conversion copywriter. Create content for a pre-launch waitlist page for this startup.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problem_statement}
    Target Audience: ${opportunity.target_niche}
    
    # Goal
    Convince visitors to give their email address. Use the "benefit-first" approach and tap into deep psychological triggers.

    # Output Format (JSON)
    {
      "headline": "Punchy, value-driven main heading (H1) that stops the scroll",
      "subheadline": "Explanation of how it solves the problem (H2) and why it's different",
      "ctaText": "Action-oriented button text (e.g. 'Get Early Access to the Future of X')",
      "benefits": [
        { "title": "Benefit Title", "description": "Compelling explanation of the value" }
      ],
      "viralMechanic": "A specific idea to make them share (e.g. 'Move up the queue by inviting friends')"
    }
  `,

  MARKETING_COPY: (opportunity: any) => `
    Act as a World-Class Direct Response Copywriter (think Eugene Schwartz meets Gary Halbert). 
    Generate a comprehensive, high-conversion marketing copy suite for this startup.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problem_statement}
    Target Audience: ${opportunity.target_niche}
    
    # Task
    Generate long-form copy for the Homepage, About, Pricing, and Dashboard onboarding. 
    Focus on:
    - Agitating the problem.
    - Painting the dream scenario.
    - Removing risk with clarity.
    - Establishing authority.

    # Output Format (JSON)
    {
      "homepage": {
        "hero": { "headline": "string", "subheadline": "string", "cta": "string" },
        "problem": { "title": "Agitate the Pain", "description": "Vivid description of the current frustration" },
        "solution": { "title": "The Better Way", "description": "How this solution changes everything" },
        "features": [
          { "title": "Feature Name", "description": "What it does", "benefit": "Why it matters (The 'So What?')" }
        ],
        "testimonials_simulated": [
          { "quote": "Compelling simulated testimonial", "author": "Persona Name", "role": "Specific Job Title" }
        ],
        "faq": [
          { "question": "Objection-handling question", "answer": "Reassuring, authoritative answer" }
        ]
      },
      "about": {
        "mission": "Big, bold mission statement",
        "story": "The 'Origin Story' - why this was built and the problem we're obsessed with solving",
        "values": ["Value 1", "Value 2", "Value 3"]
      },
      "pricing": {
        "strategy": "Explanation of the value-based pricing logic",
        "tiers": [
          { "name": "Basic/Pro/Scale", "price": "$X/mo", "features": ["Feature 1", "Feature 2"], "recommended": boolean }
        ]
      },
      "dashboard_onboarding": {
        "welcome_message": "Warm, action-oriented welcome for new users",
        "setup_steps": [
          { "step": "Step 1 Title", "description": "Clear instruction to get their first 'Win'" }
        ]
      }
    }
  `
};
