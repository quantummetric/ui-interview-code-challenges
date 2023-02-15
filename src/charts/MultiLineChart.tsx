import React from "react";
import PropTypes from "prop-types";
import {
  extent,
  max,
  min,
  sum,
  select,
  scaleOrdinal,
  line,
  Selection,
  ScaleOrdinal,
  ScaleLinear,
  Line,
  Axis,
  AxisDomain,
} from "d3";
import { isEqualWith } from "lodash";
import {
  MultiLineChartProps,
  ChartPoint,
  SecondaryAxis,
  Domain,
  LineData,
  PrimaryAxisSelection,
  SecondaryAxisSelection,
  Position,
  Scale,
  AxisChart,
  PrimaryAxis,
  Stringable,
  Formatter,
} from "./utilities/types";
import {
  d3Axis,
  d3Curve,
  d3Scale,
  getPositionalTranslation,
  isEqualFunctionCompareCustomizer,
} from "./utilities/helpers";
import {
  MARGINS,
  NOOP,
  ID_ER,
  IDENTITY,
  DE_EMPHASIS_OPACITY,
  AXIS_DOMAIN_HEIGHT,
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
  COLORS,
} from "./utilities/defaultConfig";
import { INTERPOLATE_POINT, INTERPOLATE_LINE } from "./utilities/interpolators";
import {
  formatAxisByBin,
  formatMajorTicksByBin,
  durationSecondaryAxisFormatter,
  SECONDARY_AXIS_LABEL_FORMATTER,
} from "./utilities/axisFormatters";

const RADIUS = 4.5;
const yAccessor = (d: ChartPoint) => d[1];

const MultilineDataPropType = PropTypes.arrayOf(
  PropTypes.shape({
    values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    text: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired
);

const yValueIsDefined = (v: ChartPoint) => yAccessor(v) !== undefined;

/**
 * Multi line chart
 *
 * This component displays a series of lines, with dots at the actual points given in the dataset.
 * If the underlying dataset changes, D3 transitions effects for removing lines, changing the path
 * of the lines, and adding in new ones
 *
 * @property props                              Component properties.
 * @property props.rect                         Available dimensions of graph to fill into
 * @property props.rect.width                   Width of graph
 * @property props.rect.height                  Height of graph
 * @property props.margin                       Paddings dimensions between full container and visible graph
 * @property props.margin.top                   Padding between top of container and top of graph
 * @property props.margin.right                 Padding between left side of container and left side of graph
 * @property props.margin.bottom                Padding between bottom of container and bottom of graph
 * @property props.margin.left                  Padding between right side of container and right side of graph
 * @property props.data                         Array of data to transform into lines
 * @property props.data[].values                Array of points of the line
 * @property props.data[].text                  Text to present for that value
 * @property props.data[].id                    Id for the data point to give D3 object constancy
 * @property props.colors                       Colors for the lines to use
 * @property props.secondaryAxis                Config for creating and displaying the secondary axis
 * @property props.secondaryAxis.show           Flag to indicate whether the secondary axis should be displayed or not
 * @property props.secondaryAxis.label          Label for the secondary axis
 * @property props.secondaryAxis.axisFormatter  Function to custom format the secondary axis
 * @property props.secondaryAxis.labelFormatter Function to custom format the secondary axis' label
 * @property props.secondaryAxis.scale          The mathematical scale to use when mapping the domain to the range
 * @property props.secondaryAxis.position       The physical placement of the secondary axis
 * @property props.secondaryAxis.ticks          The number of tick lines to use for the secondary axis
 * @property props.secondaryAxis.mapDomain      Function to customize the domain of the secondary axis (for presentational purposes)
 * @property props.primaryAxis                  Config for creating and displaying the primary axis
 * @property props.primaryAxis.show             Flag to indicate whether the primary axis should be displayed or not
 * @property props.primaryAxis.label            Label for the primary axis
 * @property props.primaryAxis.axisFormatters[] Array of functions to custom format the primary axis
 * @property props.primaryAxis.labelFormatter   Function to custom format the primary axis' label
 * @property props.primaryAxis.position         The physical placement of the primary axis
 * @property props.duration                     The speed (in ms) at which all transitions happen
 * @property props.curve                        The kind of curve to use for the line path
 * @property props.onRender                     Callback function that runs after a successful chart render
 * @property props.showDots                     Flag to show or hide the circles which indicate a real data point
 * @property props.Arrayclasses                 Array of additional class names to add to the chart's containing `<div>`
 * @property props.emphasis                     A string representing the `data[].id` field of an arc to force the `:hover` effect; corresponds to `[data-key]`
 * @property props.onMount                      Callback function that runs after the component has mounted
 * @property props.withArea                     Specify if the area under the curve should be colored in
 */

class MultiLineChart
  extends React.Component<MultiLineChartProps>
  implements AxisChart<"line">
{
  static displayName = "MultiLineChart";

  static defaultProps: Partial<MultiLineChartProps> = {
    rect: {
      width: VIEWBOX_WIDTH,
      height: VIEWBOX_HEIGHT,
    },
    margin: MARGINS,
    data: [],
    colors: COLORS,
    secondaryAxis: {
      show: true,
      label: "Time",
      axisFormatter: durationSecondaryAxisFormatter,
      labelFormatter: SECONDARY_AXIS_LABEL_FORMATTER,
      scale: "linear",
      position: Position.LEFT,
      ticks: 5,
      mapDomain: IDENTITY,
    },
    primaryAxis: {
      show: true,
      label: "",
      axisFormatters: [
        formatAxisByBin(),
        formatMajorTicksByBin(),
      ] as Formatter<SVGGElement>[],
      labelFormatter: NOOP,
      position: Position.BOTTOM,
    },
    duration: 0,
    curve: "monotone",
    onRender: NOOP,
    showDots: false,
    classes: [],
    emphasis: "",
    onMount: NOOP,
    staticVerticalMarkers: [],
    withArea: false,
    plugins: [],
    additional: {},
  };

  chartRef = React.createRef<HTMLDivElement>();
  svg: Selection<SVGSVGElement, unknown, null, undefined> = null;
  graph: Selection<SVGGElement, unknown, SVGSVGElement, undefined> = null;
  x: ScaleLinear<number, number> = null;
  y: Scale[keyof Scale] = null;
  exit_y: Scale[keyof Scale] = null;
  xAxis: Axis<AxisDomain> = null;
  yAxis: Axis<AxisDomain> = null;
  xAxisGroup: PrimaryAxisSelection = null;
  yAxisGroup: SecondaryAxisSelection = null;
  markers: Selection<SVGGElement, unknown, SVGGElement, undefined> = null;
  colorScale: ScaleOrdinal<Stringable, string> = null;
  line_er: Line<ChartPoint> = null;
  exitLine_er: Line<ChartPoint> = null;
  rendering: boolean = false;
  renderQueue: number = null;
  firstPaintHasHappened: boolean = false;
  onRenderTimeout: number = null;

  get margin() {
    const { margin } = this.props;
    return {
      ...MultiLineChart.defaultProps.margin,
      ...margin,
    };
  }

  get primaryAxis() {
    const { primaryAxis: _primaryAxis } = this.props;
    const { largestDataSubset } = this;
    return {
      ...(MultiLineChart.defaultProps.primaryAxis as Required<PrimaryAxis>),
      ticks: largestDataSubset,
      ..._primaryAxis,
    };
  }

  get secondaryAxis() {
    const { secondaryAxis: _secondaryAxis } = this.props;
    return {
      ...(MultiLineChart.defaultProps.secondaryAxis as Required<SecondaryAxis>),
      ..._secondaryAxis,
    };
  }

  get data() {
    const { data } = this.props;
    return data || [];
  }

  get height() {
    const {
      margin: { top, bottom },
    } = this;
    const {
      rect: { height: fullHeight },
    } = this.props;
    return fullHeight - top - bottom;
  }

  get width() {
    const {
      margin: { left, right },
    } = this;
    const {
      rect: { width: fullWidth },
    } = this.props;
    return fullWidth - left - right;
  }

  get largestDataSubset() {
    const { data } = this;
    return data.reduce((acc, datum) => Math.max(acc, datum.values.length), 0);
  }

  get combinedData() {
    const { data } = this;
    return data.flatMap((d) => d.values);
  }

  /**
   * Multiple data sets create multiple sets of tick text when we pass the combined x-values
   * into `.tickValues()` on the xAxis. Use a set for uniqueness.
   */
  get xTicks() {
    const { combinedData } = this;
    const uniqueTicks = new Set(combinedData.map((d) => d[0]));
    return [...uniqueTicks];
  }

  get classList() {
    const { classes } = this.props;
    return ["chart", "multi-line-chart"].concat(classes).join(" ");
  }

  axisTranslator(axisType: "primaryAxis" | "secondaryAxis") {
    const {
      [axisType]: { position },
      x,
      y,
      width,
      height,
    } = this;
    let dim = 0;

    if (position === "y") {
      dim = y(0);
    } else if (position === "x") {
      dim = x(0);
    } else if (position === "bottom") {
      dim = height;
    } else if (position === "right") {
      dim = width;
    }

    const axisTranslation = getPositionalTranslation(position);
    return axisTranslation(dim);
  }

  xDomain(combinedDataSet: ChartPoint[]) {
    return extent(combinedDataSet, (d) => d[0]);
  }

  yDomain = (combinedDataSet: ChartPoint[]) => {
    const {
      secondaryAxis: { mapDomain },
    } = this;

    // If the highest value is 0, want to preserve that value and not fallback to the value 10;
    // 10 should only be used if the `combinedDataSet` is an empty array
    let highestValue = max(combinedDataSet, yAccessor);
    highestValue = highestValue === undefined ? 10 : highestValue;

    const lowestValue = min(combinedDataSet, yAccessor) || 0;
    const domain: Domain = [lowestValue, highestValue];

    return mapDomain(domain);
  };

  initializePrimaryAxis() {
    const {
      graph,
      combinedData,
      xDomain,
      xTicks,
      primaryAxis: { position, axisFormatters },
    } = this;

    this.x = d3Scale("linear").domain(xDomain(combinedData));
    this.xAxis = d3Axis(position).scale(this.x).tickValues(xTicks);
    this.xAxisGroup = graph.append("g").attr("class", "x axis");
    this.xAxisGroup.append("text").classed("label", true);
    axisFormatters.forEach((_, idx) => {
      this.xAxisGroup
        .append("g")
        .classed(`axis-${idx + 1}`, true)
        .classed("no-domain", idx > 0);
    });
  }

  /**
   * Axis rendering goes through a series of steps.
   *
   * 1. Each axis is reconstructed with its scale and its respective formatter is applied to it.
   * 2. A promise is added to an array which will resolve on completion of all axis reconstruction.
   * 3. After all promises have resolved, the axes will be realigned vertically so that each will
   * be stacked one below the other.
   */
  renderPrimaryAxis() {
    const {
      xAxisGroup,
      xAxis,
      primaryAxis: { show, axisFormatters, labelFormatter, label },
    } = this;
    const { duration } = this.props;

    // Add axes
    xAxisGroup.classed("hide", !show);

    const axisFormatPromises = [];

    axisFormatters.forEach((fn, idx) => {
      const _xAxis = this.xAxisGroup
        .select<SVGGElement>(`.axis-${idx + 1}`)
        .transition()
        .duration(duration)
        .call(xAxis);

      axisFormatPromises.push(_xAxis.end());

      fn.call(this, _xAxis);
    });

    // Align non-primary axes
    const axisTextHeights = [];

    Promise.all(axisFormatPromises).finally(() => {
      axisFormatPromises.forEach((_, idx) => {
        const _xAxis = xAxisGroup.select<SVGGElement>(`.axis-${idx + 1}`);
        const height = _xAxis.node().getBBox().height;
        axisTextHeights.push(height);
        const offsetHeight =
          sum(axisTextHeights) - height - (idx > 0 ? AXIS_DOMAIN_HEIGHT : 0);

        _xAxis.attr("transform", `translate(0, ${offsetHeight})`);
      });
    });

    // Add label
    const primaryAxisLabel = xAxisGroup
      .select<SVGTextElement>(".label")
      .classed("hide", !label)
      .text(label);
    label && labelFormatter.call(this, primaryAxisLabel);
  }

  initializeSecondaryAxis() {
    const {
      graph,
      secondaryAxis: { position, scale, ticks },
      combinedData,
      yDomain,
    } = this;

    this.y = d3Scale(scale).domain(yDomain(combinedData));
    this.yAxis = d3Axis(position)
      .scale(this.y)
      .ticks(ticks)
      .tickSizeOuter(0)
      .tickPadding(10);
    this.yAxisGroup = graph.append("g").attr("class", "y axis");
    this.yAxisGroup.append("g").classed("label", true).append("text");
  }

  renderSecondaryAxis() {
    const {
      yAxisGroup,
      yAxis,
      secondaryAxis: { show, axisFormatter, label, labelFormatter },
    } = this;
    const { duration } = this.props;

    // Add axis
    yAxisGroup.classed("hide", !show);

    const _yAxis = yAxisGroup.transition().duration(duration).call(yAxis);

    axisFormatter.call(this, _yAxis);

    // Add axis label
    const secondaryAxisLabel = yAxisGroup
      .select<SVGGElement>(".label")
      .classed("hide", !label);
    secondaryAxisLabel.select("text").text(label);
    label && labelFormatter.call(this, secondaryAxisLabel);
  }

  renderVerticalMarkers() {
    const { staticVerticalMarkers } = this.props;
    const { height, x } = this;

    const markers = this.markers
      .selectAll("g.vertical-marker")
      .data(staticVerticalMarkers);

    const markerGroup = markers
      .enter()
      .append("g")
      .classed("vertical-marker", true)
      .attr("data-vertical-marker", (d) => d)
      .attr("transform", "translate(0.5 0)");

    markerGroup
      .append("line")
      .attr("x1", x)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", height);

    markerGroup
      .append("circle")
      .attr("cx", x)
      .attr("cy", height)
      .attr("r", 2.5);
  }

  renderChart() {
    this.rendering = true;

    const { graph, x, y, exit_y, colorScale, line_er, exitLine_er } = this;

    let { data } = this;

    const {
      rect: { width: fullWidth, height: fullHeight },
      duration,
      withArea,
    } = this.props;

    if (!fullHeight || !fullWidth) {
      return;
    }

    // Establish helper functions
    const colorById = (d: LineData) => colorScale(d.id);
    const x_er = (d: ChartPoint) => x(d[0]);
    const y_er = (d: ChartPoint) => y(d[1]);

    // Refresh axes
    this.renderPrimaryAxis();
    this.renderSecondaryAxis();

    // Create update selection
    const dataSelectionLines = graph
      .select<SVGGElement>("g.paths")
      .selectAll<SVGPathElement, LineData>("path")
      .data<LineData>(data, ID_ER);

    const dataSelectionPoints = graph
      .select<SVGGElement>("g.points-container")
      .selectAll<SVGGElement, LineData>("g.points")
      .data<LineData>(data, ID_ER);

    // Remove missing elements
    dataSelectionLines
      .exit<LineData>()
      .transition()
      .duration(duration)
      .attr("d", (d) => exitLine_er(d.values.map(([x]) => [x, 0])))
      .remove();

    const dataSelectionPointsExit = dataSelectionPoints.exit();
    dataSelectionPointsExit
      .selectAll("circle")
      .transition()
      .duration(duration)
      .attr("cy", exit_y(0));

    // Delay is necessary in order to make circles animate downward before removal
    dataSelectionPointsExit.transition().delay(duration).remove();

    // Re-translate changed elements
    dataSelectionLines
      .transition()
      .duration(duration)
      .attr("d", (d) => line_er(d.values));

    // Add new elements
    dataSelectionLines
      .enter()
      .append("path")
      .attr("fill", (d) => (withArea ? colorById(d) : "none"))
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .each(function (d) {
        this["_prior"] = {
          ...d,
          values: Array(d.values.length)
            .fill(0)
            .map((n, idx) => [d.values[idx][0], n]),
        };

        this["_next"] = { ...d };
      })
      .transition()
      .duration(duration)
      .attrTween("d", INTERPOLATE_LINE(line_er))
      // Exit transition and go back to `enter` selection
      .selection()
      .merge(dataSelectionLines)
      .attr("stroke", colorById);

    const dataSelectionPointsEnter = dataSelectionPoints
      .enter()
      .append("g")
      .classed("points", true)
      .attr("fill", colorById);

    // Merge new and changed elements to combine logic
    const dataSelectionPointsFull =
      dataSelectionPointsEnter.merge(dataSelectionPoints);

    const circleGroupSelection = dataSelectionPointsFull
      .selectAll("circle")
      .data((d: LineData) => d.values);

    circleGroupSelection
      .filter(yValueIsDefined)
      .transition()
      .duration(duration)
      .attr("cx", x_er)
      .attr("cy", y_er)
      .attr("r", RADIUS);

    circleGroupSelection
      .enter()
      .append("circle")
      .filter(yValueIsDefined)
      .each(function () {
        this["_prior"] = [0, 0];
      })
      .attr("cx", x_er)
      .attr("r", RADIUS)
      .transition()
      .duration(duration)
      .attrTween("cy", INTERPOLATE_POINT(y_er));

    this.firstPaintHasHappened = true;
    this.rendering = false;
    this.onRender();
  }

  emphasize(key: string | number) {
    const { svg } = this;

    this.deEmphasize();
    svg
      .selectAll(`[data-key]:not([data-key="${key}"])`)
      .attr("opacity", DE_EMPHASIS_OPACITY);
  }

  deEmphasize() {
    const { svg } = this;
    svg.selectAll("[data-key]").attr("opacity", null);
  }

  onRender() {
    const { duration } = this.props;

    if (this.onRenderTimeout) {
      clearTimeout(this.onRenderTimeout);
    }

    this.onRenderTimeout = window.setTimeout(() => {
      this.onRenderTimeout = null;
      this.props.onRender();
    }, duration);
  }

  enqueueRender() {
    if (this.renderQueue) {
      clearTimeout(this.renderQueue);
    }

    this.renderQueue = window.setTimeout(() => {
      this.renderQueue = null;
      this.renderChart();
    });
  }

  shouldRenderChart(prevProps: MultiLineChartProps) {
    const { data, width, height, firstPaintHasHappened } = this;
    const {
      rect: { width: rectWidth, height: rectHeight },
      secondaryAxis,
      primaryAxis,
    } = this.props;
    const {
      data: prevData,
      rect: { width: prevRectWidth, height: prevRectHeight },
      secondaryAxis: prevSecondaryAxis,
      primaryAxis: prevPrimaryAxis,
    } = prevProps;

    const dataHasChanged = data !== prevData;
    const isGraphable = width > 0 && height > 0;
    const dimensionsHaveChanged =
      rectWidth !== prevRectWidth || rectHeight !== prevRectHeight;
    const axesHaveChanged = !(
      isEqualWith(
        secondaryAxis,
        prevSecondaryAxis,
        isEqualFunctionCompareCustomizer
      ) &&
      isEqualWith(
        primaryAxis,
        prevPrimaryAxis,
        isEqualFunctionCompareCustomizer
      )
    );

    return (
      isGraphable &&
      (!firstPaintHasHappened ||
        dataHasChanged ||
        dimensionsHaveChanged ||
        axesHaveChanged)
    );
  }

  configureVerticalSettings() {
    const { graph, height } = this;

    this.y.range([height, 0]);
    this.xAxisGroup.attr("transform", this.axisTranslator("primaryAxis"));
  }

  configureHorizontalSettings() {
    const { width } = this;

    this.x.range([0, width]);
    this.yAxis.tickSizeInner(-width);
  }

  configureDimensionalSettings() {
    const {
      rect: { width: rectWidth, height: rectHeight },
    } = this.props;

    if (rectHeight) {
      this.configureVerticalSettings();
    }

    if (rectWidth) {
      this.configureHorizontalSettings();
    }

    if (rectWidth && rectHeight) {
      this.svg.attr("viewBox", `0 0 ${rectWidth} ${rectHeight}`);
    }
  }

  componentDidMount() {
    const { colors, curve, margin, showDots } = this.props;

    this.svg = select(this.chartRef.current).append("svg");
    this.graph = this.svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    this.initializePrimaryAxis();
    this.initializeSecondaryAxis();

    this.graph.append("g").classed("paths", true);
    this.graph
      .append("g")
      .classed("points-container", true)
      .classed("togglable", true)
      .classed("transparent", !showDots);

    this.colorScale = scaleOrdinal<string>().range(colors);
    this.line_er = line()
      .defined(yValueIsDefined)
      .x((d) => this.x(d[0]))
      .y((d) => this.y(d[1]))
      .curve(d3Curve(curve));
    this.exitLine_er = line().curve(d3Curve(curve));
    this.exit_y = this.y;

    this.configureDimensionalSettings();

    this.props.onMount();

    if (this.shouldRenderChart(this.props)) {
      this.renderChart();
    }
  }

  componentDidUpdate(prevProps: MultiLineChartProps) {
    const {
      rect: { height: rectHeight, width: rectWidth },
      data,
      colors,
      showDots,
      emphasis,
    } = this.props;
    const {
      rect: { height: prevRectHeight, width: prevRectWidth },
      data: prevData,
      colors: prevColors,
      showDots: prevShowDots,
      emphasis: prevEmphasis,
    } = prevProps;
    const {
      svg,
      graph,
      x,
      xAxis,
      xAxisGroup,
      y,
      combinedData,
      xDomain,
      yDomain,
    } = this;

    if (rectHeight !== prevRectHeight) {
      this.configureVerticalSettings();
    }

    if (rectWidth !== prevRectWidth) {
      this.configureHorizontalSettings();
    }

    if (rectWidth && rectHeight) {
      svg.attr("viewBox", `0 0 ${rectWidth} ${rectHeight}`);
    }

    if (data !== prevData) {
      // If data changes the domain of our datasets most likely changed as well. In order to correctly animate out
      // a line/dot that should be removed we must use the old data in the `line_er` function to correctly do the exit
      // animation. However, we must use the new domains to properly mutate changed datasets. Hence, the need for
      // two line-ing functions.
      const [oldXDomain, oldYDomain] = [x.domain(), y.domain()];
      const [oldXRange, oldYRange] = [x.range(), y.range()];
      const exit_x = d3Scale("linear").domain(oldXDomain).range(oldXRange);
      this.exit_y = d3Scale("linear")
        .domain(oldYDomain as number[])
        .range(oldYRange);
      this.exitLine_er.x((d) => exit_x(d[0])).y((d) => this.exit_y(d[1]));

      x.domain(xDomain(combinedData));
      y.domain(yDomain(combinedData));
      xAxis.tickValues(this.xTicks);

      xAxisGroup.attr("transform", this.axisTranslator("primaryAxis"));
    }

    if (colors !== prevColors) {
      this.colorScale.range(colors);
      this.colorScale.domain([]);
    }

    if (showDots !== prevShowDots) {
      graph.select("g.points-container").classed("transparent", !showDots);
    }

    if (this.shouldRenderChart(prevProps)) {
      this.rendering && this.enqueueRender();
      !this.rendering && this.renderChart();
    }

    if (emphasis !== prevEmphasis) {
      emphasis && this.emphasize(emphasis);
      !emphasis && this.deEmphasize();
    }
  }

  render() {
    return <div className={this.classList} ref={this.chartRef} />;
  }
}

export { MultiLineChart, MultilineDataPropType };
