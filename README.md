# ⚙️ Glam Beauty - Core Backend Service

> Scalable, Secure RESTful API and Business Logic Engine for the Glam Beauty E-Commerce Ecosystem.  
> Directly orchestrates transactions, inventory state, and identity for the companion clients:
> - 💄 **Customer Storefront**: [beauty-glam](https://github.com/raju95yadav/beauty-glam)
> - 📊 **Admin Dashboard**: [beauty-admin](https://github.com/raju95yadav/beauty-admin)

---

## 📋 Table of Contents

1. [🌟 Project Overview](#-project-overview)
2. [🏗️ Core Architecture & Technology Roles](#️-core-architecture--technology-roles)
3. [🛠️ Environment Setup Documentation](#️-environment-setup-documentation)
4. [🚀 Installation & Deployment Guide](#-installation--deployment-guide)
5. [🔐 Authentication, Authorization & Security Flow](#-authentication-authorization--security-flow)
6. [📡 API Reference & Testing Documentation](#-api-reference--testing-documentation)
7. [🧪 Testing & Verification](#-testing--verification)
8. [💻 Live Demonstration Guide](#-live-demonstration-guide)
9. [🎓 Academic & Project Information](#-academic--project-information)

---

## 🌟 Project Overview

**Glam Beauty Backend** (`beauty-back`) is the mission-critical core microservice and business logic engine powering the Glam Beauty e-commerce ecosystem. Built on Node.js, Express.js 5, and MongoDB (Mongoose 9), the service exposes high-throughput, secure RESTful APIs that govern product catalog schemas, transactional stock deduction, shopping cart synchronization, order fulfillment pipelines, and real-time administrative analytics.

Engineered with an API-first paradigm, `beauty-back` enforces defense-in-depth security principles. It incorporates rate-limiting policies, strict CORS origins, Helmet HTTP headers, bcrypt password hashing, cryptographic HMAC payment signature verification, and granular Role-Based Access Control (RBAC) across public, customer, and administrative routes.

### Core Objectives

- **🛡️ Enterprise Identity & Access Management (IAM)**: Dual authentication pipeline delivering passwordless email OTP verification via Nodemailer, Google OAuth 2.0 token exchange, and administrative credential validation with signed JWTs.
- **📦 Atomic Inventory & Catalog Processing**: Strict server-side pre-flight stock verification during checkout, atomic decrementing of stock counts upon purchase, automated low-inventory push alerts, and multi-part Cloudinary image transformations.
- **💳 Payment Gateway Orchestration**: Secure integration with Razorpay capturing payment intents, verifying cryptographically signed SHA-256 HMAC tokens, and transitioning order states atomically.
- **📊 Real-Time Administrative Intelligence**: Comprehensive MongoDB aggregation pipelines producing monthly revenue metrics, inventory turnover rates, low-stock notifications, and customer lifetime value distributions.
- **⚡ Production Scalability & High Availability**: Stateless REST design optimized for containerized environments, reverse proxy compatibility (`trust proxy` header support), and centralized error handling middleware.

---

## 🏗️ Core Architecture & Technology Roles

The server repository utilizes an MVC-derived architectural pattern separating route dispatchers, controller logic, persistence models, and infrastructure middleware:

```
beauty-back/
├── config/              # Database connection pools (MongoDB Mongoose)
├── controllers/         # Business logic layer (Auth, Products, Cart, Orders, Admin, Payments)
├── middleware/          # Security filters, JWT authentication, and centralized error handling
├── models/              # Mongoose data schemas (User, Product, Order, Cart, Notification)
├── routes/              # Express API endpoint declarations and route guards
├── services/            # Supporting domain utilities and notification dispatchers
├── utils/               # Cloudinary storage adapters, email transports, and token generators
├── enrichProductFilters.js # Database indexing and product attribute enrichment
├── runSeeder.js         # Comprehensive demo database seeding pipeline
└── server.js            # Express application entrypoint, CORS configuration, and listeners
```

### Technology Matrix & Core Roles

| Technology / Component | Version | Core Architectural Role |
| :--- | :--- | :--- |
| **Node.js** | `>=18.18.0` | Event-driven, asynchronous JavaScript runtime environment powering server execution. |
| **Express.js** | `^5.2.1` | Next-generation web framework handling HTTP routing, middleware pipelines, and request parsing. |
| **MongoDB & Mongoose** | `^9.3.0` | Document-based NoSQL database with Mongoose ODM modeling complex product, order, and user schemas. |
| **JSON Web Token (JWT)** | `^9.0.3` | Cryptographically signed bearer tokens facilitating stateless client authentication. |
| **Bcrypt.js** | `^3.0.3` | Adaptive salt hashing algorithm safeguarding sensitive user and administrative credentials. |
| **Cloudinary & Multer** | `^1.41.3` | Multi-part file streaming middleware uploading product imagery directly to Cloudinary CDN storage. |
| **Razorpay Node SDK** | `^2.9.6` | Official SDK creating checkout orders and calculating cryptographically secure SHA-256 signatures. |
| **Nodemailer** | `^8.0.2` | SMTP email transport delivering 6-digit passwordless OTP codes directly to customer inboxes. |
| **Helmet & Rate Limit** | `^8.1.0` | Security middleware suite protecting headers against common vulnerabilities and throttling brute-force attempts. |
| **Google Auth Library** | `^11.0.2` | Verifies Google ID tokens received from the storefront's client-side OAuth popups. |

---

## 🛠️ Environment Setup Documentation

### Prerequisites

Ensure the deployment target meets the following environmental baselines:

- **Runtime**: Node.js `v18.18.0` or higher (`v20.x` or `v22.x` LTS recommended)
- **Package Manager**: `npm` (`v9.x` or higher)
- **Database**: MongoDB instance (`v6.0+` locally or MongoDB Atlas cluster URI)
- **Third-Party Services**: Active Cloudinary account (for image uploads) and Razorpay developer keys (for payments)

### Environment Variables Specification

Create a `.env` file in the root directory of `beauty-back`. Populate the file based on the following reference specification:

| Environment Variable | Required | Sample / Format | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | Port on which the Express server listens. Defaults to `5000`. |
| `MONGO_URI` | **Yes** | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/beauty-glam` | Connection URI string pointing to the MongoDB cluster. |
| `JWT_SECRET` | **Yes** | `64+ character hexadecimal or high-entropy string` | Secret key used for signing and verifying customer/admin JWTs. |
| `EMAIL_USER` | **Yes** | `notifications@glambeauty.com` | SMTP account email address used by Nodemailer to dispatch OTPs. |
| `EMAIL_PASS` | **Yes** | `16-character Google App Password` | SMTP account password or third-party email service credentials. |
| `CLOUDINARY_NAME` | **Yes** | `denockmbz` | Cloudinary Cloud name for product asset bucket. |
| `CLOUDINARY_KEY` | **Yes** | `875173623198839` | Cloudinary API Key for authentication. |
| `CLOUDINARY_SECRET` | **Yes** | `j5L0BbQpbdLWj-IaUay6pQUQPsM` | Cloudinary API Secret for signed uploads. |
| `GOOGLE_CLIENT_ID` | Optional | `991075599579-...apps.googleusercontent.com` | Google Cloud OAuth Client ID for customer token verification. |
| `RAZORPAY_KEY` | Optional | `rzp_test_YourKey` | Razorpay API Key ID for order generation. |
| `RAZORPAY_SECRET` | Optional | `YourRazorpaySecret` | Razorpay API Secret for validating HMAC payment signatures. |

---

## 🚀 Installation & Deployment Guide

Follow these steps to configure, seed, and launch the API server:

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/raju95yadav/beauty-back.git

# Navigate to project directory
cd beauty-back
```

### Step 2: Install Node Dependencies

```bash
# Clean install exact dependencies from package-lock.json
npm install
```

### Step 3: Configure Environment Variables

```bash
# Create local .env file
cp .env.example .env 2>/dev/null || touch .env
```

Populate the `.env` file with your credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/beauty-glam
JWT_SECRET=super_secret_jwt_key_glam_beauty_production_token
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

### Step 4: Seed Database with Initial Catalog

Execute the automated database seeding script to populate default categories, brands, administrative users, and dummy cosmetics inventory:

```bash
# Seed default inventory and initial admin user
node runSeeder.js
```

### Step 5: Start the API Server

```bash
# Start in development mode with nodemon hot-reload
npm run dev

# Or start in production mode directly
node server.js
```

Once initialized, the terminal will log:
```
MongoDB Connected: cluster0-shard-00-00.mongodb.net
Server running on port 5000
```

---

## 🔐 Authentication, Authorization & Security Flow

`beauty-back` provides role-based route isolation (`customer` vs `admin`) and multi-channel identity validation.

### Architecture & Sequence Diagram

```
[ Client: beauty-glam / admin ]               [ beauty-back: Server ]               [ MongoDB / Cloudinary ]
              │                                          │                                     │
              │ 1. POST /api/auth/send-otp               │                                     │
              │----------------------------------------->│-- Generate 6-Digit Code             │
              │                                          │-- Save OTP & Expiry (10m) --------->│
              │                                          │-- Send OTP via Nodemailer           │
              │<-- 200 OK ("OTP sent successfully") -----│                                     │
              │                                          │                                     │
              │ 2. POST /api/auth/verify-otp             │                                     │
              │----------------------------------------->│-- Fetch User & Validate Code ------>│
              │                                          │-- Sign JWT { id: user._id }         │
              │<-- 200 OK { token, user: { role } } -----│                                     │
              │                                          │                                     │
              │ 3. Request Protected Resource            │                                     │
              │    (Authorization: Bearer <token>)       │                                     │
              │----------------------------------------->│-- [authMiddleware.protect]          │
              │                                          │   Verify JWT Signature & Expiry     │
              │                                          │-- [authMiddleware.admin (if admin)] │
              │                                          │   Assert req.user.role === 'admin'  │
              │                                          │-- Execute Controller Operation ---->│
              │<-- 200 OK / 201 Created (Data Payload) --│                                     │
              │                                          │                                     │
              │ 4. Invalid Token / Role Mismatch         │                                     │
              │<-- 401 Unauthorized / 403 Forbidden -----│                                     │
```

### Security Engineering Breakdown

1. **Passwordless OTP Authentication**: Eliminates weak or compromised passwords for customers. OTPs are generated using `otp-generator`, stored alongside a 10-minute TTL timestamp in the User document, and invalidated immediately upon successful verification.
2. **Stateless JWT Authorization**: The `protect` middleware extracts the Bearer token from the `Authorization` header, decodes the signed payload via `jwt.verify()`, and injects the sanitized user entity (`req.user`) into the request context.
3. **Role-Based Access Control (RBAC)**: The `admin` middleware enforces authorization parity. If `req.user.role !== 'admin'`, incoming requests are immediately aborted with a `401 / 403` status before executing sensitive controller actions.
4. **Cryptographic Webhook & Payment Verification**: Razorpay verification routes calculate an HMAC SHA-256 signature using `crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)` against the concatenated payload `razorpay_order_id + '|' + razorpay_payment_id`. Payment is only marked completed if the computed digest matches `razorpay_signature`.
5. **Rate Limiting & Threat Mitigation**: All `/api/*` endpoints are fronted by `express-rate-limit` (100 requests per 15-minute window per IP) and `helmet` security headers to thwart sniffing and cross-site scripting attacks.

---

## 📡 API Reference & Testing Documentation

### 1. Authentication Endpoints (`/api/auth`)

#### Request OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@example.com"
  }
  ```
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email": "customer@example.com"}'
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "OTP sent successfully to your email"
  }
  ```

#### Verify OTP & Obtain JWT
- **Endpoint**: `POST /api/auth/verify-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "otp": "482910"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "_id": "65fc987f2e1a3b001234abcd",
    "name": "Jane Doe",
    "email": "customer@example.com",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 2. Products & Inventory (`/api/products`)

#### Query Product Catalog (Paginated & Filtered)
- **Endpoint**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `12`)
  - `category`: Filter category string (e.g. `Skin Care`)
  - `brand`: Filter brand name
  - `minPrice`: Minimum price threshold
  - `maxPrice`: Maximum price threshold
  - `sort`: `price-asc`, `price-desc`, or `newest`
- **cURL Example**:
  ```bash
  curl -X GET "http://localhost:5000/api/products?category=Skin%20Care&sort=price-asc&page=1"
  ```
- **Response `200 OK`**:
  ```json
  {
    "products": [
      {
        "_id": "65fc91234e1a3b0012340001",
        "name": "Pure Rosehip Seed Oil",
        "brand": "Bloom Botanics",
        "category": "Skin Care",
        "price": 28.00,
        "stock": 110,
        "images": [
          { "url": "https://res.cloudinary.com/.../rosehip.jpg" }
        ],
        "rating": 4.8,
        "numReviews": 24
      }
    ],
    "page": 1,
    "pages": 5,
    "total": 58
  }
  ```

#### Create New Product (Admin Only)
- **Endpoint**: `POST /api/products`
- **Access**: Private/Admin
- **Headers**: `Authorization: Bearer <ADMIN_JWT>`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `name`, `brand`, `category`, `price`, `stock`, `description`, `images` (up to 5 image files)

---

### 3. Shopping Cart (`/api/cart`)

#### Add or Update Cart Line Item
- **Endpoint**: `POST /api/cart/add`
- **Access**: Private (Customer)
- **Headers**: `Authorization: Bearer <CUSTOMER_JWT>`
- **Request Body**:
  ```json
  {
    "productId": "65fc91234e1a3b0012340001",
    "qty": 2,
    "price": 28.00
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "_id": "65fc88882e1a3b0012349999",
    "user": "65fc987f2e1a3b001234abcd",
    "cartItems": [
      {
        "product": "65fc91234e1a3b0012340001",
        "qty": 2,
        "price": 28.00
      }
    ]
  }
  ```

---

### 4. Orders & Fulfillment (`/api/orders`)

#### Create Order with Server-Side Stock Lock
- **Endpoint**: `POST /api/orders`
- **Access**: Private (Customer)
- **Headers**: `Authorization: Bearer <CUSTOMER_JWT>`
- **Request Body**:
  ```json
  {
    "orderItems": [
      {
        "name": "Pure Rosehip Seed Oil",
        "qty": 2,
        "image": "https://res.cloudinary.com/.../rosehip.jpg",
        "price": 28.00,
        "product": "65fc91234e1a3b0012340001"
      }
    ],
    "shippingAddress": {
      "street": "42 Marine Drive",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zip": "400020",
      "country": "India"
    },
    "paymentMethod": "Credit Card",
    "itemsPrice": 56.00,
    "shippingPrice": 0.00,
    "taxPrice": 0.00,
    "totalPrice": 56.00,
    "isPaid": true,
    "paidAt": "2026-09-20T18:00:00.000Z",
    "paymentResult": {
      "id": "PAY-98124019",
      "status": "COMPLETED"
    }
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "_id": "65fca9994e1a3b0012345678",
    "user": "65fc987f2e1a3b001234abcd",
    "orderStatus": "Order Placed",
    "totalPrice": 56.00,
    "trackingData": {
      "trackingNumber": "NYK-TRK-78392014",
      "courierPartner": "BlueDart Express",
      "estimatedDelivery": "2026-09-23T18:00:00.000Z",
      "statusLogs": [
        {
          "status": "Order Placed",
          "title": "Order Placed",
          "description": "Your order has been received and verified by Glam Beauty.",
          "location": "Mumbai Central Warehouse"
        }
      ]
    }
  }
  ```

#### Fetch Live Order Tracking Telemetry
- **Endpoint**: `GET /api/orders/:id/tracking`
- **Access**: Private
- **Headers**: `Authorization: Bearer <JWT>`
- **Response `200 OK`**: Returns current courier partner, tracking number, estimated delivery timestamp, and chronological status log entries.

---

### 5. Administrative Intelligence (`/api/admin`)

#### Fetch Executive Dashboard KPI Metrics
- **Endpoint**: `GET /api/admin/stats`
- **Access**: Private/Admin
- **Headers**: `Authorization: Bearer <ADMIN_JWT>`
- **Response `200 OK`**:
  ```json
  {
    "users": 1420,
    "products": 312,
    "orders": 850,
    "revenue": 48290.50,
    "growthPercent": "14.2",
    "lowStockCount": 3,
    "outOfStockCount": 1,
    "salesData": [
      { "name": "Jan", "sales": 3200 },
      { "name": "Feb", "sales": 4100 }
    ],
    "categoryData": [
      { "name": "Skin Care", "value": 120 },
      { "name": "Hair Care", "value": 90 }
    ]
  }
  ```

#### Update Order Fulfillment Lifecycle Status
- **Endpoint**: `PUT /api/admin/order/:id/status`
- **Access**: Private/Admin
- **Headers**: `Authorization: Bearer <ADMIN_JWT>`
- **Request Body**:
  ```json
  {
    "status": "Shipped"
  }
  ```
- **Valid Status Values**: `Order Placed`, `Processing`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`.

---

## 🧪 Testing & Verification

### Automated Test Suite Execution

To execute unit and integration tests across endpoints:

```bash
# Run unit and integration tests
npm test
```

### Integration Test Checklist

| Component Area | Test Scenario | Verified Behavior |
| :--- | :--- | :--- |
| **Auth** | Unauthenticated request to `/api/orders` | Responds with `401 Unauthorized, no token provided`. |
| **Auth** | Request with tampered JWT string | Responds with `401 Not authorized, token invalid or expired`. |
| **Inventory** | Order item quantity exceeds current `stock` | Responds with `400 Bad Request` citing insufficient units. |
| **Inventory** | Successful order submission | Target product `stock` decrements atomically by requested `qty`. |
| **Inventory** | Stock falls below threshold (`<=5`) | Automatically generates an internal `[LOW STOCK ALERT]` notification. |
| **Admin** | Standard customer JWT calling `/api/admin/stats` | Intercepted by `admin` middleware and denied with `401/403`. |
| **Payment** | HMAC SHA-256 signature verification | Successfully verifies genuine signature; rejects manipulated hash. |

### Postman Collection Verification Steps

1. Import the provided environment variables: `baseUrl = http://localhost:5000/api`.
2. Execute `POST /auth/send-otp` with a valid test email.
3. Check email inbox for the 6-digit OTP and call `POST /auth/verify-otp`.
4. Copy the received `token` into Postman's `Bearer Token` collection authorization header.
5. Invoke `GET /products` to confirm catalog delivery.
6. Execute `POST /orders` and verify that the product's database stock record decrements as expected.

---

## 💻 Live Demonstration Guide

Follow this step-by-step CLI walkthrough to verify full API functionality using `curl`:

### 1. Request a Verification OTP
```bash
curl -i -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@glambeauty.com"}'
```

### 2. Verify OTP & Capture JWT Token
```bash
curl -i -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@glambeauty.com", "otp": "YOUR_OTP_HERE"}'
```
*Export the returned JWT token to your shell session:*
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Query Product Catalog
```bash
curl -i -X GET "http://localhost:5000/api/products?limit=2"
```

### 4. Create an Order with Stock Deduction
```bash
curl -i -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderItems": [{
      "name": "Pure Rosehip Seed Oil",
      "qty": 1,
      "price": 28.00,
      "product": "65fc91234e1a3b0012340001"
    }],
    "shippingAddress": {
      "street": "100 Innovation Way",
      "city": "Bengaluru",
      "state": "Karnataka",
      "zip": "560001",
      "country": "India"
    },
    "paymentMethod": "Cash on Delivery",
    "totalPrice": 28.00
  }'
```

### 5. Inspect Real-Time Tracking Telemetry
```bash
curl -i -X GET "http://localhost:5000/api/orders/YOUR_ORDER_ID/tracking" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎓 Academic & Project Information

| Parameter | Specification |
| :--- | :--- |
| **Project Name** | Glam Beauty - Core Backend Service |
| **Repository Name** | `beauty-back` |
| **Lead Developer** | Raju Yadav ([@raju95yadav](https://github.com/raju95yadav)) |
| **Architecture Pattern** | Headless Microservice REST API (Express + MongoDB) |
| **Security Architecture** | Stateless JWT + RBAC + Cryptographic HMAC Payment Signatures |
| **Deployment Target** | Vercel / Railway / AWS EC2 with MongoDB Atlas Cluster |
| **License** | MIT License |

### Associated Ecosystem Repositories

| Repository | Role | Technology Stack | Repository Link |
| :--- | :--- | :--- | :--- |
| **beauty-back** | Core REST API, Auth & Business Logic | Node.js, Express 5, MongoDB, Mongoose, JWT | [GitHub Repo](https://github.com/raju95yadav/beauty-back) |
| **beauty-glam** | Customer E-Commerce Storefront | React 19, Vite, Tailwind CSS, Lucide React | [GitHub Repo](https://github.com/raju95yadav/beauty-glam) |
| **beauty-admin** | Administrative Portal & Inventory Ops | React, Vite, Tailwind CSS, Recharts | [GitHub Repo](https://github.com/raju95yadav/beauty-admin) |

---

<div align="center">
  <sub>Built with precision and security by the Glam Beauty Engineering Team.</sub>
</div>
