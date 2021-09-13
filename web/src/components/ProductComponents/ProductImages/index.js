import React from "react";
import { Icon, Image, Modal, Table } from "semantic-ui-react";
import { getProductImages } from "../../../services/productService";
import { createProductImage } from "../../../services/productImagesService";
import UploadFile from "../../FileUpload";

class ProductImages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      product: {},
      images: [],
      modalOpen: false,
      selectedFile: null,
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.uploadHandler = this.uploadHandler.bind(this);
  }

  createImageRow = (image) => {
    return (
      <Table.Row>
        <Table.Cell width={1}>Upda</Table.Cell>
        <Table.Cell width={1}>del</Table.Cell>
        <Table.Cell width={6}>
          <Image src={image.link} style={{ width: "300px" }} />
        </Table.Cell>
        <Table.Cell>{image.comment}</Table.Cell>
      </Table.Row>
    );
  };
  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  fileChangedHandler = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  render() {
    return (
      <div className={"container"}>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Update a Comment</Table.HeaderCell>
              <Table.HeaderCell>Delete</Table.HeaderCell>
              <Table.HeaderCell>Image</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.state.product.imageUrls.map((image) => this.createImageRow(image))}</Table.Body>
        </Table>
      </div>
    );
  }
}

export default ProductImages;
