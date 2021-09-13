import React, { useContext } from "react";
import { Alert, Col, Form, Modal, Row, DatePicker, InputNumber, Divider, Input, Card } from "antd";
import { useClientOptions, useStaffOptions, useTask, useOrderOptions, useVehicleOptions, useVehicle } from "src/hooks";
import { useEffect } from "react";
import { OrganizationContext } from "src/contexts";
import { Select } from "src/components";
import { useTranslation } from "react-i18next";
import moment from "moment";

const ruleRequired = { required: true };

const validations = {
  title: [ruleRequired],
  estConclusionDate: [ruleRequired],
  startDate: [ruleRequired],
  assigneeId: [ruleRequired],
  leaderId: [ruleRequired],
 // vehicleId: [ruleRequired],
};
function onChange(value) {
 console.log('changed', value);
}

function TaskFormModal({ onClose, okText, okButtonProps, afterSave, initialValue }) {
  const { t } = useTranslation(["translation"]);
  const { save, status } = useTask(initialValue?._id);
  const organizationId = useContext(OrganizationContext);
  const { data: userOptions } = useStaffOptions(initialValue?.organizationId || organizationId);
  const { data: orderOptions } = useOrderOptions();
  const { data: clientOptions } = useClientOptions();
  //const { data: vehicleOptions } = useVehicleOptions();
  const [form] = Form.useForm();

  const handleSubmit = (formValues) => {
    const payload = {
      ...initialValue,
      ...formValues,
      startDate: formValues.startDate.unix(),
      estConclusionDate: formValues.estConclusionDate.unix(),
    };

    save(initialValue?._id, payload);
  };

  const handleValuesChange = (values) => {
    if (values.leaderId) {
      form.setFieldsValue({ helperIds: [] });
    }
    if (values.orderId) {
      form.setFieldsValue({ clientId: orderOptions.find(({ value }) => value === values.orderId)?.clientId });
    } else if (values.hasOwnProperty("orderId")) {
      // clear clicked
      form.setFieldsValue({ clientId: undefined });
    }
  };

  useEffect(() => {
    if (status.isSuccess) {
      onClose();
      afterSave();
    }
  }, [status, afterSave, onClose]);

  const denormInitialValue = initialValue
    ? {
        ...initialValue,
        startDate: moment.unix(initialValue.startDate),
        estConclusionDate: moment.unix(initialValue.estConclusionDate),
      }
    : undefined;

    const { Option, OptGroup } = Select;

    function handleChange(value) {
      console.log(`selected ${value}`);
    }


  return (
    <Modal
      visible
      onCancel={onClose}
      title={okText}
      onClose={onClose}
      okText={okText}
      okButtonProps={{
        form: "task-create-modal",
        htmlType: "submit",
        ...okButtonProps,
      }}
      width={800}
      maskClosable={false}
      keyboard={false}
    >
      <Form
        form={form}
        layout="vertical"
        id="task-create-modal"
        initialValues={denormInitialValue}
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item label={t("Title")} name="title" rules={validations.name}>
          <Input />
        </Form.Item>

        <Form.Item label={t("Work Address")} name="workAddress">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label={t("Driver")} name="driver">
        <Select options={userOptions} />
        </Form.Item>

        <Form.Item label={t("Vehicle")} name="vehicle">
            <Input />
            </Form.Item>
            <div className="site-card-wrapper">
            <Row gutter={16}>
            <Col span={12}>
            <Card bordered={false}>
            <Form.Item label={t("Start Date")} name="startDate" rules={validations.startDate}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            </Card>
            </Col>
            <Col span={12}>
            <Card bordered={false}>
            <Form.Item label={t("Conlusion Date")} name="estConclusionDate" rules={validations.estConclusionDate}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            </Card>
            </Col>
            </Row>
            </div>
            <Form.Item label={t("Leader")} name="leaderId" rules={validations.leaderId}>
              <Select options={userOptions} />
            </Form.Item>

        <Form.Item noStyle dependencies={["leaderId"]}>
          {({ getFieldValue }) => (
            <Form.Item label={t("Helpers")} name="helperIds" rules={validations.helperIds}>
              <Select options={userOptions.filter(({ value }) => value !== getFieldValue("leaderId"))} mode="multiple" />
            </Form.Item>
          )}
        </Form.Item>


            <Form.Item label={t("Lunch")} name="lunch">
            <Input />
            </Form.Item>

            <Form.Item label={t("Host")} name="host">
            <Input />
            </Form.Item>

            <Form.Item label={__("Order")} name="orderId" rules={validations.orderId}>
              <Select options={orderOptions} />
            </Form.Item>

            <Form.Item noStyle dependencies={["orderId"]}>
              {({ getFieldValue }) => (
                <Form.Item label={__("Client")} name="clientId" rules={validations.clientId}>
                  <Select options={clientOptions} disabled /*={!!getFieldValue("orderId")}*/ />
                </Form.Item>
              )}
            </Form.Item>

        <Form.Item label={t("Rute")} name="rute">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label={t("Obs")} name="obs">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label={t("Description")} name="description" rules={validations.description}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
      {status.isError && <Alert message={status.message} type="error" />}
    </Modal>
  );
}

export default TaskFormModal;
