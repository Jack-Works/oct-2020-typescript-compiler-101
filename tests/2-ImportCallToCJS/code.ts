import {
    Node,
    SourceFile,
    TransformerFactory,
    visitEachChild,
    VisitResult,
    // @ts-ignore Internal API
    isImportCall,
    CallExpression,
} from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            const { factory } = context
            function visit<T extends Node>(node: T): VisitResult<Node> {
                if (isImportCall(node)) {
                    // ImportCall is a CallExpression that node.expression is SyntaxKind.ImportKeyword
                    const _node = (node as any) as CallExpression
                    const arg = _node.arguments[0]
                    return factory.updateCallExpression(
                        _node,
                        factory.createPropertyAccessExpression(factory.createIdentifier('Promise'), 'resolve'),
                        void 0,
                        [factory.createCallExpression(factory.createIdentifier('require'), void 0, [arg])]
                    )
                }
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }
}
