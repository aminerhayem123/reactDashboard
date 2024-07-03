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
  Image
} from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import avatar1 from 'src/assets/images/avatars/1.jpg';

const Packs = () => {
  const [packs, setPacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    numberOfItems: 1,
    items: [''],
    images: []
  });
  const [newItemData, setNewItemData] = useState({
    packId: '',
    name: ''
  });

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
        images: []
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

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
                <CTableHeaderCell className="bg-body-tertiary text-center">
                  User
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Brand</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary text-center">Items</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Images</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Action</CTableHeaderCell>
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
                    {pack.images.map((image, idx) => (
                      <Image key={idx} src={`data:image/jpeg;base64,${image.data}`} width="48" height="48" />
                    ))}
                  </CTableDataCell>
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
                name="brand"
                value={formData.brand}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formItems">
              <Form.Label>Items</Form.Label>
              {formData.items.map((item, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  required
                />
              ))}
              <Button variant="link" onClick={handleAddItem}>Add Item</Button>
            </Form.Group>
            <Form.Group controlId="formImages">
              <Form.Label>Images</Form.Label>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
              <div>
                {formData.images.map((file, idx) => (
                  <div key={idx}>{file.name}</div>
                ))}
              </div>
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
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
                name="name"
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
