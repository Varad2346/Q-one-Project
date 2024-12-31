import React from "react";
import "./TrainingTable.css"
const TrainingTable = () => {
  return (
    <>
    <h2 className="main-title">Training Evaluation</h2>
    <div className="container">
    <header className="header">
      <table className="hod-table">
        <thead>
          <tr>
            <td className="hod-cell" colSpan={1}>HOD Name:</td>
            <td colSpan={2}>Yash Kamathe</td>
            <td className="department-cell vertical-divider">
              Department: 
            </td>
            <td colSpan={2}>Information Technology</td>
            <td className="year-cell">Year:</td>
            <td colSpan={2}>2025</td>
          </tr>
        </thead>
      </table>
    </header>
    
    <table className="training-table">
      <thead>
        <tr>
          <th className="actual-date-column">Actual Date</th>
          <th className="actual-date-column">Due Date</th>
          <th className="trainer-column">Training topic</th>
          <th className="trainer-column">Employee</th>
          <th className="trainer-column">Trainer</th>
          <th>Duration</th>
          <th colSpan="6">Evaluation of Effectiveness of Training</th>
          <th className="remark-column">Remark</th>
          <th className="doe-column">DOE</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>E</th>
          <th>F</th>
          <th className="remark-column"></th>
          <th className="doe-column"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="actual-date1">01 Sep</td>
          <td>02 Dec</td>
          <td>Soft Skill</td>
          <td>Shwetan Londhe</td>
          <td>Yash Kamathe</td>
          <td>8</td>
          <td><input type="text"  className="grade-input" /></td>
          <td><input type="text" className="grade-input" /></td>
          <td><input type="text" className="grade-input" /></td>
          <td><input type="text" className="grade-input" /></td>
          <td><input type="text" className="grade-input" /></td>
          <td><input type="text" className="grade-input" /></td>
          
          <td className="remark-column"></td>
          <td className="doe-column">16-11-2024</td>
        </tr>
      </tbody>
    </table>
  </div>
    </>
  );
};

export default TrainingTable;
