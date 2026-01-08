import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';
import { setCookie } from '../../utils';
import styles from './Login.module.scss';

const { Title } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

function Login() {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleFinish(values: LoginFormValues) {
    setLoading(true);
    try {
      const response = await login({
        username: values.username,
        password: values.password,
      });

      // Сохраняем токен в cookies (lifetime в секундах)
      setCookie('token', response.token, response.lifetime);

      message.success('Успешная авторизация!');
      navigate('/', { replace: true });
    } catch (error) {
      message.error('Ошибка авторизации. Проверьте логин и пароль.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <Card className={styles.loginCard}>
        <Title level={3} className={styles.loginTitle}>
          Вход в систему
        </Title>
        <Form
          form={form}
          name="login"
          className={styles.loginForm}
          onFinish={handleFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Имя пользователя"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.submitButton}
              loading={loading}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
