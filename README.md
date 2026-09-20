# Hatch — Bengaluru 9-Kitchen Food Hall, Dining & Ordering Platform

> **Nine culinary counters, one roof.**  
> 100 Feet Road, Indiranagar, Bengaluru 560038 • Zero dependencies, zero build step, 100% production-ready.

---

## ⚡ Quick Start

### Windows (1-Click)
Double-click [**`start.bat`**](file:///c:/Users/Shaik.Jubair/Downloads/Hatch_orders/start.bat) — it auto-detects Node.js, starts the server on port 3001, and launches your browser.

### Command Line
```bash
node server.js
```

Then visit:
- **Customer Dining Site**: [http://localhost:3001](http://localhost:3001)
- **Staff Kitchen & POS Console**: [http://localhost:3001/admin](http://localhost:3001/admin)
  - **Username**: `hatch`
  - **Password**: `changeme` *(or set via `ADMIN_PASS` environment variable)*
- **Health Check**: [http://localhost:3001/health](http://localhost:3001/health)

---

## 📱 Android Mobile App & APK Download

### 1. Download Native Android APK
Every push to this repository automatically compiles a native Android APK in the cloud via GitHub Actions:
- **Direct APK Download**: Go to [**GitHub Releases (v1.1.0)**](https://github.com/jubair46/Hatch_orders/releases) or the [**Actions Artifacts**](https://github.com/jubair46/Hatch_orders/actions) tab and download **`hatch-orders-v1.0.0.apk`**.
- **Installation**: Tap the downloaded `.apk` file on your Android phone and select **Install** to enjoy the full native app experience.

### 2. Instant Browser Install (PWA)
1. Open the website on your Android phone (in Chrome, Brave, or Samsung Internet).
2. Tap the **📲 Install App** button in the header bar or select **"Add to Home screen"** from your browser's menu (⋮).
3. The app will install directly onto your home screen with a custom icon and fullscreen interface.

---

## 🍽️ Master Culinary Counters (From the 22-Page Menu Catalogue)

1. 🍛 **Indian Kitchen**:
   - *Starters & Tandoor*: Samosa Chaat Royal, Paneer Tikka Angaar, Chicken 65 Bengaluru, Lucknowi Seekh Kebab.
   - *Curries & Gravies*: Royal Rogan Josh, Dal Makhani Bukhara, Chettinad Pepper Chicken, Alleppey Fish Moilee, Paneer Butter Masala.
   - *Breads & Rice*: Truffle Garlic Naan, Saffron Dum Biryani Basmati, Butter Roti.
   - *Desserts & Drinks*: Kesari Rasmalai, Warm Gulab Jamun, Saffron Kesar Lassi, South Indian Filter Coffee.
2. 🌺 **Thai Orchid Counter**:
   - *Soups & Small Plates*: Authentic Tom Yum Goong, Lemongrass Chicken Satay with Peanut Dip, Crisp Green Papaya Som Tam.
   - *Mains & Noodles*: Thai Green Curry with Jasmine Rice, Royal Massaman Beef Curry, Spicy Pad Kra Pao Basil, Authentic Pad Thai, Chiang Mai Khao Soi.
   - *Desserts & Beverages*: Sweet Mango Sticky Rice with Coconut Cream, Handcrafted Thai Iced Tea.
3. 🍣 **Kyoto Counter**: Truffle Edamame, Wagyu Gyoza, Crispy Chicken Karaage, Signature Tonkotsu Ramen, Tempura Udon, Flame-Torched Salmon Nigiri, Artisanal Mochi Ice Cream, Ceremonial Matcha Latte.
4. 🌶️ **Chengdu Fire**: Crystal Har Gow, Steamed Pork Siu Mai, Kung Pao Chicken Wok, Indo-Chinese Chili Chicken, Wok-Tossed Hakka Noodles, Taiwanese Boba Milk Tea.
5. 🥙 **The Levant**: Beirut-style Shakshuka, Lamb Kofta Skewers, Whipped Labneh with Za'atar.
6. 🌮 **Oaxaca Comal**: Mole Negro Braised Short Rib, Charred Corn Street Elote, Blue Corn Tlayuda.
7. 🍝 **Naples Table**: Slow-Braised Ragù Rigatoni, Truffled Burrata Crostini, Neapolitan Sfogliatella.
8. ☕ **Artisanal Bakery & Breakfast**: Truffle Scrambled Eggs, Avocado Sourdough Tartine, Fluffy Ricotta Pancakes, Salted Caramel Croissant, Acai Superfood Bowl.
9. 🍹 **Bar & Handcrafted Beverages**: Smoked Rosemary Old Fashioned, Yuzu Blossom Spritz, Passionfruit Jalapeño Margarita, Spiced Hibiscus Cooler.

---

## 🌟 High-Impact New Features

### 🎛️ 1. Interactive Dish Customization Studio
Clicking on any dish now opens the bespoke **Customization Studio**:
- **Portion Selection**: Pick between *Standard Serving* and *Family / Large Feast*.
- **Spice Level Selector**: Interactive heat gauge from `🟢 Mild` to `🟡 Medium`, `🌶️ Spicy`, and `🔥 Extra Hot`.
- **Protein & Base Chooser**: Choose your core protein/cut (e.g., *Farm Fresh Paneer*, *Free-Range Chicken*, *Slow-Cooked Mutton*, *Tiger Prawns*, *Silken Tofu*).
- **Gourmet Add-Ons with Real-Time Delta Pricing**: Dynamically add sides and accompaniments (e.g., *Garlic Naan Basket*, *Extra Crushed Peanuts*, *Avocado Slices*) with live cost recalculation.
- **Bespoke Chef Notes**: Quick dietary instruction chips (`Less Spicy`, `No Onion/Garlic`, `Extra Sauce`, `Allergy Alert`) plus an open text instruction field that prints directly onto the kitchen KOT.

### 💳 2. Frictionless Tri-Payment Engine (Zero-Failure Architecture)
Seamless checkout experience with zero third-party gateway drops or timeouts:
- **Instant Dynamic UPI QR Simulator**: Generates real-time UPI QR codes with an authentic 5-minute security countdown timer and 1-tap UPI app launcher.
- **Card Payment Terminal Simulator**: Realistic credit/debit card interface with formatted 16-digit card input, expiry, CVV, and 3D-Secure simulation.
- **Pay at Table / Cash on Delivery**: 1-click option for contactless physical payment upon arrival.

### 💎 3. Luxury Obsidian Emerald & Champagne Gold Theme
- Handcrafted visual hierarchy with `#0a140e` deep obsidian backgrounds, `#16271e` emerald glass panels, and `#d4a017` champagne gold accents.
- Responsive floating bottom cart bar for fluid single-handed mobile navigation.
- Micro-interactions, hover glow effects, and modern typography.

---

## 🌟 Complete Feature Matrix

### 1. Customer Site (`site.html`)
- **Service Mode Bar**: Toggle seamlessly between `🍽️ Dine-In`, `🥡 Takeaway`, and `🛵 Delivery` with live contextual feedback.
- **Interactive Floor Plan**:
  - Interactive map of **15 tables** across 4 zones: *Main Dining Hall*, *Courtyard Garden*, *Chef's Counter*, and *Verandah*.
  - Live availability indicators (`Available`, `Occupied`, `Reserved`). Selecting a table automatically syncs with your order.
- **Digital Steward Call Bell (`🛎️ Call Steward`)**:
  - Ambient floating bell button with dedicated request options: *Water Refill*, *Extra Cutlery*, *Sommelier Help*, *Payment Terminal / Bill*, or *General Assistance*.
- **Smart Takeaway Logistics**:
  - Pickup timing presets: `ASAP (15-20 min)`, `In 30 mins`, `In 45 mins`, `In 1 Hour`, or custom time slots.
  - Curbside pickup toggle with vehicle model and license plate input for valet hand-off.
  - Eco-packaging options: skip plastic cutlery, request thermal insulated delivery pouch.
- **Hyperlocal Bengaluru Delivery**:
  - Neighborhood zones: *Indiranagar (100ft Rd)*, *Domlur & HAL*, *Koramangala*, *Ulsoor & Cambridge Layout*, *CBD / MG Road*, and *Whitefield / Outer Ring Road*.
  - Delivery instruction chips: `🔔 Ring doorbell`, `🤫 Don't ring, call`, `📦 Leave with security`, `🚪 Leave at door`.
  - Live courier assignment simulation (*Ramesh K. · Ather 450X*) with 4-stage tracking stepper (`Confirmed` ➔ `Crafting` ➔ `Quality Pack` ➔ `En Route`).
- **Table Reservations**:
  - Booking modal with date picker, lunch/dinner slots, guest count (1-12), seating area, and special occasion requests.
  - Instant booking confirmation code and WhatsApp notification integration.
- **Promo Engine & Bill Splitting**:
  - Active promo codes: `WELCOME10` (10% off), `HATCH50` (₹50 off ₹300+), `BENGALURU` (₹75 off ₹500+).
  - Staff gratuity tip selector and dynamic per-person bill split calculator.
- **Dietary Filter Chips & Live Search**:
  - Filter across `All`, `Veg 🌱`, `Non-Veg 🍗`, `Vegan 🌿`, `Gluten-Free 🌾`, `Spicy 🌶️`.
- **Aesthetic Glassmorphism Design & Dark Mode**:
  - Day/Night theme toggle saved to `localStorage`, smooth CSS transitions, luxury typography, and toast alerts.

---

### 2. Kitchen POS & Staff Console (`admin.html`)
- **Three Integrated Operation Views**:
  - `🍳 Kitchen Orders`: Real-time queue displaying items, notes, table numbers, tips, split bill counts, curbside vehicle info, delivery zones, and courier assignments.
  - `📅 Table Reservations`: Table booking queue with guest contacts, party size, area selection, and 1-click WhatsApp customer messaging.
  - `🛎️ Table Assistance`: Dedicated real-time steward call console displaying table numbers, dining areas, service requested (*Water Refill, Sommelier, Bill, etc.*), and a `✓ Mark Attended` button with audio alerts.
- **Audio Chime on New Events**: Dual-tone chime plays automatically on new orders and incoming steward calls.
- **Hardware-Ready Thermal Printing**:
  - **🖨️ KOT (Kitchen Order Ticket)**: Formatted for kitchen pass printers with item modifiers, allergies, and dispatch notes.
  - **🧾 Customer Bill**: Itemized customer tax invoice showing food subtotal, promo discounts, 5% GST, gratuity tips, and delivery fees.
- **1-Click CSV Exports**: Export Kitchen Orders, Table Reservations, and Table Assistance logs for auditing and POS accounting.

---

## 🔌 Complete REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` or `/site.html` | Public | Serves customer dining application |
| `GET` | `/admin` | Basic Auth | Serves staff POS & kitchen management console |
| `GET` | `/health` | Public | Health check (`{"ok": true}`) |
| `POST` | `/api/orders` | Public | Place order with Dine-in, Takeaway, or Delivery metadata |
| `GET` | `/api/orders/:id/status` | Public | Live order status tracker for customer receipts |
| `GET` | `/api/orders` | Basic Auth | List all orders sorted chronologically |
| `PATCH`| `/api/orders/:id` | Basic Auth | Update order status (`new` / `preparing` / `done`) |
| `DELETE`| `/api/orders/:id` | Basic Auth | Void or delete an order |
| `POST` | `/api/reservations` | Public | Book a dining table reservation |
| `GET` | `/api/reservations` | Basic Auth | List all reservations |
| `PATCH`| `/api/reservations/:id` | Basic Auth | Update reservation status (`confirmed` / `seated` / `cancelled`) |
| `DELETE`| `/api/reservations/:id` | Basic Auth | Cancel or void a reservation |
| `POST` | `/api/assistance` | Public | Submit table steward call request |
| `GET` | `/api/assistance` | Basic Auth | List all table service calls |
| `PATCH`| `/api/assistance/:id` | Basic Auth | Mark service call as `attended` |
| `DELETE`| `/api/assistance/:id` | Basic Auth | Dismiss or void a service call |

---

## 🛠️ Configuration

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | HTTP port to listen on |
| `ADMIN_USER` | `hatch` | Staff dashboard username |
| `ADMIN_PASS` | `changeme` | Staff dashboard password |
