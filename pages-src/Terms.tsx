import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
  return (
   <>
   <Navbar/>
   <div className="bg-gray-100 text-gray-800 font-sans p-8">
      <div className="container mx-auto  pt-24 p-6 ">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions for ZoctorAI.com</h1>
        <p className="mb-6"><strong>Effective Date:</strong> [Insert Date]</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. DEFINITIONS</h2>
          <p className="mb-4">
            <strong>"ZoctorAI"</strong> refers to the website, platform, and associated services provided by ZoctorAI.com, its parent company, affiliates, subsidiaries, officers, employees, and agents, including all technologies, features, and tools used to facilitate User interactions with healthcare providers, travel arrangements, and other ancillary services.
          </p>
          <p className="mb-4">
            <strong>"User"</strong> means any individual or entity accessing or using ZoctorAI’s platform or services, whether directly or indirectly, including patients, caregivers, and representatives.
          </p>
          <p className="mb-4">
            <strong>"Service"</strong> encompasses appointment booking, consultation facilitation, medical tourism coordination, and other offerings provided by ZoctorAI, including digital communication tools, scheduling systems, and information resources.
          </p>
          <p className="mb-4">
            <strong>"Third-Party Providers"</strong> include but are not limited to hospitals, doctors, nurses, transport services (including ambulances, local transportation, and international travel agencies), hotels, accommodation providers, visa processing agencies, interpreters, and any other independent entities that offer services through or in collaboration with ZoctorAI.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. SCOPE AND NATURE OF SERVICES</h2>
          <p className="mb-4">
            <strong>Intermediary Role:</strong> ZoctorAI operates as a digital intermediary leveraging advanced generative AI technologies to analyze medical reports, suggest appropriate treatment options tailored to the User’s medical condition, identify suitable healthcare facilities or professionals, and facilitate connections between Users and treatment providers. ZoctorAI does not provide medical advice, definitive diagnoses, or perform any treatments but instead focuses on bridging Users with qualified Third-Party Providers based on AI-driven insights.
          </p>
          <p className="mb-4">
            <strong>No Warranty on Services:</strong> ZoctorAI expressly disclaims any representations or warranties regarding the competence, professionalism, or qualifications of Third-Party Providers. Furthermore, ZoctorAI is not liable for unsuccessful treatments, complications, or fatalities resulting from Third-Party Providers' services, and Users agree to waive any claims, including tort claims, arising from such outcomes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. LIMITATION OF MEDICAL LIABILITY</h2>
          <p className="mb-4">
            <strong>No Medical Practice:</strong> ZoctorAI is not a licensed medical provider and does not engage in diagnosing, treating, or offering medical opinions. All medical decisions and treatments are the sole responsibility of the respective healthcare provider engaged by the User.
          </p>
          <p className="mb-4">
            <strong>No Guarantee of Outcomes:</strong> ZoctorAI is not responsible for the efficacy or success of medical treatments, accuracy of diagnoses, or adherence to prescribed medical protocols by Third-Party Providers.
          </p>
          <p className="mb-4">
            <strong>Independent Responsibility:</strong> Users are solely responsible for verifying the credentials, qualifications, and reputability of Third-Party Providers prior to engagement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. DATA PRIVACY AND MEDICAL RECORDS</h2>
          <p className="mb-4">
            <strong>Limited Responsibility for Data:</strong> ZoctorAI employs commercially reasonable safeguards to secure User data. However, ZoctorAI shall not be held liable for breaches resulting from circumstances beyond its control, including cyberattacks, unauthorized access by third parties, or data mishandling by Users or Third-Party Providers.
          </p>
          <p className="mb-4">
            <strong>Temporary Storage Only:</strong> Uploaded medical records are retained temporarily for facilitation purposes and are not guaranteed for long-term storage or retrieval. Users are advised to retain their own copies of such records. Long-term storage of medical records is available exclusively as a paid service. Users on the free tier acknowledge that ZoctorAI is not obligated to maintain or recover their medical records beyond temporary use.
          </p>
          <p className="mb-4">
            <strong>No Responsibility for Content:</strong> ZoctorAI does not review, validate, or authenticate the content of uploaded medical records. Users acknowledge that ZoctorAI does not perform any data quality or correctness checks on medical records, and it is solely the User's responsibility to ensure the accuracy, completeness, and reliability of all submitted information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. MEDICAL TOURISM SERVICES</h2>
          <p className="mb-4">
            <strong>Third-Party Responsibility:</strong> Medical tourism arrangements, including travel, accommodation, and healthcare services, are managed by Third-Party Providers. ZoctorAI does not assume responsibility for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Errors or delays in travel arrangements.</li>
            <li>Medical complications, unsuccessful treatments, or fatalities arising from treatment provided by Third-Party Providers, regardless of the circumstances or contributing factors.</li>
            <li>Visa-related issues, including denials or cancellations.</li>
            <li>Accommodation quality, availability, or suitability.</li>
            <li>Healthcare outcomes or adherence to prescribed medical procedures.</li>
          </ul>
          <p className="mb-4">
            <strong>Assumption of Risk:</strong> Users acknowledge and accept full risk and responsibility for travel and medical tourism activities.
          </p>
          <p className="mb-4">
            <strong>Additional Costs:</strong> Any costs incurred during medical travel—including but not limited to extended stays, medical complications, or additional treatments—shall be borne exclusively by the User.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. FINANCIAL LIABILITY</h2>
          <p className="mb-4">
            <strong>No Payment Guarantees:</strong> ZoctorAI does not guarantee the successful processing of payments, nor does it provide refunds for payments made to Third-Party Providers.
          </p>
          <p className="mb-4">
            <strong>Disputes:</strong> Any payment-related disputes must be resolved directly between the User and the respective Third-Party Provider. ZoctorAI shall not mediate or arbitrate such disputes. All financial transactions and refunds are at ZoctorAI's sole discretion and are limited to payments made directly to ZoctorAI by the User.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. INDEMNIFICATION</h2>
          <p className="mb-4">
            <strong>User Responsibility:</strong> Users agree to indemnify and hold harmless ZoctorAI, its affiliates, officers, and employees from any claims, damages, or liabilities arising from:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Errors or omissions in User-provided information.</li>
            <li>Medical complications, unsuccessful treatments, or fatalities resulting from medical services provided by Third-Party Providers.</li>
            <li>Any tort claims or lawsuits arising from adverse medical outcomes, including death. Users hereby waive their rights to bring such claims against ZoctorAI.</li>
            <li>Financial disputes or refund claims beyond the payments made directly to ZoctorAI, which are subject to ZoctorAI’s sole discretion on a case-by-case basis.</li>
            <li>Engagements with Third-Party Providers.</li>
            <li>Violations of these Terms.</li>
          </ul>
          <p className="mb-4">
            <strong>Third-Party Claims:</strong> Users agree to indemnify ZoctorAI against any third-party claims arising from User interactions or actions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. DISCLAIMER OF WARRANTIES</h2>
          <p className="mb-4">
            <strong>As-Is Basis:</strong> ZoctorAI’s platform and services are provided on an "as is" and "as available" basis without warranties of any kind, express or implied.
          </p>
          <p className="mb-4">
            <strong>No Guarantee of Accessibility:</strong> ZoctorAI does not warrant uninterrupted or error-free operation of its platform and services.
          </p>
          <p className="mb-4">
            <strong>No Endorsements:</strong> ZoctorAI does not endorse or guarantee any Third-Party Provider’s services or credentials.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. LIMITATION OF LIABILITY</h2>
          <p className="mb-4">
            <strong>Maximum Liability:</strong> To the fullest extent permitted by law, ZoctorAI’s total liability shall not exceed the amount paid by the User for ZoctorAI’s services, if any. This limitation explicitly excludes payments made directly to Third-Party Providers or claims arising from medical outcomes, including but not limited to complications, unsuccessful treatments, or fatalities.
          </p>
          <p className="mb-4">
            <strong>No Consequential Damages:</strong> ZoctorAI shall not be liable for indirect, incidental, special, or consequential damages, including but not limited to loss of data, revenue, business opportunities, personal damages resulting from treatment, health deterioration, or death arising from medical outcomes facilitated through Third-Party Providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. TERMINATION</h2>
          <p className="mb-4">
            <strong>Termination by ZoctorAI:</strong> ZoctorAI reserves the right to suspend or terminate User accounts without notice for violations of these Terms, any misuse of its platform, or any inappropriate or unauthorized use of its AI capabilities, including but not limited to manipulating, altering, or exploiting the AI for unintended purposes.
          </p>
          <p className="mb-4">
            <strong>Survival:</strong> Provisions relating to limitation of liability, indemnification, and governing law shall survive termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
          <p className="mb-4">
            <strong>Jurisdiction:</strong> These Terms shall be governed by the laws of [Insert Jurisdiction].
          </p>
          <p className="mb-4">
            <strong>Exclusive Venue:</strong> All disputes shall be resolved exclusively in the courts of [Insert Jurisdiction].
          </p>
          <p className="mb-4">
            <strong>Arbitration Clause:</strong> In the event of disputes, parties agree to first attempt resolution through arbitration under the rules of [Insert Arbitration Body].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. CHANGES TO TERMS</h2>
          <p className="mb-4">
            <strong>Right to Modify:</strong> ZoctorAI reserves the right to update these Terms at any time. Continued use of the platform constitutes acceptance of revised Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. ENTIRE AGREEMENT</h2>
          <p className="mb-4">
            These Terms constitute the entire agreement between the User and ZoctorAI, superseding all prior agreements or understandings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. CONTACT INFORMATION</h2>
          <p className="mb-4">
            For questions or concerns, please contact us at [Insert Contact Information].
          </p>
        </section>
      </div>
    </div>

   <Footer/>
   </>
  );
};

export default TermsAndConditions;