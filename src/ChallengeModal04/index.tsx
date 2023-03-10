import React from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CIDRValidation from "./CIDRValidation";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeModal04: React.FC<IProps> = React.memo((props) => {
  const { isOpen, onClose } = props;

  const modalClasses = classnames("challenge-modal", {
    "is-open": isOpen,
  });

  // Don't edit these values
  const values = [
    {
      cidr: "0.0.0.0/0",
      isValid: true,
    },
    {
      cidr: "127.0.0.0/12",
      isValid: true,
    },
    {
      cidr: "16.10.0.0/16",
      isValid: true,
    },
    {
      cidr: "192.168.1.1/32",
      isValid: true,
    },
    {
      cidr: "0.0.0.0/0/0",
      isValid: false,
    },
    {
      cidr: "0.0.0.0/128",
      isValid: false,
    },
    {
      cidr: "0/0",
      isValid: false,
    },
  ];

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge Modal 04</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">
        <CIDRValidation values={values} />
      </div>
      <div className="submit-button-group">
        <button className="btn primary-btn" onClick={onClose}>
          Submit
        </button>
        <button className="btn secondary-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
});

ChallengeModal04.displayName = "ChallengeModal04";
export default ChallengeModal04;
