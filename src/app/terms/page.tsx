import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — CompareTheInstructor",
  description: "Terms and conditions for using the CompareTheInstructor driving instructor matching service.",
};

const CONTACT_EMAIL = "info@comparetheinstructor.co.uk";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8 mb-6">
      <h2 className="text-xl font-bold text-navy-700 mb-4">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <Nav />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">Legal</p>
            <h1 className="text-4xl font-extrabold text-navy-700 mb-3">Terms &amp; Conditions</h1>
            <p className="text-gray-500">Last updated: May 2026</p>
          </div>

          {/* 1 */}
          <Section title="1. Introduction">
            <p>
              Welcome to <strong>CompareTheInstructor</strong>, a driving instructor matching service operated
              in the United Kingdom at <strong>comparetheinstructor.co.uk</strong>. These Terms &amp; Conditions
              (&quot;Terms&quot;) govern your access to and use of our website and services.
            </p>
            <p>
              By accessing our website or submitting your details through any of our forms, you confirm that you
              have read, understood, and agree to be bound by these Terms in full. If you do not agree, please
              do not use our service.
            </p>
            <p>
              These Terms should be read alongside our{" "}
              <Link href="/privacy" className="text-orange-500 underline underline-offset-2">
                Privacy Policy
              </Link>
              , which sets out how we handle your personal data.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. The Service">
            <p>
              CompareTheInstructor provides an introduction and matching service that connects learner drivers
              with driving instructors. <strong>We are not a driving school</strong> and do not employ, manage,
              or supervise driving instructors. We act solely as an introduction platform.
            </p>
            <p>We offer two service tiers:</p>
            <div className="space-y-3 mt-1">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-navy-700 mb-1">General Match — Free</p>
                <p>
                  Basic matching by location and lesson type (manual or automatic). We will identify available
                  instructors in your area and make contact within 48 hours. No payment is required.
                </p>
              </div>
              <div className="p-4 bg-navy-50 rounded-xl">
                <p className="font-semibold text-navy-700 mb-1">Perfect Match — £3.99 one-time fee</p>
                <p>
                  Deep matching that takes into account your confidence level, weekly availability, lesson budget,
                  experience level, and preferred teaching style. We will contact you with your matched
                  instructor&apos;s details within 24 hours of your submission.
                </p>
              </div>
            </div>
          </Section>

          {/* 3 */}
          <Section title="3. Payment Terms">
            <p>
              The Perfect Match fee of <strong>£3.99</strong> is a one-time charge payable at the point of
              submission. This fee covers the cost of our matching process and is non-refundable except in the
              circumstances described below.
            </p>
            <p>
              <strong>Refund policy:</strong> If we are unable to identify a suitable instructor match for you,
              we will notify you promptly and issue a full refund of £3.99 within <strong>5–7 business days</strong>{" "}
              to your original payment method.
            </p>
            <p>
              All payments are processed securely by <strong>Stripe</strong>. We do not store, access, or
              retain your card number, CVV, or any other sensitive payment details. Stripe is certified to
              PCI-DSS Level 1 — the highest available standard for payment security.
            </p>
            <p>
              The General Match tier is entirely free of charge. No payment details are required or requested
              for that service tier.
            </p>
          </Section>

          {/* 4 */}
          <Section title="4. What We Promise">
            <p>When you use our service, we commit to the following:</p>
            <ul className="list-disc list-inside space-y-2 mt-1">
              <li>
                <strong>Perfect Match customers:</strong> We will contact you within{" "}
                <strong>24 hours</strong> of your submission with the details of your matched instructor.
              </li>
              <li>
                <strong>General Match customers:</strong> We will contact you within{" "}
                <strong>48 hours</strong> of your submission to advise on available instructors in your area.
              </li>
              <li>
                We only work with instructors who are registered with the{" "}
                <strong>Driver and Vehicle Standards Agency (DVSA)</strong> as Approved Driving Instructors (ADIs)
                or trainee instructors holding a valid PDI licence.
              </li>
              <li>
                If we cannot find a suitable match for you, we will inform you clearly and, where a fee was
                paid, issue a full refund without requiring you to make a claim.
              </li>
            </ul>
          </Section>

          {/* 5 */}
          <Section title="5. What We Don't Promise">
            <p>
              CompareTheInstructor is an introduction service only. We connect learners with instructors, but
              we are not a party to the ongoing relationship between you and your instructor after the initial
              introduction.
            </p>
            <p>We are not responsible for, and make no warranty in relation to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>The quality, conduct, or standard of driving lessons provided by matched instructors</li>
              <li>Any disputes, disagreements, or complaints arising between you and your instructor</li>
              <li>Lesson cancellations, scheduling changes, or instructor availability after introduction</li>
              <li>Your test pass rate or the outcome of any DVSA practical or theory test</li>
              <li>
                The accuracy of any information provided by instructors regarding their availability, pricing,
                or qualifications at the time of matching
              </li>
            </ul>
            <p>
              We encourage you to verify an instructor&apos;s ADI registration independently via the DVSA register
              before commencing lessons.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Your Responsibilities">
            <p>By using our service, you agree to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-1">
              <li>
                Provide accurate, truthful, and up-to-date information when submitting your details through any
                form on our website
              </li>
              <li>
                Be genuinely seeking driving lessons and not submit requests for any other purpose
              </li>
              <li>
                Not submit multiple requests containing false or misleading information with the intent to
                abuse or disrupt our service
              </li>
              <li>
                Be aged <strong>17 or over</strong> — the minimum legal age to take driving lessons on public
                roads in the United Kingdom
              </li>
              <li>
                Respond promptly to contact from matched instructors to facilitate the introduction process
              </li>
            </ul>
            <p>
              We reserve the right to refuse service or cancel a submission if we reasonably believe these
              responsibilities have not been met.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Instructor Network">
            <p>
              All driving instructors in our network are <strong>independent contractors and sole traders</strong>.
              They are not employees, workers, agents, or representatives of CompareTheInstructor. We do not
              control how instructors conduct their lessons, set their prices, or manage their availability.
            </p>
            <p>
              Any contract for the provision of driving lessons is entered into solely between you and the
              instructor directly. CompareTheInstructor is not a party to that contract and accepts no
              liability arising from it.
            </p>
            <p>
              Instructors are required to hold a valid ADI certificate or PDI licence issued by the DVSA at the
              time of registration with our network. However, we cannot guarantee that their credentials remain
              current at all times, and we recommend you verify this independently before commencing lessons.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Data and Privacy">
            <p>
              Your personal data is collected and processed in accordance with our{" "}
              <Link href="/privacy" className="text-orange-500 underline underline-offset-2">
                Privacy Policy
              </Link>
              , which forms part of these Terms and should be read alongside them.
            </p>
            <p>
              By submitting your details through any form on our website, you consent to us sharing your
              contact information (including name, phone number, email address, and postcode) with the
              instructor or instructors we match you with, for the sole purpose of facilitating the
              introduction.
            </p>
            <p>
              Instructors who receive your details are themselves responsible for complying with applicable
              data protection law, including the UK GDPR, in relation to any personal data they receive from us.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Intellectual Property">
            <p>
              All content on this website — including but not limited to the <strong>CompareTheInstructor</strong>{" "}
              name, logo, wordmarks, written copy, design, layout, and functionality — is owned by or licensed
              to CompareTheInstructor and is protected by copyright, trade mark, and other intellectual property
              laws of the United Kingdom.
            </p>
            <p>
              You may view and use our website for personal, non-commercial purposes only. You may not
              reproduce, copy, distribute, republish, download, display, post, or transmit any part of this
              website in any form or by any means without our prior written permission.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, CompareTheInstructor shall not be liable for
              any indirect, incidental, special, consequential, or punitive loss or damage arising out of or
              in connection with your use of our website or service, including but not limited to loss of
              earnings, loss of data, or damage to reputation.
            </p>
            <p>
              Our total aggregate liability to you in connection with any claim arising out of or relating to
              these Terms or your use of the service shall not exceed the total amount paid by you for the
              service — which in all cases is a maximum of <strong>£3.99</strong>.
            </p>
            <p>
              Nothing in these Terms limits or excludes our liability for death or personal injury caused by
              our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot lawfully
              be excluded or limited under English law.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Governing Law">
            <p>
              These Terms and any dispute or claim arising out of or in connection with them (including
              non-contractual disputes or claims) shall be governed by and construed in accordance with the
              laws of <strong>England and Wales</strong>.
            </p>
            <p>
              You agree that the courts of England and Wales shall have exclusive jurisdiction to settle any
              dispute or claim arising out of or in connection with these Terms or their subject matter or
              formation. If you are based in Scotland or Northern Ireland, you may also bring proceedings in
              the courts of those jurisdictions.
            </p>
          </Section>

          {/* 12 */}
          <Section title="12. Changes to These Terms">
            <p>
              We reserve the right to update or amend these Terms at any time. We will post the revised Terms
              on this page with an updated &quot;last updated&quot; date. Where changes are material, we will take
              reasonable steps to notify users.
            </p>
            <p>
              Your continued use of our website or service after any changes have been posted constitutes your
              acceptance of the revised Terms. If you do not agree to the updated Terms, you should stop using
              the service.
            </p>
            <p>
              We encourage you to review these Terms periodically to stay informed of any updates.
            </p>
          </Section>

          {/* 13 */}
          <Section title="13. Contact">
            <p>
              If you have any questions, concerns, or complaints about these Terms or our service, please
              contact us:
            </p>
            <div className="mt-4 p-5 bg-navy-50 rounded-xl space-y-2">
              <p>
                <span className="font-semibold text-navy-700">Company:</span> CompareTheInstructor
              </p>
              <p>
                <span className="font-semibold text-navy-700">Website:</span> comparetheinstructor.co.uk
              </p>
              <p>
                <span className="font-semibold text-navy-700">Email:</span>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-500 underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <p className="mt-4">
              We aim to respond to all enquiries within <strong>5 business days</strong>.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
