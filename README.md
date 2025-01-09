# Skincare Chatbot with Solana Pay Integration

> A chatbot application that provides skincare product recommendations integrated with Solana payment gateway.

## 💻 Demo
- **Frontend:** [skincare-chatbot-kappa.vercel.app](https://skincare-chatbot-kappa.vercel.app/)
- **Backend:** [skincare-chatbot-production.up.railway.app](https://skincare-chatbot-production.up.railway.app/)

## ✨ Features
- **🤖 Product recommendations** using AI chatbot
- **🔐 User authentication** (login & register)
- **💰 Payment integration** with Solana cryptocurrency
- **📊 Transaction history**
- **⚡ Real-time payment status** checking

## 🔗 API Documentation 

###1️⃣ Internal APIs (Skincare Chatbot)

#### 🔒 Authentication API

##### Register User
```http
POST /api/auth/register
Content-Type: application/json

Body
{
    "username": "string",
    "email": "string", 
    "password": "string"
}

Response 
{
    "message": "Registrasi berhasil",
    "token": "string",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string" 
    }
}
```

##### Login User
```http
POST /api/auth/login
Content-Type: application/json

# Body
{
    "email": "string",
    "password": "string"
}

# Response
{
    "message": "Login berhasil",
    "token": "string", 
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    }
}
```

#### 💬 Chat & Product API

##### Send Chat Message
```http
POST /api/chat
Authorization: Bearer {token}
Content-Type: application/json

# Body
{
    "userId": "string",
    "message": "string"  
}

# Response
{
    "message": "string",
    "recommendations": {
        "sunscreen": [
            {
                "id": "string",
                "name": "string", 
                "price": "string",
                "description": "string"
            }
        ]
    }
}
```

##### Get All Products
```http
GET /api/products

# Response
[
    {
        "id": "string",
        "name": "string",
        "category": "string", 
        "skinType": "string",
        "price": number,
        "description": "string",
        "concerns": ["string"]
    }
]
```

#### 💰 Payment API

##### Create Payment
```http
POST /api/payment/create-payment
Authorization: Bearer {token}
Content-Type: application/json

# Body
{
    "productId": "string",
    "currency": "SOL"
}

# Response
{
    "status": "success",
    "data": {
        "id": "string",
        "paymentID": "string",
        "productName": "string",
        "originalPrice": "string", 
        "convertedAmount": "string",
        "rate": "string",
        "solanaPayLink": "string",
        "walletAddress": "string"
    }
}
```

##### Check Payment Status
```http
GET /api/payment/check/{paymentID}
Authorization: Bearer {token}

# Response
{
    "status": "success",
    "message": "string",
    "data": {
        "isPaid": boolean,
        "status": "string"
    }
}
```

##### Get Transaction History
```http
GET /api/payment/transactions
Authorization: Bearer {token}

# Response
{
    "status": "success", 
    "data": [
        {
            "id": "string",
            "paymentID": "string",
            "productName": "string",
            "amount": number,
            "currency": "string",
            "status": "string",
            "createdAt": "string"
        }
    ]
}
```

### 2️⃣ External API (Solstrafi Payment Service)

#### 💳 Payment Gateway API

##### Create Payment
```http
POST https://api-staging.solstra.fi/service/pay/create
X-Api-Key: {api_key}
Content-Type: application/json

# Body
{
    "currency": "SOL" | "USDT",
    "amount": number,
    "webhookURL": "string" // optional
}

# Response
{
    "status": "success",
    "message": "New Payment Order Created",
    "data": {
        "id": "string",
        "currency": "SOL" | "USDT",
        "amount": "string",
        "walletAddress": "string",
        "checkPaid": "string"
    }
}
```

##### Check Payment Status
```http
POST https://api-staging.solstra.fi/service/pay/{paymentID}/check
X-Api-Key: {api_key}

# Response
{
    "status": "success",
    "message": "Payment Status: Unpaid",
    "data": {
        "id": "string",
        "currency": "string",
        "amount": number,
        "walletAddress": "string",
        "checkPaid": "string",
        "isPaid": boolean
    }
}
```


