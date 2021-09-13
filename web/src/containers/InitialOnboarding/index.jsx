import React from "react";
import { Form, Input, Button, message } from "antd";
import NumberFormat from "react-number-format";
import { useAPI } from "src/helpers/useFetch";
import { useEffect } from "react";
import { navigate } from "@reach/router";
import { useState } from "react";
import { useMemo } from "react";
import "./styles.scss";

const ruleRequired = { required: true };

const validations = {
  name: [ruleRequired],
  password: [ruleRequired],
  phoneNumber: [ruleRequired, { len: 11 }],
  email: [ruleRequired, { type: "email" }],
};

function useOnboard() {
  const [payload, setPayload] = useState();
  const args = useMemo(() => (payload ? ["/api/onboard", { method: "POST", body: JSON.stringify(payload) }] : []), [payload]);
  const [{ onboarded } = {}, status] = useAPI(...args);
  return { onboarded, onboard: setPayload, status };
}

function InitialOnboarding({ setOnboarded }) {
  const [{ onboarded } = {}] = useAPI("/api/check-onboarded");
  const { onboarded: onboardedNew, onboard, status: onboardStatus } = useOnboard();

  useEffect(() => {
    if (onboarded) {
      setOnboarded(true);
    }
  }, [onboarded]);

  useEffect(() => {
    if (onboardedNew) {
      setOnboarded(true);
    }
  }, [onboardedNew]);

  useEffect(() => {
    if (onboardStatus.isError) {
      message.error(onboardStatus.message || "failed to onboard");
    }
    if (onboardStatus.isSuccess) {
      message.success("super admin onboarded successfully");
      navigate("/login");
    }
  }, [onboardStatus]);

  return (
    <div className="onboard-form-container">
      <Form className="onboard-form" id="onboard-form" layout="vertical" size="large" onFinish={onboard}>
        <Form.Item label="Super Admin Name" name="firstName" rules={validations.name}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={validations.email}>
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={validations.password}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Phone No"
          name="landlineNumber"
          trigger="onValueChange"
          getValueFromEvent={(vs) => vs.value}
          rules={validations.phoneNumber}
        >
          <NumberFormat customInput={Input} format="(##) ##### - ####" placeholder="(00) 00000 - 0000" />
        </Form.Item>
        <div className="text-right">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default InitialOnboarding;
