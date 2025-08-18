'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const ClearUserStorageOnLogout = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const currentUser = session.user.email || session.user.username;
      localStorage.setItem('lastLoggedInUser', JSON.stringify(currentUser));
    }

    if (status === 'unauthenticated') {
      localStorage.removeItem('lastLoggedInUser');
    }
  }, [session, status]);

  return null;
};

export default ClearUserStorageOnLogout;
