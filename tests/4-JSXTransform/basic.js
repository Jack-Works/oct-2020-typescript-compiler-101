const a = jsx("my-something", {
    bool: true,
    attr: window,
    ...navigator
}, "234");
const b = (jsx("test", {
    children: [jsx("a", {
            children: "2345"
        }), "Text", jsx(MyComp, {})]
}));
function MyComp() { }
export {};
