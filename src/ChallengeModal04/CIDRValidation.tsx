import React from "react";
import ValidIcon from "../ValidIcon";
import { isValidCidr } from "./util";

type CIDRValue = {
  cidr: string;
  isValid: boolean;
};

type CIDRValidationProps = {
  values: CIDRValue[];
};

const CIDRValidation: React.FC<CIDRValidationProps> = (props) => {
  const { values } = props;
  return (
    <>
      <div className="cidr-validation-header">
        <span>CIDR Value</span>
        <span>Is Valid? (Expected)</span>
        <span>Is Valid? (Result)</span>
      </div>
      {values.map(({ cidr, isValid }) => (
        <div className="cidr-validation-row" key={cidr}>
          <span>{cidr}</span>
          <span>
            <ValidIcon isValid={isValid} />
          </span>
          <span>
            <ValidIcon isValid={isValidCidr(cidr)} />
          </span>
        </div>
      ))}
    </>
  );
};

CIDRValidation.displayName = "CIDRValidation";
export default CIDRValidation;
