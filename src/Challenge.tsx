import React, { useState } from "react";
import "./challenge.scss";
import QuantumMetricLogo from "./QuantumMetricLogo.svg";
import DataViz from "./challenges/DataViz";
import Alerts from "./challenges/Alerts";
import Settings from "./challenges/Settings";
import DataValidation from "./challenges/DataValidation";
import MouseMove from "./challenges/Performance/MouseMove";
import NameSearch from "./challenges/Performance/NameSearch";

const modals = [
  DataViz,
  Alerts,
  Settings,
  DataValidation,
  MouseMove,
  NameSearch,
];

const Challenge = () => {
  const [currentModal, setCurrentModal] = useState(null);

  const onClose = () => {
    setCurrentModal(null);
  };

  return (
    <>
      <div className="welcome-content">
        <img src={QuantumMetricLogo} className="logo" alt="logo" />
        {modals.map((modal, idx) => {
          const Modal = modal;
          return (
            <React.Fragment key={Modal.displayName}>
              <button
                className="btn primary-btn cta-button"
                onClick={() => setCurrentModal(idx)}
              >
                Open Challenge {`${idx + 1}`.padStart(2, "0")}
              </button>
              <Modal isOpen={currentModal === idx} onClose={onClose} />
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

export default Challenge;
