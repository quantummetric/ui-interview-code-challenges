import {
  SecondaryAxisLabelSelection,
  SecondaryAxisSelection,
  PrimaryAxisSelection,
  PrimaryAxisLabelSelection,
  Transitional,
  PrimaryAxisPosition,
  SecondaryAxisPosition,
} from "./types";
import moment from "moment";
import { tagRectVisibility, getLargestContiguousSum } from "./helpers";

const dayFormat: any = (d) => moment(d * 1000).format("MMM DD");

const shouldPrintDay = (ts: number) =>
  moment(ts * 1000)
    .startOf("day")
    .unix() === ts;

function secondaryAxisLabelSettings(
  position: PrimaryAxisPosition | SecondaryAxisPosition,
  height: number,
  right: number,
  left: number
) {
  const [rotation, x, y] =
    position === "right"
      ? [90, height / 2, -right * (3 / 4)]
      : [-90, -height / 2, -left * (3 / 4)];
  const fontColor = "black";
  const fontSize = "130%";
  const textAnchor = "middle";

  return { rotation, x, y, fontSize, fontColor, textAnchor };
}

// Utility formatters

/**
 * This function will selectively determine which ticks are supposed to be visible using the following
 * algorithm:
 *
 * 1. Make the first tick always visible
 * 2. Iterate over the ticks and determine the next tick which has no overlap with the last visible tick,
 * marking each tick as `0` (= visible) or `1` (= hidden) along the way
 * 3. Determine the largest number `N` of contiguously hidden ticks
 * 4. Cycle through all ticks and hide each `N` ticks, with the first tick always being visible
 *
 * The above approach gives a nice, even spacing between ticks and "pretends" all ticks are the width of the
 * widest tick text.
 *
 * Due to the asynchronous nature of D3 transitions this all must happen after the transition has completed,
 * hence the call to `.on('end', ...)` and `.end().finally()`. Otherwise the text nodes won't have the correct
 * bounding client rects and we won't be computing based on the correct positions/dimensions.
 *
 * @param {Object} primaryAxisTransition The D3 transition selection for the axis
 */
function hideCrowdedTicks(
  primaryAxisTransition: Transitional<PrimaryAxisSelection>
) {
  let lastVisibleRect: DOMRect;
  let tagEveryNNodes = 0;
  const hiddenRectsVector = [];
  const nodes: SVGGElement[] = [];

  primaryAxisTransition
    .each(function () {
      nodes.push(this);
    })
    .end()
    .finally(function () {
      nodes.forEach((node) => {
        if (!lastVisibleRect) {
          lastVisibleRect = node.getBoundingClientRect();
          hiddenRectsVector.push(0);
          return;
        }

        lastVisibleRect = tagRectVisibility(
          lastVisibleRect,
          node,
          hiddenRectsVector
        );
      });

      tagEveryNNodes = getLargestContiguousSum(hiddenRectsVector);
      primaryAxisTransition.nodes().forEach((node, idx) => {
        if (idx % (tagEveryNNodes + 1)) {
          node.parentElement.classList.add("transparent");
        } else {
          node.parentElement.classList.remove("transparent");
        }
      });
    });
}

// Primary axis formatters
function PRIMARY_AXIS_FORMATTER(
  primaryAxis: Transitional<PrimaryAxisSelection>
) {
  const { isHorizontal } = this.props;
  const tickText = primaryAxis.selectAll<SVGTextElement, number>(".tick text");

  primaryAxis.selectAll("line").attr(isHorizontal ? "y2" : "x2", 0);
  tickText
    .attr("text-anchor", isHorizontal ? "end" : "middle")
    .attr("x", isHorizontal ? -10 : 0)
    .attr("y", isHorizontal ? 3 : 17)
    .attr("dy", "0");

  !isHorizontal && hideCrowdedTicks.call(this, tickText);
}

const formatMajorTicksByBin = () => {
  const formatFn = (ts: number) => (shouldPrintDay(ts) ? dayFormat(ts) : "");

  return function selectiveTimeSeriesAxisFormatter(
    primaryAxisTransition: Transitional<PrimaryAxisSelection>
  ) {
    const tickText = primaryAxisTransition.selectAll(".tick text");

    tickText.text(formatFn);

    PRIMARY_AXIS_FORMATTER.call(this, primaryAxisTransition);
  };
};

const formatAxisByBin = () => {
  const formatFn = (d) => moment(d * 1000).format("ha");

  return function timeSeriesAxisFormatter(
    primaryAxisTransition: PrimaryAxisSelection
  ) {
    const tickText =
      primaryAxisTransition.selectAll<SVGTextElement, number>(".tick text");

    tickText.text(formatFn);

    PRIMARY_AXIS_FORMATTER.call(this, primaryAxisTransition);
  };
};

function PRIMARY_AXIS_LABEL_FORMATTER(
  primaryAxisLabel: PrimaryAxisLabelSelection
) {
  const { width: axisWidth } = this;

  primaryAxisLabel
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${axisWidth / 2}, 50)`)
    .attr("fill", "black")
    .attr("font-size", "100%");
}

// Secondary axis formatters
function SECONDARY_AXIS_FORMATTER(
  secondaryAxis: Transitional<SecondaryAxisSelection>
) {
  const { isHorizontal } = this.props;
  const {
    secondaryAxis: { position },
  } = this;

  const [x, textAnchor] = position === "right" ? [10, "start"] : [-10, "end"];

  secondaryAxis.selectAll("line").attr(isHorizontal ? "x2" : "y2", 0);
  secondaryAxis
    .selectAll<SVGGElement, number>(".tick")
    .attr("data-tick", (d) => d)
    .select("text")
    .attr("x", isHorizontal ? 0 : x)
    .attr("y", 0)
    .attr("dy", isHorizontal ? "1.25em" : "0.32em")
    .attr("text-anchor", isHorizontal ? "middle" : textAnchor);
}

function SECONDARY_AXIS_ALT_XPOS_FORMATTER(
  secondaryAxis: Transitional<SecondaryAxisSelection>
) {
  const { isHorizontal } = this.props;
  const {
    secondaryAxis: { position },
  } = this;
  const x = position === "right" ? 5 : -5;
  secondaryAxis.selectAll(".tick text").attr("x", isHorizontal ? 0 : x);
}

// function numericSecondaryAxisFormatter(secondaryAxis: Transitional<SecondaryAxisSelection>) {
//     SECONDARY_AXIS_FORMATTER.call(this, secondaryAxis);
//     secondaryAxis
//         .selectAll<SVGTextElement, number>('.tick text')
//         .text((n) => formatNumber(n, inferDecimalPlaces(n)));
// }

const DURATION_CONVERSION_FACTORS = Object.freeze({
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1,
});

const DURATION_CONVERSION = Object.freeze({
  hour: (d) => d / DURATION_CONVERSION_FACTORS.hour,
  minute: (d) => d / DURATION_CONVERSION_FACTORS.minute,
  second: (d) => d / DURATION_CONVERSION_FACTORS.second,
  millisecond: (d) => d / DURATION_CONVERSION_FACTORS.millisecond,
});

const options = {
  style: "unit",
  unitDisplay: "narrow",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
};
const hourNumberFormatter = new Intl.NumberFormat("en-US", {
  ...options,
  unit: "hour",
}).format;
const minuteNumberFormatter = new Intl.NumberFormat("en-US", {
  ...options,
  unit: "minute",
}).format;
const secondNumberFormatter = new Intl.NumberFormat("en-US", {
  ...options,
  unit: "second",
}).format;
const millisecondNumberFormatter = new Intl.NumberFormat("en-US", {
  ...options,
  unit: "millisecond",
}).format;

const formatDuration = (duration) => {
  if (duration >= DURATION_CONVERSION_FACTORS.hour) {
    return hourNumberFormatter(DURATION_CONVERSION.hour(duration));
  }

  if (duration >= DURATION_CONVERSION_FACTORS.minute) {
    return minuteNumberFormatter(DURATION_CONVERSION.minute(duration));
  }

  if (duration >= DURATION_CONVERSION_FACTORS.second) {
    return secondNumberFormatter(DURATION_CONVERSION.second(duration));
  }

  return millisecondNumberFormatter(duration);
};

function durationSecondaryAxisFormatter(
  secondaryAxis: Transitional<SecondaryAxisSelection>
) {
  SECONDARY_AXIS_FORMATTER.call(this, secondaryAxis);
  secondaryAxis
    .selectAll<SVGTextElement, number>(".tick text")
    .text((n) => formatDuration(n));
}

// function percentageSecondaryAxisFormatter(secondaryAxis: Transitional<SecondaryAxisSelection>) {
//     SECONDARY_AXIS_FORMATTER.call(this, secondaryAxis);
//     SECONDARY_AXIS_ALT_XPOS_FORMATTER.call(this, secondaryAxis);
//     secondaryAxis.selectAll<SVGTextElement, number>('.tick text').text(percentageFormat);
// }

// function currencySecondaryAxisFormatter(secondaryAxis: Transitional<SecondaryAxisSelection>) {
//     SECONDARY_AXIS_FORMATTER.call(this, secondaryAxis);
//     SECONDARY_AXIS_ALT_XPOS_FORMATTER.call(this, secondaryAxis);
//     secondaryAxis.selectAll<SVGTextElement, number>('.tick text').text(currencyFormat);
// }

function SECONDARY_AXIS_LABEL_FORMATTER(
  secondaryAxisLabel: SecondaryAxisLabelSelection
) {
  const {
    margin: { left, right },
    height,
    secondaryAxis: { position },
  } = this;

  const { rotation, x, y, fontSize, fontColor, textAnchor } =
    secondaryAxisLabelSettings(position, height, right, left);

  // format the label's text
  secondaryAxisLabel
    .select("text")
    .attr("text-anchor", textAnchor)
    .attr("fill", fontColor)
    .attr("font-size", fontSize);

  // position the entire label
  secondaryAxisLabel.attr(
    "transform",
    `rotate(${rotation}) translate(${x},${y})`
  );
}

const secondaryAxisLabelWithDotFormatter = (keyColor: string) => {
  return function addColoredDotToLabel(
    secondaryAxisLabel: SecondaryAxisLabelSelection
  ) {
    SECONDARY_AXIS_LABEL_FORMATTER.call(this, secondaryAxisLabel);

    const textNodeHeight = secondaryAxisLabel
      .select<SVGTextElement>("text")
      .node()
      .getBoundingClientRect().height;

    // add the color coded dot key to the label
    const dotBuffer = 12; // space between label text and dot
    const dotHOffset = -(textNodeHeight / 2 + dotBuffer); // the horizontal offset, which is half the width of the text label, plus the buffer
    const dotVOffset = -4; // the vertical offset of the dot

    //the view renders many times, and we want to work on the existing circle, not make a new one each time
    const updateCircle = secondaryAxisLabel.selectAll("circle").data([1]); //tell d3 to keep circle 1, if it exists yet
    const enterCircle = updateCircle.enter().append("circle").attr("r", 5); //select any non-existent circle and create it
    updateCircle.exit().remove(); //select any existing circles not in the data (rogue circles) and remove to keep the data consistent with browser display
    updateCircle
      .merge(enterCircle)
      .attr("transform", `translate(${dotHOffset}, ${dotVOffset})`)
      .attr("fill", keyColor); //manipulate any update or enter selections
  };
};

export {
  PRIMARY_AXIS_FORMATTER,
  formatMajorTicksByBin,
  formatAxisByBin,
  // numericSecondaryAxisFormatter,
  durationSecondaryAxisFormatter,
  // percentageSecondaryAxisFormatter,
  // currencySecondaryAxisFormatter,
  PRIMARY_AXIS_LABEL_FORMATTER,
  SECONDARY_AXIS_FORMATTER,
  SECONDARY_AXIS_LABEL_FORMATTER,
  secondaryAxisLabelWithDotFormatter,
};
