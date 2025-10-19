/**
 * Email System Test Script
 *
 * Tests SMTP configuration and sends a test email.
 * Run with: node server/test-email.js
 */

import "dotenv/config";
import nodemailer from "nodemailer";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(
  `\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
);
console.log(`${colors.cyan}  DJ Forever 2 - Email System Test${colors.reset}`);
console.log(
  `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
);

// Step 1: Validate Environment Variables
console.log(
  `${colors.blue}📋 Step 1: Validating environment variables...${colors.reset}`
);

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const config = {};
const missing = [];

for (const key of required) {
  if (process.env[key]) {
    config[key] = process.env[key];
    // Mask password for display
    const displayValue =
      key === "SMTP_PASS"
        ? "*".repeat(process.env[key].length)
        : process.env[key];
    console.log(`  ${colors.green}✓${colors.reset} ${key}: ${displayValue}`);
  } else {
    missing.push(key);
    console.log(`  ${colors.red}✗${colors.reset} ${key}: Missing`);
  }
}

if (missing.length > 0) {
  console.log(
    `\n${colors.red}❌ Configuration incomplete. Missing: ${missing.join(
      ", "
    )}${colors.reset}`
  );
  console.log(`\n${colors.yellow}💡 Add these to server/.env:${colors.reset}`);
  console.log(`SMTP_HOST=smtp.gmail.com`);
  console.log(`SMTP_PORT=587`);
  console.log(`SMTP_USER=your-email@gmail.com`);
  console.log(`SMTP_PASS=your-app-password\n`);
  process.exit(1);
}

console.log(
  `${colors.green}✅ All environment variables present${colors.reset}\n`
);

// Step 2: Create Transporter
console.log(
  `${colors.blue}🔧 Step 2: Creating SMTP transporter...${colors.reset}`
);

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: Number(config.SMTP_PORT) === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

console.log(`  Host: ${config.SMTP_HOST}`);
console.log(`  Port: ${config.SMTP_PORT}`);
console.log(`  Secure: ${Number(config.SMTP_PORT) === 465}`);
console.log(`${colors.green}✅ Transporter created${colors.reset}\n`);

// Step 3: Verify SMTP Connection
console.log(
  `${colors.blue}🔌 Step 3: Verifying SMTP connection...${colors.reset}`
);

try {
  await transporter.verify();
  console.log(`${colors.green}✅ SMTP connection successful!${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.red}❌ SMTP connection failed${colors.reset}`);
  console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);

  if (error.message.includes("Invalid login")) {
    console.log(`${colors.yellow}💡 Troubleshooting tip:${colors.reset}`);
    console.log(
      `   For Gmail, you need an "App Password", not your regular password.`
    );
    console.log(`   1. Go to https://myaccount.google.com/apppasswords`);
    console.log(`   2. Generate a new app password for "Mail"`);
    console.log(
      `   3. Update SMTP_PASS in server/.env with the 16-character password\n`
    );
  }

  process.exit(1);
}

// Step 4: Send Test Email
console.log(`${colors.blue}📧 Step 4: Sending test email...${colors.reset}`);

const testEmail = {
  from: config.SMTP_USER,
  to: config.SMTP_USER, // Send to yourself for testing
  subject: "🎉 DJ Forever 2 - Email System Test",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .content {
          padding: 40px 30px;
        }
        .success {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .info {
          background: #e7f3ff;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Email System Test</h1>
        </div>
        <div class="content">
          <div class="success">
            <strong>🎉 Success!</strong> Your email system is working correctly.
          </div>
          
          <h2>Test Results</h2>
          <div class="info">
            <p><strong>SMTP Host:</strong> ${config.SMTP_HOST}</p>
            <p><strong>SMTP Port:</strong> ${config.SMTP_PORT}</p>
            <p><strong>From Address:</strong> ${config.SMTP_USER}</p>
            <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <h3>Next Steps</h3>
          <ol>
            <li>This confirms your SMTP configuration is working</li>
            <li>You can now send RSVP reminders from the admin dashboard</li>
            <li>Go to Admin Dashboard → Email Reminders tab</li>
            <li>Select guests and send reminder emails</li>
          </ol>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This is an automated test email from DJ Forever 2 wedding website.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
✅ DJ Forever 2 - Email System Test

SUCCESS! Your email system is working correctly.

Test Results:
- SMTP Host: ${config.SMTP_HOST}
- SMTP Port: ${config.SMTP_PORT}
- From Address: ${config.SMTP_USER}
- Test Date: ${new Date().toLocaleString()}

Next Steps:
1. This confirms your SMTP configuration is working
2. You can now send RSVP reminders from the admin dashboard
3. Go to Admin Dashboard → Email Reminders tab
4. Select guests and send reminder emails

This is an automated test email from DJ Forever 2 wedding website.
  `,
};

try {
  const info = await transporter.sendMail(testEmail);
  console.log(`${colors.green}✅ Test email sent successfully!${colors.reset}`);
  console.log(`  Message ID: ${info.messageId}`);
  console.log(`  To: ${testEmail.to}`);
  console.log(`  Subject: ${testEmail.subject}\n`);

  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(
    `${colors.green}🎉 All tests passed! Email system is ready.${colors.reset}`
  );
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
  );

  console.log(
    `${colors.yellow}📬 Next: Check your inbox (${testEmail.to})${colors.reset}`
  );
  console.log(
    `${colors.yellow}   You should receive the test email within a few seconds.${colors.reset}\n`
  );
} catch (error) {
  console.log(`${colors.red}❌ Failed to send test email${colors.reset}`);
  console.log(`${colors.red}Error: ${error.message}${colors.reset}\n`);
  process.exit(1);
}
