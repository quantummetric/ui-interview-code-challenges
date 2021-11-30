import React, { useState } from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MousePosition from "./MousePosition";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const Async: React.FC<IProps> = React.memo((props) => {
  const { isOpen, onClose } = props;
  const [showMousePosition, setShowMousePosition] = useState(false);

  const modalClasses = classnames("challenge-modal", {
    "is-open": isOpen,
  });

  const toggleShowMousePosition = () => {
    setShowMousePosition(!showMousePosition);
  };

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge: Mouse Move</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">
        {showMousePosition && <MousePosition />}
        <button className="btn primary-btn" onClick={toggleShowMousePosition}>
          {showMousePosition ? 'Hide Mouse Position' : 'Show Mouse Position'}
        </button>
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

Async.displayName = "Async";
export default Async;
