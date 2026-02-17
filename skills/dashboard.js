#!/usr/bin/env node

// Dashboard script for CSPzone
// Usage: node dashboard.js [date-filter]
// Examples:
//   node dashboard.js                    → This month (default)
//   node dashboard.js this-month        → This month
//   node dashboard.js last-month        → Last month
//   node dashboard.js 2026              → Full year 2026
//   node dashboard.js 01-2026           → January 2026
//   node dashboard.js "01-01-2026 to 31-01-2026" → Date range

process.env.NODE_PATH = '/usr/lib/node_modules';
require('module').Module._initPaths();

const sqlite3 = require('sqlite3').verbose();
const dbPath = '/root/.openclaw/workspace/data/cspzone.db';

function getDateFilter(args) {
    if (!args || args.length === 0) {
        return { type: 'this-month' };
    }
    
    const input = args.join(' ').toLowerCase().trim();
    
    if (input === 'this-month') return { type: 'this-month' };
    if (input === 'last-month') return { type: 'last-month' };
    
    // Check for date range "DD-MM-YYYY to DD-MM-YYYY"
    if (input.includes(' to ')) {
        const parts = input.split(' to ');
        return { type: 'range', start: parts[0].trim(), end: parts[1].trim() };
    }
    
    // Check for month-year "MM-YYYY"
    if (input.includes('-') && input.split('-').length === 2) {
        const parts = input.split('-');
        const month = parseInt(parts[0]);
        const year = parseInt(parts[1]);
        if (month >= 1 && month <= 12) {
            return { type: 'month', month, year };
        }
    }
    
    // Check for year "YYYY"
    if (!isNaN(parseInt(input)) && input.length === 4) {
        return { type: 'year', year: parseInt(input) };
    }
    
    return { type: 'this-month' };
}

function formatAmount(amount) {
    return (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function getDashboard(args) {
    const db = new sqlite3.Database(dbPath);
    const filter = getDateFilter(args);
    const now = new Date();
    
    // Build date filter strings for DD-MM-YYYY format
    let dateFilter = '';
    let dateFilterParams = [];
    
    if (filter.type === 'this-month') {
        const monthStr = String(now.getMonth() + 1).padStart(2, '0');
        dateFilter = `date LIKE '%-${monthStr}-${now.getFullYear()}'`;
    } else if (filter.type === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const monthStr = String(lastMonth.getMonth() + 1).padStart(2, '0');
        dateFilter = `date LIKE '%-${monthStr}-${lastMonth.getFullYear()}'`;
    } else if (filter.type === 'month') {
        const monthStr = String(filter.month).padStart(2, '0');
        dateFilter = `date LIKE '%-${monthStr}-${filter.year}'`;
    } else if (filter.type === 'year') {
        dateFilter = `date LIKE '%-${filter.year}'`;
    } else if (filter.type === 'range') {
        dateFilter = `date >= '${filter.start}' AND date <= '${filter.end}'`;
    }
    
    console.log('📊 CSPzone Dashboard');
    console.log('='.repeat(50));
    
    if (filter.type === 'this-month') {
        console.log(`📅 This Month: ${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`);
    } else if (filter.type === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        console.log(`📅 Last Month: ${String(lastMonth.getMonth() + 1).padStart(2, '0')}-${lastMonth.getFullYear()}`);
    } else if (filter.type === 'month') {
        console.log(`📅 ${String(filter.month).padStart(2, '0')}-${filter.year}`);
    } else if (filter.type === 'year') {
        console.log(`📅 Year: ${filter.year}`);
    } else if (filter.type === 'range') {
        console.log(`📅 ${filter.start} to ${filter.end}`);
    }
    
    console.log('='.repeat(50));
    
    return new Promise((resolve) => {
        // Row 1: Revenue Overview
        console.log('\n💰 ROW 1: REVENUE OVERVIEW');
        console.log('-'.repeat(50));
        
        // Total Revenue (All Time)
        db.get("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'", (err, row) => {
            const totalRevenueAllTime = row.total;
            console.log(`Total Revenue (All Time): AED ${formatAmount(totalRevenueAllTime)}`);
            
            // Revenue for filtered period
            let revenueFiltered = 0;
            const revenueQuery = dateFilter 
                ? `SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND ${dateFilter}`
                : "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid' AND date LIKE '%-02-2026'";
            
            db.get(revenueQuery, (e, r) => {
                revenueFiltered = r.total;
                const periodLabel = filter.type === 'this-month' ? 'This Month' : 
                                   filter.type === 'last-month' ? 'Last Month' :
                                   filter.type === 'year' ? `Year ${filter.year}` :
                                   filter.type === 'month' ? `${String(filter.month).padStart(2,'0')}-${filter.year}` :
                                   'Filtered';
                console.log(`Revenue (${periodLabel}): AED ${formatAmount(revenueFiltered)}`);
                
                // Outstanding Invoice (unpaid)
                db.get("SELECT COALESCE(SUM(amount + vat_amount), 0) as total FROM invoices WHERE status = 'unpaid'", (e2, r2) => {
                    const outstanding = r2.total;
                    console.log(`Outstanding Invoice: AED ${formatAmount(outstanding)}`);
                    
                    // VAT Collected (Last 3 months)
                    let vatQuery = "SELECT COALESCE(SUM(vat_amount), 0) as total FROM invoices WHERE status = 'paid'";
                    const months = [];
                    for (let i = 0; i < 3; i++) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        months.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`);
                    }
                    vatQuery += ` AND (${months.map(m => `date LIKE '%-${m}'`).join(' OR ')})`;
                    
                    db.get(vatQuery, (e3, r3) => {
                        const vatCollected = r3.total;
                        console.log(`VAT Collected (Last 3 Months): AED ${formatAmount(vatCollected)}`);
                        
                        // Conversion %
                        db.get("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid FROM invoices", (e4, r4) => {
                            const conversion = r4.total > 0 ? ((r4.paid / r4.total) * 100).toFixed(1) : 0;
                            console.log(`Conversion %: ${conversion}%`);
                            
                            // Average Deal Size
                            db.get("SELECT COALESCE(AVG(amount), 0) as avg FROM invoices WHERE status = 'paid'", (e5, r5) => {
                                const avgDeal = r5.avg;
                                console.log(`Average Deal Size: AED ${formatAmount(avgDeal)}`);
                                
                                // Total Customers (All Time)
                                db.get("SELECT COUNT(*) as total FROM clients", (e6, r6) => {
                                    const totalCustomers = r6.total;
                                    console.log(`Total Customers (All Time): ${totalCustomers}`);
                                    
                                    // Total Customers Last Month
                                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
                                    db.get("SELECT COUNT(*) as total FROM clients WHERE created_at LIKE ?", [`%${lastMonthStr}%`], (e7, r7) => {
                                        const customersLastMonth = r7.total;
                                        console.log(`Total Customers (Last Month): ${customersLastMonth}`);
                                        
                                        // Total Customers This Month
                                        const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                                        db.get("SELECT COUNT(*) as total FROM clients WHERE created_at LIKE ?", [`%${thisMonthStr}%`], (e8, r8) => {
                                            const customersThisMonth = r8.total;
                                            console.log(`Total Customers (This Month): ${customersThisMonth}`);
                                            
                                            // Row 2: Recent Activity
                                            console.log('\n📋 ROW 2: RECENT ACTIVITY (LAST 30 DAYS)');
                                            console.log('-'.repeat(50));
                                            
                                            const thirtyDaysAgo = new Date();
                                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                            const date30Days = thirtyDaysAgo.toISOString().split('T')[0];
                                            
                                            // Quotations Last 30 Days
                                            db.get("SELECT COUNT(*) as total FROM quotations WHERE created_at >= ?", [date30Days], (e9, r9) => {
                                                console.log(`Quotations (Last 30 Days): ${r9.total}`);
                                                
                                                // Invoices Last 30 Days
                                                db.get("SELECT COUNT(*) as total FROM invoices WHERE created_at >= ?", [date30Days], (e10, r10) => {
                                                    console.log(`Invoices (Last 30 Days): ${r10.total}`);
                                                    
                                                    // Paid Invoices Last 30 Days
                                                    db.get("SELECT COUNT(*) as total FROM invoices WHERE status = 'paid' AND created_at >= ?", [date30Days], (e11, r11) => {
                                                        console.log(`Paid Invoices (Last 30 Days): ${r11.total}`);
                                                        
                                                        // Pending Invoices (unpaid)
                                                        db.get("SELECT COUNT(*) as total FROM invoices WHERE status = 'unpaid'", (e12, r12) => {
                                                            console.log(`Pending Invoices: ${r12.total}`);
                                                            
                                                            // Last Paid Invoice
                                                            db.get("SELECT i.invoice_no, i.amount, i.vat_amount, i.date, c.name FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.status = 'paid' ORDER BY i.created_at DESC LIMIT 1", (e13, r13) => {
                                                                if (r13) {
                                                                    console.log(`Last Paid: AED ${formatAmount(r13.amount + r13.vat_amount)} (${r13.name})`);
                                                                } else {
                                                                    console.log('Last Paid: -');
                                                                }
                                                                
                                                                // Row 3: Revenue by Service
                                                                console.log('\n📊 ROW 3: REVENUE BY SERVICE TYPE');
                                                                console.log('-'.repeat(50));
                                                                
                                                                db.all("SELECT q.business_activity, SUM(i.amount) as total FROM invoices i JOIN quotations q ON i.quotation_id = q.id WHERE i.status = 'paid' GROUP BY q.business_activity ORDER BY total DESC", (e14, rows) => {
                                                                    if (rows && rows.length > 0) {
                                                                        rows.forEach(r => {
                                                                            console.log(`${r.business_activity}: AED ${formatAmount(r.total)}`);
                                                                        });
                                                                    } else {
                                                                        console.log('No data available');
                                                                    }
                                                                    
                                                                    // Row 5: Top Services & Top Clients
                                                                    console.log('\n🏆 ROW 5: TOP SERVICES & CLIENTS');
                                                                    console.log('-'.repeat(50));
                                                                    
                                                                    // Top Services (by count)
                                                                    db.all("SELECT business_activity, COUNT(*) as count FROM quotations GROUP BY business_activity ORDER BY count DESC LIMIT 5", (e15, rows2) => {
                                                                        console.log('Top Services:');
                                                                        if (rows2 && rows2.length > 0) {
                                                                            rows2.forEach((r, i) => {
                                                                                console.log(`  ${i + 1}. ${r.business_activity} (${r.count})`);
                                                                            });
                                                                        } else {
                                                                            console.log('  No data');
                                                                        }
                                                                        
                                                                        // Top Clients
                                                                        db.all("SELECT c.name, SUM(i.amount) as total FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.status = 'paid' GROUP BY c.name ORDER BY total DESC LIMIT 5", (e16, rows3) => {
                                                                            console.log('\nTop Clients:');
                                                                            if (rows3 && rows3.length > 0) {
                                                                                rows3.forEach((r, i) => {
                                                                                    console.log(`  ${i + 1}. ${r.name} (AED ${formatAmount(r.total)})`);
                                                                                });
                                                                            } else {
                                                                                console.log('  No data');
                                                                            }
                                                                            
                                                                            console.log('\n' + '='.repeat(50));
                                                                            db.close();
                                                                            resolve();
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// Run if called directly
const args = process.argv.slice(2);
getDashboard(args);
