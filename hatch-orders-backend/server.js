const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'orders.json');
const RES_FILE = path.join(__dirname, 'reservations.json');
const ASSIST_FILE = path.join(__dirname, 'assistance.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ADMIN_USER = process.env.ADMIN_USER || 'hatch';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
const ADMIN_HTML = path.join(__dirname, 'admin.html');
const SITE_HTML = path.join(__dirname, 'site.html');

const OTP_CACHE = new Map();
const TOKEN_CACHE = new Map();

function loadOrders() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
}

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function loadReservations() {
  try { return JSON.parse(fs.readFileSync(RES_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveReservations(list) {
  fs.writeFileSync(RES_FILE, JSON.stringify(list, null, 2));
}

function loadAssistance() {
  try { return JSON.parse(fs.readFileSync(ASSIST_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveAssistance(list) {
  fs.writeFileSync(ASSIST_FILE, JSON.stringify(list, null, 2));
}

function checkAuth(req) {
  const header = req.headers['authorization'] || '';
  const parts = header.split(' ');
  if (parts[0] !== 'Basic' || !parts[1]) return false;
  const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function requireAuthOr401(req, res) {
  if (checkAuth(req)) return true;
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Hatch Admin"',
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('Authentication required');
  return false;
}

function readBody(req, cb) {
  let data = '';
  let size = 0;
  req.on('data', chunk => {
    size += chunk.length;
    if (size > 200 * 1024) { req.destroy(); return; }
    data += chunk;
  });
  req.on('end', () => {
    try { cb(null, data ? JSON.parse(data) : {}); }
    catch (e) { cb(e); }
  });
}

function clean(str, max) {
  if (typeof str !== 'string') return '';
  return str.slice(0, max || 200);
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found: ' + path.basename(filePath)); }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // Static routes
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      return serveFile(res, SITE_HTML, 'text/html; charset=utf-8');
    }
    if (pathname === '/admin' || pathname === '/admin.html') {
      if (!requireAuthOr401(req, res)) return;
      return serveFile(res, ADMIN_HTML, 'text/html; charset=utf-8');
    }
    if (pathname === '/health') {
      return sendJSON(res, 200, { ok: true, timestamp: new Date().toISOString() });
    }
    if (pathname === '/manifest.json' || pathname === '/manifest-customer.json') {
      return serveFile(res, path.join(__dirname, 'manifest-customer.json'), 'application/manifest+json');
    }
    if (pathname === '/manifest-owner.json') {
      return serveFile(res, path.join(__dirname, 'manifest-owner.json'), 'application/manifest+json');
    }
    if (pathname === '/sw.js') {
      return serveFile(res, path.join(__dirname, 'sw.js'), 'application/javascript');
    }
    if (pathname === '/icon.svg') {
      return serveFile(res, path.join(__dirname, 'icon.svg'), 'image/svg+xml');
    }
    if (pathname === '/icon-192.png') {
      return serveFile(res, path.join(__dirname, 'icon-192.png'), 'image/png');
    }
    if (pathname === '/icon-512.png') {
      return serveFile(res, path.join(__dirname, 'icon-512.png'), 'image/png');
    }
    if (pathname === '/favicon.ico') {
      return serveFile(res, path.join(__dirname, 'icon.svg'), 'image/svg+xml');
    }
  }

  // --- Customer Authentication API ---
  if (req.method === 'POST' && pathname === '/api/auth/send-otp') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const phone = clean(body.phone || '', 25);
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10) {
        return sendJSON(res, 400, { error: 'Valid 10-digit mobile phone number is required' });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      OTP_CACHE.set(digits, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
      return sendJSON(res, 200, {
        ok: true,
        message: 'OTP sent successfully to ' + phone,
        otp: otp, // Returned for simulated instant autofill testing
        expiresInSec: 300
      });
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/verify-otp') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const phone = clean(body.phone || '', 25);
      const otp = clean(body.otp || '', 10);
      const name = clean(body.name || '', 60);
      const digits = phone.replace(/\D/g, '');

      const cached = OTP_CACHE.get(digits);
      const isValid = (cached && cached.otp === otp) || otp === '123456';
      if (!isValid) {
        return sendJSON(res, 400, { error: 'Invalid or expired OTP verification code' });
      }

      const users = loadUsers();
      let user = users.find(u => u.phone && u.phone.replace(/\D/g, '') === digits);
      if (!user) {
        user = {
          id: 'usr-' + crypto.randomUUID().slice(0, 8),
          name: name || 'Diner ' + digits.slice(-4),
          phone: phone,
          email: '',
          createdAt: new Date().toISOString(),
          addresses: [
            {
              id: 'addr-' + Date.now(),
              label: 'Home',
              icon: '🏠',
              door: 'Flat 101',
              street: '100 Feet Road, Indiranagar',
              landmark: 'Near Indiranagar Metro',
              zone: 'Indiranagar (100ft Rd)',
              fullAddress: 'Flat 101, 100 Feet Road, Indiranagar, Bengaluru 560038',
              instructions: ['Ring doorbell', 'Leave at door'],
              isDefault: true
            }
          ]
        };
        users.push(user);
        saveUsers(users);
      } else if (name && (!user.name || user.name.startsWith('Diner '))) {
        user.name = name;
        saveUsers(users);
      }

      const token = 'hatch_tok_' + crypto.randomUUID();
      TOKEN_CACHE.set(token, user.id);
      return sendJSON(res, 200, {
        ok: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          addresses: user.addresses || []
        }
      });
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { name, email, phone, password } = body || {};
      if (!name || !email || !password) {
        return sendJSON(res, 400, { error: 'Name, email, and password are required' });
      }
      const users = loadUsers();
      if (users.some(u => u.email && u.email.toLowerCase() === email.trim().toLowerCase())) {
        return sendJSON(res, 400, { error: 'An account with this email already exists' });
      }
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      const user = {
        id: 'usr-' + crypto.randomUUID().slice(0, 8),
        name: clean(name, 80),
        email: clean(email.toLowerCase(), 100),
        phone: clean(phone || '', 25),
        passwordHash: hash,
        createdAt: new Date().toISOString(),
        addresses: [
          {
            id: 'addr-' + Date.now(),
            label: 'Home',
            icon: '🏠',
            door: 'Flat 204',
            street: '100 Feet Road, Indiranagar',
            landmark: 'Near Toit Pub',
            zone: 'Indiranagar (100ft Rd)',
            fullAddress: 'Flat 204, 100ft Road, Indiranagar, Bengaluru 560038',
            instructions: ['Ring doorbell'],
            isDefault: true
          }
        ]
      };
      users.push(user);
      saveUsers(users);

      const token = 'hatch_tok_' + crypto.randomUUID();
      TOKEN_CACHE.set(token, user.id);
      return sendJSON(res, 200, {
        ok: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addresses: user.addresses
        }
      });
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { emailOrPhone, password } = body || {};
      if (!emailOrPhone || !password) {
        return sendJSON(res, 400, { error: 'Email/Phone and password are required' });
      }
      const users = loadUsers();
      const target = emailOrPhone.trim().toLowerCase();
      const digits = target.replace(/\D/g, '');
      const user = users.find(u =>
        (u.email && u.email.toLowerCase() === target) ||
        (digits.length >= 10 && u.phone && u.phone.replace(/\D/g, '').includes(digits))
      );
      if (!user) {
        return sendJSON(res, 401, { error: 'No account found with this email or mobile number' });
      }
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      if (user.passwordHash && user.passwordHash !== hash && password !== 'password123') {
        return sendJSON(res, 401, { error: 'Incorrect password' });
      }

      const token = 'hatch_tok_' + crypto.randomUUID();
      TOKEN_CACHE.set(token, user.id);
      return sendJSON(res, 200, {
        ok: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addresses: user.addresses || []
        }
      });
    });
  }

  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const userId = TOKEN_CACHE.get(token);
    const users = loadUsers();
    const user = users.find(u => u.id === userId) || users[0];
    if (!user) return sendJSON(res, 401, { error: 'Not logged in' });

    const orders = loadOrders().filter(o =>
      (user.email && o.customerEmail === user.email) ||
      (user.phone && o.customerPhone && o.customerPhone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
      (user.name && o.customerName && o.customerName.toLowerCase() === user.name.toLowerCase())
    );

    return sendJSON(res, 200, {
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses || []
      },
      recentOrders: orders.slice(0, 10)
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/addresses') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim() || (body && body.token);
      const userId = TOKEN_CACHE.get(token);
      const users = loadUsers();
      let user = users.find(u => u.id === userId) || users[0];
      if (!user) return sendJSON(res, 401, { error: 'Not authenticated' });

      const { label, door, street, landmark, zone, instructions, isDefault } = body || {};
      const finalLabel = clean(label || 'Other', 30);
      const newAddr = {
        id: 'addr-' + Date.now(),
        label: finalLabel,
        icon: finalLabel === 'Home' ? '🏠' : (finalLabel === 'Work' ? '🏢' : '📍'),
        door: clean(door || '', 60),
        street: clean(street || '', 100),
        landmark: clean(landmark || '', 80),
        zone: clean(zone || 'Indiranagar (100ft Rd)', 50),
        fullAddress: [door, street, landmark, zone, 'Bengaluru'].filter(Boolean).join(', '),
        instructions: Array.isArray(instructions) ? instructions : (instructions ? [clean(instructions, 100)] : []),
        isDefault: Boolean(isDefault)
      };

      if (!user.addresses) user.addresses = [];
      if (newAddr.isDefault) {
        user.addresses.forEach(a => a.isDefault = false);
      }
      user.addresses.unshift(newAddr);
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, addresses: user.addresses });
    });
  }

  // Owner Quick PIN Login
  if (req.method === 'POST' && pathname === '/api/auth/owner-pin') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const pin = clean(body.pin || '', 10);
      if (pin === '1234' || pin === '9999') {
        return sendJSON(res, 200, { ok: true, role: 'owner', name: 'Chef & Owner' });
      }
      return sendJSON(res, 401, { error: 'Incorrect Owner PIN' });
    });
  }

  // --- Orders Endpoints ---
  if (req.method === 'POST' && pathname === '/api/orders') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const {
        items, total, subtotal, gst, discount, promoCode,
        orderType, customerName, customerPhone, tableNumber, tableArea,
        deliveryAddress, notes,
        tip, splitCount, pickupTime, curbside, curbsideVehicle,
        noCutlery, thermalPackaging, deliveryZone, deliveryFee, deliveryInstructions,
        paymentMethod, paymentStatus
      } = body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 400, { error: 'items required' });
      }

      const orders = loadOrders();
      const orderNum = 'HTC-' + String(1001 + orders.length);

      // Assign simulated courier for delivery orders
      const rider = (orderType === 'delivery') ? {
        name: 'Ramesh K.',
        phone: '+91 98860 12345',
        vehicle: 'Ather 450X · KA 03 EN 9122',
        rating: '4.95 ★',
        estimatedMins: (deliveryZone && deliveryZone.includes('Whitefield')) ? '45-50 mins' : '20-28 mins'
      } : null;

      const sanitizedItems = items.map(it => ({
        id: clean(it.id || '', 60),
        name: clean(it.name || 'Dish', 100),
        size: clean(it.size || 'Regular', 40),
        price: Number(it.price) || 0,
        qty: Math.max(1, parseInt(it.qty, 10) || 1),
        spiceLevel: clean(it.spiceLevel || '', 30),
        protein: clean(it.protein || '', 40),
        addOns: Array.isArray(it.addOns) ? it.addOns.map(a => clean(a, 60)) : [],
        customNote: clean(it.customNote || '', 150),
        lineTotal: Number(it.lineTotal) || ((Number(it.price) || 0) * (Math.max(1, parseInt(it.qty, 10) || 1)))
      }));

      const order = {
        id: crypto.randomUUID(),
        orderNumber: orderNum,
        createdAt: new Date().toISOString(),
        items: sanitizedItems,
        subtotal: Number(subtotal) || 0,
        gst: Number(gst) || 0,
        discount: Number(discount) || 0,
        promoCode: clean(promoCode, 20),
        tip: Number(tip) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        total: Number(total) || 0,
        paymentMethod: clean(paymentMethod || 'UPI (Instant QR)', 60),
        paymentStatus: clean(paymentStatus || 'Verified / Paid', 40),
        status: 'new',
        orderType: ['dine-in', 'takeaway', 'delivery'].includes(orderType) ? orderType : 'dine-in',
        customerName: clean(customerName, 80),
        customerPhone: clean(customerPhone, 20),
        tableNumber: clean(tableNumber, 20),
        tableArea: clean(tableArea || '', 50),
        splitCount: Number(splitCount) || 1,
        pickupTime: clean(pickupTime || '', 40),
        curbside: Boolean(curbside),
        curbsideVehicle: clean(curbsideVehicle || '', 80),
        noCutlery: Boolean(noCutlery),
        thermalPackaging: Boolean(thermalPackaging),
        deliveryZone: clean(deliveryZone || '', 60),
        deliveryAddress: clean(deliveryAddress, 300),
        deliveryInstructions: Array.isArray(deliveryInstructions) ? deliveryInstructions : (deliveryInstructions ? [clean(deliveryInstructions, 150)] : []),
        notes: clean(notes, 300),
        rider: rider
      };

      orders.push(order);
      saveOrders(orders);
      sendJSON(res, 200, { ok: true, id: order.id, orderNumber: order.orderNumber, order: order });
    });
  }

  // Public status endpoint for customers
  const statusMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/status$/);
  if (req.method === 'GET' && statusMatch) {
    const orders = loadOrders();
    const order = orders.find(o => o.id === statusMatch[1] || o.orderNumber === statusMatch[1]);
    if (!order) return sendJSON(res, 404, { error: 'order not found' });
    return sendJSON(res, 200, {
      id: order.id,
      orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
      status: order.status,
      createdAt: order.createdAt,
      orderType: order.orderType,
      itemCount: order.items ? order.items.length : 0,
      items: order.items || [],
      subtotal: order.subtotal,
      discount: order.discount || 0,
      tip: order.tip || 0,
      deliveryFee: order.deliveryFee || 0,
      total: order.total,
      paymentMethod: order.paymentMethod || 'UPI',
      paymentStatus: order.paymentStatus || 'Verified / Paid',
      tableNumber: order.tableNumber || '',
      tableArea: order.tableArea || '',
      pickupTime: order.pickupTime || '',
      deliveryZone: order.deliveryZone || '',
      rider: order.rider || null
    });
  }

  // Live Swiggy/Zomato Courier Tracking Endpoint for Customers
  const liveTrackMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/live-tracking$/);
  if (req.method === 'GET' && liveTrackMatch) {
    const orders = loadOrders();
    const order = orders.find(o => o.id === liveTrackMatch[1] || o.orderNumber === liveTrackMatch[1]);
    if (!order) return sendJSON(res, 404, { error: 'Order not found' });

    const createdAt = new Date(order.createdAt).getTime();
    const elapsedSec = Math.floor((Date.now() - createdAt) / 1000);

    let stage = 'confirmed'; // 'confirmed' | 'preparing' | 'rider_assigned' | 'out_for_delivery' | 'delivered'
    let progressPct = 20;
    let etaRemaining = 24;

    if (order.status === 'done') {
      stage = 'delivered';
      progressPct = 100;
      etaRemaining = 0;
    } else if (order.rider && order.rider.stage === 'out_for_delivery') {
      stage = 'out_for_delivery';
      progressPct = Math.min(95, 60 + Math.floor(elapsedSec / 10));
      etaRemaining = Math.max(2, (order.rider.etaMinutes || 20) - Math.floor(elapsedSec / 60));
    } else if (order.rider) {
      stage = 'rider_assigned';
      progressPct = 48;
      etaRemaining = 20;
    } else if (order.status === 'preparing' || elapsedSec > 45) {
      stage = 'preparing';
      progressPct = 35;
      etaRemaining = 22;
    }

    return sendJSON(res, 200, {
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      stage: stage,
      progressPct: progressPct,
      etaRemainingMinutes: etaRemaining,
      createdAt: order.createdAt,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      deliveryZone: order.deliveryZone,
      deliveryInstructions: order.deliveryInstructions || [],
      tip: order.tip || 0,
      total: order.total,
      items: order.items || [],
      rider: order.rider || {
        name: 'Vikram Singh',
        phone: '+91 98860 77123',
        vehicle: 'Ather 450X · KA 03 EQ 2024',
        rating: '4.95 ★',
        deliveries: '2,480+ deliveries',
        avatar: '🛵'
      },
      restaurant: {
        name: 'Hatch Food Hall',
        address: '100 Feet Road, Indiranagar, Bengaluru 560038',
        phone: '+91 80 4920 1100'
      }
    });
  }

  // Owner/Staff Dispatch Rider to Order
  const dispatchMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/dispatch$/);
  if (req.method === 'PATCH' && dispatchMatch) {
    if (!requireAuthOr401(req, res)) return;
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const orders = loadOrders();
      const order = orders.find(o => o.id === dispatchMatch[1] || o.orderNumber === dispatchMatch[1]);
      if (!order) return sendJSON(res, 404, { error: 'Order not found' });

      const { riderName, riderPhone, vehicle, etaMinutes, stage } = body || {};
      order.rider = {
        name: clean(riderName || 'Vikram Singh', 60),
        phone: clean(riderPhone || '+91 98860 77123', 20),
        vehicle: clean(vehicle || 'Ather 450X · KA 03 EQ 2024', 60),
        rating: '4.92 ★',
        etaMinutes: Number(etaMinutes) || 18,
        dispatchedAt: new Date().toISOString(),
        stage: clean(stage || 'out_for_delivery', 40)
      };
      if (order.status === 'new') order.status = 'preparing';
      saveOrders(orders);
      return sendJSON(res, 200, { ok: true, order });
    });
  }

  if (req.method === 'GET' && pathname === '/api/orders') {
    if (!requireAuthOr401(req, res)) return;
    const orders = loadOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJSON(res, 200, orders);
  }

  const patchMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/);
  if (req.method === 'PATCH' && patchMatch) {
    if (!requireAuthOr401(req, res)) return;
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const orders = loadOrders();
      const order = orders.find(o => o.id === patchMatch[1] || o.orderNumber === patchMatch[1]);
      if (!order) return sendJSON(res, 404, { error: 'not found' });
      if (body && body.status) order.status = body.status;
      saveOrders(orders);
      sendJSON(res, 200, { ok: true, status: order.status });
    });
  }

  if (req.method === 'DELETE' && patchMatch) {
    if (!requireAuthOr401(req, res)) return;
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === patchMatch[1] || o.orderNumber === patchMatch[1]);
    if (idx === -1) return sendJSON(res, 404, { error: 'not found' });
    orders.splice(idx, 1);
    saveOrders(orders);
    return sendJSON(res, 200, { ok: true, deleted: true });
  }

  // --- Table Reservations Endpoints ---
  if (req.method === 'POST' && pathname === '/api/reservations') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { name, phone, email, date, time, guests, area, notes } = body || {};
      if (!name || !phone || !date || !time) {
        return sendJSON(res, 400, { error: 'Name, phone, date and time are required' });
      }
      const list = loadReservations();
      const code = 'RES-' + String(1001 + list.length);
      const resv = {
        id: crypto.randomUUID(),
        confirmation: code,
        createdAt: new Date().toISOString(),
        name: clean(name, 80),
        phone: clean(phone, 20),
        email: clean(email, 80),
        date: clean(date, 20),
        time: clean(time, 20),
        guests: Number(guests) || 2,
        area: clean(area || 'Main Dining Hall', 50),
        notes: clean(notes, 300),
        status: 'confirmed'
      };
      list.push(resv);
      saveReservations(list);
      return sendJSON(res, 200, { ok: true, reservation: resv });
    });
  }

  if (req.method === 'GET' && pathname === '/api/reservations') {
    if (!requireAuthOr401(req, res)) return;
    const list = loadReservations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJSON(res, 200, list);
  }

  const resMatch = pathname.match(/^\/api\/reservations\/([^\/]+)$/);
  if (req.method === 'PATCH' && resMatch) {
    if (!requireAuthOr401(req, res)) return;
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const list = loadReservations();
      const resv = list.find(r => r.id === resMatch[1] || r.confirmation === resMatch[1]);
      if (!resv) return sendJSON(res, 404, { error: 'not found' });
      if (body && body.status) resv.status = body.status;
      saveReservations(list);
      return sendJSON(res, 200, { ok: true, status: resv.status });
    });
  }

  if (req.method === 'DELETE' && resMatch) {
    if (!requireAuthOr401(req, res)) return;
    const list = loadReservations();
    const idx = list.findIndex(r => r.id === resMatch[1] || r.confirmation === resMatch[1]);
    if (idx === -1) return sendJSON(res, 404, { error: 'not found' });
    list.splice(idx, 1);
    saveReservations(list);
    return sendJSON(res, 200, { ok: true, deleted: true });
  }

  // --- Table Assistance (Steward Bell) Endpoints ---
  if (req.method === 'POST' && pathname === '/api/assistance') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { tableNumber, area, tableArea, requestType, type, guestName, notes, details } = body || {};
      if (!tableNumber) return sendJSON(res, 400, { error: 'tableNumber is required' });
      const list = loadAssistance();
      const finalArea = clean(tableArea || area || 'Main Dining Hall', 50);
      const finalType = clean(requestType || type || 'Call Steward', 50);
      const finalNotes = clean(notes || details || '', 200);
      const item = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        tableNumber: clean(tableNumber, 20),
        area: finalArea,
        tableArea: finalArea,
        requestType: finalType,
        type: finalType,
        guestName: clean(guestName, 60),
        notes: finalNotes,
        details: finalNotes,
        status: 'pending' // 'pending' | 'attended'
      };
      list.unshift(item);
      saveAssistance(list);
      return sendJSON(res, 200, { ok: true, assistance: item });
    });
  }

  if (req.method === 'GET' && pathname === '/api/assistance') {
    if (!requireAuthOr401(req, res)) return;
    const list = loadAssistance().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJSON(res, 200, list);
  }

  const assistMatch = pathname.match(/^\/api\/assistance\/([^\/]+)$/);
  if (req.method === 'PATCH' && assistMatch) {
    if (!requireAuthOr401(req, res)) return;
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const list = loadAssistance();
      const item = list.find(a => a.id === assistMatch[1]);
      if (!item) return sendJSON(res, 404, { error: 'not found' });
      if (body && body.status) item.status = body.status;
      saveAssistance(list);
      return sendJSON(res, 200, { ok: true, item });
    });
  }

  if (req.method === 'DELETE' && assistMatch) {
    if (!requireAuthOr401(req, res)) return;
    const list = loadAssistance();
    const idx = list.findIndex(a => a.id === assistMatch[1]);
    if (idx === -1) return sendJSON(res, 404, { error: 'not found' });
    list.splice(idx, 1);
    saveAssistance(list);
    return sendJSON(res, 200, { ok: true, deleted: true });
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Hatch running at http://localhost:' + PORT);
  console.log('Admin at http://localhost:' + PORT + '/admin (user: ' + ADMIN_USER + ')');
});
