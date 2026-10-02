# Hospital Management System (HMS)

An enterprise-grade, full-stack Hospital Management System developed in accordance with the official **Hospital Management System Software Specification Document**.

---

## 🏥 Project Overview

The **Hospital Management System (HMS)** centralizes and automates hospital operations across clinical, administrative, and financial functions. It provides a secure, role-based platform for managing patient records, appointments, doctor schedules, electronic medical records (EMR), laboratory workflows, pharmacy dispensing, inpatient/outpatient admissions, and consolidated billing.

---

## 👥 User Roles (RBAC)

The system enforces strict **Role-Based Access Control** across 7 primary roles:
1. **Administrator**: System administration, user access, employee HR, departments, audit logging, and institutional reporting.
2. **Doctor**: Consultation appointments, clinical diagnosis, EMR management, prescriptions, and lab test orders.
3. **Nurse**: Inpatient care, bed management, vitals tracking, and clinical observation.
4. **Receptionist**: Patient onboarding/registration, appointment scheduling, calendar view, and check-in.
5. **Laboratory Staff**: Requisition tracking, specimen collection, test execution, and lab result entry.
6. **Pharmacist**: Medicine catalog, batch inventory, expiry alerts, and prescription fulfillment.
7. **Accountant**: Unified billing ledger, invoice generation, payment processing, and printable receipts.

---

## 🏗️ System Architecture

A robust 4-tier layered architecture designed for security, scalability, and maintainability:

```text
Presentation Layer (React 18 SPA + Tailwind CSS + Lucide Icons)
       ↓  (HTTPS / RESTful JSON APIs)
Application Layer (Node.js + Express.js API Gateway)
       ↓  (Services, Authentication, RBAC Guards, Audit Middleware)
Business Logic Layer (Transaction Handlers, Validation, Workflows)
       ↓  (Parameterized SQL Queries via Connection Pool)
Database Layer (MySQL 8.0 InnoDB Engine + Automated Backups)
```

---

## 📂 Project Structure

```text
SLT/
├── backend/                   # Node.js + Express REST API
│   ├── database/              # DDL schema, seed scripts, backup jobs
│   └── src/                   # Controllers, models, routes, services, middleware
├── frontend/                  # React 18 + Vite + Tailwind CSS Single Page Application
├── docs/                      # Architectural specs, ER diagrams, API documentation
├── .gitignore                 # Root Git Ignore rules
└── README.md                  # Project master documentation
```

---

## 🌿 Git Workflow & Branch Strategy

This project adheres to a professional Git workflow:
- **`main`**: Production-ready, stable releases only.
- **`develop`**: Central integration branch for ongoing development.
- **`feature/<feature-name>`**: Dedicated branches for specific modules (e.g., `feature/database-schema`, `feature/authentication`, `feature/patient-management`).

### Conventional Commit Standard
- `feat: <description>` for new functional features
- `fix: <description>` for bug fixes
- `docs: <description>` for documentation changes
- `chore: <description>` for tooling and build setup
- `refactor: <description>` for code refactoring

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher (v22.x LTS recommended)
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0 or higher (InnoDB storage engine)
- **Git**: 2.30+

---

## 📄 License
Proprietary healthcare software — developed for authorized hospital operations.
