import React, {useState} from 'react'
import {Button, Icon, Modal} from 'semantic-ui-react'
import {deleteAdmin} from "../../../services/adminService";

const DeleteAdmin = ({name, id, addToast, loadAdmins}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const removeAdmin = () => {
        deleteAdmin(id)
            .then(resp => {
                    addToast(
                        `Admin deleted successfully`,
                        {appearance: 'success'})
                }
            )
            .catch(err => {
                if (err.message !== '') {
                    addToast('Could not delete admin: ' + err.message, {appearance: 'error'})
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
        loadAdmins();
        toggleModal()
    }
    return (
        <Modal
            trigger={<Button
                className='table-action-btn'
                onClick={toggleModal}>
                <Icon name='trash'/>
            </Button>}
            open={isModalOpen}
            onClose={handleCloseModal}
            closeIcon
        >
            <Modal.Header>Delete a admin</Modal.Header>
            <Modal.Content>
                <h4>Are you sure you want to delete admin {`"${name}"`}?</h4>
                <Button color='red' inverted onClick={removeAdmin}>
                    <Icon name='remove'/> Delete
                </Button>
                <Button color='blue' inverted onClick={toggleModal}>
                    <Icon name='checkmark'/> Cancel
                </Button>
            </Modal.Content>
        </Modal>)


}

export default DeleteAdmin;
