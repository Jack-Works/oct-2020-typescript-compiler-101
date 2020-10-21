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
        if (folder.includes('99-End')) continue
        await runTest(folder)
    }
}

async function runTest(path: string) {
    const cwd = join(__dirname, './tests/', path)
    const transformer: () => TransformerFactory<SourceFile> = (
        await import(join(cwd, 'code-local.ts')).catch(() => import(join(cwd, 'code.ts')))
    ).default

    const tests = new Set<string>()

    for (const file of await fs.readdir(cwd)) {
        if (['code.ts', 'code-local.ts'].includes(file)) continue
        if (!file.match(/\.tsx?$/)) continue
        tests.add(file)
    }
    for (const test of tests) {
        const target = join(cwd, test).replace(/\.tsx?$/, '')
        const sourceFile = await fs.readFile(`${join(cwd, test)}`, 'utf-8')
        const result = ts.transpileModule(sourceFile, {
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
                    const head = `Transformer test ${chalk.underline(path)} / ${chalk.underline(test)}`
                    const skipped = `${head} ${chalk.yellow(
                        'skipped'
                    )} because it is marked as optional. Use ${chalk.yellow('-o')} to test it.`
                    if (sourceFile.includes('// optional') && !process.argv.includes('-o')) {
                        console.log(skipped)
                    } else {
                        console.warn(
                            `${head} failed
Use ${chalk.yellow('-w')} to update the baseline if it is expected
Diff:
`,
                            diff()
                        )
                    }
                }
            } catch {}
        }
    }
}

main().catch((e) => {
    throw e
})
