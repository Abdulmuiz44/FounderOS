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
    Act as a relentless Venture Capital Validator. Analyze this startup opportunity and provide a brutal, honest scoring.
    
    # Opportunity
    Title: ${opportunity.title}
    Problem: ${opportunity.problemStatement}
    Target: ${opportunity.targetNiche}
    
    # Task
    Score the opportunity on 5 dimensions (0-100) and provide critical analysis.
    
    # Dimensions
    1. Demand Score: Is there urgent pain?
    2. Competition Score: Is the market saturated? (Higher score = LESS competition/More winning chance)
    3. Monetization Score: Can you easily charge for this?
    4. Complexity Score: How hard to build MVP? (Higher score = EASIER)
    5. Founder Fit Score: Based on implied skills needed.
    
    # Output Format (JSON)
    {
      "demandScore": number,
      "competitionScore": number,
      "monetizationScore": number,
      "complexityScore": number,
      "founderFitScore": number,
      "analysis": {
        "demand": "explanation...",
        "competition": "explanation...",
        "monetization": "explanation...",
        "complexity": "explanation...",
        "founderFit": "explanation..."
      }
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
    Convince visitors to give their email address. Use the "benefit-first" approach.

    # Output Format (JSON)
    {
      "headline": "Punchy, value-driven main heading (H1)",
      "subheadline": "Explanation of how it solves the problem (H2)",
      "ctaText": "Action-oriented button text (e.g. 'Join the Private Beta')",
      "benefits": [
        { "title": "Benefit 1", "description": "Short explanation" },
        { "title": "Benefit 2", "description": "Short explanation" },
        { "title": "Benefit 3", "description": "Short explanation" }
      ],
      "viralMechanic": "A specific idea to make them share (e.g. 'Get early access if you refer 3 friends')"
    }
  `
};
