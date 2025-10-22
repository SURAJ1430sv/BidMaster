# 🧾 BidMaster – Smart Real-Time Auction Platform 💰

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-brightgreen?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Last Commit](https://img.shields.io/github/last-commit/SURAJ1430sv/BidMaster)
![Stars](https://img.shields.io/github/stars/SURAJ1430sv/BidMaster?style=social)

---

## 🏷️ Overview

**BidMaster** is a next-generation online auction platform that brings **buyers and sellers together** through a secure, real-time bidding experience.
Built with the **MERN Stack**, it ensures transparency, interactivity, and scalability — making it ideal for individuals and businesses alike.

---

## 📜 Description

In the digital commerce landscape, online auctions need **speed, trust, and engagement**.
Traditional auction sites often lack real-time interaction and modern security measures.
**BidMaster** solves these issues by providing:

* **Instant bidding updates**,
* **Secure authentication**, and
* **A user-friendly interface** for all participants.

---

## 🎯 Project Objectives

* Deliver a **real-time bidding experience** using modern web technologies.
* Offer **role-based authentication** for buyers, sellers, and admins.
* Enable users to **list, manage, and participate in auctions** easily.
* Provide **analytics and monitoring tools** for admins.
* Build a **scalable, future-ready** auction platform.

---

## 💡 Unique Features

* ⚡ **Live Bidding Updates:** No page refresh required.
* 🔐 **Secure Auth:** JWT + bcrypt for protected login sessions.
* 👥 **Multi-Role System:** Buyer, Seller, and Admin access.
* 🛒 **Auction Listings:** Add, edit, or delete auction products.
* 📊 **Admin Dashboard:** Manage auctions and view user activity.
* 📱 **Fully Responsive UI:** Optimized for all screen sizes.
* 💳 **Payment Gateway (Planned):** Integration with Razorpay/Stripe.

---

## 🧑‍🤝‍🧑 Target Audience

* **Buyers:** Join live auctions and place competitive bids.
* **Sellers:** Host and manage their own online auctions.
* **Admins:** Oversee platform activities and ensure integrity.
* **Students & Developers:** Learn full-stack development with a real-world project.

---

## 🖼️ Screenshots (Preview)

| Feature            | Screenshot                                                       |
| ------------------ | ---------------------------------------------------------------- |
| 🏠 Home Page       | ![Home]<img width="1898" height="910" alt="Screenshot 2025-03-31 135652" src="https://github.com/user-attachments/assets/88ca79c7-b500-47b7-9c69-83095b34007d" />     |
| 💸 Bidding Product | ![Bidding](<img width="1560" height="785" alt="Screenshot 2025-04-12 112425" src="https://github.com/user-attachments/assets/d698baea-a9cf-4f3b-995b-93efe6604291" />)   |
| 👤 User Dashboard  | ![Dashboard](<img width="1919" height="769" alt="Screenshot 2025-03-31 140555" src="https://github.com/user-attachments/assets/20824469-ccd3-4887-9240-168917606cd5" />) |
| 🧾 Auction Details | ![Details](<img width="1727" height="809" alt="Screenshot 2025-10-22 231021" src="https://github.com/user-attachments/assets/17a5c9a8-65a0-4a9e-84e8-0e4ea32fc8e8" />)   |
| 🧑‍💼 Support Panel   | ![Support](<img width="1917" height="856" alt="Screenshot 2025-03-31 140753" src="https://github.com/user-attachments/assets/2ca18951-3aae-4b23-b645-b295c26b1d0c" />)   |

---

## 🛠️ Tech Stack

| Layer                    | Technology                      |
| ------------------------ | ------------------------------- |
| **Frontend**             | React.js, HTML5, CSS3, Axios    |
| **Backend**              | Node.js, Express.js             |
| **Database**             | PostgreSQL                      |
| **Authentication**       | JWT, bcrypt                     |
| **Version Control**      | Git & GitHub                    |
| **Deployment (Planned)** | Render / Vercel / MongoDB Atlas |

---

## 🚀 Getting Started

### 🧩 Prerequisites

Make sure you have:

* Node.js ≥ 18
* Git

---

### ⚙️ Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SURAJ1430sv/BidMaster.git
   ```

2. **Navigate into the Project**

   ```bash
   cd BidMaster
   ```

3. **Install Dependencies**

   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

4. **Set Up Environment Variables**
   Create a `.env` file inside the **server/** folder:

   ```env
   DATABASE_URL="postgresql://postgres:(localhost)name:5432/BidMaster"
   PORT=5000
   ```

5. **Start the Backend**

   ```bash
   cd server
   npm start
   ```

6. **Run the Frontend**

   ```bash
   cd ../client
   npm run dev
   ```

7. **Open Your Browser**

   ```
   http://localhost:5173
   ```

---

## 📂 Project Structure

```
BidMaster/
│
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Screens and views
│   │   ├── assets/           # Images and icons
│   │   └── App.js
│   └── package.json
│
├── server/                   # Backend (Express)
│   ├── models/               # MongoDB models (User, Product, Bid)
│   ├── routes/               # API endpoints
│   ├── controllers/          # Core logic
│   ├── middleware/           # Auth and error handling
│   └── server.js
│
├── .env                      # Environment configuration
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🧪 Commands Reference

| Task             | Command         |
| ---------------- | --------------- |
| Start Backend    | `npm start`     |
| Start Frontend   | `npm run dev`   |
| Build Frontend   | `npm run build` |
| Install Packages | `npm install`   |
| Lint Project     | `npm run lint`  |

---

## 👨‍💻 Contributor

**Suraj Deepak Vishwakarma**
📧 Email: [surajvishwakarma1430@gmail.com](mailto:surajvishwakarma1430@gmail.com)
🌐 GitHub: [@SURAJ1430sv](https://github.com/SURAJ1430sv)

---

## 🔮 Future Enhancements

* 💳 **Payment Gateway Integration** (Stripe/Razorpay)
* 🤖 **AI-Based Bid Suggestions & Insights**
* 📱 **React Native Mobile App**
* 🔔 **Live Notifications for Auctions**
* 📊 **Admin Analytics Dashboard**

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](MIT) file for details.

---

## 🌟 Support & Feedback

If you like **BidMaster**, please ⭐ the repository!
Your feedback and suggestions are welcome — open an [Issue](https://github.com/SURAJ1430sv/BidMaster/issues) to contribute ideas or report bugs.

---

## 💬 Acknowledgments

Special thanks to:

* The **MERN Stack Community** for their open-source contributions.
* **Developers, mentors, and peers** who inspire continuous innovation.

---
