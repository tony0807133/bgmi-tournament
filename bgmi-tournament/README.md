# BGMI Tournament Platform

## Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env   # add your Razorpay key
npm install
npm run dev
```

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Any random secret string |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password (not your login password) |
| `CLIENT_URL` | Frontend URL (http://localhost:3000) |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_RAZORPAY_KEY_ID` | Same Razorpay Key ID (public) |

## Create Admin User
After registering a user, update their role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Features
- Solo / Duo / Squad tournaments (free & paid)
- 20% admin profit, 80% prize pool auto-calculated
- Razorpay payment integration (min ₹10)
- Wallet system — pay with wallet or Razorpay
- Room ID/Password sent via beautiful email to team leaders
- Slot progress bar on every tournament card
- Admin can refund all if slots not full (cancels tournament)
- Winners upload screenshots, admin sets kills/rank
- Admin distributes prizes to wallets in one click
- Withdrawal requests with UPI ID (min ₹10)
- Admin approves/rejects withdrawals
