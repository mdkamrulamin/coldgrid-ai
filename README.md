# ColdGrid AI

**Real-Time Renewable Cold Storage Monitoring & Prediction Platform**

ColdGrid AI is a full-stack software platform for monitoring renewable-powered cold storage systems. It ingests real-time telemetry from simulated IoT devices, tracks energy and storage conditions, detects operational risks, predicts potential failures, and generates AI-style operational summaries for decision support.

The MVP uses simulated devices instead of physical hardware, making it possible to build, test, and demonstrate the system without requiring sensors, batteries, turbines, or university lab equipment.

---

## Project Overview

Cold storage systems are important for food preservation, agriculture, healthcare, and off-grid communities. In many low-resource or renewable-powered environments, storage reliability depends on multiple changing factors such as battery level, generated power, temperature, humidity, cooling load, and device connectivity.

ColdGrid AI acts as the software intelligence layer for these systems.

It allows users to create and monitor cold-storage devices, receive live telemetry, view system health, detect alerts, predict risk, and generate plain-English operational summaries.

The first version follows a software-first digital twin approach, where a Python simulator sends realistic telemetry data to the backend as if it were coming from real hardware.

---

## Problem Statement

Cold storage failures can lead to food spoilage, financial loss, operational disruption, and safety risks. Many small businesses, farms, NGOs, and off-grid storage operators may not have an affordable way to monitor storage conditions and energy health in real time.

Common problems include:

- Temperature rising above safe limits
- Battery levels dropping unexpectedly
- Renewable power generation becoming unstable
- Cooling load increasing abnormally
- Devices going offline without notice
- Lack of early warnings before failure
- Difficulty understanding system trends from raw sensor data

ColdGrid AI helps address these problems by providing a real-time monitoring and prediction platform that can help users detect issues earlier and make better operational decisions.

---

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Devices

![Devices](docs/screenshots/devices.png)

### Device Detail

![Device Detail](docs/screenshots/device-detail.png)

### Risk Prediction

![Risk Prediction](docs/screenshots/risk-prediction.png)

### AI Summary

![AI Summary](docs/screenshots/ai-summary.png)

### Alerts

![Alerts](docs/screenshots/alerts.png)

### Telemetry Charts

![Telemetry Chart 1](docs/screenshots/device-detail-telemetry-1.png)

![Telemetry Chart 2](docs/screenshots/device-detail-telemetry-2.png)

### Resolved Alert History

![Resolved Alert History](docs/screenshots/device-detail-resolved-alert.png)

---

## Features

### User Authentication

- User registration
- User login
- JWT-based protected routes
- User-specific device and alert access

### Device Onboarding

Users can create cold-storage devices with configuration such as:

- Device name
- Location
- Storage type
- Safe temperature range
- Safe humidity range
- Battery warning threshold
- Public device UID
- Device API key for telemetry ingestion

The raw device API key is shown only once during device creation. The backend stores a hashed version of the API key.

### Real-Time Telemetry Ingestion

The backend receives telemetry from simulated IoT devices.

Telemetry includes:

- Temperature
- Humidity
- Battery level
- Generated power
- Cooling load
- Wind speed
- Device status
- Timestamp

Telemetry ingestion uses the device UID and device API key.

### Python Device Simulator

A Python simulator acts like a real IoT device and sends telemetry to the backend API.

Supported scenarios:

- Normal operation
- Battery drain
- Temperature rise
- Low power generation
- Cooling failure
- Sensor failure
- Power spike

Example command:

```bash
python simulator.py \
  --device dev_your_device_uid \
  --api-key YOUR_DEVICE_API_KEY \
  --scenario battery_drain
```

### Dashboard

The dashboard shows a high-level view of the user’s cold storage devices.

Dashboard metrics include:

- Total devices
- Devices with telemetry
- Active alerts
- Critical alerts
- Offline devices
- Latest status for each device

### Device Detail Page

Each device has a detailed monitoring page with:

- Device configuration
- Active alerts
- Risk prediction
- AI summary
- Current telemetry metrics
- Telemetry charts
- Recent telemetry table
- Resolved alert history

### Telemetry Charts

The frontend displays recent telemetry trends using Recharts.

Current charts include:

- Temperature
- Humidity
- Battery level
- Generated power
- Cooling load

The current MVP displays recent telemetry readings. Time-range filters such as last 1 hour, 6 hours, 24 hours, and 7 days are planned for a future version.

### Alert System

ColdGrid AI automatically generates alerts based on telemetry and device thresholds.

Alert types include:

- Temperature above safe range
- Temperature below safe range
- Humidity above safe range
- Humidity below safe range
- Battery below threshold
- Generated power drop
- Low generation
- High cooling load
- Cooling failure
- Sensor failure
- Device offline / missing telemetry

Alert severity levels:

- Low
- Medium
- High
- Critical

Alert status values:

- Active
- Resolved

Users can review active and resolved alerts and manually resolve active alerts.

### Offline Device Monitoring

The backend includes a background monitor that checks whether devices have stopped sending telemetry.

If a device does not send telemetry within the configured offline threshold, the system creates a persistent offline alert. When telemetry resumes, the offline alert is automatically resolved.

### Risk Prediction Engine

ColdGrid AI includes a practical rule-based prediction engine.

The prediction engine calculates:

- Battery drain rate per hour
- Estimated time until battery reaches threshold
- Temperature change rate per hour
- Estimated time until temperature crosses a safe threshold
- Power-to-cooling ratio
- Active alert count
- Critical alert count
- Offline alert status
- Overall risk score
- Overall risk level

Risk levels:

- Low
- Medium
- High
- Critical

Example output:

> Battery may fall below 30% in 2 minutes 24 seconds if current drain continues.

Example output:

> Temperature may exceed 8°C in 12 hours 43 minutes if current trend continues.

### AI-Style Operational Summary

ColdGrid AI generates plain-English operational summaries using:

- Last 24 hours of telemetry
- Active alerts
- Latest prediction
- Device thresholds
- Current risk level

The first version uses a rule-based summary engine so the feature works reliably without depending on an external AI API.

Example summary:

> Cold Room 1 reported 20 telemetry readings in the last 24 hours. Temperature ranged from 2.8°C to 7.4°C, with an average of 4.9°C. Battery decreased during the summary window. Current risk is medium. There is one active alert. Recommended action: monitor battery level and check power input if generation remains low.

### Product Polish

The frontend includes:

- Responsive dashboard layout
- Loading skeletons
- Empty states
- Page-level error messages
- Reusable UI components
- Mobile-friendly card layouts
- Horizontally scrollable tables on smaller screens

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Router

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic
- JWT authentication

### Simulator

- Python
- Requests
- Scenario-based telemetry generation

### Development Tools

- Docker for local PostgreSQL
- Alembic for database migrations
- FastAPI Swagger UI for API testing
- Git and GitHub for version control

---

## Architecture Overview

```text
Python Device Simulator
        |
        v
FastAPI Backend
        |
        v
PostgreSQL Database
        |
        v
React + TypeScript Dashboard
```

### System Flow

1. A user registers and logs in.
2. The user creates a cold-storage device.
3. The backend generates a public device UID and device API key.
4. The Python simulator sends telemetry using the device UID and API key.
5. The FastAPI backend validates the API key.
6. Telemetry is stored in PostgreSQL.
7. Alert rules evaluate incoming telemetry.
8. The offline monitor checks for missing telemetry.
9. The prediction engine calculates future risk.
10. The AI summary engine generates plain-English operational summaries.
11. The React dashboard displays devices, telemetry, alerts, predictions, and summaries.

---

## Data Model

### User

Stores user account information.

Main fields:

- id
- name
- email
- hashed_password
- created_at

### Device

Stores cold-storage device configuration.

Main fields:

- id
- device_uid
- user_id
- name
- location
- storage_type
- min_temperature
- max_temperature
- min_humidity
- max_humidity
- battery_threshold
- api_key_hash
- created_at

### Telemetry

Stores incoming device telemetry.

Main fields:

- id
- device_id
- timestamp
- temperature
- humidity
- battery_level
- generated_power
- cooling_load
- wind_speed
- status

### Alert

Stores generated system alerts.

Main fields:

- id
- device_id
- alert_type
- severity
- message
- status
- created_at
- resolved_at

### Prediction

Stores risk prediction results.

Main fields:

- id
- device_id
- risk_level
- risk_score
- summary
- battery_current_level
- battery_drain_rate_per_hour
- battery_threshold
- estimated_hours_to_battery_threshold
- temperature_current
- temperature_change_rate_per_hour
- estimated_hours_to_temperature_threshold
- generated_power_current
- cooling_load_current
- power_to_cooling_ratio
- active_alert_count
- critical_alert_count
- offline_alert_active
- created_at

### AI Summary

Stores generated operational summaries.

Main fields:

- id
- device_id
- summary
- risk_level
- recommended_actions
- data_start_at
- data_end_at
- telemetry_count
- active_alert_count
- prediction_id
- created_at

---

## API Overview

FastAPI provides interactive API documentation at:

```http
/docs
```

Main API groups:

### Authentication

```http
POST /auth/register
POST /auth/login
GET /auth/me
```

### Devices

```http
POST /devices
GET /devices
GET /devices/{device_id}
PATCH /devices/{device_id}
DELETE /devices/{device_id}
```

### Telemetry

```http
POST /telemetry
GET /devices/{device_uid}/telemetry
GET /devices/{device_uid}/telemetry/latest
```

### Alerts

```http
GET /alerts
GET /devices/{device_uid}/alerts
PATCH /alerts/{alert_id}/resolve
```

### Predictions

```http
POST /devices/{device_uid}/predictions/run
GET /devices/{device_uid}/predictions/latest
```

### AI Summaries

```http
POST /devices/{device_uid}/ai-summary
GET /devices/{device_uid}/ai-summary/latest
```

---

## Running Locally

### Prerequisites

Install:

- Python 3.12+
- Node.js
- Docker
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/mdkamrulamin/coldgrid-ai.git
cd coldgrid-ai
```

---

### 2. Start PostgreSQL with Docker

Example local PostgreSQL container:

```bash
docker run --name coldgrid-postgres \
  -e POSTGRES_USER=testdb \
  -e POSTGRES_PASSWORD=testdb \
  -e POSTGRES_DB=coldgrid_ai \
  -p 5432:5432 \
  -d postgres:16
```

If the container already exists, start it with:

```bash
docker start coldgrid-postgres
```

---

### 3. Configure backend environment variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://testdb:testdb@localhost:5432/coldgrid_ai
JWT_SECRET_KEY=replace_with_a_secure_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_HOST=localhost
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=
```

`OPENAI_API_KEY` is optional for the current MVP because the AI summary feature uses a rule-based summary engine.

---

### 4. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at:

```http
http://localhost:8000
```

Swagger API docs:

```http
http://localhost:8000/docs
```

---

### 5. Configure frontend environment variables

Create `frontend/.env`.

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

### 6. Run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```http
http://localhost:5173
```

---

### 7. Run the simulator

Open a new terminal:

```bash
cd simulator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Then run a scenario:

```bash
python simulator.py \
  --device dev_your_device_uid \
  --api-key YOUR_DEVICE_API_KEY \
  --scenario normal
```

Example scenarios:

```bash
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario battery_drain
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario temperature_rise
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario low_generation
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario cooling_failure
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario sensor_failure
python simulator.py --device dev_your_device_uid --api-key YOUR_DEVICE_API_KEY --scenario power_spike
```

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret key used to sign JWT tokens |
| `JWT_ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry duration |
| `BACKEND_HOST` | Backend host |
| `BACKEND_PORT` | Backend port |
| `FRONTEND_URL` | Frontend origin for CORS |
| `OPENAI_API_KEY` | Optional placeholder for future OpenAI integration |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## Project Structure

```text
coldgrid-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── alembic/
├── frontend/
│   └── src/
│       ├── components/
│       ├── lib/
│       ├── pages/
│       ├── services/
│       └── types/
├── simulator/
│   ├── scenarios/
│   └── simulator.py
├── docs/
│   └── screenshots/
└── README.md
```

---

## Current Status

ColdGrid AI is currently a working local MVP.

Implemented:

- Backend API with authentication
- PostgreSQL database models and migrations
- Device CRUD and secure telemetry ingestion
- Python scenario-based simulator
- Telemetry charts
- Alert generation and resolution
- Offline device monitoring
- Risk prediction engine
- AI-style summary generation
- React dashboard with responsive UI polish
- Loading skeletons and empty states
- README screenshots

Not yet implemented:

- Production deployment
- Historical chart time filters
- Risk level trend chart
- Advanced anomaly detection using rolling averages or Z-score logic
- Real OpenAI-powered summary enhancement
- Real hardware integration

---

## Future Roadmap

### Short-Term Improvements

- Add historical chart filters:
  - Last 1 hour
  - Last 6 hours
  - Last 24 hours
  - Last 7 days
- Add risk level trend chart over time
- Improve dashboard summary cards with prediction context
- Add pagination or filtering for telemetry history
- Add CSV export for telemetry and alerts
- Add more polished README demo screenshots or GIFs

### Version 2 — Strong Upgrade Features

- WebSocket live dashboard updates
- MQTT support for IoT-style communication
- More realistic digital twin simulation engine
- Advanced anomaly detection with rolling averages
- Z-score based abnormal behavior detection
- Advanced forecasting models
- Email alert notifications
- Daily and weekly report generation
- Multi-device organization dashboard
- Maintenance recommendation engine
- Optional OpenAI-powered summary enhancement

### Version 3 — Hardware Integration and Business-Ready Features

- Real hardware integration with ESP32 or Raspberry Pi
- Hardware-agnostic device integration
- Device SDK or sample integration scripts
- Weather-aware risk prediction
- Storage-specific spoilage risk model
- Predictive maintenance engine
- Role-based access control
- Offline device buffering
- Multi-tenant SaaS support
- Audit logs
- Subscription and billing structure

---

## Long-Term Vision

ColdGrid AI can evolve into a hardware-agnostic AI monitoring platform for cold storage and off-grid energy systems.

The long-term goal is to help small businesses, farms, NGOs, and operators of renewable-powered storage systems detect risks earlier, reduce spoilage, improve energy reliability, and make better operational decisions using real-time telemetry and AI-driven insights.