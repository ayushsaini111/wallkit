import { Shield, FileText, Users, Lock, AlertTriangle, Scale, Mail, Clock } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using WallPickr. By using our platform, you agree to be bound by these terms and conditions.
          </p>
          <div className="mt-8 inline-flex items-center text-slate-400">
            <Clock className="w-5 h-5 mr-2" />
            <span>Last Updated: January 2025</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Introduction */}
        <div className="mb-16 bg-white border-l-4 border-blue-500 pl-8">
          <p className="text-lg text-slate-700 leading-relaxed">
            These Terms & Conditions constitute a legally binding agreement between you and <strong>WallPickr</strong> regarding your access to and use of the WallPickr website, applications, and related services. By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. These terms govern all aspects of your relationship with WallPickr, including but not limited to user conduct, intellectual property rights, privacy considerations, and dispute resolution procedures. We strongly encourage you to review these terms periodically as they may be updated to reflect changes in our services or applicable laws.
          </p>
        </div>

        {/* Eligibility & Acceptance */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg">Eligibility & Acceptance</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              By using WallPickr, you represent and warrant that you are at least 13 years of age, or the legal age of majority in your jurisdiction, and that you have the full legal capacity to enter into this agreement. If you are under the required age, you may only use the Platform with the involvement of a parent or legal guardian who agrees to be bound by these Terms on your behalf. Users must provide accurate and truthful information during registration and maintain the confidentiality of their account credentials. We reserve the right to verify user eligibility at any time and may request additional documentation to confirm your identity or age. Failure to meet these eligibility requirements may result in immediate termination of your account and access to our services.
            </p>
          </div>
        </section>

        {/* Grant of License & Use Restrictions */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-green-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg ">Grant of License & Use Restrictions</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              WallPickr grants you a limited, non-exclusive, non-transferable, and revocable license to access and use the Platform strictly for personal and non-commercial purposes. You agree not to copy, distribute, modify, reverse engineer, or create derivative works of any content obtained from the Platform, unless expressly permitted by WallPickr or the respective rights holder. Wallpapers and media available on WallPickr may be protected by copyright or other intellectual property rights, and you agree to respect such rights at all times. This license does not grant you any ownership rights in the Platform or its content, and all rights not expressly granted remain reserved by WallPickr. Commercial use of our content requires separate written permission and may be subject to licensing fees. Any unauthorized commercial use will result in immediate license termination and potential legal action.
            </p>
          </div>
        </section>

        {/* User Accounts & Responsibilities */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-purple-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">User Accounts & Responsibilities</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              To access certain features, you may be required to create an account with accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for any activity that occurs under your account, including unauthorized access by third parties. You agree to provide accurate information during registration and to promptly update your details when necessary to ensure continued service availability. WallPickr shall not be liable for any loss or damage arising from your failure to safeguard your account information or from unauthorized account access. Users must immediately notify us of any suspected security breaches or unauthorized account usage. We reserve the right to suspend or terminate accounts that show suspicious activity or violate our community guidelines.
            </p>
          </div>
        </section>

        {/* Prohibited Conduct */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg  ">Prohibited Conduct</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              You agree that you will not use the Platform in any unlawful manner or for any illegal purpose, including but not limited to violating local, state, national, or international laws and regulations. Users are prohibited from uploading, posting, or distributing any content that infringes on the rights of others, is defamatory, obscene, hateful, threatening, or otherwise objectionable. Engaging in unauthorized scraping, data mining, or similar automated activities that may overload our servers or interfere with other users' experience is strictly forbidden. Any attempts to interfere with the security or functionality of the Platform through hacking, malware distribution, denial-of-service attacks, or any other malicious means will result in immediate account termination and potential legal prosecution. Additionally, users must not impersonate others, create fake accounts, or engage in any form of harassment or bullying behavior toward other community members.
            </p>
          </div>
        </section>

        {/* Intellectual Property Rights */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Scale className="w-8 h-8 text-indigo-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg ">Intellectual Property Rights</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              All trademarks, logos, designs, software, and proprietary content that form part of the WallPickr Platform are the exclusive property of WallPickr or its licensors and are protected by copyright, trademark, and other intellectual property laws. Any unauthorized use, reproduction, modification, or distribution of this intellectual property is strictly prohibited and may result in civil and criminal penalties. Creators who upload wallpapers retain ownership of their original work but grant WallPickr a worldwide, royalty-free, non-exclusive license to display, distribute, and promote such content within the scope of the Platform and related marketing materials. This license includes the right to create thumbnails, previews, and derivative works necessary for platform functionality. Users acknowledge that any feedback, suggestions, or ideas provided to WallPickr may be used without compensation or attribution.
            </p>
          </div>
        </section>

        {/* Termination & Suspension */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg  inline-block">Termination & Suspension</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              WallPickr reserves the right to suspend, restrict, or terminate your account or access to the Platform at its sole discretion, without prior notice, for any reason, including but not limited to violations of these Terms, suspected fraudulent activity, or extended periods of inactivity. Upon termination, your right to access or use the Platform will cease immediately, and any data associated with your account may be permanently deleted. Users may also terminate their accounts at any time by contacting our support team, though certain obligations under these Terms may survive termination. In cases of suspension, we may provide an opportunity to remedy violations before proceeding with permanent termination, though this is at our discretion and not guaranteed. Termination does not relieve users of any outstanding obligations or liabilities incurred prior to the termination date.
            </p>
          </div>
        </section>

        {/* Disclaimer of Warranties */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg  inline-block">Disclaimer of Warranties</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. WallPickr does not guarantee that the Platform will be uninterrupted, secure, error-free, or free from viruses, malware, or other harmful components. You assume full responsibility for your use of the Platform and any damage to your device, loss of data, or other harm that may result from accessing or using our services. We make no representations regarding the accuracy, completeness, or reliability of any content available on the Platform, including user-generated content and third-party materials. Users acknowledge that technology limitations may result in temporary service disruptions or data loss, and WallPickr disclaims all liability for such occurrences.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg  inline-block">Limitation of Liability</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              To the fullest extent permitted by law, WallPickr shall not be liable for any indirect, incidental, consequential, punitive, or special damages arising from your use or inability to use the Platform, even if we have been advised of the possibility of such damages. This includes but is not limited to damages for loss of profits, goodwill, data, or other intangible losses resulting from Platform usage, content access, or service interruptions. In jurisdictions that do not allow the exclusion of certain damages, our liability shall be limited to the maximum extent permitted by law. Our total liability for any claims arising from these Terms or Platform usage shall not exceed the amount you have paid to WallPickr in the twelve months preceding the claim, or $100, whichever is greater. These limitations apply regardless of the legal theory on which claims are based, including breach of contract, tort, or statutory violations.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg  inline-block">Changes to Terms</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              We reserve the right to modify or update these Terms at any time without prior notice to reflect changes in our services, legal requirements, or business practices. The updated version will be posted on this page with a revised "Last Updated" date, and material changes may be communicated through email notifications or prominent Platform announcements. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms. If you disagree with any modifications, you must discontinue use of the Platform immediately. We encourage users to review these Terms periodically to stay informed of any changes. For significant modifications that materially affect user rights or obligations, we may provide additional notice or require explicit acceptance before the changes take effect.
            </p>
          </div>
        </section>

        {/* Governing Law & Jurisdiction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 bg-white px-4 py-2 rounded-lg  inline-block">Governing Law & Jurisdiction</h2>
          <div className="bg-slate-50 p-8 rounded-xl">
            <p className="text-lg text-slate-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of laws principles that might apply the laws of another jurisdiction. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the federal and state courts located in the United States. Users consent to personal jurisdiction in these courts and waive any objection to venue or inconvenient forum. Before initiating formal legal proceedings, parties agree to attempt resolution through good-faith negotiations. If direct negotiation fails, disputes may be resolved through binding arbitration under the American Arbitration Association's rules, with proceedings conducted in English. The arbitrator's decision shall be final and binding, with limited grounds for appeal as provided by applicable arbitration law.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Mail className="w-8 h-8 text-blue-600 mr-4" />
            <h2 className="text-3xl font-bold text-slate-800 bg-white px-4 py-2 rounded-lg ">Contact Information</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-200">
            <p className="text-lg text-slate-700 leading-relaxed">
              If you have any questions, concerns, or feedback regarding these Terms, our services, or your account, please don't hesitate to contact our support team. We strive to respond to all inquiries within 24-48 hours during business days. You can reach us at{" "}
              <a href="mailto:support@WallPickr.com" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                support@WallPickr.com
              </a>{" "}
              or through our online contact form available on the Platform. For urgent matters requiring immediate attention, please clearly mark your message as "Urgent" in the subject line.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}