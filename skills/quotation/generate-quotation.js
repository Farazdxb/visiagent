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

// Load services config if available
let servicesConfig = null;
const servicesPath = '/root/.openclaw/workspace/skills/quotation/services.js';
if (fs.existsSync(servicesPath)) {
    try {
        servicesConfig = require(servicesPath);
    } catch (e) {
        console.error('Warning: Could not load services config:', e.message);
    }
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
    
    // Auto-fill content from service config if service_type provided
    if (data.service_type && servicesConfig) {
        const serviceData = servicesConfig.formatAsHtml(servicesConfig.getService(data.service_type));
        if (serviceData) {
            // Only use service content if fields are not already provided
            if (!data.REMARKS || data.REMARKS === '') data.REMARKS = serviceData.remarks;
            if (!data.SCOPE_OF_SERVICES || data.SCOPE_OF_SERVICES === '') data.SCOPE_OF_SERVICES = serviceData.scope;
            if (!data.REQUIRED_DOCUMENTS || data.REQUIRED_DOCUMENTS === '') data.REQUIRED_DOCUMENTS = serviceData.documents;
            if (!data.SERVICE_PROCESS || data.SERVICE_PROCESS === '') data.SERVICE_PROCESS = serviceData.process;
            if (!data.ESTIMATED_TIMELINE || data.ESTIMATED_TIMELINE === '') data.ESTIMATED_TIMELINE = serviceData.timeline;
            if (!data.PAYMENT_TERMS || data.PAYMENT_TERMS === '') data.PAYMENT_TERMS = serviceData.payment;
            if (!data.EXCLUSIONS || data.EXCLUSIONS === '') data.EXCLUSIONS = serviceData.exclusions;
            if (!data.ACCEPTANCE_CLAUSE || data.ACCEPTANCE_CLAUSE === '') data.ACCEPTANCE_CLAUSE = serviceData.acceptance_clause;
            console.log(`Using service content: ${data.service_type}`);
        }
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
    
    // Save to database
    const dbPath = '/root/.openclaw/workspace/skills/db.js';
    if (fs.existsSync(dbPath)) {
        try {
            const { execSync } = require('child_process');
            const dbJs = dbPath;
            
            // Find or create client
            const clientResult = JSON.parse(execSync(`NODE_PATH=$(npm root -g) node ${dbJs} find-or-create-client '${JSON.stringify({
                name: data.CLIENT_NAME,
                email: data.CLIENT_EMAIL,
                phone: data.CLIENT_PHONE,
                jurisdiction: data.JURISDICTION,
                business_activity: data.BUSINESS_ACTIVITY
            })}'`, { encoding: 'utf8' }));
            
            // Parse items from ITEMS_TABLE HTML or use provided items
            let items = [];
            if (data.ITEMS_ARRAY && data.ITEMS_ARRAY.length > 0) {
                items = data.ITEMS_ARRAY;
            } else if (data.ITEMS_TABLE) {
                // Parse items from HTML table
                const trMatches = data.ITEMS_TABLE.match(/<tr[^>]*>(.*?)<\/tr>/g);
                if (trMatches) {
                    trMatches.forEach(tr => {
                        const tdMatches = tr.match(/<td[^>]*>(.*?)<\/td>/g);
                        if (tdMatches && tdMatches.length >= 5) {
                            const description = tdMatches[0].replace(/<[^>]+>/g, '').trim();
                            const quantity = parseInt(tdMatches[1].replace(/<[^>]+>/g, '').trim()) || 1;
                            const rate = parseFloat(tdMatches[2].replace(/<[^>]+>/g, '').replace(/,/g, '').trim()) || 0;
                            const vatMatch = tdMatches[3].match(/(\d+)/);
                            const vat_percent = vatMatch ? parseFloat(vatMatch[1]) : 0;
                            const amount = parseFloat(tdMatches[4].replace(/<[^>]+>/g, '').replace(/,/g, '').trim()) || 0;
                            items.push({ description, quantity, rate, vat_percent, amount });
                        }
                    });
                }
            }
            
            // Save quotation
            const quotationResult = JSON.parse(execSync(`NODE_PATH=$(npm root -g) node ${dbJs} save-quotation ${clientResult.id} '${JSON.stringify({
                quotation_no: data.QUOTATION_NO,
                date: data.QUOTATION_DATE,
                valid_till: data.VALID_TILL_DATE,
                jurisdiction: data.JURISDICTION,
                business_activity: data.BUSINESS_ACTIVITY,
                sub_total: parseFloat(data.SUB_TOTAL.replace(/,/g, '')) || 0,
                vat_total: parseFloat(data.VAT_TOTAL.replace(/,/g, '')) || 0,
                grand_total: parseFloat(data.GRAND_TOTAL.replace(/,/g, '')) || 0,
                status: 'pending',
                remarks: data.REMARKS,
                pdf_path: outputPath
            })}' '${JSON.stringify(items)}'`, { encoding: 'utf8' }));
            
            console.log(`DB: Client ${clientResult.action} (ID: ${clientResult.id}), Quotation saved (ID: ${quotationResult.id})`);
        } catch (e) {
            console.error('DB save error:', e.message);
        }
    }
    
    // Output the file path
    console.log(outputPath);
}
