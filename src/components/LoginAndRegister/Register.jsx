import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/Register.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    gender: 'Male',
    email: '',
    mobilenumber: '',
    password: '',
    role: 'admin',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Automatically capitalize the first letter of fname and lname
    let formattedValue = value;
    if (name === 'fname' || name === 'lname') {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobilenumber)) {
      toast.error('Please enter a valid mobile number (10 digits)');
      return;
    }

    const dataToSend = {
      firstName: formData.fname,
      lastName: formData.lname,
      gender: formData.gender,
      email: formData.email,
      mobileNumber: formData.mobilenumber,
      password: formData.password,
      role: formData.role,
    };

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Registration failed');
        return;
      }

      toast.success('Registration successful!');
      setFormData({
        fname: '',
        lname: '',
        gender: 'Male',
        email: '',
        mobilenumber: '',
        password: '',
        role: 'admin',
      });
    } catch (err) {
      toast.error(err.message || 'An error occurred while registering');
    }
  };

  return (
    <div className="register-page">
      <ToastContainer />
      <div className="register-container">
        <div className="left-section">
          <img src="logo.jpg" className="register-img" alt="Illustration" />
        </div>
        <div className="right-section">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="fname">First Name</label>
                <input
                  type="text"
                  id="fname"
                  className="input-field"
                  placeholder="First Name"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="lname">Last Name</label>
                <input
                  type="text"
                  id="lname"
                  className="input-field"
                  placeholder="Last Name"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="input-field"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  className="input-field"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="input-field"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label htmlFor="mobilenumber">Mobile Number</label>
                <input
                  type="text"
                  id="mobilenumber"
                  className="input-field"
                  placeholder="Mobile Number"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button className="register-button" type="submit">
              Register
            </button>
          </form>
          <div className="login-prompt">
            Already have an account?{' '}
            <Link className="login-link" to="/">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
