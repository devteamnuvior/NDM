/* ---------------------------------------------------------------- legal pages (privacy.html, terms.html, refunds.html; round 32)
   One page per document. Laid out like the promotion page (left-aligned, the site's side padding), with the document switch under
   the title and the site's one sub-menu (SubNav) for "On this page". The privacy text is after the NUVIOR legal sample; the terms and
   the refund policy are written for an Ontario medical aesthetics clinic (round 32). They need a legal review before publishing. */
const LEGAL_DOCS = [['privacy', 'Privacy Policy', 'privacy.html'], ['terms', 'Terms of Service', 'terms.html'], ['refunds', 'Refunds & Cancellations', 'refunds.html']];
const LEGAL = {
  privacy: { lead: 'Privacy', strong: 'Policy', toc: [['s1', 'Confidentiality and Security'], ['s2', 'Purposes'], ['s3', 'Information We Disclose'], ['s4', 'Consent'], ['s5', 'SMS Messaging'], ['s6', 'Sharing Your Information'], ['s7', 'Your Rights'], ['s8', 'Contact']] },
  terms: { lead: 'Terms of', strong: 'Service', toc: [['t1', 'Medical Information'], ['t2', 'Using the Site'], ['t3', 'Bookings and Prices'], ['t4', 'Promotions'], ['t5', 'Payments'], ['t6', 'Products'], ['t7', 'Content and Links'], ['t8', 'Liability'], ['t9', 'Privacy'], ['t10', 'Governing Law'], ['t11', 'Contact']] },
  refunds: { lead: 'Refunds &', strong: 'Cancellations', toc: [['r1', 'Consultations'], ['r2', 'Changing a Treatment'], ['r3', 'Treatments Received'], ['r4', 'Packages'], ['r5', 'Gift Cards'], ['r6', 'Product Returns'], ['r7', 'How Refunds Are Paid'], ['r8', 'Your Rights'], ['r9', 'Contact']] },
};
const LEGAL_UPDATED = 'November 2026';
function LegalBody({ doc }) {
  if (doc === 'terms') return (
        <>
          <p className="lg-lede">These Terms of Service set the rules for using the NewDermaMed website, our online booking and our online shop. By using the site you agree to them. If you do not agree, please do not use the site.</p>
          <p>In these terms, “NewDermaMed”, “we” and “us” mean NewDermaMed and its clinics in Toronto, Ontario. “You” means the person using the site.</p>

          <h2 id="t1">Medical Information</h2>
          <div className="lg-callout"><p>The content on this site is general education. It is not medical advice and it does not create a doctor and patient relationship. Every treatment starts with an in-person consultation, where a licensed practitioner decides whether a treatment is suitable for you. Results vary from person to person and no specific result can be promised. In an emergency, call 911.</p></div>

          <h2 id="t2">Using the Site and Your Account</h2>
          <ul>
            <li>You must be 18 or older to book or buy on the site, or have a parent or guardian do so for you.</li>
            <li>Please give accurate information and keep your account password private. You are responsible for activity under your account; tell us promptly if you think it has been used without your permission.</li>
            <li>Do not misuse the site, for example by trying to access it without permission, interfering with its operation or copying its content for commercial use.</li>
          </ul>

          <h2 id="t3">Bookings and Prices</h2>
          <ul>
            <li>An online booking is a request. It is confirmed only when we confirm it with you by email, text or phone.</li>
            <li>Prices on the site are estimates in Canadian dollars and taxes may apply. Your final price depends on your treatment plan and is agreed with you at your consultation, before any treatment.</li>
            <li>If a price or other detail on the site is shown in error, we may correct it. If the correction changes what you agreed to pay, we will tell you first and you may cancel without charge.</li>
            <li>Cancellations, deposits and refunds are covered by our <a href="refunds.html">Refund and Cancellation Policy</a>.</li>
          </ul>

          <h2 id="t4">Promotions</h2>
          <p>Promotions run for a limited time and while availability lasts. Unless a promotion says otherwise, offers cannot be combined, have no cash value and apply to new bookings only. Each offer follows the terms shown with it, and treatment under any offer still needs a consultation and a practitioner’s approval.</p>

          <h2 id="t5">Payments and Financing</h2>
          <p>Unless we agree otherwise, payment is made at the clinic. Financing is offered by third-party lenders, subject to their approval and their own terms; we are not a party to your financing agreement.</p>

          <h2 id="t6">Products</h2>
          <p>Products are sold for use as directed on their labels or by your practitioner. Some products are only available after a consultation. Returns follow our <a href="refunds.html">Refund and Cancellation Policy</a>.</p>

          <h2 id="t7">Content and Links</h2>
          <p>The text, photos, video and design on this site belong to NewDermaMed or its licensors and may not be copied or reused without our written permission. Links to other websites are for convenience; we are not responsible for their content or practices.</p>

          <h2 id="t8">Limits of Liability</h2>
          <p>We work to keep the site accurate and available, but it is provided “as is” and may change or be unavailable at times. To the extent the law allows, NewDermaMed is not liable for indirect or consequential loss arising from your use of the site. Nothing in these terms limits any liability that cannot be limited by law, or your rights under the Ontario <i>Consumer Protection Act, 2002</i>. Care you receive at our clinics is governed by your consent and treatment records and by the standards of the regulated health professions.</p>

          <h2 id="t9">Privacy</h2>
          <p>How we handle your personal information, including personal health information, is set out in our <a href="privacy.html">Privacy Policy</a>.</p>

          <h2 id="t10">Changes and Governing Law</h2>
          <p>We may update these terms from time to time; the date at the top shows the latest version, and changes apply from that date. These terms are governed by the laws of Ontario and the federal laws of Canada that apply there, and the courts of Ontario sitting in Toronto have jurisdiction.</p>

          <h2 id="t11" className="no-num">Contact</h2>
          <p>Questions about these terms? Email <a href="mailto:info@newdermamed.com">info@newdermamed.com</a>, or call either clinic: Uptown <a href="tel:+14162248800">416-224-8800</a>, Downtown <a href="tel:+14166719766">416-671-9766</a>.</p>
        </>
  );
  if (doc === 'refunds') return (
        <>
          <p className="lg-lede">We want every visit to feel clear and fair. This policy explains how appointment changes, deposits, packages, gift cards and product returns work at NewDermaMed.</p>

          <h2 id="r1">Consultations</h2>
          <p>Consultations are free. You can reschedule or cancel a consultation at any time; we only ask that you let us know as early as you can so another client can use the time.</p>

          <h2 id="r2">Changing or Cancelling a Treatment</h2>
          <ul>
            <li>Please give at least <b>48 hours’ notice</b> to change or cancel a treatment appointment, by phone, email or reply to your reminder.</li>
            <li>Some treatments need a deposit to hold the time. The deposit is applied in full to your treatment, and it is refunded or moved to a new date when you give 48 hours’ notice.</li>
            <li>With less notice, or if you miss the appointment, the deposit may be kept. We will always tell you the deposit amount before you book.</li>
            <li>If we need to change or cancel your appointment, any deposit is moved or refunded in full, as you prefer.</li>
          </ul>

          <h2 id="r3">Treatments Already Received</h2>
          <p>Treatments are medical services provided after your consultation and consent, so treatments already received are not refundable. Results vary from person to person. If you have a concern about your result, please contact us within <b>14 days</b>; your practitioner will review it with you and may recommend a follow-up or adjustment where clinically appropriate.</p>

          <h2 id="r4">Packages and Series</h2>
          <p>Prepaid packages are personal and non-transferable. If you want to stop a package, or your practitioner advises that you should not continue for medical reasons, we will refund the unused part: the amount you paid, less the sessions you have had at the regular single-session price.</p>

          <h2 id="r5">Gift Cards</h2>
          <p>Gift cards do not expire and can be used towards any treatment or product. They are not exchangeable for cash, except where the law requires.</p>

          <h2 id="r6">Product Returns</h2>
          <ul>
            <li>Unopened products in their original packaging can be returned within <b>14 days</b> of purchase with proof of purchase.</li>
            <li>For health and safety reasons, opened skincare and medical products cannot be returned, unless they are faulty.</li>
            <li>If a product is faulty or arrives damaged, tell us within 14 days and we will replace it or refund it.</li>
          </ul>

          <h2 id="r7">How Refunds Are Paid</h2>
          <p>Refunds are paid to the original payment method, usually within 10 business days. Refunds on treatments paid with financing are processed through your lender. Promotional purchases are refunded at the price you paid.</p>

          <h2 id="r8">Your Rights</h2>
          <p>Nothing in this policy limits your rights under the Ontario <i>Consumer Protection Act, 2002</i> or other law that applies to you.</p>

          <h2 id="r9" className="no-num">Contact</h2>
          <p>To change an appointment or ask about a refund, email <a href="mailto:info@newdermamed.com">info@newdermamed.com</a>, or call either clinic: Uptown <a href="tel:+14162248800">416-224-8800</a>, Downtown <a href="tel:+14166719766">416-671-9766</a>.</p>
        </>
  );
  return (
        <>
          <p className="lg-lede">NewDermaMed is committed to protecting the personal information (includes personal health information) that you provide to us.</p>
          <p>This Privacy Notice (“Notice”) explains how we collect, use and disclose your personal information. The information contained in this Notice applies to you if you have visited NewDermaMed, called in or emailed us and provided us with your personal information.</p>

          <h2 id="s1">Confidentiality and Security</h2>
          <div className="lg-callout"><p>We restrict access to your personal information to those employees who need to know that information for the Purpose described below. We maintain physical and electronic safeguards that comply with applicable laws to guard your personal information. To the extent we contract with third party service providers, we ensure that appropriate privacy protection is in place to safeguard against any inadvertent access to your personal information.</p></div>

          <h2 id="s2">Purposes</h2>
          <p>NewDermaMed limits the collection of personal information to that which is necessary to fulfill the Purpose identified and in accordance with the requirements set out by applicable law.</p>
          <p>Personal information is collected directly from you, unless the law permits or requires collection from third parties, custodians or other healthcare providers.</p>
          <p>We may collect the following personal information from you:</p>
          <ul>
            <li>relating to your physical or mental health, including information that consists of the health history of your family;</li>
            <li>relating to the provision of health care, including the identification of a person as a provider of health care to you;</li>
            <li>relating to payments or eligibility for health care, or eligibility for coverage of health care;</li>
            <li>relating to the donation of any bodily substance or derived from the testing or examination of any bodily substance;</li>
            <li>relating to your health number; and</li>
            <li>relating to a person who is acting on your behalf for treatment purposes (or your next-of-kin, if appropriate).</li>
          </ul>
          <p>In each case we use this personal information for the Purpose, and as otherwise permitted or required by applicable law.</p>

          <h2 id="s3">Information We Disclose</h2>
          <p>NewDermaMed operates within the Circle of Care model. This means that implied consent is assumed when providing health care or assisting in providing health care within the Circle of Care (to a health information custodian or to a person who is responsible for providing continuing treatment and care to you). This is unless NewDermaMed is aware that you have specifically withdrawn or withheld your consent.</p>
          <p>Further, we will disclose your personal information to institutions, persons or entities that are not part of the Circle of Care (not for the purposes of providing direct health care) only if you give us express consent to do so. We will only collect, use and disclose your personal information as permitted or required by applicable law.</p>

          <h2 id="s4">Consent</h2>
          <p>Where you do not wish us to collect, use or disclose your personal information for specified purposes, you can opt out from such collection, use and disclosure. Please let us know and we will duly incorporate the lock-box (consent directive) in your health record. The files (could be physical or electronic) containing your personal information will be securely maintained by NewDermaMed and its authorized employees or agents who need to access the information in the administration and provision of the services we provide to you.</p>

          <h2 id="s5">SMS Messaging and TCR Compliance</h2>
          <p>In accordance with TCR (Transparency, Choice, and Responsibility) requirements, we strictly adhere to carrier SMS policies to ensure the responsible and compliant use of SMS messaging. This includes the following practices:</p>
          <ul>
            <li><b>Consent for SMS Communications:</b> We will only send SMS messages to individuals who have explicitly opted in to receive such communications. This consent is obtained through a clear and transparent process, where you are informed about the type of messages you will receive and how often.</li>
            <li><b>Purpose of SMS Communications:</b> SMS messages may be used for transactional updates, reminders, promotional content, or other relevant information. The purpose of the messages will be clearly stated at the time of consent.</li>
            <li><b>Opt-Out Mechanism:</b> You can opt out of receiving SMS messages at any time by following the instructions provided in the message or by contacting us directly. We will promptly honor all opt-out requests.</li>
            <li><b>Data Retention for SMS Consent:</b> We maintain records of your consent for SMS communications to comply with carrier requirements and to ensure transparency in our practices.</li>
          </ul>
          <p>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</p>

          <h2 id="s6">Sharing Your Information</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
          <ul>
            <li><b>With Service Providers:</b> We may share your information with trusted service providers who assist us in operating our Website and conducting our business, including SMS service providers.</li>
            <li><b>For Legal Compliance:</b> We may disclose your information to comply with legal obligations, protect our rights, or respond to lawful requests.</li>
          </ul>

          <h2 id="s7">Your Rights</h2>
          <p>You have a right to access and rectify the information contained in a file held about you.</p>
          <h3>Access to Your Information</h3>
          <p>To obtain formal access to your information, you must make a request to NewDermaMed in writing. We may ask for you to provide us with further information to process the request or ask that you pay a fee for processing the request as set out in the applicable legislation.</p>
          <p>We will make every reasonable effort to assist you and to respond openly, accurately and completely.</p>
          <p>We will create a record for you if:</p>
          <ul>
            <li>it can be created from information that is in electronic form and it is in our custody or control, using normal computer hardware and software and technical expertise, and</li>
            <li>creating the record would not unreasonably interfere with the operations of NewDermaMed.</li>
          </ul>
          <p>We may refuse to disclose information to you, if:</p>
          <ol className="lg-alpha">
            <li>the record is subject to a legal privilege that restricts disclosure;</li>
            <li>another Act or a court order prohibits disclosure;</li>
            <li>the information was collected or created primarily in anticipation of use in a proceeding, and the proceeding (including appeals) have not been concluded;</li>
            <li>the following conditions are met:<ol className="lg-roman"><li>the information was collected in the course of an inspection, investigation or similar procedure, and</li><li>the inspection, investigation, or similar procedure have not been concluded;</li></ol></li>
            <li>granting the access could reasonably be expected to,<ol className="lg-roman"><li>result in a risk of serious harm to you or another person,</li><li>lead to the identification of a person who was required by law to provide information in the record to us, or</li><li>lead to the identification of a person who provided information in the record to us in confidence.</li></ol></li>
          </ol>
          <p>Please note that under the law, we must make every reasonable effort to respond to a request within a set number of days after receiving the request or within any extended period.</p>
          <p>Nothing prevents NewDermaMed from granting you access to your personal information if you make an oral request or an informal request.</p>
          <h3>Correction or Amendment of Your Information</h3>
          <p>If you believe there is an error or omission in your information, you may request in writing that we amend the information.</p>
          <p>We must respond to a request to correct a record within a set number of days as set out in the applicable legislation, or seek an extended period of time.</p>
          <p>We also have the right to refuse to make the correction or amendment as set out by law. If we refuse to make the correction or amendment, we will provide you with written notice, including the reasons for the refusal.</p>
          <p>We can refuse to make a correction or amendment that has been requested in respect of:</p>
          <ol className="lg-alpha"><li>a professional opinion or observation made by a health services provider about you, or</li><li>a record that was not originally created by NewDermaMed.</li></ol>
          <p>If we refuse to correct a record, you can either:</p>
          <ol className="lg-alpha" style={{ counterReset: 'lg 2' }}><li>ask for a review of the NewDermaMed decision by the Commissioner; or</li><li>submit a statement of disagreement setting out the requested correction or amendment and your reasons for disagreeing with our decision.</li></ol>

          <h2 id="s8" className="no-num">Contact and Resources</h2>
          <p>In order to exercise this right and in order to obtain information about our privacy practices and about our collection, use and disclosure of personal information, both by us and any service providers we contract with in Ontario or in other provinces, you can contact our Privacy Officer at: <a href="mailto:info@newdermamed.com">info@newdermamed.com</a>, or by phone at either clinic: Uptown <a href="tel:+14162248800">416-224-8800</a>, Downtown <a href="tel:+14166719766">416-671-9766</a>.</p>
          <p>For a copy of the Personal Health Information Protection Act, 2004 see: <a href="https://www.ontario.ca/laws/statute/04p03" target="_blank" rel="noopener">ontario.ca/laws/statute/04p03</a></p>
          <div className="lg-card">
            <h4>Information and Privacy Commissioner of Ontario</h4>
            <p>2 Bloor Street East, Suite 1400<br />Toronto, Ontario M4W 1A8<br />Phone: <a href="tel:+14163263333">416-326-3333</a> or <a href="tel:+18003870073">1-800-387-0073</a></p>
          </div>
        </>
  );
}
function LegalPage({ doc = 'privacy' }) {
  const d = LEGAL[doc];
  const [on, setOn] = useState(d.toc[0][0]);
  useOnScroll(() => {
    let cur = d.toc[0][0];
    d.toc.forEach(([id]) => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top < 220) cur = id; });
    setOn(cur);
  }, []);
  const go = (id, e) => { e.preventDefault(); const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 190); };
  const items = d.toc.map(([id, t], k) => [id, <><span className={`tabular-nums ${on === id ? 'text-white/70' : 'text-ndm-muted'}`}>{k + 1}</span>{t}</>]);
  return (
    <>
    <section aria-labelledby="lg-title" className="px-[var(--gx)] pb-6 pt-[clamp(28px,3vw,44px)]">
      <TwoTone as="h1" id="lg-title" size="text-[clamp(40px,4.6vw,64px)]" lead={<>{d.lead}<br /></>} strong={d.strong} />
      <nav aria-label="Legal documents" className="no-scrollbar -mx-[var(--gx)] mt-6 overflow-x-auto px-[var(--gx)]">
        <ul role="list" className="flex w-max gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1px_rgba(27,36,43,.08)]">
          {LEGAL_DOCS.map(([k, t, h]) => (
            <li key={k}><a href={h} aria-current={k === doc ? 'page' : undefined}
              className={`block whitespace-nowrap rounded-full px-4 py-2 font-inter text-[14px] transition-colors ${k === doc ? 'bg-ndm-ink font-medium text-white' : 'text-ndm-ink/75 hover:bg-ndm-paper hover:text-ndm-ink'}`}>{t}</a></li>
          ))}
        </ul>
      </nav>
      <p className="mt-5 font-inter text-[13px] text-ndm-muted">Last updated {LEGAL_UPDATED}</p>
    </section>
    <SubNav label="On this page" items={items} on={on} onPick={go} />
    <section className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)] pt-2">
      <article className="lg-doc-body max-w-[820px]">
        <LegalBody doc={doc} />
      </article>
    </section>
    </>
  );
}
const PrivacyPage = () => <LegalPage doc="privacy" />;
const TermsPage = () => <LegalPage doc="terms" />;
const RefundsPage = () => <LegalPage doc="refunds" />;
