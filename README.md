# OmniReach

OmniReach is a comprehensive, full-stack campaign outreach platform designed to streamline and automate your communication workflows. The application enables users to manage contacts, utilize AI-powered template generation, execute targeted email and SMS campaigns, and monitor campaign performance in real-time.

## 🚀 Key Features

*   **Dashboard Analytics:** Real-time metrics and charts displaying campaign performance (built with Recharts and Socket.IO).
*   **Contact Management:** Upload and manage contacts via CSV imports.
*   **AI-Powered Templates:** Integration with Google Gemini AI to generate compelling email and SMS templates.
*   **Omnichannel Campaigns:** Create and schedule campaigns via Email (AWS SES) and SMS (AWS SNS).
*   **Automated Scheduling:** Robust background cron jobs scheduling and executing campaign tasks automatically.
*   **Real-time Updates:** WebSocket integrations providing live updates to the frontend dashboard.
*   **Authentication:** Secure JWT-based authentication system.

## 🛠️ Tech Stack

**Frontend:**
*   React (via Vite)
*   TypeScript
*   React Router (Client-side routing)
*   Recharts (Data Visualization)
*   Socket.IO Client (Real-time events)
*   Lucide React (Icons)
*   React Hot Toast (Notifications)

**Backend:**
*   Node.js & Express.js
*   MongoDB (via Mongoose)
*   AWS SDK (SES for Emails, SNS for SMS)
*   Google Generative AI (Gemini for templates)
*   Socket.IO (Real-time server)
*   Node-Cron (Task scheduling)
*   Multer & CSV-Parser (File uploads and parsing)
*   Pino (Logging)
*   JWT & Bcrypt (Authentication)

## 📦 Project Structure

The project is structured as a monorepo containing both the frontend and backend applications:

```text
OmniReach/
├── frontend/       # React (Vite) Frontend Application
└── backend/        # Node.js + Express Backend Application
```

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance
*   AWS Account with SES & SNS configured
*   Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the necessary environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   
   # JWT Auth
   JWT_SECRET=your_jwt_secret
   
   # AWS Configuration
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   
   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure environment variables if necessary (e.g., API Base URL).
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the ISC License.
