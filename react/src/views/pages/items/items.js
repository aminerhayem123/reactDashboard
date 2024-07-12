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
  CButton,
  CInputGroup,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';

import avatar from 'src/assets/images/avatars/1.jpg';

const Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const itemsWithAvatars = data.map(item => ({
        ...item,
        avatar,
      }));
      setItems(itemsWithAvatars);
      setFilteredItems(itemsWithAvatars);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setItems(items.filter(item => item.id !== id));
      setFilteredItems(filteredItems.filter(item => item.id !== id));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.id.toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Items</CCardHeader>
      <CCardBody>
        <CInputGroup className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or ID"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </CInputGroup>

        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary">ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Pack ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredItems.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.id}</CTableDataCell>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.pack_id}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" onClick={() => deleteItem(item.id)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
};

export default Items;
