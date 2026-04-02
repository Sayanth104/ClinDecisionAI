'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      const userEmail = localStorage.getItem('userEmail') || 'demo@healthcare.ai';
      setUser({ email: userEmail, name: 'Dr. User' });
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  if (!mounted || !user) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="text-2xl">⚕️</div>
              <span className="text-xl font-bold text-primary">HealthAI</span>
            </Link>

            <div className="hidden md:flex gap-6 items-center">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/predict"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                Risk Assessment
              </Link>
              <Link
                href="/dashboard/explain"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                Explainability
              </Link>
              <Link
                href="/dashboard/analytics"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/reports"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition"
              >
                Reports
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
