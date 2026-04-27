const pool = require('../config/db');

const getIpAddress = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getDeviceName = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  const browser =
    ua.includes('edg/') ? 'Edge' :
    ua.includes('chrome/') ? 'Chrome' :
    ua.includes('firefox/') ? 'Firefox' :
    ua.includes('safari/') ? 'Safari' :
    ua.includes('opr/') ? 'Opera' : 'Navigateur';

  const os =
    ua.includes('windows') ? 'Windows' :
    ua.includes('mac os') || ua.includes('macintosh') ? 'macOS' :
    ua.includes('android') ? 'Android' :
    ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios') ? 'iOS' :
    ua.includes('linux') ? 'Linux' : 'Système';

  return `${browser} sur ${os}`;
};

const getSessionKey = (req) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ipAddress = getIpAddress(req);
  const userPart = req.user?.id || 'anon';
  return `${userPart}:${ipAddress}:${userAgent}`;
};

const persistSession = async (req, { userId = null, increment = true } = {}) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ipAddress = getIpAddress(req);
  const sessionKey = getSessionKey(req);
  const deviceName = getDeviceName(userAgent);

  if (increment) {
    await pool.query(
      `INSERT INTO analytics_sessions (
        session_key, user_id, ip_address, user_agent, device_name, last_path, last_method, is_authenticated
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (session_key) DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, analytics_sessions.user_id),
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent,
        device_name = EXCLUDED.device_name,
        last_path = EXCLUDED.last_path,
        last_method = EXCLUDED.last_method,
        is_authenticated = analytics_sessions.is_authenticated OR EXCLUDED.is_authenticated,
        request_count = analytics_sessions.request_count + 1,
        last_seen_at = NOW()`,
      [
        sessionKey,
        userId,
        ipAddress,
        userAgent,
        deviceName,
        req.originalUrl || req.url || '/',
        req.method || 'GET',
        Boolean(userId),
      ]
    );
    return;
  }

  await pool.query(
    `INSERT INTO analytics_sessions (
      session_key, user_id, ip_address, user_agent, device_name, last_path, last_method, is_authenticated
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (session_key) DO UPDATE SET
      user_id = COALESCE(EXCLUDED.user_id, analytics_sessions.user_id),
      ip_address = EXCLUDED.ip_address,
      user_agent = EXCLUDED.user_agent,
      device_name = EXCLUDED.device_name,
      last_path = EXCLUDED.last_path,
      last_method = EXCLUDED.last_method,
      is_authenticated = analytics_sessions.is_authenticated OR EXCLUDED.is_authenticated,
      last_seen_at = NOW()`,
    [
      sessionKey,
      userId,
      ipAddress,
      userAgent,
      deviceName,
      req.originalUrl || req.url || '/',
      req.method || 'GET',
      Boolean(userId),
    ]
  );
};

const trackVisitor = (req, res, next) => {
  if (req.originalUrl === '/api/health') return next();

  res.on('finish', () => {
    persistSession(req).catch(() => {});
  });

  return next();
};

const trackAuthenticatedSession = async (req) => {
  await persistSession(req, { userId: req.user?.id, increment: false });
};

module.exports = {
  trackVisitor,
  trackAuthenticatedSession,
  getIpAddress,
  getDeviceName,
};
