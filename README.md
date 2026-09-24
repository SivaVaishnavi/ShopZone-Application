# SHOPEZ — E-commerce Application (MERN Stack)

ShopEZ is a full-stack e-commerce app: product catalog, cart, checkout,
user profile with order history, and an admin dashboard for managing
products, users, orders, and the homepage banner.

# Demo Video
https://drive.google.com/file/d/1Zei412fzJOqp8AQeFc5Ueo3VecFEqYdm/view?usp=sharing


## Live Url
https://shop-zone-five-murex.vercel.app/

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing

## Folder Structure
```
shopez/
  client/   → React frontend (Vite)
  server/   → Express backend + MongoDB models
```

---

## Step 1: Set Up the Backend (Express Server)

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (copy `.env.example`) and fill in:

```
MONGO_URI=mongodb://localhost:27017/shopez
JWT_SECRET=replace_this_with_a_long_random_secret_string
PORT=8000
```

- If using **MongoDB Compass / local MongoDB**, make sure `mongod` is running first.
- If using **MongoDB Atlas**, paste your Atlas connection string instead.

Start the backend:
```bash
npm run dev
```
Server runs on: **http://localhost:8000**

---

## Step 2: Set Up the Frontend (React App)

Open a new terminal:
```bash
cd client
npm install
npm run dev
```
App runs on: **http://localhost:5173**

---

## Step 3: Create Your First Admin Account
1. Go to `http://localhost:5173/register`
2. Fill the form and set **User type = Admin**
3. Log in — you'll see an "Admin" link in the navbar leading to `/admin`
4. From the Admin Dashboard, click **Add now** to add your first products
   (regular Customer accounts can then browse/buy them)

---

## Step 4: Deploying to Vercel (Frontend) + Render (Backend)

### Backend (Render / Railway / any Node host)
Set these environment variables on your backend host:
| Variable | Example value |
|---|---|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/shopez` |
| `JWT_SECRET` | `your_long_random_secret` |
| `PORT` | `8000` |
| `BACKEND_URL` | `https://your-backend.onrender.com` ← **required for images** |

> `BACKEND_URL` is the public URL of your deployed backend. The server uses it to
> build absolute image URLs (e.g. `https://your-backend.onrender.com/uploads/img.jpg`)
> that the Vercel frontend can load from anywhere.

### Frontend (Vercel)
Go to your Vercel project → **Settings → Environment Variables** and add:
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` ← same URL, no trailing slash |

Then redeploy. Products and their images will now load correctly on the live site.

> **Why this matters:** Without `VITE_API_URL`, the frontend cannot reach the backend
> API or its `/uploads` images. Without `BACKEND_URL`, uploaded images are stored with
> a relative path that breaks on any host other than your local machine.

### Adding Products on the deployed site
- **Use "Paste Image URL"** mode with a public `https://` image link (imgur, Cloudinary, etc.)
  — this stores the URL directly in the DB and always loads everywhere.
- **File Upload** also works as long as `BACKEND_URL` is set on the backend host and
  `VITE_API_URL` is set on Vercel.

---

## Features Implemented
- User registration & login (JWT, hashed passwords)
- Product catalog with category/gender filters and sorting
- Product detail page with size + quantity selection
- Add to cart / remove from cart, live price breakdown
- Checkout flow (address + payment method) → creates orders
- User profile page with order history + cancel order
- Admin dashboard: stats, banner update, add/edit/delete products, manage orders
- Order approval workflow (admin approves/rejects each new order)
- Route-level protection (JWT middleware + Admin-only routes)

