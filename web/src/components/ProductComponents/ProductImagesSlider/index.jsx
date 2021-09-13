import { CarouselProvider, Dot, Slide, Slider } from "pure-react-carousel";
import { Button, Card, Container, Icon, Image, Modal } from "semantic-ui-react";
import React, { useState } from "react";

import { deleteProductImage } from "../../../services/productService";

const removeProductImage = (addToast, prodId, imageId, toggleModal) => {
  deleteProductImage(prodId, imageId)
    .then((resp) => {
      window.location.reload(false);
      addToast(`Image deleted successfully`, { appearance: "success" });
    })
    .catch((err) => {
      if (err.message !== "") {
        addToast("Could not delete product image: " + err.message, {
          appearance: "error",
        });
      } else {
        addToast("Something went wrong", { appearance: "error" });
      }
    })
    .finally(() => toggleModal());
};

// const editProductImageComment = (prodId, imageId, comment, addToast, toggleModal) => {
//     updateProductImage(prodId, imageId, {comment})
//         .then(resp => {
//                 window.location.reload(false);
//                 addToast(
//                     `Image deleted successfully`,
//                     {appearance: 'success'})
//             }
//         )
//         .catch(err => {
//             if (err.message !== '') {
//                 addToast('Could not update product image: ' + err.message, {appearance: 'error'})
//             } else {
//                 addToast('Something went wrong', {appearance: 'error'})
//             }
//         }).finally(
//         () => toggleModal()
//     )
// }

const CustomCardSlide = ({ index, image, productId, header, addToast }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // const [comment, setComment] = useState(image.comment)

  const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen);
  // const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen)
  return (
    <Slide index={index}>
      <div>
        <Card centered color="grey">
          <Card.Content>
            <Modal
              trigger={
                <Button
                  icon="delete"
                  style={{ position: "float", float: "right" }}
                  color="orange"
                  onClick={toggleDeleteModal}
                ></Button>
              }
              open={isDeleteModalOpen}
              onClose={toggleDeleteModal}
              closeIcon
            >
              <Modal.Header>Delete a model</Modal.Header>
              <Modal.Content>
                <h4>Are you sure you want to delete this image?</h4>
                <Button
                  color="red"
                  inverted
                  onClick={() => removeProductImage(addToast, productId, image._id, toggleDeleteModal)}
                >
                  <Icon name="remove" /> Delete
                </Button>
                <Button color="blue" inverted onClick={toggleDeleteModal}>
                  <Icon name="checkmark" /> Cancel
                </Button>
              </Modal.Content>
            </Modal>
            {/* <Modal
                            trigger={<Button icon='edit'
                                             style={{position: 'float', float: 'right'}}
                                             color='blue'
                                             onClick={toggleEditModal}
                            >
                            </Button>}
                            open={isEditModalOpen}
                            onClose={toggleEditModal}
                            closeIcon
                        >
                            <Modal.Header>Edit image comment</Modal.Header>
                            <Modal.Content>
                                <Form name="updateCommentForm"  onSubmit={() => editProductImageComment(
                                    productId, image._id, comment, addToast, toggleEditModal)}>
                                    <Form.TextArea
                                        fluid
                                        placeholder="Name"
                                        value={comment}
                                        onChange={ev => setName(ev.target.value)}
                                    />


                                    <br/>

                                    <Button type='submit' color='blue'>
                                        <Icon name='edit outline'/> Save changes
                                    </Button>

                                    <Button color='blue' onClick={toggleEditModal}>
                                        <Icon name='checkmark'/> Cancel
                                    </Button>
                                </Form>
                            </Modal.Content>
                        </Modal>*/}
          </Card.Content>
          <Image src={image.link} verticalAlign="middle" centered size="small" />
          <Card.Content>
            {header}
            <br />
          </Card.Content>
        </Card>
      </div>
    </Slide>
  );
};

const CustomDotGroup = ({ slides, size }) => (
  <Container textAlign="center">
    <Button.Group size={size}>
      {[...Array(slides).keys()].map((slide) => (
        <Button as={Dot} key={slide} icon="circle" slide={slide} />
      ))}
    </Button.Group>
  </Container>
);

CustomDotGroup.defaultProps = {
  size: "mini",
};

const CardCarousel = ({ productId, images, addToast }) => {
  if (images.length === 0) {
    return <></>;
  }

  return (
    <CarouselProvider naturalSlideWidth={1} naturalSlideHeight={1.25} totalSlides={images.length} style={{ width: "55%" }}>
      <Slider>
        {images.map((image) => (
          <CustomCardSlide
            key={image._id}
            addToast={addToast}
            image={image}
            productId={productId}
            index={0}
            header={image.comment || "-"}
            // meta="Friend"
          />
        ))}
      </Slider>

      <CustomDotGroup slides={images.length} />
    </CarouselProvider>
  );
};

CardCarousel.defaultProps = {
  images: [],
};
export default CardCarousel;
