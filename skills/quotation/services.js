// CSPzone Services Configuration
// Each service has: name, remarks, scope, documents, process, timeline, payment, exclusions
// Default acceptance clause for all services

const defaultAcceptanceClause = "Issuance of invoice and receipt of payment shall constitute full acceptance of the scope of services, pricing, terms, and conditions outlined in this quotation. Work will commence only upon receipt of payment.";

const services = {
    "mainland_company_formation": {
        name: "Mainland Company Formation",
        remarks: "All government fees are estimated and subject to revision by the relevant authorities. Actual charges will be applied as invoiced by DED and other government departments. Market fee (5% of annual office rent) is charged separately by DED where applicable. VAT is applicable only on professional and office-related services, as per UAE VAT regulations.",
        scope: "RAS Corporate Advisors L.L.C provides comprehensive assistance for setting up a Mainland company in the United Arab Emirates. Our services include advisory on legal structure selection, trade name reservation, initial approval from the Department of Economy and Tourism (DET), preparation of Memorandum of Association (MOA), coordination for office tenancy and Ejari registration (if required), submission of license application, and issuance of trade license. Post-license support includes visa processing guidance and bank account introduction.",
        documents: "Passport copy of shareholder(s); UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed trade names (minimum three options); Business activity details; Tenancy contract (if applicable); Contact details and residential address",
        process: "Step 1 – Structure & Activity Consultation: Determining suitable legal structure and business activity classification.; Step 2 – Trade Name & Initial Approval: Reservation of trade name and obtaining initial approval from authorities.; Step 3 – Documentation & License Processing: Preparation of MOA and submission of incorporation documents.; Step 4 – License Issuance: Issuance of Mainland trade license and related approvals.",
        timeline: "Mainland company formation typically takes 12 - 15 working days subject to government approvals and documentation completion.",
        payment: "Full payment (100%) is required in advance to initiate the company incorporation process.",
        exclusions: "External authority approvals (if required); Office rental charges beyond agreed package; Bank account approval guarantee; Visa medical and Emirates ID charges unless specified"
    },
    
    "nominee_director": {
        name: "Nominee Director Services",
        remarks: "A separate Nominee Agreement and Power of Attorney will be executed to define roles and responsibilities. The service is valid for one year and subject to annual renewal as per agreement terms.",
        scope: "RAS Corporate Advisors L.L.C provides nominee director services in compliance with applicable regulations. This includes appointment documentation, nominee agreement drafting, confidentiality arrangement, and regulatory filing support where required.",
        documents: "Passport copy of beneficial owner; Company incorporation documents; Board resolution (if applicable); KYC documentation",
        process: "Step 1 – Compliance Review: Verification of beneficial ownership and regulatory requirements.; Step 2 – Nominee Agreement: Preparation and execution of nominee director agreement.; Step 3 – Authority Notification: Submission of required filings to relevant authority if applicable.",
        timeline: "The nominee director appointment process typically takes 12–15 working days subject to compliance clearance and agreement drafting.",
        payment: "Full payment (100%) is required prior to appointment processing.",
        exclusions: "Liability arising from undisclosed activities; Regulatory penalties due to client non-compliance"
    },
    
    "vat_registration": {
        name: "VAT Registration / Corporate Tax Registration",
        remarks: "VAT registration is subject to FTA approval and submission of complete and accurate documents by the applicant. Any additional clarification, reconsideration request, or re-submission required by the FTA may be charged separately.",
        scope: "RAS Corporate Advisors L.L.C provides assistance with VAT and Corporate Tax registration with the Federal Tax Authority (FTA). Services include eligibility assessment, preparation of application forms, document submission, follow-up with the FTA, and TRN issuance coordination.",
        documents: "Trade license copy; Passport & Emirates ID of owner; MOA; Financial turnover details; Bank statement; Contact details",
        process: "Step 1 – Eligibility Assessment: Review of turnover and compliance requirements.; Step 2 – Application Submission: Preparation and submission of tax registration application.; Step 3 – TRN Issuance: Coordination with FTA for registration approval.",
        timeline: "VAT or Corporate Tax registration typically takes 7 working days subject to FTA review.",
        payment: "Full payment (100%) required prior to submission of application.",
        exclusions: "Ongoing tax filing services unless separately agreed; Existing penalties due to inaccurate financial information"
    },
    
    "bank_account": {
        name: "Business Bank Account Opening Support",
        remarks: "Bank account approval is subject to the bank's internal compliance and due diligence process. Final approval is at the sole discretion of the bank. The client must provide complete and accurate documents and attend interviews or verification calls if required by the bank.",
        scope: "RAS Corporate Advisors L.L.C provides assistance with corporate bank account opening through partner banks. Services include documentation preparation guidance, profile presentation assistance, and coordination with banking relationship managers.",
        documents: "Trade license; MOA; Passport & Emirates ID; Company profile; Business plan; Bank statements (if required)",
        process: "Step 1 – Bank Selection: Advisory on suitable banking partners.; Step 2 – Documentation Preparation: Review and preparation of required documents.; Step 3 – Bank Submission & Interview: Coordination with the bank and scheduling interviews if required.",
        timeline: "Bank account opening typically takes 2–6 weeks subject to bank compliance and internal review.",
        payment: "Full payment (100%) required before bank submission.",
        exclusions: "Guarantee of account approval; Minimum balance requirements; Ongoing bank compliance obligations"
    },
    
    "license_amendment": {
        name: "License Amendment Services",
        remarks: "Each individual change is counted as one amendment. Removing a trade name and adding a new trade name = 2 amendments. Adding 2 activities and removing 2 activities = 4 amendments. Adding 1 shareholder and removing 1 shareholder = 2 amendments. The same rule applies to trade name changes, business activity amendments, shareholder additions or removals, and manager changes.",
        scope: "RAS Corporate Advisors L.L.C provides assistance with amendments to existing trade licenses including activity change, shareholder change, manager update, address modification, and other regulatory amendments.",
        documents: "Existing trade license copy; Passport copies of new shareholder (if applicable); Board resolution; Amendment request form",
        process: "Step 1 – Amendment Assessment: Review of requested amendment.; Step 2 – Documentation Preparation: Preparation and submission to relevant authority.; Step 3 – License Update: Issuance of amended license.",
        timeline: "Amendments typically take 12 - 15 working days subject to authority approval.",
        payment: "Full payment (100%) required before submission.",
        exclusions: "Additional approvals not disclosed initially; Existing regulatory fines or penalties"
    },
    
    "company_liquidation": {
        name: "Mainland Company Liquidation",
        remarks: "Government fees are approximate and subject to revision by DED and other authorities. VAT is applicable only on RAS professional fees. Timelines depend on audit completion, newspaper publication, and clearance from all authorities. All visa cancellations must be completed prior to final license cancellation. Outstanding penalties, fines, or expired license charges must be cleared before liquidation approval. If the company is not under RAS Corporate Advisors' management, a No Objection Certificate (NOC) from the current registered agent/service provider is mandatory. All fees are subject to actual invoices issued by the respective authorities.",
        scope: "RAS Corporate Advisors L.L.C provides assistance with voluntary company liquidation including preparation of liquidation documents, appointment of approved liquidator (if required), authority notification, advertisement publication (if required), and cancellation of trade license.",
        documents: "Trade license copy; MOA; Passport copies of shareholders; Board resolution for liquidation; Clearance certificates",
        process: "Step 1 – Liquidation Resolution and Auditing: Preparation of shareholder resolution and audit report.; Step 2 – Authority Submission: Submission of liquidation request to authority.; Step 3 – Clearance & Cancellation: Obtaining required clearances and cancellation of license.",
        timeline: "The liquidation process typically takes 30–60 days subject to authority requirements and clearance issuance.",
        payment: "Full payment (100%) required prior to initiating the liquidation process.",
        exclusions: "Outstanding liabilities or fines; Third-party settlement obligations"
    },
    
    "employee_visa": {
        name: "Employee Visa",
        remarks: "Visa approval is subject to immigration and Ministry of Human Resources and Emiratisation (MOHRE) regulations. All government fees are subject to change as per UAE immigration authorities. Medical test, Emirates ID, and visa stamping charges are included only if specifically mentioned in the quotation. Any fines due to delayed submission of documents are the responsibility of the applicant.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for processing Employee Visa in the UAE. Our services include work permit application, entry permit issuance (if applicable), status change coordination, medical fitness test arrangement, Emirates ID application, visa stamping, and final visa issuance. We ensure proper documentation and follow up with the relevant authorities until visa completion.",
        documents: "Passport copy of employee; Passport size photograph with white background; UAE entry stamp or visit visa copy (if inside UAE); Emirates ID copy (if applicable); Educational certificate (if required for profession); Company documents and establishment card copy",
        process: "Step 1 – Work Permit Application: Submission of work permit application with MOHRE or relevant authority.; Step 2 – Entry Permit / Status Change: Issuance of entry permit or status change inside UAE.; Step 3 – Medical & Emirates ID: Completion of medical fitness test and Emirates ID biometrics.; Step 4 – Visa Stamping: Submission of passport for residence visa stamping and final approval.",
        timeline: "Employee visa processing typically takes 10 – 15 working days subject to government approvals and medical clearance.",
        payment: "Full payment (100%) is required in advance to initiate the visa processing.",
        exclusions: "Overstay fines or immigration penalties; Document attestation charges (if required); Profession change charges (if applicable); Any additional approvals not initially disclosed"
    },
    
    "family_visa": {
        name: "Family Visa",
        remarks: "Family visa approval is subject to UAE immigration regulations and sponsor eligibility criteria. Minimum salary requirement and suitable accommodation (Ejari) must be met as per immigration rules. Medical test, Emirates ID, and visa stamping charges are included only if specifically mentioned in the quotation. All government fees are subject to revision by the relevant authorities.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for obtaining Family Residence Visa in the UAE. Our services include entry permit application, status change coordination, medical fitness test arrangement, Emirates ID application, visa stamping, and follow up with immigration authorities until final visa issuance.",
        documents: "Passport copy of sponsor; Passport copy of family member(s); Passport size photographs with white background; UAE visa and Emirates ID copy of sponsor; Attested marriage certificate (for spouse visa); Attested birth certificate (for child visa); Ejari tenancy contract; Salary certificate or labour contract copy",
        process: "Step 1 – Entry Permit Application: Submission of family entry permit application with immigration authorities.; Step 2 – Status Change: Completion of status change process if family member is inside UAE.; Step 3 – Medical & Emirates ID: Medical fitness test (if required) and Emirates ID biometrics.; Step 4 – Visa Stamping: Submission of passport for residence visa stamping and final approval.",
        timeline: "Family visa processing typically takes 7 – 12 working days subject to immigration approvals and medical clearance.",
        payment: "Full payment (100%) is required in advance to initiate the family visa process.",
        exclusions: "Overstay fines or immigration penalties; Document attestation charges (if not already completed); Translation charges (if required); Any additional government requirements not disclosed at the time of application"
    },
    
    "ancfz": {
        name: "Ajman NuVentures Centre FreeZone (ANCFZ)",
        remarks: "ANC pricing is package based and not calculated per visa. Installment option is available on visa packages except the 0 visa package. A 10 percent discount may apply on full upfront payment as per ANC policy. Government and Free Zone fees are subject to revision by ANCFZ. VAT applies only on RAS professional service fees.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for company formation in Ajman NuVentures Centre FreeZone. Our services include advisory on package selection, trade name reservation, preparation and submission of incorporation documents, coordination with ANCFZ for license issuance, and post license support such as establishment card and visa processing guidance. Package includes: Business License; Up to 10 mix-and-match activities; Lease Agreement; MOA / AOA (if applicable); Commercial Registry (if applicable); Share Certificate; Certificate of Incorporation; Certificate of Incumbency; Bank Letter (for account opening); E-Channel Registration & Guarantee (as per package); Establishment Card; Entry Permit (if visa package); Visa Status Change (if applicable); Medical (Normal – Ajman); Residency Visa (if visa package); Emirates ID (if visa package)",
        documents: "Passport copy of shareholder(s); Passport size photograph; UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed company name options; Business activity details; Contact details and residential address",
        process: "Step 1 – Package Selection & Activity Finalization: Selection of suitable license package and confirmation of business activities.; Step 2 – Documentation Submission: Preparation and submission of incorporation documents to ANCFZ.; Step 3 – License Issuance: Approval and issuance of Free Zone trade license.; Step 4 – Post License Support: Assistance with establishment card and visa process if included in package.",
        timeline: "Company formation in ANCFZ typically takes 3 to 7 working days subject to authority approval and documentation completion.",
        payment: "Payment as per selected package terms. Installment option is available for eligible visa packages.",
        exclusions: "External authority approvals if required; Visa medical and Emirates ID charges unless specified; Bank account approval guarantee; Any additional services not mentioned in the quotation"
    },
    
    "spc": {
        name: "SPC Freezone Company Formation",
        remarks: "SPC license and establishment charges are annual. Visa quota is charged per visa with a maximum limit of 25 visas. Visa charges apply per applicant. Change status is applicable only if the applicant is inside the UAE at the time of application. All SPC government fees are VAT exempt. VAT applies only on RAS professional service fees. All fees are subject to revision by SPC and relevant authorities.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for company formation in Sharjah Publishing City Free Zone. Our services include advisory on activity selection, trade name reservation, preparation and submission of incorporation documents, coordination with SPC for license issuance, and post license support including establishment card and visa processing guidance.",
        documents: "Passport copy of shareholder(s); Passport size photograph; UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed company name options; Business activity details; Contact details and residential address",
        process: "Step 1 – Activity & Package Selection: Finalization of business activities and suitable license package.; Step 2 – Documentation Submission: Preparation and submission of incorporation documents to SPC.; Step 3 – License Issuance: Approval and issuance of Free Zone trade license.; Step 4 – Visa & Establishment Card: Processing of establishment card and visa applications if required.",
        timeline: "SPC company formation typically takes 3 to 7 working days subject to authority approval and documentation completion.",
        payment: "Full payment is required as per selected package to initiate the incorporation process.",
        exclusions: "External authority approvals if required; Visa medical and Emirates ID charges unless specified; Bank account approval guarantee; Any additional services not mentioned in the quotation"
    },
    
    "ifza": {
        name: "IFZA Company Formation",
        remarks: "IFZA government fees are fixed as per the official IFZA price card. Visa related charges apply per visa. VIP services are optional and charged only if requested. All IFZA and government charges are VAT exempt. VAT applies only on RAS professional service fees where applicable. All fees are subject to revision by IFZA and relevant authorities.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for company formation in IFZA Free Zone. Our services include advisory on activity and package selection, trade name reservation, preparation and submission of incorporation documents, coordination with IFZA for license issuance, and post license support including establishment card and visa processing guidance.",
        documents: "Passport copy of shareholder(s); Passport size photograph; UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed company name options; Business activity details; Contact details and residential address",
        process: "Step 1 – Activity & Package Finalization: Selection of suitable license package and confirmation of business activities.; Step 2 – Documentation Submission: Preparation and submission of incorporation documents to IFZA.; Step 3 – License Issuance: Approval and issuance of IFZA trade license.; Step 4 – Establishment Card & Visa: Processing of establishment card and visa applications if included in the package.",
        timeline: "IFZA company formation typically takes 5 to 12 working days subject to authority approval and documentation completion.",
        payment: "Full payment is required as per selected package to initiate the incorporation process.",
        exclusions: "External authority approvals if required; Visa medical and Emirates ID charges unless specified; Bank account approval guarantee; Any additional services not mentioned in the quotation"
    },
    
    "meydan": {
        name: "MEYDAN Freezone Company Formation",
        remarks: "Meydan government fees are fixed as per the official Meydan price card. Visa related charges apply per visa. VIP services are optional and charged only if requested. All Meydan and government charges are VAT exempt. VAT applies only on RAS professional service fees where applicable. All fees are subject to revision by Meydan and relevant authorities.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for company formation in Meydan Free Zone. Our services include advisory on activity and package selection, trade name reservation, preparation and submission of incorporation documents, coordination with Meydan for license issuance, and post license support including establishment card and visa processing guidance.",
        documents: "Passport copy of shareholder(s); Passport size photograph; UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed company name options; Business activity details; Contact details and residential address",
        process: "Step 1 – Activity & Package Finalization: Selection of suitable license package and confirmation of business activities.; Step 2 – Documentation Submission: Preparation and submission of incorporation documents to Meydan.; Step 3 – License Issuance: Approval and issuance of Meydan trade license.; Step 4 – Establishment Card & Visa: Processing of establishment card and visa applications if included in package.",
        timeline: "Meydan company formation typically takes 7 to 12 working days subject to authority approval and documentation completion.",
        payment: "Full payment is required as per selected package to initiate the incorporation process.",
        exclusions: "External authority approvals if required; Visa medical and Emirates ID charges unless specified; Bank account approval guarantee; Any additional services not mentioned in the quotation"
    },
    
    "uaq": {
        name: "UAQ Freezone Company Formation",
        remarks: "Umm Al Quwain (UAQ) Free Zone fees are subject to revision by the authority and relevant government departments. Visa eligibility and processing are subject to immigration approval and compliance requirements. All government and UAQ charges are VAT exempt. VAT applies only on RAS professional service fees where applicable.",
        scope: "RAS Corporate Advisors L.L.C provides complete assistance for company formation in UAQ Free Zone. Our services include advisory on package selection, activity confirmation, preparation and submission of incorporation documents, coordination with UAQ authority for license issuance, and post license support including establishment card and visa processing. What UAQ Packages Include: Business license up to 10 activities; Co working space with lease agreement; Visa, medical test, Emirates ID and status change; Establishment card and e channel; Bank account opening assistance; Free medical insurance; Same renewal fee every year",
        documents: "Passport copy of shareholder(s); Passport size photograph; UAE visa copy (if applicable); Emirates ID copy (if UAE resident); Proposed company name options; Business activity details; Contact details and residential address",
        process: "Step 1 – Package & Activity Finalization: Selection of suitable packages and confirmation of business activities.; Step 2 – Documentation Submission: Preparation and submission of incorporation documents to UAQ Free Zone.; Step 3 – License Issuance: Approval and issuance of UAQ trade license.; Step 4 – Visa & Establishment Card: Processing of establishment card and visa applications as per selected package.",
        timeline: "UAQ company formation typically takes 7 to 12 working days subject to authority approval and documentation completion.",
        payment: "Full payment is required as per selected package to initiate the incorporation process.",
        exclusions: "External authority approvals if required; Bank account approval guarantee; Any additional services not mentioned in the quotation"
    }
};

// Helper functions
function getService(serviceKey) {
    return services[serviceKey] || null;
}

function getAllServices() {
    return Object.keys(services).map(key => ({
        key: key,
        name: services[key].name
    }));
}

function formatAsHtml(service) {
    // Format remarks as bullet points - split by period
    let remarksHtml = '<ul>';
    service.remarks.split('.').forEach(remark => {
        const trimmed = remark.trim();
        if (trimmed && trimmed.length > 5) { // Skip empty or too short
            remarksHtml += `<li>${trimmed}.</li>`;
        }
    });
    remarksHtml += '</ul>';
    
    // Format scope
    let scopeHtml = `<p>${service.scope}</p>`;
    
    // Format documents
    let docsHtml = '<ul>';
    service.documents.split(';').forEach(doc => {
        docsHtml += `<li>${doc.trim()}</li>`;
    });
    docsHtml += '</ul>';
    
    // Format process
    let processHtml = '<ol>';
    service.process.split(';').forEach(step => {
        processHtml += `<li>${step.trim()}</li>`;
    });
    processHtml += '</ol>';
    
    // Format exclusions
    let exclusionsHtml = '<ul>';
    service.exclusions.split(';').forEach(ex => {
        exclusionsHtml += `<li>${ex.trim()}</li>`;
    });
    exclusionsHtml += '</ul>';
    
    return {
        remarks: remarksHtml,
        scope: scopeHtml,
        documents: docsHtml,
        process: processHtml,
        timeline: `<p>${service.timeline}</p>`,
        payment: `<p>${service.payment}</p>`,
        exclusions: exclusionsHtml,
        acceptance_clause: `<p>${defaultAcceptanceClause}</p>`
    };
}

// CLI for testing
const args = process.argv.slice(2);
if (args.length > 0) {
    if (args[0] === 'list') {
        console.log(JSON.stringify(getAllServices(), null, 2));
    } else if (args[0] === 'get' && args[1]) {
        const service = getService(args[1]);
        if (service) {
            console.log(JSON.stringify(formatAsHtml(service), null, 2));
        } else {
            console.log('Service not found. Use "list" to see available services.');
        }
    }
}

module.exports = { services, getService, getAllServices, formatAsHtml };
