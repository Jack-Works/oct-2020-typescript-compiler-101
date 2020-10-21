import {
    GeneratedIdentifierFlags,
    isSourceFile,
    Node,
    SourceFile,
    Statement,
    TransformerFactory,
    visitEachChild,
    VisitResult,
} from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            const { factory } = context
            let added = false
            function visit<T extends Node>(node: T): VisitResult<Node> {
                // create an identifier that will not collide
                const JSXFactory = factory.createUniqueName(
                    'jsx',
                    GeneratedIdentifierFlags.FileLevel & GeneratedIdentifierFlags.ReservedInNestedScopes
                )
                // When accessing *inside* the SourceFile, the lexical environment is visiting.
                if (node.parent && isSourceFile(node.parent) && !added) {
                    added = true
                    // TODO: add auto import logic
                    // TODO: import { jsx as JSXFactory } from '...'
                }
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
        /** Add a statement at the top of the lexical environment. */
        function addInitializationStatement(statement: Statement) {
            // @ts-ignore This is an internal API, see https://github.com/microsoft/TypeScript/issues/40787
            context.addInitializationStatement(statement)
        }
    }
}
