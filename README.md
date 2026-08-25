  
# School System

## M-Pesa PayBill fee capture

## Finance structure migration

Existing databases need the structured fee-category and term fields before recording new fee payments:

```bash
cd backend
npm run migrate:finance
```

New databases receive these fields automatically through `init_schema.sql`.

Parents pay to the school PayBill number and use the student's full name as the account number. Safaricom then posts the completed transaction to the system, which records it against that student automatically. If two learners share a full name, use the admission number instead so the payment is not assigned incorrectly.

Set these values in `backend/.env` before deployment:

```env
MPESA_ENV=production
MPESA_PAYBILL_NUMBER=your_school_paybill_number
MPESA_SHORTCODE=your_school_paybill_number
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_C2B_VALIDATION_URL=https://your-public-domain/api/finance/paybill/validation
MPESA_C2B_CONFIRMATION_URL=https://your-public-domain/api/finance/paybill/confirmation
CURRENT_SCHOOL_TERM=T1-2026
```

Run the database migration once, then register the public HTTPS endpoints with Safaricom:

```bash
cd backend
npm run migrate:mpesa
npm run register:mpesa-c2b
```

The callbacks must be public HTTPS URLs. The system accepts an enrolled student's full name (or admission number) as the account reference, assigns the payment to `CURRENT_SCHOOL_TERM`, and uses the M-Pesa transaction ID to avoid duplicate records when Safaricom retries a callback.

## Running the server

Start the application with `npm start`. Database initialization is intentionally separate, so a temporary database outage cannot make the web server appear healthy while silently failing its setup step. For a new database, run `npm run setup-db` once after the database is reachable.

Use `GET /api/health` to verify both the server and MySQL connection. It returns `200` only when the database is reachable; otherwise it returns `503` with a `degraded` status.
