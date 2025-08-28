import { ExternalLink } from "lucide-react";

export default function ModernFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-950 via-black to-gray-900 border-t border-gray-800">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:32px_32px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-16 lg:py-20 flex flex-col justify-center">
        
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
          
          {/* Logo and description */}
          <div className="lg:col-span-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-8">
              <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                WallPickr
              </span>
            </div>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto sm:mx-0 mb-8">
              Discover stunning wallpapers and transform your digital space with our curated collection of premium designs and artistic masterpieces.
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Powered by Oryvia</p>
          </div>
          
          {/* Browse Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-6">Browse</h3>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { name: "Trending", href: "/trending" },
                { name: "New Arrivals", href: "/" },
                { name: "Categories", href: "/" },
                { name: "Collections", href: "/collections" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base sm:text-lg"
                  >
                    {name}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-6">Company</h3>
            <ul className="space-y-3 sm:space-y-4">
              {["About Us", "Contact", "Support"].map((item) => (
                <li key={item}>
                  <a
                    href="/about"
                    className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base sm:text-lg"
                  >
                    {item}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-6">Legal</h3>
            <ul className="space-y-3 sm:space-y-4">
              {["Cookie Policy", "Ad Policy"].map((item) => (
                <li key={item}>
                  <a
                    href="/policy"
                    className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base sm:text-lg"
                  >
                    {item}
                    <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-10"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm sm:text-base space-y-5 sm:space-y-0">
          <p className="text-center sm:text-left">© 2025 WallPickr. All rights reserved</p>
          <div className="flex items-center space-x-6">
            <a href="/termsCondition" className="hover:text-gray-200 transition-colors">Terms & Conditions</a>
            <a href="/policy" className="hover:text-gray-200 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      {/* Enhanced glow effect at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-500/40 to-transparent"></div>
    </footer>
  );
}
