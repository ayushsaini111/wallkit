'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ⬇️ Tell Next.js: don't try to prerender this page at build time
export const dynamic = 'force-dynamic';

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}

function NotFoundContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code');

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>404 - Page Not Found</h1>
      {errorCode && <p>Error code: {errorCode}</p>}
    </div>
  );
}
