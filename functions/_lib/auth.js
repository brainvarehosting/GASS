// Session auth using HMAC-signed cookies (no JWT lib, just Web Crypto).
// Single-admin model: a request is "authenticated" if the cookie's HMAC
// matches and its issued-at timestamp is within MAX_AGE_MS.

const COOKIE_NAME = 'gasf_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_AGE_S = Math.floor(MAX_AGE_MS / 1000);

const enc = new TextEncoder();

function b64urlEncode(bytes) {
  let s = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64urlEncode(sig);
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function hashPassword(password, saltHex) {
  const salt = saltHex ? b64urlDecode(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256
  );
  return `${b64urlEncode(salt)}.${b64urlEncode(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes('.')) return false;
  const [saltB64] = stored.split('.');
  const salt = b64urlDecode(saltB64);
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256
  );
  const candidate = `${saltB64}.${b64urlEncode(bits)}`;
  return constantTimeEqual(candidate, stored);
}

export async function signSession(secret, payload = {}) {
  const body = { ...payload, iat: Date.now() };
  const data = b64urlEncode(enc.encode(JSON.stringify(body)));
  const sig = await hmac(secret, data);
  return `${data}.${sig}`;
}

export async function verifySession(secret, token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = await hmac(secret, data);
  if (!constantTimeEqual(sig, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data)));
  } catch {
    return null;
  }
  if (typeof payload.iat !== 'number' || Date.now() - payload.iat > MAX_AGE_MS) return null;
  return payload;
}

export function readCookie(request, name = COOKIE_NAME) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function setSessionCookie(token) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_S}`,
  ].join('; ');
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function requireSession(env, request) {
  const token = readCookie(request);
  if (!token) return null;
  const secret = env.SESSION_SECRET;
  if (!secret) return null;
  return await verifySession(secret, token);
}
