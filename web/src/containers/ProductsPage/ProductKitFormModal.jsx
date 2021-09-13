import { Alert, Button, Col, Form, Input, message, Row, Upload } from "antd";
import { List } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo } from "react";
import { useProductv2, useProductList } from "src/hooks";
import { cf, computeOrderTotal, ruleRequired } from "src/helpers";
import currencyFormatter from "src/helpers/currencyFormatterPrefix";
import { useTranslation } from "react-i18next";
import { CategorySelect, BrandSelect } from "src/components";
import { SelectedProducts } from "src/components";

import { FormModal, ProductSelect } from "src/components";
import { InputNumberFmtd } from "src/components";

import "./ProductKitFormModal.scss";

const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

const rules = {
  title: [ruleRequired],
  categoryInfo: [ruleRequired],
  brandInfo: [ruleRequired],
  price: [ruleRequired],
  products: [ruleRequired],
};

const defaultValue = {
  products: [],
  discount: 0,
  images: [],
};

const computeTotal = (selectedProducts) => {
  let total = 0;
  for (const id in selectedProducts) {
    const p = selectedProducts[id];
    total += (p.quantity || 0) * p.price;
  }

  return Number(total.toFixed(2));
};

function ProductKitFormModal({ onClose, afterSave, initialValue, okText }) {
  const { t } = useTranslation(["translation"]);

  const { save, status: saveStatus } = useProductv2();

  const [form] = Form.useForm();

  const handleFinish = (payload) => {
    const kitProducts = [];
    const selectedProducts = form.getFieldValue("products");

    if (selectedProducts.length === 0) {
      return;
    }
    for (let id in selectedProducts) {
      const product = selectedProducts[id];
      if (!product.quantity) continue;
      kitProducts.push({
        _id: product.__id,
        quantity: product.quantity,
        title: product.title,
        price: product.price,
        cost: product.cost,
        measurementValue: product.measurementValue,
      });
    }

    save(
      {
        ...initialValue,
        ...payload,
        departmentId: payload.categoryInfo[0],
        categoryId: payload.categoryInfo[1],
        subcategoryId: payload.categoryInfo[2],
        brandId: payload.brandInfo[0],
        modelId: payload.brandInfo[1],
        kitProducts: kitProducts,
        imageUrls: payload.images.map(({ response }) => response?.message),
      },
      initialValue?._id
    );
  };

  const handleProductAdd = (product) => {
    const selectedProducts = form.getFieldValue("products");

    const selectedProduct = selectedProducts.findIndex((p) => p._id === product._id);
    const selectedQuantity = selectedProduct?.quantity || 0;
    if (product.isService || selectedQuantity !== product.quantity) {
      if (selectedProduct === -1) {
        const t = {
          _id: product._id,
          __id: product._id,
          title: product.title,
          price: product.price,
          cost: product.cost,
          quantity: 1,
          images: product.images,
          chargeDuration: product.chargeDuration,
          measurementType: product.measurementType,
          measurementValue: product.measurementValue,
        };
        form.setFieldsValue({ products: [t, ...selectedProducts] });
      } else {
        selectedProducts[selectedProduct].quantity += 1;
        form.setFieldsValue({ products: selectedProducts });
      }
    }
  };

  const handleProductAddAsAnother = (product) => {
    const selectedProducts = form.getFieldValue("products");
    const selectedQuantity = selectedProducts[product._id]?.quantity || 0;
    if (product.isService || product.quantity !== selectedQuantity) {
      const t = {
        _id: Symbol(product._id),
        __id: product._id,
        title: product.title,
        price: product.price,
        cost: product.cost,
        quantity: 1,
        images: product.images,
        chargeDuration: product.chargeDuration,
        measurementType: product.measurementType,
        measurementValue: product.measurementValue,
      };

      form.setFieldsValue({
        products: [t, ...selectedProducts],
      });
    }
  };

  const handleQuantityChange = (productId, quantity, measurementValue) => {
    const selectedProducts = form.getFieldValue("products");
    const selectedProduct = selectedProducts.find((p) => p._id === productId);
    selectedProduct.quantity = quantity;
    selectedProduct.measurementValue = measurementValue;
    form.setFieldsValue({
      products: null,
    });
    form.setFieldsValue({
      products: selectedProducts,
    });
  };

  const handleDelete = (productId) => {
    const selectedProducts = form.getFieldValue("products");
    const i = selectedProducts.findIndex((p) => p._id === productId);

    form.setFieldsValue({
      products: null,
    });
    form.setFieldsValue({
      products: [...selectedProducts.slice(0, i), ...selectedProducts.slice(i + 1)],
    });
  };

  useEffect(() => {
    if (saveStatus.isSuccess) {
      message.success(saveStatus.message);
      afterSave();
    }
  }, [saveStatus, afterSave]);

  const temp = new Set();
  const denormInitValue = useMemo(
    () =>
      initialValue
        ? {
            ...defaultValue,
            ...initialValue,
            categoryInfo: [initialValue.departmentId, initialValue.categoryId, initialValue.subcategoryId].filter(Boolean),
            brandInfo: [initialValue.brandId, initialValue.modelId].filter(Boolean),
            images: (initialValue.imageUrls || []).map((url) => ({ url: url, uid: url })),
            products: initialValue.kitProducts.map(({ _id: i, ...rest }) => {
              const _id = temp.has(i) ? Symbol(i) : i;
              temp.add(i);
              return {
                _id: _id,
                ...rest,
              };
            }),
          }
        : defaultValue,
    [initialValue]
  );

  return (
    <FormModal
      className="kit-form-modal"
      formID="kit-form-modal"
      okText={okText}
      onClose={onClose}
      submitButtonProps={{ loading: saveStatus.isLoading }}
      width="100%"
      style={{ top: 16 }}
      organizationId={denormInitValue?.organizationId}
    >
      <Form
        id="kit-form-modal"
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={denormInitValue}
        preserve={false}
      >
        <div className="products-wrapper">
          <ProductSelect
            className="product-list"
            onAdd={handleProductAdd}
            onAddAsNew={handleProductAddAsAnother}
            enableOutOfStock
            showKits={false}
          />
          <div style={{ width: "50%", display: "inline-block", height: "100%" }}>
            <Form.Item className="products-form-item" wrapperCol={{ span: 24 }} shouldUpdate noStyle>
              {({ getFieldValue }) => (
                <SelectedProducts
                  products={getFieldValue("products")}
                  onQuantityChange={handleQuantityChange}
                  onDelete={handleDelete}
                  hideComment={true}
                />
              )}
            </Form.Item>
            <Form.Item className="product-total" wrapperCol={{ span: 24 }} shouldUpdate>
              {({ getFieldValue: f }) => (
                <div style={{ textAlign: "right", fontSize: "1.2em" }}>
                  {t("Total")}: {currencyFormatter.format(computeOrderTotal(f("products")))}
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        <div className="grid-50-50">
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={t("Title")} name="title" rules={rules.title}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="categoryInfo"
                  label={["Department", "Category", "Sub Category"].map(t).join("/")}
                  rules={rules.categoryInfo}
                >
                  <CategorySelect />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="brandInfo" label={["Brand", "Model"].map(t).join("/")} rules={rules.brandInfo}>
                  <BrandSelect />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* <Col span={8}>
                <Form.Item name="cost" label={t("Cost")} rules={rules.cost}>
                  <InputNumberFmtd />
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item name="price" label={t("Price")} rules={rules.price}>
                  <InputNumberFmtd />
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item dependencies={["price", "products"]} noStyle>
                  {({ getFieldValue: f }) => (
                    <div style={{ paddingTop: 32 }}>-{cf(computeTotal(f("products")) - f("price"))}</div>
                  )}
                </Form.Item>
              </Col> */}
            </Row>
            <Form.Item label={t("Description")} name="description" rules={rules.description}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item labelCol={{ span: 4 }} label={t("Comment")} name="comment" rules={rules.comment}>
              <Input.TextArea placeholder={t("Comment")} style={{ width: "100%" }} rows={1} />
            </Form.Item>
          </div>
          <Form.Item
            name="images"
            valuePropName="fileList"
            label={t("Images")}
            getValueFromEvent={normFile}
            rules={rules.images}
          >
            <Upload multiple action="/assets/upload?entity=product" accept=".jpg, .jpeg" name="file" listType="picture-card">
              <div>
                <PlusOutlined />
                <div style={{ marginLeft: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </div>
      </Form>

      {saveStatus.isError && <Alert message={saveStatus.message} type="error" />}
    </FormModal>
  );
}

export default ProductKitFormModal;
