import React, { useState, useMemo, useRef, useEffect } from "react";
import classnames from "classnames";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MultiLineChart } from "../../charts/MultiLineChart";
import ChartLegend from "../../ChartLegend";
import { COLORS } from "../../charts/utilities/defaultConfig";
import { LineData } from "../../charts/utilities/types";
import { shapeChartData } from "./util";
import { VerticallySignificantContent } from "../../VerticallySignificantContent";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const formattedApi = "http://localhost:8080/api/getChartData/1";
const unformattedApi = "http://localhost:8080/api/getChartData/2";
const unformattedApiWithFailure = "http://localhost:8080/api/getChartData/3";

const DataViz: React.FC<IProps> = React.memo((props) => {
  const { isOpen, onClose } = props;

  const chartRef = useRef(null);

  const modalClasses = classnames("challenge-modal", {
    "is-open": isOpen,
  });

  const [chartData, setChartData] = useState<LineData[]>([]);

  let dims = {};
  if (chartRef.current) {
    const { height, width } =
      chartRef.current && chartRef.current.getBoundingClientRect();
    dims = { height, width };
  }

  return (
    <div className={modalClasses}>
      <div className="modal-header">
        <span className="modal-title">QM Challenge: Data Visualization</span>
        <button className="close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="modal-content">
        <div ref={chartRef} style={{ height: 300 }}>
          <MultiLineChart
            data={chartData}
            rect={chartRef.current ? (dims as any) : undefined}
          />
        </div>
        {/* <ChartLegend legendData={legendData} /> */}
        {/* <VerticallySignificantContent /> */}
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

DataViz.displayName = "DataViz";
export default DataViz;
