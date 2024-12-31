import React, { useEffect, useState } from 'react';
import Select from 'react-select';  // Import react-select
import './TrainingReport.css';

const TrainingReport = () => {
  const [trainingData, setTrainingData] = useState(null);
  const [effectivenessPeriod, setEffectivenessPeriod] = useState({ value: '1', label: '1 Month' }); // Default to 1 month
  const [feedback, setFeedback] = useState(0); // To track the training feedback input
  const [trainingTopic, setTrainingTopic] = useState(null); // To track the selected training topic
  const [trainingTopics, setTrainingTopics] = useState([]); // To track the available training topics
  const [isLoading, setIsLoading] = useState(true);  // Track loading state
  const [categories, setCategories] = useState([]);  // Store fetched categories
  const [courses, setCourses] = useState([]);  // Store fetched courses
  const [topicsLoading, setTopicsLoading] = useState(true); // Track loading state for topics
  const [userCoursesLoading, setUserCoursesLoading] = useState(true); // Track loading for user courses

  // Fetch categories and courses on load
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        alert('No authentication token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/courseCategory', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data); // Populate the state with the fetched categories
          fetchCourses(data[0].categoryId); // Fetch courses for the first category by default
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch courses based on selected category
  const fetchCourses = async (categoryId) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
      alert('No authentication token found!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${categoryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const topicOptions = data.map(course => ({
          value: course.courseId, // courseId is the unique identifier
          label: course.courseName, // courseName is the display text
        }));
        console.log(data)
        setCourses(data); // Populate the state with the fetched courses
        setTrainingTopics(topicOptions); // Populate the state with course topics
        setTopicsLoading(false); // Set loading state to false for topics
        if (data.length > 0) {
          fetchUserCourses(data[0].courseId); // Fetch user courses for the first course by default
        }
      } else {
        console.error('Failed to fetch courses:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch user courses based on selected course
  const fetchUserCourses = async (courseId) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
      alert('No authentication token found!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/userCourses/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrainingData(data); // Populate training data with the user course info
        setUserCoursesLoading(false); // Set loading state to false for user courses
        setIsLoading(false); // Set overall loading state to false once data is fetched
      } else {
        console.error('Failed to fetch user courses:', response.statusText);
        setUserCoursesLoading(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
      setUserCoursesLoading(false);
      setIsLoading(false);
    }
  };

  // Options for react-select (Effectiveness Period)
  const periodOptions = [
    { value: '1', label: '1 Month' },
    { value: '2', label: '2 Months' },
    { value: '3', label: '3 Months' },
    { value: 'Immediate', label: 'Immediate' }
  ];

  // If loading, return loading message
  if (isLoading || topicsLoading || userCoursesLoading) {
    return <div>Loading...</div>;
  }

  // Calculate Due Date based on Effectiveness Period and Plan Date
  const getDueDate = (planDate, effectivenessPeriod) => {
    const date = new Date(planDate);
    if (effectivenessPeriod === 'Immediate') {
      return new Date().toISOString().split('T')[0]; // Set due date as today's date
    }

    // Adding months based on the selected effectiveness period
    date.setMonth(date.getMonth() + parseInt(effectivenessPeriod)); // Add selected months
    return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  };

  // Submit data to the backend
  const handleCommitChanges = async () => {
    const actualDate = new Date().toISOString().split('T')[0]; // Today's date
    const token = localStorage.getItem('token');  // Assuming the token is stored with key 'token'
  
    // Iterate over all users and commit changes for each
    for (const user of trainingData[0].Users) {
      const userCourse = user.UserCourse;
      const postData = {
        userCourseId: userCourse.userCourseId,
        date: actualDate,
        trainerDetails: trainingData[0].trainerName,
        trainingEffectivenessPeriod: effectivenessPeriod.label,
        dueDate: getDueDate(userCourse.plan_date, effectivenessPeriod.value),
        status: 'Present',  // Adjust status if necessary
        trainingFeedback: feedback,  // Collect feedback from input
        trainingEffectivenessDate: actualDate,
        trainingEffectiveness: 'Yes'
      };
  
      try {
        const response = await fetch('http://localhost:3000/api/attendances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include token in the Authorization header
          },
          body: JSON.stringify(postData),
        });
  
        if (response.ok) {
          console.log(`Changes committed for ${user.firstName} ${user.lastName} successfully!`);
        } else {
          console.error(`Failed to commit changes for ${user.firstName} ${user.lastName}:`, response.statusText);
        }
      } catch (error) {
        console.error('Error submitting data for user:', user.firstName, error);
      }
    }
  
    // After all requests are done, show a general success message
    alert('Changes committed successfully for all participants!');
  };

  return (
    <>
      <h1 className="title">TRAINING REPORT</h1>
      <div className="container">
        {/* Training Report Table */}
        <table className="training-report">
          <tbody>
            <tr>
              <td className="label merged" rowSpan="2">Training Topic</td>
              <td className="blank" rowSpan="2">
                <Select
                  value={trainingTopic}
                  onChange={(selectedTopic) => {
                    setTrainingTopic(selectedTopic);
                    fetchUserCourses(selectedTopic.value);  // Fetch user courses when a new topic is selected
                  }}
                  options={trainingTopics}
                  placeholder="Select Training Topic"
                />
              </td>
              <td className="label">Plan Date</td>
              <td className="value-row">{new Date(trainingData[0].Users[0].UserCourse.plan_date).toISOString().split('T')[0]}</td>
            </tr>
            <tr>
              <td className="label">Training Time</td>
              <td className="value-row">
                <input type="time" />
              </td>
            </tr>

            <tr>
              <td className="label">Actual Date</td>
              <td className="blank">{new Date().toISOString().split('T')[0]}</td>
              <td className="label">Due Date</td>
              <td className="blank">{getDueDate(trainingData[0].Users[0].UserCourse.plan_date, effectivenessPeriod.value)}</td>
            </tr>

            <tr>
              <td className="label">Training Effectiveness</td>
              <td colSpan="3" className="wrapped">
                <Select
                  value={effectivenessPeriod}
                  onChange={setEffectivenessPeriod}
                  options={periodOptions}
                  placeholder="Select Effectiveness Period"
                />
              </td>
            </tr>

            <tr>
              <td className="label" colSpan="4">Trainer Details</td>
            </tr>

            <tr>
              <td className="label">Trainer Name</td>
              <td className="blank">{trainingData[0].trainerName}</td>
              <td className="label">Department</td>
              <td className="blank">{trainingData[0].Users[0].department}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="subtitle">ATTENDANCE</h2>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Participant Name</th>
              <th>Department Name</th>
              <th>Sign</th>
              <th>Training Feedback</th>
            </tr>
          </thead>
          <tbody>
            {trainingData[0].Users.map((user, index) => (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.department}</td>
                <td>Present</td>
                <td>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Commit Changes Button */}
        <div className="commit-button-container">
          <button className="commit-button" onClick={handleCommitChanges}>Commit Changes</button>
        </div>
      </div>
    </>
  );
};

export default TrainingReport;
