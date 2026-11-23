# Celebrity Meet

Website where people choose which celebrity they want to meet.  
**All choices are saved on your backend** and you can receive email notifications.

---

## Quick Start

```bash
cd celebrity-meet
node server.js
```

- **Public site**: http://localhost:3000  
- **Admin panel**: http://localhost:3000/admin  
- **Default admin password**: `meetme2026`

---

## How to Add Pictures of Celebrities

1. Put the photo files inside the folder:
   ```
   public/images/
   ```

2. Name them clearly, for example:
   - `matt-rife.jpg`
   - `anthony-hopkins.jpg`
   - `baker-mayfield.jpg`
   - `bucky-irving.jpg`
   - etc.

3. In `server.js` the celebrities already have the correct paths set, e.g.:
   ```js
   image: '/images/matt-rife.jpg'
   ```

If a photo is missing, the emoji is shown instead (no broken image).

You can also use any external URL:
```js
image: 'https://example.com/photo.jpg'
```

---

## How to Receive Email Notifications

Notifications are sent to: **meetofficialcelebrity@gmail.com**

### Step-by-step (Gmail)

1. Install the email helper (only once):
   ```bash
   npm install nodemailer
   ```

2. Create a Gmail **App Password** (not your normal password):
   - Go to https://myaccount.google.com/apppasswords
   - Generate one for "Mail"

3. Start the server with your credentials:
   ```bash
   GMAIL_USER=yourgmail@gmail.com GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx node server.js
   ```

Or set them permanently as environment variables on your hosting.

Every time someone submits a request you will receive an email with:
- Which celebrity
- Their name
- Their message
- Time of submission

---

## Change Admin Password

```bash
ADMIN_PASSWORD=your-secret-password node server.js
```

---

## Current Celebrities

- Matt Rife
- Anthony Hopkins
- Brad Pitt
- Chris Hemsworth
- Keanu Reeves
- Baker Mayfield
- Bucky Irving
- Alex Anzalone
- + many more (actors, musicians, athletes)

Edit the list at the top of `server.js` to add or remove anyone.

---

## Folder Structure

```
celebrity-meet/
├── server.js
├── package.json
├── README.md
├── data/
│   └── submissions.json      ← all requests are stored here
└── public/
    ├── index.html
    ├── style.css
    ├── app.js
    ├── admin.html
    └── images/               ← put celebrity photos here
        ├── matt-rife.jpg
        ├── anthony-hopkins.jpg
        └── ...
```

---

## Deploy

Works on any server with Node.js 18+:

- Railway, Render, Fly.io, DigitalOcean, VPS, etc.
- Just upload the folder and run `node server.js`
- Remember to set the environment variables for email and password.
