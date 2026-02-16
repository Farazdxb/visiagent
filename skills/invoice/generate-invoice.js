#!/usr/bin/env node

// Add NODE_PATH for modules
process.env.NODE_PATH = '/usr/lib/node_modules';
require('module').Module._initPaths();

// CLI args - check for status command FIRST
const args = process.argv.slice(2);

if (args[0] === '--status') {
    const invoiceNo = args[1];
    const newStatus = args[2];
    
    if (!invoiceNo || !newStatus) {
        console.error('Usage: node generate-invoice.js --status <invoice-no> <paid|unpaid>');
        process.exit(1);
    }
    
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('/root/.openclaw/workspace/data/cspzone.db');
    
    db.run('UPDATE invoices SET status = ? WHERE invoice_no = ?', [newStatus, invoiceNo], function(err) {
        if (err) {
            console.error('Error:', err.message);
            process.exit(1);
        }
        console.log(`Invoice ${invoiceNo} marked as ${newStatus}`);
        db.close();
    });
    process.exit(0);
}

// Continue with normal invoice generation
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = '/root/.openclaw/workspace/skills/invoice_template.html';
const OUTPUT_DIR = '/root/.openclaw/workspace/invoices';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Logo - read from file
let LOGO_BASE64 = '';
const logoPath = '/root/.openclaw/workspace/skills/quotation/csp_logo.png';
if (fs.existsSync(logoPath)) {
    LOGO_BASE64 = fs.readFileSync(logoPath, 'base64');
    LOGO_BASE64 = 'data:image/png;base64,' + LOGO_BASE64;
}

// Number to words conversion
function numberToWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const num = Math.floor(amount);
    const decimals = Math.round((amount - num) * 100);
    
    if (num === 0) return 'Zero';
    
    function convert(n) {
        if (n >= 1000000) return convert(Math.floor(n / 1000000)) + ' Million ' + convert(n % 1000000);
        if (n >= 1000) return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
        if (n >= 100) return convert(Math.floor(n / 100)) + ' Hundred ' + convert(n % 100);
        if (n >= 20) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
        return ones[n];
    }
    
    let words = convert(num).trim();
    if (decimals > 0) {
        words += ' and ' + decimals + '/100';
    }
    return words + ' UAE Dirhams';
}

// Get next invoice number
function getNextInvoiceNumber(db) {
    return new Promise((resolve, reject) => {
        db.get("SELECT invoice_no FROM invoices ORDER BY id DESC LIMIT 1", (err, row) => {
            if (err) return reject(err);
            
            if (row) {
                const lastNum = parseInt(row.invoice_no.split('-')[2]);
                const nextNum = lastNum + 1;
                resolve(`INV-2026-${String(nextNum).padStart(4, '0')}`);
            } else {
                resolve('INV-2026-0001');
            }
        });
    });
}

// Get quotation data
function getQuotation(db, quotationId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT q.*, c.name as client_name, c.email as client_email, c.phone as client_phone FROM quotations q LEFT JOIN clients c ON q.client_id = c.id WHERE q.id = ?', [quotationId], (err, q) => {
            if (err) return reject(err);
            if (!q) return resolve(null);
            
            db.all('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId], (err, items) => {
                if (err) return reject(err);
                resolve({ ...q, items });
            });
        });
    });
}

// Save invoice to database
function saveInvoiceToDb(db, clientId, quotationId, invoiceData) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO invoices (client_id, quotation_id, invoice_no, date, amount, status, pdf_path)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clientId, quotationId, invoiceData.invoice_no, invoiceData.date, invoiceData.amount, 'unpaid', invoiceData.pdf_path],
            function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            }
        );
    });
}

// CLI args
if (args.length === 0) {
    console.error('Usage:');
    console.error('  node generate-invoice.js <quotation-id> [options]');
    console.error('  node generate-invoice.js --status <invoice-no> <paid|unpaid>');
    console.error('');
    console.error('Examples:');
    console.error('  node generate-invoice.js 1');
    console.error('  node generate-invoice.js --status INV-2026-0001 paid');
    process.exit(1);
}

const quotationId = parseInt(args[0]);

// Parse optional args
let invoiceDate = new Date().toISOString().split('T')[0];
let dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days

for (let i = 1; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) invoiceDate = args[++i];
    if (args[i] === '--due' && args[i + 1]) dueDate = args[++i];
}

// Format dates for display
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

async function generateInvoice() {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('/root/.openclaw/workspace/data/cspzone.db');
    
    // Get quotation data
    const quotation = await getQuotation(db, quotationId);
    if (!quotation) {
        console.error('Quotation not found:', quotationId);
        process.exit(1);
    }
    
    // Get next invoice number
    const invoiceNo = await getNextInvoiceNumber(db);
    
    // Format date
    const invDate = formatDate(invoiceDate);
    const due = formatDate(dueDate);
    
    // Build items HTML
    let itemsHtml = '';
    quotation.items.forEach(item => {
        itemsHtml += `<tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${parseFloat(item.rate).toFixed(2)}</td>
            <td>${item.vat_percent > 0 ? item.vat_percent + '%' : '-'}</td>
            <td>${parseFloat(item.amount).toFixed(2)}</td>
        </tr>`;
    });
    
    // Format amounts
    const subTotal = parseFloat(quotation.sub_total).toFixed(2);
    const vatTotal = parseFloat(quotation.vat_total).toFixed(2);
    const grandTotal = parseFloat(quotation.grand_total).toFixed(2);
    const totalInWords = numberToWords(parseFloat(grandTotal));
    
    // QR Code URL
    const qrCodeUrl = `https://cspzone.com/invoice/${invoiceNo}`;
    
    // Read template
    let html = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    
    // Replace fields
    html = html.split('{{INVOICE_NO}}').join(invoiceNo);
    html = html.split('{{LOGO_IMAGE}}').join(LOGO_BASE64);
    html = html.split('{{CLIENT_NAME}}').join(quotation.client_name || '');
    html = html.split('{{CLIENT_PHONE}}').join(quotation.client_phone || '');
    html = html.split('{{CLIENT_EMAIL}}').join(quotation.client_email || '');
    html = html.split('{{INVOICE_DATE}}').join(invDate);
    html = html.split('{{DUE_DATE}}').join(due);
    html = html.split('{{ITEMS_TABLE}}').join(itemsHtml);
    html = html.split('{{SUB_TOTAL}}').join(subTotal);
    html = html.split('{{VAT_TOTAL}}').join(vatTotal);
    html = html.split('{{GRAND_TOTAL}}').join(grandTotal);
    html = html.split('{{TOTAL_IN_WORDS}}').join(totalInWords);
    html = html.split('{{QUOTATION_REF}}').join(quotation.quotation_no);
    
    // Generate QR code URL
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeUrl)}`;
    html = html.split('{{QR_CODE_IMAGE}}').join(qrApiUrl);
    
    // Generate unique filename
    const timestamp = Date.now();
    const outputPath = path.join(OUTPUT_DIR, `invoice_${invoiceNo.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`);
    
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
        preferCSSPageSize: true,
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
        }
    });
    
    await browser.close();
    
    // Save to database
    await saveInvoiceToDb(db, quotation.client_id, quotationId, {
        invoice_no: invoiceNo,
        date: invDate,
        amount: grandTotal,
        pdf_path: outputPath
    });
    
    db.close();
    
    console.log(`Invoice ${invoiceNo} generated: ${outputPath}`);
    console.log(`Quotation: ${quotation.quotation_no}, Client: ${quotation.client_name}`);
}

generateInvoice().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
