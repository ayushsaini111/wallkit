import { Sparkles, Instagram, Twitter, Github, Mail, ExternalLink } from "lucide-react";

export default function ModernFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-950 via-black to-gray-900 border-t border-gray-800 min-h-[50vh]">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:32px_32px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center min-h-[50vh]">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mb-20">
          
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-10">
              {/* Bigger Gray converted logo */}
              <div className="w-20 h-20 bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-all duration-500 shadow-lg shadow-gray-700/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                WallKit
              </span>
            </div>
            <p className="text-gray-300 text-xl leading-relaxed text-center md:text-left mx-auto md:mx-0 max-w-lg mb-10">
              Discover stunning wallpapers and transform your digital space with our curated collection of premium designs and artistic masterpieces.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-6 justify-center md:justify-start">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Github, label: "GitHub" },
                { icon: Mail, label: "Email" }
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-14 h-14 bg-gray-800/50 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-800 hover:border-gray-600"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Browse Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-xl mb-8">Browse</h3>
            <ul className="space-y-4">
              {["Popular", "New Arrivals", "Categories", "Collections", "Premium"].map((item) => (
                <li key={item}>
                  <a href="/collections" className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center justify-center md:justify-start text-lg">
                    {item}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-xl mb-8">Company</h3>
            <ul className="space-y-4">
              {["About Us", "Contact", "Support", "Careers", "Blog"].map((item) => (
                <li key={item}>
                  <a href="/about" className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center justify-center md:justify-start text-lg">
                    {item}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal & Policies */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold text-xl mb-8">Legal</h3>
            <ul className="space-y-4">
              {[  "Cookie Policy", "DMCA Policy", "Ad Policy"].map((item) => (
                <li key={item}>
                  <a href="/policy" className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center justify-center md:justify-start text-lg">
                    {item}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-12"></div>
        
        {/* Copyright */}
        <div className="flex flex-col lg:flex-row justify-between items-center text-gray-400 text-base space-y-6 lg:space-y-0 mt-auto">
          <p className="text-center lg:text-left">© 2024 WallKit. All rights reserved. Made with ❤️ for wallpaper enthusiasts.</p>
          <div className="flex items-center space-x-8">
            <a href="/termsCondition" className="hover:text-gray-200 transition-colors duration-200 text-base">Terms & Conditions</a>
            <a href="/policy" className="hover:text-gray-200 transition-colors duration-200 text-base">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      {/* Enhanced glow effect at bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-500/40 to-transparent"></div>
    </footer>
  );
}