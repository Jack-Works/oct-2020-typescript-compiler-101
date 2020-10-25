import {
    factory,
    isFunctionDeclaration,
    isIdentifier,
    isLiteralTypeNode,
    isToken,
    isTypeReferenceNode,
    isUnionTypeNode,
    Node,
    ParameterDeclaration,
    SourceFile,
    Statement,
    SyntaxKind,
    TransformerFactory,
    TypeNode,
    visitEachChild,
    VisitResult,
} from 'typescript'

export default function (): TransformerFactory<SourceFile> {
    return (context) => {
        return (sourceFile) => {
            const { factory } = context
            function visit<T extends Node>(node: T): VisitResult<Node> {
                if (isFunctionDeclaration(node)) {
                    // First, we collect all parameters of this function
                    const paramTypes = node.parameters.map(collectParamTypes).filter((x) => x)
                    return factory.updateFunctionDeclaration(
                        node,
                        node.decorators,
                        node.modifiers,
                        node.asteriskToken,
                        node.name,
                        node.typeParameters,
                        node.parameters,
                        node.type,
                        node.body
                            ? factory.updateBlock(node.body, [
                                  // Then, we add validation code for each parameter.
                                  ...paramTypes.map(createValidator).filter((x) => x),
                                  ...node.body.statements,
                              ])
                            : undefined
                    )
                }
                return visitEachChild(node, visit, context)
            }
            return visitEachChild(sourceFile, visit, context)
        }
    }

    function createValidator(param: readonly [string, readonly string[]] | null): Statement {
        if (!param) return null!
        const [name, types] = param
        if (types.length === 0) return null!
        const validator = types
            .map((x) => getIfCondition(name, x))
            .reduce((prev, curr) => {
                return factory.createBinaryExpression(prev, SyntaxKind.AmpersandAmpersandToken, curr)
            })
        return factory.createIfStatement(
            validator,
            factory.createThrowStatement(
                factory.createNewExpression(factory.createIdentifier('TypeError'), undefined, [
                    factory.createStringLiteral(`${name} is not type ${types.join(' | ')}`),
                ])
            ),
            undefined
        )
    }
    function getIfCondition(id: string, type: string) {
        if (['string', 'bigint', 'boolean', 'symbol', 'undefined', 'number'].includes(type)) {
            return factory.createBinaryExpression(
                factory.createTypeOfExpression(factory.createIdentifier(id)),
                factory.createToken(SyntaxKind.ExclamationEqualsToken),
                factory.createStringLiteral(type)
            )
        } else if (type === 'null') {
            return factory.createBinaryExpression(
                factory.createIdentifier(id),
                factory.createToken(SyntaxKind.ExclamationEqualsToken),
                factory.createNull()
            )
        } else {
            return factory.createPrefixUnaryExpression(
                SyntaxKind.ExclamationToken,
                factory.createParenthesizedExpression(
                    factory.createBinaryExpression(
                        factory.createIdentifier(id),
                        factory.createToken(SyntaxKind.InstanceOfKeyword),
                        factory.createIdentifier(type)
                    )
                )
            )
        }
    }
}
function collectParamTypes(x: ParameterDeclaration): readonly [string, readonly string[]] | null {
    if (x.dotDotDotToken) return null
    if (!isIdentifier(x.name)) return null
    const name = x.name.text
    const type = getType(x.type)
    if (type === null) return null
    return [name, type] as const
}
function getType(x?: TypeNode): string[] | null {
    if (!x) return null
    if (isToken(x)) return [x.getText()]
    if (isLiteralTypeNode(x)) return [x.getText()]
    if (isTypeReferenceNode(x) && isIdentifier(x.typeName)) return [x.typeName.text]
    if (isUnionTypeNode(x)) {
        const inner = x.types.map(getType)
        if (inner.some((x) => x === null)) return null
        return (inner as string[][]).flat()
    }
    return null
}
