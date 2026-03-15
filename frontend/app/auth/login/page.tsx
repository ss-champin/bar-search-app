import { Suspense } from 'react';
import LoginForm from './components/LoginForm';

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-pulse">
      <div className="h-96 rounded-2xl bg-gray-200/50" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
