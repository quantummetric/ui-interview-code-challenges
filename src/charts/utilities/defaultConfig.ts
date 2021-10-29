const MARGINS = {
  top: 5,
  right: 20,
  bottom: 40,
  left: 40,
};

function NOOP() {}

const IDENTITY = (x) => x;
const ID_ER = (datum) => datum.id;

const COLORS = [
  "#0069a2",
  "#59cb90",
  "#2eafff",
  "#ffc82c",
  "#9141b3",
  "#ff8f00",
  "#abb7c7",
  "#4e7ef8",
  "#c2d45b",
  "#2ba3ab",
  "#c33077",
  "#e976e8",
  "#0e7a56",
  "#ffac84",
  "#c16473",
  "#30667a",
  "#705c7e",
];

const HOVER_OPACITY = 0.8;
const DE_EMPHASIS_OPACITY = 0.2;
const AXIS_DOMAIN_HEIGHT = 6;
const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 400;

export {
  MARGINS,
  NOOP,
  IDENTITY,
  ID_ER,
  COLORS,
  HOVER_OPACITY,
  DE_EMPHASIS_OPACITY,
  AXIS_DOMAIN_HEIGHT,
  VIEWBOX_WIDTH,
  VIEWBOX_HEIGHT,
};
