// components/LoginRequiredToast.jsx
import { X } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginRequiredToast({ show, onClose }) {
  const router = useRouter();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 2500); // auto-redirect after 2.5s
      return () => clearTimeout(timer);
    }
  }, [show, router]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 px-5 py-4 flex items-center gap-4 w-80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          🔒
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">Login Required</p>
          <p className="text-sm text-gray-500">Please log in to continue</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
