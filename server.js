const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'orders.json');
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

  if (req.method === 'POST' && pathname === '/api/orders') {
    return readBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'invalid json' });
      const { items, total, subtotal, gst, orderType, customerName, customerPhone, tableNumber, deliveryAddress } = body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return sendJSON(res, 400, { error: 'items required' });
      }
      const order = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        items,
        subtotal: Number(subtotal) || 0,
        gst: Number(gst) || 0,
        total: Number(total) || 0,
        status: 'new',
        orderType: ['dine-in', 'takeaway', 'delivery'].includes(orderType) ? orderType : 'dine-in',
        customerName: clean(customerName, 80),
        customerPhone: clean(customerPhone, 20),
        tableNumber: clean(tableNumber, 20),
        deliveryAddress: clean(deliveryAddress, 300)
      };
      const orders = loadOrders();
      orders.push(order);
      saveOrders(orders);
      sendJSON(res, 200, { ok: true, id: order.id });
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
      sendJSON(res, 200, { ok: true });
    });
  }


  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Hatch running at http://localhost:' + PORT);
  console.log('Admin at http://localhost:' + PORT + '/admin (user: ' + ADMIN_USER + ')');
});
