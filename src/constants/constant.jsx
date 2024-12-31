// src/constants/constant.jsx

// Text constants for AddEmployeeForm.jsx
export const ADD_EMPLOYEE_FORM_TITLE = "Add Employee";
export const ADD_HR_FORM_TITLE = "Add HR";
export const FIRST_NAME_LABEL = "First Name";
export const LAST_NAME_LABEL = "Last Name";
export const GENDER_LABEL = "Gender";
export const MALE_LABEL = "Male";
export const FEMALE_LABEL = "Female";
export const EMAIL_LABEL = "Email";
export const PASSWORD_LABEL = "Password";
export const MOBILE_NUMBER_LABEL = "Mobile Number";
export const SAVE_BUTTON_TEXT = "Save";
export const SAVE_AND_ADD_ANOTHER_BUTTON_TEXT = "Save & Add Another";
export const CANCEL_BUTTON_TEXT = "Cancel";
export const EMPLOYEE_LABEL = 'Employee';
export const HR_LABEL = 'HR';
export const ROLE_LABEL = 'Role';

export const CLIENTS = [
  { id: 1, logo: "/logos/logo1.png", name: "Client 1" },
  { id: 2, logo: "/logos/logo2.png", name: "Client 2" },
  { id: 3, logo: "/logos/logo3.png", name: "Client 3" },
  { id: 4, logo: "/logos/logo8.png", name: "Client 4" },
  { id: 5, logo: "/logos/logo5.png", name: "Client 5" },
  { id: 6, logo: "/logos/logo6.png", name: "Client 6" },
  { id: 7, logo: "/logos/logo7.png", name: "Client 7" },
  { id: 8, logo: "/logos/logo8.png", name: "Client 8" },
  { id: 9, logo: "/logos/logo9.jpg", name: "Client 9" },
  { id: 10, logo: "/logos/logo10.png", name: "Client 10" },
];
// Text constants for Client.jsx
export const CLIENT_SECTION_HEADING = "Our Clients";

// Constants for Faq.jsx
export const FAQ_HEADING = 'FAQ';

export const FAQ_LIST = [
  {
    question: 'What is React?',
    answer: 'React is a JavaScript library for building user interfaces.',
  },
  {
    question: 'What is a component?',
    answer: 'A component in React is an independent, reusable piece of UI.',
  },
  {
    question: 'What is a component?',
    answer: 'A component in React is an independent, reusable piece of UI.',
  },
  {
    question: 'What is a component?',
    answer: 'A component in React is an independent, reusable piece of UI.',
  },
  {
    question: 'What is a component?',
    answer: 'A component in React is an independent, reusable piece of UI.',
  },
  {
    question: 'What is a component?',
    answer: 'A component in React is an independent, reusable piece of UI.',
  },
  // Add more FAQs as needed
];

// Constants for HeroSection.jsx


  import { FaHardHat, FaClipboardCheck, FaLeaf, FaMicroscope, FaChartLine, FaUserGraduate, FaCogs, FaDesktop, FaCarAlt, FaCertificate, FaReact } from 'react-icons/fa';



  import logo from "../assets/upmyskill_logo.jpg"; // Adjust the path based on the location of `constant.jsx`

  export const LOGO_SRC = logo;
  
  // business excellence
export const NAVBAR_LINKS = [
    { path: "/home", label: "Home" },
    // { path: "#about", label: "About" },
    { path: "#services", label: "Training Topics", scrollTo: "services" },
    // { path: "#clients", label: "Clients", scrollTo: "clients" },
    // { path: "#faq", label: "FAQ", scrollTo: "faq" },
  ];
  

  
  export const labels = {
    addEmployees: "Add Employees",
    formErrorCourses: "Please select at least one course.",
    formErrorDurations: "Please select duration for all selected courses.",
    formErrorEmployees: "Please select at least one employee.",
    submit: "Submit",
    reset: "Reset",
  };
  
  export const tableHeaders = {
    srNo: "SR NO",
    topic: "Topic",
    duration: "Duration",
    select: "Select"
  };
  


// src/constants/constant.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCalendarAlt, faCheckCircle, faClipboardList } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

export const DROPDOWN_OPTIONS = [
  {
    label: 'Add New Role',
    path: '/add-employee',
    icon: <FontAwesomeIcon icon={faUserPlus} />
  },
  {
    label: 'Training Calendar',
    path: '/training-calendar',
    icon: <FontAwesomeIcon icon={faCalendarAlt} />
  },
  {
    label: 'Training Attendance',
    path: '/training-attendance',
    icon: <FontAwesomeIcon icon={faClipboardList} />
  },
  {
    label: 'Training Evaluation',
    path: '/training-evaluation',
    icon: <FontAwesomeIcon icon={faCheckCircle} />
  },
];



export const ADD_HOD_FORM_TITLE = 'Add HOD';
export const ADD_TRAINER_FORM_TITLE = 'Add Trainer';

export const DEPARTMENT_LABEL = 'Department'; // Label for Department field


export const HOD_LABEL = 'HOD';
export const TRAINER_LABEL = 'Trainer';

