import React from "react";
import { Row, Col, Input, Radio, Form, Modal, ConfigProvider, DatePicker } from "antd";
import { Select } from "src/components";
import moment from "moment";
import { InputNumberFmtd } from "src/components";
import currencyFormatterPrefix from "../../helpers/currencyFormatterPrefix";

import { useDepartmentsWithProfits } from "src/hooks";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { EXPENSE_FREQUENCY_OPTIONS, EXPENSE_FREQUENCY, EXPENSE_TYPE_OPTIONS } from "./constants";

const TextArea = Input.TextArea;

const ruleRequired = { required: true };

const validations = {
  name: [ruleRequired],
  type: [ruleRequired],
  frequency: [ruleRequired],
  issueDate: [ruleRequired],
  dueDate: [ruleRequired],
  moneySource: [ruleRequired],
  paymentMethod: [ruleRequired],
  amount: [ruleRequired],
  lateFee: [ruleRequired],
  receiptUrl: [ruleRequired],
  invoiceUrl: [ruleRequired],
  numTimes: [{ min: 1, type: "number" }],
  fixedAmount: [ruleRequired, { min: 1, type: "number" }],
  variableAmount: [{ min: 1, type: "number" }],
};

const defaultValues = {
  frequency: EXPENSE_FREQUENCY.monthly,
  type: "utility",
  receipt: [],
  invoice: [],
  fixed: true,
  chequeIds: [],
};

const imageUrlToImage = (url) => {
  return {
    url: url,
    name: url,
    status: "done",
    uid: url,
  };
};

function ExpenseAddModal({ onClose, okText, okButtonProps, onSave, initialValues }) {
  const { t } = useTranslation(["translation"]);
  const [form] = Form.useForm();
  const [departments = [], departmentsStatus] = useDepartmentsWithProfits(initialValues?.organizationId);

  const handleSubmit = (payload) => {
    onSave({
      ...payload,
      numTimes: Number(payload.numTimes),
      moneySourceId: payload.moneySourceId || undefined,
      issueDate: payload.issueDate.unix(),
      dueDate: payload.dueDate.unix(),
      amount: payload.amount,
      lateFee: payload.lateFee,
    });
  };

  const denormalizedInitialValues = initialValues
    ? {
        ...initialValues,
        amount: initialValues.amount,
        lateFee: initialValues.lateFee || 0,
        issueDate: initialValues.issueDate ? moment(initialValues.issueDate * 1000) : undefined, // create expense from wood calc don't have dates
        dueDate: initialValues.dueDate ? moment(initialValues.dueDate * 1000) : undefined,
        receipts: (initialValues.receipts || []).map(({ url }) => imageUrlToImage(url)),
        invoices: (initialValues.invoices || []).map(({ url }) => imageUrlToImage(url)),
      }
    : defaultValues;

  const departmentOptions = departments
    .filter(({ profit }) => profit > 0)
    .map((d) => ({
      label: `${d.title} (${currencyFormatterPrefix.format(d.profit)})`,
      value: d._id,
    }));

  return (
    <ConfigProvider componentSize="middle">
      <Modal
        title={okText}
        onClose={onClose}
        visible
        okText={okText}
        okButtonProps={{
          form: "expense-add-modal",
          htmlType: "submit",
          ...okButtonProps,
        }}
        onCancel={onClose}
        width={1024}
        maskClosable={false}
        keyboard={false}
      >
        <Form
          layout="vertical"
          id="expense-add-modal"
          form={form}
          initialValues={denormalizedInitialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={t("Title")} name="name" rules={validations.name}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label={t("Type")} name="type" rules={validations.type}>
                <Select options={EXPENSE_TYPE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={t("Frequency")} name="frequency" rules={validations.frequency}>
                <Radio.Group options={EXPENSE_FREQUENCY_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <Form.Item
                    label="⠀"
                    name="numTimes"
                    rules={validations.numTimes}
                    trigger="onValueChange"
                    getValueFromEvent={(vs) => vs.floatValue}
                  >
                    <NumberFormat
                      customInput={(props) => <Input {...props} suffix="times" />}
                      thousandSeparator="."
                      decimalSeparator=","
                      disabled={getFieldValue("frequency") !== "custom"}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={9}>
              <Form.Item label={t("Source of Money")} name="moneySourceId">
                <Select options={departmentOptions} loading={departmentsStatus.isLoading} allowClear></Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label={t("Issue Date")} name="issueDate" rules={validations.issueDate}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label={t("Due Date")} name="dueDate" rules={validations.dueDate}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <Form.Item label={t("Fixed or Variable")} name="fixed" rules={validations.fixed}>
                    <Radio.Group disabled={getFieldValue("numTimes") === "1" && getFieldValue("frequency") === "custom"}>
                      <Radio.Button value={true}>{t("Fixed")}</Radio.Button>
                      <Radio.Button value={false}>{t("Variable")}</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item dependencies={["fixed"]} noStyle>
                {({ getFieldValue }) => (
                  <Form.Item
                    label={t("Amount (single time)")}
                    name="amount"
                    rules={getFieldValue("fixed") ? validations.fixedAmount : validations.variableAmount}
                    trigger="onValueChange"
                    getValueFromEvent={(vs) => vs.floatValue || 0}
                  >
                    <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label={t("Late Fee")} name="lateFee">
                <InputNumberFmtd />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={t("Description")}>
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}

export default ExpenseAddModal;
