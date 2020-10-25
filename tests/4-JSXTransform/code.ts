import {
    Expression,
    GeneratedIdentifierFlags,
    isIdentifier,
    isJsxAttribute,
    isJsxElement,
    isJsxExpression,
    isJsxFragment,
    isJsxSelfClosingElement,
    isJsxSpreadAttribute,
    isJsxText,
    isSourceFile,
    isSpreadAssignment,
    isStringLiteral,
    JsxAttributes,
    JsxChild,
    JsxTagNameExpression,
    Node,
    ObjectLiteralElementLike,
    SourceFile,
    SpreadAssignment,
    Statement,
    TransformerFactory,
    visitEachChild,
} from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        const { factory } = context
        let added = false
        return (sourceFile) => {
            // First of all, we create a unique name to refer to the jsx method.
            const jsxFactory = factory.createUniqueName(
                'jsx',
                GeneratedIdentifierFlags.FileLevel & GeneratedIdentifierFlags.ReservedInNestedScopes
            )
            return visitEachChild(sourceFile, visit, context)

            function visitJSX(node: JsxChild): Expression {
                // JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment
                if (isJsxSelfClosingElement(node)) {
                    return factory.createCallExpression(jsxFactory, void 0, [
                        JSXTagToExpression(node.tagName),
                        ...JSXAttributeToExpression(node.attributes.properties, []),
                    ])
                } else if (isJsxElement(node)) {
                    return factory.createCallExpression(jsxFactory, void 0, [
                        JSXTagToExpression(node.openingElement.tagName),
                        ...JSXAttributeToExpression(
                            node.openingElement.attributes.properties,
                            node.children.map(visitJSX)
                        ),
                    ])
                } else if (isJsxText(node)) return factory.createStringLiteral(node.text.trimLeft().trimRight())
                else if (isJsxExpression(node)) return visit(node.expression ?? factory.createNull()) as Expression
                else if (isJsxFragment(node)) {
                    return factory.createCallExpression(jsxFactory, void 0, [
                        factory.createStringLiteral('fragment'),
                        ...JSXAttributeToExpression(factory.createNodeArray([]), node.children.map(visitJSX)),
                    ])
                }
                return node
            }
            function visit<T extends Node>(node: T): Node {
                // If the current node is SourceFile, there is no effect to call addInitializationStatement
                // because the "visitLexicalEnvironment" has not started.
                // But this node is the direct children of the SourceFile, we can add the auto-import
                // because now it is visiting the lexical environment of SourceFile.statements
                // And all calls to addInitializationStatement will be added to the SourceFile itself.
                if (node.parent && isSourceFile(node.parent) && !added) {
                    added = true
                    addInitializationStatement(
                        // import { jsx as _unique_jsx_identifier } from "react/jsx-runtime"
                        // here we use the "jsxFactory" so it won't collide with any name in the current file.
                        factory.createImportDeclaration(
                            undefined,
                            undefined,
                            factory.createImportClause(
                                false,
                                undefined,
                                factory.createNamedImports([
                                    factory.createImportSpecifier(factory.createIdentifier('jsx'), jsxFactory),
                                ])
                            ),
                            factory.createStringLiteral('react/jsx-runtime')
                        )
                    )
                }
                if (isJsxSelfClosingElement(node)) return visitJSX(node)
                else if (isJsxElement(node)) return visitJSX(node)
                else if (isJsxFragment(node)) return visitJSX(node)
                return visitEachChild(node, visit, context)
            }
            function JSXTagToExpression(tag: JsxTagNameExpression) {
                // JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess
                if (isIdentifier(tag)) {
                    // lowercase element = "host" element
                    if (tag.text[0].toLowerCase() === tag.text[0]) return factory.createStringLiteral(tag.text)
                    // element with "-" is a custom element
                    if (tag.text.includes('-')) return factory.createStringLiteral(tag.text)
                    // Otherwise we return the identifier directly
                    return tag
                }
                // ThisExpression is an Expression, JsxTagNamePropertyAccess is an Expression too
                // so it is safe to return it directly
                // TODO: but what about JSX namespace? <ns:tag />
                return tag
            }
            function JSXAttributeToExpression(
                // <a some-thing-here />
                attributes: JsxAttributes['properties'],
                // <a>{children}{here}</>
                children: Expression[]
            ): Expression[] {
                // <a key={xyz} /> in new JSX transformer, key need to be handled specially
                let key: Expression = undefined!
                // here we map JsxAttributeLike `a="b" c={d} e {...f}` into {a: "b", c: d, e: true, ...f}
                let props = attributes
                    // ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
                    .map<ObjectLiteralElementLike>((prop) => {
                        // prop = JsxAttribute | JsxSpreadAttribute
                        if (isJsxAttribute(prop)) {
                            if (prop.name.text === 'key') {
                                if (prop.initializer) key = visit(prop.initializer) as Expression
                                return null!
                            }
                            // if no prop.initializer, it means <a attribute />
                            let init: Expression = prop.initializer ?? factory.createTrue()
                            // JsxExpression might be empty: <a>{}</a> but it seems like not appear in the attribute position.
                            if (isJsxExpression(init)) init = init.expression ?? factory.createTrue()
                            return factory.createPropertyAssignment(
                                factory.createStringLiteral(prop.name.text),
                                visit(init) as Expression
                            )
                        }
                        if (isJsxSpreadAttribute(prop)) return factory.createSpreadAssignment(prop.expression)
                        return null!
                    })
                    .filter(Boolean)

                children = children.filter((x) => (isStringLiteral(x) && x.text.length === 0 ? false : true))
                if (children.length === 1) props.push(factory.createPropertyAssignment('children', children[0]))
                else if (children.length > 1)
                    props.push(
                        factory.createPropertyAssignment('children', factory.createArrayLiteralExpression(children))
                    )

                let propsExpr: Expression = factory.createObjectLiteralExpression(props, true)
                if (props.length === 1 && isSpreadAssignment(props[0]))
                    propsExpr = (props[0] as SpreadAssignment).expression
                return [propsExpr, key].filter(Boolean)
            }
        }
        /** Add a statement at the top of the lexical environment. */
        function addInitializationStatement(statement: Statement) {
            // @ts-ignore
            context.addInitializationStatement(statement)
        }
    }
}
