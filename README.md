# Getting Started

## Setup

1.  **Environment Variables**: Copy `.env.example` (create one based on needed vars) to `.env`
    *   `TOAST_API_URL` (if available)
    *   `TOAST_RESTAURANT_GUID` (if available)
    *   `TOAST_AUTH_TOKEN` (if available)

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    ```bash
    npx prisma migrate dev
    npx tsx prisma/seed.ts
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Deployment

1.  Build the project: `npm run build`
2.  Start: `npm start`
3.  Ensure database migration is run in production environment.

## Order Flow & Toast Integration

*   Orders are stored in the local DB first (`Order`, `OrderItem`).
*   The `OrderDispatcher` (`src/lib/toast/dispatcher.ts`) picks up the new order and sends it to Toast API.
*   Toast handles printing to the kitchen.
*   **Fallback**: If Toast fails or is not configured, orders are visible at `/admin` dashboard.
