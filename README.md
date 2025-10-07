# 🎓 CMU Lifelong Education Assistance Website Front-End (Next.js)

This project is the **Frontend** for the Course & Queue Management System developed for the  **Chiang Mai University School of Lifelong Education**. It is built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

---

## 📁 Folder Structure

```bash
front-end/
├── src/                     # Main source code
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable UI Components
│   ├── lib/                 # Utility functions (axios, datetime, etc.)
│   ├── types/               # TypeScript type definitions
│   └── ...                 
├── public/                  # Static assets (icons, images)
├── next.config.mjs          # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation & Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file

Add the following environment variables to your `.env`:

```bash
# Authentication (CMU Entra ID)
CMU_ENTRAID_CLIENT_ID=
CMU_ENTRAID_CLIENT_SECRET=
CMU_ENTRAID_REDIRECT_URL=
CMU_ENTRAID_GET_TOKEN_URL=
CMU_ENTRAID_GET_BASIC_INFO=
CMU_ENTRAID_URL=
CMU_ENTRAID_LOGOUT_URL=
SCOPE=

# JWT
JWT_SECRET=

# Backend API
NEXT_PUBLIC_API_URL=
```

> 🔒 **Note:** Do not include actual secret values in the repository.

### 3. Run development server
```bash
npm run dev
```
Then open 👉 [http://localhost:3000](http://localhost:3000)

---

## 🧠 Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI Library | Tailwind CSS |
| Icons | Lucide React & React Icons |
| Data/State | Axios |
| Authentication | CMU - Microsoft Entra ID |
| Lint | ESLint |

---

## 🔐 Environment Variables

| Key | Description |
|-----|--------------|
| `CMU_ENTRAID_CLIENT_ID` | Application Client ID from CMU Entra ID |
| `CMU_ENTRAID_CLIENT_SECRET` | Secret key for Entra authentication |
| `CMU_ENTRAID_REDIRECT_URL` | Redirect URL after login |
| `CMU_ENTRAID_GET_TOKEN_URL` | Token retrieval endpoint |
| `CMU_ENTRAID_GET_BASIC_INFO` | API for user basic info |
| `CMU_ENTRAID_URL` | CMU Entra ID login endpoint |
| `CMU_ENTRAID_LOGOUT_URL` | Logout endpoint |
| `JWT_SECRET` | Used for verifying JWT tokens |
| `NEXT_PUBLIC_API_URL` | Base URL of backend API |

---

## 🧩 Common Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production build |
| `npm run lint` | Run ESLint checks |

---

## 👥 Role-based UI Access

The interface dynamically adapts based on the user’s role:

| Role | Permissions |
|------|--------------|
| 🧑‍💼 **Admin** | Full access — manage queues and users (create/edit/delete) |
| 👩‍💻 **Staff** | Create, edit, and manage queues |
| 🧾 **LE** | View all queues across faculties (overview access) |
| 🧑‍🎓 **Officer** | View queues belonging to their faculty |
| 👨‍🏫 **User** | View only their own courses/queues |

---

## 🧱 Development Notes

- Node.js **v22+** recommended  
- Compatible with **macOS / Linux / WSL**  
- Use `"use client"` only where necessary  
- Axios configuration located in `src/lib/axios.ts`  
- Token is stored in the `backend-api-token` cookie  

---

## 📦 Production Build

```bash
npm run build
npm run start
```
Then visit 👉 [http://localhost:3000](http://localhost:3000)

---

## 🏫 Acknowledgement

This project was developed as a **Senior Project** for the  
**Department of Computer Engineering, Faculty of Engineering, Chiang Mai University.**  

Developed by:  
**Jiradate Oratai**, **Nontapan Chanadee**, **Thatthana Sringoen**, and **Surapa Luangpiwdet**  

in collaboration with the  
**Chiang Mai University School of Lifelong Education**,  
which serves as the primary stakeholder and future maintainer of this system.

© 2025 Chiang Mai University. All rights reserved.
