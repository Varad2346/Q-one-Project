import React, { useEffect, useState } from "react";
import "./TrainingCalendar.css";
import { useAuth } from "../../store/auth";

function TrainingCalendar() {
  const { authToken } = useAuth();
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedCourses, setGroupedCourses] = useState([]);
  const [remarks, setRemarks] = useState({}); // New state for remarks

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Rest of your existing useEffect and helper functions remain the same
  // ... (keep all the existing fetch logic and helper functions)

  const handleRemarkChange = (courseId, value) => {
    setRemarks(prev => ({
      ...prev,
      [courseId]: value
    }));
  };

  const downloadPDF = () => {
    const element = document.getElementById("training-table");
    const options = {
      filename: "training-calendar.pdf",
      html2canvas: { scale: 6 },
      jsPDF: { unit: "mm", format: "a3", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="training-calendar" id="training-table">
        <h2 className="title">Training Calendar - 2025</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="sr-no-column">SR. No.</th>
                <th style={{ width: '200px' }}>TRAINING PROGRAM DETAILS</th>
                {months.map((month, index) => (
                  <th key={index}>{month}</th>
                ))}
                <th style={{ width: '150px' }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {groupedCourses.map((course, index) => (
                <React.Fragment key={course.courseName}>
                  <tr>
                    <td className="sr-no-column" rowSpan="2">{index + 1}</td>
                    <td rowSpan="2">{course.courseName}</td>
                    {months.map((month, monthIndex) => {
                      const instancesThisMonth = course.instances.filter(
                        instance => new Date(instance.plannedDate).getMonth() === monthIndex
                      );
                      // Rest of your existing month cell logic
                      // ... (keep your existing cell rendering logic)
                      return (
                        <td key={monthIndex}>
                          {/* Your existing cell content */}
                        </td>
                      );
                    })}
                    <td rowSpan="2" className="remark-cell">
                      <input
                        type="text"
                        className="remark-input"
                        value={remarks[course.courseName] || ''}
                        onChange={(e) => handleRemarkChange(course.courseName, e.target.value)}
                        placeholder="Add remark..."
                      />
                      {remarks[course.courseName] && (
                        <div className="remark-tooltip">
                          {remarks[course.courseName]}
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    {months.map((month, monthIndex) => (
                      // Your existing second row month cells
                      // ... (keep your existing second row rendering logic)
                      <td key={monthIndex}>
                        {/* Your existing second row cell content */}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="download-button-container">
        <button className="download-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </>
  );
}

export default TrainingCalendar;