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
import Transactions from '../pages/Transactions/Transactions'; // Adjust the path as per your folder structure

const Dashboard = ({ handleLogout }) => {
  const [packs, setPacks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'ascending' });
  const [aggregatedPacks, setAggregatedPacks] = useState([]);

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

  useEffect(() => {
    const fetchAggregatedPacks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/aggregated-packs');
        setAggregatedPacks(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedPacks();
  }, []);

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
            <CTableHeaderCell className="bg-body-tertiary">Category</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Number of Packs</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Number of Items</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Packs Sold</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary">Total Price</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {aggregatedPacks.map((pack, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{pack.category}</CTableDataCell>
              <CTableDataCell>{pack.number_of_packs}</CTableDataCell>
              <CTableDataCell>{pack.number_of_items}</CTableDataCell>
              <CTableDataCell>{pack.packs_sold}</CTableDataCell>
              <CTableDataCell>{pack.total_price}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      </CCardBody>
      </CCard>
      {/* Transactions Table */}
      <Transactions hideActions={true} hideSearch={true} />
    </>
  );
};

export default Dashboard;
