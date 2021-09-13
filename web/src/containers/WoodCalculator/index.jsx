import React from "react";
import { Form, Row, Col } from "antd";
import { InputNumberFmtd } from "src/components";
import { useTranslation } from "react-i18next";
import { cf, nf } from "src/helpers";
import { Link } from "@reach/router";
import { OrgAwareButton } from "src/components";

const computeVolume = (values) => {
  const heightAverage =
    (values.frontLeftHeight +
      values.frontRightHeight +
      values.midLeftHeight +
      values.midRightHeight +
      values.rearLeftHeight +
      values.rearRightHeight) /
    6;
  const lengthAverage = (values.leftLength + values.rightLength) / 2;
  return heightAverage * lengthAverage * values.width;
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};

const defaultValues = {
  frontLeftHeight: 0,
  frontRightHeight: 0,
  midLeftHeight: 0,
  midRightHeight: 0,
  rearLeftHeight: 0,
  rearRightHeight: 0,
  leftLength: 0,
  rightLength: 0,
  width: 0,
  pricePerVolume: 0,
};

const CreateExpenseLink = ({ values }) => {
  const { t } = useTranslation(["translation"]);
  const expenseDescription = `${t("Front Left Height")}: ${nf(values.frontLeftHeight)}
${t("Front Right Height")}: ${nf(values.frontRightHeight)}
${t("Mid Left Height")}: ${nf(values.midLeftHeight)}
${t("Mid Right Height")}: ${nf(values.midRightHeight)}
${t("Rear Left Height")}: ${nf(values.rearLeftHeight)}
${t("Rear Right Height")}: ${nf(values.rearRightHeight)}
${t("Left Length")}: ${nf(values.leftLength)}
${t("Right Length")}: ${nf(values.rightLength)}
${t("Width")}: ${nf(values.width)}
${t("Price Per Volume")}: ${cf(values.pricePerVolume)}
`;
  const searchParams = new URLSearchParams({
    create: true,
    name: "Woods Buy",
    description: expenseDescription,
    numTimes: 1,
    frequency: "custom",
    amount: Number((computeVolume(values) * values.pricePerVolume).toFixed(2)),
    type: "purchase",
    fixed: true,
  });
  const urlpath = `/expenses?${searchParams.toString()}`;

  return (
    <Link className="margin-left" to={urlpath} target="_blank" component={OrgAwareButton}>
      {t("Create Expense")}
    </Link>
  );
};

const Total = ({ values }) => {
  console.log("values :>> ", values);
  const volume = computeVolume(values);

  return (
    <div style={{ fontSize: "1.2em" }}>
      Total: {nf(volume)} x {cf(values.pricePerVolume)} = {cf(volume * values.pricePerVolume)}{" "}
      <CreateExpenseLink values={values} />
    </div>
  );
};

function WoodCalculator() {
  const { t } = useTranslation(["translation"]);

  return (
    <Form {...layout} initialValues={defaultValues} className="margin">
      <h2>{t("Calc. M3")}</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("Front Left Height")} name="frontLeftHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("Front Right Height")} name="frontRightHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("Mid Left Height")} name="midLeftHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("Mid Right Height")} name="midRightHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("Rear Left Height")} name="rearLeftHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("Rear Right Height")} name="rearRightHeight">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("Left Length")} name="leftLength">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("Right Length")} name="rightLength">
            <InputNumberFmtd />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t("Width")} name="width" {...tailLayout}>
        <InputNumberFmtd />
      </Form.Item>
      <Form.Item label={t("Price Per Volume")} name="pricePerVolume" {...tailLayout}>
        <InputNumberFmtd />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 4 }} shouldUpdate>
        {({ getFieldsValue }) => <Total values={getFieldsValue()} />}
      </Form.Item>
    </Form>
  );
}

export default WoodCalculator;
