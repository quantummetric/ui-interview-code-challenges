import React, { useState } from "react";
import "./challenge.scss";
import QuantumMetricLogo from "./QuantumMetricLogo.svg";
import ChallengeModal01 from "./ChallengeModal01";
import ChallengeModal02 from "./ChallengeModal02";
import ChallengeModal03 from "./ChallengeModal03";
import ChallengeModal04 from "./ChallengeModal04";
import ChallengeModal05 from "./ChallengeModal05";
import ChallengeModal06 from "./ChallengeModal06";

const modals = [
  ChallengeModal01,
  ChallengeModal02,
  ChallengeModal03,
  ChallengeModal04,
  ChallengeModal05,
  ChallengeModal06,
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
