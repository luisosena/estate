<div align="center">

<img src="public/ESTATE.png" alt="Estate logo" width="200" />

# Estate

**The modern property management platform for landlords and tenants.**

Manage properties, automate billing, track payments, and keep everyone in the loop —\
from a single dashboard.

[![Status](https://img.shields.io/badge/status-beta-blue?style=flat-square)](https://estate-6icx.onrender.com)
[![Tests](https://img.shields.io/badge/tests-512_passed-brightgreen?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-proprietary-lightgrey?style=flat-square)](#)

[Official Website](https://estate-6icx.onrender.com) ·
[Live Demo](https://estate-6icx.onrender.com) ·
[Report an Issue](https://github.com/luisosena/estate-practice/issues)

</div>

---

## Table of Contents

- [About](#about)
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Reporting Issues](#reporting-issues)

---

## About

Estate is a full-stack web platform that gives landlords complete control over their rental portfolio and gives tenants a transparent, self-serve view of their tenancy — all in one place.

Managing rental properties still means juggling spreadsheets, chasing payments over WhatsApp, and sending PDF receipts by hand. Estate replaces that with a single system of record where every unit, bill, and payment is tracked — and tenants always know what they owe and when.

### Built With

<table>
  <tr>
    <td align="center"><strong>Backend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 12" />
      <img src="https://img.shields.io/badge/PHP-8.5-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.5" />
      <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td>
      <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
      <img src="https://img.shields.io/badge/Inertia.js-v2-9F7AEA?style=flat-square" alt="Inertia.js v2" />
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Auth</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Fortify-v1-FF2D20?style=flat-square" alt="Fortify" />
      <img src="https://img.shields.io/badge/Sanctum-v1-FF2D20?style=flat-square" alt="Sanctum" />
      <img src="https://img.shields.io/badge/2FA-TOTP-000000?style=flat-square" alt="2FA TOTP" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Mobile</strong></td>
    <td>
      <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native" />
      <img src="https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Infra</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
      <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render" />
      <img src="https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white" alt="Sentry" />
      <img src="https://img.shields.io/badge/Laravel_Reverb-v1-FF2D20?style=flat-square" alt="Laravel Reverb" />
    </td>
  </tr>
</table>

### Infrastructure

<table>
  <tr>
    <td align="center"><strong>Containers</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Hosting</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Monitoring</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white" alt="Sentry" />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>WebSockets</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Laravel_Reverb-v1-FF2D20?style=flat-square" alt="Laravel Reverb" />
    </td>
  </tr>
</table>

---

## Overview

[**Live Demo**](https://estate-6icx.onrender.com)

### Landlord Dashboard

![Landlord dashboard showing revenue analytics, occupancy rate, and payment collection charts](screenshots/landlord-dashboard.png)

<details>
<summary><strong>📸 More Screenshots</strong></summary>

<br />

| View | Screenshot |
|------|------------|
| Tenant Dashboard | ![Tenant dashboard with rent balance and payment activity](screenshots/tenant-dashboard.png) |
| Property Management | ![Property and unit management interface](screenshots/property-management.png) |
| Payment Processing | ![Payment recording and receipt generation](screenshots/payment-processing.png) |
| Mobile App | ![React Native mobile app screens](screenshots/mobile-app.png) |

</details>

---

## Features

### For Landlords

| Feature | Description |
|---------|-------------|
| **Property & Unit Management** | Organise properties into units, track occupancy, and assign tenants — no spreadsheets |
| **Tenant Onboarding** | Add tenants manually or bulk-import from CSV with lease details attached from day one |
| **Automated Billing** | Rent bills generate monthly on schedule. Utility charges per unit. Never miss a billing cycle |
| **Payment Tracking** | Log payments, reconcile against bills, and see overdue balances at a glance |
| **Revenue Dashboard** | Revenue trends, payment collection breakdowns, occupancy rates — exportable as CSV or PDF |
| **Document Management** | Store and share leases, receipts, and documents directly through the platform |
| **Real-Time Notifications** | Instant alerts via in-app, email, WhatsApp, and push notifications when payments land or bills go overdue |

### For Tenants

| Feature | Description |
|---------|-------------|
| **Personal Dashboard** | Current rent balance, utility charges, and recent payment activity in one view |
| **Payment History** | Full record of every payment with downloadable PDF receipts |
| **Document Access** | View and download lease agreements and shared documents |
| **Notifications** | Get alerted when a new bill is issued or a payment is confirmed |

### Mobile App

A companion **React Native** app provides landlords and tenants the same core features on the go — Sanctum-authenticated, with push notifications via Expo.

---

## Getting Started

The fastest way to explore Estate is through the live demo.

### 1. Visit the Demo

Head to **[estate-6icx.onrender.com](https://estate-6icx.onrender.com)** and create an account as a **Landlord**.

### 2. Set Up Your Portfolio

Once logged in, you'll land on the **Landlord Dashboard**. From here:

1. **Add a property** — Go to *Properties → Create* and enter your property details
2. **Create units** — Inside a property, add individual rental units
3. **Onboard tenants** — Add tenants manually or use **Bulk Import** to upload a CSV of your existing tenant list

### 3. Start Managing

- **Bills** generate automatically each month, or create them manually
- **Record payments** as they come in and watch your dashboard update in real time
- **Export reports** as CSV or PDF for your records

---

## Reporting Issues

Found a bug or have a suggestion? Open an issue on GitHub:

**[→ Open an Issue](https://github.com/luisosena/estate-practice/issues)**

When reporting a bug, please include:
- Steps to reproduce the problem
- What you expected to happen
- What actually happened
- Your browser and OS (if relevant)

---

<div align="center">

**[⬆ Back to top](#estate)**

Made with ☕ and determination.

</div>
