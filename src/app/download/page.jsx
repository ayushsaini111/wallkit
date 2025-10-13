import Head from "next/head";

export default function Download() {
  const apkUrl = "/wallpickr-v1.apk";
  const qrUrl = "/wallpickr-qr.png";

  return (
    <>
      <Head>
        <title>Download Wallpickr APK</title>
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 px-4 py-12">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center max-w-md mb-8">
          <div className="relative">
            <img 
              src="/icon-192.png" 
              alt="Wallpickr Logo" 
              className="relative w-28 h-28 mb-6"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Wallpickr APK
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            Download and install Wallpickr to explore thousands of stunning wallpapers for your device.
          </p>
        </div>

        {/* Download button */}
        <a
          href={apkUrl}
          download
          className="group relative bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-2xl transition-all transform hover:scale-95 hover:shadow-2xl mb-10 shadow-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download APK
          </span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </a>

        {/* QR code */}
        <div className="flex flex-col items-center mb-10 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Or scan to download:</h2>
          <div className="bg-gradient-to-br from-orange-100 to-pink-100 p-4 rounded-xl">
            <img src={qrUrl} alt="QR code to download Wallpickr APK" className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg" />
          </div>
        </div>

        {/* Installation instructions */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-pink-600 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-900">Installation Guide</h3>
          </div>
          <ol className="space-y-4">
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <span className="text-gray-700 leading-relaxed">Tap the download button above or scan the QR code with your phone.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <span className="text-gray-700 leading-relaxed">Once downloaded, locate and open the APK file.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <span className="text-gray-700 leading-relaxed">Allow "Install unknown apps" permission if prompted.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
              <span className="text-gray-700 leading-relaxed">Tap Install and enjoy beautiful wallpapers! 🎉</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
       
      </main>
    </>
  );
}