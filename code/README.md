# Mossi Certificate Verification

A self-hosted full-stack application for verifying Mossi preserved nature art certificates.

## Features

- **Public verification page** at `/verify` - Customers can verify their purchased artwork
- **Admin dashboard** at `/admin` - Manage artwork records with full CRUD operations
- **Custom JWT authentication** - Secure admin access with bcrypt password hashing
- **File upload system** - Upload artwork images (JPG/PNG)
- **SQLite database** - Self-contained database with Prisma ORM
- **Czech language** - All UI text in Czech for local customers

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

\`\`\`env
# Database
NEON_DATABASE_URL="file:./data/mossi.db"

# JWT Secret - CHANGE THIS to a secure random string!
APP_SECRET="your_secure_random_string_here"

# Admin credentials for seeding
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="your-secure-password"

# Node environment
NODE_ENV="development"
\`\`\`

**Important:** 
- Change `APP_SECRET` to a secure random string (at least 32 characters)
- Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your desired admin credentials
- These credentials will be used when you run the seed script

### 3. Initialize Database

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database with your admin user
npm run seed
\`\`\`

The seed script will create:
- An admin user with the email and password from your `.env` file
- A demo artwork record (MOSS-0001) for testing

### 4. Build and Start

\`\`\`bash
# Build the application
npm run build

# Start the production server
npm start
\`\`\`

The app will run on `http://localhost:3000`

## How to Log In

1. Open your browser and go to `http://localhost:3000`
2. Click the "Administrátor" button in the top right corner
3. Log in with the credentials you set in your `.env` file:
   - Email: The value of `ADMIN_EMAIL`
   - Password: The value of `ADMIN_PASSWORD`

## Usage

### For Customers (Public)
- Visit `/verify` to check artwork authenticity by entering the certificate code
- The Mossi logo and verification form are displayed prominently

### For Administrators
- Click "Administrátor" in the top right to access the login page
- After logging in, you'll see the admin dashboard at `/admin`
- Add, edit, or delete artwork records
- Upload images for each artwork
- All changes are saved to the SQLite database

## Changing Admin Password

To change your admin password after initial setup:

1. Update `ADMIN_PASSWORD` in your `.env` file
2. Delete the existing database: `rm -rf data/mossi.db`
3. Run migrations and seed again:
   \`\`\`bash
   npx prisma migrate deploy
   npm run seed
   \`\`\`

Alternatively, you can manually update the password in the database using Prisma Studio:
\`\`\`bash
npx prisma studio
\`\`\`

## Development

\`\`\`bash
# Run in development mode with hot reload
npm run dev

# View/edit database with Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
rm -rf data/mossi.db
npx prisma migrate deploy
npm run seed
\`\`\`

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Database:** SQLite with Prisma ORM
- **Authentication:** Custom JWT with httpOnly cookies
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **File Uploads:** Node.js runtime with formidable
- **Password Hashing:** bcrypt

## Project Structure

\`\`\`
mossi-certificate-verification/
├── app/
│   ├── admin/          # Admin dashboard and login
│   ├── api/            # API routes (auth, artworks, verify)
│   ├── verify/         # Public verification page
│   └── page.tsx        # Home page (redirects to /verify)
├── components/         # React components
├── lib/                # Utilities (auth, prisma, file-upload)
├── prisma/             # Database schema and migrations
├── public/
│   ├── images/         # Static images (logo)
│   └── uploads/        # Uploaded artwork images
└── scripts/            # Database seed script
\`\`\`

## Security Notes

- JWT tokens are stored in httpOnly cookies (not accessible via JavaScript)
- Passwords are hashed with bcrypt (10 rounds)
- File uploads are validated (type, size, dimensions)
- Admin routes are protected with authentication middleware
- Always use a strong `APP_SECRET` in production

## Support

For issues or questions, refer to the code comments or check the Prisma and Next.js documentation.
