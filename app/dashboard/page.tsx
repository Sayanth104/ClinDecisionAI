'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  total_predictions: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  predictions_by_day: Array<{ date: string; count: number }>;
  risk_distribution: Array<{ name: string; value: number }>;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with realistic 1000-patient dataset
    const defaultData: AnalyticsData = {
      total_predictions: 1000,
      high_risk_count: 180,
      medium_risk_count: 320,
      low_risk_count: 500,
      average_risk_score: 42.3,
      predictions_by_day: [
        { date: 'Mon', count: 120 },
        { date: 'Tue', count: 140 },
        { date: 'Wed', count: 110 },
        { date: 'Thu', count: 170 },
        { date: 'Fri', count: 150 },
        { date: 'Sat', count: 120 },
        { date: 'Sun', count: 90 },
      ],
      risk_distribution: [
        { name: 'Low Risk', value: 500 },
        { name: 'Medium Risk', value: 320 },
        { name: 'High Risk', value: 180 },
      ],
    };
    setAnalytics(defaultData);
  }, []);

  const statCards = [
    {
      title: 'Total Predictions',
      value: analytics?.total_predictions || 0,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'High Risk Cases',
      value: analytics?.high_risk_count || 0,
      color: 'bg-destructive/10 text-destructive',
    },
    {
      title: 'Medium Risk Cases',
      value: analytics?.medium_risk_count || 0,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Low Risk Cases',
      value: analytics?.low_risk_count || 0,
      color: 'bg-secondary/10 text-secondary',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back, Doctor</h1>
        <p className="text-muted-foreground">
          Monitor patient risk assessments and clinical insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.color} rounded-xl p-6 border border-border/50`}
          >
            <p className="text-sm font-medium opacity-80 mb-2">{card.title}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Prediction Trend</h2>
          {analytics?.predictions_by_day && (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.predictions_by_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: `1px solid var(--border)`,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Shows how patient risk predictions change over time based on recent assessments.
              </p>
            </>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Risk Distribution</h2>
          {analytics?.risk_distribution && (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.risk_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="var(--primary)" />
                    <Cell fill="var(--accent)" />
                    <Cell fill="var(--destructive)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: `1px solid var(--border)`,
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                This chart shows the distribution of low, medium, and high risk patients.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-2">Average Risk Assessment</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Average predicted health risk based on current patient dataset.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-5xl font-bold text-primary">
            {analytics?.average_risk_score?.toFixed(1) || 0}%
          </div>
          <Link href="/dashboard/predict" className="block">
            <Button className="bg-primary hover:bg-primary/90">
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/predict" className="block">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition cursor-pointer h-full">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">
              Run predictions on patient data with AI explainability
            </p>
          </div>
        </Link>

        <Link href="/dashboard/explain" className="block">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition cursor-pointer h-full">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Explainability</h3>
            <p className="text-sm text-muted-foreground">
              Understand how the model makes predictions with SHAP
            </p>
          </div>
        </Link>

        <Link href="/dashboard/reports" className="block">
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition cursor-pointer h-full">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Reports</h3>
            <p className="text-sm text-muted-foreground">
              Generate and access encrypted clinical reports
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
