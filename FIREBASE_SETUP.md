# Firebase Setup Guide for SecureQuiz

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `SecureQuiz`
4. Click **Continue** → disable Google Analytics (optional) → **Create Project**

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location close to you → Click **Enable**

## Step 3: Get Firebase Config

1. In Firebase Console, click the **⚙️ gear icon** → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web** icon (`</>`) to add a web app
4. Enter app nickname: `SecureQuiz`
5. Click **Register app**
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "securequiz-xxxxx.firebaseapp.com",
  projectId: "securequiz-xxxxx",
  storageBucket: "securequiz-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

7. Copy these values into `firebase-config.js` in your project root

## Step 4: Update firebase-config.js

Open `firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

## Step 5: Set Firestore Rules (for production)

Go to Firestore → Rules and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizzes/{quizId} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ For production, add proper authentication rules!

## That's It!

The app will now sync data between devices via Firebase.

**Without Firebase**: The app still works using local AsyncStorage on each device, but quizzes won't sync between teacher and student devices.
