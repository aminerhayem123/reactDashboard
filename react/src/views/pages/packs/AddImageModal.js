import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const AddImageModal = ({ show, onHide, packId, handleShowModal }) => {
  const [images, setImages] = useState([]);

  // Function to handle image drop
  const onDrop = (acceptedFiles) => {
    const updatedImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file) // Generate preview URL for each image
    }));
    setImages(prevImages => [...prevImages, ...updatedImages]);
  };

  // UseDropzone hook to handle file drop
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!packId) {
      console.error('Pack ID is undefined or null');
      return;
    }
  
    // Create FormData object
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image.file); // Append each image to FormData
    });
  
    try {
      // Adjust the URL to match your backend endpoint
      const response = await axios.post(`http://localhost:5000/packs/${packId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Images uploaded successfully:', response.data);
      onHide(); // Close modal after successful upload
      // Reload the current page
      window.location.reload();
    } catch (error) {
      console.error('Error uploading images:', error);
      // Handle error (e.g., show error message to user)
    }
  };
  
  
  // Function to clear all selected images
  const handleClear = () => {
    setImages([]);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Images for Pack</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formImages">
            <Form.Label>Drag & Drop Images</Form.Label>
            <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer', marginTop: '10px' }}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop images here, or click to select images</p>
              {images.length > 0 &&
                <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                  {images.map((image, index) => (
                    <div key={index} style={{ width: '100px', height: '100px', marginRight: '10px', marginBottom: '10px', position: 'relative' }}>
                      <img src={image.preview} alt={`Preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} />
                    </div>
                  ))}
                </div>
              }
            </div>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={images.length === 0}>
            Save
          </Button>
          {images.length > 0 &&
            <Button variant="outline-danger" onClick={handleClear} style={{ marginLeft: '10px' }}>
              Clear Images
            </Button>
          }
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddImageModal;
