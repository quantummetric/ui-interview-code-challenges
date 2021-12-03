import React, { useState } from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import names, { Name } from "./names";
import NameRow from './NameRow';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ChallengeModal06: React.FC<Props> = (props) => {
  const { isOpen, onClose } = props;
  const [nameToSearch, setNameToSearch] = useState<string>("");
  const [filteredNames, setFilteredNames] = useState<Name[]>(names);
  const [activeName, setActiveName] = useState<string>("");

  const modalClasses = classnames("challenge-modal", "name-search", {
    "is-open": isOpen,
  });

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const eventValue = event.target.value;
    setNameToSearch(eventValue);
    setFilteredNames(
      names
        .filter(({ name }) =>
          name.toLowerCase().includes(eventValue.toLowerCase())
        )
        .sort((a, b) => (a.name > b.name ? 1 : -1))
    );
  };

  const onClickRow = (name) => {
    setActiveName(name);
  };

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge Modal 06</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">
        <input onChange={onSearch} value={nameToSearch} />
        {filteredNames.map(({ name, isMember, isSubscribed }) => {
          return (
            <NameRow
              key={name}
              name={name}
              isMember={isMember}
              isSubscribed={isSubscribed}
              isActive={activeName === name}
              onClickRow={onClickRow}
            />
          );
        })}
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
};

ChallengeModal06.displayName = "ChallengeModal06";
export default ChallengeModal06;
