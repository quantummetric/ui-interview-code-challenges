import React from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const alertApi = "http://localhost:8080/api/getAlertData";

const Alerts: React.FC<IProps> = React.memo((props) => {
  const { isOpen, onClose } = props;

  const modalClasses = classnames("challenge-modal", {
    "is-open": isOpen,
  });

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge: Alerts</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">I'm a modal with no content</div>
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

Alerts.displayName = "Alerts";
export default Alerts;
