# 🛡️ Kavach - Child Immunization & Healthcare Platform

Kavach is a comprehensive, mobile-first web application designed to bridge the gap between parents and healthcare providers in managing child immunization and early childhood healthcare. It ensures that no child misses a vaccine by providing an easy-to-use digital health tracking system.

## 🚀 Technical Stack

Kavach is built with modern, scalable, and performant technologies:

*   **Frontend Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) (for lightning-fast builds and HMR)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (for type safety and better developer experience)
*   **Routing**: [React Router v6](https://reactrouter.com/) (handling protected and role-based routes)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS framework for rapid UI development)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives tailored with Tailwind)
*   **State Management**: React Context API & Local State
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Backend & Cloud Services (BaaS)**: [Firebase](https://firebase.google.com/)
    *   **Authentication**: Firebase Auth (Email/Password log-in with Role-Based Access Control)
    *   **Database**: Cloud Firestore (NoSQL database for storing user, child, and medical records)
    *   **Storage**: Firebase Storage (For uploading birth certificates and prescription images)
*   **Progressive Web App (PWA)**: Using `vite-plugin-pwa` to allow users to install the app on their home screen like a native app.

## 👪 Features for Parents / Guardians

The app empowers parents to stay on top of their child's health with minimal effort.

1.  **Child Registration**: Easy onboarding of multiple children including their Date of Birth, Gender, and uploading digital birth certificates.
2.  **Vaccination Tracker**: 
    *   View a complete chronological list of required vaccines based on the National Immunization Schedule.
    *   Visual indicators for vaccines that are "Completed", "Pending", "Due Soon", and "Overdue".
3.  **Upcoming Appointments**: Instantly see upcoming scheduled checkups right on the home dashboard.
4.  **Clinical Notes & History**: View past doctor visits, diagnoses, and digital prescriptions assigned to their children.
5.  **Vaccination Centers**: Locate nearby authorized vaccination centers using an integrated map/list view.
6.  **Smart Notifications**: Push notification simulation for upcoming vaccine due dates and scheduled appointments.
7.  **Profile Management**: Manage communication preferences, privacy settings, and contact information.

## 👩‍⚕️ Features for Healthcare Providers (Doctors/Nurses)

The Doctor Portal provides an efficient clinical workflow without the heavy overhead of traditional Electronic Health Records (EHR).

1.  **Patient Lookup**: Quick search functionality to find parent records using their registered Email or Phone Number.
2.  **Family View**: Quickly see all children associated with a parent's profile.
3.  **Administer Vaccines**:
    *   Write access to mark pending vaccines as "Administered".
    *   Collect crucial data such as the administration date, location, and the **Manufacturer Batch/Lot Number** for safety tracking.
4.  **Clinical Consultation Logs**:
    *   Log detailed visit notes (e.g., reason for visit, weight, height, diagnosis).
    *   Upload images of physical, handwritten prescriptions to the child's secure digital vault.
5.  **Schedule Follow-ups**: Instantly schedule the child's next appointment/vaccination directly from the clinical view, which automatically syncs to the parent's dashboard.
6.  **Provider Analytics Dashboard**: Visual summary of daily scheduled appointments and weekly vaccines administered.
7.  **Broadcast Alerts**: Capability to send a bulk push notification to all linked patients (e.g., "Flu shots are now available at our clinic!").

## 🔒 Security & Data Privacy

*   **Role-Based Access Control (RBAC)**: Secure routing ensures that Parents cannot access the Provider Portal, and vice versa.
*   **Firestore Rules**: Database reads/writes are strictly protected requiring an authenticated user session.
*   **Immutable Core Data**: Once key authentication metrics (like Email) are set, they are locked from basic form editing to prevent account hijacking.

## 🛠️ Project Structure

```text
src/
├── components/       # Reusable UI components (buttons, cards, layout, navigation)
│   ├── layout/       # AppHeader, MobileNav, Layout Wrappers
│   └── ui/           # Shadcn base components
├── contexts/         # React Contexts (e.g., AuthContext for global user state)
├── data/             # Static or mock data (e.g., standard vaccination schedules)
├── hooks/            # Custom React hooks (e.g., useToast)
├── lib/              # Utility functions and tool configurations (Firebase config)
├── pages/            # Main application views/pages
│   └── auth/         # Login, Signup, Role Selection screens
└── types/            # TypeScript interfaces and global type definitions
```

## 💻 Getting Started (Local Development)

To run this project locally, follow these steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd frontend/frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Firebase Environment Variables
Create a `.env` file in the root of your frontend directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.
