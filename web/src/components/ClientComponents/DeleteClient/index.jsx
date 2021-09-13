import React, {useState} from 'react'
import {Button, Icon, Modal} from 'semantic-ui-react'
import {deleteClient} from "../../../services/clientService";

const DeleteClient = ({name, id, addToast, loadClients}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const removeClient = () => {
        deleteClient(id)
            .then(resp => {
                    addToast(
                        `Client deleted successfully`,
                        {appearance: 'success'})
                }
            )
            .catch(err => {
                if (err.message !== '') {
                    addToast('Could not delete client: ' + err.message, {appearance: 'error'})
                } else {
                    addToast('Something went wrong', {appearance: 'error'})
                }
            }).finally(
            () => {
                handleCloseModal()
            }
        )
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen)
    }

    const handleCloseModal = () => {
        loadClients();
        toggleModal()
    }
    return (
        <Modal
            trigger={<button className='table-action-btn' onClick={toggleModal}>
                <Icon name='trash'/>
            </button>}
            open={isModalOpen}
            onClose={handleCloseModal}
            closeIcon
        >
            <Modal.Header>Delete a client</Modal.Header>
            <Modal.Content>
                <h4>Are you sure you want to delete client {`"${name}"`}?</h4>
                <Button color='red' inverted onClick={removeClient}>
                    <Icon name='remove'/> Delete
                </Button>
                <Button color='blue' inverted onClick={toggleModal}>
                    <Icon name='checkmark'/> Cancel
                </Button>
            </Modal.Content>
        </Modal>)


}

export default DeleteClient;
