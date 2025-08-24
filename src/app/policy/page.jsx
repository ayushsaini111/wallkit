import { Lock, Shield, Eye, Database, UserCheck, Cookie, Baby, Mail, Clock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 via-green-600 to-green-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Lock className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy describes how we collect, use, and protect your information when you use WallPickr.
          </p>
          <div className="mt-8 inline-flex items-center text-green-200">
            <Clock className="w-5 h-5 mr-2" />
            <span>Last Updated: January 2025</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Introduction */}
        <div className="mb-16 bg-white border-l-4 border-green-500 pl-8">
          <p className="text-lg text-slate-700 leading-relaxed">
            This Privacy Policy describes how <strong>WallPickr</strong> collects, uses, stores, and safeguards your personal information when you access or use our Platform. By using WallPickr, you consent to the practices outlined in this Privacy Policy. We are committed to transparency in our data handling practices and believe that users have the right to understand how their information is being used. This policy applies to all users of our Platform, regardless of location, and covers both the information you provide directly and the data we collect automatically through your use of our services. We encourage you to read this policy carefully and contact us with any questions or concerns about our privacy practices.
          </p>
        </div>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Database className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Information We Collect</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We collect information you provide directly to us when you create an account, upload content, interact with other users, or contact our support team. This may include your name, email address, username, profile image, biographical information, and any content you choose to share on the Platform. Additionally, we automatically collect certain technical information such as your IP address, browser type and version, operating system, device identifiers, and browsing behavior through cookies, pixels, and similar tracking technologies. We also collect usage data including pages visited, time spent on the Platform, search queries, download history, and interaction patterns with content and features. When you communicate with us via email or other channels, we retain records of those communications. Location data may be collected if you enable location services, though this is optional and can be disabled at any time through your device settings.
            </p>
          </div>
        </section>

        {/* Use of Information */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-purple-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Use of Information</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We use the information collected to operate, maintain, and continuously improve our Platform, ensuring optimal performance and user experience. This includes personalizing your experience through content recommendations, customized feeds, and tailored suggestions based on your interests and usage patterns. We communicate with you regarding account updates, security alerts, new features, promotional offers, and important Platform announcements, though you can opt out of marketing communications at any time. The data helps us detect, prevent, and address technical issues, fraudulent activities, spam, and other security threats that could compromise user safety. We also use aggregated and anonymized data for analytical purposes to understand user behavior, improve our algorithms, develop new features, and make informed business decisions. Additionally, we may use your information to comply with legal obligations, respond to lawful requests from authorities, and protect our rights and the rights of our users in legal proceedings.
            </p>
          </div>
        </section>

        {/* Data Sharing & Disclosure */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-red-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Data Sharing & Disclosure</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties for their marketing purposes. However, we may share data with trusted service providers and business partners who assist us in operating the Platform, processing payments, analyzing user behavior, providing customer support, and delivering marketing communications. These partners are subject to strict confidentiality obligations and are only permitted to use your data for the specific services they provide to us. We may also share aggregated, anonymized data that cannot identify individual users for research, marketing, or business development purposes. In certain circumstances, we may disclose your information if required by law, regulation, legal process, or governmental request, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others. In the event of a merger, acquisition, or sale of assets, user information may be transferred to the acquiring entity, with users receiving prior notice of any such change in ownership or control.
            </p>
          </div>
        </section>

        {/* Data Retention & Security */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-indigo-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Data Retention & Security</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Account information is typically retained for the duration of your active account and for a reasonable period thereafter to accommodate potential account reactivation. Content you upload may be retained longer to maintain Platform functionality and user experience. We implement comprehensive administrative, technical, and physical safeguards to protect your data from unauthorized access, alteration, disclosure, or destruction. These measures include encryption of sensitive data both in transit and at rest, regular security assessments, employee training on data protection, and restricted access controls. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security against all possible threats. We continuously monitor our systems for vulnerabilities and update our security practices to address emerging risks and comply with industry standards.
            </p>
          </div>
        </section>

        {/* Your Privacy Rights */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <UserCheck className="w-8 h-8 text-green-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Your Privacy Rights</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              Depending on your jurisdiction and applicable privacy laws such as GDPR, CCPA, or similar regulations, you may have various rights regarding your personal information. These rights may include requesting access to the personal data we hold about you, including details about how it's collected and used. You can request correction of inaccurate or incomplete information, deletion of your personal data under certain circumstances, and restriction of processing for specific purposes. You may also object to certain types of data processing, request data portability to transfer your information to another service, and withdraw consent for data processing where consent is the legal basis. To exercise these rights, please contact us at the email address provided below, and we will respond within the timeframes required by applicable law. Please note that some requests may be subject to verification of your identity and certain limitations based on legal requirements or legitimate business interests. We will never charge fees for reasonable requests, though we may charge for excessive or repetitive requests.
            </p>
          </div>
        </section>

        {/* Cookies & Tracking Technologies */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Cookie className="w-8 h-8 text-orange-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Cookies & Tracking Technologies</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We use cookies, web beacons, pixels, local storage, and similar tracking technologies to enhance your user experience, remember your preferences, analyze traffic patterns, and deliver personalized content and advertisements. Essential cookies are necessary for basic Platform functionality and cannot be disabled, while optional cookies for analytics, personalization, and marketing can be controlled through your browser settings or our cookie preference center. These technologies help us understand which features are most popular, identify technical issues, prevent fraud, and improve overall Platform performance. Third-party cookies may be used by our analytics providers, advertising partners, and social media integration tools, each governed by their respective privacy policies. You may disable or restrict cookies in your browser settings, though doing so may affect certain functionalities of the Platform such as login status, personalized recommendations, and preference settings. We respect Do Not Track signals where technically feasible and legally required.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Baby className="w-8 h-8 text-pink-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Children's Privacy</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              WallPickr is not intended for use by individuals under the age of 13, and we do not knowingly collect personal information from children under this age without proper parental consent as required by the Children's Online Privacy Protection Act (COPPA) and similar regulations worldwide. If we become aware that we have inadvertently collected personal data from a child under 13, we will take immediate steps to delete such information from our systems and terminate the associated account. Parents and legal guardians who believe their child has provided personal information to us without their consent should contact us immediately so we can take appropriate action. For users between 13 and 18 years of age, we recommend parental involvement in Platform usage and encourage parents to discuss online privacy and safety with their teenagers. We may implement additional protections for younger users, including restricted features, enhanced privacy settings, and limited data collection practices in compliance with applicable youth privacy regulations.
            </p>
          </div>
        </section>

        {/* Changes to This Policy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg   inline-block">Changes to This Policy</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We reserve the right to update or revise this Privacy Policy at any time to reflect changes in our practices, services, legal requirements, or for other operational, legal, or regulatory reasons. The most current version will always be available on this page with an updated "Last Updated" date at the top of the document. For significant changes that materially affect how we collect, use, or share your personal information, we will provide additional notice through email notifications, prominent Platform announcements, or other appropriate communication methods before the changes take effect. We encourage users to review this Privacy Policy periodically to stay informed about our data practices and any updates. Continued use of the Platform after changes are posted constitutes acceptance of the revised Privacy Policy. If you disagree with any modifications, you should discontinue use of the Platform and may request deletion of your account and associated data.
            </p>
          </div>
        </section>

        {/* International Data Transfers */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg   inline-block">International Data Transfers</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              As a global platform, we may transfer, store, and process your personal information in countries other than your own, including the United States and other jurisdictions where our servers, service providers, or business partners are located. These countries may have different data protection laws than your jurisdiction, potentially offering different levels of protection for personal information. When we transfer data internationally, we implement appropriate safeguards to ensure your privacy rights are protected, including using standard contractual clauses approved by relevant authorities, ensuring adequate protection through adequacy decisions, or obtaining your explicit consent where required. We work only with service providers and partners who commit to providing adequate protection for your personal information and comply with applicable privacy laws. Users in the European Economic Area, United Kingdom, and other regions with specific data transfer requirements can contact us for more information about the safeguards we use for international data transfers.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Mail className="w-8 h-8 text-green-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Contact Information</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-200">
            <p className="text-lg text-slate-700 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy, our data practices, or wish to exercise your privacy rights, please don't hesitate to contact our privacy team. We are committed to addressing your inquiries promptly and transparently. You can reach our dedicated privacy officer at{" "}
              <a href="mailto:privacy@WallPickr.com" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                privacy@WallPickr.com
              </a>{" "}
              or through our secure online contact form available on the Platform. For general inquiries, you may also contact our support team at{" "}
              <a href="mailto:support@WallPickr.com" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                support@WallPickr.com
              </a>. 
              We strive to respond to all privacy-related inquiries within 30 days, though most requests are addressed much sooner. When contacting us, please provide sufficient detail about your request to help us respond effectively and verify your identity when necessary.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}