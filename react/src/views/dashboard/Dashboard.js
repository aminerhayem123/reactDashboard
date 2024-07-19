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
import Transactions from '../pages/Transactions/Transactions'; // Adjust the path as per your folder structure
import pack from '../pages/packs/packs';
import Packs from '../pages/packs/packs';
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
      {/* Transactions Table */}
      <Packs hideActions={true} hideSearch={true} />
      {/* Transactions Table */}
      <Transactions hideActions={true} hideSearch={true} />
    </>
  );
};

export default Dashboard;
