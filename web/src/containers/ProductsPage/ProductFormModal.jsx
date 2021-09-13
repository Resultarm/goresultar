import React, { useEffect, useState } from "react";
import { Alert, Card, Cascader, Col, Divider, Form, Input, message, Radio, Row, Select, Upload } from "antd";
import { InputNumberFmtd, FormModal, FormList } from "src/components";
import { useTranslation } from "react-i18next";
import { ruleRequired, translateFormRules, cf } from "src/helpers";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import DimensionFields from "src/components/DimensionFields";
import { UNIT, MEASUREMENT_TYPES, MEASUREMENT_DEFAULT_VALUES } from "src/components/DimensionFields/constants";
import {
  useProductv2,
  useProviderOptions,
  useDepartments,
  useCategories,
  useSubcategories,
  useBrands,
  useModels,
} from "src/hooks";
import "./ProductFormModal.scss";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const braillePatternBlank = "⠀";

const formRules = {
  title: [ruleRequired],
  totalUnits: [ruleRequired],
  departmentTree: [ruleRequired],
  brandTree: [ruleRequired],
  minStockThreshold: [ruleRequired],
  costContributionValue: [ruleRequired],
  price: [ruleRequired],
  unitType: [ruleRequired],
  measurementType: [ruleRequired],
  metricValue: [ruleRequired],
};

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

function useDepartmentTree() {
  const { all: departments } = useDepartments();
  const { all: categories } = useCategories();
  const { all: subcategories } = useSubcategories();

  const depTree = departments.map((dep) => {
    return {
      value: dep._id,
      label: dep.title,
      children: categories
        .filter((cat) => cat.departmentId === dep._id)
        .map((cat) => {
          return {
            value: cat._id,
            label: cat.title,
            children: subcategories
              .filter((subcat) => subcat.categoryId === cat._id)
              .map((subcat) => {
                return {
                  value: subcat._id,
                  label: subcat.title,
                };
              }),
          };
        }),
    };
  });

  return { options: depTree };
}

function useBrandTreeOptions() {
  const { all: brands } = useBrands();
  const { all: models } = useModels();

  const brandTree = brands.map((brand) => {
    const thisBrandModels = models
      .filter((model) => model.brandId === brand._id)
      .map((model) => {
        return {
          value: model._id,
          label: model.title,
        };
      });
    return {
      value: brand._id,
      label: brand.title,
      children: thisBrandModels,
      disabled: thisBrandModels.length === 0,
    };
  });

  return { options: brandTree };
}

const defaultValue = {
  costContribution: [{ name: "", value: 0 }],
  profitInPercentage: false,
  images: [],
  measurementType: UNIT,
  measurementValue: [],
};

function ProductFormModal({ onClose, afterSave, okText, initialValue }) {
  const { t } = useTranslation(["translation"]);
  const rules = translateFormRules(t, formRules);
  const [imagePreviewUrl, setImagePreviewUrl] = useState();
  const { options: departmentTreeOptions } = useDepartmentTree();
  const { options: brandTreeOptions } = useBrandTreeOptions();
  const { options: providerOptions } = useProviderOptions();
  const { save, status: saveStatus } = useProductv2();
  const [form] = Form.useForm();

  const handleImagePreview = async (file) => {
    const imageUrl = file.url || file.preview;
    if (imageUrl) {
      setImagePreviewUrl(file.url);
    } else {
      const imageUrl = await getBase64(file.originFileObj);
      setImagePreviewUrl(imageUrl);
    }
  };

  const handleValuesChange = (values) => {
    const cost = form.getFieldValue("costContribution").reduce((acc, c) => acc + (c?.value || 0), 0);
    const profit = form.getFieldValue("profit") || 0;
    const price = cost + (form.getFieldValue("profitInPercentage") ? (profit * cost) / 100 : profit);
    if (values.costContribution) {
      form.setFieldsValue({ price: Number(price.toFixed(2)), profit: Number(profit.toFixed(2)) });
    } else if (values.profitInPercentage !== undefined) {
      form.setFieldsValue({ price: Number(price.toFixed(2)) });
    } else if (values.profit) {
      form.setFieldsValue({ price: Number(price.toFixed(2)) });
    } else if (values.price) {
      let profit = form.getFieldValue("profitInPercentage") ? ((values.price - cost) * 100) / cost : values.price - cost;
      form.setFieldsValue({ profit: Number(profit.toFixed(2)) });
    }
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      departmentId: values.departmentTree[0],
      categoryId: values.departmentTree[1] || undefined,
      subcategoryId: values.departmentTree[2] || undefined,
      brandId: values.brandTree[0],
      modelId: values.brandTree[1],
      cost: values.costContribution.reduce((acc, c) => acc + (c?.value || 0), 0),
      imageUrls: values.images.map(({ response }) => response?.message),
      revenue: values.profit,
      providerId: values.providerId || undefined,
    };

    console.log("payload :>> ", payload);

    save(payload, initialValue?._id);
  };

  useEffect(() => {
    if (saveStatus.isSuccess) {
      message.success(saveStatus.message);
      afterSave();
    }
  }, [saveStatus, afterSave]);

  const denormInitValue = initialValue
    ? {
        ...defaultValue,
        ...initialValue,
        departmentTree: [initialValue.departmentId, initialValue.categoryId, initialValue.subcategoryId],
        brandTree: [initialValue.brandId, initialValue.modelId],
        images: (initialValue.imageUrls || []).map((url) => ({ url: url, uid: url })),
        profit: initialValue.price - initialValue.cost,
        metricType: initialValue.unit[initialValue.unitType]?.unit,
        metricValue: initialValue.unit[initialValue.unitType]?.value,
        costContribution: initialValue.costContribution || [{ name: "", value: initialValue.cost }],
      }
    : defaultValue;

  return (
    <FormModal
      formID="product-add-modal"
      onClose={onClose}
      okText={okText}
      submitButtonProps={{ loading: saveStatus.isLoading }}
      width="100%"
      style={{ top: 16 }}
      organizationId={denormInitValue?.organizationId}
    >
      <Form
        form={form}
        layout="vertical"
        id="product-add-modal"
        onValuesChange={handleValuesChange}
        initialValues={denormInitValue}
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label={t("Title")} rules={rules.title}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="minStockThreshold" label={t("Min Stock Threshold")} rules={rules.minStockThreshold}>
                  <InputNumberFmtd />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={["Department", "Category", "Sub Category"].map(t).join("/")}
                  name="departmentTree"
                  rules={rules.departmentTree}
                >
                  <Cascader options={departmentTreeOptions} changeOnSelect />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={["Brand", "Model"].map(t).join("/")} name="brandTree" rules={rules.brandTree}>
                  <Cascader options={brandTreeOptions} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="ISBN" label={t("BCode")} rules={rules.ISBN}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="providerId" label={t("Provider")} rules={rules.providerId}>
                  <Select options={providerOptions} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={4}>
                <Form.Item name="measurementType" label={t("Metric")} rules={rules.measurementType}>
                  <Select options={MEASUREMENT_TYPES} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="totalUnits" label={t("Total Quantity")} rules={rules.totalUnits}>
                  <InputNumberFmtd />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row gutter={16}>
              <Col span={8}>
                <FormList label={t("Cost")} name="costContribution">
                  {(field) => (
                    <>
                      <Form.Item
                        name={[field.name, "name"]}
                        fieldKey={[field.fieldKey, "name"]}
                        rules={rules.costContributionName}
                      >
                        <Input placeholder={t("Cost Name")} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, "value"]}
                        fieldKey={[field.fieldKey, "value"]}
                        rules={rules.costContributionValue}
                      >
                        <InputNumberFmtd />
                      </Form.Item>
                    </>
                  )}
                </FormList>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => (
                    <>Total: {cf(getFieldValue("costContribution").reduce((acc, c) => acc + (c?.value || 0), 0))}</>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <div style={{ display: "grid", gridTemplateColumns: "auto max-content" }}>
                  <Form.Item label={t("Profit")} name="profit">
                    <InputNumberFmtd />
                  </Form.Item>
                  <Form.Item name="profitInPercentage" label={braillePatternBlank}>
                    <Radio.Group>
                      <Radio.Button value={false}>#</Radio.Button>
                      <Radio.Button value={true}>%</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </Col>
              <Col span={8}>
                <Form.Item name="price" label={t("Price")} rules={rules.price}>
                  <InputNumberFmtd />
                </Form.Item>
              </Col>
            </Row>
            <Divider style={{ margin: "8px 0" }} />
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="description" label={t("Description")} rules={rules.description}>
                  {/* <Input.TextArea rows={5} /> */}
                  <CKEditor
                    editor={ClassicEditor}
                    // data={text}
                    onReady={(editor) => {
                      // You can store the "editor" and use when it is needed.
                      console.log("Editor is ready to use!", editor);
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      console.log({ event, editor, data });
                    }}
                    onBlur={(event, editor) => {
                      console.log("Blur.", editor);
                    }}
                    onFocus={(event, editor) => {
                      console.log("Focus.", editor);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="comment" label={t("Comment")} rules={rules.comment}>
                  {/* <Input.TextArea rows={5} /> */}
                  <CKEditor
                    editor={ClassicEditor}
                    // data={text}
                    rows={5}
                    onReady={(editor) => {
                      // You can store the "editor" and use when it is needed.
                      console.log("Editor is ready to use!", editor);
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      console.log({ event, editor, data });
                    }}
                    onBlur={(event, editor) => {
                      console.log("Blur.", editor);
                    }}
                    onFocus={(event, editor) => {
                      console.log("Focus.", editor);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Card title={t("Product Images")} className="image-upload-container" size="small">
              <div className="preview-image-container">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="preview" />
                ) : (
                  <span>
                    click on <EyeOutlined /> in thumbline to preview
                  </span>
                )}
              </div>
              <Form.Item name="images" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload
                  multiple
                  action="/assets/upload?entity=product"
                  accept=".jpg, .jpeg"
                  name="file"
                  listType="picture-card"
                  onPreview={handleImagePreview}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginLeft: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      {saveStatus.isError && <Alert message={saveStatus.message} type="error" />}
    </FormModal>
  );
}

export default ProductFormModal;
