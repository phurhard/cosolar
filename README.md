**Welcome to CoSolar**

**About**

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

Set the Supabase environment variables your app expects in `.env.local`.

Run the app: `npm run dev`

**Run locally**

Use `npm run dev` for development and `npm run build` to verify a production build.

**Supabase bootstrap**

This repo now uses migrations plus seed data:

1. `supabase/migrations/20260325000000_init.sql` is the migration used by `supabase db reset` and `supabase db push`
2. `supabase/seed.sql` bootstraps a default super admin and starter profile

For a fresh local Supabase project, run:

`npx supabase db reset`

Seeded admin credentials:

- Email: `admin@cosolar.local`
- Password: `ChangeMe123!`

Change that password after first login if you reuse the seed beyond local development.
