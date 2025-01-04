import { useEffect, useState } from "react";
import Select from "react-select"; // Import react-select
import "./TrainingReport.css";
import { useSnackbar } from 'notistack'; // Import Notistack's hook
import { useAuth } from "../../store/auth";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const TrainingReport = () => {
  const { authToken } = useAuth();
  const [trainingData, setTrainingData] = useState(null);
  const [effectivenessPeriod, setEffectivenessPeriod] = useState({
    value: "1",
    label: "1 Month",
  });
  const { enqueueSnackbar } = useSnackbar(); // Initialize Notistack's enqueueSnackbar
  const [feedback, setFeedback] = useState({}); // Feedback now stored by userId
  const [trainingTopic, setTrainingTopic] = useState(null);
  console.log(trainingTopic);
  const [trainingTopics, setTrainingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [coursesByCategory, setCoursesByCategory] = useState({});
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [plannedCourses, setPlannedCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // Enrollment data
  const [users, setUsers] = useState([]); // Users data
  const [plannedDate, setPlannedDate] = useState(null);
  console.log("pdd", enrollments);

  // Fetch categories and courses on load
  useEffect(() => {
    const fetchCategories = async () => {
      if (!authToken) {
        alert("No authentication token found!");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/courseCategory",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
          // fetchCoursesForAllCategories(data.data);
        } else {
          console.error("Failed to fetch categories:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [authToken]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!authToken) {
        alert("No authentication token found!");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const employees = data.data.filter(
            (user) => user.role === "employee"
          );
          setUsers(employees); // Store users in the state
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [authToken]);

  // Fetch enrollments data
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!authToken) {
        alert("No authentication token found!");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/enrollments", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.data); // Store enrollments in the state
        } else {
          console.error("Failed to fetch enrollments:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };

    fetchEnrollments();
  }, [authToken]);

  // Fetch planned courses when a topic is selected
  useEffect(() => {
    const fetchPlannedCourses = async () => {
      if (!authToken) {
        alert("No authentication token found!");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/planned-courses/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPlannedCourses(data.data); // Save the planned courses data
        } else {
          console.error(
            "Failed to fetch planned courses:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching planned courses:", error);
      }
    };

    fetchPlannedCourses();
  }, [authToken]);

  // Fetch courses for all categories
  const fetchCoursesForAllCategories = async (categories) => {
    const coursesData = {};
    for (const category of categories) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/${category.categoryId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const courses = await response.json();
          coursesData[category.categoryId] = courses.data;
        } else {
          console.error(
            `Failed to fetch courses for category ${category.categoryId}:`,
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          `Error fetching courses for category ${category.categoryId}:`,
          error
        );
      }
    }

    setCoursesByCategory(coursesData);
    const topicsOptions = [];

// Loop through each category
categories.forEach((category) => {
  if (coursesData[category.categoryId]) {
    coursesData[category.categoryId].forEach((course) => {
      // Check if the courseId is in plannedCourses
      const plannedCoursesForThisCourse = plannedCourses.filter(
        (plannedCourse) => plannedCourse.courseId === course.courseId
      );
      console.log("ptr", plannedCoursesForThisCourse);

      plannedCoursesForThisCourse.forEach((plannedCourse) => {
        // Find if there's an enrollment with the same plannedCourseId
        const isCourseEnrolled = enrollments.some(
          (enrollment) =>
            enrollment.plannedCourseId === plannedCourse.plannedCourseId &&
            enrollment.reportId // Check if reportId exists in enrollment
        );

        // Only add to dropdown if no reportId exists for this course
        if (!isCourseEnrolled) {
          topicsOptions.push({
            courseId: plannedCourse.courseId,
            plannedCourseId: plannedCourse.plannedCourseId,
            value: plannedCourse.plannedCourseId, // Use plannedCourseId as value
            label: `${course.name}-${
              new Date(plannedCourse.plannedDate).toISOString().split("T")[0]
            }`, // Include the planned date
            categoryId: category.categoryId,
            trainerName: `${course.trainer.firstName} ${course.trainer.lastName}`,
            trainerDepartment: course.trainer.department,
            plannedDate: plannedCourse.plannedDate, // Include planned date for reference
          });
        }
      });
    });
  }
});

setTrainingTopics(topicsOptions);
setTopicsLoading(false);
  };

  useEffect(() => {
    if (plannedCourses.length > 0) {
      fetchCoursesForAllCategories(categories);
    }
  }, [plannedCourses, categories]);

  // Period options
  const periodOptions = [
    { value: "1", label: "1 Month" },
    { value: "2", label: "2 Months" },
    { value: "3", label: "3 Months" },
    { value: "Immediate", label: "Immediate" },
  ];

  const calculateDueDate = (actualDate, effectivenessPeriod) => {
    if (!actualDate || !effectivenessPeriod) {
      return "N/A";
    }

    // If the effectiveness period is "Immediate", return the current date
    if (effectivenessPeriod === "Immediate") {
      return new Date().toISOString().split("T")[0]; // Current date as 'YYYY-MM-DD'
    }

    const date = new Date(actualDate);
    const period = parseInt(effectivenessPeriod); // Convert the string to an integer

    // Add months to the plan date
    date.setMonth(date.getMonth() + period);

    return date.toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
  };

  const getPlannedDateForCourse = (plannedCourseId) => {
    if (!plannedCourses || plannedCourses.length === 0) {
      return "N/A"; // Return a fallback value if plannedCourses is empty or undefined
    }
    console.log("pr", plannedCourses);
    const plannedCourse = plannedCourses.find(
      (course) => course.plannedCourseId === plannedCourseId
    );
    console.log(plannedCourse);
    if (!plannedCourse) {
      return "N/A"; // Return 'N/A' if no planned course is found for the given courseId
    }

    return new Date(plannedCourse.plannedDate).toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
  };

  // Use useEffect to set plannedDate when the training topic changes
  useEffect(() => {
    if (trainingTopic && plannedCourses.length > 0) {
      const coursePlannedDate = getPlannedDateForCourse(
        trainingTopic.plannedCourseId
      );
      setPlannedDate(coursePlannedDate);
    }
  }, [trainingTopic, plannedCourses]);

  const handleCommitChanges = async () => {
    const actualDate = new Date().toISOString().split("T")[0];

    // Step 1: Create the report by sending details to /api/reports
    const reportData = {
      actualDate,
      trainingTime: "120", // Hardcoded training time, modify as needed
      trainingEffectivenessPeriod: effectivenessPeriod.label,
      dueDate: calculateDueDate(actualDate, effectivenessPeriod.value),
    };

    try {
      const response = await fetch("http://localhost:3000/api/reports/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error("Failed to create the report");
      }

      const report = await response.json();
      const reportId = report.data.reportId;

      enqueueSnackbar("Training report created successfully!",{variant:'success'});

      // Step 2: Now, for each participant, update their enrollment status and feedback
      for (const user of filteredUsers || []) {
        const enrollmentData = {
          participantStatus: attendanceStatus[user.userId] || "Absent",
          trainingFeedback: feedback[user.userId] || "8",
          reportId,
        };

        // Find the enrollment matching the userId and courseId/plannedDate
        const userEnrollments = enrollments.filter(
          (enrollment) =>
            enrollment.userId === user.userId &&
            plannedCourses.some(
              (plannedCourse) =>
                plannedCourse.courseId === trainingTopic?.courseId &&
                plannedCourse.plannedDate === trainingTopic?.plannedDate && // Match the planned date
                plannedCourse.plannedCourseId === enrollment.plannedCourseId
            )
        );

        // For each valid enrollment found for this user
        for (const userEnrollment of userEnrollments) {
          try {
            const enrollmentResponse = await fetch(
              `http://localhost:3000/api/enrollments/${userEnrollment.enrollmentId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(enrollmentData),
              }
            );

            if (enrollmentResponse.ok) {
              console.log(
                `Enrollment for ${user.firstName} ${user.lastName} updated successfully!`
              );
            } else {
              console.error(
                `Failed to update enrollment for ${user.firstName} ${user.lastName}:`,
                enrollmentResponse.statusText
              );
            }
          } catch (error) {
            console.error(
              "Error submitting data for user:",
              user.firstName,
              error
            );
          }
        }
      }

      enqueueSnackbar("Changes committed successfully for all participants!",{variant:'success'});
    } catch (error) {
      console.error("Error creating the training report:", error);
      enqueueSnackbar("Failed to create the training report",{variant:'error'});
    }
  };

  // Filter users based on enrollments for selected training topic
  const filteredUsers = users.filter((user) =>
    enrollments.some(
      (enrollment) =>
        enrollment.userId === user.userId &&
        plannedCourses.some(
          (plannedCourse) =>
            plannedCourse.plannedCourseId === enrollment.plannedCourseId &&
            plannedCourse.courseId === trainingTopic?.courseId &&
            !enrollment.reportId &&
            plannedCourse.plannedDate === trainingTopic?.plannedDate
        )
    )
  );
  console.log(trainingTopic)
  return (
    <>
      <div className="container">
        <h1 className="report-heading">TRAINING ATTENDANCE-2025</h1>
        <table className="training-report">
          <tbody>
            <tr>
              <td className="label merged" rowSpan="2">
                Training Topic
              </td>
              <td className="blank" rowSpan="2">
                {console.log("topic", trainingTopics)}
                <Select
                  value={trainingTopic}
                  onChange={(selectedTopic) => setTrainingTopic(selectedTopic)}
                  options={trainingTopics}
                  placeholder="Select Training Topic"
                />
              </td>
              <td className="label">Planned Date</td>
              <td className="value-row">{plannedDate}</td>
            </tr>

            <tr>
              <td className="label">Training Time</td>
              <td className="value-row">
                <input type="time" />
              </td>
            </tr>

            <tr>
              <td className="label" rowSpan={2}>
                Training Effectiveness
              </td>
              <td colSpan="1" rowSpan={2} className="wrapped">
                {trainingTopic ? (
                  <Select
                    value={effectivenessPeriod}
                    onChange={setEffectivenessPeriod}
                    options={periodOptions}
                    placeholder="Select Effectiveness Period"
                  />
                ) : (
                  "N/A" // Display 'N/A' when no training topic is selected
                )}
              </td>
              <td className="label">Actual Date</td>
              <td className="blank">
                {trainingTopic ? new Date().toISOString().split("T")[0] : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="label">Due Date</td>
              <td className="blank">
                {trainingTopic
                  ? calculateDueDate(
                      new Date().toISOString().split("T")[0],
                      effectivenessPeriod.value
                    )
                  : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="label">Trainer Name</td>
              <td className="blank">{trainingTopic?.trainerName || "N/A"}</td>
              <td className="label">Department</td>
              <td className="blank">
                {trainingTopic?.trainerDepartment || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="attendance-table">
          <thead>
            <tr>
              <th colSpan={6}>PARTICIPANTS LIST</th>
            </tr>
            <tr>
              <th className="report-serial-number">Sr. No.</th>
              <th className="report-participant-name">Participant Name</th>
              <th className="report-department-name">Department Name</th>
              <th className="report-sign-field">Sign</th>
              <th className="report-feedback-field">Training Feedback</th>
            </tr>
          </thead>
          <tbody>
            {console.log("fr",filteredUsers)}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.userId}>
                  <td className="report-serial-number">{index + 1}</td>
                  <td className="report-participant-name">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="report-department-name">{user.department || "N/A"}</td>
                  <td className="report-sign-field">
                    <button
                      className="status-button"
                      onClick={() =>
                        setAttendanceStatus((prev) => ({
                          ...prev,
                          [user.userId]:
                            prev[user.userId] === "Present"
                              ? "Absent"
                              : "Present",
                        }))
                      }
                    >
                      {attendanceStatus[user.userId] || "Absent"}
                    </button>
                  </td>
                  <td className="report-feedback-field">
                    <input
                      className="feedback-input"
                      type="number"
                      min="1"
                      max="10"
                      value={feedback[user.userId] || ""}
                      onChange={(e) =>
                        setFeedback({
                          ...feedback,
                          [user.userId]: e.target.value,
                        })
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No users available for this training.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="commit-button-container">
          {/* <button
            className="commit-button"
            style={{ backgroundColor: "red", marginRight: "10px" }}
            onClick={handleCommitChanges}
          >
            Download Report
          </button> */}
          <button className="commit-button" onClick={handleCommitChanges}>
            Commit Changes
          </button>
        </div>
      </div>
      {/* <ToastContainer /> */}
    </>
  );
};

export default TrainingReport;
