# EduLearn REST API Documentation

Complete REST API specification for **EduLearn** educational learning platform.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
- **Endpoint**: `POST /api/auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "student@edulearn.com",
    "password": "password123",
    "role": "STUDENT" // "STUDENT" | "TEACHER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid-string",
        "name": "Alex Johnson",
        "email": "student@edulearn.com",
        "role": "STUDENT",
        "createdAt": "2026-08-17T14:30:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### Login User
- **Endpoint**: `POST /api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "teacher@edulearn.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "uuid-string",
        "name": "Dr. Sarah Jenkins",
        "email": "teacher@edulearn.com",
        "role": "TEACHER"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved",
    "data": {
      "id": "uuid-string",
      "name": "Dr. Sarah Jenkins",
      "email": "teacher@edulearn.com",
      "role": "TEACHER"
    }
  }
  ```

---

## 2. Course & Resource Endpoints

### Get All Courses
- **Endpoint**: `GET /api/courses`
- **Auth Required**: No
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Courses retrieved successfully",
    "data": [
      {
        "id": "c-1",
        "title": "Python Programming",
        "slug": "python-programming",
        "shortDescription": "Learn versatile Python...",
        "overview": "Python is a high-level language...",
        "difficulty": "Beginner",
        "estimatedDuration": "5 Weeks",
        "prerequisites": "None",
        "roadmapItems": [],
        "subtopics": [],
        "videos": [],
        "websites": []
      }
    ]
  }
  ```

### Get Course By ID or Slug
- **Endpoint**: `GET /api/courses/:id` OR `GET /api/courses/slug/:slug`
- **Auth Required**: No
- **Response (200 OK)**: Returns single course object with roadmap, subtopics, featured videos, and websites.

---

## 3. Search Endpoint

### Search Courses
- **Endpoint**: `GET /api/search?q=python`
- **Auth Required**: No
- **Query Parameters**: `q` (Search string)
- **Search Scope**: Matches course title, description, overview, and subtopic titles.

---

## 4. Teacher Endpoints

### Bulk Create Subject (Transaction)
- **Endpoint**: `POST /api/teacher/courses`
- **Auth Required**: Yes (`Bearer <token>` with `TEACHER` role)
- **Request Body**:
  ```json
  {
    "title": "Data Structures",
    "shortDescription": "Master Arrays, Trees & Graphs",
    "overview": "Detailed overview...",
    "difficulty": "Intermediate",
    "estimatedDuration": "8 Weeks",
    "prerequisites": "Programming Logic",
    "roadmap": [
      { "title": "Big-O Notation", "description": "Time complexity" }
    ],
    "subtopics": [
      { "title": "Arrays & Lists", "description": "Contiguous memory", "content": "Full lesson content..." }
    ],
    "videos": [
      { "title": "DS Tutorial", "youtubeUrl": "https://youtube.com/watch?v=...", "channelName": "freeCodeCamp" }
    ],
    "websites": [
      { "name": "GeeksforGeeks", "url": "https://geeksforgeeks.org" }
    ]
  }
  ```

### Get Teacher Courses
- **Endpoint**: `GET /api/teacher/courses`
- **Auth Required**: Yes (`Bearer <token>` with `TEACHER` role)

---

## 5. AI Chatbot Endpoints

### Send AI Chat Message
- **Endpoint**: `POST /api/chat`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "message": "What is a pointer in C?",
    "courseId": "c-1" // Optional course ID context
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "AI response generated successfully",
    "data": {
      "conversationId": "uuid-string",
      "reply": "In C Programming, a pointer is a variable that stores the memory address of another variable...",
      "message": { "id": "msg-id", "sender": "AI", "message": "..." }
    }
  }
  ```

---

## 6. Student Progress Endpoints

### Track Course Progress
- **Endpoint**: `POST /api/progress/:courseId`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "progressPercentage": 65,
    "completedTopics": ["topic-1", "topic-2"]
  }
  ```

---

## Running Backend & Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment (`.env`)**:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="edulearn_super_secret_jwt_key_2026_clarity"
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

4. **Start Server**:
   - Dev mode: `npm run dev`
   - Test suite: `npm test`
