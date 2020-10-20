function a(x, b) { if (x != null)
    throw new TypeError("x is not type null"); if (!(b instanceof Window))
    throw new TypeError("b is not type Window"); }
export {};
