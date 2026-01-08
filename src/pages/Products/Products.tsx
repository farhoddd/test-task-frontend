import { LogoutOutlined } from '@ant-design/icons';
import { Button, Card, message, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../api';
import { getProducts } from '../../api';
import { deleteCookie, getCookie } from '../../utils';
import styles from './Products.module.scss';

const { Title } = Typography;

const PAGE_SIZE = 20;

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      try {
        // page в API начинается с 1
        const response = await getProducts({ page, size });
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
    },
    [navigate]
  );

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchProducts(currentPage, PAGE_SIZE);
  }, [navigate, currentPage, fetchProducts]);

  function handleLogout() {
    deleteCookie('token');
    navigate('/login', { replace: true });
  }

  function handleTableChange(pagination: TablePaginationConfig) {
    if (pagination.current) {
      setCurrentPage(pagination.current);
    }
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
    <div className={styles.productsPage}>
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
          Товары
        </Title>
        <Card className={styles.tableCard}>
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: PAGE_SIZE,
              total: totalCount,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} из ${total} товаров`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
          />
        </Card>
      </main>
    </div>
  );
}

export default Products;
