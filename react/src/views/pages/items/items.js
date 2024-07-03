import React from 'react'
import classNames from 'classnames'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

const Items = () => {

  const tableExample = [
    {
      avatar: { src: avatar1 },
      user: {
        name: 'Yiorgos Avraamu',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'USA' },
      usage: {
        value: 50,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: '10 sec ago',
    },
    {
      avatar: { src: avatar2 },
      user: {
        name: 'Avram Tarasios',
        new: false,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Brazil' },
      usage: {
        value: 22,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: '5 minutes ago',
    },
    {
      avatar: { src: avatar3 },
      user: { name: 'Quintin Ed', new: true, registered: 'Jan 1, 2023' },
      country: { name: 'India' },
      usage: {
        value: 74,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: '1 hour ago',
    },
    {
      avatar: { src: avatar4 },
      user: { name: 'Enéas Kwadwo', new: true, registered: 'Jan 1, 2023' },
      country: { name: 'France' },
      usage: {
        value: 98,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: 'Last month',
    },
    {
      avatar: { src: avatar5 },
      user: {
        name: 'Agapetus Tadeáš',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Spain' },
      usage: {
        value: 22,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: 'Last week',
    },
    {
      avatar: { src: avatar6 },
      user: {
        name: 'Friderik Dávid',
        new: true,
        registered: 'Jan 1, 2023',
      },
      country: { name: 'Poland' },
      usage: {
        value: 43,
        period: 'Jun 11, 2023 - Jul 10, 2023',
      },
      activity: 'Last week',
    },
  ]

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>Items</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead className="text-nowrap">
              <CTableRow>
                <CTableHeaderCell className="bg-body-tertiary text-center">
                  <CIcon icon={cilUser} />
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">User</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary text-center">
                  Country
                </CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Usage</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Activity</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {tableExample.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell className="text-center">
                    <img src={item.avatar.src} className="rounded-circle" alt="avatar" width="48" height="48" />
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>{item.user.name}</div>
                    <div className="small text-muted">Registered: {item.user.registered}</div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {item.country.name}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>{item.usage.value}%</div>
                    <div className="small text-muted">{item.usage.period}</div>
                  </CTableDataCell>
                  <CTableDataCell>
                    {item.activity}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Items
