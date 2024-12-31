// src/components/Clients.jsx
import React from "react";
import { CLIENTS,CLIENT_SECTION_HEADING } from '../../constants/constant'; // Import client data
import "./styles/Client.css";
import "./styles/responsive.css";

const Clients = () => {
  return (
    <section id="clients" className="clients">
      <h2 className="client-heading">{CLIENT_SECTION_HEADING}</h2>
      <div className="client-logos">
        <div className="logos-container">
          {CLIENTS.map((client) => (
            <div key={client.id} className="client-logo">
              <img className="client-logo-img" src={client.logo} alt={client.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
