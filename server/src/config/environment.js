const isProduction = process.env.NODE_ENV === 'production';

export function assertProductionEnvironment() {
  if (!isProduction) return;

  const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const missing = required.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  const secret = String(process.env.JWT_SECRET || '');
  if (secret.length < 32 || /replace_with|change_me|your_secret/i.test(secret)) {
    throw new Error('JWT_SECRET must be a unique, randomly generated secret of at least 32 characters in production.');
  }

  const origins = String(process.env.CLIENT_URL)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const invalidOrigins = origins.filter((origin) => {
    try {
      const parsed = new URL(origin);
      return !['https:', 'http:'].includes(parsed.protocol) ||
        parsed.origin !== origin ||
        (parsed.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsed.hostname));
    } catch {
      return true;
    }
  });

  if (invalidOrigins.length) {
    throw new Error('CLIENT_URL must contain comma-separated valid frontend origins; use HTTPS for public production domains.');
  }
}

export function getAllowedOrigins() {
  const configured = String(process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    for (const localOrigin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
      if (!configured.includes(localOrigin)) configured.push(localOrigin);
    }
  }

  return configured;
}
