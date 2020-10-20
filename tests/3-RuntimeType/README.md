# Runtime type

> Level: Advanced

In this test, you need to write a transformer that validating type annotations
in the parameters of FunctionDeclaration.

It's safe to assume that non-primitive type annotations are valid runtime JS classes.

1. For string, bigint, boolean, symbol, undefined, number, use `typeof x` != type to check

2. For null, use `x === null` to check

3. For any other type `x: T`, use `x instanceof T` to check

You only need to consider the most simple cases (which is covered in the tests in this folder).

Bonus: Can you support `|` type as well?
