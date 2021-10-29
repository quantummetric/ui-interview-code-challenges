import React from "react";

type LegendData = {
  url: string;
  color: string;
};
interface IProps {
  legendData: LegendData[];
}

const ChartLegend: React.FC<IProps> = (props) => {
  const { legendData } = props;

  return (
    <div className="legend-items">
      {legendData.map(({ color, url }) => {
        return (
          <div className="legend-item-wrapper" key={url}>
            <div className="legend-item">
              <div className="circle" style={{ backgroundColor: color }} />
              <span className="text">{url}</span>
            </div>
            <div className="tooltip">{url}</div>
          </div>
        );
      })}
    </div>
  );
};

ChartLegend.displayName = "ChartLegend";

export default ChartLegend;
