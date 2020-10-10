import { Node, SourceFile, TransformerFactory, visitEachChild, VisitResult } from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        const { factory } = context
        return (sourceFile) => {
            function visit<T extends Node>(node: T): VisitResult<Node> {
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }
}
