const bool = jsx("a", {
    "open": true
});
const str = jsx("a", {
    "href": "nyaa"
});
const expr = jsx("a", {
    "id": window
});
const spread = jsx("a", window);
const all = (jsx("nyaa", {
    "closing": true,
    "href": "somewhere",
    "id": window,
    ...window,
    "order": 'should correct',
    ...navigator,
    "data-one-more-attribute": true
}));
export {};
