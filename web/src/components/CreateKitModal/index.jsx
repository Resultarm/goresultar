import React, { useEffect, useState } from "react";
import { Button, Divider, Form, Modal } from "semantic-ui-react";

import InputCost from "../../components/InputCost";
import currencyFormatter from "../../helpers/currencyFormatterPrefix";
import { getBrands } from "../../services/brandsService";
import { getDepartments } from "../../services/departmentsService";
import { getModels } from "../../services/modelsService";
import { getSubcategories } from "../../services/subcategoriesService";
import { getCategories } from "../../services/categoriesService";
import * as productService from "../../services/productService";
import { useTranslation } from "react-i18next";

function CreateKitModal({ kit, actionName, products, onClose, addToast }) {
  const { t } = useTranslation("translation");
  const worthPrice = (kit?.productIds || []).reduce((acc, id) => acc + products.find(({ _id }) => _id === id)?.price || 0, 0);
  const [state, setState] = useState({
    name: kit?.title,
    description: kit?.description || "",
    selectedProducts: kit?.productIds || [],
    worthPrice: worthPrice || 0,
    price: kit?.price || 0,
    inStock: kit?.totalUnits || 0,
    cost: kit?.cost || 0,
    departmentOptions: kit?.departmentOptions || [],
    categoryOptions: kit?.categoryOptions || [],
    modelOptions: kit?.modelOptions || [],
    brandOptions: kit?.brandOptions || [],
    subcategoryOptions: kit?.subcategoryOptions || [],
    departmentId: kit?.departmentId,
    categoryId: kit?.categoryId,
    subcategoryId: kit?.subcategoryId,
    brandId: kit?.brandId,
    modelId: kit?.modelId,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = () => {
    setIsLoading(true);
    const payload = {
      title: state.name,
      description: state.description,
      status: 1,
      cost: state.cost,
      price: state.price,
      revenue: state.worthPrice,
      totalUnits: state.inStock,
      productIds: state.selectedProducts,
      departmentId: state.departmentId,
      unitType: state.unitType,
      revenueFormat: "abs",
      unit: {
        unit: {
          unit: 0,
          value: 1,
        },
      },
      categoryId: state.categoryId,
      subcategoryId: state.subcategoryId,
      brandId: state.brandId,
      modelId: state.modelId,
      comment: "",
      unitType: "unit",
    };
    (kit ? productService.updateProduct(kit._id, payload) : productService.createProduct(payload))
      .then((resp) => {
        setIsLoading(false);
        onClose();
        addToast(t("product saved"), { appearance: "success" });
      })
      .catch((err) => {
        setIsLoading(false);
        addToast(t("Something went wrong"), { appearance: "error" });
      });
  };

  const handleSelectChange = (_, data) => {
    const selectedProducts = data.value;
    const prices = products
      .filter(({ _id }) => selectedProducts.includes(_id))
      .reduce(
        (acc, { price, cost }) => ({
          cost: acc.cost + cost,
          price: acc.price + price,
        }),
        { cost: 0, price: 0 }
      );
    setState({
      ...state,
      selectedProducts,
      worthPrice: prices.price,
      price: prices.price,
      cost: prices.cost,
    });
  };

  const handlePriceChange = (value) => {
    setState({ ...state, price: value });
  };

  const handleChange = (name, value) => {
    setState({ ...state, [name]: value });
  };

  const productOptions = products.map(({ title, price, _id }) => ({
    text: `${title} (${currencyFormatter.format(price)})`,
    value: _id,
  }));

  useEffect(() => {
    getDepartments({ showAll: true })
      .then((resp) => {
        const opts = resp.data.map((dep) => ({
          text: dep.title,
          value: dep._id,
        }));
        setState((s) => ({ ...s, departmentOptions: opts }));
      })
      .catch((err) => addToast(t("Could not fetch") + " " + t("departments"), { appearance: "error" }));
    getCategories({ showAll: true })
      .then((resp) => {
        const opts = resp.data.map((cat) => ({
          text: cat.title,
          value: cat._id,
          departmentId: cat.departmentId,
        }));
        setState((s) => ({ ...s, categoryOptions: opts }));
      })
      .catch((err) => addToast(t("Could not fetch") + " " + t("categories"), { appearance: "error" }));
    getModels({ showAll: true })
      .then((resp) => {
        const opts = resp.data.map((mod) => ({
          text: mod.title,
          value: mod._id,
          brandId: mod.brandId,
        }));
        setState((s) => ({ ...s, modelOptions: opts }));
      })
      .catch((err) => addToast(t("Could not fetch") + " " + t("models"), { appearance: "error" }));
    getBrands({ showAll: true })
      .then((resp) => {
        const opts = resp.data.map((brand) => ({
          text: brand.title,
          value: brand._id,
          departmentId: brand.departmentId,
        }));
        setState((s) => ({ ...s, brandOptions: opts }));
      })
      .catch((err) => addToast(t("Could not fetch") + " " + t("brands"), { appearance: "error" }));
    getSubcategories({ showAll: true })
      .then((resp) => {
        const opts = resp.data.map((cat) => ({
          text: cat.title,
          value: cat._id,
          categoryId: cat.categoryId,
        }));
        setState((s) => ({ ...s, subcategoryOptions: opts }));
      })
      .catch((err) => addToast(t("Could not fetch") + " " + t("subcategories"), { appearance: "error" }));
  }, []);

  return (
    <Modal closeIcon open onClose={onClose}>
      <Modal.Header>
        {actionName} {t("Kit")}
      </Modal.Header>
      <Modal.Content>
        <Form name="create-kit-form" size="large" onSubmit={handleFormSubmit}>
          <Form.Input
            fluid
            label={t("Name")}
            placeholder={t("Name")}
            value={state.name}
            error={state.name === ""}
            onChange={(e, { value }) => handleChange("name", value)}
          />
          <Form.Select
            label={t("Products")}
            multiple
            search
            options={productOptions}
            onChange={handleSelectChange}
            defaultValue={state.selectedProducts}
          ></Form.Select>
          <Form.Group>
            <Form.Input
              type="number"
              label={t("Total Units")}
              onChange={(e, { value }) => handleChange("inStock", +value)}
              value={state.inStock}
            />
            <InputCost label={t("Products") + " " + t("Worth")} value={state.worthPrice} readOnly />
            <InputCost label={t("Kit") + " " + t("Price")} value={state.price} onChange={handlePriceChange} />
          </Form.Group>
          <Divider />
          <Form.Group widths="equal">
            <Form.Select
              fluid
              label={t("Department")}
              options={state.departmentOptions}
              placeholder={t("Department")}
              onChange={(e, { value }) => handleChange("departmentId", value)}
              defaultValue={state.departmentId}
            />
            <Form.Select
              fluid
              label={t("Category")}
              options={state.categoryOptions.filter((cat) => cat.departmentId === state.departmentId)}
              placeholder={t("Category")}
              onChange={(e, { value }) => handleChange("categoryId", value)}
              defaultValue={state.categoryId}
            />

            <Form.Select
              fluid
              label={t("Subcategory")}
              options={state.subcategoryOptions.filter((cat) => cat.categoryId === state.categoryId)}
              placeholder={t("Subcategory")}
              onChange={(e, { value }) => handleChange("subcategoryId", value)}
              defaultValue={state.subcategoryId}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Select
              fluid
              label={t("Brand")}
              options={state.brandOptions.filter(({ departmentId }) => departmentId === state.departmentId)}
              placeholder={t("Brand")}
              onChange={(e, { value }) => handleChange("brandId", value)}
              defaultValue={state.brandId}
            />
            <Form.Select
              fluid
              label={t("Model")}
              options={state.modelOptions.filter(({ brandId }) => brandId === state.brandId)}
              placeholder={t("Model")}
              onChange={(e, { value }) => handleChange("modelId", value)}
              defaultValue={state.modelId}
            />
          </Form.Group>
          <Divider />
          <Form.TextArea
            onChange={(e) => handleChange("description", e.target.value)}
            label={t("Description")}
            placeholder={t("Description")}
            defaultValue={state.description}
          />

          <Button
            type="submit"
            color="teal"
            fluid
            size="small"
            loading={isLoading}
            primary
            disabled={!state.name || !state.selectedProducts.length}
          >
            {t("Submit")}
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
}

export default CreateKitModal;
