import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../components/table/UniversalTable";
import Button from "../../components/Button";
import { handleGetRooms } from "../../../business/controller/RoomController";
import "../../styles/pages/chirurg/Dashboard.css";

const ChirurgDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getAllRooms = async () => {
      try {
        setLoading(true);
        const results = await handleGetRooms();
        setRooms(results.data || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    getAllRooms();
  }, []);

  const handleRoomClick = (roomId) => {
    navigate(`/chirurg/view/${roomId}`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Kamer naam',
      sortable: true,
      render: (row) => (
        <button type='button' className='ut-cell-link' onClick={(e)=>{ e.preventDefault(); handleRoomClick(row.id); }}>
          {row.name}
        </button>
      )
    },
    {
      key: 'createdAt',
      header: 'Aangemaakt',
      sortable: true,
      align: 'left',
      compact: true,
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Onbekend'
    },
    {
      key: 'modelsCount',
      header: 'Modellen',
      sortable: true,
      align: 'center',
      compact: true,
      render: (row) => (row?.models?.length || 0)
    },
    {
      key: 'updatedAt',
      header: 'Laatst bijgewerkt',
      sortable: true,
      align: 'left',
      compact: true,
      render: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Onbekend'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Laden...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Kamers</h1>
        
        
      </div>

      <div className='room-table-card'>
        <div className='rooms-sidebar'>
        <div className='rooms-top-actions'>
          <span
            className='ut-text-link ut-text-link--lg'
            role='button'
            tabIndex={0}
            onClick={() => navigate('/chirurg/rooms')}
            onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') navigate('/chirurg/rooms'); }}
          >
            <svg
              className='ut-icon ut-icon--left'
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
              focusable='false'
            >
              <circle cx='12' cy='12' r='10'></circle>
              <polyline points='12 6 12 12 16 14'></polyline>
            </svg>
            Kamer Geschiedenis
          </span>
        </div>
          <UniversalTable
            columns={columns}
            data={rooms}
            emptyMessage="Geen rooms beschikbaar"
            initialSort={{ key: 'updatedAt', direction: 'desc' }}
            defaultPageSize={10}
          />
        </div>
      </div>
    </div>
  );
};

export default ChirurgDashboard;
