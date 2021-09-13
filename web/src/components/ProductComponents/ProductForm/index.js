import React from "react";
import * as productService from "../../../services/productService";
import "./styles.css";
import { staticFormOptions } from "../../../helpers/options";
import { isTextValid } from "../../../helpers/validations";
import { Button, Divider, Form, Modal } from "semantic-ui-react";
import currencyParser from "../../../helpers/currencyParser";
import currencyFormatter from "../../../helpers/currencyFormatter";
import enforceNumber from "../../../helpers/enforceNumber";
import { OrganizationContext } from "src/contexts";
import { withTranslation } from "react-i18next";

const preventEnter = (event) => {
  if (event.keyCode == 13) {
    event.preventDefault();
    return false;
  }
};

const isNumberValid = (number) => {
  if (typeof number === "number") {
    return number > 0;
  } else if (typeof number === "string") {
    return /(?=.*?\d)^\$?(([1-9]\d{0,2}(\.\d{3})*)|\d+)?(,\d{1,2})?$/.test(number);
  } else {
    return false;
  }
};

class ProductForm extends React.Component {
  static contextType = OrganizationContext;
  constructor(props) {
    super(props);
    const unitType = this.props.product.unitType || "unit";
    console.log("this.props.product :>> ", this.props.product);
    this.state = {
      statusOptions: [],

      isLoading: false,
      modalOpen: false,
      error: "",
      productForm: {
        title: this.props.product.title,
        ISBN: this.props.product.ISBN,
        minStockThreshold: this.props.product.minStockThreshold || 0,
        description: this.props.product.description,
        status: this.props.product.status,
        cost: this.props.product.cost ? currencyFormatter.format(this.props.product.cost) : undefined,
        price: this.props.product.price ? currencyFormatter.format(this.props.product.price) : undefined,
        revenue: this.props.product.price
          ? currencyFormatter.format(this.props.product.price - this.props.product.cost)
          : undefined,
        revenueFormat: this.props.product.revenueFormat || "abs",
        totalUnits: this.props.product.totalUnits,
        departmentId: this.props.product.departmentId,
        categoryId: this.props.product.categoryId,
        subcategoryId: this.props.product.subcategoryId,
        brandId: this.props.product.brandId,
        modelId: this.props.product.modelId,
        providerId: this.props.product.providerId,
        sellBy: this.props.product.sellBy,
        comment: this.props.product.comment,
        unitType: unitType,
        unit: {
          [unitType]: {
            unit: this.props.product.unit[unitType].unit,
            value: this.props.product.unit[unitType].value,
          },
        },
      },

      productFormValidation: {
        title: true,
        weight: true,
        size: true,
        volume: true,
        description: true,
        status: true,
        cost: true,
        price: true,
        revenue: true,
        revenueFormat: true,
        totalUnits: true,
        departmentId: true,
        categoryId: true,
        subcategoryId: true,
        brandId: true,
        modelId: true,
        sellBy: true,
        comment: true,
      },
    };

    this.handleCreateProductSubmit = this.handleCreateProductSubmit.bind(this);
    this.handleRevenueFormatChange = this.handleRevenueFormatChange.bind(this);
    this.updateProductFormState = this.updateProductFormState.bind(this);
    this.updatePrice = this.updatePrice.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.volumeSelector = this.volumeSelector.bind(this);
    this.weightSelector = this.weightSelector.bind(this);
    this.sizeSelector = this.sizeSelector.bind(this);
  }

  volumeSelector = () => {
    const selectPlaceHolder = staticFormOptions.sizeOptions.filter((opt) => opt.value === this.state.productForm.volume.unit);
    return (
      <Form.Group widths="equal">
        <Form.Select
          fluid
          label="Volume"
          options={staticFormOptions.volumeOptions}
          placeholder={selectPlaceHolder.length > 0 ? selectPlaceHolder[0].text : "e.g. 10"}
          onChange={(e, { value }) => {
            this.handleChange("volume.unit", value, () => console.log(this.state.productForm));
          }}
        />
        <Form.Input
          placeholder={this.state.productForm.volume.value}
          fluid
          label="Value"
          onChange={(e) => {
            this.handleChange("volume.value", +e.target.value);
          }}
        />
      </Form.Group>
    );
  };
  weightSelector = () => {
    const selectPlaceHolder = staticFormOptions.sizeOptions.filter((opt) => opt.value === this.state.productForm.weight.unit);
    return (
      <Form.Group widths="equal">
        <Form.Select
          fluid
          label="Weight"
          options={staticFormOptions.weightOptions}
          placeholder={selectPlaceHolder.length > 0 ? selectPlaceHolder[0].text : "e.g. 10"}
          onChange={(e, { value }) => {
            this.handleChange("weight.unit", value);
          }}
        />
        <Form.Input
          fluid
          label="Value"
          placeholder={this.state.productForm.weight.value}
          onChange={(e) => {
            this.handleChange("weight.value", +e.target.value);
          }}
        />
      </Form.Group>
    );
  };
  sizeSelector = () => {
    const heightPlaceHolder = staticFormOptions.sizeOptions.filter((opt) => opt.value === this.state.productForm.height.unit);
    const widthPlaceHolder = staticFormOptions.sizeOptions.filter((opt) => opt.value === this.state.productForm.width.unit);
    const lengthPlaceHolder = staticFormOptions.sizeOptions.filter((opt) => opt.value === this.state.productForm.length.unit);
    return (
      <Form.Group widths="equal">
        <Form.Select
          fluid
          label="Height measure"
          options={staticFormOptions.sizeOptions}
          placeholder={heightPlaceHolder.length > 0 ? heightPlaceHolder[0].text : "e.g. 10"}
          onChange={(e, { value }) => {
            this.handleChange("height.unit", value);
          }}
        />
        <Form.Input
          fluid
          label="Value"
          placeholder={this.state.productForm.height.value}
          onChange={(e) => {
            this.handleChange("height.value", +e.target.value);
          }}
        />

        <Form.Select
          fluid
          label="Width measure"
          options={staticFormOptions.sizeOptions}
          placeholder={widthPlaceHolder.length > 0 ? widthPlaceHolder[0].text : "e.g. 10"}
          onChange={(e, { value }) => {
            this.handleChange("size.width.unit", value, () => console.log(this.state.productForm));
          }}
        />
        <Form.Input
          fluid
          label="Value"
          placeholder={this.state.productForm.width.value}
          // value={productForm.size.width.value}
          onChange={(e) => {
            this.handleChange("size.width.value", +e.target.value);
          }}
        />
        <Form.Select
          fluid
          label="Length measure"
          options={staticFormOptions.sizeOptions}
          placeholder={lengthPlaceHolder.length > 0 ? lengthPlaceHolder[0].text : "e.g. 10"}
          onChange={(e, { value }) => {
            this.handleChange("size.length.unit", value);
          }}
        />
        <Form.Input
          fluid
          label="Value"
          // placeholder='e.g. 10 '
          placeholder={this.state.productForm.length.value}
          // value={productForm.size.length.value}
          // placeholder={staticFormOptions.sizeOptions
          //                    .filter(opt => opt.value === productForm.size.length.unit)[0].text}
          onChange={(e) => {
            this.handleChange("size.length.value", +e.target.value);
          }}
        />
      </Form.Group>
    );
  };

  handleCreateProductSubmit = async () => {
    if (
      !isNumberValid(this.state.productForm.cost) ||
      !isNumberValid(this.state.productForm.price) ||
      !isNumberValid(this.state.productForm.revenue)
    ) {
      return;
    }

    this.setState({ isLoading: true });

    const payload = {
      title: this.state.productForm.title,
      description: this.state.productForm.description,
      ISBN: this.state.productForm.ISBN,
      cost: currencyParser(this.state.productForm.cost),
      price: currencyParser(this.state.productForm.price),
      revenue: currencyParser(this.state.productForm.revenue),
      totalUnits: this.state.productForm.totalUnits,
      departmentId: this.state.productForm.departmentId,
      unitType: this.state.productForm.unitType,
      minStockThreshold: this.state.productForm.minStockThreshold,
      unit: {
        [this.state.productForm.unitType]: {
          unit: this.state.productForm[`unit.${this.state.productForm.unitType}.unit`],
          value: this.state.productForm[`unit.${this.state.productForm.unitType}.value`],
        },
      },
      categoryId: this.state.productForm.categoryId,
      subcategoryId: this.state.productForm.subcategoryId,
      brandId: this.state.productForm.brandId,
      modelId: this.state.productForm.modelId,
      providerId: this.state.productForm.providerId || undefined,
      sellBy: this.state.productForm.sellBy,
      comment: this.state.productForm.comment,
      // organizationId: this.state.productForm.organizationId,
    };

    (this.props.product._id
      ? productService.updateProduct(this.props.product._id, payload)
      : productService.createProduct(payload, this.context)
    )
      .then((resp) => {
        this.props.addToast(this.props.t("Product") + " " + this.props.t("saved successfully"), {
          appearance: "success",
        });
        this.props.onSave();
      })
      .catch((err) => this.props.addToast(this.props.t("Something went wrong"), { appearance: "error" }))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  handleRevenueFormatChange = (value) => {
    this.setState(
      {
        productForm: {
          ...this.state.productForm,
          revenueFormat: value,
        },
      },
      this.updatePrice
    );
  };

  updateProductFormState = (upd) => {
    this.setState(
      {
        productForm: {
          ...this.state.productForm,
          ...upd,
        },
      },
      () => console.log("updateProductFormState", this.state.productForm)
    );
  };

  sizev2Selector = () => {
    return (
      <Form.Group widths="equal">
        <Form.Select
          fluid
          label="Metric"
          options={staticFormOptions.sizev2Options}
          placeholder="Metric"
          onChange={(e, { value }) => {
            this.handleChange("unit.size.unit", value);
          }}
        />
        <Form.Input
          fluid
          label="Value"
          placeholder="e.g. 10 "
          type="number"
          onChange={(e) => {
            this.handleChange("unit.size.value", +e.target.value);
          }}
        />
      </Form.Group>
    );
  };

  updatePrice = () => {
    const cost = currencyParser(this.state.productForm.cost);

    const revenue = currencyParser(this.state.productForm.revenue);

    let price = 0;
    if (this.state.productForm.revenueFormat === "pct") {
      price = cost + (cost * revenue) / 100;
    } else {
      price = cost + revenue;
    }
    // switch (format) {
    //   case "pct":
    //     this.updateProductFormState({ price: cost + (cost * revenue) / 100 });
    //     return;
    //   case "abs":
    //     this.updateProductFormState({ price: cost + revenue });
    //     return;
    //   default:
    //   }
    this.updateProductFormState({
      price: new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 2,
      }).format(price),
    });
    this.setFieldValidation("price", () => isNumberValid(price));
  };

  handleChange = (elem, val, callback = () => {}) => {
    let upd = { [elem]: val };

    // if (elem === "price") {
    //   const price = Number(val);
    //   if (!Number.isFinite(price) || Number.isNaN(price)) {
    //     throw Error("price should be number");
    //   }
    //   upd = { [elem]: price };
    // }

    console.log(upd);
    switch (elem) {
      case "departmentId":
        Object.assign(upd, {
          categoryId: "",
          subcategoryId: "",
        });
        break;
      case "categoryId":
        Object.assign(upd, {
          subcategoryId: "",
        });
        break;
      case "brandId":
        Object.assign(upd, {
          modelId: "",
        });
        break;
      case "unitType":
        if (val === "unit") {
          Object.assign(upd, { "unit.unit.unit": 1 });
        }
        break;
      default:
        break;
    }
    this.setState(
      {
        productForm: {
          ...this.state.productForm,
          ...upd,
        },
      },
      callback
    );
  };

  setFieldValidation = (field, validationFunc) => {
    this.setState({
      productFormValidation: {
        ...this.state.productFormValidation,
        [field]: validationFunc(),
      },
    });
  };

  handleCloseModal = () => {
    this.props.onClose();
  };

  render() {
    const { t } = this.props;
    return (
      <Modal onClose={this.handleCloseModal} closeIcon open>
        <div className={"container"}>
          <Form
            onKeyDown={preventEnter}
            onSubmit={() => {
              console.log(this.state.productForm);
              this.handleCreateProductSubmit();
            }}
          >
            <Form.Input
              fluid
              label={t("Title")}
              placeholder={t("Title")}
              value={this.state.productForm.title}
              onChange={(e) => this.handleChange("title", e.target.value)}
            />
            <Form.TextArea
              fluid
              type="textarea"
              label={t("Description")}
              placeholder={t("Description")}
              value={this.state.productForm.description}
              onChange={(e) => this.handleChange("description", e.target.value)}
              error={!this.state.productFormValidation.description}
              onBlur={() => this.setFieldValidation("description", () => isTextValid(this.state.productForm.description, 5, 0))}
            />
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label={t("BCode")}
                placeholder={t("BCode")}
                value={this.state.productForm.ISBN}
                onChange={(e) => this.handleChange("ISBN", e.target.value)}
                maxLength={10}
              />
              <Form.Select
                fluid
                label={t("Provider")}
                options={this.props.options.providerOptions}
                defaultValue={
                  (this.props.options.providerOptions.filter((opt) => opt.value === this.state.productForm.providerId)[0] || {})
                    .value
                }
                onChange={(e, { value }) => this.handleChange("providerId", value)}
                readOnly
              />
            </Form.Group>
            {/*<Form.Select fluid*/}
            {/*             label='Status'*/}
            {/*             options={staticFormOptions.statusOptions}*/}
            {/*             placeholder='Status'*/}
            {/*             onChange={e => this.handleChange('status', e.target.value)}*/}
            {/*             error={!this.state.productFormValidation.status}*/}
            {/*             onBlur={() => this.setFieldValidation(*/}
            {/*                 'status',*/}
            {/*                 () => this.isTextValid(this.state.productForm.status, 1, 0))}/>*/}
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label={t("Cost")}
                placeholder={t("Cost Name")}
                onChange={(e) => {
                  this.handleChange("cost", e.target.value, this.updatePrice);
                }}
                defaultValue={this.state.productForm.cost}
                error={!this.state.productFormValidation.cost}
                onBlur={() => this.setFieldValidation("cost", () => isNumberValid(this.state.productForm.cost))}
              />
              <Form.Input
                fluid
                label={t("Total Units")}
                placeholder={t("Total Units")}
                value={this.state.productForm.totalUnits}
                onChange={(e) => this.handleChange("totalUnits", +e.target.value)}
              />
              <Form.Input
                fluid
                label={t("Min Stock Threshold")}
                placeholder={t("Min Stock Threshold")}
                onChange={(e) => this.handleChange("minStockThreshold", +e.target.value)}
                onKeyDown={enforceNumber}
                defaultValue={this.state.productForm.minStockThreshold}
              />
            </Form.Group>
            {/*todo here*/}
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label={t("Desired Profit")}
                placeholder={t("Desired Profit")}
                onChange={(e) => {
                  this.handleChange("revenue", e.target.value, this.updatePrice);
                }}
                defaultValue={this.state.productForm.revenue}
                error={!this.state.productFormValidation.revenue}
                onBlur={() => this.setFieldValidation("revenue", () => isNumberValid(this.state.productForm.revenue))}
              />

              <Form.Radio
                label={t("Percentages")}
                value="pct"
                name="revenue-radio"
                checked={this.state.productForm.revenueFormat === "pct"}
                onChange={(e, { value }) => this.handleRevenueFormatChange(value)}
              />
              <Form.Radio
                label={t("Absolute value")}
                value="abs"
                name="revenue-radio"
                checked={this.state.productForm.revenueFormat === "abs"}
                onChange={(e, { value }) => this.handleRevenueFormatChange(value)}
              />

              <Form.Input
                fluid
                label={t("Price")}
                placeholder={t("Price")}
                value={this.state.productForm.price}
                onChange={(e) => {
                  this.handleChange("price", e.target.value);
                }}
                error={!this.state.productFormValidation.price}
                onBlur={() => this.setFieldValidation("price", () => isNumberValid(this.state.productForm.price))}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Select
                fluid
                label={t("Type")}
                options={staticFormOptions.unitOptions}
                defaultValue={
                  (staticFormOptions.unitOptions.filter((opt) => opt.value === this.state.productForm.unitType)[0] || {}).value
                }
                onChange={(e, { value }) => {
                  this.handleChange("unitType", value);
                }}
              />
            </Form.Group>
            <Divider />
            {this.state.productForm.unitType === "size" ? this.sizev2Selector() : null}
            <Divider />
            <Form.Group widths="equal">
              <Form.Select
                fluid
                label={t("Department")}
                options={this.props.options.departmentOptions}
                defaultValue={
                  (
                    this.props.options.departmentOptions.filter(
                      (opt) => opt.value === this.state.productForm.departmentId
                    )[0] || {}
                  ).value
                }
                onChange={(e, { value }) => this.handleChange("departmentId", value)}
                readOnly
              />
              <Form.Select
                fluid
                label={t("Category")}
                options={this.props.options.categoryOptions.filter(
                  (cat) => cat.departmentId === this.state.productForm.departmentId
                )}
                defaultValue={
                  (this.props.options.categoryOptions.filter((opt) => opt.value === this.state.productForm.categoryId)[0] || {})
                    .value
                }
                readOnly
                onChange={(e, { value }) => this.handleChange("categoryId", value)}
              />

              <Form.Select
                fluid
                label={t("Subcategory")}
                options={this.props.options.subCategoryOptions.filter(
                  (cat) => cat.categoryId === this.state.productForm.categoryId
                )}
                defaultValue={
                  (
                    this.props.options.subCategoryOptions.filter(
                      (opt) => opt.value === this.state.productForm.subcategoryId
                    )[0] || {}
                  ).value
                }
                onChange={(e, { value }) => this.handleChange("subcategoryId", value)}
                readOnly
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Select
                fluid
                label={t("Brand")}
                options={(this.props.options.brandOptions || []).filter(
                  ({ departmentId }) => departmentId === this.state.productForm.departmentId
                )}
                defaultValue={
                  (this.props.options.brandOptions.filter((opt) => opt.value === this.state.productForm.brandId)[0] || {}).value
                }
                onChange={(e, { value }) => this.handleChange("brandId", value)}
                readOnly
              />
              <Form.Select
                fluid
                label={t("Model")}
                options={this.props.options.modelOptions.filter((mod) => mod.brandId === this.state.productForm.brandId)}
                readOnly
                defaultValue={
                  (this.props.options.modelOptions.filter((opt) => opt.value === this.state.productForm.modelId)[0] || {}).value
                }
                // placeholder='Model'
                onChange={(e, { value }) => this.handleChange("modelId", value)}
              />
            </Form.Group>
            <Form.TextArea
              onChange={(e) => this.handleChange("comment", e.target.value)}
              value={this.state.productForm.comment}
              label={t("About")}
              placeholder={t("Comment")}
            />
            <Button color="teal" loading={this.state.isLoading}>
              {"Submit"}
            </Button>
          </Form>
        </div>
      </Modal>
    );
  }
}

export default withTranslation("translation")(ProductForm);
