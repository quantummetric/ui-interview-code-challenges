import {
  axisLeft,
  axisRight,
  axisTop,
  axisBottom,
  scaleLinear,
  scalePow,
  scaleLog,
  scaleTime,
  scaleBand,
  scalePoint,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  curveBasis,
} from 'd3';
import { isFunction } from 'lodash';
import {
  PrimaryAxisPosition,
  Scale,
  SecondaryAxisPosition,
  Curve,
  DomainMapper,
  Position,
  Domain,
} from './types';

const d3Axis = (dir: Position) => {
  switch (dir) {
    case Position.LEFT:
    case Position.X:
      return axisLeft(undefined);

    case Position.RIGHT:
      return axisRight(undefined);

    case Position.TOP:
      return axisTop(undefined);

    case Position.BOTTOM:
    case Position.Y:
      return axisBottom(undefined);
  }
};

const scales = {
  linear: scaleLinear(),
  power: scalePow(),
  log: scaleLog(),
  time: scaleTime(),
  band: scaleBand(),
  point: scalePoint(),
};

const d3Scale = <T extends keyof Scale>(scaleType: T): Scale[T] => {
  return scales[scaleType].copy() as Scale[T];
};

const d3Curve = (curveType: Curve) => {
  switch (curveType) {
    case 'linear':
      return curveLinear;

    case 'monotone':
      return curveMonotoneX;

    case 'natural':
      return curveNatural;

    case 'step':
      return curveStep;

    case 'basis':
      return curveBasis;
  }
};

const swappedPositions = {
  bottom: Position.LEFT,
  left: Position.BOTTOM,
  top: Position.RIGHT,
  right: Position.TOP,
  y: Position.X,
  x: Position.Y,
};

const positionalTranslations = {
  left: () => 'translate(0, 0)',
  right: (dim: number) => `translate(${dim}, 0)`,
  top: () => 'translate(0, 0)',
  bottom: (dim: number) => `translate(0, ${dim})`,
  y: (dim: number) => `translate(0, ${dim})`,
  x: (dim: number) => `translate(${dim}, 0)`,
};

const maybeSwapPosition = (
  position: Position,
  isHorizontal: boolean
): Position => {
  if (!isHorizontal) {
    return position;
  }

  return swappedPositions[position];
};

const getPositionalTranslation = (
  position: PrimaryAxisPosition | SecondaryAxisPosition
) => positionalTranslations[position];

/**
 * Takes the maximum value of a domain and then makes the minimum the negative version of that value.
 *
 * This function assumes the domain will be in the form `[<NUMBER>, <NUMBER>]` to reflect the "default" form
 * of an axis domain.
 * @param {Array<number>} domain The domain to reshape
 * @returns {Array<number>}
 */
const symmetricalDomain: DomainMapper = (domain) => {
  const max = Math.max(...domain.map((n) => Math.abs(n)));
  return [-max, max];
};

/**
 * Ensures the upper value of a domain will be at least X.
 *
 * This function assumes the domain will be in the form `[<NUMBER>, <NUMBER>]` to reflect the "default" form
 * of an axis domain.
 * @param {Array<number>} domain The domain to reshape
 * @returns {Array<number>}
 */
const atLeastX = (x: number): DomainMapper => (domain) => {
  const [min, max] = domain;
  return [min, Math.max(max, x)];
};

/**
 * Ensures the upper value of a domain will be at least X if the domain is [0, 0].
 *
 * This function assumes the domain will be in the form `[<NUMBER>, <NUMBER>]` to reflect the "default" form
 * of an axis domain.
 * @param {Array<number>} domain The domain to reshape
 * @returns {Array<number>}
 */
const atLeastXWhenNothing = (x: number): DomainMapper => (domain) => {
  const [min, max] = domain;
  const newUpper = min === max && max === 0 ? x : max;
  return [min, newUpper];
};

/**
 * Ensures the lower value of a domain will never be below -100%.
 *
 * This function assumes the domain will be in the form `[<NUMBER>, <NUMBER>]` to reflect the "default" form
 * of an axis domain.
 * @param {Array<number>} domain The domain to reshape
 * @returns {Array<number>}
 */
const clampToMinus100Percent: DomainMapper = (domain) => {
  const max = Math.max(...domain);
  return [-1, max];
};

/**
 * Ensures the lower value of a domain will always cross 0.
 *
 * This is helpful for situations in which a chart's primary axis is anchored to the `y = 0` line. It will ensure that the axis
 * will always appear. This function assumes the domain will be in the form `[<NUMBER>, <NUMBER>]` to reflect the "default" form
 * of an axis domain.
 * @param {Array<number>} domain The domain to reshape
 * @returns {Array<number>}
 */
const ensureDomainCrosses0: DomainMapper = (domain) => {
  const [min, max] = domain;
  return [Math.min(min, 0), Math.max(max, 0)];
};

function tagRectVisibility(
  primaryRect: DOMRect,
  secondaryNode: SVGElement,
  hiddenRectsVector: number[]
) {
  const secondaryRect = secondaryNode.getBoundingClientRect();

  const { x: secondaryX, width: secondaryWidth } = primaryRect;
  const { x: primaryX } = secondaryRect;
  if (secondaryX + secondaryWidth > primaryX) {
    hiddenRectsVector.push(1);
    return primaryRect;
  }
  hiddenRectsVector.push(0);
  return secondaryRect;
}

const getLargestContiguousSum = (hiddenRectsVector: number[]) => {
  const contiguousSums = hiddenRectsVector.reduce(
    (largestSums, n) => {
      if (n === 1) {
        largestSums[0] = largestSums[0] + 1;
      } else if (largestSums[0] !== 0) {
        largestSums.unshift(0);
      }

      return largestSums;
    },
    [0]
  );

  return Math.max(...contiguousSums);
};

const inferDecimalPlaces = (n: number) => {
  // Never show a decimal for 0
  if (n === 0) {
    return 0;
  }

  // For numbers less than 1, we are likely seeing conversion rates, so
  // give 2 decimals for best precision
  if (n < 1 && n > -1) {
    return 2;
  }

  // Anything less than 1,000 means we are doing no abbreviation (e.g., no 1.0k),
  // so don't show any decimals if number is not an integer
  if (n < 1e3 && n > -1e3) {
    if (!Number.isInteger(n)) {
      // Show two decimal places if number is not an integer and is less than 100. Show one
      // if not an integer and greater than or equal to 100
      if (n < 1e2 && n > -1e2) {
        return 2;
      }
      return 1;
    }
    return 0;
  }

  // If we are here, we _are_ doing abbreviations, so give 1 decimal.
  return 1;
};

const inferDecimalPlacesForPercent = (n: number) => {
  // Never show a decimal for 0
  if (n === 0) {
    return 0;
  }

  //very small, needs too decimal places
  if (n > 0 && n < 0.01) {
    return 2;
  }

  // .01 - .10 need a single decimal point otherwise we might show 5, 5, 6, 6
  if (n > 0.01 && n < 0.1) {
    return 1;
  }

  // If we are here, it's 10% or more, so one decimal
  return 1;
};

/**
 * Manually creates the ticks that should be displayed in the y axis for a chart.
 *
 * @param {*} domain
 * @param {*} numTicks
 */
const createTickValues = (domain: Domain, numTicks: number) => {
  if (numTicks < 2) {
    numTicks = 2;
  }

  const [min, max] = domain;
  const interval = (max - min) / (numTicks - 1);
  const innerTicks = Array(numTicks - 2)
    .fill(0)
    .map((_, idx) => min + interval * (idx + 1));

  return [min, ...innerTicks, max];
};

/**
 * "Flattens" a compound chart's context so that the primary-/secondaryAxis properties
 * are top level (as they would be for a single-type chart).
 *
 * @param chartType
 * @returns
 */
const flattenCompoundCharts = (chartType: 'line' | 'bar') => {
  // TODO: improve type definition here after all the chart interfaces are created
  const ctxGetter = (chart) => {
    const {
      margin,
      width,
      height,
      [chartType]: chartDefinition,
      props,
    } = chart;

    return {
      props,
      margin,
      width,
      height,
      ...chartDefinition,
    };
  };

  return ctxGetter;
};

/**
 * Used for comparing axis values to determine if the whole chart should re-render. Lodash isEqual
 * uses strict equality (===) when comparing functions, which means if the functions are different
 * by reference, we will get false. This happens a lot when comparing custom axis formatters. This
 * function allows us to always return true for function comparison if the function signatures are
 * the same.
 * @param val1
 * @param val2
 */
const isEqualFunctionCompareCustomizer = (val1: any, val2: any) => {
  if (isFunction(val1) && isFunction(val2)) {
    return val1.toString() === val2.toString();
  }
};

export {
  d3Axis,
  d3Scale,
  d3Curve,
  maybeSwapPosition,
  getPositionalTranslation,
  symmetricalDomain,
  atLeastX,
  atLeastXWhenNothing,
  clampToMinus100Percent,
  ensureDomainCrosses0,
  tagRectVisibility,
  getLargestContiguousSum,
  inferDecimalPlaces,
  inferDecimalPlacesForPercent,
  createTickValues,
  flattenCompoundCharts,
  isEqualFunctionCompareCustomizer,
};
