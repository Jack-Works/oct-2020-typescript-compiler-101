export {}
const text = <text>Some text.</text>
const otherJSX = (
    <text>
        <image></image>
    </text>
)
const expr = <div>{text ? <a></a> : null}</div>
const all = (
    <div>
        Some text.
        <image>text.</image>
        {window}
    </div>
)
