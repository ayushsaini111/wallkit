import { Camera, Heart, Users, Zap, Target, Globe, Sparkles, CheckCircle, Award, Shield, Clock, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
      {/* Hero Section with Photographer Image */}
      <div className="relative w-full h-[30vh] overflow-hidden">
        {/* Photographer scene background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-gray-300 to-slate-400">
          {/* Mountain landscape silhouettes */}

         
        </div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-black text-slate-800 mb-4 tracking-tight">
              About <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">WallPickr</span>
            </h1>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
              Your personal gateway to stunning visuals and endless inspiration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Intro Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 leading-tight">
            More Than Just Wallpapers
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-4xl mx-auto mb-8">
            <strong className="text-slate-800">WallPickr</strong> is more than just a wallpaper platform — it's your personal gateway to a world of stunning visuals, creativity, and inspiration. We believe every screen has the power to tell a story, reflect your personality, and spark joy every time you unlock your device.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed max-w-4xl mx-auto mb-8">
            Whether you're looking for breathtaking landscapes, minimalist designs, abstract art, or trending aesthetics, WallPickr curates the finest collection of high-resolution wallpapers from talented creators around the globe. Our platform combines cutting-edge technology with artistic excellence to deliver an unmatched visual experience.
          </p>
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <p className="text-2xl text-blue-700 font-semibold">
              Our mission is simple yet ambitious: <span className="text-slate-800 font-bold">to make every wallpaper more than just a background — to make it an experience.</span>
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {[
            { number: "50K+", label: "High-Quality Wallpapers", icon: Camera },
            { number: "1M+", label: "Happy Users Worldwide", icon: Users },
            { number: "100+", label: "Categories & Styles", icon: Globe },
            { number: "99.9%", label: "Uptime & Reliability", icon: Shield }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Story Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              Our Story
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              WallPickr was born from a simple frustration — finding beautiful, high-quality wallpapers without the hassle of low resolution, watermarks, or intrusive ads. We set out to create a platform that blends <strong className="text-slate-800">quality, speed, and style</strong> in one seamless experience.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              From a small collection of handpicked designs, we've grown into a <strong className="text-blue-600">global library of thousands of wallpapers</strong>, updated daily and loved by a growing community worldwide.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our team of curators works tirelessly to ensure every wallpaper meets our high standards for quality, creativity, and visual impact. We collaborate with talented photographers, digital artists, and designers to bring you exclusive content you won't find anywhere else.
            </p>
          </div>
          <div className="relative">
            <div className="w-full h-80 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl border border-purple-200 flex items-center justify-center shadow-sm">
              <Camera className="w-24 h-24 text-purple-600" />
            </div>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-slate-800 mb-12 text-center flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-yellow-500 mr-3" />
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Diverse Categories", desc: "From cinematic landscapes and dreamy nature shots to minimal, abstract, and trending aesthetics - explore over 100 carefully curated categories.", icon: Globe, color: "text-green-600" },
              { title: "Smart Search & Filters", desc: "Easily find wallpapers based on color, style, category, resolution, orientation, and even mood with our advanced AI-powered search.", icon: Target, color: "text-blue-600" },
              { title: "Lightning-Fast Experience", desc: "Browse, preview, and download without interruptions. Our global CDN ensures instant loading from anywhere in the world.", icon: Zap, color: "text-yellow-600" },
              { title: "Favorites & Collections", desc: "Save what you love, organize your own style library, create custom collections, and access them anytime across all devices.", icon: Heart, color: "text-red-600" },
              { title: "One-Click Downloads", desc: "High-resolution images ready in an instant. Multiple formats and sizes available for any device or screen resolution.", icon: CheckCircle, color: "text-emerald-600" },
              { title: "Artist Recognition", desc: "We credit and support every creator whose work is featured. Discover new artists and follow your favorites for updates.", icon: Users, color: "text-purple-600" }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:transform hover:scale-105 shadow-sm hover:shadow-md">
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Aesthetic Image Section */}
        <div className="relative w-full h-64 mb-20 rounded-3xl overflow-hidden shadow-lg">
          {/* Abstract geometric background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            {/* Floating geometric shapes */}
            <div className="absolute top-8 left-12 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl transform rotate-12 opacity-70"></div>
            <div className="absolute top-20 right-20 w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-16 left-24 w-20 h-8 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full transform -rotate-6 opacity-50"></div>
            <div className="absolute bottom-8 right-16 w-14 h-14 bg-gradient-to-br from-rose-200 to-orange-200 rounded-lg transform rotate-45 opacity-60"></div>
            <div className="absolute top-1/2 left-1/3 w-6 h-24 bg-gradient-to-b from-emerald-200 to-teal-200 rounded-full transform rotate-12 opacity-40"></div>
            <div className="absolute top-12 right-1/3 w-10 h-10 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-full opacity-50"></div>
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 25%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 25%)'
            }}></div>
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Visual Excellence</h3>
              <p className="text-slate-600 max-w-md">Where creativity meets technology to deliver breathtaking visual experiences</p>
            </div>
          </div>
        </div>

        {/* Quality Commitment Section */}
        <div className="bg-gradient-to-r from-white to-slate-50 p-12 rounded-2xl border border-slate-200 shadow-sm mb-20">
          <h2 className="text-4xl font-bold text-slate-800 mb-8 text-center flex items-center justify-center">
            <Award className="w-8 h-8 text-amber-500 mr-3" />
            Our Quality Commitment
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">Rigorous Curation Process</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Every wallpaper in our collection goes through a meticulous review process. Our team of visual experts evaluates each submission for technical quality, artistic merit, and visual impact.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Minimum 4K resolution requirement</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Professional color grading standards</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Original content verification</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">Continuous Innovation</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                We're constantly improving our platform with new features, better performance, and enhanced user experience based on community feedback and technological advances.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center"><Clock className="w-4 h-4 text-blue-500 mr-2" />Daily content updates</li>
                <li className="flex items-center"><Clock className="w-4 h-4 text-blue-500 mr-2" />Regular feature releases</li>
                <li className="flex items-center"><Clock className="w-4 h-4 text-blue-500 mr-2" />24/7 platform monitoring</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Different Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-12 rounded-2xl border border-blue-200 mb-20">
          <h2 className="text-4xl font-bold text-slate-800 mb-8 text-center">
            Why We're Different
          </h2>
          <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
            <p>
              Most wallpaper platforms focus only on quantity — we focus on <strong className="text-slate-800">quality and experience</strong>. WallPickr is <strong className="text-blue-600">ad-light, distraction-free</strong>, and designed to feel premium from the moment you arrive.
            </p>
            <p>
              Every element — from the smooth scrolling to the minimal design — is crafted to make browsing wallpapers enjoyable. We don't just show you images; we give you tools to <strong className="text-purple-600">curate your own aesthetic</strong> and personalize your digital space like never before.
            </p>
            <p>
              Our commitment extends beyond just providing wallpapers. We're building a community of visual enthusiasts, supporting independent artists, and pioneering new ways to discover and enjoy digital art. When you use WallPickr, you're not just downloading an image — you're joining a movement that values creativity, quality, and artistic expression.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-slate-800 mb-8">
            Our Vision for the Future
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-4xl mx-auto">
            We envision WallPickr as <strong className="text-slate-800">the go-to platform for digital personalization worldwide</strong> — a space where wallpaper lovers and artists connect, inspire, and share their passion for visual excellence.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-b from-green-50 to-emerald-50 p-8 rounded-xl border border-green-200">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Animated Wallpapers</h3>
              <p className="text-slate-600">Expand into live wallpapers and dynamic content for mobile and desktop experiences with seamless motion graphics.</p>
            </div>
            <div className="bg-gradient-to-b from-purple-50 to-violet-50 p-8 rounded-xl border border-purple-200">
              <h3 className="text-2xl font-semibold text-purple-700 mb-4">Creator Profiles</h3>
              <p className="text-slate-600">Launch comprehensive artist showcases where creators can display portfolios, sell exclusive work, and connect with their audience.</p>
            </div>
            <div className="bg-gradient-to-b from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-200">
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">AI Personalization</h3>
              <p className="text-slate-600">Introduce smart recommendations based on your unique style preferences, viewing history, and aesthetic patterns.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-orange-50 to-red-50 p-8 rounded-xl border border-orange-200">
              <h3 className="text-2xl font-semibold text-orange-700 mb-4">Global Marketplace</h3>
              <p className="text-slate-600">Create a thriving ecosystem where artists can monetize their work and users can commission custom wallpapers.</p>
            </div>
            <div className="bg-gradient-to-b from-teal-50 to-cyan-50 p-8 rounded-xl border border-teal-200">
              <h3 className="text-2xl font-semibold text-teal-700 mb-4">Community Features</h3>
              <p className="text-slate-600">Build social features including user galleries, wallpaper challenges, and collaborative collections.</p>
            </div>
          </div>
        </div>

        {/* Our Promise */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-12">
            Our Promise to You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Always Creative", desc: "Bringing fresh, unique wallpapers daily from the world's most talented visual artists and photographers.", color: "text-orange-600" },
              { title: "Forever Simple", desc: "No complexity, no clutter, no confusion - just pure exploration and beauty in an intuitive interface.", color: "text-green-600" },
              { title: "Respectful to Creators", desc: "Giving credit where it's due, fair compensation, and a platform for artists to showcase their incredible work.", color: "text-purple-600" },
              { title: "User-First Always", desc: "Designed for a smooth, premium experience on every device - your satisfaction is our top priority.", color: "text-blue-600" }
            ].map((promise, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className={`text-2xl font-bold ${promise.color} mb-4`}>{promise.title}</h3>
                <p className="text-slate-600 leading-relaxed">{promise.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
            <p className="text-2xl text-slate-800 font-semibold mb-4">
              WallPickr will always stay true to these values — because your digital space deserves nothing less than extraordinary.
            </p>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Join our growing community of visual enthusiasts and discover why millions of users trust WallPickr to transform their screens into windows of inspiration, creativity, and personal expression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}