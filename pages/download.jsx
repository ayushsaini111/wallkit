// pages/download.jsx
import Head from "next/head";

export default function Download() {
  // Keep this filename in sync with the APK in /public
  const apkFilename = "/walpicker-v1.0.0.apk";
  const apkFullPath = apkFilename;

  return (
    <>
      <Head>
        <title>Walpicker — Download APK</title>
        <meta name="description" content="Download the Walpicker Android APK." />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
        <div className="w-full max-w-xl bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Walpicker" className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h1 className="text-2xl font-bold">Walpicker</h1>
              <p className="text-sm text-gray-300">Beautiful wallpapers. Lightweight. Offline-ready.</p>
            </div>
          </div>

          <p className="mt-6 text-gray-300">
            Tap Download on your Android phone to get the APK. After download, open the file to install.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href={apkFullPath}
              download
              className="inline-block px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 transition font-semibold"
            >
              Download APK
            </a>

            <a
              href={apkFullPath}
              className="inline-block px-6 py-3 rounded-xl border border-gray-700 text-gray-200"
            >
              Open in browser (if download blocked)
            </a>
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <h3 className="font-semibold text-gray-200 mb-2">Install instructions</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Tap the Download button and wait for the file to finish.</li>
              <li>Open the downloaded file from Chrome downloads or Files app.</li>
              <li>If prompted, allow “Install unknown apps” for your browser.</li>
              <li>Tap Install. Open the app once finished.</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">Note: Android will show a Play Protect warning for unknown sources.</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div>
              <h4 className="text-xs text-gray-400">QR code</h4>
              <img src="/walpicker-qr.png" alt="QR to download Walpicker" className="w-28 h-28 object-contain mt-2 rounded" />
            </div>

            <div className="text-sm text-gray-400">
              <p>Scan this QR with your phone camera to open this page directly.</p>
              <p className="mt-2">Or use <a className="underline" href="/scan">Scan page</a> inside Walpicker.</p>
            </div>
          </div>

          <footer className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} Walpicker</footer>
        </div>
      </main>
    </>
  );
}
