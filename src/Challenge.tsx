import { useState } from "react";
import "./challenge.scss";
import QuantumMetricLogo from "./QuantumMetricLogo.svg";
import ChallengeModalOne from "./ChallengeModalOne";
import ChallengeModalTwo from "./ChallengeModalTwo";
import ChallengeModalThree from "./ChallengeModalThree";
import ChallengeModalFour from "./ChallengeModalFour";

const modals = [
  ChallengeModalOne,
  ChallengeModalTwo,
  ChallengeModalThree,
  ChallengeModalFour,
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
            <>
              <button
                className="cta-button"
                onClick={() => setCurrentModal(idx)}
              >
                Open Challenge {idx + 1}
              </button>
              <Modal isOpen={currentModal === idx} onClose={onClose} />
            </>
          );
        })}
      </div>
    </>
  );
};

export default Challenge;
