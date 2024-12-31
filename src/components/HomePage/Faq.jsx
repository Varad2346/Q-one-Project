// src/components/Faq.jsx
import React, { useState } from 'react';
import { FAQ_LIST,FAQ_HEADING } from '../../constants/constant'; // Import FAQ constants
import "./styles/Faq.css";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id='faq' className="faq-container">
      <h1 className="faq-heading">{FAQ_HEADING}</h1>
      {FAQ_LIST.map((faq, index) => (
        <div key={index} className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq(index)}>
            {faq.question}
            <span className="faq-icon">{openIndex === index ? '-' : '+'}</span>
          </div>
          {openIndex === index && (
            <div className="faq-answer">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default Faq;
