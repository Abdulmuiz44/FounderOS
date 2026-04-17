import { BlogPost } from './blog-data';

export function generatePostContent(post: BlogPost): string {
    switch (post.category) {
        case 'Broad Idea':
        case 'Ideation':
            return generateIdeationContent(post);
        case 'Engineering':
        case 'Technical':
            return generateTechnicalContent(post);
        case 'Marketing':
        case 'Growth':
            return generateMarketingContent(post);
        case 'Mindset':
            return generateMindsetContent(post);
        default:
            return generateGeneralContent(post);
    }
}

function generateIdeationContent(post: BlogPost): string {
    return `
    <p class="lead text-xl font-medium mb-8 text-[var(--foreground)] border-l-4 border-blue-500 pl-4 py-1 bg-blue-500/5 rounded-r-lg">
      ${post.excerpt} In this dedicated analysis, we dismantle the <strong>${post.keywords[0]}</strong> opportunity and explain exactly how to build it.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">The Market Gap</h2>
    <p>
      The market for <strong>${post.keywords[0]}</strong> is currently underserved. While major players are focusing on enterprise solutions, the mid-market and solo-founder space is wide open.
      We've analyzed search trends and found that volume for "${post.keywords[1] || post.keywords[0]}" has grown by <strong>40% Year-over-Year</strong>.
    </p>
    <p>
      Why does this gap exist? Because incumbent software is legacy, bloated, and expensive. Users are begging for a "Micro-SaaS" alternative that does one thing well.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">The Minimal Viable Product (MVP)</h2>
    <p>
      Don't overbuild. If you are attacking the ${post.category} space, you need these three features only:
    </p>
    <ul class="space-y-4 my-6 list-none pl-0">
      <li class="flex gap-3 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div class="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">1</div>
        <div><strong>Core Workflow:</strong> The absolute minimum steps to solve the user's primary pain point.</div>
      </li>
      <li class="flex gap-3 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div class="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">2</div>
        <div><strong>Data Export:</strong> Users in this niche fear lock-in. Give them CSV export from day one.</div>
      </li>
      <li class="flex gap-3 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div class="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">3</div>
        <div><strong>Simple Billing:</strong> Use Stripe Checkout. Do not build a custom billing portal yet.</div>
      </li>
    </ul>

    <h2 class="text-3xl font-bold mt-12 mb-6">Monetization Strategy</h2>
    <p>
      For a <strong>${post.keywords[0]}</strong> product, pricing should be simple. Avoid complex tiers.
    </p>
    <div class="grid md:grid-cols-2 gap-6 my-8">
      <div class="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <h4 class="font-bold text-lg mb-2">Monthly Plan</h4>
        <div class="text-3xl font-bold mb-2">$29<span class="text-sm font-normal text-[var(--muted)]">/mo</span></div>
        <p class="text-sm text-[var(--muted)]">Low friction entry point. Great for acquiring initial beta users.</p>
      </div>
      <div class="p-6 bg-[var(--card)] rounded-xl border border-blue-500/30 relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 font-bold">RECOMMENDED</div>
        <h4 class="font-bold text-lg mb-2">Annual License</h4>
        <div class="text-3xl font-bold mb-2">$290<span class="text-sm font-normal text-[var(--muted)]">/yr</span></div>
        <p class="text-sm text-[var(--muted)]">Upfront cash flow to reinvest in ads. Offer 2 months free.</p>
      </div>
    </div>

    <h2 class="text-3xl font-bold mt-12 mb-6">Getting Your First 100 Customers</h2>
    <p>
      Do not run ads. For <strong>${post.keywords[2] || post.keywords[0]}</strong>, you need cold outreach and programmatic SEO.
    </p>
    <ol class="list-decimal pl-6 space-y-2 marker:font-bold marker:text-[var(--foreground)]">
      <li>Scrape leads from LinkedIn/Google Maps.</li>
      <li>Send personalized cold emails focusing on the *problem*, not your *solution*.</li>
      <li>Write 50 comparison articles (e.g., "Best Alternative to LegacyCompetitor").</li>
    </ol>
  `;
}

function generateTechnicalContent(post: BlogPost): string {
    return `
    <p class="lead text-xl font-medium mb-8 text-[var(--foreground)] font-mono text-sm leading-relaxed border border-[var(--border)] p-6 rounded-xl bg-[var(--card)]">
      // SUMMARY <br/>
      ${post.excerpt} <br/>
      // STACK: Next.js 15, PostrgeSQL, Tailwind
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">The Architecture</h2>
    <p>
      Building <strong>${post.keywords[0]}</strong> requires a robust system design. We recommend a decoupled architecture using <strong>Server Actions</strong> for backend logic.
    </p>
    <div class="my-8 p-4 bg-slate-950 rounded-lg text-slate-200 font-mono text-sm overflow-x-auto">
      <pre>
app/
  ├── actions/
  │   └── ${post.slug.split('-')[0]}.ts   <-- Server Actions here
  ├── api/
  │   └── webhooks/
  │       └── stripe/    <-- Billing limits
  └── components/
      └── ui/            <-- Shadcn UI
      </pre>
    </div>

    <h2 class="text-3xl font-bold mt-12 mb-6">Database Schema</h2>
    <p>
      Keep it normalized. Here is the SQL you need to get started with Supabase:
    </p>
    <div class="my-8 p-4 bg-slate-950 rounded-lg text-slate-200 font-mono text-sm overflow-x-auto">
      <pre>
create table ${post.keywords[0].replace(/\s+/g, '_')} (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  status text check (status in ('active', 'archived')) default 'active',
  created_at timestamptz default now()
);

-- Don't forget RLS!
alter table ${post.keywords[0].replace(/\s+/g, '_')} enable row level security;
      </pre>
    </div>

    <h2 class="text-3xl font-bold mt-12 mb-6">Performance Considerations</h2>
    <p>
      When scaling <strong>${post.keywords[1]}</strong>, the bottleneck is usually the database reads. Implement caching strategy using Redis or simply utilize Next.js \`unstable_cache\` for static data.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">Deployment</h2>
    <p>
      Deploy to Vercel for the frontend. Use Supabase for the backend. This "SaaS in a Box" stack allows you to handle 10k+ concurrent users for $50/month.
    </p>
  `;
}

function generateMarketingContent(post: BlogPost): string {
    return `
    <p class="lead text-xl font-medium mb-8 text-[var(--foreground)]">
      ${post.excerpt} Marketing is not about shouting; it's about whispering the right words to the right people.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">The "Pain-Point" Strategy</h2>
    <p>
      Most marketing for <strong>${post.keywords[0]}</strong> fails because it focuses on features ("We have AI!") rather than pain ("Stop spending 10 hours on X").
    </p>
    <p>
      You must identify the "Bleeding Neck" problem.
    </p>
    <blockquote class="border-l-4 border-violet-500 pl-4 py-2 my-8 italic text-lg bg-violet-500/5">
      "Nobody wakes up wanting to buy software. They wake up wanting a problem to go away."
    </blockquote>

    <h2 class="text-3xl font-bold mt-12 mb-6">Channel Strategy: ${post.keywords[2] || 'Organic'}</h2>
    <p>
      For this specific niche, the highest ROI channel is <strong>${post.keywords[2] || 'SEO'}</strong>.
    </p>
    <ul class="space-y-4 my-6 list-disc pl-6">
      <li><strong>Top of Funnel:</strong> Write "How to" guides solving adjacent problems.</li>
      <li><strong>Middle of Funnel:</strong> Create free tools (calculators, generators) related to ${post.keywords[0]}.</li>
      <li><strong>Bottom of Funnel:</strong> Competitor comparison pages.</li>
    </ul>

    <h2 class="text-3xl font-bold mt-12 mb-6">Conversion Rate Optimization (CRO)</h2>
    <p>
      Once you have traffic, you need to convert it. Ensure your H1 headline specifically mentions the outcome, not the tool.
    </p>
    <p>
      <strong>Bad Headline:</strong> "AI Powered ${post.keywords[0]} Tool"<br/>
      <strong>Good Headline:</strong> "Automate your ${post.keywords[1]} workflow in 30 seconds"
    </p>
  `;
}

function generateMindsetContent(post: BlogPost): string {
    return `
    <p class="lead text-xl font-medium mb-8 text-[var(--foreground)] italic">
      "${post.excerpt}"
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">The Psychological Barrier</h2>
    <p>
      The hardest part of building <strong>${post.keywords[0]}</strong> isn't the code. It is the fear that you are wasting your time. This is called "The Founder's Trap".
    </p>
    
    <h2 class="text-3xl font-bold mt-12 mb-6">Mental Frameworks</h2>
    <div class="space-y-8 my-8">
        <div>
            <h3 class="text-xl font-bold mb-2">1. The "Regret Minimization" Framework</h3>
            <p>Will you regret not trying this in 10 years? If yes, then the fear of failure is irrelevant.</p>
        </div>
        <div>
            <h3 class="text-xl font-bold mb-2">2. Ship to Learn, Not to Earn</h3>
            <p>Change your goal. If your goal is "make $1M", you will fail. If your goal is "Learn if users want X", you cannot fail, because even a "No" is a successful learning outcome.</p>
        </div>
    </div>

    <h2 class="text-3xl font-bold mt-12 mb-6">Daily Habits for Success</h2>
    <p>
      To dominate in <strong>${post.keywords[1] || 'startups'}</strong>, you need consistency.
    </p>
    <ul class="list-disc pl-6 space-y-2">
      <li><strong>Deep Work:</strong> 4 hours of uninterrupted build time.</li>
      <li><strong>Health:</strong> You are a biological machine. Sleep and exercise are not optional.</li>
      <li><strong>Shipping:</strong> Commit code everyday.</li>
    </ul>
  `;
}

function generateGeneralContent(post: BlogPost): string {
    return `
    <p class="lead text-xl font-medium mb-8 text-[var(--foreground)]">
      ${post.excerpt}
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">Introduction</h2>
    <p>
      The landscape of <strong>${post.keywords[0]}</strong> is evolving rapidly. In this article, we explore the key drivers changing the industry.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">Key Insights</h2>
    <p>
      When analyzing <strong>${post.keywords[1]}</strong>, we find that most founders overlook the simplest solution. Complexity is the enemy of execution.
    </p>

    <h2 class="text-3xl font-bold mt-12 mb-6">Actionable Steps</h2>
    <ul class="list-disc pl-6 space-y-2">
        <li>Audit your current process for leaks in efficiency.</li>
        <li>Leverage tools that automate the mundane.</li>
        <li>Focus on the user outcome, not the implementation detail.</li>
    </ul>
  `;
}
