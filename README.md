# Hatch — Bengaluru Cafe & Six-Kitchen Ordering System

> **A kitchen with six passports, one room.**  
> Indiranagar, Bengaluru 560038 • Zero dependencies, zero build step, production-ready.

---

## ⚡ Quick Start

### Windows (1-Click)
Double-click [**`start.bat`**](file:///c:/Users/Shaik.Jubair/Downloads/Hatch_orders/start.bat) — it auto-detects Node.js, starts the server, and opens your browser.

### Command Line
```bash
node server.js
```

Then visit:
- **Customer Site**: [http://localhost:3001](http://localhost:3001)
- **Staff Kitchen POS**: [http://localhost:3001/admin](http://localhost:3001/admin)
  - **Username**: `hatch`
  - **Password**: `changeme` *(or set via `ADMIN_PASS` environment variable)*

---

## 🍽️ Features Overview

### 1. Customer-Facing Restaurant Website (`site.html`)
- **Six World Kitchens**:
  - 🥙 **The Levant** (Beirut-style counter, Shakshuka, Kofta, Labneh)
  - 🍛 **Indian Kitchen** (North, South, East, West regional specialties)
  - 🍣 **Kyoto Counter** (Miso glazed eggplant, Salmon Nigiri, Katsu Curry)
  - 🌶️ **Chengdu Fire** (Mapo Tofu, Dan Dan Noodles, Chili Dumplings)
  - 🌮 **Oaxaca Comal** (Mole Negro, Tlayuda, Elote con Crema)
  - 🍝 **Naples Table** (Ragù Rigatoni, Burrata Crostini, Sfogliatella)
  - 🍷 **Sweet & Cellar** (Gulab Jamun Cheesecake, Matcha Tiramisu, Indian Wines)
- **Interactive Ordering Flow**:
  - Size and portion selector (Half, Full, Regular, Large, 6pc).
  - Ingredients breakdown and dietary highlights.
  - Cart drawer with live item quantity increment/decrement (`+` / `−`) and duplicate merging.
  - Dine-in (with table number), Takeaway, and Home Delivery (with address) options.
  - Special instructions and allergy notes input.
  - GST (5%) automatic bill calculation.
- **Live Order Status Tracking on Receipt**:
  - Real-time order tracking badge (`Order Dispatched` ⏳ → `In Preparation` 👨‍🍳 → `Ready to Serve` ✓).
  - Thermal-style printable customer receipt.
  - Cart state persisted via `localStorage`.

### 2. Staff Kitchen POS Dashboard (`admin.html`)
- **Audio Chime on New Orders**: Real-time two-tone bell chime alerts kitchen staff whenever a guest places an order (can be muted with 1 click).
- **Instant Search & Filters**: Search across Order #, Customer Name, Phone, Table #, or dish names. Filter by `New`, `Preparing`, and `Completed`.
- **Order Management Workflow**:
  - `⏳ Start Prep`: Move new order to active kitchen prep.
  - `✓ Mark Ready`: Mark order ready for server or delivery rider.
  - `✕ Void`: Cancel or delete test/voided orders.
- **Dual Printing System**:
  - **🖨️ KOT (Kitchen Order Ticket)**: Formatted specifically for kitchen prep line with item list, table number, notes, and timestamp.
  - **🧾 Customer Bill**: Formatted itemized receipt with tax breakdown.
- **Analytics & Export**:
  - Today's Revenue (₹), Pending Orders, and Total Orders today.
  - 1-Click CSV Export for daily accounting and POS records.

---

## 🔌 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` or `/site.html` | Public | Serves customer restaurant website |
| `GET` | `/admin` | Basic Auth | Serves staff kitchen POS dashboard |
| `GET` | `/favicon.ico` | Public | Golden egg Hatch favicon |
| `GET` | `/health` | Public | Health check (`{"ok": true}`) |
| `POST` | `/api/orders` | Public | Create new order (returns `id` and `orderNumber`) |
| `GET` | `/api/orders/:id/status` | Public | Live order status tracker for customer receipts |
| `GET` | `/api/orders` | Basic Auth | List all orders sorted by creation time |
| `PATCH`| `/api/orders/:id` | Basic Auth | Update order status (`new` / `preparing` / `done`) |
| `DELETE`| `/api/orders/:id` | Basic Auth | Void or delete an order |

---

## 🛠️ Configuration & Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | HTTP port to listen on |
| `ADMIN_USER` | `hatch` | Staff dashboard username |
| `ADMIN_PASS` | `changeme` | Staff dashboard password |

### Custom Password Example:
```bash
# Windows PowerShell
$env:ADMIN_PASS="SecretKitchenPass123"; node server.js

# Linux / macOS
ADMIN_PASS=SecretKitchenPass123 node server.js
```

---

## 🚀 1-Click GitHub Synchronization

Whenever you make any changes to files:
- Double-click [**`push_to_github.bat`**](file:///c:/Users/Shaik.Jubair/Downloads/Hatch_orders/push_to_github.bat)
- It will automatically detect modified files, commit them, and push them to **https://github.com/jubair46/Hatch_orders**.
