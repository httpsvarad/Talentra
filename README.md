# Talentra : AI-Powered Recruitment & Career Readiness Platform

Talentra is a modular, AI-driven recruitment platform designed to streamline hiring and empower candidates.  
The system is divided into **three independent modules**, each built and run separately:

1. **Job Portal**  
2. **Interview Scheduling Module**  
3. **AI Career Coach + AI Mock Interview**

Each module contains its own backend, frontend, and environment configuration.

---

# 🗂️ Project Structure

```

Talentra/
│── job-portal/
│── interview-scheduling-module/
│── ai-career-coach/

````

Each folder is a standalone project.

---

# ✨ Key Features

- AI Resume Analyzer  
- AI Mock Interview  
- Job Recommendation Engine  
- Auto Candidate Shortlisting  
- Automated Interview Scheduling  
- Recruiter Dashboard  
- Candidate Dashboard  
- Skill Evaluation + Career Guidance  

---

# Data Flow Diagram

![data_flow](screenshots/data_flow.png)

---

# Running Each Module

## 1️⃣ **Job Portal**

### Install dependencies
```bash
cd job-portal/Frontend
npm install

cd ../Backend
npm install
````

### Run

```bash
# Frontend
npm run dev

# Backend
npm run dev
```

---

## 2️⃣ **Interview Scheduling Module**

### Install dependencies

```bash
cd interview-scheduling-module
npm install
```

### Run

```bash
npm run dev
```

---

## 3️⃣ **AI Career Coach / AI Mock Interview Module**

### Install dependencies

```bash
cd ai-career-coach
npm install
```

### Run

```bash
npm run dev
```

---

# ⚠️ Environment Variables

Create the following `.env` files in each module.

---

## 🗂️ **📌 job-portal/.env**

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>

MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>

CLOUD_NAME=<cloudinary_cloud_name>
CLOUD_API=<cloudinary_api_key>
API_SECRET=<cloudinary_api_secret>

PORT=5011
```

---

## 🗂️ **📌 interview-scheduling-module/.env**

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>

GEMINI_API_KEY=<your_gemini_api_key>
```

---

## 🗂️ **📌 ai-career-coach/.env**

```env
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
PORT=<port_number>
```

---

# 🧩 Tech Stack

### **Frontend**

* React.js
* Tailwind CSS
* Redux Toolkit

### **Backend**

* Node.js
* Express.js
* MongoDB / PostgreSQL

### **AI**

* LLM APIs (Groq & Gemini)
* NLP processing
* Custom ranking algorithms

---

## Conclusion

Talentra brings together three independently developed modules - Job Portal, Interview Scheduling, and AI Career Coach to deliver a unified, intelligent recruitment ecosystem. By combining advanced AI capabilities with automated workflows, it enhances candidate readiness, accelerates hiring, and improves decision-making for recruiters.

This modular architecture ensures flexibility, scalability, and ease of development, allowing each component to evolve independently while still integrating seamlessly into the overall platform.
