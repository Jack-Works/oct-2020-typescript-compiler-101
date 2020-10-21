import { jsx as jsx_1 } from "react/jsx-runtime";
const text = jsx_1("text", {
    children: "Some text."
});
const otherJSX = (jsx_1("text", {
    children: jsx_1("image", {})
}));
const expr = jsx_1("div", {
    children: text ? jsx_1("a", {}) : null
});
const all = (jsx_1("div", {
    children: ["Some text.", jsx_1("image", {
            children: "text."
        }), window]
}));
