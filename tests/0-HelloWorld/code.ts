import { isStringLiteral, Node, SourceFile, TransformerFactory, visitEachChild, VisitResult } from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            function visit<T extends Node>(node: T): VisitResult<Node> {
                if (isStringLiteral(node)) return context.factory.createStringLiteral('Hello World!', true)
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }
}
