import { jsx as jsx_1 } from "react/jsx-runtime";
const bool = jsx_1("a", {
    "open": true
});
const str = jsx_1("a", {
    "href": "nyaa"
});
const expr = jsx_1("a", {
    "id": window
});
const spread = jsx_1("a", window);
const all = (jsx_1("nyaa", {
    "closing": true,
    "href": "somewhere",
    "id": window,
    ...window,
    "order": 'should correct',
    ...navigator,
    "data-one-more-attribute": true
}));
