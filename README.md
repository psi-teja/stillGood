# FoodSaver

A mobile application similar to Too Good To Go, connecting businesses with consumers to reduce food waste by offering discounted soon-to-expire products.

## Features

### For Businesses (Supermarkets/Restaurants)
- User registration and profile management
- Add, edit, and remove product listings
- Set discounts and expiration times
- Manage orders and pickup schedules
- View sales analytics and impact metrics

### For Consumers
- User registration and profile management
- Browse nearby discounted products
- Filter by category, price, distance, etc.
- Place orders and make payments
- Schedule pickups
- Rate and review businesses
- Track environmental impact

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Cloud Storage**: Firebase Storage
- **State Management**: Redux Toolkit
- **UI Framework**: React Native Paper
- **Maps Integration**: Google Maps API
- **Notifications**: Firebase Cloud Messaging
- **Payment Processing**: Stripe

## Project Structure

```
foodsaver/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── navigation/     # Navigation configuration
│   │   ├── screens/        # App screens
│   │   ├── services/       # API and other services
│   │   ├── store/          # Redux store and slices
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # App entry point
│   ├── app.json            # Expo configuration
│   └── package.json        # Dependencies
│
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── app.js          # App entry point
│   └── package.json        # Dependencies
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- MongoDB

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install mobile app dependencies:
   ```
   cd mobile
   npm install
   ```

### Running the App

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
2. Start the mobile app:
   ```
   cd mobile
   expo start
   ```

## Deployment

- Backend: Deploy to services like Heroku, AWS, or Google Cloud
- Mobile: Build with Expo and publish to App Store and Google Play
