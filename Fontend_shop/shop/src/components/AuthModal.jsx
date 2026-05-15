import { Modal, Form, Input, Button } from 'antd';
import './AuthModal.css';

export function AuthModal({ mode, onClose, onAuth }) {
  const isLogin = mode === 'login';
  const title = isLogin ? 'Đăng nhập' : 'Đăng ký';
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    const { email, password, name } = values;
    if (!email || !password) return;
    onAuth({ email, password, name });
  };

  return (
    <Modal
      title={<h2 style={{ margin: 0, color: '#00a650', textAlign: 'center' }}>{title}</h2>}
      open={true}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      style={{ borderRadius: '12px' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        size="large"
        style={{ marginTop: '24px' }}
      >
        {!isLogin && (
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>
        )}

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="email@domain.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 500 }}>Mật khẩu</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password placeholder="Tối thiểu 6 ký tự" />
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            style={{ background: '#00a650', height: '48px', fontSize: '16px', fontWeight: 'bold' }}
          >
            {title}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
