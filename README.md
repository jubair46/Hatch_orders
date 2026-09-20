# Hatch — Bengaluru cafe website + ordering system

One command, no dependencies to install.

## Run it

    node server.js

Then open:
- http://localhost:3001         — the customer-facing site
- http://localhost:3001/admin   — the staff order dashboard (login: hatch / changeme)

## Set your own admin password

Mac/Linux:

    ADMIN_USER=hatch ADMIN_PASS=yourpassword node server.js

Windows (PowerShell):

    $env:ADMIN_PASS="yourpassword"; node server.js

## What's here

- `server.js`   — the whole backend (Node's built-in http module only, zero npm packages)
- `site.html`   — the customer-facing website, served at `/`
- `admin.html`  — the staff dashboard, served at `/admin` (password protected)
- orders are stored in `orders.json`, created automatically next to server.js on first order

## Features

Website: six-kitchen menu (Levant, Indian across 4 regions, Kyoto, Chengdu,
Oaxaca, Napoli, Sweet & Cellar), clickable dishes with ingredients/sizes/prices,
dine-in / takeaway / delivery selection with table number or address, GST(5%)
billing, a printable receipt after ordering, cart persisted to localStorage,
animated hero and scroll effects.

Admin app: live order feed (auto-refreshes every 15s), order-type badges,
customer name/phone/table/address, status control (new → preparing → done),
CSV export, print receipt per order.

## Deploying elsewhere

Just copy these three files to any server with Node.js installed and run
`node server.js` there — no build step, no npm install. Put it behind nginx
or any reverse proxy if you want it on port 80/443 with a domain.
