export async function main() {
    await import('typescript').catch((err) => err)

    await import(`not-${name}-analyze-able-name`.toUpperCase())
}
