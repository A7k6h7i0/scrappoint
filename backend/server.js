import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_DIR = path.join(__dirname, 'data');
const DEFAULT_DATA_FILE = path.join(DEFAULT_DATA_DIR, 'shops.json');
const REQUESTED_DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : null;
const REQUESTED_DATA_FILE = process.env.DATA_FILE ? path.resolve(process.env.DATA_FILE) : null;
let DATA_DIR = REQUESTED_DATA_DIR || DEFAULT_DATA_DIR;
let DATA_FILE = REQUESTED_DATA_FILE || path.join(DATA_DIR, 'shops.json');
const PORT = Number(process.env.PORT || 5046);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_BODY_BYTES = 1_000_000;
const CORS_ORIGIN = (() => {
  const origin = process.env.CORS_ORIGIN?.trim();
  if (!origin || origin === '*') {
    return '*';
  }

  return origin.replace(/\/$/, '');
})();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendNoContent(res) {
  res.writeHead(204, CORS_HEADERS);
  res.end();
}

function createHttpError(statusCode, message, extra = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, extra);
  return error;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(createHttpError(413, 'Request body is too large'));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(createHttpError(400, 'Invalid JSON body'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

async function ensureDataFileAt(dataDir, dataFile) {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]\n', 'utf8');
  }
}

async function ensureDataFile() {
  const candidates = [];

  if (REQUESTED_DATA_FILE) {
    candidates.push({
      dataDir: path.dirname(REQUESTED_DATA_FILE),
      dataFile: REQUESTED_DATA_FILE,
      source: 'DATA_FILE',
    });
  } else if (REQUESTED_DATA_DIR) {
    candidates.push({
      dataDir: REQUESTED_DATA_DIR,
      dataFile: path.join(REQUESTED_DATA_DIR, 'shops.json'),
      source: 'DATA_DIR',
    });
  }

  candidates.push({
    dataDir: DEFAULT_DATA_DIR,
    dataFile: DEFAULT_DATA_FILE,
    source: 'default',
  });

  let lastError = null;

  for (const candidate of candidates) {
    try {
      await ensureDataFileAt(candidate.dataDir, candidate.dataFile);
      DATA_DIR = candidate.dataDir;
      DATA_FILE = candidate.dataFile;

      if (candidate.source !== 'default' && candidate.dataDir !== DEFAULT_DATA_DIR) {
        console.log(`Using data directory: ${DATA_DIR}`);
      } else if (candidate.source === 'default' && REQUESTED_DATA_DIR) {
        console.warn(
          `Could not use DATA_DIR=${REQUESTED_DATA_DIR}; falling back to ${DEFAULT_DATA_DIR}`,
        );
      }

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || createHttpError(500, 'Unable to initialize shop datastore');
}

async function readShops() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw createHttpError(500, 'Shop datastore is corrupted');
  }
}

async function writeShops(shops) {
  await ensureDataFile();
  const tmpFile = `${DATA_FILE}.tmp`;
  const body = `${JSON.stringify(shops, null, 2)}\n`;
  await fs.writeFile(tmpFile, body, 'utf8');
  await fs.rename(tmpFile, DATA_FILE);
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toBoolean(value, fallback = true) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

function toOptionalString(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function normalizeShopInput(input, existing = {}) {
  const source = input || {};
  const generatedId = existing.id || existing._id || source.id || source._id || crypto.randomUUID();
  const latitude = toNumber(
    source?.location?.latitude ?? source?.latitude ?? source?.lat ?? existing?.location?.latitude,
  );
  const longitude = toNumber(
    source?.location?.longitude ?? source?.longitude ?? source?.lng ?? existing?.location?.longitude,
  );

  return {
    _id: generatedId,
    id: generatedId,
    name: source.name || source.shopName || existing.name || existing.shopName || '',
    shopName: source.shopName || source.name || existing.shopName || existing.name || '',
    address: source.address || source.location?.address || existing.address || '',
    location: {
      address: source.location?.address || source.address || existing.location?.address || '',
      latitude,
      longitude,
      coordinates:
        latitude !== null && longitude !== null ? [longitude, latitude] : existing.location?.coordinates || [],
    },
    categories: source.categories || source.category || existing.categories || '',
    main_category: source.main_category || source.mainCategory || existing.main_category || '',
    featured_image: source.featured_image || source.image || existing.featured_image || null,
    website: source.website || existing.website || null,
    phone: source.phone || existing.phone || null,
    link: source.link || existing.link || null,
    description: source.description || existing.description || null,
    isOpen: toBoolean(source.isOpen, existing.isOpen ?? true),
    closesAt: source.closesAt || existing.closesAt || null,
    updatedAt: new Date().toISOString(),
    createdAt: existing.createdAt || new Date().toISOString(),
  };
}

function validateShop(shop, { requireCoordinates = true } = {}) {
  if (!shop.name || !String(shop.name).trim()) {
    throw createHttpError(400, 'Shop name is required');
  }

  if (!shop.address || !String(shop.address).trim()) {
    throw createHttpError(400, 'Shop address is required');
  }

  if (requireCoordinates && (shop.location.latitude === null || shop.location.longitude === null)) {
    throw createHttpError(400, 'Shop latitude and longitude are required');
  }

  return {
    ...shop,
    name: String(shop.name).trim(),
    shopName: String(shop.shopName || shop.name).trim(),
    address: String(shop.address).trim(),
    categories: shop.categories ? String(shop.categories).trim() : '',
    main_category: toOptionalString(shop.main_category),
    featured_image: toOptionalString(shop.featured_image),
    website: toOptionalString(shop.website),
    phone: toOptionalString(shop.phone),
    link: toOptionalString(shop.link),
    description: toOptionalString(shop.description),
    closesAt: shop.closesAt ? String(shop.closesAt).trim() : null,
  };
}

function matchesSearch(shop, search) {
  if (!search) return true;
  const haystack = [
    shop.name,
    shop.shopName,
    shop.address,
    shop.location?.address,
    shop.categories,
    shop.main_category,
    shop.query,
    shop.owner_name,
    shop.review_keywords,
    shop.place_id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function attachDistance(shop, latitude, longitude) {
  const shopLatitude = toNumber(shop.location?.latitude);
  const shopLongitude = toNumber(shop.location?.longitude);

  if (shopLatitude === null || shopLongitude === null) {
    return null;
  }

  return {
    ...shop,
    distance: calculateDistanceMeters(latitude, longitude, shopLatitude, shopLongitude),
  };
}

async function getShopList(search = '') {
  const shops = await readShops();
  return shops.filter((shop) => matchesSearch(shop, search));
}

async function getNearbyShops(latitude, longitude, radius = 3000) {
  const shops = await readShops();
  return shops
    .map((shop) => attachDistance(shop, latitude, longitude))
    .filter((shop) => shop && shop.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

async function createShops(payload) {
  const incoming = Array.isArray(payload) ? payload : [payload];
  const shops = await readShops();
  const created = [];

  for (const item of incoming) {
    const normalized = validateShop(normalizeShopInput(item));
    created.push(normalized);
    shops.unshift(normalized);
  }

  await writeShops(shops);
  return Array.isArray(payload) ? created : created[0];
}

async function deleteShopById(id) {
  const shops = await readShops();
  const nextShops = shops.filter((shop) => String(shop.id) !== String(id) && String(shop._id) !== String(id));

  if (nextShops.length === shops.length) {
    throw createHttpError(404, 'Shop not found');
  }

  await writeShops(nextShops);
}

function routeNotFound(res) {
  sendJson(res, 404, { message: 'Route not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method || 'GET';

    if (method === 'OPTIONS') {
      sendNoContent(res);
      return;
    }

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'local-shop-finder-api',
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/shops') {
      const search = url.searchParams.get('search') || url.searchParams.get('q') || '';
      const shops = await getShopList(search);
      sendJson(res, 200, shops);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/shops/nearby') {
      const latitude = toNumber(url.searchParams.get('latitude') || url.searchParams.get('lat'));
      const longitude = toNumber(url.searchParams.get('longitude') || url.searchParams.get('lng'));
      const radius = toNumber(url.searchParams.get('radius')) ?? 3000;

      if (latitude === null || longitude === null) {
        throw createHttpError(400, 'latitude and longitude are required');
      }

      const shops = await getNearbyShops(latitude, longitude, radius);
      sendJson(res, 200, shops);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/shops') {
      const body = await parseJsonBody(req);
      if (body === null) {
        throw createHttpError(400, 'Request body is required');
      }

      const created = await createShops(body);
      sendJson(res, 201, {
        message: 'Shop(s) created successfully',
        data: created,
      });
      return;
    }

    if (method === 'DELETE' && url.pathname.startsWith('/api/shops/')) {
      const id = decodeURIComponent(url.pathname.replace('/api/shops/', ''));
      if (!id) {
        throw createHttpError(400, 'Shop id is required');
      }

      await deleteShopById(id);
      sendJson(res, 200, { message: 'Shop deleted successfully' });
      return;
    }

    routeNotFound(res);
  } catch (error) {
    const statusCode = error.statusCode || error.status || 500;
    const message =
      statusCode >= 500 ? 'Internal server error' : error.message || 'Request failed';

    sendJson(res, statusCode, {
      message,
      ...(process.env.NODE_ENV !== 'production' && statusCode >= 500
        ? { detail: error.stack }
        : {}),
    });
  }
});

await ensureDataFile();

server.listen(PORT, HOST, () => {
  console.log(`Shop API listening on http://${HOST}:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
