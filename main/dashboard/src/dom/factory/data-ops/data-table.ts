import { primitive } from "../core";

const dataTable = primitive("table", "data-table");
const thead = primitive("thead", "data-table__head");
const tbody = primitive("tbody", "data-table__body");
const tr = primitive("tr", "data-table__row");
const th = primitive("th", "data-table__header");
const td = primitive("td", "data-table__cell");

export { dataTable, thead, tbody, tr, th, td };
