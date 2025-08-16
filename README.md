# 📦 Business Management System – Backend (Invoice Management Module)

## 📌 Overview
This is the **backend API** for the Business Management System's Invoice Management Module.  
It is built with **Node.js**, **Express**, and **MongoDB**, providing secure and efficient endpoints for managing invoices, templates, user authentication, and integrations (email & WhatsApp).

---

## 🚀 Features
- **JWT Authentication** with HTTP-only cookies.
- **Invoice CRUD** (Create, Read, Update, Delete).
- **Invoice Templates** (create, list, update).
- **PDF Generation** for invoices.
- **Email Integration** (send invoices via email).
- **WhatsApp Integration** (send invoices via WhatsApp Business API / Twilio).
- **Search & Filtering** for invoices.
- **Secure API Endpoints** with middleware authentication.

---

## 🛠️ Tech Stack
- **Node.js** – Backend runtime environment
- **Express.js** – Web framework
- **MongoDB** – Database
- **Mongoose** – MongoDB ODM
- **JWT** – Authentication
- **Cookie-Parser** – HTTP-only cookie handling
- **PDFKit / Puppeteer** – PDF generation
- **Nodemailer** – Email sending
- **WhatsApp Business API / Twilio** – WhatsApp integration
- **Swagger** – API documentation
- **Jest / Supertest** – Testing

---


## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/business-management-backend.git
cd business-management-backend
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root directory:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
WHATSAPP_API_KEY=your_whatsapp_api_key
4️⃣ Run the Development Server
bash
Copy
Edit
npm run dev
5️⃣ Build for Production
bash
Copy
Edit
npm run build

📜 License
This project is licensed under the MIT License – you are free to use, modify, and distribute it.

👨‍💻 Author
Rabia Ali
💼 GitHub: RabiaAmin
📧 Email: rabia10march@gmail.com
