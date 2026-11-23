const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');
const https = require('https');

// ============== CONFIG ==============
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'meetme2026';

// Email notifications go here
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'meetofficialcelebrity@gmail.com';

// Optional: Gmail credentials for sending (use App Password, not normal password)
// Get one at: https://myaccount.google.com/apppasswords
const GMAIL_USER = process.env.GMAIL_USER || '';          // e.g. yourgmail@gmail.com
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure folders exist
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}
if (!fs.existsSync(path.join(PUBLIC_DIR, 'images'))) {
  fs.mkdirSync(path.join(PUBLIC_DIR, 'images'), { recursive: true });
}

/*
  ========== HOW TO ADD PICTURES ==========
  1. Put the photo file inside:  public/images/
     Example: public/images/matt-rife.jpg

  2. In the celebrities list below, set the image field:
     image: '/images/matt-rife.jpg'

  You can also use any full URL:
     image: 'https://example.com/photo.jpg'

  If no image is set, the emoji is shown instead.
*/

// ============== CELEBRITIES ==============
// Add or edit people here. Use image: '/images/filename.jpg' for local photos.
const celebrities = [
  // Comedy
  { id: 'matt-rife', name: 'Matt Rife', category: 'Comedy', emoji: '😂', image: '/images/matt-rife.jpg' },

  // Acting legends & stars
  { id: 'anthony-hopkins', name: 'Anthony Hopkins', category: 'Acting', emoji: '🎭', image: '/images/anthony-hopkins.jpg' },
  { id: 'brad-pitt', name: 'Brad Pitt', category: 'Acting', emoji: '🎬', image: '/images/brad-pitt.jpg' },
  { id: 'chris-hemsworth', name: 'Chris Hemsworth', category: 'Acting', emoji: '⚡', image: '/images/chris-hemsworth.jpg' },
  { id: 'keanu-reeves', name: 'Keanu Reeves', category: 'Acting', emoji: '🕶️', image: '/images/keanu-reeves.jpg' },
  { id: 'dwayne-johnson', name: 'Dwayne Johnson', category: 'Acting / Wrestling', emoji: '💪', image: '/images/dwayne-johnson.jpg' },
  { id: 'tom-holland', name: 'Tom Holland', category: 'Acting', emoji: '🕷️', image: '/images/tom-holland.jpg' },
  { id: 'zendaya', name: 'Zendaya', category: 'Acting', emoji: '🎬', image: '/images/zendaya.jpg' },
  { id: 'ryan-reynolds', name: 'Ryan Reynolds', category: 'Acting', emoji: '😏', image: '/images/ryan-reynolds.jpg' },
  { id: 'pedro-pascal', name: 'Pedro Pascal', category: 'Acting', emoji: '🤠', image: '/images/pedro-pascal.jpg' },
  { id: 'michael-b-jordan', name: 'Michael B. Jordan', category: 'Acting', emoji: '🔥', image: '/images/michael-b-jordan.jpg' },
  { id: 'timothee-chalamet', name: 'Timothée Chalamet', category: 'Acting', emoji: '🎭', image: '/images/timothee-chalamet.jpg' },
  { id: 'sydney-sweeney', name: 'Sydney Sweeney', category: 'Acting', emoji: '✨', image: '/images/sydney-sweeney.jpg' },
  { id: 'jenna-ortega', name: 'Jenna Ortega', category: 'Acting', emoji: '🖤', image: '/images/jenna-ortega.jpg' },

  // Music
  { id: 'taylor-swift', name: 'Taylor Swift', category: 'Music', emoji: '🎤', image: '/images/taylor-swift.jpg' },
  { id: 'beyonce', name: 'Beyoncé', category: 'Music', emoji: '👑', image: '/images/beyonce.jpg' },
  { id: 'rihanna', name: 'Rihanna', category: 'Music / Business', emoji: '💎', image: '/images/rihanna.jpg' },
  { id: 'ariana-grande', name: 'Ariana Grande', category: 'Music / Acting', emoji: '🐰', image: '/images/ariana-grande.jpg' },
  { id: 'billie-eilish', name: 'Billie Eilish', category: 'Music', emoji: '🖤', image: '/images/billie-eilish.jpg' },
  { id: 'dua-lipa', name: 'Dua Lipa', category: 'Music', emoji: '💃', image: '/images/dua-lipa.jpg' },
  { id: 'sza', name: 'SZA', category: 'Music', emoji: '🌙', image: '/images/sza.jpg' },
  { id: 'lady-gaga', name: 'Lady Gaga', category: 'Music / Acting', emoji: '🃏', image: '/images/lady-gaga.jpg' },

  // Sports (NFL + others)
  { id: 'baker-mayfield', name: 'Baker Mayfield', category: 'NFL', emoji: '🏈', image: '/images/baker-mayfield.jpg' },
  { id: 'bucky-irving', name: 'Bucky Irving', category: 'NFL', emoji: '🏈', image: '/images/bucky-irving.jpg' },
  { id: 'alex-anzalone', name: 'Alex Anzalone', category: 'NFL', emoji: '🏈', image: '/images/alex-anzalone.jpg' },
  { id: 'lebron-james', name: 'LeBron James', category: 'NBA', emoji: '🏀', image: '/images/lebron-james.jpg' }
];

// ============== HELPERS ==============
function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSubmissions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  const contentType = types[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function getAdminPassword(req, url) {
  return req.headers['x-admin-password'] || url.searchParams.get('password') || '';
}

// Simple email sender using Gmail SMTP (no external packages)
// Requires GMAIL_USER + GMAIL_APP_PASSWORD environment variables
function sendEmailNotification(submission) {
  return new Promise((resolve) => {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.log('[Email] Skipped – set GMAIL_USER and GMAIL_APP_PASSWORD to enable notifications');
      console.log('[Email] New submission:', submission.celebrityName, 'from', submission.name);
      return resolve(false);
    }

    const subject = `New Meet Request: ${submission.celebrityName}`;
    const bodyText = `
New celebrity meet request!

Celebrity : ${submission.celebrityName}
From      : ${submission.name}
Message   : ${submission.message || '(none)'}
Time      : ${new Date(submission.createdAt).toLocaleString()}
IP        : ${submission.ip}

---
View all requests in your admin panel.
`;

    // Minimal SMTP over TLS for Gmail
    const auth = Buffer.from(`\0${GMAIL_USER}\0${GMAIL_APP_PASSWORD}`).toString('base64');

    const message = [
      `From: ${GMAIL_USER}`,
      `To: ${NOTIFY_EMAIL}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      bodyText
    ].join('\r\n');

    const options = {
      host: 'smtp.gmail.com',
      port: 465,
      method: 'CONNECT', // we will upgrade
      rejectUnauthorized: true
    };

    // Use a simple approach: log + attempt with child process if available, 
    // otherwise just log clearly so user can enable later.
    // For reliability without packages we log and also try nodemailer if present.

    try {
      // Try to load nodemailer if the user installed it
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD
        }
      });

      transporter.sendMail({
        from: GMAIL_USER,
        to: NOTIFY_EMAIL,
        subject,
        text: bodyText
      }, (err, info) => {
        if (err) {
          console.error('[Email] Failed:', err.message);
          resolve(false);
        } else {
          console.log('[Email] Sent to', NOTIFY_EMAIL);
          resolve(true);
        }
      });
    } catch (e) {
      // nodemailer not installed – just log
      console.log('[Email] To enable real emails run:  npm install nodemailer');
      console.log('[Email] Then set GMAIL_USER and GMAIL_APP_PASSWORD');
      console.log('[Email] New request →', submission.celebrityName, 'from', submission.name);
      resolve(false);
    }
  });
}

// ============== SERVER ==============
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
    return;
  }

  // API: celebrities list
  if (pathname === '/api/celebrities' && req.method === 'GET') {
    return sendJson(res, 200, celebrities);
  }

  // API: submit a choice
  if (pathname === '/api/submit' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { celebrityId, celebrityName, name, message } = body;

      if (!celebrityId || !celebrityName) {
        return sendJson(res, 400, { error: 'Celebrity is required' });
      }

      const submission = {
        id: crypto.randomUUID(),
        celebrityId: String(celebrityId).slice(0, 60),
        celebrityName: String(celebrityName).slice(0, 80),
        name: (name || 'Anonymous').toString().trim().slice(0, 80) || 'Anonymous',
        message: (message || '').toString().trim().slice(0, 500),
        createdAt: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
      };

      const submissions = readSubmissions();
      submissions.unshift(submission);
      writeSubmissions(submissions);

      // Fire email notification (non-blocking)
      sendEmailNotification(submission).catch(() => {});

      return sendJson(res, 200, { success: true, message: 'Your choice has been recorded!' });
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { error: 'Something went wrong' });
    }
  }

  // API: admin – all submissions
  if (pathname === '/api/admin/submissions' && req.method === 'GET') {
    if (getAdminPassword(req, url) !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Wrong password' });
    }
    return sendJson(res, 200, readSubmissions());
  }

  // API: admin – stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    if (getAdminPassword(req, url) !== ADMIN_PASSWORD) {
      return sendJson(res, 401, { error: 'Wrong password' });
    }
    const submissions = readSubmissions();
    const counts = {};
    submissions.forEach(s => {
      counts[s.celebrityName] = (counts[s.celebrityName] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return sendJson(res, 200, { total: submissions.length, byCelebrity: sorted });
  }

  // Admin page
  if (pathname === '/admin') {
    return sendFile(res, path.join(PUBLIC_DIR, 'admin.html'));
  }

  // Static files (including /images/*)
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }

  // Fallback
  sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Celebrity Meet is running!`);
  console.log(`   Public site : http://localhost:${PORT}`);
  console.log(`   Admin panel : http://localhost:${PORT}/admin`);
  console.log(`   Admin password: ${ADMIN_PASSWORD}`);
  console.log(`   Notifications → ${NOTIFY_EMAIL}`);
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log(`\n   ⚠  Email not fully configured yet.`);
    console.log(`      To receive emails:`);
    console.log(`      1. npm install nodemailer`);
    console.log(`      2. Create a Gmail App Password`);
    console.log(`      3. Run with:`);
    console.log(`         GMAIL_USER=you@gmail.com GMAIL_APP_PASSWORD=xxxx node server.js\n`);
  } else {
    console.log(`   Email sending: enabled\n`);
  }
});
