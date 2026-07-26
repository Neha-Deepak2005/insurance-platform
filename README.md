# Insurance Management Platform

A comprehensive web-based application for managing insurance operations including policies, claims, premium payments, and customer management.

## Features

✅ **User Authentication** - JWT-based authentication with role-based access
✅ **Customer Management** - Register and manage customer profiles
✅ **Policy Management** - Create, renew, and cancel insurance policies
✅ **Claim Management** - Submit, verify, and process insurance claims
✅ **Premium Tracking** - Track premium payments and payment status
✅ **Dashboard** - Overview of key metrics and statistics
✅ **Role-Based Access Control** - Admin, Agent, and Customer roles

## Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: Flask-Bcrypt
- **Validation**: Marshmallow

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Project Structure

```
insurance-platform/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── models/
│   │   └── models.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── customers.py
│   │   ├── policies.py
│   │   └── claims.py
│   ├── uploads/
│   ├── migrations/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .env.example
└── README.md
```

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Git**

## Local Setup

### 1. Clone and Setup Backend

```bash
cd insurance-platform/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env

# Update .env with your PostgreSQL credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/insurance_db

# Initialize database
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
>>>     db.create_all()
>>> exit()

# Run backend server
python app.py
# Server runs on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd insurance-platform/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run development server
npm run dev
# Frontend runs on http://localhost:3000
```

## Default Demo Credentials

```
Admin:
  Email: admin@example.com
  Password: password123

Agent:
  Email: agent@example.com
  Password: password123

Customer:
  Email: customer@example.com
  Password: password123
```

**Note**: Create these users through the registration page or manually insert them in the database.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/{id}` - Get customer details
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Policies
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy
- `GET /api/policies/{id}` - Get policy details
- `PUT /api/policies/{id}` - Update policy
- `POST /api/policies/{id}/renew` - Renew policy
- `POST /api/policies/{id}/cancel` - Cancel policy

### Claims
- `GET /api/claims` - List claims
- `POST /api/claims` - Submit claim
- `GET /api/claims/{id}` - Get claim details
- `PUT /api/claims/{id}/assign` - Assign to agent
- `PUT /api/claims/{id}/approve` - Approve claim
- `PUT /api/claims/{id}/reject` - Reject claim

## Deployment

### Backend Deployment (Render)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render account** at https://render.com

3. **Create new Web Service**
   - Connect GitHub repository
   - Set runtime to Python 3
   - Set build command: `pip install -r backend/requirements.txt`
   - Set start command: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:create_app()`

4. **Add environment variables**
   - `DATABASE_URL`: Your PostgreSQL URL
   - `JWT_SECRET_KEY`: Generate a secure key
   - `FLASK_ENV`: production

5. **Deploy** and note your backend URL

### Frontend Deployment (Vercel)

1. **Create Vercel account** at https://vercel.com

2. **Connect GitHub repository**

3. **Configure project settings**
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add environment variables**
   - `VITE_API_URL`: Your Render backend URL

5. **Deploy**

### Database Setup

If using Render's PostgreSQL:

1. Create PostgreSQL database on Render
2. Get connection string
3. Add to backend environment variables

For local development:
```bash
# Create database
createdb insurance_db

# Connect and run migrations if needed
psql insurance_db
```

## User Roles & Permissions

### Admin
- Manage all customers
- Create and manage policies for any customer
- Assign and review claims
- Generate reports
- Manage system settings

### Agent
- Register customers
- Create policies for assigned customers
- Verify customer documents
- Review and process claims
- Update policy information

### Customer
- View own policies
- Pay premiums
- Submit insurance claims
- Upload documents
- Track claim status

## Features Implementation

### Completed
- ✅ User authentication and authorization
- ✅ Customer management CRUD
- ✅ Policy creation and management
- ✅ Claim submission and processing
- ✅ Dashboard with basic statistics
- ✅ Role-based access control

### In Progress / Future Enhancements
- 📅 Premium payment tracking
- 📅 Document upload and management
- 📅 Advanced reporting and analytics
- 📅 Email notifications
- 📅 Export to PDF/Excel
- 📅 Audit logs
- 📅 SMS reminders
- 📅 Dark mode

## Troubleshooting

### CORS Issues
If frontend can't connect to backend, check CORS configuration in `backend/app.py`

### Database Connection
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d insurance_db
```

### Port Already in Use
```bash
# Kill process on port 5000 (Flask)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (React)
lsof -ti:3000 | xargs kill -9
```

## Development Tips

1. **Database Migrations**: Use Flask-Migrate for schema changes
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

2. **API Testing**: Use Postman or Thunder Client
   - Import the API endpoints
   - Test with JWT tokens

3. **Frontend Development**: Hot reload is enabled in Vite
   - Changes reflect immediately
   - Check browser console for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Security Notes

⚠️ **Before Production:**
- Change `JWT_SECRET_KEY` to a strong random value
- Use HTTPS only
- Set `DEBUG = False`
- Use environment variables for all secrets
- Implement rate limiting
- Add input validation on all endpoints
- Set up proper logging and monitoring
- Use password complexity requirements
- Implement account lockout after failed attempts

## Support

For issues or questions:
- Check the documentation
- Review existing issues
- Create a new issue with details

## License

This project is part of an internship program.

---

**Last Updated**: August 2024
**Version**: 1.0.0
