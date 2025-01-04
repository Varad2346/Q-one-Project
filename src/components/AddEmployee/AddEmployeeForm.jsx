//file updated by varad
import React, { useState, useEffect } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import './AddEmployeeForm.css';
import { useAuth } from '../../store/auth';
import { useSnackbar } from 'notistack'; // Import Notistack's hook

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
  DEPARTMENT_LABEL, // New department label
  SAVE_BUTTON_TEXT,
  CANCEL_BUTTON_TEXT
} from '../../constants/constant';

const AddEmployeeForm = () => {

    const { authToken }=useAuth();
    const { enqueueSnackbar } = useSnackbar(); // Initialize Notistack's enqueueSnackbar

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    password: '', // Default password for Employee and Trainer
    confirmPassword: '', // Add this
    mobileNumber: '',
    department: '',  // This field will be conditionally excluded for HR
    role: 'employee',
  });

  const [role, setRole] = useState('employee');

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for HR and HOD roles
    if (role === 'hr' || role === 'hod') {
      // Check if password and confirm password match
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Password and Confirm Password do not match!',{variant:'error'});
        return;
      }

      // Check if password is at least 6 characters long
      if (formData.password.length < 6) {
        enqueueSnackbar('Password must be at least 6 characters long!',{variant:'info'});
        return;
      }
    }

    console.log('Form Data Submitted:', formData);

    // Conditionally set the password based on the role
    const submitData = { ...formData };

    // If role is Employee or Trainer, set a default password
    if (role === 'employee' || role === 'trainer') {
      submitData.password = '123456'; // Default password
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
      console.log('User created:', data);
      enqueueSnackbar('User added successfully!',{variant:'success'});
      resetForm();
    } catch (error) {
      enqueueSnackbar(error.message || 'Error creating user',{variant:'error'});
      console.error('Error creating user:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: '',
      password: '', // Keep empty for HOD and HR
      confirmPassword: '', // Ensure confirmPassword is reset
      mobileNumber: '',
      department: '', // Reset department field
      role: role,
    });
  };

  const toggleRole = (selectedRole) => {
    setRole(selectedRole);
    setFormData((prevData) => ({
      ...prevData,
      role: selectedRole,
      password: selectedRole === 'employee' || selectedRole === 'trainer' ? '123456' : '', // Keep empty for HOD and HR
      confirmPassword: '', // Ensure confirmPassword is cleared when switching roles
    }));
  };

  return (
    <div className="form-container">
      {/* Role toggle section */}
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
      </div>

      {/* Form Title */}
      <h2 className="form-title">
        {role === 'employee'
          ? ADD_EMPLOYEE_FORM_TITLE
          : role === 'hr'
          ? ADD_HR_FORM_TITLE
          : role === 'hod'
          ? ADD_HOD_FORM_TITLE
          : ADD_TRAINER_FORM_TITLE}
      </h2>

      <form onSubmit={handleSubmit}>
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

        {/* Email and Department in one row */}
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
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>

        {/* Password and Confirm Password in one row */}
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

        <div className="form-buttons">
          <button type="submit" className="Add-employee-button">
            {SAVE_BUTTON_TEXT}
          </button>
          <button type="button" className="Add-employee-button" onClick={resetForm}>
            {CANCEL_BUTTON_TEXT}
          </button>
        </div>
      </form>

      {/* ToastContainer for notifications */}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default AddEmployeeForm;
