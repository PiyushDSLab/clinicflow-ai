# ClinicFlow AI

> AI-powered receptionist and clinic operations assistant for small clinics.

**🚀 Live Demo:** [Try ClinicFlow AI](https://annual-french-scale--piyushsable.replit.app/clinicflow-mobile/ )

**🎥 Product Demo:** [Watch the Demo](https://drive.google.com/file/d/1OE86desxmcnJmlmKB7Jdo8mwKJlk4Ra7/view?usp=sharing)

**💻 Source Code:** [GitHub Repository](https://github.com/PiyushDSLab/clinicflow-ai)

---------------------------------------------------------------------------------------------------------------------------------------------------------------

ClinicFlow AI is a working SaaS MVP/prototype demonstrating how an AI-powered clinic operations assistant can automate repetitive administrative communication while keeping medical and sensitive conversations under human control.

## Problem

Small clinics often manage appointments, patient questions, reminders, and follow-ups across calls, WhatsApp, notebooks, and basic calendars. That creates repetitive work and makes sensitive conversations harder to route.

## Solution

ClinicFlow AI gives a clinic owner one focused mobile workspace for daily appointments, AI-assisted operational conversations, reminders, FAQs, doctors, and human handoffs.

## Key features

- Mobile-first clinic owner dashboard
- Demo sign-in with a clearly labelled demo environment
- Persistent PostgreSQL-backed clinic, doctor, appointment, FAQ, reminder, conversation, and handoff data
- Appointment creation, status updates, search, and double-booking protection
- AI inbox with conversation threads and outcome states
- Patient WhatsApp simulator with operational replies
- Strict medical-safety layer that escalates symptom, diagnosis, medicine, dosage, emergency, and treatment language to human review
- Human handoff workflow with new, in-progress, and resolved states
- FAQ, doctor, reminder, and clinic settings management
- Integration-ready messaging and calendar positioning without pretending those services are connected

## Product demo

The demo is designed for portfolio and showcase use. It uses fictional patient data and a simulated assistant. The simulator is the fastest way to demonstrate the product:

1. Sign in with the demo account.
2. Open **Simulator**.
3. Try an operational question such as “What is the consultation fee?”
4. Try a safety-critical question such as “I have severe chest pain. What medicine should I take?”
5. Open **Handoffs** to see the human-review record.

## Technology

- Expo Router, React Native, TypeScript
- Express 5 API server
- PostgreSQL with Drizzle ORM
- OpenAPI-first generated React Query client
- Replit-managed workflows and Expo preview

## Current MVP vs. simulated integrations

### Functional today

- Clinic owner demo access
- Persistent clinic data and seeded demo data
- Appointment, FAQ, reminder, handoff, and settings updates
- Patient simulator responses
- Medical-safety escalation

### Simulated

- WhatsApp delivery
- External LLM provider
- Calendar sync
- SMS/email delivery

### Production-ready integration points

The API and product surfaces are prepared for Meta WhatsApp Cloud API, an approved LLM provider, Google Calendar, production PostgreSQL environments, and email/SMS delivery.

## Getting started

```bash
pnpm install
pnpm --filter @workspace/db run push
```

Start the API and mobile workflows from Replit. The mobile app uses the Expo preview workflow; the API is available under `/api`.

## Environment variables

See `.env.example`. Replit provides the database connection and Expo workflow values through the project environment.

## Demo login

- Email: `admin@clinicflow.com`
- Password: `admin123`

These are demo-only credentials for the portfolio experience and are not production credentials.

## Medical safety

ClinicFlow AI does not diagnose, interpret symptoms, recommend medicine, provide dosage, triage emergencies, or replace medical professionals. Messages that appear clinical or medically uncertain receive a fixed boundary response and create a human handoff.

## Roadmap

- Clerk-backed clinic owner authentication
- Real Meta WhatsApp Cloud API connection
- Approved LLM provider with audited prompts and response controls
- Google Calendar sync
- SMS/email reminder delivery
- Multi-clinic and staff roles

## Author

Built as a serious SaaS MVP and product showcase.
