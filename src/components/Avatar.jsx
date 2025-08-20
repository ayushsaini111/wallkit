'use client';

import Image from 'next/image';

export default function Avatar({ src, alt, className = "" }) {
  // console.log("Avatar src:", src);

  return (
    <div
      className={`w-13 h-13 rounded-full overflow-hidden  ${className}`}
      // style={{ width: '50px', height: '50px' }} // or any fixed size you want
    >
      <Image
        src={src || '/avatar.png'}
        alt={alt || 'User Avatar'}
        width={40} // must provide
        height={40} // must provide
        className="w-full h-full object-cover"
      />
    </div>
  );
}
