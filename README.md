# ColdGrid AI

**Real-Time Renewable Cold Storage Monitoring & Prediction Platform**

ColdGrid AI is a full-stack software platform for monitoring renewable-powered cold storage systems. It ingests real-time telemetry from simulated IoT devices, tracks energy and storage conditions, detects operational risks, predicts potential failures, and generates AI-powered summaries for decision support.

The MVP uses simulated devices instead of physical hardware, making it possible to build, test, and demonstrate the system without requiring sensors, turbines, batteries, or university lab equipment.

---

## Project Idea

Cold storage systems are important for food preservation, agriculture, healthcare, and off-grid communities. In many low-resource or renewable-powered environments, storage reliability depends on multiple changing factors such as battery level, generated power, temperature, humidity, cooling load, and weather conditions.

ColdGrid AI acts as the software intelligence layer for these systems.

It allows a user to create and monitor cold-storage devices, receive live telemetry, view system health, detect alerts, predict risk, and generate plain-English operational summaries.

The first version focuses on a software-first digital twin approach, where a Python simulator sends realistic telemetry data to the backend as if it were coming from real hardware.

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

ColdGrid AI aims to solve this by providing a real-time monitoring and prediction platform that can help users detect problems earlier and make better operational decisions.

---

## Planned Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database

- PostgreSQL
- Planned hosted option: Neon PostgreSQL

### AI / Prediction Layer

- Rule-based risk engine for MVP
- Basic anomaly detection
- Battery depletion prediction
- Temperature risk prediction
- AI-generated operational summaries
- OpenAI API integration planned after core platform is working

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

### Simulator

- Python-based device simulator
- Sends live telemetry to backend API
- Supports multiple operating scenarios

---

## MVP Features

### 1. User Authentication

Users can:

- Register
- Log in
- Access protected dashboard pages
- Manage their own devices and data

Authentication will use JWT-based access tokens.

---

### 2. Device Onboarding

Users can create cold-storage devices with configuration such as:

- Device name
- Location
- Storage type
- Safe temperature range
- Safe humidity range
- Battery warning threshold
- Device ID
- API key for telemetry ingestion

Example device:

```json
{
  "name": "Cold Room 1",
  "location": "Ottawa Test Unit",
  "storageType": "Vegetables",
  "minTemperature": 0,
  "maxTemperature": 5,
  "minHumidity": 60,
  "maxHumidity": 80,
  "batteryThreshold": 25
}
```

---

### 3. Real-Time Telemetry Ingestion

The backend will receive device telemetry through an API endpoint.

Example endpoint:

```http
POST /api/telemetry
```

Example payload:

```json
{
  "deviceId": "cold-room-001",
  "temperature": 4.7,
  "humidity": 72,
  "batteryLevel": 68,
  "generatedPower": 340,
  "coolingLoad": 210,
  "windSpeed": 5.8,
  "status": "normal"
}
```

---

### 4. Device Simulator

A Python simulator will act like a real IoT device and send telemetry data to the backend.

Planned scenarios:

- Normal operation
- Battery drain
- Temperature rise
- Low power generation
- Cooling failure
- Sensor failure
- Sudden abnormal spike
- High cooling load

Example command:

```bash
python simulator.py --device cold-room-001 --api-key YOUR_API_KEY --scenario battery_drain
```

---

### 5. Live Dashboard

The frontend dashboard will display the current status of each device.

Dashboard metrics:

- Current temperature
- Humidity
- Battery level
- Generated power
- Cooling load
- Wind speed / renewable input
- Device status
- Last updated time

---

### 6. Historical Charts

Users will be able to view historical trends using charts.

Planned charts:

- Temperature over time
- Humidity over time
- Battery level over time
- Generated power over time
- Cooling load over time
- Risk level over time

Planned filters:

- Last 1 hour
- Last 6 hours
- Last 24 hours
- Last 7 days

---

### 7. Alert System

The system will automatically generate alerts based on telemetry and device thresholds.

Alert types:

- Temperature above safe range
- Temperature below safe range
- Humidity outside safe range
- Battery below threshold
- Generated power drop
- Cooling load unusually high
- Device offline / missing telemetry
- Abnormal sensor values

Alert severity levels:

- Low
- Medium
- High
- Critical

Alert status:

- Active
- Resolved

---

### 8. Risk Prediction

The MVP will include practical prediction logic.

#### Battery Depletion Prediction

Example:

> Battery may fall below 20% in approximately 4.5 hours if the current drain rate continues.

#### Temperature Risk Prediction

Example:

> Temperature may exceed the safe threshold in approximately 2.8 hours if the current trend continues.

#### Cooling Risk Score

Possible values:

- Low
- Medium
- High
- Critical

The risk score will consider:

- Temperature trend
- Battery level
- Generated power
- Cooling load
- Active alerts
- Missing telemetry

---

### 9. Basic Anomaly Detection

The system will detect abnormal behavior such as:

- Sudden temperature spike
- Battery draining faster than normal
- Power generation dropping unexpectedly
- Cooling load becoming unusually high
- Sensor sending unrealistic values
- Device suddenly stopping telemetry

Initial approach:

- Threshold-based rules
- Rolling averages
- Z-score based anomaly detection

---

### 10. AI-Generated Operational Summary

The platform will generate plain-English summaries based on:

- Recent telemetry
- Active alerts
- Prediction results
- Device thresholds

Example summary:

> Cold Room 1 remained stable for most of the day. Temperature stayed within the safe range, but battery level dropped faster than usual between 3 PM and 6 PM due to low generation. Current risk is medium. Recommended action: monitor battery level and check power input if generation remains low.

The first version may use rule-based summaries before integrating the OpenAI API.

---

### 11. API Documentation

FastAPI will provide interactive API documentation through:

```http
/docs
```

Planned API groups:

- Authentication
- Devices
- Telemetry
- Alerts
- Predictions
- AI summaries

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

1. A Python simulator generates realistic cold-storage telemetry.
2. The simulator sends telemetry to the FastAPI backend.
3. The backend validates the device API key.
4. Telemetry is stored in PostgreSQL using SQLAlchemy.
5. Alert and prediction logic analyzes the latest data.
6. The React dashboard displays device status, charts, alerts, predictions, and AI summaries.

---

## Planned Database Models

### User

Stores user account information.

Fields may include:

- id
- name
- email
- hashed_password
- created_at

### Device

Stores cold-storage device configuration.

Fields may include:

- id
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

Fields may include:

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

Fields may include:

- id
- device_id
- alert_type
- severity
- message
- status
- created_at
- resolved_at

### Prediction

Stores prediction results.

Fields may include:

- id
- device_id
- risk_level
- battery_hours_remaining
- temperature_hours_to_threshold
- message
- created_at

### AI Summary

Stores generated operational summaries.

Fields may include:

- id
- device_id
- summary
- recommendations
- created_at

---

## Future Roadmap

### Version 2 — Strong Upgrade Features

- WebSocket live dashboard updates
- MQTT support for IoT-style communication
- More advanced anomaly detection
- Advanced forecasting models
- Email alert notifications
- Daily and weekly report generation
- Multi-device organization dashboard
- Maintenance recommendation engine

---

### Version 3 — Hardware and Business-Ready Features

- Real hardware integration with ESP32 or Raspberry Pi
- Device SDK or sample integration scripts
- Weather API integration
- Spoilage risk model for different storage types
- Predictive maintenance models
- Role-based access control
- Offline device buffering
- Multi-tenant SaaS support
- Audit logs
- Subscription and billing structure

---

## Long-Term Vision

ColdGrid AI can evolve into a hardware-agnostic AI monitoring platform for cold storage and off-grid energy systems.

The long-term goal is to help small businesses, farms, NGOs, and operators of renewable-powered storage systems detect risks earlier, reduce spoilage, improve energy reliability, and make better operational decisions using real-time telemetry and AI-driven insights.

---

## Project Status

Planning phase.

Initial development will focus on:

1. Backend setup with FastAPI and PostgreSQL
2. User authentication
3. Device onboarding
4. Telemetry ingestion
5. Python device simulator
6. React dashboard
7. Alerts and predictions
8. AI-generated summaries
