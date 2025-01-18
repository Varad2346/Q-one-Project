import React, { useState } from 'react';
import './Dashboard1.css';
import { FaSignOutAlt, FaHome, FaUsers, FaUserTie, FaChalkboardTeacher, FaBuilding, FaBars } from 'react-icons/fa';  // Import icons from react-icons

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State to control the sidebar
  const [searchQuery, setSearchQuery] = useState(''); // State to control the search bar
  const [employees, setEmployees] = useState([
    { name: 'John Doe', position: 'Software Engineer', department: 'Engineering', email: 'john.doe@example.com' },
    { name: 'Jane Smith', position: 'HR Manager', department: 'HR', email: 'jane.smith@example.com' },
    { name: 'Alice Brown', position: 'Product Manager', department: 'Product', email: 'alice.brown@example.com' },
  ]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState); // Toggle the state
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query state
  };

  // Filter employees based on the search query
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='dashboard-container1'>
      <div className="dashboard-container">
        <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            <div className="logo-container">
              <img src="logo.jpg" alt="Logo" width={150} className='dashboard-img' />
              <button onClick={toggleSidebar} className="toggle-btn">
                {isSidebarCollapsed ? <FaBars size={30} /> : <FaBars size={30} />}
              </button>
            </div>
            <div className="options-list">
              <div className="options">
                <div className="icon"><FaHome size={30} /></div>
                {!isSidebarCollapsed && <div className="name">Home</div>}
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
          <div className='dashboard-header'>
            <input
              type="text"
              className="search-bar"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {/* <button>Add User</button> */}
          </div>
          <div className='dashboard-table'>
            <table className='dash-table'>
              <thead>
                <tr className='table-header-row'>
                  <th className='dashboard-table-th'>Name</th>
                  <th className='dashboard-table-th'>Position</th>
                  <th className='dashboard-table-th'>Department</th>
                  <th className='dashboard-table-th'>Email</th>
                  <th className='dashboard-table-th'>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr key={index}>
                    <td className='dashboard-table-td'>{employee.name}</td>
                    <td className='dashboard-table-td'>{employee.position}</td>
                    <td className='dashboard-table-td'>{employee.department}</td>
                    <td className='dashboard-table-td'>{employee.email}</td>
                    {/* <td><button>Edit</button></td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
