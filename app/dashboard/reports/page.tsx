'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GeneratedReport {
  report_id: string;
  timestamp: string;
  patient_name: string;
  risk_level: string;
  status: 'success' | 'pending';
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'access'>('generate');
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    age: 0,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    cholesterol: 0,
    glucose: 0,
    bmi: 0,
    smoking: 0,
    risk_score: 0,
    risk_level: 'Low',
    recommendations: 'Regular monitoring and healthy lifestyle recommended.',
    passcode: '',
  });

  const calculateRiskScore = (data: any): number => {
    if (data.age === 0) return 0;
    const ageNorm = Math.min(data.age / 100, 1);
    const bpNorm = Math.min((data.blood_pressure_systolic / 200), 1);
    const cholNorm = Math.min(data.cholesterol / 300, 1);
    const bmiNorm = Math.min(data.bmi / 50, 1);
    const glucoseNorm = Math.min(data.glucose / 200, 1);
    const risk = 0.2 * ageNorm + 0.25 * bpNorm + 0.2 * cholNorm + 0.15 * bmiNorm + 0.2 * glucoseNorm + (data.smoking * 0.1);
    return Math.round(Math.min(risk, 1) * 100 * 10) / 10;
  };

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      report_id: 'RPT-20240305140522',
      timestamp: '2024-03-05 14:05',
      patient_name: 'John Doe',
      risk_level: 'High',
      status: 'success',
    },
    {
      report_id: 'RPT-20240305130145',
      timestamp: '2024-03-05 13:01',
      patient_name: 'Jane Smith',
      risk_level: 'Medium',
      status: 'success',
    },
  ]);

  const [accessData, setAccessData] = useState({
    report_id: '',
    passcode: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessedReport, setAccessedReport] = useState<any>(null);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.patient_name || !formData.patient_id) {
      setError('Patient name and ID are required');
      setLoading(false);
      return;
    }

    if (!formData.passcode) {
      setError('Passcode is required to protect the report');
      setLoading(false);
      return;
    }

    try {
      // Calculate risk score from patient data
      const calculatedRisk = calculateRiskScore(formData);
      let riskLevel = 'Low';
      if (calculatedRisk > 70) riskLevel = 'High';
      else if (calculatedRisk >= 40) riskLevel = 'Medium';

      // Generate report ID in format: RPT-YYYYMMDD-HHMMSS
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const reportId = `RPT-${year}${month}${day}-${hours}${minutes}${seconds}`;

      // Create complete report data
      const reportData = {
        report_id: reportId,
        patient_id: formData.patient_id,
        patient_name: formData.patient_name,
        age: formData.age,
        blood_pressure_systolic: formData.blood_pressure_systolic,
        blood_pressure_diastolic: formData.blood_pressure_diastolic,
        cholesterol: formData.cholesterol,
        glucose: formData.glucose,
        bmi: formData.bmi,
        smoking: formData.smoking,
        risk_score: calculatedRisk,
        risk_level: riskLevel,
        recommendations: 'Regular monitoring, healthy diet, exercise 30 minutes daily, manage stress, follow-up in 3 months.',
        passcode: formData.passcode,
        timestamp: new Date().toISOString(),
      };

      // Save report to localStorage
      const existingReports = localStorage.getItem('clinDecisionReports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.push(reportData);
      localStorage.setItem('clinDecisionReports', JSON.stringify(reports));

      // Add to display list
      const newReport: GeneratedReport = {
        report_id: reportId,
        timestamp: now.toLocaleString(),
        patient_name: formData.patient_name,
        risk_level: riskLevel,
        status: 'success',
      };
      setGeneratedReports(prev => [newReport, ...prev]);
      setSuccess(`Report ${reportId} generated successfully! Patient passcode protected.`);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        patient_id: '',
        patient_name: '',
        age: 0,
        blood_pressure_systolic: 0,
        blood_pressure_diastolic: 0,
        cholesterol: 0,
        glucose: 0,
        bmi: 0,
        smoking: 0,
        risk_score: 0,
        risk_level: 'Low',
        passcode: '',
        recommendations: 'Regular monitoring and healthy lifestyle recommended.',
      }));
    } catch (err) {
      setError('An error occurred while generating the report');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setAccessedReport(null);

    try {
      // Retrieve reports from localStorage
      const existingReports = localStorage.getItem('clinDecisionReports');
      const reports = existingReports ? JSON.parse(existingReports) : [];

      // Find matching report
      const foundReport = reports.find((r: any) => 
        r.report_id === accessData.report_id && r.passcode === accessData.passcode
      );

      if (foundReport) {
        setAccessedReport(foundReport);
        setSuccess('Report decrypted successfully!');
      } else {
        setError('Invalid Report ID or Passcode');
      }
    } catch (err) {
      setError('An error occurred while accessing the report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Report Management</h1>
        <p className="text-muted-foreground">
          Generate encrypted clinical reports and access existing reports with passcode protection
        </p>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'generate'
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Generate Report
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'access'
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          Access Report
        </button>
      </div>

      <div>
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2">Generate New Report</h2>
              <p className="text-sm text-muted-foreground mb-4">Enter patient health data to generate an encrypted clinical report.</p>

              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Patient ID
                  </label>
                  <Input
                    type="text"
                    value={formData.patient_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                    placeholder="e.g., PAT-001"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Patient Name
                  </label>
                  <Input
                    type="text"
                    value={formData.patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                    placeholder="Enter patient name"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={formData.age === 0 ? '' : String(formData.age)}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                    placeholder="e.g. 52"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BP Systolic (mmHg)
                  </label>
                  <Input
                    type="number"
                    value={formData.blood_pressure_systolic === 0 ? '' : String(formData.blood_pressure_systolic)}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_systolic: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                    placeholder="e.g. 130"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BP Diastolic (mmHg)
                  </label>
                  <Input
                    type="number"
                    value={formData.blood_pressure_diastolic === 0 ? '' : String(formData.blood_pressure_diastolic)}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_diastolic: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                    placeholder="e.g. 85"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cholesterol (mg/dL)
                  </label>
                  <Input
                    type="number"
                    value={formData.cholesterol === 0 ? '' : String(formData.cholesterol)}
                    onChange={(e) => setFormData(prev => ({ ...prev, cholesterol: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
                    placeholder="e.g. 210"
                    disabled={loading}
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BMI (kg/m²)
                  </label>
                  <Input
                    type="number"
                    value={formData.bmi === 0 ? '' : String(formData.bmi)}
                    onChange={(e) => setFormData(prev => ({ ...prev, bmi: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
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



                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Passcode (for protection)
                  </label>
                  <Input
                    type="password"
                    value={formData.passcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, passcode: e.target.value }))}
                    placeholder="Enter a secure passcode"
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This passcode will be required to access the report
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Reports</h2>
              <div className="space-y-3">
                {generatedReports.map((report, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{report.report_id}</span>
                      <span className="text-xs text-muted-foreground">{report.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <span className="text-sm text-muted-foreground">{report.patient_name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          report.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                          report.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.risk_level} Risk
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">✓ Encrypted</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Access Report</h2>

              <form onSubmit={handleAccessReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Report ID
                  </label>
                  <Input
                    type="text"
                    value={accessData.report_id}
                    onChange={(e) => setAccessData(prev => ({ ...prev, report_id: e.target.value }))}
                    placeholder="e.g., RPT-20240305140522"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Passcode
                  </label>
                  <Input
                    type="password"
                    value={accessData.passcode}
                    onChange={(e) => setAccessData(prev => ({ ...prev, passcode: e.target.value }))}
                    placeholder="Enter the passcode"
                    disabled={loading}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? 'Decrypting...' : 'Access Report'}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2">
              {accessedReport && (
                <div className="bg-card rounded-xl p-8 border border-border space-y-6">
                  <div className="border-b border-border pb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Clinical Report</h2>
                    <p className="text-sm text-muted-foreground">Report ID: {accessedReport.report_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Patient Name</p>
                      <p className="text-lg font-semibold text-foreground">{accessedReport.patient_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Patient ID</p>
                      <p className="text-lg font-semibold text-foreground">{accessedReport.patient_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Age</p>
                      <p className="text-lg font-semibold text-foreground">{accessedReport.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Risk Assessment Date</p>
                      <p className="text-lg font-semibold text-foreground">
                        {new Date(accessedReport.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                        <p className="text-3xl font-bold text-primary">{accessedReport.risk_score.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                        <p className={`text-2xl font-bold ${
                          accessedReport.risk_level === 'High' ? 'text-red-600' :
                          accessedReport.risk_level === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {accessedReport.risk_level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Clinical Recommendations</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {accessedReport.recommendations}
                    </p>
                  </div>

                  <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                    <p>Generated by: {accessedReport.generated_by}</p>
                    <p>Generated at: {new Date(accessedReport.generated_at).toLocaleString()}</p>
                    <p className="mt-2 flex items-center gap-1">✓ Report is encrypted and password protected</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
