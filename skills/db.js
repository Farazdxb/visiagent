#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = '/root/.openclaw/workspace/data/cspzone.db';

function getDb() {
    return new sqlite3.Database(DB_PATH);
}

// Find or create client by email
function findOrCreateClient(clientData) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        
        // Try to find existing client
        db.get('SELECT * FROM clients WHERE email = ?', [clientData.email], (err, row) => {
            if (err) {
                db.close();
                return reject(err);
            }
            
            if (row) {
                // Update existing client
                db.run(`UPDATE clients SET name = ?, phone = ?, jurisdiction = ?, business_activity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [clientData.name, clientData.phone, clientData.jurisdiction, clientData.business_activity, row.id],
                    function(err) {
                        db.close();
                        if (err) return reject(err);
                        resolve({ id: row.id, action: 'updated' });
                    }
                );
            } else {
                // Create new client
                db.run(`INSERT INTO clients (name, email, phone, jurisdiction, business_activity) VALUES (?, ?, ?, ?, ?)`,
                    [clientData.name, clientData.email, clientData.phone, clientData.jurisdiction, clientData.business_activity],
                    function(err) {
                        db.close();
                        if (err) return reject(err);
                        resolve({ id: this.lastID, action: 'created' });
                    }
                );
            }
        });
    });
}

// Save quotation with items
function saveQuotation(clientId, quotationData, items) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        
        db.run(`INSERT INTO quotations (client_id, quotation_no, date, valid_till, jurisdiction, business_activity, sub_total, vat_total, grand_total, status, remarks, pdf_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clientId, quotationData.quotation_no, quotationData.date, quotationData.valid_till, quotationData.jurisdiction, 
             quotationData.business_activity, quotationData.sub_total, quotationData.vat_total, quotationData.grand_total, 
             quotationData.status || 'pending', quotationData.remarks, quotationData.pdf_path],
            function(err) {
                if (err) {
                    db.close();
                    return reject(err);
                }
                
                const quotationId = this.lastID;
                
                // Insert items
                if (items && items.length > 0) {
                    const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
                    const values = [];
                    items.forEach(item => {
                        values.push(quotationId, item.description, item.quantity, item.rate, item.vat_percent, item.amount);
                    });
                    
                    db.run(`INSERT INTO quotation_items (quotation_id, description, quantity, rate, vat_percent, amount) VALUES ${placeholders}`,
                        values,
                        function(err) {
                            db.close();
                            if (err) return reject(err);
                            resolve({ id: quotationId });
                        }
                    );
                } else {
                    db.close();
                    resolve({ id: quotationId });
                }
            }
        );
    });
}

// Get client by ID
function getClient(clientId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM clients WHERE id = ?', [clientId], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// Get quotation by ID with items
function getQuotation(quotationId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM quotations WHERE id = ?', [quotationId], (err, q) => {
            if (err || !q) {
                db.close();
                return resolve(null);
            }
            db.all('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId], (err, items) => {
                db.close();
                if (err) return reject(err);
                resolve({ ...q, items });
            });
        });
    });
}

// Get client by email
function findClientByEmail(email) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM clients WHERE email = ?', [email], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// Update quotation status
function updateQuotationStatus(quotationId, status) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run('UPDATE quotations SET status = ? WHERE id = ?', [status, quotationId], function(err) {
            db.close();
            if (err) return reject(err);
            resolve({ updated: this.changes });
        });
    });
}

// List all clients
function listClients() {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all('SELECT * FROM clients ORDER BY created_at DESC', (err, rows) => {
            db.close();
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// List quotations for a client
function getClientQuotations(clientId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all('SELECT * FROM quotations WHERE client_id = ? ORDER BY created_at DESC', [clientId], (err, rows) => {
            db.close();
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Get next quotation number
function getNextQuotationNumber() {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get("SELECT quotation_no FROM quotations ORDER BY id DESC LIMIT 1", (err, row) => {
            db.close();
            if (err) return reject(err);
            
            if (row) {
                const lastNum = parseInt(row.quotation_no.split('-')[2]);
                const nextNum = lastNum + 1;
                resolve(`Q-2026-${String(nextNum).padStart(4, '0')}`);
            } else {
                resolve('Q-2026-0001');
            }
        });
    });
}

// Save invoice
function saveInvoice(clientId, quotationId, invoiceData) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        
        db.run(`INSERT INTO invoices (client_id, quotation_id, invoice_no, date, amount, status, pdf_path)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clientId, quotationId, invoiceData.invoice_no, invoiceData.date, invoiceData.amount, 
             invoiceData.status || 'unpaid', invoiceData.pdf_path],
            function(err) {
                db.close();
                if (err) return reject(err);
                resolve({ id: this.lastID });
            }
        );
    });
}

// Get next invoice number
function getNextInvoiceNumber() {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get("SELECT invoice_no FROM invoices ORDER BY id DESC LIMIT 1", (err, row) => {
            db.close();
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

// CLI handler
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node db.js <command> [args...]');
    console.error('Commands:');
    console.error('  find-or-create-client <json-data>');
    console.error('  save-quotation <client-id> <json-data> <items-json>');
    console.error('  get-quotation <id>');
    console.error('  find-client <email>');
    console.error('  list-clients');
    console.error('  get-client-quotations <client-id>');
    console.error('  next-quotation-no');
    console.error('  next-invoice-no');
    console.error('  save-invoice <client-id> <quotation-id> <json-data>');
    process.exit(1);
}

const command = args[0];

(async () => {
    try {
        switch (command) {
            case 'find-or-create-client': {
                const data = JSON.parse(args[1]);
                const result = await findOrCreateClient(data);
                console.log(JSON.stringify(result));
                break;
            }
            case 'save-quotation': {
                const clientId = parseInt(args[1]);
                const qData = JSON.parse(args[2]);
                const items = args[3] ? JSON.parse(args[3]) : [];
                const result = await saveQuotation(clientId, qData, items);
                console.log(JSON.stringify(result));
                break;
            }
            case 'get-quotation': {
                const result = await getQuotation(parseInt(args[1]));
                console.log(JSON.stringify(result));
                break;
            }
            case 'find-client': {
                const result = await findClientByEmail(args[1]);
                console.log(JSON.stringify(result));
                break;
            }
            case 'list-clients': {
                const result = await listClients();
                console.log(JSON.stringify(result));
                break;
            }
            case 'get-client-quotations': {
                const result = await getClientQuotations(parseInt(args[1]));
                console.log(JSON.stringify(result));
                break;
            }
            case 'next-quotation-no': {
                const result = await getNextQuotationNumber();
                console.log(result);
                break;
            }
            case 'next-invoice-no': {
                const result = await getNextInvoiceNumber();
                console.log(result);
                break;
            }
            case 'save-invoice': {
                const clientId = parseInt(args[1]);
                const quotationId = parseInt(args[2]);
                const invData = JSON.parse(args[3]);
                const result = await saveInvoice(clientId, quotationId, invData);
                console.log(JSON.stringify(result));
                break;
            }
            case 'update-quotation-status': {
                const result = await updateQuotationStatus(parseInt(args[1]), args[2]);
                console.log(JSON.stringify(result));
                break;
            }
            default:
                console.error('Unknown command:', command);
                process.exit(1);
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
