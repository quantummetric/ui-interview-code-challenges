import React from "react";
import classnames from "classnames";
import ValidIcon from "../ValidIcon";

type Props = {
  name: string;
  isMember: boolean;
  isSubscribed: boolean;
  onClickRow: (name: string) => void;
  isActive: boolean;
};

const NameRow: React.FC<Props> = ({
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

NameRow.displayName = "NameRow";
export default NameRow;
