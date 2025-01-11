import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/auth';
import { useSnackbar } from 'notistack';
import './AddEmployeeForm.css'; // Reusing the same styles

const DepartmentManagement = () => {
  const { authToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editName, setEditName] = useState('');

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/departments', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      enqueueSnackbar('Error fetching departments', { variant: 'error' });
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.trim()) {
      enqueueSnackbar('Department name cannot be empty', { variant: 'warning' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: newDepartment }),
      });

      if (!response.ok) throw new Error('Failed to add department');

      await fetchDepartments();
      setNewDepartment('');
      enqueueSnackbar('Department added successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error adding department', { variant: 'error' });
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      enqueueSnackbar('Department name cannot be empty', { variant: 'warning' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: editName }),
      });

      if (!response.ok) throw new Error('Failed to update department');

      await fetchDepartments();
      setEditingDepartment(null);
      setEditName('');
      enqueueSnackbar('Department updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error updating department', { variant: 'error' });
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete department');

      await fetchDepartments();
      enqueueSnackbar('Department deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error deleting department', { variant: 'error' });
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Department Management</h2>

      {/* Add Department Form */}
      <form onSubmit={handleAddDepartment} className="form-row">
        <div className="form-group1">
          <label htmlFor="newDepartment">New Department Name</label>
          <input
            type="text"
            id="newDepartment"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="Enter department name"
            required
          />
        </div>
        <div className="form-group1" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="Add-employee-button">
            Add Department
          </button>
        </div>
      </form>

      {/* Departments List */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Existing Departments</h3>
        {departments.map((department) => (
          <div
            key={department.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
            }}
          >
            {editingDepartment?.id === department.id ? (
              <form
                onSubmit={handleEditDepartment}
                style={{ display: 'flex', gap: '10px', flex: 1 }}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="Add-employee-button">
                  Save
                </button>
                <button
                  type="button"
                  className="Add-employee-button"
                  onClick={() => setEditingDepartment(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span>{department.name}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="Add-employee-button"
                    onClick={() => {
                      setEditingDepartment(department);
                      setEditName(department.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="Add-employee-button"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;