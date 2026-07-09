# 🤖 HireGen AI - Multi-Agent Recruitment & Interactive Proctoring Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github&style=flat-square)](https://github.com/gokul27108/HireGen-AI)
[![Spring Boot](https://img.shields.io/badge/Spring--Boot-v3.x-brightgreen?logo=springboot&style=flat-square)](https://spring.io/projects/spring-boot)
[![Vite React](https://img.shields.io/badge/Vite--React-Latest-blueviolet?logo=vite&style=flat-square)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Google--Gemini-API--Integration-orange?logo=google&style=flat-square)](https://ai.google.dev/)

HireGen AI is a state-of-the-art, AI-powered recruitment and candidate evaluation workspace. It automates resume screening, job alignment matching, technical aptitude testing, communication audits, coding workspace proctoring, and interview workflows. 

Built with a **Spring Boot Java backend**, a **React Vite frontend**, and powered by the **Google Gemini API**, it provides an elegant, theme-sensitive dashboard that ensures academic/professional evaluation integrity.

---

## 🚀 Key Features

### 1. Unified Authentication Portal
- **Recruiter & Candidate Workspace**: Elegant separate views for recruiter administration and candidate testing.
- **Candidate Sign Up & Auto-Screening**: Registering immediately parses the candidate's resume, computes a job compatibility fit (taking into account empty resumes/details), and directs candidates directly to the dashboard.
- **Password Obfuscation**: Secure password field hiding during registration to protect candidate credentials.

### 2. ⚡ Dynamic Single-Question Wizard Exams (Aptitude & Communication)
- **Round 3: 50-Question Aptitude Test**: A randomized, 50-question pool covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Stack-specific Technical questions. Displays **one question at a time** and **automatically advances** to the next question when an option is clicked, plus manual prev/next navigation.
- **Round 3.5: 30-Question Communication Test**: A randomized, 30-question test evaluating Vocabulary, Grammar, and Reading Comprehension. Implements the same elegant auto-advancing wizard interface.

### 3. 💻 Coding Challenge Workspace with Live Test Cases (Round 4)
- **Dynamic Challenge Selector**: Features a pool of coding challenges (like Linked List Reversal, Two Sum, Bracket Validation, Interval Merging). 
- **Expected Test Cases**: Lists **2 sample test cases** for the candidate to review before submitting.
- **Auto-Switching Questions**: The workspace automatically switches to the **next different question** in the list upon evaluation submission or manually using the "Switch Challenge" button.

### 4. 🎤 Mock Technical Interview Arena & Live Proctoring (Round 5)
- **Voice Dictation**: Real-time voice dictation (speech-to-text) using Web Speech API.
- **Lobby Checker**: Device test lobby checking camera feeds, microphone levels, and mute status.
- **Continuous AI Proctoring**: Tracks page focus loss, gaze deviation, and voice muting, recording logs directly to the proctor audit trail.

### 5. 🤖 Context-Aware AI Copilot Chatbot
- **Status Queries**: The floating copilot chatbot reads the logged-in user's context (name, role, current stage) and dynamically responds to questions like *"Am I selected?"*, *"What is my status?"*, or *"Which round am I in?"*.
- **Integrity Controls**: Programmed to block revealing coding solutions or aptitude answers to prevent cheating.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React (Vite), Vanilla CSS, Web Speech API | Ultra-responsive layout, light/dark themes, glassmorphism UI. |
| **Backend** | Spring Boot, JPA Hibernate, Java 17 | Core RESTful controllers, persistent model mappings. |
| **Database** | MySQL / H2 | Relational schema storing proctor logs, candidate scores, and report tables. |
| **AI Integration** | Google Gemini API | Automated evaluation agent, dynamic mock interviewer, and smart copilot. |

---

## 📦 Project Directory Structure

```text
HireGen AI/
├── backend/                  # Spring Boot Java Application
│   ├── src/main/java/        # Controller, Model, Service, and Repository layers
│   ├── src/main/resources/   # Application properties & database configurations
│   └── pom.xml               # Maven dependencies
├── frontend/                 # React Vite Client Application
│   ├── src/                  # App components, styles, assets
│   └── package.json          # Node configurations
├── database/                 # Schema & seeding scripts
│   ├── schema.sql            # Table structures
│   └── seed.sql              # Preloaded jobs/descriptions
└── README.md                 # Attractive project documentation
```

---

## 🏁 Installation & Setup

### Prerequisites
* **Java Development Kit (JDK 17 or higher)**
* **Node.js (v18 or higher)**
* **Maven** (configured in system path)
* **Google Gemini API Key**

---

### Step 1: Clone the GitHub Repository
```bash
git clone https://github.com/gokul27108/HireGen-AI.git
cd HireGen-AI
```

### Step 2: Set Up the Database
Create your MySQL database and run the schema and seed scripts:
```sql
CREATE DATABASE hiregen_db;
USE hiregen_db;

SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### Step 3: Configure and Start the Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set your Gemini API Key environment variable:
   - **Windows Command Prompt**:
     ```cmd
     set GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - **Windows PowerShell**:
     ```powershell
     $env:GEMINI_API_KEY="your_gemini_api_key_here"
     ```
   - **macOS/Linux**:
     ```bash
     export GEMINI_API_KEY="your_gemini_api_key_here"
     ```
3. Start the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   The backend server runs on `http://localhost:8080`.

### Step 4: Configure and Start the Frontend
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🔑 Demo Access Credentials

- **Recruiter Workspace**:
  - **Email**: `example@gmail.com`
  - **Password**: `123456`
- **Candidate Workspace**:
  - Click **Register** on the sign-up page to create a new profile instantly.
  - Or log in with preloaded seed candidate: `alice.smith@example.com` (password: `password`).
