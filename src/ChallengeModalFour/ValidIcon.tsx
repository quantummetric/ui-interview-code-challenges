import React from "react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ValidIconProps = {
  isValid: boolean;
};

const ValidIcon: React.FC<ValidIconProps> = (props) => {
  const { isValid } = props;
  if (isValid === true) {
    return <FontAwesomeIcon className="is-valid" icon={faCheckCircle} />;
  } else if (isValid === false) {
    return <FontAwesomeIcon className="is-not-valid" icon={faTimesCircle} />;
  }
  return isValid;
};
ValidIcon.displayName = "ValidIcon";

export default ValidIcon;
