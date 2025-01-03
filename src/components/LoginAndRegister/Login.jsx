import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../store/auth"; // Importing the Auth context
import "react-toastify/dist/ReactToastify.css";
import "./styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [errors, setErrors] = useState({ email: '', password: '' }); // For storing error messages
  const { login } = useAuth(); // Use login from AuthContext
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate email and password
  const validate = () => {
    if (!formData.email || !formData.password) {
      toast.error("email and password both required");
      return false;
    }
    return true;  
  };

  // Handle login
  const handleLogin = async () => {
    toast.dismiss();
    if (!validate()) return; // Validate inputs before logging in

    setIsLoading(true);
    try {
      console.log(formData.email, formData.password);
      await login(formData.email, formData.password); // Login via AuthContext
      toast.success("Login successful!");
      navigate("/home"); // Redirect to home page
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <img src="logo.jpg" className="login-img" alt="Illustration" />
        </div>
        <div className="login-right">
          <h2>Welcome Back</h2>
          <p>Please login to your account</p>
          <form 
  className="login-form" 
  onSubmit={(e) => {
    e.preventDefault(); // Prevent the default form submission
    handleLogin(); // Call the login function
  }}
>
<label htmlFor="email" className="form-label">Email ID</label>
<input
  type="email"
  name="email"
  placeholder="Email address"
  value={formData.email}
  onChange={handleChange}
  required
  autoComplete="email"
/>
<label htmlFor="password" className="form-label">Password</label>
<input
  type={showPassword ? "text" : "password"}
  name="password"
  placeholder="Password"
  value={formData.password}
  onChange={handleChange}
  required
  autoComplete="current-password"
/>

  <div
    className="show-password"
    onClick={togglePasswordVisibility}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? "Hide password" : "Show password"}
  </div>
  <button
    type="submit" // Correct type for triggering on Enter
    className="login-button"
    disabled={isLoading}
  >
    {isLoading ? "Logging in..." : "Login"}
  </button>
</form>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link className="signup-link" to="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
