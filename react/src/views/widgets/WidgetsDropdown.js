import React, { useEffect, useRef , useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CWidgetStatsA,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { getStyle } from '@coreui/utils';
import { CChartBar, CChartLine } from '@coreui/react-chartjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CIcon from '@coreui/icons-react';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons';
import { FaChartBar } from 'react-icons/fa';
const WidgetsDropdown = (props) => {
  const [packCount, setPackCount] = useState(null);
  const [packsold, setPacksold] = useState(null);
  const [percentageSold, setPercentageSold] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);
  const [percentageProfit, setPercentageProfit] = useState(null);

  useEffect(() => {
    const fetchPackCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/packs/count');
        if (!response.ok) {
          throw new Error('Failed to fetch pack count');
        }
        
        const data = await response.json();
        setPackCount(data.count); // Update state with packCount from API
      } catch (error) {
        console.error('Error fetching pack count:', error);
        // Handle error, set packCount or show error message
      }
    };

    fetchPackCount();
  }, []);
  
  useEffect(() => {
    const fetchPackSold = async () => {
      try {
        const response = await fetch('http://localhost:5000/packs/Sold');
        if (!response.ok) {
          throw new Error('Failed to fetch pack count');
        }
        
        const data = await response.json();
        setPacksold(data.count); // Update state with SoldCount from API
        setPercentageSold(data.percentage); // Update state with percentageSold from API
      } catch (error) {
        console.error('Error fetching pack count:', error);
        // Handle error, set soldCount or show error message
      }
    };

    fetchPackSold();
  }, []);
  
   useEffect(() => {
    const fetchProfitData = async () => {
      try {
        const response = await fetch('http://localhost:5000/transactions/profits');
        if (!response.ok) {
          throw new Error('Failed to fetch profit data');
        }
        
        const data = await response.json();
        setTotalProfit(data.totalProfit); // Update state with totalProfit from API
        setPercentageProfit(data.percentageProfit); // Update state with percentageProfit from API
      } catch (error) {
        console.error('Error fetching profit data:', error);
        // Handle error, set totalProfit or show error message
      }
    };

    fetchProfitData();
  }, []);

  // Function to format percentage to 3 decimal places
  const formatPercentage = (percentage) => {
    return parseFloat(percentage).toFixed(3);
  };

// Function to generate and download PDF
const generatePDF = async () => {
  try {
    // Fetch statistics from the API
    const response = await axios.get('http://localhost:5000/stats');
    const stats = response.data;

    // Get current date
    const currentDate = new Date().toLocaleDateString();

    // Create a container for the content
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '210mm'; // A4 width in mm
    pdfContainer.style.padding = '20mm'; // Add padding
    pdfContainer.style.boxSizing = 'border-box';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';

    // Style for tables
    const tableStyle = `
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    `;
    
    const thStyle = `
      border: 1px solid #000;
      padding: 8px;
      background-color: #f2f2f2;
    `;
    
    const tdStyle = `
      border: 1px solid #000;
      padding: 8px;
    `;

    // Add current date
    pdfContainer.innerHTML += `
      <h2>Statistics Report</h2>
      <p>Date: ${currentDate}</p>
      <hr/>
    `;

    // Generate the first table for statistics
    pdfContainer.innerHTML += `
      <h3>Total Statistics</h3>
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Metric</th>
            <th style="${thStyle}">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="${tdStyle}">Total Packs Sold</td><td style="${tdStyle}">${stats.totalPacksSold}</td></tr>
          <tr><td style="${tdStyle}">Total Number of Items</td><td style="${tdStyle}">${stats.totalItems}</td></tr>
          <tr><td style="${tdStyle}">Total Profit</td><td style="${tdStyle}">${stats.totalProfit}</td></tr>
          <tr><td style="${tdStyle}">Total Expenses</td><td style="${tdStyle}">${stats.totalExpenses}</td></tr>
          <tr><td style="${tdStyle}">Percentage of Profit from Expenses</td><td style="${tdStyle}">${stats.profitPercentage.toFixed(2)}%</td></tr>
          <tr><td style="${tdStyle}">Profit This Month</td><td style="${tdStyle}">${stats.monthlyProfit}</td></tr>
          <tr><td style="${tdStyle}">Profit This Year</td><td style="${tdStyle}">${stats.yearlyProfit}</td></tr>
          <tr><td style="${tdStyle}">Percentage of Profit This Month</td><td style="${tdStyle}">${stats.monthlyProfitPercentage.toFixed(2)}%</td></tr>
          <tr><td style="${tdStyle}">Percentage of Profit This Year</td><td style="${tdStyle}">${stats.yearlyProfitPercentage.toFixed(2)}%</td></tr>
          <tr><td style="${tdStyle}">Expenses This Month</td><td style="${tdStyle}">${stats.monthlyExpenses}</td></tr>
          <tr><td style="${tdStyle}">Expenses This Year</td><td style="${tdStyle}">${stats.yearlyExpenses}</td></tr>
        </tbody>
      </table>
    `;

    // Generate the second table for items by category
    pdfContainer.innerHTML += `
      <h3>Number of Items in Each Category</h3>
      <table style="${tableStyle}">
        <thead>
          <tr>
            <th style="${thStyle}">Category</th>
            <th style="${thStyle}">Number of Items</th>
            <th style="${thStyle}">Packs Sold</th>
            <th style="${thStyle}">Profit</th>
          </tr>
        </thead>
        <tbody>
          ${stats.itemsByCategory.map(item => `
            <tr>
              <td style="${tdStyle}">${item.category}</td>
              <td style="${tdStyle}">${item.number_of_items}</td>
              <td style="${tdStyle}">${item.packs_sold}</td>
              <td style="${tdStyle}">${item.category_profit}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Append the container to the body
    document.body.appendChild(pdfContainer);

    // Wait for the content to be rendered
    setTimeout(() => {
      html2canvas(pdfContainer, { useCORS: true, scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'p', // Portrait
          unit: 'mm', // Units in mm
          format: 'a4', // A4 paper format
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('statistics_report.pdf');
        pdfContainer.remove();
      });
    }, 1000);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
  
  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary"
          value={
            packCount != null ? (
              <>
                {packCount}
              </>
            ) : (
              '0'
            )
          }
          title={
            <>
              <i className="fas fa-box"></i> Packs
            </>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [65, 59, 84, 84, 51, 55, 40],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: 30,
                    max: 89,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
            color="info"
            value={
              packsold != null ? (
                <>
                  {packsold} &nbsp;
                  <span className="fs-6 fw-normal ml-4">
                    ({percentageSold.toFixed(3)}% <CIcon icon={cilArrowTop} />)
                  </span>
                </>
              ) : (
                '0'
              )
            }
            title={
              <>
                <i className="fas fa-dollar-sign mr-2"></i> Sold
              </>
            }
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
              </CDropdown>
            }
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    min: -9,
                    max: 39,
                    display: false,
                    grid: {
                      display: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    borderWidth: 1,
                  },
                  point: {
                    radius: 4,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            totalProfit != null ? (
              <>
                {totalProfit} &nbsp;
                <span className="fs-6 fw-normal ml-4">
                  ({percentageProfit.toFixed(3)}% <CIcon icon={cilArrowTop} />)
                </span>
              </>
            ) : (
              '0'
            )
          }
          title={
            <>
              <i className="fas fa-money-bill-wave" style={{ marginRight: '8px' }}></i> Incomes
            </>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
            </CDropdown>
          }
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value={
            <>
              {' '}
              <span className="fs-6 fw-normal">
              <FontAwesomeIcon icon={faChartPie} />
              </span>
            </>
          }
          title={
          <>
          <FaChartBar /> Full Stats
          </>
          }
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
              <CDropdownItem onClick={generatePDF}>Download Stats as PDF</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                  'January',
                  'February',
                  'March',
                  'April',
                ],
                datasets: [
                  {
                    label: 'My First dataset',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                  y: {
                    border: {
                      display: false,
                    },
                    grid: {
                      display: false,
                      drawBorder: false,
                      drawTicks: false,
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
