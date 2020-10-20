function a(x) { if (typeof x != "number")
    throw new TypeError("x is not type number"); }
function a2(x, y) { if (typeof x != "number")
    throw new TypeError("x is not type number"); if (typeof y != "bigint")
    throw new TypeError("y is not type bigint"); }
// runtime error
a('string');
export {};
