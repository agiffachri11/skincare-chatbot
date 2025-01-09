# Skincare Chatbot with Solana Pay Integration

> A chatbot application that provides skincare product recommendations integrated with Solana payment gateway.

## 💻 Demo
- **Frontend:** [skincare-chatbot-kappa.vercel.app](https://skincare-chatbot-kappa.vercel.app/)
- **Backend:** [skincare-chatbot-production.up.railway.app](https://skincare-chatbot-production.up.railway.app/)

## ✨ Features
- **🤖 Product recommendations** using AI chatbot
- **🔐 User authentication** (login & register)
- **💰 Payment integration** with Solana cryptocurrency
- **⚡ Real-time payment status** checking

## 🔗 API Documentation 

### 1️⃣ Internal APIs (Skincare Chatbot)

#### 🔒 Authentication API

##### Register User
```http
POST /api/auth/register
Content-Type: application/json

# Body
{
    "username": "string",
    "email": "string", 
    "password": "string"
}

# Response 
{
    "message": "Registrasi berhasil",
    "token": "string",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string" 
    }
}
