# LearnGennie

A static learning website (plain HTML, CSS and JavaScript) with accounts, profiles and a
"My Learning" list powered by **Supabase**, hosted for free on **Cloudflare Pages**.
There is no build step and no `npm install`.

## Requirements

**Free accounts**
- GitHub (the code lives here)
- Supabase (database and login) - https://supabase.com
- Cloudflare (hosting) - https://dash.cloudflare.com

**To run it on your own computer**
- A modern browser (Chrome/Edge 89+, Firefox 89+, Safari 15+).
- A local web server started *inside the project folder*. Do not double-click the HTML files:
  the pages use JavaScript modules and root paths like `/style.css`, which do not work from `file://`.
  - VS Code: install the **Live Server** extension, then "Go Live", or
  - any terminal: `python3 -m http.server 5500` (then open http://localhost:5500)
- Internet access: Bootstrap, the Supabase JS library, Pyodide, Google Fonts and the Chatbase
  chatbot are loaded from CDNs.

## Setup

### 1. Create the Supabase project
Supabase dashboard -> **New project**. Save the database password somewhere safe.

### 2. Create the tables
**SQL Editor -> New query**, paste all of `supabase/schema.sql`, click **Run**.
It creates `profiles` and `enrollments`, turns on Row Level Security (each user can only see
their own rows) and adds a trigger that creates a profile when someone signs up.

### 3. Add your keys
**Project Settings -> API**. Copy the **Project URL** and the **anon / publishable key** into
`js/config.js`. These two values are meant to be public. Never put the `service_role` / secret
key anywhere in this project.

### 4. Configure sign-up emails (important)
Supabase's built-in email sender is for testing only: about 2 emails per hour, and only to
addresses of your Supabase team. Pick one:
- **Simplest for a student project:** turn off **Confirm email** (Authentication -> Sign In / Providers
  -> Email). People are then logged in right after signing up.
- **Real users with confirmation:** set up your own SMTP provider (Authentication -> Emails -> SMTP settings).

### 5. Allow your site addresses
Authentication -> **URL Configuration**
- **Site URL:** your live address (e.g. `https://learngennie.pages.dev`)
- **Redirect URLs:** add `http://localhost:5500/**` and your live address with `/**`

### 6. Run locally
Start a local server (see Requirements), open the site, sign up, log in, start a course and
check that it appears under **My Learning**.

### 7. Deploy on Cloudflare Pages
1. Push this folder to your GitHub repository.
2. Cloudflare dashboard -> **Workers & Pages -> Create -> Pages -> Connect to Git** and pick the repo.
3. Settings: **Framework preset** None, **Build command** empty, **Build output directory** `/`
   (the project root, where `index.html` is). Click **Save and Deploy**.
4. Copy the `*.pages.dev` address Cloudflare gives you into Supabase (step 5).

Every push to the main branch redeploys automatically. Cloudflare may show pages without
the `.html` ending (e.g. `/courses`); the links still work.

## What is stored where
| Data | Where |
|---|---|
| Accounts, passwords | Supabase Auth (passwords are hashed by Supabase) |
| Name, email | `profiles` table |
| Courses a user started | `enrollments` table |
| Quiz attempts | The visitor's browser (`localStorage`) - not synced between devices |

Courses, resources, quizzes and the workspace are public. **Profile** and **My Learning** require login.

## Free-plan things to know
- Supabase pauses free projects after about a week with no activity. Restore it from the dashboard.
- Free limits change; check each provider's pricing page.
