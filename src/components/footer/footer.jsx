import { ExternalLink } from "lucide-react";

export default function ModernFooter() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-950 via-black to-gray-900 border-t border-gray-800">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:32px_32px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-14 md:py-16 lg:py-20 flex flex-col justify-center">
        
        {/* Main footer content */}
        <div className="mb-12 sm:mb-14">
          
          {/* Logo and description */}
          <div className="text-center mb-10 sm:mb-12 lg:mb-0">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <span className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                WallPickr
              </span>
            </div>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-sm xs:max-w-md lg:max-w-2xl mx-auto mb-6 sm:mb-8">
              Discover stunning wallpapers and transform your digital space with our curated collection of premium designs and artistic masterpieces.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base">Powered by Oryvia</p>
          </div>

          {/* Links Grid - Only for larger screens */}
          <div className="hidden lg:grid lg:grid-cols-4 xl:grid-cols-5 gap-12">
            {/* Spacer for logo section on large screens */}
            <div className="xl:col-span-2"></div>
            
            {/* Browse Links */}
            <div>
              <h3 className="text-white font-semibold text-lg xl:text-xl mb-6">Browse</h3>
              <ul className="space-y-4">
                {[
                  { name: "Trending", href: "/trending" },
                  { name: "New Arrivals", href: "/" },
                  { name: "Categories", href: "/" },
                  { name: "Collections", href: "/collections" },
                ].map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base xl:text-lg"
                    >
                      {name}
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold text-lg xl:text-xl mb-6">Company</h3>
              <ul className="space-y-4">
                {["About Us", "Contact", "Support"].map((item) => (
                  <li key={item}>
                    <a
                      href="/about"
                      className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base xl:text-lg"
                    >
                      {item}
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold text-lg xl:text-xl mb-6">Legal</h3>
              <ul className="space-y-4">
                {["Cookie Policy", "Ad Policy"].map((item) => (
                  <li key={item}>
                    <a
                      href="/policy"
                      className="text-gray-400 hover:text-white transition-colors duration-200 group inline-flex items-center text-base xl:text-lg"
                    >
                      {item}
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mobile & Tablet Links - Horizontal Layout */}
          <div className="lg:hidden grid grid-cols-3 gap-6 sm:gap-8 md:gap-12 text-center">
            {/* Browse Links */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Browse</h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { name: "Trending", href: "/trending" },
                  { name: "New Arrivals", href: "/" },
                  { name: "Categories", href: "/" },
                  { name: "Collections", href: "/collections" },
                ].map(({ name, href }) => (
                  <li key={name}>
                    <a
                      href={href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 block text-xs sm:text-sm md:text-base"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {["About Us", "Contact", "Support"].map((item) => (
                  <li key={item}>
                    <a
                      href="/about"
                      className="text-gray-400 hover:text-white transition-colors duration-200 block text-xs sm:text-sm md:text-base"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                {["Cookie Policy", "Ad Policy"].map((item) => (
                  <li key={item}>
                    <a
                      href="/policy"
                      className="text-gray-400 hover:text-white transition-colors duration-200 block text-xs sm:text-sm md:text-base"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8 sm:mb-10"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-xs sm:text-sm md:text-base space-y-4 sm:space-y-0 gap-4">
          <p className="text-center sm:text-left order-2 sm:order-1">© 2025 WallPickr. All rights reserved</p>
          <div className="flex flex-col xs:flex-row items-center space-y-2 xs:space-y-0 xs:space-x-4 sm:space-x-6 order-1 sm:order-2">
            <a href="/termsCondition" className="hover:text-gray-200 transition-colors whitespace-nowrap">Terms & Conditions</a>
            <a href="/policy" className="hover:text-gray-200 transition-colors whitespace-nowrap">Privacy Policy</a>
          </div>
        </div>
      </div>
      
      {/* Enhanced glow effect at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gray-500/40 to-transparent"></div>
    </footer>
  );
}