import React from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Label,
  Modal,
  Header,
} from "semantic-ui-react";
import "./styles.css";
import { createOrder, updateOrder } from "../../../services/orderService";
import {
  prepareClientsOptions,
  prepareProductsOptions,
} from "../../../helpers/options";
import currencyFormatter from "../../../helpers/currencyFormatter";
import currencyFormatterPrefix from "../../../helpers/currencyFormatterPrefix";
import { getProducts } from "../../../services/productService";
import { getClients } from "../../../services/clientService";
import { DatePicker } from "antd";

class OrderForm extends React.Component {
  constructor(props) {
    super(props);
    const { order } = props;
    console.log("order :>> ", order);
    this.state = {
      clientOptions: [],
      productOptions: [],
      modalOpen: false,
      isLoading: false,

      orderId: order?._id,
      items: (order?.items || []).map((p, i) => ({ ...p, id: i + 1 })),
      orderItemsCounter: (order?.items || []).length + 1,
      orderForm: {
        isQuotation: order?.status === 4,
        clientId: order?.client?.id,
        comment: order?.comment,
        orderId: order?.orderId,
        estConclusionDate: undefined,
      },

      orderFormValidation: {
        productId: "",
        clientId: "",
        comment: "",
      },

      errorMsg: "",
    };

    this.handleCreateOrderSubmit = this.handleCreateOrderSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (state.orderId) return null;
  //   const { order } = props;
  //   return {
  //     items: (order?.items || []).map((p, i) => ({ ...p, id: i + 1 })),
  //     orderItemsCounter: (order?.items || []).length + 1,
  //     orderId: order?._id,
  //     orderForm: {
  //       isQuotation: order?.status === 4,
  //       clientId: order?.client?.id || "",
  //       comment: order?.comment || "",
  //     },
  //   };
  // }

  componentDidMount() {}

  handleCreateOrderSubmit = async () => {
    this.setState({ isLoading: true });
    const payload = {
      clientId: this.state.orderForm.clientId,
      comment: this.state.orderForm.comment,
      items: this.state.items,
      isQuotation: this.state.orderForm.isQuotation,
      orderId: this.state.orderForm.orderId,
      estConclusionDate: this.state.orderForm.estConclusionDate,
    };
    (this.state.orderId
      ? updateOrder(this.state.orderId, payload)
      : createOrder(payload, this.props.organizationId)
    )
      .then((resp) => {
        this.props.addToast("Order saved successfully!", {
          appearance: "success",
        });
        this.handleCloseModal();
        this.setState({ ...this.state, items: [] });
        this.props.loadOrders();
      })
      .catch((err) => {
        this.props.addToast(err.message, { appearance: "error" });
        this.setState({ isLoading: false, errorMsg: err.message });
      });
    this.setState({ isLoading: false });
  };

  handleChange = (elem, val, callback = () => {}) => {
    this.setState(
      {
        orderForm: {
          ...this.state.orderForm,
          [elem]: val,
        },
      },
      callback
    );
  };
  handleOrderItemChange = (id, elem, val) => {
    const products = this.state.items;

    Object.assign(products[id - 1], { [elem]: val });
    this.setState(
      {
        items: products,
      },
      () => console.log(this.state)
    );
  };

  setFieldValidation = (field, validationFunc) => {
    this.setState({
      orderFormValidation: {
        ...this.state.orderFormValidation,
        [field]: validationFunc(),
      },
    });
  };
  toggleModal = () => {
    this.setState({
      modalOpen: !this.state.modalOpen,
      items: [],
      errorMsg: "",
    });
  };

  handleCloseModal = () => {
    this.props.onClose();
  };

  addOrderItem = () => {
    const newOrder = {
      id: this.state.orderItemsCounter,
    };
    this.setState(
      {
        items: [...this.state.items, newOrder],
        orderItemsCounter: this.state.orderItemsCounter + 1,
      },
      () => console.log(this.state)
    );
  };

  removeOrderItem = (index) => () => {
    this.setState({
      ...this.state,
      items: this.state.items.filter((o) => o.id !== index),
    });
  };

  getTotalOrderPrice = () => {
    return this.state.items.reduce(
      (acc, order) =>
        (acc +=
          ((
            this.props.productOptions.find(
              ({ value }) => order.productId === value
            ) || {}
          ).price || 0) * order.amount || 0),
      0
    );
  };

  handleEstConclusionDateChange = (date) => {
    this.setState({
      ...this.state,
      orderForm: {
        ...this.state.orderForm,
        estConclusionDate: date.unix() * 1000,
      },
    });
  };

  render() {
    const { clientOptions, productOptions } = this.props;
    return (
      <Modal closeIcon open onClose={this.handleCloseModal}>
        <Modal.Header>Create an order</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Group widths="equal">
              <Form.Select
                fluid
                label="Client"
                options={clientOptions}
                placeholder="Client"
                onChange={(e, { value }) => {
                  this.handleChange("clientId", value);
                }}
                defaultValue={this.state.orderForm.clientId}
              />
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field>
                <Checkbox
                  label="Quotation order"
                  defaultChecked={!!this.state.orderForm.isQuotation}
                  onChange={(e, { value }) => {
                    this.handleChange(
                      "isQuotation",
                      !this.state.orderForm.isQuotation
                    );
                  }}
                />
              </Form.Field>
            </Form.Group>

            {this.state.items.map((product, i) => (
              <React.Fragment key={product.productId}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px 0",
                  }}
                >
                  <Header as="h5">Add Product {i + 1}</Header>
                  {i !== 0 && (
                    <Button
                      onClick={this.removeOrderItem(product.id)}
                      secondary
                    >
                      Remove Order
                    </Button>
                  )}
                </div>
                <Form.Group widths="equal">
                  <Form.Select
                    fluid
                    label="Product"
                    options={productOptions}
                    placeholder="Product"
                    value={console.log(product.productId) || product.productId}
                    onChange={(e, { value }) => {
                      this.handleOrderItemChange(
                        product.id,
                        "productId",
                        value
                      );
                    }}
                  />
                  <Form.Input
                    className="five wide field"
                    label="Number Of Items"
                    placeholder="Number Of Items"
                    type="number"
                    step={1}
                    defaultValue={product.amount}
                    onChange={(e) => {
                      this.handleOrderItemChange(
                        product.id,
                        "amount",
                        +e.target.value
                      );
                    }}
                  />
                  <Form.Input
                    className="six wide field"
                    label="Price"
                    value={
                      "R$ " +
                      currencyFormatter.format(
                        ((
                          productOptions.find(
                            ({ value }) => product.productId === value
                          ) || {}
                        ).price || 0) * (product.amount || 0)
                      )
                    }
                    readOnly
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.TextArea
                    onChange={(e) =>
                      this.handleOrderItemChange(
                        product.id,
                        "comment",
                        e.target.value
                      )
                    }
                    defaultValue={product.comment}
                    label="About"
                    placeholder="order comment "
                  />
                </Form.Group>
              </React.Fragment>
            ))}

            <Form.Button
              fluid
              // label='Client'
              // options={this.state.clientOptions}
              placeholder="Client"
              onClick={this.addOrderItem}
            >
              Add order item
            </Form.Button>
            <div>
              <span style={{ marginRight: 16 }}>Estimated Conclusion Date</span>
              <DatePicker
                onChange={this.handleEstConclusionDateChange}
                format="DD/MM/YYYY"
              />
            </div>

            <Form.TextArea
              onChange={(e) => this.handleChange("comment", e.target.value)}
              label="About"
              placeholder="order comment "
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, lineHeight: "36px" }}>
                Total: R$ {currencyFormatter.format(this.getTotalOrderPrice())}
              </div>
              {this.state.errorMsg !== "" && (
                <Label color={"red"}>{this.state.errorMsg}</Label>
              )}
              <Button
                style={{ marginLeft: "auto", marginRight: 0 }}
                color="teal"
                onClick={this.handleCreateOrderSubmit}
                loading={this.state.isLoading}
              >
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}

export default OrderForm;
