import fs from 'fs/promises'
import { join } from 'path'
import ts, { TransformerFactory, SourceFile } from 'typescript'
// @ts-ignore
import diff from 'prettydiff'
import chalk from 'chalk'

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`Use your favorite tool to open ${join(__dirname, './help.md')}`)
    process.exit()
}

async function main() {
    let filter = process.argv.filter((x) => x.startsWith('-t='))[0]
    if (filter) filter = filter.slice(3)
    for (const folder of await fs.readdir(join(__dirname, './tests'))) {
        if (filter && !folder.toLowerCase().includes(filter)) continue
        await runTest(folder)
    }
}

async function runTest(path: string) {
    const cwd = join(__dirname, './tests/', path)
    const transformer: () => TransformerFactory<SourceFile> = (await import(join(cwd, 'code.ts'))).default

    const tests = new Set<string>()

    for (const file of await fs.readdir(cwd)) {
        if (file === 'code.ts') continue
        if (!file.endsWith('.ts')) continue
        tests.add(file.slice(0, -3))
    }
    for (const test of tests) {
        const target = join(cwd, test)
        const result = ts.transpileModule(await fs.readFile(`${target}.ts`, 'utf-8'), {
            compilerOptions: {
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.ESNext,
                jsx: ts.JsxEmit.Preserve,
            },
            transformers: { before: [transformer()] },
        }).outputText
        await fs.writeFile(`${target}-local.js`, result)
        const baselinePath = `${target}.js`
        if (process.argv.includes('-w')) {
            await fs.writeFile(baselinePath, result)
            console.log(`Baseline updated for transformer ${path}/${test}`)
        } else {
            try {
                const baseline = await fs.readFile(baselinePath, 'utf-8')
                if (baseline !== result) {
                    diff.options.source = baseline
                    diff.options.diff = result
                    console.warn(
                        `Transformer test ${chalk.underline(path)} / ${chalk.underline(test)} failed
Use ${chalk.yellow('-w')} to update the baseline if it is expected
Diff:
`,
                        diff()
                    )
                }
            } catch {}
        }
    }
}

main().catch((e) => {
    throw e
})
