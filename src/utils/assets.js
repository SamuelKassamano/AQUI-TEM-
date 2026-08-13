export function getAssetUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') {
    if (typeof path === 'object' && path !== null) {
      if (typeof path.url === 'string') return getAssetUrl(path.url);
      if (typeof path.remoteUrl === 'string') return getAssetUrl(path.remoteUrl);
    }
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
