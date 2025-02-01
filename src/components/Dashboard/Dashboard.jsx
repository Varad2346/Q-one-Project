import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaUserTie,
  FaChalkboardTeacher,
  FaBuilding,
  FaBars,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../../store/auth";

const EditUserModal = ({ user, onClose, onSave }) => {
  console.log("user", user);
  const [editedUser, setEditedUser] = useState({
    userId: user.userId || "",
    firstName: user.name.split(" ")[0],
    lastName: user.name.split(" ")[1],
    email: user.email,
    mobileNumber: user.phoneNumber,
    department: user.department,
    role: user.role,
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));

    // Clear password error when user starts typing new passwords
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    // If both password fields are empty, allow the update (no password change)
    if (!editedUser.password && !editedUser.confirmPassword) {
      return true;
    }

    // If only one password field is filled
    if (
      (!editedUser.password && editedUser.confirmPassword) ||
      (editedUser.password && !editedUser.confirmPassword)
    ) {
      setPasswordError("Both password fields must be filled");
      return false;
    }

    // Check if passwords match
    if (editedUser.password !== editedUser.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    // Check password length (minimum 6 characters)
    if (editedUser.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords before submission
    if (!validatePasswords()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!editedUser.userId) {
        throw new Error("User ID is missing");
      }

      // Create update payload
      const updatePayload = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        mobileNumber: editedUser.mobileNumber,
        department: editedUser.department,
        role: editedUser.role,
      };

      // Only include password in payload if it's been changed
      if (editedUser.password) {
        updatePayload.password = editedUser.password;
      }

      const response = await fetch(
        `http://localhost:3000/api/users/${editedUser.userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update user: ${errorBody}`);
      }

      onSave(editedUser);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-content">
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="firstName"
            value={editedUser.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            name="lastName"
            value={editedUser.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <input
            name="email"
            value={editedUser.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="mobileNumber"
            value={editedUser.mobileNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          <input
            name="department"
            value={editedUser.department}
            onChange={handleChange}
            placeholder="Department"
            required
          />
          <select
            name="role"
            value={editedUser.role}
            onChange={handleChange}
            required
          >
            <option value="HR">HR</option>
            <option value="Employee">Employee</option>
            <option value="Trainer">Trainer</option>
            <option value="HOD">HOD</option>
          </select>

          {/* Password update fields */}
          <div className="password-section">
            <input
              type="password"
              name="password"
              value={editedUser.password}
              onChange={handleChange}
              placeholder="New Password (leave empty to keep current)"
            />
            <input
              type="password"
              name="confirmPassword"
              value={editedUser.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
            />
            {passwordError && (
              <div className="password-error">{passwordError}</div>
            )}
          </div>

          <div className="dashboard-modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { authToken, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const filteredUsers = result.data
          .filter((user) => user.role.toLowerCase() !== "admin")
          .map((user) => ({
            userId: user.userId,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phoneNumber: user.mobileNumber,
            department: user.department,
            role: user.role,
          }));
        console.log("filter", filteredUsers);
        setUsers(filteredUsers);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      if (err.message.includes("401")) {
        setError("Unauthorized access. Please login again.");
      } else {
        setError("Error connecting to the server: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser || !deletingUser.userId) {
      alert("User ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/users/${deletingUser.userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete user: ${errorBody}`);
      }

      setUsers(users.filter((user) => user.userId !== deletingUser.userId));
      setDeletingUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.message);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prevState) => !prevState);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const navigateToHome = () => {
    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      user.role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getTableTitle = () => {
    if (selectedRole === "all") return "All Users";
    return `${
      selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)
    } List`;
  };

  return (
    <div className="dashboard-outer-container">
      <div className="dashboard-container">
        <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div className="sidebar-content">
            <div className="logo-container">
              <img
                src="logo.jpg"
                alt="Logo"
                width={150}
                className="dashboard-img"
              />
              <button onClick={toggleSidebar} className="toggle-btn">
                <FaBars size={30} />
              </button>
            </div>
            <div className="dashboard-options-list">
              <div className="dashboard-options" onClick={navigateToHome}>
                <div className="icon">
                  <FaHome size={30} />
                </div>
                {!isSidebarCollapsed && <div className="name">Home</div>}
              </div>
              <div
                className="dashboard-options"
                onClick={() => handleRoleChange("hr")}
              >
                <div className="icon">
                  <FaUsers size={30} />
                </div>
                {!isSidebarCollapsed && <div className="name">HR</div>}
              </div>
              <div
                className="dashboard-options"
                onClick={() => handleRoleChange("employee")}
              >
                <div className="icon">
                  <FaUserTie size={30} />
                </div>
                {!isSidebarCollapsed && <div className="name">Employees</div>}
              </div>
              <div
                className="dashboard-options"
                onClick={() => handleRoleChange("trainer")}
              >
                <div className="icon">
                  <FaChalkboardTeacher size={30} />
                </div>
                {!isSidebarCollapsed && <div className="name">Trainers</div>}
              </div>
              <div
                className="dashboard-options"
                onClick={() => handleRoleChange("hod")}
              >
                <div className="icon">
                  <FaBuilding size={30} />
                </div>
                {!isSidebarCollapsed && <div className="name">HOD</div>}
              </div>
            </div>
            <div className="dashboard-log-button" onClick={handleLogout}>
              <div className="icon">
                <FaSignOutAlt size={30} />
              </div>
              {!isSidebarCollapsed && <div className="name">Logout</div>}
            </div>
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <input
              type="text"
              className="dashboard-search-bar"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="dashboard-table-container">
            <div className="table-title">{getTableTitle()}</div>
            {loading ? (
              <div className="loading-state">Loading users...</div>
            ) : error ? (
              <div className="error-message">Error: {error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? "No users found matching your search criteria"
                  : "No users found in this category"}
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr className="table-header-row">
                    <th className="dashboard-table-heading">Name</th>
                    <th className="dashboard-table-heading">Email</th>
                    <th className="dashboard-table-heading">Phone Number</th>
                    <th className="dashboard-table-heading">Department</th>
                    <th className="dashboard-table-heading">Role</th>
                    <th className="dashboard-table-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={index} className="table-row">
                      <td className="dashboard-table-data">{user.name}</td>
                      <td className="dashboard-table-data">{user.email}</td>
                      <td className="dashboard-table-data">
                        {user.phoneNumber}
                      </td>
                      <td className="dashboard-table-data">
                        {user.department}
                      </td>
                      <td className="dashboard-table-data">
                        <span
                          className={`role-badge ${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="actions-column">
                        <div className="action-buttons-container">
                          <button
                            className="edit-btn"
                            onClick={() => setEditingUser(user)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => setDeletingUser(user)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updatedUser) => {
            setUsers(
              users.map((user) =>
                user.userId === editingUser.userId
                  ? {
                      ...user,
                      ...updatedUser,
                      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                    }
                  : user
              )
            );
          }}
        />
      )}

      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete user {deletingUser.name}?</p>
            <div className="modal-actions">
              <button onClick={() => setDeletingUser(null)}>Cancel</button>
              <button onClick={handleDeleteUser} className="delete-confirm-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
