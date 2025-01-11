import React, { useState } from 'react';
import { useAuth } from '../../store/auth';
import { useSnackbar } from 'notistack';
import './AddEmployeeForm.css';
import {
  ADD_EMPLOYEE_FORM_TITLE,
  FIRST_NAME_LABEL,
  LAST_NAME_LABEL,
  GENDER_LABEL,
  EMAIL_LABEL,
  PASSWORD_LABEL,
  MOBILE_NUMBER_LABEL,
  ROLE_LABEL,
  EMPLOYEE_LABEL,
  ADD_HR_FORM_TITLE,
  HR_LABEL,
  ADD_HOD_FORM_TITLE,
  HOD_LABEL,
  ADD_TRAINER_FORM_TITLE,
  TRAINER_LABEL,
  DEPARTMENT_LABEL,
  SAVE_BUTTON_TEXT,
  CANCEL_BUTTON_TEXT
} from '../../constants/constant';

const AddEmployeeForm = () => {
  const { authToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    department: '',
    role: 'employee',
  });

  const [role, setRole] = useState('employee');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((role === 'hr' || role === 'hod') && formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Password and Confirm Password do not match!', { variant: 'error' });
      return;
    }

    if ((role === 'hr' || role === 'hod') && formData.password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters long!', { variant: 'info' });
      return;
    }

    const submitData = { ...formData };

    if (role === 'employee' || role === 'trainer' || role === 'department') {
      submitData.password = '123456';
    }

    if (role === 'department') {
      submitData.role = 'department';
      submitData.department = formData.firstName; // Use firstName field as department name
    }

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data = await response.json();
      enqueueSnackbar(role === 'department' ? 'Department added successfully!' : 'User added successfully!', { variant: 'success' });
      resetForm();
    } catch (error) {
      enqueueSnackbar(error.message || 'Error creating user', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: '',
      password: '',
      confirmPassword: '',
      mobileNumber: '',
      department: '',
      role: role,
    });
  };

  const toggleRole = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prevData) => ({
      ...prevData,
      role: selectedRole,
      password: selectedRole === 'employee' || selectedRole === 'trainer' ? '123456' : '',
      confirmPassword: '',
    }));
  };

  return (
    <div className="form-container">
      <div className="role-toggle">
        <button
          className={`role-button ${role === 'employee' ? 'active' : ''}`}
          onClick={() => toggleRole('employee')}
        >
          {EMPLOYEE_LABEL}
        </button>
        <button
          className={`role-button ${role === 'hr' ? 'active' : ''}`}
          onClick={() => toggleRole('hr')}
        >
          {HR_LABEL}
        </button>
        <button
          className={`role-button ${role === 'hod' ? 'active' : ''}`}
          onClick={() => toggleRole('hod')}
        >
          {HOD_LABEL}
        </button>
        <button
          className={`role-button ${role === 'trainer' ? 'active' : ''}`}
          onClick={() => toggleRole('trainer')}
        >
          {TRAINER_LABEL}
        </button>
        <button
          className={`role-button ${role === 'department' ? 'active' : ''}`}
          onClick={() => toggleRole('department')}
        >
          Department
        </button>
      </div>

      <h2 className="form-title">
        {role === 'department' 
          ? 'Add Department'
          : role === 'employee'
          ? ADD_EMPLOYEE_FORM_TITLE
          : role === 'hr'
          ? ADD_HR_FORM_TITLE
          : role === 'hod'
          ? ADD_HOD_FORM_TITLE
          : ADD_TRAINER_FORM_TITLE}
      </h2>

      <form onSubmit={handleSubmit}>
        {role === 'department' ? (
          <div className="form-row">
            <div className="form-group1">
              <label htmlFor="firstName">Department Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group1">
                <label htmlFor="firstName">{FIRST_NAME_LABEL}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group1">
                <label htmlFor="lastName">{LAST_NAME_LABEL}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group1">
                <label htmlFor="gender">{GENDER_LABEL}</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group1">
                <label htmlFor="mobileNumber">{MOBILE_NUMBER_LABEL}</label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group1">
                <label htmlFor="email">{EMAIL_LABEL}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {role !== 'hr' && (
                <div className="form-group1">
                  <label htmlFor="department">{DEPARTMENT_LABEL}</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              )}
            </div>

            {(role === 'hr' || role === 'hod') && (
              <div className="form-row">
                <div className="form-group1">
                  <label htmlFor="password">{PASSWORD_LABEL}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group1">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="form-buttons">
          <button type="submit" className="Add-employee-button">
            {role === 'department' ? 'Save Department' : SAVE_BUTTON_TEXT}
          </button>
          <button type="button" className="Add-employee-button" onClick={resetForm}>
            {CANCEL_BUTTON_TEXT}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
