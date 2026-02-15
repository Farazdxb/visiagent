#!/usr/bin/env node

const nodemailer = require('nodemailer');
const fs = require('fs');

// Email configuration
const config = {
    host: 'mail.visifox.ae',
    port: 465,
    secure: true, // SSL
    auth: {
        user: 'hi@visifox.ae',
        pass: 'f$55[tw-O8sX'
    }
};

// Create transporter
const transporter = nodemailer.createTransport(config);

// CLI args
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Usage: node email.js send --to "email@example.com" --subject "Subject" --body "Body text" --attachment "/path/to/file.pdf"');
    console.error('Or: node email.js test');
    process.exit(1);
}

const command = args[0];

async function sendEmail(options) {
    const { to, subject, body, attachment } = options;
    
    if (!to) {
        console.error('Error: --to is required');
        process.exit(1);
    }
    
    const mailOptions = {
        from: '"CSPzone" <hi@visifox.ae>',
        to: to,
        subject: subject || 'Quotation from CSPzone',
        text: body || 'Please find the attached quotation.',
        html: body ? body.replace(/\n/g, '<br>') : 'Please find the attached quotation.'
    };
    
    // Add attachment if provided
    if (attachment && fs.existsSync(attachment)) {
        mailOptions.attachments = [
            {
                filename: attachment.split('/').pop(),
                path: attachment
            }
        ];
    }
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(JSON.stringify({ success: true, messageId: info.messageId }));
        return info;
    } catch (error) {
        console.error(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
    }
}

async function testConnection() {
    try {
        await transporter.verify();
        console.log(JSON.stringify({ success: true, message: 'SMTP connection OK' }));
    } catch (error) {
        console.error(JSON.stringify({ success: false, error: error.message }));
        process.exit(1);
    }
}

// Parse args
async function main() {
    const options = {};
    
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--to' && args[i + 1]) options.to = args[++i];
        if (args[i] === '--subject' && args[i + 1]) options.subject = args[++i];
        if (args[i] === '--body' && args[i + 1]) options.body = args[++i];
        if (args[i] === '--attachment' && args[i + 1]) options.attachment = args[++i];
    }
    
    if (command === 'test') {
        await testConnection();
    } else if (command === 'send') {
        await sendEmail(options);
    } else {
        console.error('Unknown command:', command);
        process.exit(1);
    }
}

main();
