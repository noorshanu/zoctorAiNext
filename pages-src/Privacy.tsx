import React from "react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function PrivacyPolicyAgreement() {
  

  return (
<>
<Navbar/>
<main>
<div className="css-1vx3a4p"></div>
<div className="flex justify-center items-center min-h-screen bg-gray-100 p-6 pt-24">
      <div className="w-full max-w-7xl bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy Agreement</h2>
        <div className="    bg-gray-50">
          <p>
            <strong className=" text-2xl">1. Introduction</strong> <br />
            This Privacy Policy Agreement  is a legally binding
            document between you ("User") and ZoctorAi.
            By accessing or using our services, you explicitly agree to the
            terms of this Agreement without any recourse or claim against the
            Company.
          </p>
          <p className="py-1">
          The Company is committed to protecting your privacy and ensuring the security of the data you share with us. This Agreement outlines the types of data we collect, how it is used, and your responsibilities as a User.
          </p>

        </div>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Collection</h2>
            <p className="mb-4">We collect and process personal data provided by the User. This includes, but is not limited to:</p>
            
            <div className="pl-4">
                <h3 className="text-xl font-medium mb-2">2.1 Personal Identification Information</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>Full name, contact details (email, phone number, address).</li>
                    <li>Demographic information such as age, gender, and nationality.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">2.2 Health and Medical Data</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>Medical records, prescriptions, and appointment history.</li>
                    <li>Health conditions, treatment preferences, and diagnostic reports.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">2.3 Payment Information</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>Credit/debit card details, billing address, and transaction history.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">2.4 Behavioral Data</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>Interaction logs, browsing patterns, and service preferences.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">2.5 Device and Location Data</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>IP address, device information, and geolocation data (where applicable).</li>
                </ul>
            </div>
        </section>

 
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Purpose of Data Usage</h2>
            <p className="mb-4">We use the collected data for the following purposes:</p>
            
            <div className="pl-4">
                <h3 className="text-xl font-medium mb-2">3.1 Service Delivery</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>To provide personalized and efficient services.</li>
                    <li>To schedule and manage appointments and consultations.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">3.2 User Experience Enhancement</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>To analyze usage patterns and improve service quality.</li>
                    <li>To offer tailored recommendations and insights.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">3.3 Regulatory Compliance</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>To adhere to legal and regulatory requirements specific to healthcare and data protection.</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">3.4 Business Development</h3>
                <ul className="list-disc pl-6 mb-4">
                    <li>To conduct research, generate reports, and develop new offerings.</li>
                </ul>
            </div>
        </section>

   
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
            <p className="mb-4">We process personal data in compliance with applicable laws, including but not limited to:</p>
            
            <div className="pl-4">
                <h3 className="text-xl font-medium mb-2">4.1 General Data Protection Regulation (GDPR)</h3>
                <p className="mb-4">Applicable to Users in the European Union. Ensures data processing is lawful, transparent, and for legitimate purposes.</p>

                <h3 className="text-xl font-medium mb-2">4.2 Health Insurance Portability and Accountability Act (HIPAA)</h3>
                <p className="mb-4">Governs the handling of health information for Users in the United States.</p>

                <h3 className="text-xl font-medium mb-2">4.3 Personal Information Protection and Electronic Documents Act (PIPEDA)</h3>
                <p className="mb-4">Governs the handling of personal data for Users in Canada. Ensures data is collected, used, and disclosed responsibly and transparently.</p>

                <h3 className="text-xl font-medium mb-2">4.4 DIFC Data Protection Law (Dubai, UAE)</h3>
                <p className="mb-4">Ensures compliance with the Dubai International Financial Centre data privacy framework, including principles of accountability, transparency, and lawful processing.</p>

                <h3 className="text-xl font-medium mb-2">4.5 Saudi Arabia's Personal Data Protection Law (PDPL)</h3>
                <p className="mb-4">Applies to the collection, processing, and storage of personal data for Users in Saudi Arabia. Ensures the safeguarding of personal data in alignment with local cultural and legal expectations.</p>

                <h3 className="text-xl font-medium mb-2">4.6 Other Local Jurisdictional Laws</h3>
                <p className="mb-4">Compliance with relevant laws based on the User's location.</p>
            </div>
        </section>


        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-4">The User consents to their data being shared under the following circumstances:</p>
            
            <div className="pl-4">
                <h3 className="text-xl font-medium mb-2">5.1 With Affiliated Entities</h3>
                <p className="mb-4">Sharing data with subsidiaries, affiliates, and trusted partners for service delivery.</p>

                <h3 className="text-xl font-medium mb-2">5.2 Third-Party Providers</h3>
                <p className="mb-4">Authorized sharing with service providers for payment processing, analytics, or other operational needs.</p>

                <h3 className="text-xl font-medium mb-2">5.3 Legal Obligations</h3>
                <p className="mb-4">Disclosure to comply with court orders, law enforcement, or regulatory requirements.</p>
                <p className="mb-4"><strong>Indemnification:</strong> The Company is not responsible for misuse of data by third parties. The User waives all rights to seek recourse against the Company for such instances.</p>
            </div>
        </section>

  
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="mb-4">The Company implements robust security measures, including:</p>
            
            <ul className="list-disc pl-6 mb-4">
                <li>End-to-end encryption for data transmission.</li>
                <li>Access control mechanisms to restrict unauthorized data access.</li>
                <li>Regular security audits and vulnerability assessments.</li>
            </ul>
            <p className="mb-4">Despite these measures, no system is entirely secure, and the Company is not liable for breaches caused by cyberattacks or unauthorized access.</p>
        </section>


        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="mb-4">We retain User data:</p>
            
            <ul className="list-disc pl-6 mb-4">
                <li>For the duration required to fulfill the purposes outlined in this Agreement.</li>
                <li>To comply with legal obligations and for archival purposes.</li>
                <li>Anonymized data may be retained indefinitely for analytics and research.</li>
            </ul>
        </section>

    
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. User Obligations</h2>
            <p className="mb-4">The User is responsible for:</p>
            
            <ul className="list-disc pl-6 mb-4">
                <li>Providing accurate and truthful information.</li>
                <li>Updating their personal data to reflect changes.</li>
                <li>Ensuring that their use of our services complies with this Agreement and applicable laws.</li>
            </ul>
            <p className="mb-4">Failure to meet these obligations may result in service termination without notice or liability.</p>
        </section>

      
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="mb-4">The Company disclaims liability for:</p>
            
            <ul className="list-disc pl-6 mb-4">
                <li>Direct, indirect, or consequential damages resulting from service use.</li>
                <li>Losses due to third-party actions or external data breaches.</li>
                <li>Interruptions or errors in service delivery beyond the Company's reasonable control.</li>
            </ul>
        </section>

   
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Modifications to the Agreement</h2>
            <p className="mb-4">The Company reserves the right to:</p>
            
            <ul className="list-disc pl-6 mb-4">
                <li>Amend this Agreement at its sole discretion.</li>
                <li>Notify Users of significant changes through the website or other communication channels.</li>
            </ul>
            <p className="mb-4">Continued use of services constitutes acceptance of updated terms.</p>
        </section>

     
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Jurisdiction</h2>
            <p className="mb-4">This Agreement is governed by the laws of [Insert Jurisdiction]. Disputes will be resolved exclusively in the courts of [Insert Jurisdiction], and the User agrees to submit to their jurisdiction.</p>
        </section>

   
        <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Entire Agreement</h2>
            <p className="mb-4">This Agreement constitutes the entire understanding between the User and the Company regarding privacy practices. It supersedes all prior agreements and communications.</p>
        </section>


  
      </div>
    </div>
</main>
<Footer/>
</>
  );
}