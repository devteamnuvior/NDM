/* ---------------------------------------------------------------- privacy policy (privacy.html, round 29)
   Layout and text after the NUVIOR legal sample (../new website Odoo/nuvior-legal-privacy_1.html): a legal sidebar (other policies,
   "On this page" with the section in view, print), the numbered policy and the IPC Ontario card. NUVIOR is replaced by NewDermaMed;
   the sample's duplicated "Information We Disclose" section appears once. Items the clinic still has to supply are marked. */
const LEGAL_DOCS = [['Privacy Policy', 'privacy.html'], ['Terms of Service', '#/terms'], ['CASL / Anti-spam consent', '#/casl'], ['Refund & cancellation policy', '#/refunds'], ['Accessibility (AODA)', '#/accessibility']];
const LEGAL_TOC = [['s1', 'Confidentiality and Security'], ['s2', 'Purposes'], ['s3', 'Information We Disclose'], ['s4', 'Consent'], ['s5', 'SMS Messaging and TCR Compliance'], ['s6', 'Sharing Your Information'], ['s7', 'Your Rights'], ['s8', 'Contact and Resources']];
const legalTodo = (t) => <span className="lg-todo">COPY NEEDED: {t}</span>;
function LegalPage() {
  const [on, setOn] = useState('s1');
  useOnScroll(() => {
    let cur = 's1';
    LEGAL_TOC.forEach(([id]) => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top < 220) cur = id; });
    setOn(cur);
  }, []);
  const go = (id) => (e) => { e.preventDefault(); const el = document.getElementById(id); if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - 150); };
  return (
    <section aria-labelledby="lg-title" className="px-[var(--gx)] pb-[clamp(72px,8vw,120px)]">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
        <aside className="lg-side lg:sticky lg:top-[150px] lg:self-start">
          <p className="lg-k">Legal</p>
          <ul className="grid gap-1" role="list">{LEGAL_DOCS.map(([t, h]) => <li key={t}><a href={h} aria-current={h === 'privacy.html' ? 'page' : undefined} className="lg-doc">{t}</a></li>)}</ul>
          <p className="lg-k mt-8">On this page</p>
          <ul className="lg-toc" role="list">{LEGAL_TOC.map(([id, t]) => <li key={id}><a href={`#${id}`} onClick={go(id)} className={on === id ? 'is-on' : ''}>{t}</a></li>)}</ul>
          <button type="button" onClick={() => window.print()} className="lg-print mt-7">Print this policy</button>
        </aside>
        <article className="lg-doc-body max-w-[78ch]">
          <TwoTone as="h1" id="lg-title" size="text-[clamp(40px,4.6vw,64px)]" lead={<>Privacy<br /></>} strong="Policy" />
          <p className="lg-meta">Last updated {legalTodo('effective date')}</p>
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
          <p>In order to exercise this right and in order to obtain information about our privacy practices and about our collection, use and disclosure of personal information, both by us and any service providers we contract with in Ontario or in other provinces, you can contact our Privacy Officer at: {legalTodo('Privacy Officer name, email and phone')}</p>
          <p>For a copy of the Personal Health Information Protection Act, 2004 see: <a href="https://www.ontario.ca/laws/statute/04p03" target="_blank" rel="noopener">ontario.ca/laws/statute/04p03</a></p>
          <div className="lg-card">
            <h4>Information and Privacy Commissioner of Ontario</h4>
            <p>2 Bloor Street East, Suite 1400<br />Toronto, Ontario M4W 1A8<br />Phone: <a href="tel:+14163263333">416-326-3333</a> or <a href="tel:+18003870073">1-800-387-0073</a></p>
          </div>
        </article>
      </div>
    </section>
  );
}
