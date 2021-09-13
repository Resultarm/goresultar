import React, { useMemo } from "react";
import { Row, Col, Input, Radio, Form, Modal, Upload, ConfigProvider, DatePicker } from "antd";
import moment from "moment";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import { translateRules } from "src/helpers";

const ruleRequired = { required: true };

const ruleAllowOnlyDigits = {
  pattern: `[0-9]+`,
  message: "only digits allowed",
};

const normalizeAgencyNo = (e) => {
  const value = e.target.value.slice(0, 6);

  if (!/^([0-9]{1,5}|[0-9]{1,4}([-]{1}[0-9]{0,1})?)$/.test(value)) return "";

  return value.length > 4 && !value.endsWith("-") ? value.substr(0, 4) + "-" + value.substr(-1) : value;
};

const normalizeAccountNo = (e) => {
  const value = e.target.value.slice(0, 10);

  if (!/^([0-9]{1,9}|[0-9]{1,8}([-]{1}[0-9]{0,1})?)$/.test(value)) return "";

  return value.length > 8 && !value.endsWith("-") ? value.substr(0, 8) + "-" + value.substr(-1) : value;
};

const rules = {
  agencyNo: [
    ruleRequired,
    {
      pattern: `^[0-9]{4}(-[0-9]{1})?$`,
      message: "Should be XXXX or XXXX-X",
    },
    { max: 4 + 2 },
  ],
  no: [ruleRequired, ruleAllowOnlyDigits, { max: 6 }],
  accountNo: [
    ruleRequired,
    {
      pattern: `^[0-9]{8}(-[0-9]{1})?$`,
      message: "Should be XXXXXXXX or XXXXXXXX-X",
    },
    { max: 8 + 2 },
  ],
  date: [ruleRequired],
  holder: [ruleRequired],
  to: [ruleRequired],
  destinationName: [ruleRequired],
  destinationBank: [ruleAllowOnlyDigits, { max: 4 }],
  destinationDate: [ruleRequired],
  depositMode: [ruleRequired],
  amount: [ruleRequired],
};

const defaultValues = {
  depositMode: "cash",
  accountType: "personal",
  frontImage: [],
  backImage: [],
};

const imageUrlToImage = (url) => {
  return {
    url: url,
    name: url,
    status: "done",
    uid: url,
  };
};

const imageFromEvent = ({ file }) => {
  if (file.status === "removed") {
    return [];
  }
  if (file?.response?.message) {
    file.uid = file?.response?.message;
    file.url = file?.response?.message;
  }
  return [file];
};

function ChequeAddModal({ onClose, okText, okButtonProps, onSave, initialValues }) {
  const { t } = useTranslation(["translation"]);
  const [form] = Form.useForm();

  const translatedRules = useMemo(() => translateRules(t, rules), [t]);

  const handleSubmit = (payload) => {
    onSave({
      ...initialValues,
      ...payload,
      date: payload.date.unix(),
      destinationDate: payload.destinationDate.unix(),
      frontImageUrl: payload.frontImage[0]?.uid,
      backImageUrl: payload.backImage[0]?.uid,
    });
  };

  const denormalizedInitialValues = initialValues
    ? {
        ...initialValues,
        date: moment(initialValues.date * 1000),
        destinationDate: moment(initialValues.destinationDate * 1000),
        frontImage: initialValues.frontImageUrl ? [imageUrlToImage(initialValues.frontImageUrl)] : [],
        backImage: initialValues.backImageUrl ? [imageUrlToImage(initialValues.backImageUrl)] : [],
      }
    : defaultValues;

  return (
    <ConfigProvider>
      <Modal
        title={okText}
        onClose={onClose}
        visible
        okText={okText}
        okButtonProps={{
          form: "cheque-add-modal",
          htmlType: "submit",
          ...okButtonProps,
        }}
        onCancel={onClose}
        width={800}
        maskClosable={false}
        keyboard={false}
      >
        <Form
          layout="vertical"
          id="cheque-add-modal"
          form={form}
          initialValues={denormalizedInitialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label={t("Cheque No")} name="no" rules={translatedRules.no}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("Agency No")}
                name="agencyNo"
                getValueFromEvent={normalizeAgencyNo}
                rules={translatedRules.agencyNo}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t("Account No")}
                name="accountNo"
                rules={translatedRules.accountNo}
                getValueFromEvent={normalizeAccountNo}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label={t("Cheque Date")} name="date" rules={translatedRules.date}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t("Amount")}
                name="amount"
                rules={translatedRules.amount}
                trigger="onValueChange"
                getValueFromEvent={(vs) => vs.floatValue}
              >
                <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("Holder")} name="holder" rules={translatedRules.holder}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("To")} name="to" rules={translatedRules.to}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label={t("Destination Bank Number")} name="destinationBank" rules={translatedRules.destinationBank}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t("Destination Name (Beneficiary)")}
                name="destinationName"
                rules={translatedRules.destinationName}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={t("Destination Date")} name="destinationDate" rules={translatedRules.destinationDate}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item name="depositMode" rules={translatedRules.depositMode}>
                <Radio.Group>
                  <Radio value="cash">{t("Cash")}</Radio>
                  <Radio value="deposit">{t("Deposit")}</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accountType">
                <Radio.Group>
                  <Radio value="personal">{t("Personal")}</Radio>
                  <Radio value="business">{t("Business")}</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label={t("Front Image")}
                name="frontImage"
                rules={translatedRules.frontImageUrl}
                getValueFromEvent={imageFromEvent}
                valuePropName="fileList"
                shouldUpdate
                help={t("only images (jpeg, png etc..) allowed")}
              >
                <Upload
                  action="/assets/upload?entity=cheque"
                  accept="image/*"
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                  listType="picture-card"
                >
                  {t("upload")}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("Back Image")}
                name="backImage"
                rules={translatedRules.backImageUrl}
                getValueFromEvent={imageFromEvent}
                valuePropName="fileList"
                shouldUpdate
                help={t("only images (jpeg, png etc..) allowed")}
              >
                <Upload
                  action="/assets/upload?entity=cheque"
                  accept="image/*"
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                  listType="picture-card"
                >
                  {t("upload")}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}

export default ChequeAddModal;
