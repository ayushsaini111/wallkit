// page.js
import { Suspense } from 'react';
import Main from '@/components/wallpapergallary/main';

export default function Home() {
  return (
    <div className=''>
       <Suspense fallback={<div className="text-white">Loading...</div>} >
        <Main />
      </Suspense>
    </div>
  );
}
