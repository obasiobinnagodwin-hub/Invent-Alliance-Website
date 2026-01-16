# Customer Care Operations Guide
## Invent Alliance Limited Website - Customer Support

**Version:** 1.0  
**Last Updated:** January 15, 2026  
**Audience:** Customer Care Team, Support Staff  
**Classification:** INTERNAL USE ONLY

---

## Table of Contents

1. [Overview](#1-overview)
2. [Common Customer Issues](#2-common-customer-issues)
3. [Contact Form Support](#3-contact-form-support)
4. [Academy Registration Support](#4-academy-registration-support)
5. [Privacy & Data Requests](#5-privacy--data-requests)
6. [Escalation Procedures](#6-escalation-procedures)
7. [Response Templates](#7-response-templates)
8. [FAQ](#8-faq)

---

## 1. Overview

### Website Features

**Public Features:**
- Home page with company information
- Contact form (for inquiries)
- Academy registration form (for training programs)
- Services/products information
- Blog/news articles
- Team information

**Admin Features** (Staff only):
- Analytics dashboard
- User management
- Data export (CSV/PDF reports)

### Support Channels

| Channel | Response Time | Availability |
|---------|--------------|--------------|
| Email: info@inventallianceco.com | 24 hours | 24/7 |
| Phone: +234 (0) 906 276 4054 | Immediate | 9 AM - 5 PM WAT Mon-Fri |
| Contact Form | 24 hours | 24/7 |
| WhatsApp Business | 2 hours | 9 AM - 6 PM WAT Mon-Sat |

### SLA (Service Level Agreement)

| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| Critical (Site down) | 15 minutes | 1 hour |
| High (Cannot register/contact) | 2 hours | 4 hours |
| Medium (General inquiry) | 4 hours | 24 hours |
| Low (Information request) | 24 hours | 48 hours |

---

## 2. Common Customer Issues

### Issue 1: "I can't submit the contact form"

**Symptoms Customer Reports:**
- "The submit button doesn't work"
- "I get an error message"
- "Form won't send"

**Common Causes:**
1. Required fields not filled
2. Invalid email format
3. Rate limiting (too many attempts)
4. Browser issues
5. Network connectivity

**Troubleshooting Steps:**

**Step 1: Verify form requirements**
```
Ask customer to check:
☐ Name (minimum 2 characters)
☐ Valid email address (e.g., name@example.com)
☐ Subject (minimum 3 characters)
☐ Message (minimum 10 characters)
```

**Step 2: Check for error messages**
Ask customer: "Do you see any red text or error messages? What does it say?"

**Common error messages:**
| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Please provide a valid email address" | Invalid email format | Guide customer to enter email like: name@domain.com |
| "Too many requests. Please try again later" | Rate limit (5 submissions in 15 min) | Ask customer to wait 15 minutes and try again |
| "An error occurred. Please try again later" | Server issue | Create support ticket, use alternative contact method |

**Step 3: Try alternative browsers**
Ask customer to try:
1. Different browser (Chrome, Firefox, Safari, Edge)
2. Incognito/Private mode
3. Clear browser cache

**Step 4: Alternative contact method**
If issue persists, offer alternative:
- Email directly: info@inventallianceco.com
- Phone: +234 (0) 906 276 4054
- WhatsApp Business: [Number]

**Response Template:** See [Template #1](#template-1-contact-form-issues)

---

### Issue 2: "I didn't receive confirmation email"

**Symptoms:**
- Customer submitted form but no email received
- "Where is my confirmation email?"

**Troubleshooting Steps:**

**Step 1: Check submission time**
Ask: "When did you submit the form?" (Email should arrive within 2 minutes)

**Step 2: Check spam/junk folder**
Guide customer:
```
1. Open your email application
2. Look for "Spam" or "Junk" folder
3. Search for emails from: inventallianceco.com or noreply@inventallianceco.com
4. If found, mark as "Not Spam"
```

**Step 3: Verify email address**
Ask customer to confirm the email address they used.
Common typos:
- gmail.com vs gmial.com
- Missing @ symbol
- Extra spaces

**Step 4: Check our records**
1. Login to dashboard: https://inventallianceco.com/dashboard
2. Check if submission was received (contact IT if database access needed)
3. Verify email was sent (check SMTP logs)

**Step 5: Resend confirmation**
If submission is in system but email not received:
- Manually send confirmation email
- Update customer via phone/WhatsApp

**Response Template:** See [Template #2](#template-2-confirmation-email-missing)

---

### Issue 3: "Academy registration not working"

**Symptoms:**
- Cannot submit academy registration form
- Age validation errors
- Stream selection issues

**Troubleshooting Steps:**

**Step 1: Verify eligibility**
```
Academy Requirements:
☐ Professional Stream: Age 16+ years
☐ Investor Stream: Age 18+ years

Ask customer:
- "Which stream are you interested in?"
- "What age range did you select?"
```

**Step 2: Check form fields**
Required fields:
```
☐ Full Name (minimum 2 characters)
☐ Email Address (valid format)
☐ Phone Number (minimum 10 digits)
☐ Age Range (must select one)
☐ Stream (Professional or Investor)
```

**Step 3: Age validation errors**
| Error | Cause | Solution |
|-------|-------|----------|
| "You must be at least 16 years old" | Selected age < 16-25 range | Explain minimum age requirement |
| "You must be at least 18 years old for Investor stream" | Selected Investor + age 16-17 | Either wait until 18 or choose Professional stream |

**Step 4: Rate limiting**
Academy registration is rate-limited to 3 submissions per 15 minutes.
If customer sees "Too many registration attempts":
- Ask them to wait 15 minutes
- Verify they're not accidentally submitting multiple times

**Response Template:** See [Template #3](#template-3-academy-registration-issues)

---

### Issue 4: "How do I update/delete my information?"

**Symptoms:**
- Customer wants to update contact information
- Customer wants to delete their data (GDPR "right to be forgotten")
- Customer wants to see what data we have (GDPR "right of access")

**This is a GDPR Data Subject Request - Follow Privacy Procedures**

**Step 1: Verify identity**
Ask for verification information:
```
For security, we need to verify your identity:
☐ Full name as submitted
☐ Email address used
☐ Date of submission (approximate)
☐ Last 4 digits of phone number (if provided)
```

**Step 2: Determine request type**
Ask: "What would you like us to do with your information?"

| Request Type | Description | Process Time |
|-------------|-------------|--------------|
| Access | "I want to see what data you have about me" | Up to 30 days |
| Rectification | "I want to update my information" | Up to 10 days |
| Erasure | "I want to delete my information" | Up to 30 days |
| Portability | "I want my data in a file" | Up to 30 days |

**Step 3: Submit Data Subject Request**
1. Direct customer to: https://inventallianceco.com/data-subject-request
2. Help customer fill out the form
3. Explain processing timeline (up to 30 days by law)
4. Provide reference number

**Alternative:** Email privacy@inventallianceco.com

**Step 4: Follow up**
- Create ticket in system
- Notify privacy team
- Confirm receipt with customer
- Update customer on status

**Response Template:** See [Template #4](#template-4-data-privacy-requests)

---

### Issue 5: "I can't find information about [service/product]"

**Symptoms:**
- Customer looking for specific information
- Navigation issues
- Content not clear

**Solution:**

**Step 1: Identify what they need**
Common requests:
- Services information
- Pricing
- Contact details
- Location/directions
- Team information
- Training programs

**Step 2: Direct to correct page**
| Information | URL |
|-------------|-----|
| Services/Products | https://inventallianceco.com/products-services |
| About Us | https://inventallianceco.com/about-us |
| Our Team | https://inventallianceco.com/our-team |
| Contact | https://inventallianceco.com/contacts |
| Academy Registration | https://inventallianceco.com/invent-academy-registration |
| Careers | https://inventallianceco.com/careers |
| News/Blog | https://inventallianceco.com/blog |

**Step 3: Provide direct information**
If customer cannot access website:
- Provide information directly via email/phone
- Send relevant documents/brochures

**Response Template:** See [Template #5](#template-5-information-requests)

---

## 3. Contact Form Support

### How Contact Form Works

1. **Customer fills form:**
   - Name
   - Email
   - Subject
   - Message

2. **System processes:**
   - Validates input
   - Checks rate limiting (5 per 15 min)
   - Checks honeypot (spam protection)
   - Sends email to: contact@inventallianceco.com

3. **Customer receives:**
   - Success message on screen
   - Confirmation email (if SMTP configured)

4. **We receive:**
   - Email notification
   - Form data stored (optional, if database enabled)

### Monitoring Contact Form Submissions

**Check submissions:**
1. Login to dashboard: https://inventallianceco.com/dashboard
2. Look for contact form analytics (if implemented)
3. Check email inbox: contact@inventallianceco.com

**Red flags to watch for:**
- Multiple identical submissions (spam)
- Gibberish text (spam)
- Suspicious links in messages (phishing)
- Threats or abusive language (escalate to security)

---

## 4. Academy Registration Support

### Academy Program Information

**Two Streams:**

**1. Professional Stream (Age 16+)**
- Duration: [To be determined]
- Cost: [To be determined]
- Target: Aspiring bakery professionals
- Topics: Professional baking, confectionery, business skills

**2. Investor Stream (Age 18+)**
- Duration: [To be determined]
- Cost: [To be determined]
- Target: Business investors
- Topics: Bakery business management, investment, operations

### Registration Process

1. **Online registration:**
   - Fill form at: https://inventallianceco.com/invent-academy-registration
   - Provide: Name, Email, Phone, Age, Stream preference
   - Submit form

2. **We process:**
   - Receive registration notification
   - Review application
   - Contact applicant within 5 business days

3. **Next steps:**
   - Interview/Assessment (if applicable)
   - Payment information
   - Class schedule
   - Orientation details

### Common Registration Questions

**Q: "When does the next program start?"**
A: [Check current schedule and provide date]

**Q: "What are the fees?"**
A: [Provide current fee structure]

**Q: "Is there financial aid available?"**
A: [Provide information about payment plans/scholarships if available]

**Q: "Can I register if I'm under 16?"**
A: Unfortunately, the minimum age is 16 years for the Professional stream. However, we encourage you to apply once you meet the age requirement.

**Q: "I'm 17, can I join the Investor stream?"**
A: The Investor stream requires participants to be at least 18 years old. You can either:
- Wait until you turn 18 to apply for Investor stream
- Apply for Professional stream now (age 16+ eligible)

---

## 5. Privacy & Data Requests

### GDPR Rights

All customers have these rights under GDPR:

1. **Right of Access (Art. 15)**
   - Request copy of their personal data
   - Learn how data is processed

2. **Right to Rectification (Art. 16)**
   - Correct inaccurate data
   - Complete incomplete data

3. **Right to Erasure (Art. 17) - "Right to be Forgotten"**
   - Delete personal data
   - Exceptions: Legal requirements

4. **Right to Restriction (Art. 18)**
   - Limit how data is processed

5. **Right to Data Portability (Art. 20)**
   - Receive data in machine-readable format
   - Transfer to another organization

6. **Right to Object (Art. 21)**
   - Object to processing for marketing purposes

### How to Handle Privacy Requests

**Step 1: Verify Identity**
Never process privacy requests without verifying identity.

Required verification:
- Full name
- Email address used
- Additional verification (phone number, submission date, etc.)

**Step 2: Record the Request**
Create ticket with:
- Customer name and contact
- Request type
- Date received
- Verification info
- Reference number

**Step 3: Process the Request**

**For Access Requests:**
1. Search database for customer data
2. Compile information into readable format
3. Send to customer via secure email
4. Maximum 30 days

**For Deletion Requests:**
1. Identify all data locations
2. Check for legal retention requirements
3. Delete data from:
   - Contact form submissions
   - Academy registrations
   - Analytics data (anonymize/delete)
   - Email records
4. Confirm deletion to customer
5. Maximum 30 days

**For Rectification Requests:**
1. Identify incorrect data
2. Update with correct information
3. Confirm update to customer
4. Maximum 10 days

**Step 4: Confirm with Customer**
Always send confirmation email with:
- What was done
- When it was done
- Reference number
- Contact for questions

**Response Template:** See [Template #4](#template-4-data-privacy-requests)

---

## 6. Escalation Procedures

### When to Escalate

**Escalate to IT Team when:**
- Website is down or not loading
- Forms completely broken (not just user error)
- Multiple customers reporting same issue
- Security concerns (data breach, hacking attempts)
- Technical error messages customer sees

**Escalate to Management when:**
- Customer extremely dissatisfied
- Complaint about company/staff
- Legal threats
- Media inquiry
- VIP customer

**Escalate to Privacy Team when:**
- Data breach reported
- Complex GDPR requests
- Customer disputes data handling
- Request from law enforcement

### Escalation Contacts

| Issue Type | Contact | Email | Phone |
|------------|---------|-------|-------|
| Technical Issues | IT Support | it@inventallianceco.com | [Number] |
| Privacy/GDPR | Privacy Officer | privacy@inventallianceco.com | [Number] |
| Customer Complaints | Customer Success Manager | cs@inventallianceco.com | [Number] |
| Security Issues | Security Team | security@inventallianceco.com | [Number] |
| Urgent/After Hours | On-Call Manager | emergency@inventallianceco.com | [Number] |

### Escalation Email Template

```
Subject: ESCALATION: [Brief Description]

Priority: [High/Medium/Low]

Customer Information:
- Name: [Name]
- Email: [Email]
- Phone: [Phone]
- Reference/Ticket #: [Number]

Issue Description:
[Detailed description of the issue]

Customer Impact:
[How is this affecting the customer?]

Steps Taken:
1. [Action 1]
2. [Action 2]

Reason for Escalation:
[Why are you escalating this?]

Urgency:
[Why does this need immediate attention?]

Reported by: [Your Name]
Date/Time: [Date/Time]
```

---

## 7. Response Templates

### Template #1: Contact Form Issues

**Subject:** RE: Issue with Contact Form - [Customer Name]

```
Dear [Customer Name],

Thank you for contacting Invent Alliance Limited. I'm sorry to hear you're experiencing issues with our contact form.

To help resolve this quickly, please verify:

1. All required fields are filled:
   - Name (minimum 2 characters)
   - Email address (valid format: name@example.com)
   - Subject (minimum 3 characters)
   - Message (minimum 10 characters)

2. Check for any error messages displayed in red text and let me know what they say.

3. Try using a different browser (Chrome, Firefox, Safari) or clear your browser cache.

If the issue persists after trying these steps, please:
- Call us at: +234 (0) 906 276 4054
- Email directly: info@inventallianceco.com
- WhatsApp: [Number]

We're here to help and will ensure your inquiry is addressed.

Best regards,
[Your Name]
Customer Care Team
Invent Alliance Limited
```

---

### Template #2: Confirmation Email Missing

**Subject:** RE: Confirmation Email - [Customer Name]

```
Dear [Customer Name],

Thank you for submitting your [contact form/registration] to Invent Alliance Limited.

I've checked our records and can confirm we received your submission on [Date/Time].

If you haven't received a confirmation email, please:

1. Check your Spam/Junk folder for emails from:
   - inventallianceco.com
   - noreply@inventallianceco.com

2. Add our email to your safe senders list

3. Verify the email address you provided: [Email Address]

Your submission details:
- Reference: #[Reference Number]
- Received: [Date/Time]
- Status: [Processed/Under Review]

We will respond to your inquiry within [24/48] hours.

If you have any questions, please don't hesitate to contact us.

Best regards,
[Your Name]
Customer Care Team
Invent Alliance Limited
Phone: +234 (0) 906 276 4054
Email: info@inventallianceco.com
```

---

### Template #3: Academy Registration Issues

**Subject:** RE: Academy Registration - [Customer Name]

```
Dear [Customer Name],

Thank you for your interest in Invent Academy!

I'm here to help you complete your registration. Let's make sure everything is in order:

**Eligibility Requirements:**
- Professional Stream: Age 16+ years
- Investor Stream: Age 18+ years

**Required Information:**
☐ Full Name
☐ Valid Email Address
☐ Phone Number (10+ digits)
☐ Age Range
☐ Stream Selection

**Common Issues:**
1. Age validation: Please ensure you've selected the correct age range and stream:
   - If under 18, select Professional stream only
   - If 18+, you can choose either stream

2. Form fields: All required fields must be completed

3. Rate limiting: You can submit 3 registration attempts within 15 minutes

If you're still experiencing issues, please:
- Call us: +234 (0) 906 276 4054
- Email: academy@inventallianceco.com
- Provide your full name and phone number

We'll help you complete your registration right away.

Looking forward to welcoming you to Invent Academy!

Best regards,
[Your Name]
Academy Admissions Team
Invent Alliance Limited
```

---

### Template #4: Data Privacy Requests

**Subject:** RE: Privacy Request - Reference #[Number]

```
Dear [Customer Name],

Thank you for contacting us regarding your personal data.

I've received your request to [access/update/delete] your personal information. This is being processed under GDPR [Article 15/16/17].

**Your Request:**
- Type: [Access/Rectification/Erasure]
- Received: [Date]
- Reference: #[Number]

**Next Steps:**
1. We will process your request within the legal timeframe (up to 30 days)
2. You will receive an update within [7] days
3. Once processed, we will send you confirmation

**Verification:**
For security purposes, we need to verify your identity. Please confirm:
- Full name as submitted
- Email address used
- [Additional verification detail]

**Questions?**
If you have any questions about your request, please contact:
- Email: privacy@inventallianceco.com
- Phone: +234 (0) 906 276 4054
- Reference: #[Number]

We take your privacy seriously and are committed to protecting your personal data.

Best regards,
[Your Name]
Privacy Team
Invent Alliance Limited
```

---

### Template #5: Information Requests

**Subject:** RE: Information Request - [Topic]

```
Dear [Customer Name],

Thank you for your interest in [Service/Product/Information].

[Provide the specific information requested]

**Helpful Links:**
- Services & Products: https://inventallianceco.com/products-services
- About Us: https://inventallianceco.com/about-us
- Contact Us: https://inventallianceco.com/contacts
- [Other relevant links]

**Additional Information:**
[Add any relevant brochures, documents, pricing, etc.]

If you have any other questions, please don't hesitate to contact us:
- Phone: +234 (0) 906 276 4054
- Email: info@inventallianceco.com
- WhatsApp: [Number]

We're here to help!

Best regards,
[Your Name]
Customer Care Team
Invent Alliance Limited
```

---

## 8. FAQ

### For Customer Care Team

**Q: How do I access the admin dashboard?**
A: Login at https://inventallianceco.com/login with your assigned credentials. Contact IT if you need access.

**Q: Where can I see customer submissions?**
A: Dashboard > Analytics tab. Contact IT if you need database access to view detailed submissions.

**Q: How do I export customer data?**
A: Dashboard > Select date range > Click "CSV" or "PDF" button to export reports.

**Q: What if a customer wants to unsubscribe from emails?**
A: Currently, we only send transactional emails (form confirmations, not marketing). If customer wants to stop receiving these, process as a GDPR erasure request.

**Q: Can I change a customer's submitted information?**
A: Only process data changes through official channels (rectification request). Document all changes for audit trail.

**Q: How long do we keep customer data?**
A:
- Contact form submissions: 2 years
- Academy registrations: 5 years (legal requirement)
- Analytics data: 30 days
- Unless customer requests deletion (GDPR)

**Q: What if website is completely down?**
A: Immediately escalate to IT team. Use alternative contact methods (phone, WhatsApp) while site is down.

**Q: Can I give out database credentials to customers?**
A: **NEVER**. Never share admin credentials, API keys, or any system access with customers.

### For Customers (Common Questions)

**Q: Is my data secure?**
A: Yes, we use SSL encryption, GDPR-compliant data handling, and secure servers.

**Q: Who can see my information?**
A: Only authorized staff members who need access to process your inquiry/registration.

**Q: Do you share my data with third parties?**
A: We only share data with:
- SMTP email service (for sending confirmation emails)
- Legal authorities (if required by law)
We never sell or share data for marketing purposes.

**Q: How can I contact you?**
A:
- Phone: +234 (0) 906 276 4054 (9 AM - 5 PM WAT Mon-Fri)
- Email: info@inventallianceco.com
- Contact form: https://inventallianceco.com/contacts
- WhatsApp Business: [Number]

**Q: What are your office hours?**
A: Monday - Friday, 9:00 AM - 5:00 PM WAT (West Africa Time)

---

## Appendix: Quick Reference Card

**PRINT THIS PAGE AND KEEP AT YOUR DESK**

### Emergency Contacts
- IT Support: it@inventallianceco.com | [Phone]
- Security: security@inventallianceco.com | [Phone]
- Management: [Phone]

### Common URLs
- Dashboard: https://inventallianceco.com/dashboard
- Contact Form: https://inventallianceco.com/contacts
- Academy Registration: https://inventallianceco.com/invent-academy-registration
- Privacy Request: https://inventallianceco.com/data-subject-request

### Response Times
- Critical: 15 minutes
- High: 2 hours
- Medium: 4 hours
- Low: 24 hours

### Escalation Rules
✅ Technical issues → IT Team
✅ Privacy/GDPR → Privacy Team
✅ Complaints → Management
✅ Security → Security Team

### Do's and Don'ts
✅ DO verify identity for privacy requests
✅ DO document everything
✅ DO follow templates
✅ DO escalate when unsure

❌ DON'T share credentials
❌ DON'T delete data without approval
❌ DON'T promise specific timelines without checking
❌ DON'T ignore security warnings

---

**END OF CUSTOMER CARE OPERATIONS GUIDE**

For technical operations, see `OPERATIONS_IT_RUNBOOK.md`

