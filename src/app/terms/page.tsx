import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="font-bold">FounderOS</Link>
            </nav>
            <main className="max-w-3xl mx-auto px-6 py-12 prose prose-sm dark:prose-invert">
                <h1>Terms of Service</h1>
                <p>Last updated: February 2026</p>
                <p>By using FounderOS ("us", "we", or "our"), you agree to these Terms. Please read them carefully.</p>

                <h3>1. Subscriptions</h3>
                <p>FounderOS is billed on a subscription basis. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.</p>

                <h3>2. Cancellation</h3>
                <p>You may cancel your Subscription renewal either through your online account management page or by contacting our customer support team. You will not receive a refund for the fees you already paid for your current Subscription period.</p>

                <h3>3. Accounts</h3>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                <h3>4. Intellectual Property</h3>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of FounderOS and its licensors.</p>

                <h3>5. Limitation of Liability</h3>
                <p>In no event shall FounderOS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
            </main>
            <Footer />
        </div>
    );
}
