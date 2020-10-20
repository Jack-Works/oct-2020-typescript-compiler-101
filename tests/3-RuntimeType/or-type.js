function f(a) { if (a != null && typeof a != "number" && !(a instanceof Uint8Array))
    throw new TypeError("a is not type null | number | Uint8Array"); }
export {};
