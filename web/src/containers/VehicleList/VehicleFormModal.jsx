import React, { useContext } from "react";
import { Alert, Col, Form, Input, Modal, Row, DatePicker } from "antd";
import { useClientOptions, useStaffOptions, useVehicle, useOrderOptions } from "src/hooks";
import { useEffect } from "react";
import { OrganizationContext } from "src/contexts";
import { Select } from "src/components";
import { useTranslation } from "react-i18next";
import moment from "moment";
//import Editor from "./editor";

const ruleRequired = { required: true };

const validations = {
 // title: [ruleRequired],
 // estConclusionDate: [ruleRequired],
 // startDate: [ruleRequired],
 // assigneeId: [ruleRequired],
 // leaderId: [ruleRequired],
};

function VehicleFormModal({ onClose, okText, okButtonProps, afterSave, initialValue }) {
  const { t } = useTranslation(["translation"]);
  const { save, status } = useVehicle(initialValue?._id);
  const organizationId = useContext(OrganizationContext);
  const { data: userOptions } = useStaffOptions(initialValue?.organizationId || organizationId);
  const { data: taskOptions } = useOrderOptions();
  const { data: clientOptions } = useClientOptions();
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
    if (values.taskId) {
      form.setFieldsValue({ clientId: taskOptions.find(({ value }) => value === values.taskId)?.clientId });
    } else if (values.hasOwnProperty("taskId")) {
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

  return (
    <Modal
      visible
      onCancel={onClose}
      title={okText}
      onClose={onClose}
      okText={okText}
      okButtonProps={{
        form: "vehicle-create-modal",
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
        id="vehicle-create-modal"
        initialValues={denormInitialValue}
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item label={t("Title")} name="title">
          <Input />
        </Form.Item>
        <Form.Item label={t("Type")} name="type">
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t("Purchase Date")} name="purchaseDate">
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t("Purchase Price")} name="purchasePrice">
            <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t("Purchase Km")} name="purchaseKm">
            <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t("Km Now")} name="kmNow">
            <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item noStyle dependencies={["driverId"]}>
          {({ getFieldValue }) => (
            <Form.Item label={t("Drivers")} name="driverId" >
              <Select options={userOptions.filter(({ value }) => value !== getFieldValue("vinNumber"))} mode="multiple" />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label={t("Last Manutences")} name="lastManutences">
        <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

          <Form.Item label={t("Actual Price")} name="actualPrice">
            <Input />
        </Form.Item>

        <Form.Item label={t("Description")} name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label={__("Obs")} name="obs">
            <Input.TextArea rows={4} />
            </Form.Item>
      </Form>
      {status.isError && <Alert message={status.message} type="error" />}
    </Modal>
  );
}

export default VehicleFormModal;
