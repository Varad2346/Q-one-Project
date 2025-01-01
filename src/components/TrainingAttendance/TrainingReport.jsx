import { useEffect, useState } from 'react';
import Select from 'react-select';  // Import react-select
import './TrainingReport.css';
import { useAuth } from '../../store/auth';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TrainingReport = () => { 
  const { authToken } = useAuth();
  const [trainingData, setTrainingData] = useState(null);
  const [effectivenessPeriod, setEffectivenessPeriod] = useState({ value: '1', label: '1 Month' });
  const [feedback, setFeedback] = useState({});  // Feedback now stored by userId
  const [trainingTopic, setTrainingTopic] = useState(null);
  const [trainingTopics, setTrainingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // Enrollment data
  const [users, setUsers] = useState([]);  // Users data
  const [plannedDate, setPlannedDate] = useState(null);
  console.log("pdd",plannedDate);
  
  // Fetch categories and courses on load
  useEffect(() => {
    const fetchCategories = async () => {
      if (!authToken) {
        alert('No authentication token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/courseCategory', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
          fetchCoursesForAllCategories(data.data);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [authToken]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!authToken) {
        alert('No authentication token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const employees = data.data.filter(user => user.role === 'employee');
          setUsers(employees); // Store users in the state
        } else {
          console.error('Failed to fetch users:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [authToken]);

  // Fetch enrollments data
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!authToken) {
        alert('No authentication token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/enrollments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.data); // Store enrollments in the state
        } else {
          console.error('Failed to fetch enrollments:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      }
    };

    fetchEnrollments();
  }, [authToken]);

  // Fetch planned courses when a topic is selected
  useEffect(() => {
    const fetchPlannedCourses = async () => {
      if (!authToken) {
        alert('No authentication token found!');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/planned-courses/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlannedCourses(data.data); // Save the planned courses data
        } else {
          console.error('Failed to fetch planned courses:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching planned courses:', error);
      }
    };

    fetchPlannedCourses();
  }, [authToken]);

  // Fetch courses for all categories
  const fetchCoursesForAllCategories = async (categories) => {
    const coursesData = {};
    for (const category of categories) {
      try {
        const response = await fetch(`http://localhost:3000/api/courses/${category.categoryId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const courses = await response.json();
          coursesData[category.categoryId] = courses.data;
        } else {
          console.error(`Failed to fetch courses for category ${category.categoryId}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error fetching courses for category ${category.categoryId}:`, error);
      }
    }

    setCoursesByCategory(coursesData);

    const topicsOptions = [];
    categories.forEach((category) => {
      if (coursesData[category.categoryId]) {
        coursesData[category.categoryId].forEach((course) => {
          topicsOptions.push({
            value: course.courseId,
            label: `${course.name}`,
            categoryId: category.categoryId,
            trainerName:`${course.trainer.firstName} ${course.trainer.lastName}`,
            trainerDepartment:course.trainer.department
          });
        });
      }
    });
    setTrainingTopics(topicsOptions);
    setTopicsLoading(false);
  };

  // Period options
  const periodOptions = [
    { value: '1', label: '1 Month' },
    { value: '2', label: '2 Months' },
    { value: '3', label: '3 Months' },
    { value: 'Immediate', label: 'Immediate' },
  ];

  const calculateDueDate = (plannedDate, effectivenessPeriod) => {
    if (!plannedDate || !effectivenessPeriod) {
      return 'N/A';
    }

    // If the effectiveness period is "Immediate", return the current date
    if (effectivenessPeriod === 'Immediate') {
      return new Date().toISOString().split('T')[0]; // Current date as 'YYYY-MM-DD'
    }

    const date = new Date(plannedDate);
    const period = parseInt(effectivenessPeriod); // Convert the string to an integer

    // Add months to the plan date
    date.setMonth(date.getMonth() + period);

    return date.toISOString().split('T')[0]; // Format the date as 'YYYY-MM-DD'
  };

  const getPlannedDateForCourse = (courseId) => {
    if (!plannedCourses || plannedCourses.length === 0) {
      return 'N/A';  // Return a fallback value if plannedCourses is empty or undefined
    }
  
    const plannedCourse = plannedCourses.find(course => course.courseId === courseId);
  
    if (!plannedCourse) {
      return 'N/A';  // Return 'N/A' if no planned course is found for the given courseId
    }
  
    return new Date(plannedCourse.plannedDate).toISOString().split('T')[0]; // Format the date as 'YYYY-MM-DD'
  };
  
  // Use useEffect to set plannedDate when the training topic changes
  useEffect(() => {
    if (trainingTopic && plannedCourses.length > 0) {
      const coursePlannedDate = getPlannedDateForCourse(trainingTopic.value);
      setPlannedDate(coursePlannedDate);
    }
  }, [trainingTopic, plannedCourses]); 

  const handleCommitChanges = async () => {
    const actualDate = new Date().toISOString().split('T')[0];

    // Step 1: Create the report by sending details to /api/reports
    const reportData = {
      actualDate,
      trainingTime: "120", // Hardcoded training time, modify as needed
      trainingEffectivenessPeriod: effectivenessPeriod.label,
      dueDate: calculateDueDate(plannedDate, effectivenessPeriod.value),
    };

    try {
      const response = await fetch('http://localhost:3000/api/reports/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to create the report');
      }

      const report = await response.json();
      const reportId = report.data.reportId;

      toast.success('Training report created successfully!');

      // Step 2: Now, for each participant, update their enrollment status and feedback
      for (const user of filteredUsers || []) {
        const enrollmentData = {
          participantStatus: attendanceStatus[user.userId] || 'Absent',
          trainingFeedback: feedback[user.userId] || '8',
          reportId,
        };
        console.log(enrollmentData);
        console.log(enrollments);
      
        // Find the enrollment matching the userId
        const userEnrollment = enrollments.find((data) => data.userId === user.userId);
      
        if (userEnrollment) {
          try {
            // Update the enrollment using the enrollmentId from the found enrollment
            const enrollmentResponse = await fetch(`http://localhost:3000/api/enrollments/${userEnrollment.enrollmentId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify(enrollmentData),
            });
      
            if (enrollmentResponse.ok) {
              console.log(`Enrollment for ${user.firstName} ${user.lastName} updated successfully!`);
            } else {
              console.error(`Failed to update enrollment for ${user.firstName} ${user.lastName}:`, enrollmentResponse.statusText);
            }
          } catch (error) {
            console.error('Error submitting data for user:', user.firstName, error);
          }
        } else {
          console.error(`No enrollment found for user ${user.firstName} ${user.lastName}`);
        }
      }
      toast.success('Changes committed successfully for all participants!');
    } catch (error) {
      console.error('Error creating the training report:', error);
      toast.error('Failed to create the training report');
    }
  };

  // Filter users based on enrollments for selected training topic
  const filteredUsers = users.filter(user =>
    enrollments.some(enrollment =>
      enrollment.userId === user.userId &&
      plannedCourses.some(plannedCourse =>
        plannedCourse.plannedCourseId === enrollment.plannedCourseId &&
        plannedCourse.courseId === trainingTopic?.value
      )
    )
  );

  return (
    <>
      <div className="container">
        <h1 className="report-heading">TRAINING ATTENDANCE-2025</h1>
        <table className="training-report">
          <tbody>
            <tr>
              <td className="label merged" rowSpan="2">Training Topic</td>
              <td className="blank" rowSpan="2">
                <Select
                  value={trainingTopic}
                  onChange={(selectedTopic) => setTrainingTopic(selectedTopic)}
                  options={trainingTopics}
                  placeholder="Select Training Topic"
                />
              </td>
              <td className="label">Planned Date</td>
              <td className="value-row">
              {plannedDate}
              </td>
            </tr>

            <tr>
              <td className="label">Training Time</td>
              <td className="value-row">
                <input type="time" />
              </td>
            </tr>

            <tr>
              <td className="label" rowSpan={2}>Training Effectiveness</td>
              <td colSpan="1" rowSpan={2} className="wrapped">
                <Select
                  value={effectivenessPeriod}
                  onChange={setEffectivenessPeriod}
                  options={periodOptions}
                  placeholder="Select Effectiveness Period"
                />
              </td>
              <td className="label">Actual Date</td>
              <td className="blank">{new Date().toISOString().split('T')[0]}</td>
            </tr>

            <tr>
              <td className="label">Due Date</td>
              <td className="blank">
                {calculateDueDate(plannedDate, effectivenessPeriod.value)}
              </td>
            </tr>

            <tr>
              <td className="label">Trainer Name</td>
              <td className="blank">{trainingTopic?.trainerName || 'N/A'}</td>
              <td className="label">Department</td>
              <td className="blank">{trainingTopic?.trainerDepartment || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        <table className="attendance-table">
          <thead>
            <tr><th colSpan={6}>PARTICIPANTS LIST</th></tr>
            <tr>
              <th>Sr. No.</th>
              <th>Participant Name</th>
              <th>Department Name</th>
              <th>Sign</th>
              <th>Training Feedback</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.department || 'N/A'}</td>
                <td>
                  <button className='status-button' onClick={() => setAttendanceStatus((prev) => ({
                    ...prev,
                    [user.userId]: prev[user.userId] === 'Present' ? 'Absent' : 'Present'
                  }))}>
                    {attendanceStatus[user.userId] || 'Absent'}
                  </button>
                </td>
                <td>
                  <input className='feedback-input'
                    type="number"
                    min="1"
                    max="10"
                    value={feedback[user.userId] || ''}
                    onChange={(e) => setFeedback({ ...feedback, [user.userId]: e.target.value })}
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">No users available for this training.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="commit-button-container">
          <button className="commit-button" style={{ backgroundColor: "red", marginRight: "10px" }} onClick={handleCommitChanges}>Download Report</button>
          <button className="commit-button" onClick={handleCommitChanges}>Commit Changes</button>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default TrainingReport;
