# Unwantra Coaching Platform Architecture

## Information Architecture
- Home: hero, mission, vision, why we exist, value proposition, featured programs, coaches, testimonials, discovery CTA.
- Our Story: company origin, women-led and African-led leadership, coaching philosophy.
- Coaching Services: Individual Executive Coaching and Group Executive Coaching with benefits, outcomes, and CTAs.
- Coaches: photo, bio, expertise, experience, languages, availability, and booking action.
- Discovery Call Booking: accountless five-step workflow.
- Contact Us: name, email, phone, coaching interest, goals.
- Staff Areas: authenticated coach and admin dashboards.

## Database Entities And Relationships
- `user_accounts`: coaches/admins. Coaches own availability slots, bookings, and session notes.
- `programs`: coaching service catalog. Coaches and bookings reference program slugs through `programName`.
- `clients`: accountless booking clients, keyed by email.
- `coach_bookings`: availability slots. Each slot belongs to one coach and one program. Unique index on `coachId + bookingDate` prevents double booking.
- `booking_sessions`: client bookings. Each booking belongs to one coach, one client email, and one program.
- `notifications`: queued/sent notification audit records for email and future WhatsApp.
- `testimonials`: admin-managed public proof.
- `session_notes`: private coach notes linked to booking, coach, and client email.

## API Endpoints
- `GET /api/accounts`: list staff/coaches with filters.
- `POST /api/accounts`: create or update coach/admin accounts.
- `PUT /api/accounts/:id`: update profile, specialty, bio, expertise, languages, workload, password.
- `POST /api/accounts/login`: authenticated coach/admin login.
- `GET /api/bookings/coach-slots`: list availability.
- `POST /api/bookings/coach-slots`: create availability with specialty validation.
- `PATCH /api/bookings/coach-slots/:id`: reschedule/cancel/update slot.
- `DELETE /api/bookings/coach-slots/:id`: delete unbooked availability.
- `POST /api/bookings/assign-coach`: intelligent assignment by program, availability, workload, specialization, experience.
- `POST /api/bookings/book-slot`: accountless client booking with atomic slot claim.
- `GET /api/bookings/sessions`: list bookings, filterable by email.
- `GET/POST /api/platform/programs`: manage services.
- `GET/POST/PUT /api/platform/testimonials`: manage testimonials.
- `GET /api/platform/notifications`: reporting/audit.
- `GET/POST /api/platform/session-notes`: coach notes and client history.
- `GET /api/platform/analytics`: dashboard reporting metrics.

## Notifications
- Email is implemented through Brevo.
- Notification records are stored for booking confirmation, approval, rejection, reminders, and reschedule notices.
- WhatsApp is future-ready through the `channel` field and phone storage.

## Security Improvements
- Public clients do not create accounts.
- Coach/admin accounts require authentication and hashed passwords.
- User role accounts are blocked from staff login.
- Booking validates coach program fit.
- Slot claiming uses an atomic update against `status: open`.
- Password fields are excluded from account list responses.

## Deployment
- Frontend: `cd coaching-app && npm install && npm run build`; deploy `dist` to Vercel/static host.
- Backend: `cd backend && npm install && npm run build`; deploy `dist/server.js` to Render/Node host.
- Required backend environment: `MONGODB_URI`, `PORT`, `BREVO_API_KEY`.
- Frontend environment: `VITE_API_BASE_URL=https://your-backend-host`.
