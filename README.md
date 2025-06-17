# 🧑‍🎓 Student Progress & Codeforces Dashboard

🎥 [Click to Watch Demo](https://drive.google.com/file/d/1DR4G-zQxzP-B_PWiKYN2whmZZRBLHsNO/view?usp=drivesdk)


A full-stack web app to manage student profiles and track their Codeforces activity in real-time. Includes contest performance charts, problem-solving stats, heatmaps, inactivity alerts, and CSV export — all in a responsive and clean dashboard.

---


## 🚀 Features

✅ Add / Edit / Delete Students  
✅ Sync Codeforces Handle Data  
✅ View Contest History (Chart)  
✅ Problem Solving Analytics (Bar Chart + Stats)  
✅ Daily Submission Heatmap (90 days)  
✅ Inactivity Detection + Email Reminders  
✅ CSV Export of Student Data  
✅ Dark / Light Mode  
✅ Mobile Responsive

---

---

Cron Jobs & Inactivity Emails
Automatic Daily Sync (1:00 AM)
A scheduled cron job runs every night at 1:00 AM to:

🔁 Sync latest Codeforces contest and problem-solving data for all students.

📊 Update student analytics and submission heatmaps.

📭 Inactivity Email Alerts
If a student has made no submissions in the last 7 days, they will receive:

A friendly reminder email prompting them to stay active on Codeforces.

---



## 📁 Folder Structure

student-dashboard/
├── frontend/ # React + MUI dashboard UI
├── backend/ # Express + MongoDB API
└── README.md # This file


---


## ⚙️ Setup Instructions

### 🔁 Clone the Repo

```bash
git clone https://github.com/<your-username>/student-dashboard.git
cd student-dashboard


# Frontend Setup

cd frontend
npm install
npm run dev   
Runs on: http://localhost:5173


# Backend Setup

#Run in Terminal 
cd ../backend
npm install






# Create config.env in /backend/config/

PORT=4000
MONGO_URI=your_mongodb_uri
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5173

Then run in terminal :

node index.js     
npx nodemon index.js



Tech Stack
Frontend: React.js, Vite, MUI, Recharts, Axios

Backend: Node.js, Express, MongoDB, Mongoose, Nodemailer

Features: Cron jobs, Email Reminders, Data Sync, Charts, CSV Export , Dark Mode