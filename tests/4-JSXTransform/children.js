const text = jsx("text", {
    children: "Some text."
});
const otherJSX = (jsx("text", {
    children: jsx("image", {})
}));
const expr = jsx("div", {
    children: text ? jsx("a", {}) : null
});
const all = (jsx("div", {
    children: ["Some text.", jsx("image", {
            children: "text."
        }), window]
}));
export {};
