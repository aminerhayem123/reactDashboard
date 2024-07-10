import React, { useState, useEffect, useMemo } from 'react';
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCardHeader
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import WidgetsDropdown from '../widgets/WidgetsDropdown';
import PackStatusCell from '../pages/packs/PackStatusCell'; // Adjust the path as per your folder structure

const Dashboard = ({ handleLogout }) => {
  const [packs, setPacks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'ascending' });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);

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
      sortablePacks.sort((a, b) => (sortConfig.direction === 'ascending' ? a.price - b.price : b.price - a.price));
    } else if (sortConfig.key === 'date') {
      sortablePacks.sort((a, b) => {
        const dateA = new Date(a.created_date);
        const dateB = new Date(b.created_date);
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      });
    }
    return sortablePacks;
  }, [packs, sortConfig]);

  const formatDate = (date) => {
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false // Use 24-hour format
    };
    return date.toLocaleString(undefined, options);
  };

  const handleViewImage = (images) => {
    setModalImages(images);
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setModalImages([]); // Ensure to clear images when closing
  };

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
      <CCardHeader>Packs</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead className="text-nowrap">
              <CTableRow>
                <CTableHeaderCell className="bg-body-tertiary">Brand</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Items</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('price')}>
                  Price
                  {sortConfig.key === 'price' && (
                    <FontAwesomeIcon
                      icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
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
                <CTableHeaderCell className="bg-body-tertiary">Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {sortedPacks.map((pack, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{pack.brand}</CTableDataCell>
                  <CTableDataCell >
                    {pack.items.map((item, idx) => (
                      <div key={idx}>{item.name}</div>
                    ))}
                  </CTableDataCell>
                  <CTableDataCell>{pack.price}</CTableDataCell>
                  <CTableDataCell>{formatDate(new Date(pack.created_date))}</CTableDataCell>
                  <PackStatusCell status={pack.status} />
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      
    </>
  );
};

export default Dashboard;
