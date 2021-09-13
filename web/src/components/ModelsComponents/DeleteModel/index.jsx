import React, {useState} from 'react'
import {Button, Icon, Modal} from 'semantic-ui-react'
import {deleteModel} from "../../../services/modelsService";

const DeleteModel = ({title, id, addToast, loadModels}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const removeModel = () => {
        deleteModel(id)
            .then(resp => {
                    addToast(
                        `Model deleted successfully`,
                        {appearance: 'success'})
                }
            )
            .catch(err => {
                if (err.message !== '') {
                    addToast('Could not delete model: ' + err.message, {appearance: 'error'})
                } else {
                    addToast('Something went wrong', {appearance: 'error'})
                }
            }).finally(
            () => {
                toggleModal();
                loadModels()
            }
        )
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }
    return (
        <Modal
            trigger={<Button
                className={'table-action-btn'}
                onClick={toggleModal}>
                <Icon name='trash'/>
            </Button>}
            open={isModalOpen}
            onClose={toggleModal}
            closeIcon
        >
            <Modal.Header>Delete a model</Modal.Header>
            <Modal.Content>
                <h4>Are you sure you want to delete model {`"${title}"`}?</h4>
                <Button color='red' inverted onClick={removeModel}>
                    <Icon name='remove'/> Delete
                </Button>
                <Button color='blue' inverted onClick={toggleModal}>
                    <Icon name='checkmark'/> Cancel
                </Button>
            </Modal.Content>
        </Modal>)


}

export default DeleteModel;
