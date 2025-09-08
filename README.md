<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Mj6U0no3KwY7b3C17_dY5b8a7m9zOhJZ

## Run Locally

This is a full-stack application with a React frontend and a Node.js backend. You will need to run both for the app to work correctly.

**Prerequisites:** Node.js

### 1. Frontend Setup (Root Directory)

1.  Install dependencies:
    `npm install`
2.  Create a `.env.local` file in the root directory for your environment variables.
3.  Add your Gemini API key and the backend server URL to the `.env.local` file:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    VITE_API_BASE_URL=http://localhost:5000
    ```

### 2. Backend Setup (`backend` Directory)

1.  Navigate to the backend directory:
    `cd backend`
2.  Install backend dependencies:
    `npm install`
3.  Create a `.env` file in the `backend` directory and add your MongoDB connection string:
    ```
    MONGO_URI=mongodb+srv://ankitmgs:987654321@cluster0.6o3q9.mongodb.net/FitTrackAI?retryWrites=true&w=majority
    PORT=5000
    ```
4.  **IMPORTANT: Firebase Admin SDK Setup**
    *   Go to your Firebase project console.
    *   Go to Project Settings > Service Accounts.
    *   Click "Generate new private key" and download the JSON file.
    *   Rename the downloaded file to `firebase-service-account-key.json`.
    *   Place this file inside the `backend` directory. **This file is required for the backend to authenticate users.**
5. Navigate back to the root directory: `cd ..`

### 3. Run The Application

You will need two separate terminals to run the frontend and backend servers.

**Terminal 1: Start the Backend Server**

*   In the project's root directory, run:
    ```
    npm run dev:backend
    ```
*   This starts the backend server, which will typically be available at `http://localhost:5000`.

**Terminal 2: Start the Frontend Server**

*   In a new terminal window, from the project's root directory, run:
    ```
    npm run dev:frontend
    ```
*   This starts the frontend development server. Open the URL it provides (usually `http://localhost:5173`) in your browser to use the application.