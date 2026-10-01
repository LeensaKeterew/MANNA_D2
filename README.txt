MANNA - IMY 220 Project, Deliverable 2
======================================
Photo-sharing site for recipes and the verses that go with them.
React (Vite) frontend  +  Express API  +  MongoDB Atlas (official "mongodb" driver, no Mongoose).

Project layout
  /backend    Express API. db/ = one file per collection, services/ = business rules,
              routes/ = thin HTTP layer, seed.js = idempotent demo data
  /frontend   React app. Uses the native Fetch API against relative /api/... routes only
  docker-compose.yml, README.txt, .gitignore live at the root

1. MANUAL SETUP (once)
----------------------
Create backend/.env from backend/.env.example and fill in your real values:

  MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/manna?retryWrites=true&w=majority
  MONGODB_DB=manna
  JWT_SECRET=<long random string>
  PORT=3000              (optional)
  COOKIE_SECURE=false    (set true only behind HTTPS)

In MongoDB Atlas: the database user must exist and Network Access must allow the machine
running Docker (0.0.0.0/0 for the demo). .env is read at run time by docker compose and is
never copied into an image or committed.
For marking, the connection string must be supplied to the markers (put it in backend/.env
inside your submission ZIP, or as instructed on ClickUP).

2. RUN WITH DOCKER (one command)
--------------------------------
  docker compose up --build

Then open http://localhost:8080
Stop with Ctrl+C, or:  docker compose down
(Uploaded images persist in the named volume "manna_uploads"; remove it with
 docker compose down -v)

3. SEED THE DATABASE
--------------------
The backend container runs the seed automatically every time it starts. The seed is
idempotent: it only inserts records that are missing, so re-running never duplicates data.
Run it by hand any time:
  docker compose exec backend node seed.js
Without Docker (needs Node 20.12+ and npm install in /backend):  cd backend && npm run seed

Seeds: 6 users (1 admin), 7 posts, 3 albums, friendships (+1 pending request), comments,
likes, hashtags, 6 report reasons, 1 open report, direct messages.

4. DEMO LOGINS (log in with username or email)
----------------------------------------------
  ADMIN   manna_admin     admin@manna.test      Admin123!
  USER    miriam_okafor   miriam@manna.test     Password123!   (friends with david + ruth,
                                                                has a pending request from esther)
  USER    david_mensah    david@manna.test      Password123!
  USER    ruth_adeyemi    ruth@manna.test       Password123!
  USER    samuel_obi      samuel@manna.test     Password123!
  USER    esther_kimani   esther@manna.test     Password123!

5. LOCAL DEVELOPMENT (optional, without Docker)
-----------------------------------------------
  cd backend  && npm install && npm start      (port 3000)
  cd frontend && npm install && npm run dev    (port 5173, proxies /api and /uploads)

6. API ROUTES  (all JSON; login is an httpOnly cookie; errors are { ok:false, message })
-------------------------------------------------------------------------------------
Auth
  POST   /api/auth/signup                 { username, email, password, confirmPassword }
  POST   /api/auth/signin  (/login)       { identifier, password }
  POST   /api/auth/logout
  GET    /api/auth/me                     current user, or { user: null }
Users / profiles
  GET    /api/users/me                    own profile
  PUT    /api/users/me                    edit name, username, email, bio, avatar, settings,
                                          or password ({ currentPassword, newPassword, confirmPassword })
  DELETE /api/users/me                    delete account (cascades posts, albums, comments, friendships)
  GET    /api/users/:id                   profile + friendship status
  GET    /api/users/:id/posts | /albums | /friends
Friends
  GET    /api/friends                     my friends
  GET    /api/friends/requests            incoming + outgoing pending
  POST   /api/friends/request/:userId     send request
  POST   /api/friends/accept/:userId      accept
  POST   /api/friends/decline/:userId     decline
  DELETE /api/friends/:userId             unfriend / cancel request
Posts
  GET    /api/posts?tag=                  list
  POST   /api/posts                       { title, text, image, verse:{text,reference}, hashtags }
  GET    /api/posts/:id
  PUT    /api/posts/:id                   owner or admin
  DELETE /api/posts/:id                   owner or admin
  POST   /api/posts/:id/like   |  DELETE /api/posts/:id/like
Comments
  GET    /api/posts/:id/comments
  POST   /api/posts/:id/comments          { text }
  PUT    /api/comments/:id                { text }  comment owner or admin
  DELETE /api/comments/:id                comment owner or admin
Albums
  POST   /api/albums                      { name, description, hashtags }
  GET    /api/albums/:id
  PUT    /api/albums/:id                  owner or admin
  DELETE /api/albums/:id                  owner or admin
  POST   /api/albums/:id/posts            { postId }
  DELETE /api/albums/:id/posts/:postId
Reports
  GET    /api/report-reasons
  POST   /api/posts/:id/report            { reasonId, details }
  POST   /api/admin/report-reasons        admin: add a reason
  GET    /api/admin/reports?status=open|resolved
  POST   /api/admin/reports/:id/resolve
Feeds / search / misc
  GET    /api/feed?scope=local|global     local = you + friends, global = everyone, newest first
  GET    /api/hashtags/trending?scope=
  GET    /api/search?q=                   posts (title, text, hashtags, verse) + people
  POST   /api/uploads                     multipart field "image" (JPG/PNG/GIF/WebP, 5 MB) -> { url }
  GET    /uploads/<file>                  served images
  GET    /api/messages | /api/messages/:userId | POST /api/messages/:userId
Admin (administrators only)
  GET    /api/admin/users | /posts | /albums | /comments | /activity
  PUT    /api/admin/users/:id             edit any account (incl. role)
  DELETE /api/admin/users/:id
  (admins can also edit/delete any post, album and comment through the normal routes)
  GET    /api/health

7. NOTES
--------
- Frontend styling uses TailwindCSS v3 (tailwind.config.js holds the MANNA palette, fonts, radii and
  shadow as theme tokens; the shared design system in src/index.css and several component stylesheets
  are written with Tailwind @apply). Tailwind's default font stacks are overridden with Playfair Display
  and Nunito Sans (bundled with @fontsource), and every input/select/textarea/button uses the MANNA body
  font, so no default Tailwind or browser fonts appear. Tailwind preflight is switched off so the
  original D1 look is unchanged.
- Console-clean errors: the frontend sends the header "X-Soft-Errors: 1". For those requests the API
  returns failures as HTTP 200 { ok:false, message, status } so handled errors (wrong password,
  validation) never appear as red console errors. Postman/curl without the header get real 4xx/5xx codes.
- Images that fail to load (e.g. a remote seed photo) fall back to a local MANNA placeholder.
- Passwords are hashed with bcryptjs. Sessions are JWTs in an httpOnly cookie.
- Submission ZIP (per the spec) also needs a text file with your GitHub link.
