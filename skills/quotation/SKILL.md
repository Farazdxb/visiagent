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

**Items:**
- Trade License Setup - 5000 AED (no VAT)
- Visa Processing - 1500 AED + 5% VAT = 1575 AED

Note: Do NOT auto-calculate VAT on items. Only add VAT amounts as explicitly specified by the user. The user provides the final amounts (including or excluding VAT as they wish).

Generate PDF and return path.

## Running the Generator

### Command
```bash
NODE_PATH=/usr/lib/node_modules node /root/.openclaw/workspace/skills/quotation/generate-quotation.js '<json-data>'
```

### Input JSON Format
```json
{
  "LOGO_IMAGE": "data:image/png;base64,...",
  "QUOTATION_NO": "Q-2026-0001",
  "CLIENT_NAME": "ABC Company LLC",
  "CLIENT_PHONE": "+971 50 123 4567",
  "CLIENT_EMAIL": "info@abc.com",
  "QUOTATION_DATE": "15-02-2026",
  "VALID_TILL_DATE": "15-03-2026",
  "JURISDICTION": "Dubai, UAE",
  "BUSINESS_ACTIVITY": "Business Setup Services",
  "ITEMS_TABLE": "<tr><td>Service (no VAT)</td><td>1</td><td>1000</td><td>-</td><td>1000</td></tr><tr><td>Service (with VAT)</td><td>1</td><td>1000</td><td>5%</td><td>1050</td></tr>",
  "SUB_TOTAL": "2,050.00",
  "VAT_TOTAL": "50.00",
  "GRAND_TOTAL": "2,100.00",
  "REMARKS": "",
  "SCOPE_OF_SERVICES": "<ul><li>Item 1</li></ul>",
  "REQUIRED_DOCUMENTS": "<ul><li>Doc 1</li></ul>",
  "SERVICE_PROCESS": "<ol><li>Step 1</li></ol>",
  "ESTIMATED_TIMELINE": "<p>7 days</p>",
  "PAYMENT_TERMS": "<p>100% advance</p>",
  "EXCLUSIONS": "<ul><li>Item</li></ul>",
  "ACCEPTANCE_CLAUSE": "<p>Clause text</p>"
}
```

## Output

PDF file saved to: `/root/.openclaw/workspace/quotations/quotation_<NO>_<timestamp>.pdf`

Return the file path to the user.
