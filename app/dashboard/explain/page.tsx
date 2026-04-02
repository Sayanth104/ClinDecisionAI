'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function ExplainPage() {
  const [sliderValues, setSliderValues] = useState({
    age: 65,
    bp_systolic: 140,
    bp_diastolic: 90,
    cholesterol: 240,
    glucose: 110,
    bmi: 28,
    smoking: 0,
  });

  const features = [
    { key: 'age', label: 'Age', min: 20, max: 100, unit: 'years' },
    { key: 'bp_systolic', label: 'BP Systolic', min: 80, max: 200, unit: 'mmHg' },
    { key: 'bp_diastolic', label: 'BP Diastolic', min: 40, max: 130, unit: 'mmHg' },
    { key: 'cholesterol', label: 'Cholesterol', min: 100, max: 350, unit: 'mg/dL' },
    { key: 'glucose', label: 'Glucose', min: 70, max: 250, unit: 'mg/dL' },
    { key: 'bmi', label: 'BMI', min: 15, max: 45, unit: 'kg/m²' },
  ];

  // Calculate mock SHAP values based on current slider values
  const calculateMockResult = (sliders: any) => {
    const ageNorm = Math.min(sliders.age / 100, 1);
    const bpNorm = Math.min((sliders.bp_systolic / 200), 1);
    const cholNorm = Math.min(sliders.cholesterol / 300, 1);
    const bmiNorm = Math.min(sliders.bmi / 50, 1);
    const glucoseNorm = Math.min(sliders.glucose / 200, 1);

    const risk = 0.2 * ageNorm + 0.25 * bpNorm + 0.2 * cholNorm + 0.15 * bmiNorm + 0.2 * glucoseNorm + (sliders.smoking * 0.1);
    const riskScore = Math.round(Math.min(risk, 1) * 100 * 10) / 10;
    
    let riskLevel = 'Low';
    if (riskScore > 70) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      feature_names: ['Age', 'BP Systolic', 'Cholesterol', 'BMI', 'Glucose', 'Smoking'],
      shap_values: [
        ageNorm * 0.2,
        bpNorm * 0.25,
        cholNorm * 0.2,
        bmiNorm * 0.15,
        glucoseNorm * 0.2,
        sliders.smoking * 0.1,
      ],
    };
  };

  const [result, setResult] = useState<any>(calculateMockResult(sliderValues));

  const handleSliderChange = (key: string, value: number) => {
    const newSliders = { ...sliderValues, [key]: value };
    setSliderValues(newSliders);
    setResult(calculateMockResult(newSliders));
  };

  const shaplyData = result ? result.feature_names.map((name: string, idx: number) => ({
    name,
    value: result.shap_values[idx],
    impact: Math.abs(result.shap_values[idx]),
  })) : [];

  const barData = features.map(f => ({
    name: f.label,
    value: (sliderValues as any)[f.key],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Explainability Dashboard</h1>
        <p className="text-muted-foreground">
          Interactively explore how features impact risk predictions using SHAP values
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border sticky top-20">
            <h2 className="text-xl font-bold text-foreground mb-4">Adjust Features</h2>
            
            <div className="space-y-4">
              {features.map(feature => (
                <div key={feature.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-foreground">
                      {feature.label}
                    </label>
                    <span className="text-sm font-semibold text-primary">
                      {(sliderValues as any)[feature.key].toFixed(1)} {feature.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={feature.min}
                    max={feature.max}
                    value={(sliderValues as any)[feature.key]}
                    onChange={(e) => handleSliderChange(feature.key, parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Smoking Status
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSliderChange('smoking', 0)}
                    className={`flex-1 ${sliderValues.smoking === 0 ? 'bg-primary text-white' : 'bg-muted'}`}
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => handleSliderChange('smoking', 1)}
                    className={`flex-1 ${sliderValues.smoking === 1 ? 'bg-primary text-white' : 'bg-muted'}`}
                  >
                    Yes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Current Risk Assessment</h2>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-primary">{result.risk_score.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.risk_level} Risk</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adjust the sliders on the left to see how changes in patient features affect the risk score in real-time.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Feature Impact (SHAP Values)</h2>
                <div className="text-sm text-muted-foreground mb-4">
                  Shows how each feature contributes to the risk prediction. Positive values increase risk, negative values decrease it.
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={shaplyData.sort((a: any, b: any) => b.impact - a.impact)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" width={110} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Bar dataKey="value" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Current Feature Values</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Bar dataKey="value" fill="var(--secondary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Understanding SHAP Values</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Positive values:</strong> Features that increase the risk score</li>
                  <li>• <strong>Negative values:</strong> Features that decrease the risk score</li>
                  <li>• <strong>Larger magnitudes:</strong> Features that have stronger impact on prediction</li>
                  <li>• <strong>SHAP:</strong> SHapley Additive exPlanations - a method from game theory for explaining predictions</li>
                </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
