import React, { useEffect, useState } from "react";
import "./TrainingCalendar.css";
import { useAuth } from "../../store/auth";
import html2pdf from "html2pdf.js";
import Modal from "./Modal.jsx"; // Import the Modal component

function TrainingCalendar() {
  const { authToken } = useAuth();
  const [courseData, setCourseData] = useState([]); // State to hold course data with planned dates, enrollments, and reports
  const [loading, setLoading] = useState(true); // Loading state for API calls
  const [groupedCourses, setGroupedCourses] = useState([]); // New state for grouped courses
  const [remarks, setRemarks] = useState({});
  console.log("remarks",remarks);
  // const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [dueDate, setDueDate] = useState(""); // State to hold the due date for the modal
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]; // Month array
  const showModal = (date) => {
    setDueDate(date);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setDueDate(""); // Reset due date when modal is closed
  };
  // Generate an array of years to navigate (past 4 years and 1 future year)
  const yearOptions = (() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);
  })();

  const handleCommit=async()=>{
    
  }

  // Fetch planned courses data
  useEffect(() => {
    if (!authToken) {
      console.error("No authorization token found.");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch planned courses
        const plannedCoursesResponse = await fetch(
          "http://localhost:3000/api/planned-courses/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!plannedCoursesResponse.ok) {
          throw new Error("Failed to fetch planned courses");
        }

        const plannedCoursesData = await plannedCoursesResponse.json();
        const plannedCourses = plannedCoursesData.data.map((course) => ({
          courseId: course.courseId,
          plannedCourseId: course.plannedCourseId,
          plannedDate: course.plannedDate,
          status: course.status,
        }));

        // Fetch course details for each planned course
        const courseDetailsPromises = plannedCourses.map(async (course) => {
          const courseResponse = await fetch(
            `http://localhost:3000/api/courses/courseId/${course.courseId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!courseResponse.ok) {
            throw new Error(
              `Failed to fetch course details for courseId ${course.courseId}`
            );
          }

          const courseData = await courseResponse.json();
          const courseName = courseData.data.name;

          return {
            ...course,
            courseName,
          };
        });

        const coursesWithDetails = await Promise.all(courseDetailsPromises);

        // Fetch enrollments for each course
        const enrollmentsResponse = await fetch(
          "http://localhost:3000/api/enrollments",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!enrollmentsResponse.ok) {
          throw new Error("Failed to fetch enrollments");
        }

        const enrollmentsData = await enrollmentsResponse.json();

        // Add enrollments and dateOfEvaluation to courses
        const updatedCourses = coursesWithDetails.map((course) => {
          const enrollments = enrollmentsData.data.filter(
            (enrollment) =>
              enrollment.plannedCourseId === course.plannedCourseId
          );

          // Check if any enrollment has a dateOfEvaluation
          const dateOfEvaluation = enrollments.some(
            (enrollment) => enrollment.dateOfEvaluation
          )
            ? enrollments[0].dateOfEvaluation // Get the first enrollment's dateOfEvaluation
            : null;

          return { ...course, enrollments, dateOfEvaluation };
        });

        // Fetch reports data
        const reportsResponse = await fetch(
          "http://localhost:3000/api/reports/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!reportsResponse.ok) {
          throw new Error("Failed to fetch reports");
        }

        const reportsData = await reportsResponse.json();

        // Add report details to enrollments (only the first enrollment per course)
        const finalCourses = updatedCourses.map((course) => {
          course.enrollments.forEach((enrollment, index) => {
            if (index === 0) {
              const report = reportsData.data.find(
                (report) => report.reportId === enrollment.reportId
              );
              if (report) {
                course.reportDetails = {
                  reportId: report.reportId,
                  actualDate: report.actualDate,
                  dueDate: report.dueDate,
                };
              }
            }
          });
          return course;
        });

        // Filter courses by selected year
        const filteredCourses = finalCourses.filter(course => {
          const courseYear = new Date(course.plannedDate).getFullYear();
          return courseYear === selectedYear;
        });

        // Add this right before setCourseData(finalCourses)
        const groupedByName = filteredCourses.reduce((acc, course) => {
          if (!acc[course.courseName]) {
            acc[course.courseName] = {
              courseName: course.courseName,
              instances: [],
            };
          }
          acc[course.courseName].instances.push({
            plannedCourseId: course.plannedCourseId,
            plannedDate: course.plannedDate,
            dateOfEvaluation: course.dateOfEvaluation,
            reportDetails: course.reportDetails,
            enrollments: course.enrollments,
          });
          return acc;
        }, {});

        const groupedCoursesArray = Object.values(groupedByName);
        setGroupedCourses(groupedCoursesArray);
        setCourseData(filteredCourses);
        setLoading(false); // Set loading to false after all data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false on error
      }
    };

    fetchData();
  }, [authToken, selectedYear]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to download the table as a PDF
  const downloadPDF = () => {
    const element = document.getElementById("training-table");
    const options = {
      filename: `training-calendar-${selectedYear}.pdf`,
      html2canvas: { scale: 6 },
      jsPDF: { unit: "mm", format: "a2", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  // Helper function to calculate days difference between two dates
  const getDaysDifference = (date1, date2) => {
    const diffTime = new Date(date1) - new Date(date2);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Return difference in days
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
          {modalVisible && <Modal dueDate={dueDate} closeModal={closeModal} />}

      <div className="training-calendar" id="training-table">
        <div className="training-calendar-header">
          <h2 className="training-title">Training Calendar - {selectedYear}</h2>
        </div>
          <div className="training-year-navigation">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="training-year-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
  
        <div className="training-table-container">
        <table className="training-table">
            <thead>
              <tr>
                <th className="training-sr-col">SR. No.</th>
                <th style={{ width: 1 }}>TRAINING PROGRAM DETAILS</th>
                {months.map((month, index) => (
                  <th key={index}>{month}</th>
                ))}
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {groupedCourses.map((course, index) => (
                <React.Fragment key={course.courseName}>
                  <tr>
                    {console.log(course)}
                    <td className="training-sr-col" rowSpan="2">
                      {index + 1}
                    </td>
                    <td rowSpan="2">{course.courseName}</td>
                    {months.map((month, monthIndex) => {
                      const instancesThisMonth = course.instances.filter(
                        (instance) =>
                          new Date(instance.plannedDate).getMonth() ===
                          monthIndex
                      );

                      const hasEvaluation = instancesThisMonth.some(
                        (instance) => instance.dateOfEvaluation
                      );

                      const hasDueDate = instancesThisMonth.some(
                        (instance) => instance.reportDetails?.dueDate
                      );

                      const daysDifference = hasDueDate
                        ? getDaysDifference(
                            new Date(),
                            new Date(
                              instancesThisMonth[0].reportDetails.dueDate
                            )
                          )
                        : 0;

                      const showOrangeBackground =
                        !hasEvaluation && hasDueDate && daysDifference > 14;
                      const showRedBackground =
                        !hasEvaluation && hasDueDate && daysDifference < 14;

                      return (
                        <td
                          key={monthIndex}
                          className={
                            hasEvaluation 
                              ? "training-has-evaluation" 
                              : showOrangeBackground 
                              ? "training-show-orange-background" 
                              : showRedBackground? "training-show-red-background":" "
                          }
                        >
                          {instancesThisMonth.map((instance, idx) => (
                            <div key={idx} className="training-date-cell">
                              {instance.dateOfEvaluation
                                ? formatDate(instance.dateOfEvaluation)
                                : formatDate(instance.plannedDate)}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                    <td rowSpan="2">
                      <input
                        type="text"
                        value={remarks[course.courseName]}
                        onChange={(e) => {
                          const newRemarks = {
                            ...remarks,
                            [course.courseName]: e.target.value,
                          };
                          setRemarks(newRemarks);
                        }}
                        className="training-remark-input"
                        placeholder="remark"
                        title="Enter remark here"
                      />
                    </td>
                  </tr>
                  <tr>
                    {months.map((month, monthIndex) => {
                      const instancesThisMonth = course.instances.filter(
                        (instance) =>
                          new Date(instance.plannedDate).getMonth() ===
                          monthIndex
                      );

                      const hasReport = instancesThisMonth.some(
                        (instance) => instance.reportDetails?.actualDate
                      );

                      const daysDifference =
                        instancesThisMonth.length > 0
                          ? getDaysDifference(
                              new Date(),
                              new Date(instancesThisMonth[0].plannedDate)
                            )
                          : 0;

                      const showRedBackground =
                        !hasReport &&
                        instancesThisMonth.length > 0 &&
                        daysDifference > 14;

                      return (
                        <td
                          key={monthIndex}
                          onClick={() => {
                            if (instancesThisMonth[0].reportDetails.dueDate)
                              showModal(
                                instancesThisMonth[0].reportDetails.dueDate
                              );
                          }}
                          className={
                            hasReport 
                              ? "training-has-report" 
                              : showRedBackground 
                              ? "training-show-red-background" 
                              : ""
                          }
                        >
                          {instancesThisMonth.map((instance, idx) => (
                            <div key={idx} className="training-date-cell">
                              {instance.reportDetails?.actualDate &&
                                formatDate(instance.reportDetails.actualDate)}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="color-info">
            {/* <div className="color-container">
              <div
                className="color"
                style={{ backgroundColor: "orange" }}
              ></div>
              <div className="color-card">Due Date</div>
            </div> */}
            <div className="color-container">
              <div className="color" style={{ backgroundColor: "green" }}></div>
              <div className="color-card">Attendance Successful</div>
            </div>
            <div className="color-container">
              <div
                className="color"
                style={{ backgroundColor: "lightgreen" }}
              ></div>
              <div className="color-card">Evaluation Successful</div>
            </div>
            <div className="color-container">
              <div className="color" style={{ backgroundColor: "red" }}></div>
              <div className="color-card">Pending</div>
            </div>
          </div>
          <button 
            className="training-download-btn" 
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default TrainingCalendar;