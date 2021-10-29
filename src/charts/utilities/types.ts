import { RefObject } from "react";
import {
  BaseType,
  Selection,
  ScaleLinear,
  ScalePower,
  ScaleLogarithmic,
  ScaleTime,
  ScaleBand,
  ScalePoint,
  Transition,
  Axis,
  AxisDomain,
  ScaleOrdinal,
} from "d3";

// ----------------
// Chart data types
// ----------------
export type ChartPoint = [number, number];

export type LineData = {
  values: ChartPoint[];
  text: string;
  id: string | number;
};

export type BarData = {
  values: number[];
  text: string;
  id: string | number;
};

export type StackedAreaData = {
  values: Dictionary<number>;
  text: string;
  id: number;
};

export type DonutData = {
  value: number;
  text: string | number;
  id: string | number;
};

export type StackedBarData = {
  values: Dictionary<number>;
  text: string | number;
  id: string | number;
};

export type Dictionary<T = any> = {
  [key: string]: T;
};

export type Stringable = { toString(): string };

// ----------------
// Chart utility types
// ----------------
export type SimpleChartType = "donut";
export type AxisChartType = "bar" | "line" | "area" | "stacked-bar";
export type ChartType = SimpleChartType | AxisChartType;

export type SimpleChartDefinitions = {
  donut: {
    data: DonutData[];
    props: DonutChartProps;
  };
};

export type AxisChartDefinitions = {
  bar: {
    data: BarData[];
    props: BarChartProps;
  };
  line: {
    data: LineData[];
    props: MultiLineChartProps;
  };
  area: {
    data: StackedAreaData[];
    props: StackedAreaChartProps;
  };
  "stacked-bar": {
    data: StackedBarData[];
    props: StackedBarChartProps;
  };
};

export enum Position {
  TOP = "top",
  RIGHT = "right",
  BOTTOM = "bottom",
  LEFT = "left",
  X = "x",
  Y = "y",
}

export type Scale = {
  linear: ScaleLinear<number, number>;
  power: ScalePower<number, number>;
  log: ScaleLogarithmic<number, number>;
  time: ScaleTime<number, number>;
  band: ScaleBand<string | number>;
  point: ScalePoint<string | number>;
};

export type Domain = [number, number];
export type DomainMapper = (domain: Domain) => Domain;

export type Formatter<T extends BaseType, IsTransition extends boolean = true> =
  IsTransition extends true
    ? (axis: Transition<T, null, SVGGElement, null>) => void
    : (axis: Selection<T, null, SVGGElement, null>) => void;

export type TooltipData = {
  primaryDimension: string | number;
  values: Dictionary<number>;
  domRect: DOMRect;
};

export type TooltipDataLineBarChart = {
  primaryDimension: string | number;
  values: { bar: number[]; line: number[] };
  domRect: DOMRect;
};

export type PrimaryAxisPosition =
  | Position.LEFT
  | Position.RIGHT
  | Position.TOP
  | Position.BOTTOM
  | Position.Y;

export type PrimaryAxis = {
  show?: boolean;
  label?: string;
  axisFormatters?: Formatter<SVGGElement>[];
  labelFormatter?: Formatter<SVGTextElement, false>;
  position?: PrimaryAxisPosition;
};

export type SecondaryAxisPosition =
  | Position.LEFT
  | Position.RIGHT
  | Position.TOP
  | Position.BOTTOM
  | Position.X;

export type SecondaryAxis = {
  show?: boolean;
  label?: string;
  axisFormatter?: Formatter<SVGGElement>;
  labelFormatter?: Formatter<SVGGElement, false>;
  scale?: "linear";
  position?: SecondaryAxisPosition;
  ticks?: number;
  mapDomain?: DomainMapper;
};

export type DimBox = {
  width: number;
  height: number;
};

export type MarginBox = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type Curve = "linear" | "monotone" | "natural" | "step" | "basis";

export type Interpolator<D> = (d: D) => (t: number) => string;

// ----------------
// Chart plugin types
// ----------------
export type VerticalMarkerConfiguration = {
  markerPoints: number[];
};

export type TooltipConfiguration = {
  onTooltip: (dataset?: TooltipData) => void;
};

export type PluginData = {
  VerticalMarkers?: VerticalMarkerConfiguration;
  Tooltip?: TooltipConfiguration;
};

export interface PluginActions<T extends ChartType> {
  mount(chart: Chart<T>): void;
  unmount(): void;
  render(): void;
  update(): void;
}

export interface ChartPlugin<T extends ChartType> extends PluginActions<T> {
  name: string;
  type: T;
}

// ----------------
// Chart prop types
// ----------------
export type MultiLineChartProps = {
  rect?: DimBox;
  margin?: MarginBox;
  data?: LineData[];
  colors?: readonly string[];
  secondaryAxis?: SecondaryAxis;
  primaryAxis?: PrimaryAxis;
  duration?: number;
  curve?: Curve;
  onRender?: () => void;
  showDots?: boolean;
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
  staticVerticalMarkers?: number[];
  withArea?: boolean;
  plugins?: ChartPlugin<"line">[];
  additional?: PluginData;
};

export type BarChartProps = {
  rect?: DimBox;
  margin?: MarginBox;
  data?: BarData[];
  colors?: readonly string[];
  secondaryAxis?: SecondaryAxis;
  primaryAxis?: PrimaryAxis & {
    barSpacing?: number;
  };
  duration?: number;
  isHorizontal?: boolean;
  onRender?: () => void;
  colorByGroup?: boolean;
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
  plugins?: ChartPlugin<"bar">[];
  additional?: PluginData;
};

export type LineBarChartProps = {
  rect?: DimBox;
  margin?: MarginBox;
  line: Pick<
    MultiLineChartProps,
    "data" | "secondaryAxis" | "primaryAxis" | "curve" | "showDots" | "colors"
  > & { primaryAxis: { scale?: "linear" | "point" } };
  bar: Pick<
    BarChartProps,
    "data" | "secondaryAxis" | "primaryAxis" | "colorByGroup" | "colors"
  >;
  duration?: number;
  onRender?: () => void;
  onTooltip?: (tooltipData?: TooltipDataLineBarChart) => void;
  onClick?: (id: string | number, text: string, values: number[]) => void;
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
};

export type StackedAreaChartProps = {
  rect?: DimBox;
  margin?: MarginBox;
  data?: StackedAreaData[];
  colors?: readonly string[];
  secondaryAxis?: SecondaryAxis;
  primaryAxis?: PrimaryAxis;
  duration?: number;
  onRender?: () => void;
  keys?: string[];
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
  plugins?: ChartPlugin<"area">[];
  additional?: PluginData;
};

export type DonutChartProps = {
  data?: DonutData[];
  colors?: readonly string[];
  innerRadius?: number;
  outerRadius?: number;
  expandedRadius?: number;
  duration?: number;
  onRender?: () => void;
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
  enableMouseOver?: boolean;
  plugins?: ChartPlugin<"donut">[];
  additional?: PluginData;
};

export type StackedBarChartProps = {
  rect?: DimBox;
  margin?: MarginBox;
  data?: StackedBarData[];
  colors?: readonly string[];
  secondaryAxis?: SecondaryAxis;
  primaryAxis?: PrimaryAxis;
  duration?: number;
  onRender?: () => void;
  keys?: string[];
  classes?: string[];
  emphasis?: string | number;
  onMount?: () => void;
  plugins?: ChartPlugin<"stacked-bar">[];
  additional?: PluginData;
};

// ----------------
// Chart Elements
// ----------------
export type Transitional<T> = T extends Selection<
  infer GElement,
  infer Datum,
  infer PElement,
  infer PDatum
>
  ? Transition<GElement, Datum, PElement, PDatum>
  : T;

export type ChartSegment = Selection<
  SVGGElement,
  unknown,
  SVGGElement,
  undefined
>;

export type SVGSelection = Selection<SVGSVGElement, unknown, null, undefined>;
export type GraphSelection = ChartSegment;
export type PrimaryAxisSelection = ChartSegment;
export type PrimaryAxisLabelSelection = Selection<
  SVGTextElement,
  unknown,
  SVGGElement,
  undefined
>;
export type SecondaryAxisSelection = ChartSegment;
export type SecondaryAxisLabelSelection = ChartSegment;

// ----------------
// Chart Interfaces
// ----------------
export interface Chart<T extends ChartType> {
  chartRef: RefObject<HTMLDivElement>;
  svg: Selection<SVGGElement, unknown, SVGGElement, undefined>;
  graph: GraphSelection;
  rendering: boolean;
  renderQueue: number;
  firstPaintHasHappened: boolean;
  onRenderTimeout: number;
  data: T extends SimpleChartType
    ? SimpleChartDefinitions[T]["data"]
    : T extends AxisChartType
    ? AxisChartDefinitions[T]["data"]
    : never;
  colorScale: ScaleOrdinal<Stringable, string>;
  props: T extends SimpleChartType
    ? SimpleChartDefinitions[T]["props"]
    : T extends AxisChartType
    ? AxisChartDefinitions[T]["props"]
    : never;
  emphasize(key: string | number): void;
  deEmphasize(): void;
}

export interface AxisChart<T extends AxisChartType> extends Chart<T> {
  x: Scale[keyof Scale];
  y: Scale[keyof Scale];
  xAxis: Axis<AxisDomain>;
  yAxis: Axis<AxisDomain>;
  xAxisGroup: PrimaryAxisSelection;
  yAxisGroup: SecondaryAxisSelection;
  margin: MarginBox;
  primaryAxis: T extends "bar"
    ? Required<Omit<BarChartProps["primaryAxis"], "position">> & {
        position: Position;
      }
    : Required<AxisChartDefinitions[T]["props"]["primaryAxis"]>;
  secondaryAxis: T extends "bar"
    ? Required<Omit<BarChartProps["secondaryAxis"], "position">> & {
        position: Position;
      }
    : Required<AxisChartDefinitions[T]["props"]["secondaryAxis"]>;
  height: number;
  width: number;
}

export type YDomain = {
  line: "yDomain_line";
  bar: "yDomain_bar";
};

export type X = {
  line: "x_line";
  bar: "x_bar";
};
export type XAxisGroup = {
  line: "xAxisGroup_line";
  bar: "xAxisGroup_bar";
};

export type XAxis = {
  line: "xAxis_line";
  bar: "xAxis_bar";
};

export type Y = {
  line: "y_line";
  bar: "y_bar";
};

export type YAxisGroup = {
  line: "yAxisGroup_line";
  bar: "yAxisGroup_bar";
};

export type YAxis = {
  line: "yAxis_line";
  bar: "yAxis_bar";
};

export type QueryResult = {
  dimensions: number[];
  measures: number[];
};

// export {
//     Dictionary,
//     Stringable,
//     ChartPoint,
//     LineData,
//     Scale,
//     SecondaryAxis,
//     Domain,
//     MultiLineChartProps,
//     BarChartProps,
//     BarData,
//     LineBarChartProps,
//     YDomain,
//     X,
//     XAxisGroup,
//     XAxis,
//     Y,
//     YAxisGroup,
//     YAxis,
//     StackedAreaChartProps,
//     StackedAreaData,
//     DonutChartProps,
//     DonutData,
//     StackedBarChartProps,
//     StackedBarData,
//     PrimaryAxisSelection,
//     PrimaryAxisLabelSelection,
//     SecondaryAxisSelection,
//     ChartSegment,
//     SecondaryAxisLabelSelection,
//     Transitional,
//     PrimaryAxisPosition,
//     SecondaryAxisPosition,
//     Curve,
//     DomainMapper,
//     Position,
//     Interpolator,
//     SVGSelection,
//     GraphSelection,
//     Chart,
//     AxisChart,
//     PrimaryAxis,
//     AxisChartType,
//     ChartType,
//     VerticalMarkerConfiguration,
//     PluginActions,
//     ChartPlugin,
// };
