'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface AnalyticsData {
  total_predictions: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  predictions_by_day: Array<{ date: string; count: number }>;
}

export default function AnalyticsPage() {
  // Initialize with realistic 1000-patient dataset - NEVER null
  const defaultAnalytics: AnalyticsData = {
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
  };

  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);

  // Monthly risk trends data
  const monthlyRiskData = [
    { month: 'January', high: 60 },
    { month: 'February', high: 75 },
    { month: 'March', high: 90 },
    { month: 'April', high: 110 },
  ];

  // Risk category comparison data
  const riskCategoryData = [
    { category: 'Low Risk', count: 500 },
    { category: 'Medium Risk', count: 320 },
    { category: 'High Risk', count: 180 },
  ];

  // Age distribution data
  const ageDistributionData = [
    { ageGroup: '20–30', count: 150 },
    { ageGroup: '30–40', count: 250 },
    { ageGroup: '40–50', count: 300 },
    { ageGroup: '50–60', count: 200 },
    { ageGroup: '60+', count: 100 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: analytics?.low_risk_count || 500, fill: '#16a34a' },
    { name: 'Medium Risk', value: analytics?.medium_risk_count || 320, fill: '#eab308' },
    { name: 'High Risk', value: analytics?.high_risk_count || 180, fill: '#dc2626' },
  ];

  const COLORS = ['#16a34a', '#eab308', '#dc2626'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          System-wide insights and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Predictions</p>
          <p className="text-3xl font-bold text-foreground">{analytics?.total_predictions || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Average Risk Score</p>
          <p className="text-3xl font-bold text-primary">{(analytics?.average_risk_score || 0).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-2">System average</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">High Risk Cases</p>
          <p className="text-3xl font-bold text-red-600">{analytics?.high_risk_count || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {(((analytics?.high_risk_count || 0) / (analytics?.total_predictions || 1)) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Low Risk Cases</p>
          <p className="text-3xl font-bold text-green-600">{analytics?.low_risk_count || 0}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {(((analytics?.low_risk_count || 0) / (analytics?.total_predictions || 1)) * 100).toFixed(1)}% of total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-2">Monthly Risk Trends</h2>
          <p className="text-sm text-muted-foreground mb-4">High risk cases trend over 4 months (January to April).</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRiskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="high" stroke="#dc2626" strokeWidth={2} name="High Risk Cases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-2">Risk Category Comparison</h2>
          <p className="text-sm text-muted-foreground mb-4">Comparison of patient counts across different risk categories showing distribution percentages.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-2">Patient Risk Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">Overall distribution of patients across low, medium, and high risk categories as a percentage breakdown.</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-2">Patient Age Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">Distribution of patients by age group showing the demographics of the patient population.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ageGroup" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">System Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Model Accuracy</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Training Accuracy</span>
                <span className="font-semibold text-foreground">94.3%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '94.3%' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Data Quality</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Complete Records</span>
                <span className="font-semibold text-foreground">98.7%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '98.7%' }} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">System Health</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-semibold text-foreground">99.9%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
