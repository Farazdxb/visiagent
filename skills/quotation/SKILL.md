---
name: quotation
description: Generate professional PDF quotations using Puppeteer and Chrome headless browser. Replaces 21 dynamic fields in HTML template and exports to PDF.
metadata:
  openclaw:
    emoji: 📝
    requires:
      bins: ["chromium-browser", "node", "npm"]
      npm: ["puppeteer"]
---

# Quotation Generator

Generate PDF quotations from HTML template using Puppeteer (Chromium headless).

## Template Location

Template: `/root/.openclaw/workspace/quotation_template.html`

## 21 Dynamic Fields

Replace these placeholders in the HTML template:

### Header
- `{{LOGO_IMAGE}}` - Base64 encoded image string (data:image/png;base64,...)
- `{{QUOTATION_NO}}` - Quotation number (e.g., "Q-2026-0001")

### Client Information
- `{{CLIENT_NAME}}` - Client company/name
- `{{CLIENT_PHONE}}` - Phone number
- `{{CLIENT_EMAIL}}` - Email address
- `{{QUOTATION_DATE}}` - Quotation date (e.g., "15-02-2026")
- `{{VALID_TILL_DATE}}` - Validity date (e.g., "15-03-2026")
- `{{JURISDICTION}}` - Jurisdiction (e.g., "Dubai, UAE")
- `{{BUSINESS_ACTIVITY}}` - Business activity type

### Pricing Table
- `{{ITEMS_TABLE}}` - HTML table rows (e.g., `<tr><td>Service Name</td><td>1</td><td>1000</td><td>5%</td><td>1050</td></tr>`)

### Totals
- `{{SUB_TOTAL}}` - Subtotal amount (e.g., "1,000.00")
- `{{VAT_TOTAL}}` - VAT amount (e.g., "50.00")
- `{{GRAND_TOTAL}}` - Grand total (e.g., "1,050.00")

### Content Sections (HTML content)
- `{{REMARKS}}` - Remarks/notes (can be empty)
- `{{SCOPE_OF_SERVICES}}` - Scope of services (HTML ul/li or p)
- `{{REQUIRED_DOCUMENTS}}` - Required documents list (HTML)
- `{{SERVICE_PROCESS}}` - Service process steps (HTML)
- `{{ESTIMATED_TIMELINE}}` - Timeline (HTML)
- `{{PAYMENT_TERMS}}` - Payment terms (HTML)
- `{{EXCLUSIONS}}` - Exclusions list (HTML)
- `{{ACCEPTANCE_CLAUSE}}` - Acceptance clause (HTML)

## How to Use

### Step 1: Prepare Data
Collect all 21 fields from user. If any field is missing, ask the user.

### Step 2: Generate HTML
Replace all placeholders in the template with actual values. For empty optional fields, use empty string.

### Step 3: Generate PDF
Use the Python script or Node.js script to convert HTML to PDF using Puppeteer.

### Step 4: Return PDF
Return the PDF file path to the user.

## Example Usage

User provides:
```
Client: ABC Company
Phone: +971 50 123 4567
Email: info@abc.com
Date: 15-02-2026
Valid Till: 15-03-2026
Jurisdiction: Dubai, UAE
Activity: Business Setup

Items:
- Trade License Setup - 5000 AED
- Visa Processing - 1500 AED

Scope: <ul><li>Trade license application</li><li>Initial approval</li></ul>
```

Calculate:
- Sub Total: 6500
- VAT (5%): 325
- Grand Total: 6825

Generate PDF and return path.

## Output

PDF file saved to: `/root/.openclaw/workspace/quotations/<filename>.pdf`

Return the file path to the user.
