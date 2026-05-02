import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — CompareTheInstructor",
  description: "How CompareTheInstructor collects, uses, and protects your personal data under UK GDPR.",
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <Nav />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">Legal</p>
            <h1 className="text-4xl font-extrabold text-navy-700 mb-3">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: May 2026</p>
          </div>

          {/* 1. Who we are */}
          <Section title="1. Who We Are">
            <p>
              CompareTheInstructor (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a driving instructor matching service
              operating at <strong>comparetheinstructor.co.uk</strong>. We connect learner drivers in the UK with
              local, DVSA-approved driving instructors based on their individual preferences, budget, and
              availability.
            </p>
            <p>
              For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection
              Act 2018, CompareTheInstructor is the <strong>data controller</strong> responsible for your
              personal data.
            </p>
            <p>
              If you have any questions about this policy or how we handle your data, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-500 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          {/* 2. What data we collect */}
          <Section title="2. What Data We Collect">
            <p>When you use our matching service, we collect the following personal data:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong>Full name</strong> — to personalise your match and allow instructors to address you correctly</li>
              <li><strong>Email address</strong> — to send your matching confirmation and keep you informed</li>
              <li><strong>Phone number</strong> — so your matched instructor can contact you directly</li>
              <li><strong>Postcode</strong> — to match you with instructors in your local area</li>
              <li><strong>Lesson preferences</strong> — including vehicle type and any specific requirements</li>
              <li><strong>Confidence / experience level</strong> — so we can match you with an instructor suited to your stage of learning</li>
              <li><strong>Availability</strong> — the days and times you prefer for lessons</li>
              <li><strong>Budget</strong> — your preferred price range per lesson</li>
            </ul>
            <p className="mt-2">
              We also collect limited technical data automatically when you visit our site, such as your IP
              address, browser type, and pages visited. This is used solely for security, analytics, and to
              improve our service.
            </p>
          </Section>

          {/* 3. How we use your data */}
          <Section title="3. How We Use Your Data">
            <p>We use your personal data for the following purposes and on the following legal bases:</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-navy-50 text-navy-700">
                    <th className="text-left p-3 rounded-tl-lg font-semibold">Purpose</th>
                    <th className="text-left p-3 rounded-tr-lg font-semibold">Legal Basis (UK GDPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Matching you with a suitable driving instructor", "Performance of a contract (Article 6(1)(b))"],
                    ["Processing your £3.99 matching fee via Stripe", "Performance of a contract (Article 6(1)(b))"],
                    ["Sending you a matching confirmation by email", "Performance of a contract (Article 6(1)(b))"],
                    ["Sharing your details with your matched instructor", "Performance of a contract (Article 6(1)(b))"],
                    ["Complying with legal and financial obligations", "Legal obligation (Article 6(1)(c))"],
                    ["Improving our website and service", "Legitimate interests (Article 6(1)(f))"],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 align-top">{purpose}</td>
                      <td className="p-3 align-top text-gray-500">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              We will never use your data for unsolicited marketing without your explicit consent. We do not
              sell your personal data to any third party.
            </p>
          </Section>

          {/* 4. Stripe payment processing */}
          <Section title="4. Stripe Payment Processing">
            <p>
              Payments on CompareTheInstructor are processed securely by{" "}
              <strong>Stripe, Inc.</strong> and its European affiliate, Stripe Payments Europe, Limited.
              When you pay the £3.99 matching fee, you are directed to Stripe&apos;s hosted payment page.
            </p>
            <p>
              Stripe collects and processes your payment card details, billing information, and other data
              necessary to complete your transaction. <strong>We do not store or have access to your full
              card number, CVV, or other sensitive payment details.</strong> Stripe is certified to PCI-DSS
              Level 1, the highest standard for payment security.
            </p>
            <p>
              Stripe&apos;s use of your data is governed by their own Privacy Policy, available at{" "}
              <span className="text-orange-500">stripe.com/gb/privacy</span>. Stripe acts as an independent
              data controller for the payment data it processes.
            </p>
          </Section>

          {/* 5. Who we share data with */}
          <Section title="5. Who We Share Your Data With">
            <p>
              We share your personal data only where necessary and with appropriate safeguards in place:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Your matched driving instructor</strong> — We share your name, phone number, email,
                postcode, lesson preferences, experience level, availability, and budget with the instructor(s)
                we match you with. This is the core purpose of the service. Instructors are independent
                professionals and are responsible for their own compliance with data protection law when
                handling your contact details.
              </li>
              <li>
                <strong>Stripe</strong> — For payment processing as described in Section 4.
              </li>
              <li>
                <strong>Service providers</strong> — We may use trusted third-party providers (e.g., cloud
                hosting, email delivery) who process data on our behalf under binding data processing
                agreements. They may only use your data to provide services to us.
              </li>
              <li>
                <strong>Legal authorities</strong> — We may disclose data if required to do so by law or
                in response to a valid legal request from a public authority.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or trade your personal data with any third party for marketing purposes.
            </p>
          </Section>

          {/* 6. How long we keep data */}
          <Section title="6. How Long We Keep Your Data">
            <p>
              We retain your personal data only for as long as necessary to fulfil the purposes for which it
              was collected, or as required by law:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>
                <strong>Matching and contact information</strong> — retained for up to <strong>12 months</strong>{" "}
                from the date of your match, to allow us to handle any queries or disputes arising from the
                matching process.
              </li>
              <li>
                <strong>Payment records</strong> — retained for <strong>7 years</strong> to comply with HMRC
                financial record-keeping obligations.
              </li>
              <li>
                <strong>Website analytics and log data</strong> — retained for up to <strong>26 months</strong>,
                after which it is anonymised or deleted.
              </li>
            </ul>
            <p className="mt-3">
              Once data is no longer required, we will securely delete or anonymise it so it can no longer
              be linked to you.
            </p>
          </Section>

          {/* 7. Your rights under GDPR */}
          <Section title="7. Your Rights Under UK GDPR">
            <p>
              Under UK GDPR, you have the following rights in relation to your personal data. To exercise any
              of these rights, please contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-500 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              . We will respond within <strong>30 days</strong>.
            </p>
            <div className="space-y-3 mt-3">
              {[
                ["Right of access", "You can request a copy of the personal data we hold about you (a Subject Access Request)."],
                ["Right to rectification", "You can ask us to correct inaccurate or incomplete data we hold about you."],
                ["Right to erasure", "You can ask us to delete your personal data where we have no compelling reason to continue processing it."],
                ["Right to restriction", "You can ask us to temporarily stop processing your data while a dispute is resolved."],
                ["Right to data portability", "You can request your data in a structured, machine-readable format to transfer to another service."],
                ["Right to object", "You can object to processing based on legitimate interests. We will stop unless we have compelling legitimate grounds."],
                ["Rights related to automated decision-making", "We do not make solely automated decisions that have a legal or similarly significant effect on you."],
              ].map(([right, desc]) => (
                <div key={right} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <p><strong>{right}</strong> — {desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 p-4 bg-navy-50 rounded-xl text-sm">
              You also have the right to lodge a complaint with the{" "}
              <strong>Information Commissioner&apos;s Office (ICO)</strong> — the UK&apos;s supervisory authority for
              data protection — at <span className="text-orange-500">ico.org.uk</span> or by calling{" "}
              <strong>0303 123 1113</strong>.
            </p>
          </Section>

          {/* 8. Cookies */}
          <Section title="8. Cookies">
            <p>
              Our website uses cookies and similar technologies to ensure it functions correctly and to
              understand how visitors use the site. We use the following types of cookies:
            </p>
            <div className="space-y-3 mt-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-navy-700 mb-1">Strictly necessary cookies</p>
                <p>
                  These are essential for the website to work. They enable core functionality such as security,
                  form submission, and navigation. You cannot opt out of these.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-navy-700 mb-1">Analytics cookies</p>
                <p>
                  We use analytics tools (such as Google Analytics) to understand how visitors interact with
                  our site. These cookies collect anonymised data about pages visited, time on site, and
                  referral sources. You can opt out via your browser settings or a cookie preference tool.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-navy-700 mb-1">Payment cookies (Stripe)</p>
                <p>
                  When you proceed to payment, Stripe may set cookies to facilitate a secure transaction and
                  prevent fraud. These are governed by Stripe&apos;s own cookie policy.
                </p>
              </div>
            </div>
            <p className="mt-3">
              Most browsers allow you to refuse or delete cookies. Please note that disabling certain cookies
              may affect the functionality of our website. For more information, visit{" "}
              <span className="text-orange-500">aboutcookies.org</span>.
            </p>
          </Section>

          {/* 9. Contact us */}
          <Section title="9. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle
              your personal data, please get in touch:
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
              We aim to respond to all data-related enquiries within <strong>30 days</strong>. If your
              request is complex or you have made multiple requests, we may extend this period by a further
              two months, but we will inform you of this extension within the first 30 days.
            </p>
            <p className="mt-3">
              This policy may be updated from time to time. Any significant changes will be posted on this
              page with a revised &quot;last updated&quot; date at the top. We encourage you to review this policy
              periodically.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
