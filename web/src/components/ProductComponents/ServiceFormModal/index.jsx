import React, { useContext } from "react";
import { Alert, Col, Form, Input, Modal, Row, Select, Radio } from "antd";
import NumberFormat from "react-number-format";
import { useProduct, useDepartmentOptions, useCategoryOptionsAntdv2, useSubCategoryOptionsAntdv2 } from "src/hooks";
import { useEffect } from "react";
import { OrganizationContext } from "src/contexts";
import { useTranslation } from "react-i18next";

const ruleRequired = { required: true };

const braillePatternBlank = "⠀";

const validations = {
  name: [ruleRequired],
  status: [ruleRequired],
  price: [ruleRequired],
  departmentId: [ruleRequired],
  categoryId: [ruleRequired],
  subcategoryId: [ruleRequired],
  chargeDuration: [ruleRequired],
};

function ServiceFormModal({ onClose, okText, okButtonProps, afterSave, initialValue }) {
  const { t } = useTranslation(["translation"]);
  const { save, status } = useProduct(initialValue?._id);
  const organizationId = useContext(OrganizationContext);
  const { options: departmentOptions } = useDepartmentOptions(organizationId);
  const { options: categoryOptions } = useCategoryOptionsAntdv2(organizationId);
  const { options: subcategoryOptions } = useSubCategoryOptionsAntdv2(organizationId);
  const handleSubmit = (formValues) => {
    const payload = {
      isService: true,
      ...formValues,
    };

    save(payload, initialValue?._id);
  };

  useEffect(() => {
    if (status.isSuccess) {
      onClose();
      afterSave();
    }
  }, [status, afterSave]);

  return (
    <Modal
      visible
      onCancel={onClose}
      title={okText}
      onClose={onClose}
      okText={okText}
      okButtonProps={{
        form: "service-add-modal",
        htmlType: "submit",
        ...okButtonProps,
      }}
      width={800}
    >
      <Form layout="vertical" id="service-add-modal" initialValues={initialValue} onFinish={handleSubmit}>
        <Form.Item label={t("Name")} name="title" rules={validations.name}>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={t("Price")}
              name="price"
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.floatValue}
              rules={validations.price}
            >
              <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t("Cost")}
              name="cost"
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.floatValue}
              rules={validations.cost}
            >
              <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="chargeDuration" label={braillePatternBlank} rules={validations.chargeDuration}>
              <Radio.Group>
                <Radio.Button value="day">{t("Per day")}</Radio.Button>
                <Radio.Button value="hour">{t("Per hour")}</Radio.Button>
                <Radio.Button value="fixed">{t("Fixed")}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t("Department")} name="departmentId" rules={validations.departmentId}>
              <Select options={departmentOptions} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item dependencies={["departmentId"]} noStyle>
              {({ getFieldValue }) => (
                <Form.Item label={t("Category")} name="categoryId">
                  <Select
                    options={categoryOptions.filter(({ departmentId }) => departmentId === getFieldValue("departmentId"))}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item dependencies={["categoryId"]} noStyle>
              {({ getFieldValue }) => (
                <Form.Item label={t("Sub Category")} name="subcategoryId">
                  <Select options={subcategoryOptions.filter(({ categoryId }) => getFieldValue("categoryId") === categoryId)} />
                </Form.Item>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t("Description")} name="description" rules={validations.description}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
      {status.isError && <Alert message={status.message} type="error" />}
    </Modal>
  );
}

export default ServiceFormModal;
