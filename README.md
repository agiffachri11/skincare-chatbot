Skincare Chatbot with Solana Pay Integration
A chatbot application that provides skincare product recommendations and integrates with Solana payment gateway.
Live Demo

Frontend: https://skincare-chatbot-kappa.vercel.app/
Backend: https://skincare-chatbot-production.up.railway.app/

Features

Product recommendations using AI chatbot
User authentication
Payment integration with Solana cryptocurrency
Transaction history
Real-time payment status checking

API Documentation
1. Internal APIs (Skincare Chatbot)
Authentication Endpoints
<details>
<summary><b>POST /api/auth/register</b> - Register new user</summary>
jsonCopyRequest Body:
{
    "username": "string",
    "email": "string",
    "password": "string"
}

Response:
{
    "message": "Registrasi berhasil",
    "token": "string",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    }
}
</details>
<details>
<summary><b>POST /api/auth/login</b> - User login</summary>
jsonCopyRequest Body:
{
    "email": "string",
    "password": "string"
}

Response:
{
    "message": "Login berhasil",
    "token": "string",
    "user": {
        "id": "string",
        "username": "string",
        "email": "string"
    }
}
</details>
Chat & Product Endpoints
<details>
<summary><b>POST /api/chat</b> - Send chat message</summary>
jsonCopyHeaders:
Authorization: Bearer {token}

Request Body:
{
    "userId": "string",
    "message": "string"
}

Response:
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
</details>
<details>
<summary><b>GET /api/products</b> - Get all products</summary>
jsonCopyResponse:
[
    {
        "id": "string",
        "name": "string",
        "category": "string",
        "skinType": "string",
        "price": "number",
        "description": "string",
        "concerns": ["string"]
    }
]
</details>
Payment & Transaction Endpoints
<details>
<summary><b>POST /api/payment/create-payment</b> - Create new payment</summary>
jsonCopyHeaders:
Authorization: Bearer {token}

Request Body:
{
    "productId": "string",
    "currency": "SOL"
}

Response:
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
</details>
<details>
<summary><b>GET /api/payment/check/{paymentID}</b> - Check payment status</summary>
jsonCopyHeaders:
Authorization: Bearer {token}

Response:
{
    "status": "success",
    "message": "string",
    "data": {
        "isPaid": "boolean",
        "status": "string"
    }
}
</details>
<details>
<summary><b>GET /api/payment/transactions</b> - Get transaction history</summary>
jsonCopyHeaders:
Authorization: Bearer {token}

Response:
{
    "status": "success",
    "data": [
        {
            "id": "string",
            "paymentID": "string",
            "productName": "string",
            "amount": "number",
            "currency": "string",
            "status": "string",
            "createdAt": "string"
        }
    ]
}
</details>
2. External API (Solstrafi Payment Service)
<details>
<summary><b>POST https://api-staging.solstra.fi/service/pay/create</b> - Create payment</summary>
jsonCopyHeaders:
X-Api-Key: {api_key}

Request Body:
{
    "currency": "SOL" | "USDT",
    "amount": "number",
    "webhookURL": "string (optional)"
}

Response:
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
</details>
<details>
<summary><b>POST https://api-staging.solstra.fi/service/pay/{paymentID}/check</b> - Check payment status</summary>
jsonCopyHeaders:
X-Api-Key: {api_key}

Response:
{
    "status": "success",
    "message": "Payment Status: Unpaid",
    "data": {
        "id": "string",
        "currency": "string",
        "amount": "number",
        "walletAddress": "string",
        "checkPaid": "string",
        "isPaid": "boolean"
    }
}
</details>
Notes

All protected endpoints require JWT token in Authorization header
Currency conversion rate: 1 SOL = Rp 3,200,000
Webhook URL must be publicly accessible
Minimum test payment amount: 0.00001 SOL
