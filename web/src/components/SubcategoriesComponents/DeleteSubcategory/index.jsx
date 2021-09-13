import React, {useState} from 'react'
import {Button, Icon, Modal} from 'semantic-ui-react'
import {deleteSubcategory} from "../../../services/subcategoriesService";

const DeleteSubcategory = ({title, id, addToast, loadSubcategories}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const deleteSubcat = () => {
        deleteSubcategory(id)
            .then(resp => {
                    addToast(
                        `Subcategory deleted successfully`,
                        {appearance: 'success'})
                }
            )
            .catch(err => {
                if (err.message !== '') {
                    addToast('Could not delete subcategory: ' + err.message, {appearance: 'error'})
                } else {
                    addToast('Something went wrong', {appearance: 'error'})
                }
            }).finally(
            () => {
                toggleModal();
                loadSubcategories()
            }
        )
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }
    return (
        <Modal
            trigger={<Button
                className='table-action-btn'
                onClick={toggleModal}>
                <Icon name='trash'/>
            </Button>}
            open={isModalOpen}
            closeIcon
        >
            <Modal.Header>Delete a category</Modal.Header>
            <Modal.Content>
                <h4>Are you sure you want to delete category {`"${title}"`}?</h4>
                <Button color='red' inverted onClick={deleteSubcat}>
                    <Icon name='remove'/> Delete
                </Button>
                <Button color='blue' inverted onClick={toggleModal}>
                    <Icon name='checkmark'/> Cancel
                </Button>
            </Modal.Content>
        </Modal>)


}

export default DeleteSubcategory;
