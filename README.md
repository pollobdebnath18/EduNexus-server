# EduNexus Server — Backend

Backend API for the EduNexus Learning Management System, built with Strapi and PostgreSQL.

## Tech Stack

- Strapi 5
- Node.js
- PostgreSQL
- REST API

## Content Types

| Content Type | Description |
|-------------|-------------|
| **Course** | Stores course details (title, description, category, level) with instructor relation |
| **Lesson** | Stores lesson content with order and video URL, linked to a course |
| **Quiz** | Stores quiz metadata linked to a course |
| **Quiz Question** | Stores multiple-choice questions with options and correct answer, linked to a quiz |
| **Quiz Attempt** | Records student quiz attempts with score and total questions |
| **Enrollment** | Tracks student-course enrollment relationships |
| **Lesson Progress** | Tracks lesson completion status per student |
| **Blog Post** | Stores blog articles with title, body, cover image, and author |

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full platform control — manages users, roles, courses, lessons, quizzes, blogs, and all platform data |
| **Content Manager** | Manages courses, lessons, quizzes, and blog posts. Cannot manage users or roles |
| **Instructor** | Manages their own courses, lessons, and quizzes. Views student progress for their courses |
| **Student** | Browses courses, enrolls, views lessons, tracks progress, takes quizzes, and views results |

## API

The backend exposes Strapi REST APIs consumed by the Next.js frontend.

### Custom Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth-me` | GET | Returns the authenticated user's profile with role |
| `/api/registration` | POST | Registers a new user with role assignment (student, instructor, content_manager) |

### Core Content APIs

| Endpoint | Description |
|----------|-------------|
| `/api/courses` | CRUD for courses (with instructor auto-assignment on create) |
| `/api/lessons` | CRUD for lessons |
| `/api/quizzes` | CRUD for quizzes |
| `/api/quiz-questions` | CRUD for quiz questions |
| `/api/quiz-attempts` | CRUD for quiz attempts |
| `/api/enrollments` | CRUD for enrollments |
| `/api/lesson-progresses` | CRUD for lesson progress |
| `/api/blog-posts` | CRUD for blog posts |

## Authentication

JWT-based authentication using Strapi's `users-permissions` plugin. On login/registration, a JWT is issued and used in the `Authorization` header for authenticated requests.

## Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
JWT_SECRET=your_jwt_secret
```

Do not include actual secret values in version control.

## Local Setup

```bash
git clone <repository-url>
cd edunexus-server
npm install
npm run develop
```

The admin panel will be available at [http://localhost:1337/admin](http://localhost:1337/admin).

## Production

```bash
npm run build
npm start
```

## Deployment

- Backend: [https://edunexus-server-production.up.railway.app](https://edunexus-server-production.up.railway.app)
- Admin Panel: [https://edunexus-server-production.up.railway.app/admin](https://edunexus-server-production.up.railway.app/admin)
- Frontend: [https://edunexus-snowy.vercel.app](https://edunexus-snowy.vercel.app)
- PostgreSQL is hosted/configured through Railway.
- Frontend communicates with the Railway public domain via `NEXT_PUBLIC_API_URL`.

## Database Flow

```
Strapi
    ↓
PostgreSQL
```

## Security

- Role-based permissions enforced at the API level
- Authenticated API access via JWT tokens
- Backend authorization checks in custom controllers (e.g., instructors can only modify their own courses)
- Environment variables for all secrets and sensitive configuration

## Project Structure

```
src/
└── api/
    ├── auth-me/           # Custom: returns authenticated user profile
    ├── registration/      # Custom: user registration with role assignment
    ├── course/            # Course CRUD with instructor ownership logic
    ├── lesson/            # Lesson CRUD
    ├── quiz/              # Quiz CRUD
    ├── quiz-question/     # Quiz question CRUD
    ├── quiz-attempt/      # Quiz attempt CRUD
    ├── enrollment/        # Enrollment CRUD
    ├── lesson-progress/   # Lesson progress tracking
    └── blog-post/         # Blog post CRUD
config/
├── database.js            # PostgreSQL connection configuration
├── server.js              # Server host and port configuration
├── admin.js               # Admin panel configuration
├── api.js                 # API configuration
├── middlewares.js          # Middleware configuration
└── plugins.js             # Plugin configuration
```
