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

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/transactions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      setFilteredTransactions(filteredTransactions.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const filtered = transactions.filter(transaction =>
      transaction.name.toLowerCase().includes(value.toLowerCase()) ||
      transaction.id.toString().toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Transactions</CCardHeader>
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
              <CTableHeaderCell className="bg-body-tertiary text-center">
                <CIcon icon={cilUser} />
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Amount</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Date</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredTransactions.map((transaction) => (
              <CTableRow key={transaction.id}>
                <CTableDataCell className="text-center">
                  <CIcon icon={cilUser} />
                </CTableDataCell>
                <CTableDataCell>{transaction.id}</CTableDataCell>
                <CTableDataCell>{transaction.name}</CTableDataCell>
                <CTableDataCell>{transaction.amount}</CTableDataCell>
                <CTableDataCell>{transaction.date}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" onClick={() => deleteTransaction(transaction.id)}>
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

export default Transactions;
