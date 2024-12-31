import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Services.css';
import { FaLaptop, FaTools, FaTimes, FaHandshake, FaCertificate, FaAward, FaClipboardList, FaRecycle, FaCogs, FaChartLine, FaHeartbeat } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../store/auth';
// Icon options to choose from

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
  const { authToken }=useAuth();
  // console.log("token",authToken)
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '', icon: null });
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null); // Added state for selected icon

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // const token = localStorage.getItem('token');
        // if (!token) throw new Error('No token found');
        
        const response = await fetch('http://localhost:3000/api/courseCategory', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const activeServices = data.filter(service => service.status !== 'deleted');
        setServices(activeServices);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic.name || !newTopic.description || !newTopic.icon) {
      toast.error('Please fill in both the topic name, description, and select an icon.');
      return;
    }

    try {
      // const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/courseCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newTopic),
      });

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const addedService = await response.json();
      setServices((prevServices) => [...prevServices, addedService]);
      setModalOpen(false);
      setNewTopic({ name: '', description: '', icon: null });
      toast.success('Training Topic added successfully!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to add training topic. Please try again.');
    }
  };

  const handleDeleteService = async (id) => {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/courseCategory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      setServices((prevServices) => prevServices.filter(service => service.categoryId !== id));
      setServiceToDelete(null);
      toast.success('Training Topic deleted successfully!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete training topic. Please try again.');
    }
  };

  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
  };

  // Helper function to map service icon
  const getServiceIcon = (iconName) => {
    const foundIcon = iconOptions.find(option => option.name === iconName);
    return foundIcon ? foundIcon.icon : <FaClipboardList />;
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
          <div key={service.categoryId} className="service-card" onClick={() => navigate(`/coursetable/${service.categoryId}`)}>
            <div className="service-icon">
              {getServiceIcon(service.icon)} {/* Render the icon based on the service.icon */}
            </div>
            <h3 className="service-title">{service.name}</h3>
            {showDeleteButtons && (
              <button
                className="delete-button"
                onClick={(e) => { e.stopPropagation(); setServiceToDelete(service.categoryId); }}
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="service-buttons">
        <button className="add-button" onClick={() => setModalOpen(true)}>
          Add Training Topic
        </button>
        <button className="drop-button" onClick={toggleDeleteButtons}>
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
                    setSelectedIcon(option.name); // Update the selected icon
                    setNewTopic({ ...newTopic, icon: option.name });
                  }}
                >
                  {option.icon}
                </button>
              ))}
            </div>

            <div className="service-buttons">
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
            <p>Are you sure you want to delete this service?</p>
            <button onClick={() => handleDeleteService(serviceToDelete)}>Yes</button>
            <button onClick={() => setServiceToDelete(null)}>Cancel</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </section>
  );
};

export default Services;
