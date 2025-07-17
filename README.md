# BrainSwap

**BrainSwap** is a skill-exchanging web application where **anyone can learn or teach**. Whether you're a professional or just someone who knows a particular skill, you can share your knowledge and help others grow — or become a learner yourself.

---

## 🌟 Features

- Connect with other users to **teach or learn any skill**
- Teachers can define the **learning style** best suited for their session:
  - Visual
  - Auditory
  - Physical (Kinesthetic)
  - Social
- Schedule and join **Zoom-powered** video calls for interactive sessions
- Spend in-app credits to access learning sessions
- Secure backend with authentication and session management

---

## 🧰 Tech Stack

- **Frontend:** React  
- **Backend:** Spring Boot (with Gradle)  
- **Video Call Integration:** Zoom API (server-to-server)

---

## ⚙️ Setup & Installation

To run the project locally:

### 1. Clone the Repository

### 2. Set Up Zoom Environment Variables
The backend requires the following environment variables to be configured:

- Zoom API Credentials (for video call integration)  
  - ZOOM_ACCOUNT_ID  
  - ZOOM_CLIENT_ID  
  - ZOOM_CLIENT_SECRET

- Database Configuration  
  - DB_NAME  
  - DB_USERNAME  
  - DB_PASSWORD  

You can set these in a .env file or configure them directly in your system or IDE environment settings.

### 3. Run the Backend
Make sure you have Java and Gradle installed.  
```bash
cd BrainSwap_backend  
./gradlew bootRun  
```

### 4. Run the Frontend
Navigate to the frontend directory:  
```bash
cd ../BrainSwap_frontend/brainswap-frontend  
npm install  
npm start
```
The app should now be running on http://localhost:5173.

---

## 🚧 Project Status
This project is currently in active development. Core features like session creation, Zoom integration, and the in-app credit spending system are functional.

---

## 🧩 Future Plans
- Implement a payment system  
  Allow users to purchase in-app credits using real money, enabling a monetization model for premium learning sessions.

- Replace Zoom integration with native in-app video calls  
  Native calls will offer better control over the experience, including:  
  - Better credit tracking  
  - Refunds or penalties for session behavior  
  - Improved session analytics and statistics  
- Improve user experience and session discovery  
  Enhance session browsing, skill categorization, and filtering based on user interests or learning styles.  
- Add user feedback and reputation system  
  - Display feedback directly on a user's profile page  
  - Use a star rating system based on received feedback  
  - Help learners choose teachers based on quality and past session experience
