function a(x) { if (typeof x != "number")
    throw new TypeError("x is not typeof number"); }
function a2(x, y) { if (typeof x != "number")
    throw new TypeError("x is not typeof number"); if (typeof y != "bigint")
    throw new TypeError("y is not typeof bigint"); }
// runtime error
a('string');
