from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime, timedelta
import jwt
import bcrypt
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import shap
from cryptography.fernet import Fernet
import base64

app = FastAPI(title="Healthcare AI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Encryption key for reports
ENCRYPTION_KEY = base64.urlsafe_b64encode(b'dev-key-32-bytes-long-minimum123')

# Mock users database
users_db = {
    "demo@healthcare.ai": {
        "email": "demo@healthcare.ai",
        "password_hash": bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode(),
        "name": "Dr. Demo",
        "role": "physician"
    }
}

# Store for generated reports
reports_store = {}

# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PredictionRequest(BaseModel):
    age: float
    blood_pressure_systolic: float
    blood_pressure_diastolic: float
    cholesterol: float
    glucose: float
    bmi: float
    smoking: int

class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    shap_values: List[float]
    feature_names: List[str]
    feature_values: List[float]

class SimilarCaseResponse(BaseModel):
    case_id: str
    similarity: float
    age: float
    risk_score: float
    outcome: str

class ReportRequest(BaseModel):
    patient_id: str
    patient_name: str
    age: int
    risk_score: float
    risk_level: str
    recommendations: str
    passcode: str

class ReportResponse(BaseModel):
    report_id: str
    encrypted_url: str

# ML Models Setup
np.random.seed(42)

# Generate synthetic training data
n_samples = 500
features = {
    'age': np.random.normal(65, 15, n_samples),
    'bp_systolic': np.random.normal(130, 20, n_samples),
    'bp_diastolic': np.random.normal(80, 15, n_samples),
    'cholesterol': np.random.normal(200, 50, n_samples),
    'glucose': np.random.normal(100, 30, n_samples),
    'bmi': np.random.normal(27, 5, n_samples),
    'smoking': np.random.binomial(1, 0.3, n_samples),
}

X = np.column_stack([
    features['age'],
    features['bp_systolic'],
    features['bp_diastolic'],
    features['cholesterol'],
    features['glucose'],
    features['bmi'],
    features['smoking'],
])

# Create labels based on features (simulating healthcare outcomes)
y = ((features['age'] > 60) & (features['cholesterol'] > 200) & (features['bmi'] > 25)).astype(int)
y = (y + (features['smoking'] == 1) * 0.3 + (features['bp_systolic'] > 140) * 0.2).clip(0, 1)
y = (y > 0.5).astype(int)

# Train models
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

rf_model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=10)
rf_model.fit(X_scaled, y)

# KNN for finding similar cases
knn_model = NearestNeighbors(n_neighbors=3)
knn_model.fit(X_scaled)

# SHAP Explainer
explainer = shap.TreeExplainer(rf_model)

# Feature names
feature_names = ['Age', 'BP Systolic', 'BP Diastolic', 'Cholesterol', 'Glucose', 'BMI', 'Smoking']

# Authentication functions
def create_access_token(email: str, expires_delta: Optional[timedelta] = None):
    to_encode = {"sub": email}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(token: str = None):
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    return verify_token(token)

# Routes
@app.post("/api/auth/login", response_model=Token)
async def login(request: LoginRequest):
    user = users_db.get(request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(request.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(request.email, access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/signup", response_model=Token)
async def signup(request: LoginRequest):
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_password = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
    users_db[request.email] = {
        "email": request.email,
        "password_hash": hashed_password,
        "name": "New User",
        "role": "physician"
    }
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(request.email, access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest, token: str = None):
    email = get_current_user(token)
    
    # Prepare input
    input_data = np.array([[
        request.age,
        request.blood_pressure_systolic,
        request.blood_pressure_diastolic,
        request.cholesterol,
        request.glucose,
        request.bmi,
        request.smoking
    ]])
    
    # Scale input
    input_scaled = scaler.transform(input_data)
    
    # Get prediction
    risk_probability = rf_model.predict_proba(input_scaled)[0][1]
    risk_score = float(risk_probability) * 100
    
    # Determine risk level
    if risk_score < 30:
        risk_level = "Low"
    elif risk_score < 60:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    # Get SHAP values for explainability
    shap_values = explainer.shap_values(input_scaled)[1]  # Get shap values for class 1
    
    return PredictionResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        shap_values=shap_values.tolist(),
        feature_names=feature_names,
        feature_values=[
            request.age,
            request.blood_pressure_systolic,
            request.blood_pressure_diastolic,
            request.cholesterol,
            request.glucose,
            request.bmi,
            request.smoking
        ]
    )

@app.post("/api/similar-cases")
async def find_similar_cases(request: PredictionRequest, token: str = None):
    email = get_current_user(token)
    
    # Prepare input
    input_data = np.array([[
        request.age,
        request.blood_pressure_systolic,
        request.blood_pressure_diastolic,
        request.cholesterol,
        request.glucose,
        request.bmi,
        request.smoking
    ]])
    
    input_scaled = scaler.transform(input_data)
    
    # Find similar cases
    distances, indices = knn_model.kneighbors(input_scaled, n_neighbors=3)
    
    similar_cases = []
    for idx, distance in zip(indices[0], distances[0]):
        case_data = X[idx]
        risk_prob = rf_model.predict_proba(X_scaled[idx:idx+1])[0][1]
        
        similar_cases.append(SimilarCaseResponse(
            case_id=f"CASE-{idx:04d}",
            similarity=float(1 - distance),
            age=float(case_data[0]),
            risk_score=float(risk_prob * 100),
            outcome="Positive Recovery" if y[idx] == 0 else "Required Intervention"
        ))
    
    return {"similar_cases": similar_cases}

@app.post("/api/generate-report", response_model=ReportResponse)
async def generate_report(request: ReportRequest, token: str = None):
    email = get_current_user(token)
    
    report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Create report content
    report_content = {
        "report_id": report_id,
        "patient_id": request.patient_id,
        "patient_name": request.patient_name,
        "age": request.age,
        "risk_score": request.risk_score,
        "risk_level": request.risk_level,
        "recommendations": request.recommendations,
        "generated_at": datetime.now().isoformat(),
        "generated_by": email
    }
    
    # Encrypt the report
    cipher = Fernet(ENCRYPTION_KEY)
    encrypted_data = cipher.encrypt(json.dumps(report_content).encode())
    
    # Store report with passcode protection
    reports_store[report_id] = {
        "encrypted_data": encrypted_data,
        "passcode_hash": bcrypt.hashpw(request.passcode.encode(), bcrypt.gensalt()).decode()
    }
    
    return ReportResponse(
        report_id=report_id,
        encrypted_url=f"/api/access-report/{report_id}"
    )

@app.post("/api/access-report/{report_id}")
async def access_report(report_id: str, passcode: str = None):
    if report_id not in reports_store:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report = reports_store[report_id]
    
    if not passcode:
        raise HTTPException(status_code=400, detail="Passcode required")
    
    # Verify passcode
    if not bcrypt.checkpw(passcode.encode(), report["passcode_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid passcode")
    
    # Decrypt report
    cipher = Fernet(ENCRYPTION_KEY)
    try:
        report_content = json.loads(cipher.decrypt(report["encrypted_data"]).decode())
        return report_content
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to decrypt report")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/analytics")
async def get_analytics(token: str = None):
    email = get_current_user(token)
    
    # Generate mock analytics data
    return {
        "total_predictions": 142,
        "high_risk_count": 23,
        "medium_risk_count": 45,
        "low_risk_count": 74,
        "average_risk_score": 38.5,
        "predictions_by_day": [
            {"date": f"Day {i}", "count": np.random.randint(5, 20)} 
            for i in range(1, 8)
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
