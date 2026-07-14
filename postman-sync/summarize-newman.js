import fs from 'node:fs'

function argFor(argv, flag) {
  const index = argv.indexOf(flag)
  if (-1 === index) {
    throw new Error(`Missing required argument ${flag}`)
  }
  return argv[index + 1]
}

function main() {
  const argv = process.argv.slice(2)
  const resultsPath = argFor(argv, '--results')
  const outPath = argFor(argv, '--out')

  const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
  const { requests, assertions } = report.run.stats
  const failures = report.run.failures ?? []

  const lines = [
    '## Collection run',
    '',
    `Ran against a live local instance: ${requests.total} request(s), ${assertions.total} assertion(s), ${assertions.failed} failed.`,
  ]

  if (failures.length > 0) {
    lines.push('', 'Failures:', '')
    failures.forEach((failure) => {
      const name = failure.source?.name ?? 'unknown request'
      const message = failure.error?.message ?? 'unknown error'
      lines.push(`- **${name}**: ${message}`)
    })
  }

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`)
  console.log(
    `Wrote collection run summary to ${outPath} (${assertions.failed} assertion failure(s))`
  )
}

main()
