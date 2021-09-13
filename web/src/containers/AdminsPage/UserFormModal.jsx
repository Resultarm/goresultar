import React, { useEffect, useState } from "react";
import { Button, Row, Col, Input, Radio, Form, Modal, Upload, ConfigProvider, DatePicker, Checkbox, Select } from "antd";
import moment from "moment";
import { getOrderStatuses } from "../../services/orderService";
import NumberFormat from "react-number-format";
import { useFetch } from "src/hooks";
import { useDepartmentOptions, useOrganizations } from "src/hooks";

import { FormList } from "src/components";

const ruleRequired = { required: true };

const validations = {
  name: [ruleRequired],
  email: [ruleRequired, { type: "email" }],
  password: [ruleRequired],
  organizationId: [ruleRequired],
  phoneNumber: [ruleRequired, { len: 11 }],
  role: [ruleRequired],
};

const defaultValues = {
  documents: [{ name: "", url: "" }],
  departmentIds: [],
  salary: { "13thDates": [] },
  organizationIds: [],
};

const imageFromEvent = ({ file }) => {
  if (file.status === "removed") {
    return [];
  }
  if (file?.response?.message) {
    file.uid = file?.response?.message;
    file.url = `/uploads/${file?.response?.message}`;
  }
  return [file];
};

function useRoles() {
  return useFetch("/api/admins/roles");
}

const nonAdminOneOrgValidator = (rule, value) => {
  return value.length !== 1 ? Promise.reject("non-superadmins can only have one org") : Promise.resolve();
};

function UserFormModal({ onClose, okText, okButtonProps, onSave, initialValues }) {
  const [form] = Form.useForm();
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [{ data: roles } = { data: [] }] = useRoles();
  const { options: departmentOptions } = useDepartmentOptions();
  const [organizations] = useOrganizations();

  const roleOptions = roles.map(({ roleNumber, name }) => ({
    label: name,
    value: roleNumber,
  }));
  const organizationOptions = organizations.map(({ _id, title }) => ({
    label: title,
    value: _id,
  }));

  const handleSubmit = (payload) => {
    onSave({
      ...payload,
      salary: {
        ...payload.salary,
        "13thDates": payload.salary["13thDates"].map((dateStr) => moment(dateStr, "DD/MM/YYYY").unix()),
      },
      documents: payload.documents.map(({ name, url }) => ({
        name,
        url: url[0]?.uid,
      })),
    });
  };

  const handleValuesChange = (changed) => {
    if (changed["salary13thDate"]) {
      console.log(form.getFieldValue(["salary", "13thDates"]));
      form.setFieldsValue({
        salary13thDate: "",
        salary: {
          "13thDates": [...form.getFieldValue(["salary", "13thDates"]), changed["salary13thDate"].format("DD/MM/YYYY")],
        },
      });
    }
    if (changed.organizationIds) {
      form.setFieldsValue({ branchIds: [] });
    }
  };

  useEffect(() => {
    getOrderStatuses().then((res) => {
      setOrderStatuses(Object.entries(res).map(([k, v]) => ({ value: Number(k), label: v })));
    });
  }, []);
  const denormInitValue = initialValues
    ? {
        ...initialValues,
        password: "",
        departmentIds: initialValues.departmentIds || [],
        allowedStatuses: initialValues.allowedStatuses || [],
        organizationIds: initialValues.organizationIds || [],
        branchIds: initialValues.branchIds || [],
        documents: initialValues.documents || [],
        salary: {
          ...initialValues.salary,
          "13thDates": ((initialValues.salary || {})["13thDates"] || []).map((d) => moment(d).format("DD/MM/YYYY")),
        },
      }
    : defaultValues;

  const branchOptions = organizations.reduce(
    (acc, { branches, _id: organization_id }) =>
      acc.concat(
        (branches || []).map(({ _id, title }) => ({
          value: _id,
          label: title,
          organizationId: organization_id,
        }))
      ),
    []
  );

  console.log("denormInitValue :>> ", denormInitValue);

  return (
    <ConfigProvider componentSize="middle">
      <Modal
        title={okText}
        onClose={onClose}
        visible
        okText={okText}
        okButtonProps={{
          form: "user-add-modal",
          htmlType: "submit",
          ...okButtonProps,
        }}
        onCancel={onClose}
        width={1124}
        maskClosable={false}
        keyboard={false}
      >
        <Form
          layout="vertical"
          id="user-add-modal"
          form={form}
          onValuesChange={handleValuesChange}
          initialValues={denormInitValue}
          onFinish={handleSubmit}
          size="middle"
        >
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item label="Nome" name="firstName" rules={validations.firstName}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Sobre Nome" name="lastName" rules={validations.lastName}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Email" name="email" rules={validations.email}>
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Senha" name="password" rules={initialValues ? undefined : validations.password}>
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Tel."
                name="landlineNumber"
                rules={validations.landlineNumber}
                trigger="onValueChange"
                getValueFromEvent={(vs) => vs.value}
              >
                <NumberFormat customInput={Input} format="(##) ##### - ####" placeholder="(00) 00000 - 0000" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item label="Perfil" name="roleNumber" rules={validations.role}>
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item noStyle dependencies={["roleNumber"]}>
                {({ getFieldValue }) => (
                  <Form.Item
                    label="Empresa"
                    name="organizationIds"
                    rules={[
                      ...(getFieldValue("roleNumber") === 1, 8 ? [] : [ruleRequired]),
                      ...(getFieldValue("roleNumber") !== 1, 8
                        ? [
                            {
                              validator: nonAdminOneOrgValidator,
                              message: "Apenas Super Admin e Vendedores podem participar de mais de 1 empresa",
                            },
                          ]
                        : []),
                    ]}
                  >
                    <Select mode="multiple" options={organizationOptions} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item dependencies={["organizationIds", "roleNumber"]} noStyle>
                {({ getFieldValue }) => (
                  <Form.Item
                    name="branchIds"
                    label="Filial"
                    rules={getFieldValue("roleNumber") === 3 ? [ruleRequired] : undefined}
                  >
                    <Select
                      mode="multiple"
                      options={branchOptions.filter(({ organizationId }) =>
                        getFieldValue("organizationIds").includes(organizationId)
                      )}
                      disabled={getFieldValue("roleNumber") !== 3}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={3}>
              <Form.Item dependencies={["roleNumber"]} noStyle>
                {({ getFieldValue }) => (
                  <Form.Item
                    className="ant-form-item-inline"
                    label="É vendendor?"
                    name="isRep"
                    rules={validations.isRep}
                    valuePropName="checked"
                  >
                    <Checkbox disabled={getFieldValue("roleNumber") !== 3} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item dependencies={["roleNumber", "isRep"]} noStyle>
                {({ getFieldValue }) => (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="% por venda"
                        name="commission"
                        rules={validations.commission}
                        trigger="onValueChange"
                        getValueFromEvent={(vs) => vs.floatValue}
                      >
                        <NumberFormat
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          disabled={!(getFieldValue("roleNumber") === 8 || getFieldValue("isRep"))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Max. pedidos 7 dias"
                        name="maxOrders"
                        rules={validations.commission}
                        trigger="onValueChange"
                        getValueFromEvent={(vs) => vs.floatValue}
                      >
                        <NumberFormat
                          customInput={Input}
                          thousandSeparator="."
                          decimalSeparator=","
                          disabled={!(getFieldValue("roleNumber") === 8 || getFieldValue("isRep"))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item dependencies={["roleNumber", "organizationIds"]} noStyle>
                {({ getFieldValue }) => (
                  <Form.Item label="Departamentos" name="departmentIds" rules={validations.departmentIds}>
                    <Select
                      mode="multiple"
                      options={departmentOptions.filter(
                        ({ organizationId }) => organizationId === getFieldValue("organizationIds")[0]
                      )}
                      disabled={getFieldValue("roleNumber") !== 3}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item dependencies={["roleNumber"]} noStyle>
                {({ getFieldValue }) => (
                  <Form.Item label="Status Pedidos" name="allowedStatuses" rules={validations.allowedStatuses}>
                    <Select mode="multiple" options={orderStatuses} disabled={getFieldValue("roleNumber") !== 3} />
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={4}>
              <Form.Item
                label="Salário"
                name={["salary", "salary"]}
                rules={validations.salary}
                trigger="onValueChange"
                getValueFromEvent={(vs) => vs.floatValue}
              >
                <NumberFormat customInput={Input} thousandSeparator="." decimalSeparator="," />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Frequencia" name={["salary", "frequency"]} rules={validations.frequency}>
                <Radio.Group>
                  <Radio.Button value="daily">Dia</Radio.Button>
                  <Radio.Button value="weekly">Semana</Radio.Button>
                  <Radio.Button value="15days">15 Dias</Radio.Button>
                  <Radio.Button value="monthly">Mês</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item
                className="ant-form-item-inline"
                label="13° Salário"
                name={["salary", "13th"]}
                rules={validations["13thSalary"]}
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={9}>
              <Form.Item dependencies={[["salary", "13th"]]} noStyle>
                {({ getFieldValue }) => (
                  <Row>
                    <Col span={18}>
                      <Form.Item label="13° Data" name={["salary", "13thDates"]}>
                        <Select mode="tags" disabled={getFieldValue(["salary", "13th"]) !== true} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label={"\u2800"} name="salary13thDate">
                        <DatePicker disabled={getFieldValue(["salary", "13th"]) !== true} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Form.Item>
            </Col>
          </Row>
          <FormList label="Arquivos" name="documents">
            {(field) => (
              <>
                <Form.Item name={[field.name, "name"]} fieldKey={[field.fieldKey, "name"]} rules={[ruleRequired]}>
                  <Input placeholder="File Name" />
                </Form.Item>
                <Form.Item
                  name={[field.name, "url"]}
                  fieldKey={[field.fieldKey, "url"]}
                  rules={validations.frontImageUrl}
                  getValueFromEvent={imageFromEvent}
                >
                  <Upload
                    action="/assets/upload?entity=user"
                    accept="image/*,.pdf"
                    headers={{
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }}
                  >
                    <Button>Enviar</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
          </FormList>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}

export default UserFormModal;
