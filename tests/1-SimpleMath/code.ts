import { Node, SourceFile, TransformerFactory, visitEachChild, VisitResult } from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            const { factory } = context
            function visit<T extends Node>(node: T): VisitResult<Node> {
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }
}
