'use client';

import Image from 'next/image';

export default function Avatar({ src, alt, className = "" }) {
  // console.log("Avatar src:", src);

  return (
    <div
      className={`w-15 h-15 rounded-full overflow-hidden border-2 border-blue-400 ${className}`}
      style={{ width: '60px', height: '60px' }} // or any fixed size you want
    >
      <Image
        src={src || '/avatar.png'}
        alt={alt || 'User Avatar'}
        width={60} // must provide
        height={60} // must provide
        className="w-full h-full object-cover"
      />
    </div>
  );
}
