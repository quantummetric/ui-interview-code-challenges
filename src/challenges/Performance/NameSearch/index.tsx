import React, { useState } from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ValidIcon from "../../../ValidIcon";
import names, { Name } from "./names";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type NameRowProps = {
  name: string;
  isMember: boolean;
  isSubscribed: boolean;
  onClickRow: (name: string) => void;
  isActive: boolean;
};

const NameRow: React.FC<NameRowProps> = ({
  name,
  isMember,
  isSubscribed,
  onClickRow,
  isActive,
}) => {
  const rowClasses = classnames("name-row", { active: isActive });
  return (
    <div className={rowClasses} key={name} onClick={() => onClickRow(name)}>
      <p>{name}</p>
      <div className="name-data">
        <div className="is-member">
          <p>Is Member: </p>
          <ValidIcon isValid={isMember} />
        </div>
        <div className="is-subscribed">
          <p>Is Subscribed: </p>
          <ValidIcon isValid={isSubscribed} />
        </div>
      </div>
    </div>
  );
};

const NameSearch: React.FC<Props> = (props) => {
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
        <span className="modal-title">QM Challenge: Name Search</span>
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

NameSearch.displayName = "NameSearch";
export default NameSearch;
