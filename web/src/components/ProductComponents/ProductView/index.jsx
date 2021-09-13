import React from "react";
import { getProduct } from "../../../services/productService";
import { Button, Icon, Modal, Table } from "semantic-ui-react";
import CardCarousel from "../ProductImagesSlider";
import "pure-react-carousel/dist/react-carousel.es.css";
import "./styles.css";
import UploadFile from "../../FileUpload";
import { createProductImage } from "../../../services/productImagesService";
import { formatNumber } from "../../../helpers/formatters";
import moment from "moment";
import currencyFormatter from "../../../helpers/currencyFormatter";
import QRModal from "src/components/QRModal";
import { withTranslation } from "react-i18next";
import { MEASUREMENT_TYPES } from "src/components/DimensionFields/constants";
import MeasurementValueDisplay from "./MeasurementValueDisplay";
import { nf } from "src/helpers";
class ProductViewPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      product: {
        stats: {
          openOrders: {},
          quotations: {},
          closed: {},
          partial: {},
        },
      },
      images: [],
    };
  }

  componentDidMount() {
    const { t } = this.props;

    getProduct(this.props.id)
      .then((resp) => this.setState({ product: resp, loading: false }, () => console.log(this.state)))
      .catch((err) => this.props.addToast(t("Could not fetch") + " " + t("product"), { appearance: "error" }));
  }

  prepareProdDescriptionTableBody = (product) => {
    const { t } = this.props;
    return (
      <Table.Body>
        <Table.Row>
          <Table.Cell>{t("ID")}</Table.Cell>
          <Table.Cell>{product._id}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Title")}</Table.Cell>
          <Table.Cell>{product.title}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("BCode")}</Table.Cell>
          <Table.Cell>{product.ISBN}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Cost")}</Table.Cell>
          <Table.Cell>{currencyFormatter.format(product.cost)}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Price")}</Table.Cell>
          <Table.Cell>{currencyFormatter.format(product.price)}</Table.Cell>
        </Table.Row>
        {!!product.kitItems?.length && (
          <Table.Row>
            <Table.Cell>{t("Items")}</Table.Cell>
            <Table.Cell>{product.kitItems.map(({ title }) => title).join(",")}</Table.Cell>
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>{t("Metric")}</Table.Cell>
          <Table.Cell>{MEASUREMENT_TYPES.find(({ value }) => product.measurementType === value)?.label}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Dimensions")}</Table.Cell>
          <Table.Cell>
            <MeasurementValueDisplay type={product.measurementType} value={product.measurementValue} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Total Units")}</Table.Cell>
          <Table.Cell>{nf(product.totalUnits)}</Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell>{t("Category")}</Table.Cell>
          <Table.Cell>{product.category ? product.category.title : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Department")}</Table.Cell>
          <Table.Cell>{product.department ? product.department.title : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Model")}</Table.Cell>
          <Table.Cell>{product.model ? product.model.title : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Subcategory")}</Table.Cell>
          <Table.Cell>{product.subcategory ? product.subcategory.title : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Brand")}</Table.Cell>
          <Table.Cell>{product.brand ? product.brand.title : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Provider")}</Table.Cell>
          <Table.Cell>{product.provider ? product.provider.name : ""}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Created At")}</Table.Cell>
          <Table.Cell>{moment(product.createdAt * 1000).format("DD/MM/YYYY")}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Comment")}</Table.Cell>
          <Table.Cell>{product.comment}</Table.Cell>
        </Table.Row>
      </Table.Body>
    );
  };

  prepareProductStats = (product) => {
    const { t } = this.props;
    return (
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {t("Open")} {t("Orders")}
          </Table.Cell>
          <Table.Cell>
            {t("Total")} {t("Orders")}: <strong>{this.state.product.stats.openOrders.total}</strong>
          </Table.Cell>
          <Table.Cell>
            {" "}
            {t("Total")} {t("Amount")}: <strong>{this.state.product.stats.openOrders.value}</strong>
          </Table.Cell>

          <Table.Cell>
            {t("Total Units")}: <strong>{formatNumber(this.state.product.stats.openOrders.units)}</strong>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {t("Partial")} {t("Orders")}
          </Table.Cell>
          <Table.Cell>
            {t("Total")} {t("Orders")}:<strong>{this.state.product.stats.partial.total}</strong>
          </Table.Cell>
          <Table.Cell>
            {t("Total Amount")}: <strong>{this.state.product.stats.partial.value}</strong>
          </Table.Cell>
          <Table.Cell>
            {t("Total Units")}: <strong>{formatNumber(this.state.product.stats.partial.units)}</strong>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {t("Closed")} {t("Orders")}
          </Table.Cell>
          <Table.Cell>
            {" "}
            {t("Total Orders")}: <strong>{this.state.product.stats.closed.total}</strong>
          </Table.Cell>
          <Table.Cell>
            {" "}
            {t("Total Amount")}: <strong>{this.state.product.stats.closed.value}</strong>
          </Table.Cell>

          <Table.Cell>
            {t("Total Units")}: <strong>{formatNumber(this.state.product.stats.closed.units)}</strong>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>{t("Quotations")}</Table.Cell>
          <Table.Cell>
            {" "}
            {t("Total Orders")}: <strong>{this.state.product.stats.quotations.total}</strong>
          </Table.Cell>
          <Table.Cell>
            {" "}
            {t("Total Amount")}: <strong>{this.state.product.stats.quotations.value}</strong>
          </Table.Cell>

          <Table.Cell>
            {t("Total Units")}: <strong>{formatNumber(this.state.product.stats.quotations.units)}</strong>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    );
  };

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  fileChangedHandler = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  uploadHandler = (file) => {
    createProductImage(this.props.id, file)
      .then(this.props.addToast(this.props.t("image added"), { appearance: "success" }))
      .catch(this.props.addToast(this.props.t("Something went wrong")));

    window.location.reload();
  };

  render() {
    const { t } = this.props;
    const { loading } = this.state;
    if (loading) {
      return "loading...";
    }
    return (
      <div className="container">
        <div className="product-block product-descr">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <QRModal fileName={this.state.product?._id} />
          </div>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="3">
                  {t("Product")} {t("Description")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            {this.prepareProdDescriptionTableBody(this.state.product)}
            <Table.Footer></Table.Footer>
          </Table>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan="4">
                  {t("Product")} {t("Stats")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            {this.prepareProductStats(this.state.product)}
          </Table>
        </div>
        <div className="product-block product-images">
          <CardCarousel
            images={this.state.product.imageUrls}
            addToast={this.props.addToast}
            productId={this.state.product._id}
          />
          <Modal
            trigger={
              <Button
                onClick={this.toggleModal}
                color="teal"
                style={{ position: "float", float: "center" }}
                className={`menuBtn'`}
              >
                <Icon name="picture" /> {t("Add an image")}
              </Button>
            }
            open={this.state.modalOpen}
            onClose={this.toggleModal}
            closeIcon
          >
            <Modal.Header>{t("Upload a picture")}</Modal.Header>
            <Modal.Content>
              <UploadFile uploadHandler={this.uploadHandler} />
            </Modal.Content>
          </Modal>
        </div>
      </div>
    );
  }
}

export default withTranslation("translation")(ProductViewPage);
