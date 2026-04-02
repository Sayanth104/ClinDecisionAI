'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10">
            <div className="text-5xl">⚕️</div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              HealthAI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Intelligent Patient Risk Assessment with Explainable AI
            </p>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl">
            Leverage machine learning and SHAP explainability to predict patient health risks. 
            Understand the factors driving each prediction with transparent, interpretable AI.
          </p>

          <div className="flex gap-4 pt-4">
            <Link href="/login">
              <Button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="px-8 py-3 rounded-lg font-semibold">
                Create Account
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="text-lg font-bold text-foreground mb-2">ML-Powered Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning models trained on clinical data for accurate risk assessment
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-foreground mb-2">SHAP Explainability</h3>
              <p className="text-sm text-muted-foreground">
                Understand exactly which features drive each prediction with interactive visualizations
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Secure Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate encrypted clinical reports with passcode protection for patient privacy
              </p>
            </div>
          </div>

          <div className="mt-16 bg-primary/10 border border-primary/30 rounded-xl p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Demo Credentials</h2>
            <div className="text-left space-y-2 font-mono text-sm">
              <p><span className="text-muted-foreground">Email:</span> <span className="text-primary font-semibold">demo@healthcare.ai</span></p>
              <p><span className="text-muted-foreground">Password:</span> <span className="text-primary font-semibold">demo123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
