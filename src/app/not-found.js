// app/not-found.js
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      {errorCode && <p>Error Code: {errorCode}</p>}
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading 404...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
