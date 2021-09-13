import React, { useEffect, useState } from "react";
import { Alert, Col, Form, Input, message, Radio, Row } from "antd";
import { FormModal } from "src/components";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { braillePatternBlank, ruleRequired, translateFormRules } from "src/helpers";

import { useClient } from "src/hooks";
import { InputNumberFmtd } from "src/components";

const formRules = {
  firstName: [ruleRequired],
  lastName: [ruleRequired],
  email: [ruleRequired],
  address: [ruleRequired],
  cpf: [{ type: "string", len: 11 }],
  cnpj: [{ type: "string", len: 14 }],
  zipCode: [ruleRequired, { type: "string", len: 8 }],
};

const addressPlaceholder = `Sr. Luis Carvalho
Boulevard das Flores 255
SALVADOR-BA
BRAZIL
`;

const defaultValue = {
  costContribution: [{ name: "cost", value: 0 }],
  profitInPercentage: false,
  identificationType: "pf",
  unitType: "unit",
  images: [],
};

function ClientFormModal({ onClose, afterSave, okText, initialValue }) {
  const { t } = useTranslation(["translation"]);
  const rules = translateFormRules(t, formRules);

  const { insertedId, save, status: saveStatus } = useClient();
  const [form] = Form.useForm();

  const confirmPasswordValidator = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!getFieldValue("password") || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(t("passwords do not match")));
    },
  });

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      // lets not save  identificationType if user not provided identificationNumber
      identificationType: values.identificationNumber ? values.identificationType : undefined,
    };
    save(payload, initialValue?._id);
  };

  useEffect(() => {
    if (saveStatus.isSuccess) {
      message.success(saveStatus.message);
      afterSave(insertedId);
    }
  }, [saveStatus, insertedId]);

  const denormInitValue = initialValue
    ? {
        ...defaultValue,
        ...initialValue,
        identificationType: initialValue.identificationType || "pf",
      }
    : defaultValue;

  return (
    <FormModal
      formID="client-add-modal"
      onClose={onClose}
      okText={okText}
      submitButtonProps={{ loading: saveStatus.isLoading }}
      width={800}
      organizationId={denormInitValue?.organizationId}
    >
      <Form
        form={form}
        layout="vertical"
        id="client-add-modal"
        initialValues={denormInitValue}
        onFinish={handleSubmit}
        validateTrigger="onFinish"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="firstName" label={t("First Name")} rules={rules.firstName}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastName" label={t("Last Name")} rules={rules.lastName}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="address" label={t("Address")} rules={rules.address}>
          <Input.TextArea rows={5} placeholder={addressPlaceholder} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item name="identificationType" label={braillePatternBlank} rules={rules.identificationType}>
              <Radio.Group>
                <Radio.Button value="pf">{t("PF")}</Radio.Button>
                <Radio.Button value="pj">{t("PJ")}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item dependencies={["identificationType"]} noStyle>
              {({ getFieldValue }) => {
                const isCNPJ = getFieldValue("identificationType") === "pj";
                return (
                  <Form.Item
                    name="identificationNumber"
                    label={isCNPJ ? t("CNPJ") : t("CPF")}
                    rules={isCNPJ ? rules.cnpj : rules.cpf}
                  >
                    <InputNumberFmtd
                      format={isCNPJ ? "##.###.###/####-##" : "###.###.###-##"}
                      placeholder={isCNPJ ? "00.000.000/0001-00" : "000.000.000-00"}
                      valuePropName="value"
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="zipCode" label={t("Zip Code")} rules={rules.zipCode}>
              <InputNumberFmtd format="#####-###" placeholder="00000-000" valuePropName="value" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t("Email")} name="email" rules={rules.email}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t("Landline Number")}
              name="landlineNumber"
              rules={rules.landlineNumber}
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.value}
            >
              <NumberFormat customInput={Input} format="(##) ##### - ####" placeholder="(00) 00000 - 0000" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t("Mobile Number")}
              name="mobileNumber"
              rules={rules.mobileNumber}
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.value}
            >
              <NumberFormat customInput={Input} format="(##) #### - ####" placeholder="(00) 0000 - 0000" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="password" label={t("Password")} rules={rules.password}>
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="confirmPassword"
              label={t("Confirm Password")}
              dependencies={["password"]}
              rules={[confirmPasswordValidator]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {saveStatus.isError && <Alert message={saveStatus.message} type="error" />}
    </FormModal>
  );
}

export default ClientFormModal;
