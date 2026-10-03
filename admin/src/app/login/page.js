'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <AuthForm initialMode="login" onSuccess={handleSuccess} />
    </div>
  );
}
