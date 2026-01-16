# Third-Party Data Processing Agreements (DPA) Checklist

**Last Updated:** January 16, 2025  
**Purpose:** This document provides checklists for evaluating and maintaining Data Processing Agreements (DPAs) with third-party service providers in compliance with GDPR Article 28.

---

## Overview

Under GDPR Article 28, when we engage third-party processors to handle personal data on our behalf, we must have a written Data Processing Agreement (DPA) in place. This document provides checklists for evaluating DPAs with our key service providers.

---

## General DPA Requirements (GDPR Art. 28)

All DPAs must include:

- [ ] **Processor identity and contact details**
- [ ] **Subject matter and duration of processing**
- [ ] **Nature and purpose of processing**
- [ ] **Types of personal data processed**
- [ ] **Categories of data subjects**
- [ ] **Obligations and rights of the controller**
- [ ] **Processor obligations:**
  - [ ] Process data only on documented instructions
  - [ ] Ensure persons authorized to process data are bound by confidentiality
  - [ ] Implement appropriate technical and organizational measures
  - [ ] Assist controller in responding to data subject requests
  - [ ] Assist controller in ensuring compliance with GDPR
  - [ ] Return or delete data at end of processing
  - [ ] Make available all information necessary to demonstrate compliance
  - [ ] Allow audits and inspections
- [ ] **Sub-processor authorization and requirements**
- [ ] **Data breach notification procedures**
- [ ] **International transfer safeguards** (if applicable)

---

## SMTP Email Service Provider

**Provider:** [To be filled]  
**Service:** Email delivery for contact forms and academy registrations  
**Data Processed:** Name, email address, message content  
**Legal Basis:** Legitimate interest (contact forms), Contract performance (academy registration)

### DPA Checklist

- [ ] **DPA signed and on file**
- [ ] **DPA includes all GDPR Art. 28 requirements** (see General Requirements above)
- [ ] **Data location and transfers:**
  - [ ] Data storage location(s) documented
  - [ ] International transfers identified
  - [ ] Appropriate safeguards in place (SCCs, adequacy decision, etc.)
- [ ] **Security measures:**
  - [ ] Encryption in transit (TLS/SSL)
  - [ ] Encryption at rest (if applicable)
  - [ ] Access controls and authentication
  - [ ] Regular security audits
- [ ] **Data breach notification:**
  - [ ] Provider commits to notify within 72 hours
  - [ ] Notification procedures documented
- [ ] **Data retention:**
  - [ ] Provider retention policies documented
  - [ ] Data deletion procedures specified
- [ ] **Sub-processors:**
  - [ ] List of sub-processors available
  - [ ] Notification process for new sub-processors
  - [ ] Right to object to sub-processors
- [ ] **Data subject rights:**
  - [ ] Provider assists with access requests
  - [ ] Provider assists with deletion requests
- [ ] **Audit rights:**
  - [ ] Right to audit provider's compliance
  - [ ] Audit procedures documented
- [ ] **Certifications:**
  - [ ] ISO 27001 (if applicable)
  - [ ] SOC 2 (if applicable)
  - [ ] Other relevant certifications

### Review Schedule

- [ ] **Initial review completed:** [Date]
- [ ] **Annual review scheduled:** [Date]
- [ ] **Next review due:** [Date]

### Notes

[Add any specific notes about the provider, contract terms, or compliance status]

---

## Hosting Provider

**Provider:** [To be filled]  
**Service:** Website hosting and infrastructure  
**Data Processed:** IP addresses (pseudonymized), session data, analytics data, user authentication data  
**Legal Basis:** Legitimate interest (security, website operation)

### DPA Checklist

- [ ] **DPA signed and on file**
- [ ] **DPA includes all GDPR Art. 28 requirements** (see General Requirements above)
- [ ] **Data location and transfers:**
  - [ ] Data center locations documented
  - [ ] International transfers identified
  - [ ] Appropriate safeguards in place (SCCs, adequacy decision, etc.)
- [ ] **Security measures:**
  - [ ] Physical security controls
  - [ ] Network security (firewalls, DDoS protection)
  - [ ] Encryption in transit (HTTPS/TLS)
  - [ ] Encryption at rest (database encryption)
  - [ ] Access controls and authentication
  - [ ] Regular security audits and penetration testing
  - [ ] Backup and disaster recovery procedures
- [ ] **Data breach notification:**
  - [ ] Provider commits to notify within 72 hours
  - [ ] Notification procedures documented
- [ ] **Data retention:**
  - [ ] Provider retention policies documented
  - [ ] Data deletion procedures specified
  - [ ] Backup retention policies documented
- [ ] **Sub-processors:**
  - [ ] List of sub-processors available
  - [ ] Notification process for new sub-processors
  - [ ] Right to object to sub-processors
- [ ] **Data subject rights:**
  - [ ] Provider assists with access requests
  - [ ] Provider assists with deletion requests
  - [ ] Data export capabilities
- [ ] **Audit rights:**
  - [ ] Right to audit provider's compliance
  - [ ] Audit procedures documented
  - [ ] Log access and monitoring capabilities
- [ ] **Certifications:**
  - [ ] ISO 27001
  - [ ] SOC 2 Type II
  - [ ] PCI DSS (if applicable)
  - [ ] Other relevant certifications

### Review Schedule

- [ ] **Initial review completed:** [Date]
- [ ] **Annual review scheduled:** [Date]
- [ ] **Next review due:** [Date]

### Notes

[Add any specific notes about the provider, contract terms, or compliance status]

---

## Google Maps Embed

**Provider:** Google LLC  
**Service:** Embedded map functionality on website  
**Data Processed:** IP address, location data (if user allows), usage data  
**Legal Basis:** Legitimate interest (website functionality)

### DPA Checklist

- [ ] **Google Cloud DPA reviewed and accepted**
  - [ ] Google Cloud Data Processing Amendment (DPA) available
  - [ ] Standard Contractual Clauses (SCCs) included
- [ ] **Data location and transfers:**
  - [ ] Google data center locations documented
  - [ ] International transfers identified
  - [ ] SCCs provide appropriate safeguards
- [ ] **Privacy settings:**
  - [ ] Google Maps API key configured with restrictions
  - [ ] API key restricted to specific domains
  - [ ] Usage limits configured
- [ ] **User consent:**
  - [ ] Cookie consent banner includes Google Maps information
  - [ ] Users informed about Google data collection
  - [ ] Link to Google Privacy Policy provided
- [ ] **Data processing:**
  - [ ] Google processes data according to their Privacy Policy
  - [ ] Data used for map functionality only
  - [ ] No additional tracking enabled (if possible)
- [ ] **Data subject rights:**
  - [ ] Users can manage Google data via Google Account settings
  - [ ] Link to Google's data management tools provided
- [ ] **Alternatives considered:**
  - [ ] Alternative mapping services evaluated
  - [ ] Self-hosted mapping solution considered (if applicable)

### Review Schedule

- [ ] **Initial review completed:** [Date]
- [ ] **Annual review scheduled:** [Date]
- [ ] **Next review due:** [Date]

### Notes

**Important:** Google Maps embeds are subject to Google's Privacy Policy. Users should be informed that Google may collect data when using embedded maps. Consider:
- Using Google Maps API with privacy-friendly settings
- Providing clear information about Google's data collection
- Offering alternative contact methods (e.g., address text) for privacy-conscious users

---

## Other Third-Party Services

### [Service Name]

**Provider:** [Provider Name]  
**Service:** [Service Description]  
**Data Processed:** [List of data types]  
**Legal Basis:** [Legal basis]

### DPA Checklist

[Use the General DPA Requirements checklist above]

### Review Schedule

- [ ] **Initial review completed:** [Date]
- [ ] **Annual review scheduled:** [Date]
- [ ] **Next review due:** [Date]

### Notes

[Add notes]

---

## Maintenance and Review

### Regular Reviews

- **Annual Review:** All DPAs should be reviewed annually
- **Trigger Events:** Review DPAs when:
  - Provider changes terms of service
  - New sub-processors are added
  - Data processing activities change
  - Security incidents occur
  - Regulatory requirements change

### Documentation

- [ ] All DPAs stored in secure location: [Location]
- [ ] DPA expiration dates tracked: [Tracking method]
- [ ] Review schedule maintained: [Tracking method]

### Contacts

- **Legal/Compliance Contact:** [Name/Email]
- **IT/Security Contact:** [Name/Email]
- **Data Protection Officer (if applicable):** [Name/Email]

---

## References

- GDPR Article 28: Processing under the authority of the controller or processor
- GDPR Article 44-49: Transfers of personal data to third countries
- Standard Contractual Clauses (SCCs): [Link to current SCCs]
- ICO Guidance on Controllers and Processors: [Link]

---

**Document Owner:** [Name/Department]  
**Last Reviewed:** [Date]  
**Next Review Due:** [Date]

