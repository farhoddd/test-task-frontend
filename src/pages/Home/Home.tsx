import { LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../api';
import { getProducts } from '../../api';
import { deleteCookie, getCookie } from '../../utils';
import styles from './Home.module.scss';

const { Title } = Typography;

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Фильтрация и сортировка по позиции вхождения поискового запроса
  const filteredProducts = useMemo(() => {
    if (!deferredQuery.trim()) {
      return products;
    }

    const query = deferredQuery.toLowerCase();

    return products
      .filter((product) => product.name?.toLowerCase().includes(query))
      .sort((a, b) => {
        const posA = a.name?.toLowerCase().indexOf(query) ?? Infinity;
        const posB = b.name?.toLowerCase().indexOf(query) ?? Infinity;
        // Сначала сортируем по позиции вхождения
        if (posA !== posB) {
          return posA - posB;
        }
        // При равных позициях — по алфавиту
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
  }, [products, deferredQuery]);

  const isSearching = searchQuery !== deferredQuery;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProducts(); // без параметров — получить все
      setProducts(response.items);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error instanceof Error && error.message === 'Сессия истекла') {
        message.error('Сессия истекла. Войдите заново.');
        deleteCookie('token');
        navigate('/login', { replace: true });
      } else {
        message.error('Ошибка загрузки товаров');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchProducts();
  }, [navigate, fetchProducts]);

  function handleLogout() {
    deleteCookie('token');
    navigate('/login', { replace: true });
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: 'Штрихкод',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 150,
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) =>
        price != null ? `${price.toLocaleString()} ₽` : '—',
    },
  ];

  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <div className={styles.logo}>Dashboard</div>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Главная
          </Link>
          <Link to="/products" className={styles.navLink}>
            Товары с пагинацией
          </Link>
        </nav>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
          Выйти
        </Button>
      </header>

      <main className={styles.content}>
        <Title level={3} className={styles.pageTitle}>
          Товары ({deferredQuery ? filteredProducts.length : totalCount})
        </Title>

        <div className={styles.searchWrapper}>
          <Input
            placeholder="Поиск по названию товара..."
            prefix={<SearchOutlined className={styles.searchIcon} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            size="large"
            className={styles.searchInput}
          />
        </div>

        <Card className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              loading={loading || isSearching}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
      </main>
    </div>
  );
}

export default Home;
