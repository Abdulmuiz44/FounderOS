import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="font-bold">FounderOS</Link>
            </nav>
            <main className="max-w-3xl mx-auto px-6 py-12 prose prose-sm dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p>Last updated: February 2026</p>

                <h3>1. Information Collection</h3>
                <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, payment method, and other information you choose to provide.</p>

                <h3>2. How We Use Your Information</h3>
                <p>We use the information we collect to provider, maintain, and improve our services, such as to:</p>
                <ul>
                    <li>Process payments and send receipts.</li>
                    <li>Send you technical notices, updates, security alerts, and support messages.</li>
                    <li>Respond to your comments, questions, and customer service requests.</li>
                </ul>

                <h3>3. Data Security</h3>
                <p>We implement reasonable security practices and procedures to help protect the confidentiality and security of your information, including encryption of data in transit and at rest.</p>

                <h3>4. No AI Training</h3>
                <p>We explicitly do NOT use your private build logs, idea data, or validation reports to train our foundation models. Your intellectual property remains yours.</p>
            </main>
            <Footer />
        </div>
    );
}
