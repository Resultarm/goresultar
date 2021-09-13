import React, { useState, useMemo, useEffect } from "react";
import { Form, Input, Button, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAPI } from "shared/hooks";
import { navigate } from "@reach/router";
import "./styles.scss";

const logoUrl = "/logo.png";

function useLogin() {
  const [payload, setPayload] = useState(undefined);
  const args = useMemo(
    () => [
      payload ? "/api/v1/login" : undefined,
      payload ? { method: "POST", body: JSON.stringify(payload) } : undefined,
    ],
    [payload]
  );
  const { data: { token } = {}, status } = useAPI(...args);

  return { token, status, login: setPayload };
}

function Login({ onLogin }) {
  const { token, status, login } = useLogin();

  const handleFormSubmit = (b) => {
    if (b.currentTarget) return;
    login(b);
  };

  useEffect(() => {
    if (status.isSuccess) {
      onLogin(token);
    } else if (status.isError && status.statusCode !== 401) {
      message.error(status.message);
    }
  }, [status, onLogin, token]);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <div className="login-page">
      <Form
        className="login-form white-bg"
        initialValues={{ remember: true }}
        onFinish={handleFormSubmit}
        autoComplete="off"
      >
        <div
          className="logo-wrapper"
          style={{ backgroundImage: `url(${logoUrl})` }}
        ></div>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Input your username" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            size="large"
            autoFocus
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Input your password" }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
            size="large"
          />
        </Form.Item>
        <Alert
          style={{
            visibility:
              status.isError && status.statusCode === 401
                ? "visible"
                : "hidden",
            marginBottom: 16,
          }}
          message="Invalid username or password"
          type="error"
        />

        <Form.Item style={{ textAlign: "right" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={status.isLoading}
            size="large"
            block
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
