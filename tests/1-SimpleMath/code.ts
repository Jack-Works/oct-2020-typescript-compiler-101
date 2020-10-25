import {
    BinaryExpression,
    isBinaryExpression,
    isNumericLiteral,
    isParenthesizedExpression,
    Node,
    SourceFile,
    SyntaxKind,
    TransformerFactory,
    visitEachChild,
    VisitResult,
} from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            const { factory } = context
            function visitBinaryExpression(node: BinaryExpression) {
                let { right, left } = node
                if (isParenthesizedExpression(left)) left = left.expression
                if (isParenthesizedExpression(right)) right = right.expression
                // visit the "a op b" recursively
                if (isBinaryExpression(left)) left = visitBinaryExpression(left)
                if (isBinaryExpression(right)) right = visitBinaryExpression(right)
                if (isNumericLiteral(left) && isNumericLiteral(right)) {
                    const [l, r] = [left, right].map((x) => parseFloat(x.text))
                    const f = getMathFunction(node.operatorToken.kind)
                    if (f) return factory.createNumericLiteral(f(l, r))
                }
                return node
            }
            function visit<T extends Node>(node: T): VisitResult<Node> {
                if (isBinaryExpression(node)) return visitBinaryExpression(node)
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }
}

function getMathFunction(op: SyntaxKind): null | ((a: number, b: number) => number) {
    switch (op) {
        case SyntaxKind.PlusToken:
            return (a, b) => a + b
        case SyntaxKind.MinusToken:
            return (a, b) => a - b
        case SyntaxKind.AsteriskToken:
            return (a, b) => a * b
        case SyntaxKind.SlashToken:
            return (a, b) => a / b
    }
    return null
}
