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
import PackStatusCell from './PackStatusCell';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useMemo } from 'react';
import { Trash } from 'react-bootstrap-icons';
import avatar1 from 'src/assets/images/avatars/1.jpg';

const Packs = () => {
  const formatDate = (date) => {
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false // Use 24-hour format
    };
    return date.toLocaleString(undefined, options);
  };
  const [brandFilter, setBrandFilter] = useState('');
  const [packIdFilter, setPackIdFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'ascending' });
  const [packs, setPacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // State for image modal
  const [modalImages, setModalImages] = useState([]); // State to hold images for modal display
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleAmount, setSaleAmount] = useState('');
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [selectedPackPrice, setSelectedPackPrice] = useState(0);

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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedPacks = useMemo(() => {
    const sortablePacks = [...packs];
    if (sortConfig.key === 'price') {
      sortablePacks.sort((a, b) => {
        if (sortConfig.direction === 'ascending') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    } else if (sortConfig.key === 'date') {
      sortablePacks.sort((a, b) => {
        const dateA = new Date(a.created_date);
        const dateB = new Date(b.created_date);
        if (sortConfig.direction === 'ascending') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    return sortablePacks;
  }, [packs, sortConfig]);
  
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      // Ensure newItemData.packId is set correctly before proceeding
      if (!newItemData.packId) {
        console.error('Pack ID is missing.');
        return;
      }
  
      // Send the POST request to add a new item
      await axios.post(`http://localhost:5000/packs/${newItemData.packId}/items`, { name: newItemData.name });
      
      // Refresh the packs list after adding the new item
      fetchPacks();
      
      // Reset the form and modal state
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

  const filteredPacks = useMemo(() => {
    let filteredData = sortedPacks;
  
    if (brandFilter) {
      filteredData = filteredData.filter(pack => pack.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    }
  
    if (packIdFilter) {
      filteredData = filteredData.filter(pack => pack.id === parseInt(packIdFilter)); // Assuming pack ID is a number
    }
  
    return filteredData;
  }, [sortedPacks, brandFilter, packIdFilter]);
  
  const handleSold = (packId, packPrice) => {
    setSelectedPackId(packId);
    setSelectedPackPrice(packPrice);
    setShowSaleModal(true);
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
  
    const profit = saleAmount - selectedPackPrice;
  
    try {
      const response = await axios.post(`http://localhost:5000/packs/${selectedPackId}/sold`, {
        amount: saleAmount,
        profit: profit,
      });
  
      console.log('Sale recorded successfully:', response.data);
  
      // Close the modal after submitting
      setShowSaleModal(false);
  
      // Refresh packs data
      fetchPacks();
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };
  

  return (
    <>
      
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Button variant="primary" onClick={() => setShowForm(true)} className="mb-2">
          Add Pack
        </Button>
        <div className="flex-grow-1 ms-3">
          <Form.Control
            type="text"
            placeholder="Filter by Brand"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            style={{ width: '130px' }} // Adjust width as needed
          />
        </div>
      </div>
      <CCard className="mb-4">
        <CCardHeader>Packs</CCardHeader>
        <CCardBody>
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary text-center">User</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Brand</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Items</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Images</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('price')}>
                Price
                {sortConfig.key === 'price' && (
                  <FontAwesomeIcon
                  icon={sortConfig.key === 'price' ? (sortConfig.direction === 'ascending' ? faCaretUp : faCaretDown) : (sortConfig.direction === 'ascending' ? faSortUp : faSortDown)}
                  className="ms-2"
                />
                )}
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('date')}>
                Date
                {sortConfig.key === 'date' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ms-2"
                  />
                )}
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
          {filteredPacks.map((pack, index) => (
              <CTableRow key={index}>
                <CTableDataCell className="text-center">
                  <img src={pack.avatar?.src || avatar1} className="rounded-circle" alt="avatar" width="40" height="40" />
                </CTableDataCell>
                <CTableDataCell>{pack.brand}</CTableDataCell>
                <PackStatusCell status={pack.status} />
                <CTableDataCell className="text-center">
                  {pack.items.map((item, idx) => (
                    <div key={idx}>
                      {item.name}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="ms-4"
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
                <CTableDataCell>{pack.price}</CTableDataCell>
                <CTableDataCell>{formatDate(new Date(pack.created_date))}</CTableDataCell>
                <CTableDataCell>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setNewItemData({ packId: pack.id, name: '' });
                      setShowItemForm(true);
                    }}
                  >
                    Add Item
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSold(pack.id, pack.price)}
                  >
                    Mark as Sold
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
                <div key={index} className="mb-2 d-flex align-items-center">
                  <Form.Control
                    type="text"
                    placeholder={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    required
                    style={{ marginRight: '10px' }}
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      const newItems = [...formData.items];
                      newItems.splice(index, 1);
                      setFormData({
                        ...formData,
                        items: newItems,
                      });
                    }}
                    className="align-self-start"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
              <Button variant="outline-primary" onClick={handleAddItem}>
                Add Item
              </Button>
            </Form.Group>
            <Form.Group controlId="formImages">
              <Form.Label>Images</Form.Label>
              <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer', marginTop: '10px' }} {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Import Pictures</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                  {formData.images.map((file, index) => (
                    <div key={index} style={{ width: '100px', height: '100px', marginRight: '10px', marginBottom: '10px', position: 'relative' }}>
                      <img src={URL.createObjectURL(file)} alt={`Preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} />
                    </div>
                  ))}
                </div>
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
       {/* Modal for marking pack as sold */}
       <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sold</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaleSubmit}>
            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Packs;
