import React, { useState } from 'react';
import './Dashboard.css';
import { FaSignOutAlt,FaHome, FaUsers, FaUserTie, FaChalkboardTeacher, FaBuilding, FaBars } from 'react-icons/fa';  // Import icons from react-icons

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State to control the sidebar

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState); // Toggle the state
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          <div className="logo-container">
            <img src="logo.jpg" alt="Logo" width={150} className='dashboard-img' />
            <button onClick={toggleSidebar} className="toggle-btn">
              {isSidebarCollapsed ? <FaBars size={30} /> : <FaBars size={30} />} {/* Toggle between hamburger and close icon */}
            </button>
          </div>
          <div className="options-list">
            <div className="options">
              <div className="icon"><FaHome size={30} /></div>
              {!isSidebarCollapsed && <div className="name">Home</div>} {/* Show name only if sidebar is not collapsed */}
            </div>
            <div className="options">
              <div className="icon"><FaUsers size={30} /></div>
              {!isSidebarCollapsed && <div className="name">HR</div>}
            </div>
            <div className="options">
              <div className="icon"><FaUserTie size={30} /></div>
              {!isSidebarCollapsed && <div className="name">Employees</div>}
            </div>
            <div className="options">
              <div className="icon"><FaChalkboardTeacher size={30} /></div>
              {!isSidebarCollapsed && <div className="name">Trainers</div>}
            </div>
            <div className="options">
              <div className="icon"><FaBuilding size={30} /></div>
              {!isSidebarCollapsed && <div className="name">HOD</div>}
            </div>
          </div>
            <div className="dashboard-log-button">
              <div className="icon"><FaSignOutAlt size={30} /></div>
              {!isSidebarCollapsed && <div className="name">Logout</div>}
            </div>
        </div>
      </div>
      <div className="main-content">
        {/* Right side content */}
      </div>
    </div>
  );
};

export default Dashboard;
