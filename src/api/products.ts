import { getCookie } from '../utils';
import { API_CONFIG } from './config';

export interface Product {
  id: number;
  name: string;
  sku?: string;
  barcode?: string;
  price?: number;
  [key: string]: unknown;
}

export interface ProductsResponse {
  page: number;
  items: Product[];
  total_count: number;
}

export interface ProductsParams {
  page?: number;
  size?: number;
}

export async function getProducts(
  params: ProductsParams = {}
): Promise<ProductsResponse> {
  const token = getCookie('token');

  if (!token) {
    throw new Error('Не авторизован');
  }

  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    searchParams.set('size', String(params.size));
  }

  const queryString = searchParams.toString();
  const url = `${API_CONFIG.getProductsUrl()}${API_CONFIG.ENDPOINTS.VARIATIONS}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Сессия истекла');
    }
    throw new Error('Ошибка загрузки товаров');
  }

  return response.json();
}
