import { interpolate, Area, Series, SeriesPoint, Arc, PieArcDatum, Line } from 'd3';
import { StackedAreaData, DonutData, ChartPoint, LineData, Interpolator } from './types';

type InterpolatorFactory<T, D> = (shape_er: T) => Interpolator<D>;

const INTERPOLATE_AREA: InterpolatorFactory<
    Area<SeriesPoint<StackedAreaData>>,
    Series<StackedAreaData, string>
> = (area_er) => {
    return function areaInterpolation() {
        const { _prior, _next } = this;

        const interpolator = (t: number) => {
            const interpolatedSet = interpolate(_prior, _next)(t);
            interpolatedSet.forEach((dataSet, idx) => {
                dataSet.data = _prior[idx].data;
            });
            return interpolatedSet;
        };

        this._prior = [...this._next];

        return (t) => area_er(interpolator(t));
    };
};

const INTERPOLATE_ARC: InterpolatorFactory<
    Arc<any, PieArcDatum<DonutData>>,
    PieArcDatum<DonutData>
> = (arc) => {
    return function arcInterpolation(this: SVGPathElement, datum) {
        const fromAngles = this['_prior'] ? (this['_prior'] as typeof datum) : datum;
        const toAngles = datum;

        const interpolator = interpolate(fromAngles, toAngles);
        this['_prior'] = datum;

        return (t) => arc(interpolator(t));
    };
};

const INTERPOLATE_LINE: InterpolatorFactory<Line<ChartPoint>, LineData> = (line_er) => {
    return function lineInterpolation(this: SVGPathElement, d) {
        const interpolator = interpolate(this['_prior'].values, this['_next'].values);
        this['_prior'] = { ...this['_next'] };

        return (t) => line_er(interpolator(t));
    };
};

const INTERPOLATE_POINT: InterpolatorFactory<(point: ChartPoint) => number, ChartPoint> = (
    y_er
) => {
    return function pointInterpolation(datum) {
        const interpolator = interpolate(this._prior, datum);
        this._prior = datum;

        return (t) => y_er(interpolator(t)).toString();
    };
};

export { INTERPOLATE_AREA, INTERPOLATE_ARC, INTERPOLATE_LINE, INTERPOLATE_POINT };
