#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = '/root/.openclaw/workspace/quotation_template.html';
const OUTPUT_DIR = '/root/.openclaw/workspace/quotations';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Logo - read from file if path provided, otherwise use base64 string
let LOGO_BASE64 = '';
const logoPath = '/root/.openclaw/workspace/skills/quotation/csp_logo.png';
if (fs.existsSync(logoPath)) {
    LOGO_BASE64 = fs.readFileSync(logoPath, 'base64');
    LOGO_BASE64 = 'data:image/png;base64,' + LOGO_BASE64;
}

// All 21 fields
const fields = {
    // Header
    LOGO_IMAGE: LOGO_BASE64,        // Base64 encoded image or file path
    QUOTATION_NO: '',         // e.g., "Q-2026-0001"
    
    // Client Info
    CLIENT_NAME: '',
    CLIENT_PHONE: '',
    CLIENT_EMAIL: '',
    QUOTATION_DATE: '',
    VALID_TILL_DATE: '',
    JURISDICTION: '',
    BUSINESS_ACTIVITY: '',
    
    // Pricing Table - HTML rows
    ITEMS_TABLE: '',
    
    // Totals
    SUB_TOTAL: '',
    VAT_TOTAL: '',
    GRAND_TOTAL: '',
    
    // Content Sections (HTML)
    REMARKS: '',
    SCOPE_OF_SERVICES: '',
    REQUIRED_DOCUMENTS: '',
    SERVICE_PROCESS: '',
    ESTIMATED_TIMELINE: '',
    PAYMENT_TERMS: '',
    EXCLUSIONS: '',
    ACCEPTANCE_CLAUSE: ''
};

// Parse command line arguments (JSON string)
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node generate-quotation.js <json-data>');
    console.error('Or: node generate-quotation.js --interactive');
    process.exit(1);
}

let inputData;

if (args[0] === '--interactive') {
    // Interactive mode - read from stdin
    let stdinData = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
        stdinData += chunk;
    });
    
    process.stdin.on('end', async () => {
        try {
            inputData = JSON.parse(stdinData);
            await generatePDF(inputData);
        } catch (e) {
            console.error('Invalid JSON input:', e.message);
            process.exit(1);
        }
    });
} else {
    // Direct JSON input
    try {
        inputData = JSON.parse(args[0]);
    } catch (e) {
        console.error('Invalid JSON:', e.message);
        process.exit(1);
    }
    generatePDF(inputData);
}

async function generatePDF(data) {
    // Validate required fields
    const required = ['CLIENT_NAME', 'QUOTATION_DATE', 'QUOTATION_NO'];
    const missing = required.filter(f => !data[f] || data[f] === '');
    
    if (missing.length > 0) {
        console.error('Missing required fields:', missing.join(', '));
        process.exit(1);
    }
    
    // Read template
    let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    
    // Replace all fields - use default value if not provided in input data
    for (const [key, value] of Object.entries(fields)) {
        const placeholder = `{{${key}}}`;
        const replacement = (data[key] !== undefined && data[key] !== '') ? data[key] : value;
        html = html.split(placeholder).join(replacement);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const quotationNo = data.QUOTATION_NO.replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = path.join(OUTPUT_DIR, `quotation_${quotationNo}_${timestamp}.pdf`);
    
    // Launch browser and generate PDF
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '16mm',
            right: '16mm',
            bottom: '16mm',
            left: '16mm'
        }
    });
    
    await browser.close();
    
    // Output the file path
    console.log(outputPath);
}
