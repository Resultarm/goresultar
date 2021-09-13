import React, {useState} from 'react'
import {Button, Icon, Modal} from 'semantic-ui-react'
import {deleteCategory} from "../../../services/categoriesService";
import './styles.css'

const DeleteCategory = ({title, id, addToast, loadCategories}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const removeCategory = () => {
        deleteCategory(id)
            .then(resp => {
                    addToast(
                        `Category deleted successfully`,
                        {appearance: 'success'})
                }
            )
            .catch(err => {
                if (err.message !== '') {
                    addToast('Could not delete category: ' + err.message, {appearance: 'error'})
                } else {
                    addToast('Something went wrong', {appearance: 'error'})
                }
            }).finally(
            () => {
                toggleModal();
                loadCategories()
            }
        )
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }
    return (
        <Modal
            trigger={<Button className={'cat-delete-btn cat-btn'} onClick={toggleModal}>
                <Icon name='trash'/>
            </Button>}
            open={isModalOpen}
            closeIcon
        >
            <Modal.Header>Delete a category</Modal.Header>
            <Modal.Content>
                <h4>Are you sure you want to delete category {`"${title}"`}?</h4>
                <Button color='red' inverted onClick={removeCategory}>
                    <Icon name='remove'/> Delete
                </Button>
                <Button color='blue' inverted onClick={toggleModal}>
                    <Icon name='checkmark'/> Cancel
                </Button>
            </Modal.Content>
        </Modal>)


}

export default DeleteCategory;
