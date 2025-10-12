import Head from "next/head";

export default function Download() {
  const apkUrl = "/wallpickr-v1.apk";
  const qrUrl = "/wallpickr-qr.png";

  return (
    <>
      <Head>
        <title>Download Wallpickr APK</title>
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white px-4 py-12">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center max-w-md">
          <img 
            src="/icon-192.png" 
            alt="Wallpickr Logo" 
            className="w-24 h-24 mb-4 rounded-xl shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Wallpickr APK
          </h1>
          <p className="text-gray-300 mb-6">
            Download and install Wallpickr to explore thousands of stunning wallpapers for your device.
          </p>
        </div>

        {/* Download button */}
        <a
          href={apkUrl}
          download
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-transform transform hover:scale-105 mb-8 shadow-lg"
        >
          Download APK
        </a>

        {/* QR code */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-lg font-semibold mb-2">Or scan to download:</h2>
          <img src={qrUrl} alt="QR code to download Wallpickr APK" className="w-40 h-40 sm:w-48 sm:h-48" />
        </div>

        {/* Installation instructions */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-w-md w-full text-gray-300">
          <h3 className="text-xl font-semibold mb-4 text-white">Installation Guide</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tap the download button above or scan the QR code with your phone.</li>
            <li>Once downloaded, locate and open the APK file.</li>
            <li>Allow "Install unknown apps" permission if prompted.</li>
            <li>Tap Install and enjoy beautiful wallpapers! 🎉</li>
          </ol>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-gray-500 text-sm text-center">
          © {new Date().getFullYear()} Wallpickr. All rights reserved.
        </footer>
      </main>
    </>
  );
}
