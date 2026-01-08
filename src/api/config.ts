// Subdomains для разных API
export const SUBDOMAINS = {
  AUTH: 'toko', // для авторизации
  PRODUCTS: 'toko', // для получения товаров
} as const;

export const API_CONFIG = {
  getAuthUrl: () => `https://${SUBDOMAINS.AUTH}.ox-sys.com`,
  getProductsUrl: () => `https://${SUBDOMAINS.PRODUCTS}.ox-sys.com`,
  ENDPOINTS: {
    AUTH: '/security/auth_check',
    VARIATIONS: '/variations',
  },
  SUBDOMAIN: SUBDOMAINS.AUTH, // для совместимости
} as const;
