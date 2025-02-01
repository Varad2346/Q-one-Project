import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import Notistack's hook
import './styles/Services.css';
import * as Fa from 'react-icons/fa';
import { useAuth } from '../../store/auth';
import './styles/responsive.css';

const iconOptions = [
  { name: 'COMPUTER SKILL', icon: <Fa.FaLaptop /> },
  { name: 'TECHNICAL SKILL', icon: <Fa.FaTools /> },
  { name: 'SOFT_SKILL', icon: <Fa.FaHandshake /> },
  { name: 'ISO17025(NABL)', icon: <Fa.FaCertificate /> },
  { name: 'CERTIFICATION TRAINING', icon: <Fa.FaAward /> },
  { name: 'IATF19649', icon: <Fa.FaClipboardList /> },
  { name: 'EMS TRAINING', icon: <Fa.FaRecycle /> },
  { name: 'QMS TRAINING', icon: <Fa.FaCogs /> },
  { name: 'BUSINESS EXCELLENCE', icon: <Fa.FaChartLine /> },
  { name: 'HEALTH & SAFETY', icon: <Fa.FaHeartbeat /> },
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

  // Function to get the icon component based on the icon name
  const getServiceIcon = (iconName) => {
    const foundIcon = iconOptions.find((option) => option.name === iconName);
    return foundIcon ? foundIcon.icon : <Fa.FaClipboardList />;
  };

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

        // Map icon names to actual icon components
        const servicesWithIcons = activeServices.map((service) => ({
          ...service,
          iconComponent: getServiceIcon(service.icon), // Map the icon name to an icon component
        }));

        setServices(servicesWithIcons);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [authToken]);

  const handleAddTopic = async () => {
    if (!newTopic.name || !newTopic.description || !newTopic.icon) {
      enqueueSnackbar('Please fill in all fields and select an icon.', { variant: 'info' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/courseCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: newTopic.name,
          description: newTopic.description,
          icon: newTopic.icon, // Send the icon name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add service');
      }

      const result = await response.json();
      // Map icon name to actual icon after adding
      const newService = {
        ...result.data,
        iconComponent: getServiceIcon(result.data.icon), // Map the icon name to an icon component
      };

      setServices((prevServices) => [...prevServices, newService]);
      setModalOpen(false);
      setNewTopic({ name: '', description: '', icon: null });
      enqueueSnackbar('Training Topic added successfully!', { variant: 'success' });
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Failed to add training topic. Please try again.', { variant: 'error' });
    }
  };

  const deleteCourses = async (categoryId) => {
    try {
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
      const courses = result.data;

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
      await deleteCourses(categoryId);

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

      setServices((prevServices) => prevServices.filter((service) => service.categoryId !== categoryId));
      setShowDeleteButtons(false);
      setServiceToDelete(null);
      enqueueSnackbar('Training Topic and associated courses deleted successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Error deleting category:', err);
      enqueueSnackbar('Failed to delete training topic. Please try again.', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
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
      {loading && <h2>Loading courses...</h2>}
      <h2 className="services-heading">Training Topics</h2>

      {services.length === 0 && !loading && (
        <div className="no-services-message">
          <h1>No training topics available.</h1>
        </div>
      )}

      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.categoryId} 
            className={`service-card ${showDeleteButtons ? 'delete-mode' : ''}`}
            onClick={() => handleCardClick(service.categoryId)}
          >
            <div className="service-icon">{service.iconComponent}</div>
            <h3 className="service-title">{service.name}</h3>
            {showDeleteButtons && (
              <div className="delete-button">
                <Fa.FaTimes />
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

    </section>
  );
};

export default Services;
