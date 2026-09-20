const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'orders.json');
const RES_FILE = path.join(__dirname, 'reservations.json');
const ADMIN_USER = process.env.ADMIN_USER || 'hatch';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
const ADMIN_HTML = path.join(__dirname, 'admin.html');
const SITE_HTML = path.join(__dirname, 'site.html');

function loadOrders() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
}

function loadReservations() {
  try { return JSON.parse(fs.readFileSync(RES_FILE, 'utf8')); }
  catch (e) { return []; }
}
function saveReservations(list) {
  fs.writeFileSync(RES_FILE, JSON.stringify(list, null, 2));
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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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
  const url = new URL(req.url, 'http://' + req.headers.host);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  if (req.method === 'GET' && (pathname === '/' || pathname === '/site.html' || pathname === '/index.html')) {
    return serveFile(res, SITE_HTML, 'text/html');
  }

  if (req.method === 'GET' && (pathname === '/admin' || pathname === '/admin.html')) {
    if (!requireAuthOr401(req, res)) return;
    return serveFile(res, ADMIN_HTML, 'text/html');
  }

  if (req.method === 'GET' && pathname === '/health') {
    return sendJSON(res, 200, { ok: true });
  }

  if (pathname === '/favicon.ico') {
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    });
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14201a"/><path d="M50 16 C34 16 26 44 26 64 C26 80 37 88 50 88 C63 88 74 80 74 64 C74 44 66 16 50 16 Z" fill="#d4a017"/><path d="M50 24 C38 24 32 46 32 63 C32 75 40 81 50 81 C60 81 68 75 68 63 C68 46 62 24 50 24 Z" fill="#f6efe1"/></svg>');
  }

  if (req.method === 'POST' && pathname === '/api/orders') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { items, total, subtotal, gst, discount, promoCode, orderType, customerName, customerPhone, tableNumber, deliveryAddress, notes } = body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 400, { error: 'items required' });
      }
      const orders = loadOrders();
      const orderNum = 'HTC-' + String(1001 + orders.length);
      const order = {
        id: crypto.randomUUID(),
        orderNumber: orderNum,
        createdAt: new Date().toISOString(),
        items,
        subtotal: Number(subtotal) || 0,
        gst: Number(gst) || 0,
        discount: Number(discount) || 0,
        promoCode: clean(promoCode, 20),
        total: Number(total) || 0,
        status: 'new',
        orderType: ['dine-in', 'takeaway', 'delivery'].includes(orderType) ? orderType : 'dine-in',
        customerName: clean(customerName, 80),
        customerPhone: clean(customerPhone, 20),
        tableNumber: clean(tableNumber, 20),
        deliveryAddress: clean(deliveryAddress, 300),
        notes: clean(notes, 300)
      };
      orders.push(order);
      saveOrders(orders);
      sendJSON(res, 200, { ok: true, id: order.id, orderNumber: order.orderNumber });
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
      total: order.total
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
      const order = orders.find(o => o.id === patchMatch[1]);
      if (!order) return sendJSON(res, 404, { error: 'not found' });
      if (body && body.status) order.status = body.status;
      saveOrders(orders);
      sendJSON(res, 200, { ok: true, status: order.status });
    });
  }

  if (req.method === 'DELETE' && patchMatch) {
    if (!requireAuthOr401(req, res)) return;
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === patchMatch[1]);
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

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Hatch running at http://localhost:' + PORT);
  console.log('Admin at http://localhost:' + PORT + '/admin (user: ' + ADMIN_USER + ')');
});
