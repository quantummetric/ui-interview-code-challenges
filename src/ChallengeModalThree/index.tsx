import React from 'react';
import classnames from 'classnames';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeModalTwo: React.FC<IProps> = React.memo((props) => {
  const { isOpen, onClose } = props;

  const modalClasses = classnames('challenge-modal', {
    'is-open': isOpen,
  });

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge Modal 3</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">I'm also an empty modal.</div>
      <div className="submit-button-group">
        <button className="create-button">Submit</button>
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
});

ChallengeModalTwo.displayName = 'ChallengeModalTwo';
export default ChallengeModalTwo;
