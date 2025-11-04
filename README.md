# Safe Haven - Community Support Platform

A comprehensive web application designed to connect individuals in need with shelter services and food bank resources in their local area. Built using Next.js, React, MongoDB, and modern web technologies.

## 🎯 Project Overview

Safe Haven is a full-stack platform that facilitates:
- **Shelter Matching**: Users fill out detailed questionnaires to find compatible shelters based on their specific needs
- **Shelter Management**: Admin portal for shelter administrators to manage applications, profiles, and document requests
- **Food Bank Services**: Integration with local food bank resources and services
- **Document Management**: Secure document upload and request system for application processing

## 🏗️ Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes, Express.js, Node.js
- **Database**: MongoDB (with GridFS for file storage)
- **Authentication**: JWT, OAuth (Google), bcrypt
- **Testing**: Jest, Playwright, React Testing Library
- **Other**: Nodemailer, Socket.io, Google Maps API

## 👥 Project Structure & Contributions

This is a **collaborative team project** with different team members responsible for different systems:

### Shelter System (Individual Contribution)
The **entire Shelter System** was developed individually by **Hussain Rehman**, including:
- Complete user questionnaire and form submission system
- Intelligent shelter matching algorithm with weighted criteria
- Shelter application submission and tracking system
- Comprehensive admin portal with authentication (JWT, OAuth, email verification)
- Document request and upload system with GridFS storage
- Real-time notifications and dashboard features
- All related APIs, database schemas, and frontend components

**Shelter System Files:**
- `app/shelterPortal/` - All shelter admin portal pages
- `app/api/shelterAdmin/` - All shelter admin APIs
- `app/api/shelter-applications/` - Application management APIs
- `app/api/shelter-matching/` - Matching algorithm API
- `app/api/document-requests/` - Document request APIs
- `app/api/document-uploads/` - File upload APIs
- `app/form/` - User questionnaire system
- `app/utils/shelterMatching.js` - Core matching algorithm
- `app/utils/shelterFormValidation.js` - Form validation utilities

### Food Bank System (Team Contribution)
The **Food Bank System** was developed collaboratively by other team members.

### Additional Features
Various team members contributed to shared components, styling, and integration features.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cs2001-2024-25-group-52-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   EMAIL_HOST=your_email_host
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── shelterAdmin/     # Shelter admin APIs (Hussain Rehman)
│   │   ├── shelter-applications/  # Application APIs (Hussain Rehman)
│   │   ├── shelter-matching/      # Matching algorithm API (Hussain Rehman)
│   │   ├── document-requests/     # Document request APIs (Hussain Rehman)
│   │   ├── document-uploads/      # File upload APIs (Hussain Rehman)
│   │   └── adminfood/            # Food bank APIs (Team)
│   ├── shelterPortal/        # Shelter admin portal (Hussain Rehman)
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── login/           # Admin login
│   │   └── register/        # Admin registration
│   ├── form/                # User questionnaire (Hussain Rehman)
│   ├── userdashboard/       # User dashboard (Hussain Rehman)
│   └── utils/               # Utility functions
├── __tests__/               # Test files
│   ├── api/                 # API tests
│   └── utils/               # Utility tests
├── lib/                     # Shared libraries
│   ├── auth/                # Authentication utilities
│   └── mongodb.js           # MongoDB connection
└── public/                  # Static assets
```

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run API Tests
```bash
npm run test:api
```

## 📚 Documentation

### API Documentation
- API test results and documentation: `__tests__/api/`
- Test results: `__tests__/api/API_Test_Results.md`
- Admin API tests: `__tests__/api/Admin_API_Test_Documentation.md`

### Project Documentation
- API testing: Comprehensive test coverage in `__tests__/api/` directory

## 🔑 Key Features

### Shelter System (Hussain Rehman)
- ✅ Multi-step user questionnaire with conditional logic
- ✅ Intelligent shelter matching algorithm (mandatory + weighted criteria)
- ✅ Application submission system with urgency calculation
- ✅ Complete admin portal with authentication (JWT, OAuth, email verification, OTP)
- ✅ Document request system with custom document types
- ✅ Secure file upload system using MongoDB GridFS
- ✅ Real-time notifications and auto-refresh
- ✅ Comprehensive dashboard with filtering, search, and pagination
- ✅ Application status and stage management
- ✅ Password reset and change functionality
- ✅ Rate limiting and CSRF protection

### Food Bank System (Team)
- ✅ Food bank resources and services
- ✅ Admin food bank portal
- ✅ Food bank management features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Email verification system
- ✅ OTP verification
- ✅ Password reset functionality
- ✅ Rate limiting and CSRF protection

## 📅 Development Timeline (Shelter System)

The Shelter System was developed over 5 sprints using Agile/Scrum methodology:

### Sprint 1
- Built user questionnaire UI and form submission system
- Created API endpoints for processing questionnaire data
- Implemented MongoDB database schema for storing user data
- Migrated from Firebase to MongoDB based on project requirements

### Sprint 2
- Served as Scrum Master for the team
- Developed MongoDB schema for admin users
- Built complete authentication system (registration, login, admin dashboard)
- Created frontend-backend integration for authentication

### Sprint 3
- Continued as Scrum Master role
- Implemented email verification system for account activation
- Added OTP verification for login
- Enhanced security with rate-limiting and CSRF protection
- Implemented logout with token invalidation
- Improved error handling across registration and login flows

### Sprint 4
- Developed intelligent shelter matching algorithm (mandatory + weighted criteria)
- Built shelter matching API and results display page
- Created application submission system with urgency calculation
- Implemented shelter profile management (view/edit functionality)
- Built applications management system with filtering, search, and sorting
- Added application status and stage management
- Implemented password reset functionality
- Enhanced form editing capabilities

### Sprint 5
- Built user dashboard with application tracking
- Implemented real-time notifications system
- Created document upload system using MongoDB GridFS
- Developed document request system for admins
- Built document viewer and management features
- Implemented auto-refresh functionality for real-time updates

**Note**: In addition to planned sprint tasks, additional features were implemented to ensure system completeness and integration.

## 🔍 Reviewing Individual Contributions

### For Employers / Recruiters

When evaluating contributions:

1. **Shelter System Code**: Review files in `app/shelterPortal/`, `app/api/shelterAdmin/`, `app/api/shelter-applications/`, and related directories
2. **Code Quality**: Examine implementation details, error handling, and architecture
3. **Testing**: Review test files in `__tests__/api/` directory, particularly:
   - `shelter-applications.test.js`
   - `shelter-matching.test.js`
   - `admin-applications.test.js`
   - `userForm.test.js`
4. **Documentation**: Check API documentation and test results
5. **Architecture**: Review database schemas, API structure, and component organization

### Code Organization

- **Frontend Components**: `app/shelterPortal/`, `app/form/`, `app/userdashboard/`
- **Backend APIs**: `app/api/shelterAdmin/`, `app/api/shelter-applications/`, `app/api/shelter-matching/`
- **Utilities**: `app/utils/shelterMatching.js`, `app/utils/shelterFormValidation.js`
- **Tests**: `__tests__/api/` and `__tests__/utils/`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- Built as part of a team project for academic coursework
- Shelter System developed by Hussain Rehman
- Food Bank System developed by team members
- Special thanks to tutors and mentors for guidance

## 📧 Contact

For questions about this project:
- Shelter System: Review code in `app/shelterPortal/` and `app/api/shelterAdmin/` directories
- API Documentation: Check `__tests__/api/` directory
- Development Timeline: See Development Timeline section above

---

**Note**: This is a collaborative team project. The Shelter System was developed individually by Hussain Rehman, while the Food Bank System was developed by other team members. All code is available for review in the repository.
