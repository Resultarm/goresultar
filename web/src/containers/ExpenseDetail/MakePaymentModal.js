import React from "react";
import { Col, Form, Modal, Row, Upload, Button, Select, Input } from "antd";
import { useNewCheques } from "src/hooks";

import currencyFormatterPrefix from "src/helpers/currencyFormatterPrefix";
import { useMemo } from "react";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";

const ruleRequired = { required: true };
const validations = {
  method: [ruleRequired],
  amount: [ruleRequired, { min: 1, type: "number" }],
};

const imageFromEvent = ({ fileList }) => {
  const file = fileList.slice(-1)[0];
  if (file?.status === "removed") {
    return fileList.slice(0, -1);
  }

  if (file?.response?.message) {
    file.uid = file?.response?.message;
    file.url = file?.response?.message;
    file.name = file?.response?.message;
  }
  return fileList;
};

function MakePaymentModal({ okText, onClose, onSave, initialValues }) {
  const { t } = useTranslation(["translation"]);
  const [form] = Form.useForm();
  const [cheques, chequesStatus] = useNewCheques();
  const handleSubmit = (payload) => {
    onSave({
      ...payload,
      chequeIds: payload.chequeIds,
    });
  };

  const chequeAmountValidator = (rule, value) => {
    const chequeTotal = cheques.reduce((acc, c) => (value.includes(c._id) ? acc + c.amount : acc + 0), 0);
    const amount = form.getFieldValue("amount");
    if (amount > chequeTotal) {
      return Promise.reject("");
    }
    return Promise.resolve();
  };

  const chequeOptions = cheques.map(({ _id, no, amount }) => ({
    label: `${no} (${currencyFormatterPrefix.format(amount)})`,
    value: _id,
  }));

  const denormInitialValues = useMemo(() => {
    return {
      amount: initialValues?.amount,
    };
  }, [initialValues]);

  return (
    <Modal
      title={okText}
      onClose={onClose}
      visible
      okText={okText}
      okButtonProps={{
        form: "make-payment-modal",
        htmlType: "submit",
      }}
      onCancel={onClose}
      width={800}
      maskClosable={false}
      keyboard={false}
    >
      <Form layout="vertical" id="make-payment-modal" onFinish={handleSubmit} initialValues={denormInitialValues} form={form}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label={t("Amount")}
              name="amount"
              rules={validations.amount}
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.floatValue}
            >
              <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t("Method of Payment")} name="method" rules={validations.method}>
              <Select>
                <Select.Option value="cheque">{t("Cheque")}</Select.Option>
                <Select.Option value="cash">{t("Cash")}</Select.Option>
                <Select.Option value="credit card">{t("Credit Card")}</Select.Option>
                <Select.Option value="debit card">{t("Debit Card")}</Select.Option>
                <Select.Option value="boleto">{t("Boleto")}</Select.Option>
                <Select.Option value="deposit">{t("Deposit")}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item dependencies={["method", "amount"]} noStyle>
              {({ getFieldValue }) => (
                <Form.Item
                  label={t("Cheques")}
                  name="chequeIds"
                  rules={
                    getFieldValue("method") === "cheque"
                      ? [
                          {
                            validator: chequeAmountValidator,
                            message: t("cheque total should be >= expense amount"),
                          },
                        ]
                      : undefined
                  }
                >
                  <Select
                    mode="multiple"
                    options={chequeOptions}
                    loading={chequesStatus.isLoading}
                    disabled={getFieldValue("method") !== "cheque"}
                    allowClear
                  ></Select>
                </Form.Item>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label={t("Receipt")}
              name="receipts"
              getValueFromEvent={imageFromEvent}
              valuePropName="fileList"
              shouldUpdate
            >
              <Upload
                action="/api/assets/upload?entity=expense"
                accept="image/*"
                headers={{
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                }}
              >
                <Button size="small">{t("upload")}</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t("Invoice")}
              name="invoices"
              getValueFromEvent={imageFromEvent}
              valuePropName="fileList"
              shouldUpdate
            >
              <Upload
                action="/api/assets/upload?entity=expense"
                accept="image/*"
                headers={{
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                }}
              >
                <Button size="small">{t("upload")}</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default MakePaymentModal;
