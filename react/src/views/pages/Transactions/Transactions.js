import React, { useState, useEffect, useMemo } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPrint, faArrowLeft, faArrowRight, faSortUp, faSortDown} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import jsPDF from 'jspdf';
import ReactPaginate from 'react-paginate';
import '../items/items.css';
import 'jspdf-autotable';

const Transactions = ({ hideActions, hideSearch }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });

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
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedTransactions = useMemo(() => {
    const sortableTransactions = [...filteredTransactions];
    if (sortConfig.key === 'amount') {
      sortableTransactions.sort((a, b) => {
        if (sortConfig.direction === 'ascending') {
          return a.amount - b.amount;
        } else {
          return b.amount - a.amount;
        }
      });
    } else if (sortConfig.key === 'date') {
      sortableTransactions.sort((a, b) => {
        const dateA = new Date(a.sale_date);
        const dateB = new Date(b.sale_date);
        if (sortConfig.direction === 'ascending') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    return sortableTransactions;
  }, [filteredTransactions, sortConfig]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const optionsDate = {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    };

    const optionsTime = {
      hour: '2-digit',
      minute: '2-digit'
    };

    const formattedDate = date.toLocaleString('en-GB', optionsDate);
    const formattedTime = date.toLocaleString('en-US', optionsTime);

    return `${formattedDate} - ${formattedTime}`;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = transactions.filter(transaction =>
      transaction.pack_id.toString().toLowerCase().includes(value) ||
      transaction.id.toString().toLowerCase().includes(value) ||
      transaction.sale_date.toLowerCase().includes(value) ||
      transaction.amount.toString().toLowerCase().includes(value) ||
      transaction.profit.toString().toLowerCase().includes(value)
    );

    setFilteredTransactions(filtered);
    setCurrentPage(0);
  };

// Function to handle the PDF generation
const handlePrint = (transaction) => {
  // Assuming `transaction` already contains pack information
  const pack = { category: transaction.category }; // Extract pack info from transaction

  // Generate PDF with the transaction and pack data
  handlePrintWithPack(transaction, pack);
};

const handlePrintWithPack = (transaction, pack) => {
  const doc = new jsPDF();

  // Set company name
  doc.setFontSize(14);
  doc.text('Company Name', 15, 15);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  // Add date and time
  doc.setFontSize(10);
  doc.text(`Date and Time: ${formattedDate}`, 15, 25);

  // Table headers and data
  const tableColumn = ["Field", "Value"];
  const tableRows = [
    ["Transaction ID", transaction.id],
    ["Sold Pack ID", transaction.pack_id],
    ["Pack Category", pack.category],
    ["Amount", transaction.amount],
    ["Profit", transaction.profit],
  ];

  // Add table
  doc.autoTable({
    startY: 35,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped', // Use 'striped' or 'grid' for a better look
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Black header with white text
    columnStyles: {
      0: { cellWidth: 60 }, // Adjust column width if necessary
      1: { cellWidth: 130 }
    }
  });

  // Save the PDF
  doc.save(`Transaction_${transaction.id}.pdf`);
};

  const openModal = (transaction) => {
    setTransactionToDelete(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPassword('');
    setPasswordError('');
    setTransactionToDelete(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const deleteTransaction = async () => {
    try {
      if (!transactionToDelete || !transactionToDelete.id) {
        console.error('TransactionToDelete or its ID is undefined');
        return;
      }

      const response = await fetch(`http://localhost:5000/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorResponse = await response.json();
          setPasswordError(errorResponse.message);
        } else {
          throw new Error('Network response was not ok');
        }
      } else {
        const result = await response.json();
        if (result.success) {
          const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
          setTransactions(updatedTransactions);
          setFilteredTransactions(updatedTransactions);
          setShowModal(false);
        } else {
          console.error('Error deleting transaction:', result.message);
        }
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const offset = currentPage * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Transactions</CCardHeader>
      <CCardBody>
        {!hideSearch && (
          <Form onSubmit={(e) => e.preventDefault()}>
          <CInputGroup className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Sale Date, Amount, or Profit"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowModal(false)} // Add this line
            />
          </CInputGroup>
        </Form>        
        )}
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell>ID</CTableHeaderCell>
              <CTableHeaderCell>Pack ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('date')}>
                SaleDate
                {sortConfig.key === 'date' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ms-2"
                  />
                )}
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary" onClick={() => handleSort('amount')}>
                Amount
                {sortConfig.key === 'amount' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ms-2"
                  />
                )}
              </CTableHeaderCell>
              <CTableHeaderCell>Profit</CTableHeaderCell>
              {!hideActions && <CTableHeaderCell>Actions</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {sortedTransactions.slice(offset, offset + itemsPerPage).map((transaction) => (
          <CTableRow key={transaction.id}>
            <CTableDataCell>{transaction.id}</CTableDataCell>
            <CTableDataCell>{transaction.pack_id}</CTableDataCell>
            <CTableDataCell>{formatDate(transaction.sale_date)}</CTableDataCell>
            <CTableDataCell>{transaction.amount}</CTableDataCell>
            <CTableDataCell>{transaction.profit}</CTableDataCell>
            {!hideActions && (
              <CTableDataCell>
                <CButton color="danger" onClick={() => openModal(transaction)}>
                  <FontAwesomeIcon icon={faTrash} />
                </CButton>
                <CButton color="info" className="ml-2" onClick={() => handlePrint(transaction)}>
                  <FontAwesomeIcon icon={faPrint} />
                </CButton>
              </CTableDataCell>
            )}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Pagination aligned to the right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <ReactPaginate
            previousLabel={<FontAwesomeIcon icon={faArrowLeft} />}
            nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        </div>

        {/* Modal for delete confirmation */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Transaction</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? 'is-invalid' : ''}
              />
              {passwordError && (
                <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteTransaction}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </CCardBody>
    </CCard>
  );
};

export default Transactions;
