'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictionResult {
  risk_score: number;
  risk_level: string;
  shap_values: number[];
  feature_names: string[];
  feature_values: number[];
}

interface SimilarCase {
  case_id: string;
  similarity: number;
  age: number;
  risk_score: number;
  outcome: string;
}

export default function PredictPage() {
  const [formData, setFormData] = useState({
    age: 0,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    cholesterol: 0,
    glucose: 0,
    bmi: 0,
    smoking: 0,
  });

  // Calculate risk score based on mock ML logic
  const calculateRiskScore = (data: typeof formData): number => {
    // Normalize values to 0-1 range
    const ageNorm = Math.min(data.age / 100, 1);
    const bpNorm = Math.min((data.blood_pressure_systolic / 200), 1);
    const cholNorm = Math.min(data.cholesterol / 300, 1);
    const bmiNorm = Math.min(data.bmi / 50, 1);
    const glucoseNorm = Math.min(data.glucose / 200, 1);

    // Risk Score formula
    const risk = 0.2 * ageNorm + 0.25 * bpNorm + 0.2 * cholNorm + 0.15 * bmiNorm + 0.2 * glucoseNorm + (data.smoking * 0.1);
    return Math.min(risk, 1) * 100; // Scale to 0-100
  };

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate that at least some data is entered
      if (formData.age === 0 && formData.blood_pressure_systolic === 0) {
        setError('Please enter patient data to get a prediction');
        setLoading(false);
        return;
      }

      // Calculate risk score using mock ML logic
      const riskScore = calculateRiskScore(formData);
      
      // Determine risk level
      let riskLevel = 'Low';
      if (riskScore > 70) riskLevel = 'High';
      else if (riskScore >= 40) riskLevel = 'Medium';

      // Generate SHAP-like feature importance (mock)
      const featureNames = ['Age', 'BP Systolic', 'Cholesterol', 'BMI', 'Glucose', 'Smoking'];
      const ageImpact = Math.abs((formData.age / 100) * 0.2);
      const bpImpact = Math.abs((formData.blood_pressure_systolic / 200) * 0.25);
      const cholImpact = Math.abs((formData.cholesterol / 300) * 0.2);
      const bmiImpact = Math.abs((formData.bmi / 50) * 0.15);
      const glucoseImpact = Math.abs((formData.glucose / 200) * 0.2);
      const smokingImpact = formData.smoking * 0.1;

      const shap_values = [ageImpact, bpImpact, cholImpact, bmiImpact, glucoseImpact, smokingImpact];

      const mockPrediction: PredictionResult = {
        risk_score: Math.round(riskScore * 10) / 10,
        risk_level: riskLevel,
        shap_values: shap_values,
        feature_names: featureNames,
        feature_values: [formData.age, formData.blood_pressure_systolic, formData.cholesterol, formData.bmi, formData.glucose, formData.smoking],
      };

      setPrediction(mockPrediction);

      // Generate similar mock cases
      const mockSimilarCases: SimilarCase[] = [
        {
          case_id: 'CASE-2024-001',
          similarity: 0.95,
          age: Math.round(formData.age * (0.95 + Math.random() * 0.1)),
          risk_score: Math.round(riskScore * (0.9 + Math.random() * 0.2) * 10) / 10,
          outcome: riskLevel === 'High' ? 'Intervention Required' : 'Stable',
        },
        {
          case_id: 'CASE-2024-002',
          similarity: 0.88,
          age: Math.round(formData.age * (0.88 + Math.random() * 0.15)),
          risk_score: Math.round(riskScore * (0.85 + Math.random() * 0.25) * 10) / 10,
          outcome: riskLevel === 'High' ? 'Intervention Required' : 'Stable',
        },
        {
          case_id: 'CASE-2024-003',
          similarity: 0.82,
          age: Math.round(formData.age * (0.80 + Math.random() * 0.15)),
          risk_score: Math.round(riskScore * (0.80 + Math.random() * 0.30) * 10) / 10,
          outcome: 'Improved',
        },
      ];
      setSimilarCases(mockSimilarCases);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const shaplyData = prediction ? prediction.feature_names.map((name, idx) => ({
    name,
    impact: Math.abs(prediction.shap_values[idx]),
  })) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Risk Assessment</h1>
        <p className="text-muted-foreground">
          Enter patient data to receive an AI-powered risk prediction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Patient Data</h2>
          
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Age (years)
              </label>
              <Input
                type="number"
                name="age"
                value={formData.age === 0 ? '' : String(formData.age)}
                onChange={handleInputChange}
                placeholder="e.g. 52"
                min="0"
                max="150"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                BP Systolic (mmHg)
              </label>
              <Input
                type="number"
                name="blood_pressure_systolic"
                value={formData.blood_pressure_systolic === 0 ? '' : String(formData.blood_pressure_systolic)}
                onChange={handleInputChange}
                placeholder="e.g. 130 mmHg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                BP Diastolic (mmHg)
              </label>
              <Input
                type="number"
                name="blood_pressure_diastolic"
                value={formData.blood_pressure_diastolic === 0 ? '' : String(formData.blood_pressure_diastolic)}
                onChange={handleInputChange}
                placeholder="e.g. 85 mmHg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cholesterol (mg/dL)
              </label>
              <Input
                type="number"
                name="cholesterol"
                value={formData.cholesterol === 0 ? '' : String(formData.cholesterol)}
                onChange={handleInputChange}
                placeholder="e.g. 210 mg/dL"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Glucose (mg/dL)
              </label>
              <Input
                type="number"
                name="glucose"
                value={formData.glucose === 0 ? '' : String(formData.glucose)}
                onChange={handleInputChange}
                placeholder="e.g. 105 mg/dL"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                BMI (kg/m²)
              </label>
              <Input
                type="number"
                name="bmi"
                value={formData.bmi === 0 ? '' : String(formData.bmi)}
                onChange={handleInputChange}
                placeholder="e.g. 27"
                step="0.1"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Smoking Status
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, smoking: 0 }))}
                  className={`flex-1 ${formData.smoking === 0 ? 'bg-primary text-white' : 'bg-muted'}`}
                  disabled={loading}
                >
                  No
                </Button>
                <Button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, smoking: 1 }))}
                  className={`flex-1 ${formData.smoking === 1 ? 'bg-primary text-white' : 'bg-muted'}`}
                  disabled={loading}
                >
                  Yes
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? 'Analyzing...' : 'Get Prediction'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {prediction && (
            <>
              <div className="bg-card rounded-xl p-8 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Risk Assessment Result</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
                    <div className="text-5xl font-bold text-primary">
                      {prediction.risk_score.toFixed(1)}%
                    </div>
                  </div>
                  <div className={`px-6 py-4 rounded-lg border ${getRiskColor(prediction.risk_level)}`}>
                    <div className="text-sm font-semibold uppercase">Risk Level</div>
                    <div className="text-3xl font-bold">{prediction.risk_level}</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {prediction.risk_level === 'Low' && 'Patient shows favorable health indicators with minimal disease risk.'}
                  {prediction.risk_level === 'Medium' && 'Patient requires monitoring and lifestyle modifications.'}
                  {prediction.risk_level === 'High' && 'Patient requires immediate clinical attention and intervention planning.'}
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Feature Importance (SHAP)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={shaplyData.sort((a, b) => b.impact - a.impact)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" width={190} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: `1px solid var(--border)`,
                      }}
                    />
                    <Bar dataKey="impact" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {similarCases.length > 0 && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Similar Cases</h3>
                  <div className="space-y-3">
                    {similarCases.map((case_, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{case_.case_id}</span>
                          <span className="text-sm text-muted-foreground">
                            Similarity: {(case_.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Age</p>
                            <p className="font-medium text-foreground">{case_.age} years</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Risk Score</p>
                            <p className="font-medium text-foreground">{case_.risk_score.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Outcome</p>
                            <p className="font-medium text-foreground">{case_.outcome}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
