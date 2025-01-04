import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import Notistack's hook
import './styles/Services.css';
import {
  FaLaptop,
  FaTools,
  FaTimes,
  FaHandshake,
  FaCertificate,
  FaAward,
  FaClipboardList,
  FaRecycle,
  FaCogs,
  FaChartLine,
  FaHeartbeat,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../store/auth';
import './styles/responsive.css';

const iconOptions = [
  { name: 'COMPUTER SKILL', icon: <FaLaptop /> },
  { name: 'TECHNICAL SKILL', icon: <FaTools /> },
  { name: 'SOFT_SKILL', icon: <FaHandshake /> },
  { name: 'ISO17025(NABL)', icon: <FaCertificate /> },
  { name: 'CERTIFICATION TRAINING', icon: <FaAward /> },
  { name: 'IATF19649', icon: <FaClipboardList /> },
  { name: 'EMS TRAINING', icon: <FaRecycle /> },
  { name: 'QMS TRAINING', icon: <FaCogs /> },
  { name: 'BUSINESS EXCELLENCE', icon: <FaChartLine /> },
  { name: 'HEALTH & SAFETY', icon: <FaHeartbeat /> },
];

const Services = () => {
  const { enqueueSnackbar } = useSnackbar(); // Initialize Notistack's enqueueSnackbar
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '', icon: null });
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/courseCategory', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const result = await response.json();
        const activeServices = result.data.filter((service) => !service.deletedAt);
        setServices(activeServices);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [authToken]);

  const handleAddTopic = async () => {
    if (!newTopic.name || !newTopic.description || !newTopic.icon) {
      enqueueSnackbar('Please fill in all fields and select an icon.', { variant: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/courseCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newTopic),
      });

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const result = await response.json();
      setServices((prevServices) => [...prevServices, result.data]);
      setModalOpen(false);
      setNewTopic({ name: '', description: '', icon: null });
      enqueueSnackbar('Training Topic added successfully!', { variant: 'success' });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to add training topic. Please try again.');
    }
  };

  const deleteCourses = async (categoryId) => {
    try {
      // Fetch all courses associated with the category
      const response = await fetch(`http://localhost:3000/api/courses/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch courses for category ${categoryId}`);
      }
  
      const result = await response.json();
      const courses = result.data; // Assuming this contains a list of courses
  
      // Iterate through each course and delete it
      for (const course of courses) {
        const deleteResponse = await fetch(`http://localhost:3000/api/courses/${course.courseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete course ${course.courseId}`);
        }
      }
    } catch (err) {
      console.error('Error deleting courses:', err);
      throw new Error('Failed to delete associated courses');
    }
  };
  

  const handleDeleteService = async (categoryId) => {
    if (isDeleting) return;
    setIsDeleting(true);
  
    try {
      console.log(`Deleting all courses for category ${categoryId}`);
      await deleteCourses(categoryId); // Delete all courses in the category
  
      console.log(`Deleting category ${categoryId}`);
      const response = await fetch(`http://localhost:3000/api/courseCategory/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
  
      // Update the state to remove the category
      setServices((prevServices) => prevServices.filter((service) => service.categoryId !== categoryId));
      setServiceToDelete(null);
      enqueueSnackbar('Training Topic and associated courses deleted successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete training topic. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  

  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
  };

  const getServiceIcon = (iconName) => {
    const foundIcon = iconOptions.find((option) => option.name === iconName);
    return foundIcon ? foundIcon.icon : <FaClipboardList />;
  };

  const handleCardClick = (categoryId) => {
    if (!showDeleteButtons) {
      navigate(`/coursetable/${categoryId}`);
    } else {
      setServiceToDelete(categoryId);
    }
  };

  return (
    <section id="services" className="services-section">
      {loading && <p>Loading courses...</p>}
      <h2 className="services-heading">Training Topics</h2>

      {services.length === 0 && !loading && (
        <div className="no-services-message">
          <p>No training topics available.</p>
        </div>
      )}

      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.categoryId} 
            className={`service-card ${showDeleteButtons ? 'delete-mode' : ''}`}
            onClick={() => handleCardClick(service.categoryId)}
          >
            <div className="service-icon">{getServiceIcon(service.name)}</div>
            <h3 className="service-title">{service.name}</h3>
            {showDeleteButtons && (
              <div className="delete-button">
                <FaTimes />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="service-buttons">
        <button className="add-button" onClick={() => setModalOpen(true)}>
          Add Training Topic
        </button>
        <button 
          className={`drop-button ${showDeleteButtons ? 'active' : ''}`} 
          onClick={toggleDeleteButtons}
        >
          {showDeleteButtons ? 'Cancel' : 'Drop Training Topic'}
        </button>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Training Topic</h2>
            <input
              type="text"
              placeholder="Topic Name"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={newTopic.description}
              onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            />

            <h3>Select an Icon:</h3>
            <div className="icon-picker">
              {iconOptions.map((option) => (
                <button
                  key={option.name}
                  className={`icon-button ${selectedIcon === option.name ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedIcon(option.name);
                    setNewTopic({ ...newTopic, icon: option.name });
                  }}
                >
                  {option.icon}
                </button>
              ))}
            </div>

            <div className="modal-buttons">
              <button onClick={handleAddTopic}>Submit</button>
              <button onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {serviceToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this Training Topic?</p>
            <p className="warning-text">This will also delete all courses associated with this topic!</p>
            <div className="confirm-buttons">
              <button onClick={() => handleDeleteService(serviceToDelete)}>Yes</button>
              <button onClick={() => setServiceToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </section>
  );
};

export default Services;