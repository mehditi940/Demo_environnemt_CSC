import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalTable from '../../components/table/UniversalTable';
import '../../styles/pages/chirurg/Rooms.css';
import BackBtn from '../../components/buttons/BackBtn';

const ChirurgRooms = () => {
  const [roomHistory, setRoomHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Note: We're not fetching rooms anymore since we removed the statistics
        
        // Mock room history data - in a real app, this would come from an API
        const mockHistory = [
          {
            id: 1,
            roomName: 'Operatiekamer 1',
            lastOpened: '2024-01-15 14:30',
            duration: '2u 15m',
            status: 'Afgerond',
            patientCount: 1,
            notes: 'Succesvolle ingreep'
          },
          {
            id: 2,
            roomName: 'Operatiekamer 2',
            lastOpened: '2024-01-14 09:45',
            duration: '1u 30m',
            status: 'Afgerond',
            patientCount: 1,
            notes: 'Routineoperatie'
          },
          {
            id: 3,
            roomName: 'Operatiekamer 3',
            lastOpened: '2024-01-13 16:20',
            duration: '3u 45m',
            status: 'Afgerond',
            patientCount: 1,
            notes: 'Complexe ingreep'
          },
          {
            id: 4,
            roomName: 'Operatiekamer 1',
            lastOpened: '2024-01-12 11:15',
            duration: '1u 50m',
            status: 'Afgerond',
            patientCount: 1,
            notes: 'Spoedoperatie'
          },
          {
            id: 5,
            roomName: 'Operatiekamer 2',
            lastOpened: '2024-01-11 08:30',
            duration: '2u 30m',
            status: 'Afgerond',
            patientCount: 1,
            notes: 'Geplande ingreep'
          }
        ];
        
        setRoomHistory(mockHistory);
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoomClick = (roomId) => {
    navigate(`/chirurg/view/${roomId}`);
  };

  const columns = [
    {
      key: 'roomName',
      header: 'Kamer Naam',
      sortable: true,
      render: (row) => (
        <button 
          className="room-name-link"
          onClick={() => handleRoomClick(row.roomId || row.id)}
        >
          {row.roomName}
        </button>
      )
    },
    {
      key: 'lastOpened',
      header: 'Laatst Geopend',
      sortable: true,
      width: '180px'
    },
    {
      key: 'duration',
      header: 'Duur',
      sortable: true,
      width: '120px',
      align: 'center'
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '120px',
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'patientCount',
      header: 'Patiënten',
      sortable: true,
      width: '100px',
      align: 'center'
    },
    {
      key: 'notes',
      header: 'Notities',
      sortable: false,
      render: (row) => (
        <span className="notes-text" title={row.notes}>
          {row.notes.length > 30 ? `${row.notes.substring(0, 30)}...` : row.notes}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="rooms-container">
        <div className="loading-spinner">Laden...</div>
      </div>
    );
  }

  return (
    <div className="rooms-container">
      <BackBtn/>
    <div className="rooms-header">
        <h1>Kamer Geschiedenis</h1>
      </div>

    
      <div className='room-table-card'>
      
      <div className="rooms-table-container">
        <UniversalTable
          columns={columns}
          data={roomHistory}
          emptyMessage="Geen kamer geschiedenis beschikbaar"
          initialSort={{ key: 'lastOpened', direction: 'desc' }}
          pageSizeOptions={[5, 10, 25]}
          defaultPageSize={10}
        />
      </div>
      </div>
    </div>
  );
};

export default ChirurgRooms;
