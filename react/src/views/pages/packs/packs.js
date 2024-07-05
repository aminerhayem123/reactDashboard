import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import {
  Button,
  Modal,
  Form,
  Image,
  Row,
  Col,
} from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import avatar1 from 'src/assets/images/avatars/1.jpg';

const Packs = () => {
  const [packs, setPacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // State for image modal
  const [modalImages, setModalImages] = useState([]); // State to hold images for modal display
  const [formData, setFormData] = useState({
    brand: '',
    numberOfItems: 1,
    items: [''],
    images: [],
    price: ''
  });
  const [newItemData, setNewItemData] = useState({
    packId: '',
    name: ''
  });
  const [selectedImageIds, setSelectedImageIds] = useState([]); // State to hold IDs of selected images to delete

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, '']
    });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleDrop = (acceptedFiles) => {
    setFormData({
      ...formData,
      images: [...formData.images, ...acceptedFiles]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append('brand', formData.brand);
    data.append('price', formData.price); // Add price to form data
    formData.items.forEach((item, index) => {
      data.append(`items`, item);
    });
    formData.images.forEach((image, index) => {
      data.append(`images`, image);
    });
  
    try {
      await axios.post('http://localhost:5000/packs', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchPacks();
      setShowForm(false);
      setFormData({
        brand: '',
        numberOfItems: 1,
        items: [''],
        images: [],
        price: '' // Reset price
      });
    } catch (error) {
      console.error('Error creating pack:', error);
    }
  };
  

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/packs/${newItemData.packId}/items`, { name: newItemData.name });
      fetchPacks();
      setShowItemForm(false);
      setNewItemData({ packId: '', name: '' });
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/items/${itemId}`);
      fetchPacks(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleShowImages = (images) => {
    setModalImages(images);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setModalImages([]);
    setSelectedImageIds([]); // Clear selected image IDs on modal close
  };

  const handleImageSelect = (index) => {
    setSelectedImageIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(modalImages[index].id)) {
        return prevSelectedIds.filter((id) => id !== modalImages[index].id);
      } else {
        return [...prevSelectedIds, modalImages[index].id];
      }
    });
  };

  const handleDeleteSelectedImages = async () => {
    try {
      await axios.delete(`http://localhost:5000/images/delete`, {
        data: { imageIds: selectedImageIds }, // Pass array of selected image IDs to delete
      });
  
      // Remove selected images from modalImages state
      const updatedImages = modalImages.filter((image) => !selectedImageIds.includes(image.id));
      setModalImages(updatedImages);
  
      setSelectedImageIds([]); // Clear selected image IDs after deletion
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };  

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

  // Function to render the delete button
  const renderDeleteButton = () => {
    if (selectedImageIds.length > 0) {
      return (
        <Button variant="danger" onClick={handleDeleteSelectedImages}>
          Delete Selected Images
        </Button>
      );
    }
    return null;
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowForm(true)} className="mb-4">
        Add Pack
      </Button>
      <CCard className="mb-4">
        <CCardHeader>Packs</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary text-center">User</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Brand</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Items</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Images</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Price</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Created Date</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {packs.map((pack, index) => (
              <CTableRow key={index}>
                <CTableDataCell className="text-center">
                  <img src={pack.avatar?.src || avatar1} className="rounded-circle" alt="avatar" width="48" height="48" />
                </CTableDataCell>
                <CTableDataCell>
                  <div>{pack.brand}</div>
                  <div className="small text-muted">Items: {pack.items.length}</div>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  {pack.items.map((item, idx) => (
                    <div key={idx}>
                      {item.name}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="ms-2"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </CTableDataCell>
                <CTableDataCell>
                  <Button
                    variant="primary"
                    onClick={() => handleShowImages(pack.images)}
                  >
                    View Images
                  </Button>
                </CTableDataCell>
                <CTableDataCell>{pack.price}</CTableDataCell> {/* Display Price */}
                <CTableDataCell>{new Date(pack.created_date).toLocaleString()}</CTableDataCell> {/* Display Created Date */}
                <CTableDataCell>
                  <Button variant="secondary" onClick={() => { setNewItemData({ packId: pack.id, name: '' }); setShowItemForm(true); }}>
                    Add Item
                  </Button>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      {/* Modal for Images */}
      <Modal show={showImageModal} onHide={handleCloseImageModal}>
        <Modal.Header closeButton>
          <Modal.Title>Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {modalImages.map((image, idx) => (
              <Col md={4} key={idx} className="mb-3">
                <Image
                  src={`data:image/jpeg;base64,${image.data}`}
                  thumbnail
                  onClick={() => handleImageSelect(idx)} // Select image on click
                  className={selectedImageIds.includes(image.id) ? 'border border-primary rounded' : 'rounded'}
                />
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {renderDeleteButton()}
          <Button variant="secondary" onClick={handleCloseImageModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Pack Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Pack</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBrand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand"
                name="brand"
                value={formData.brand}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              required
            />
          </Form.Group>
            <Form.Group controlId="formNumberOfItems">
              <Form.Label>Number of Items</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter number of items"
                name="numberOfItems"
                value={formData.numberOfItems}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formItems">
              <Form.Label>Items</Form.Label>
              {formData.items.map((item, index) => (
                <div key={index} className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
              <Button variant="outline-primary" onClick={handleAddItem}>
                Add Item
              </Button>
            </Form.Group>
            <Form.Group controlId="formImages">
              <Form.Label>Images</Form.Label>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Item Modal */}
      <Modal show={showItemForm} onHide={() => setShowItemForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddNewItem}>
            <Form.Group controlId="formItemName">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter item name"
                value={newItemData.name}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Item
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Packs;
