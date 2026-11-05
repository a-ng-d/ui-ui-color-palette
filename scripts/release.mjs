#!/usr/bin/env node
/**
 * Release script for a UI Color Palette platform repo
 * (figma, penpot, sketch, framer, web).
 *
 * Shipped through the `packages/ui-ui-color-palette` submodule and run from the
 * platform repo itself:
 *   "release": "node packages/ui-ui-color-palette/scripts/release.mjs"
 *
 * It:
 *   1. checks the repo (clean tree, base branches exist, branch and tag are free)
 *   2. creates `release/ui-color-palette/<version>` from the up-to-date dev branch
 *   3. runs `npm version <patch|minor|major|X.Y.Z> --no-git-tag-version`
 *      (package.json + package-lock.json), then for Sketch also bumps
 *      src/manifest.json and appcast.json
 *   4. commits `<version>`, pushes, and opens the release PR
 *      titled `UI Color Palette <version> /one [/team] [<name>]`
 *
 * Merging that PR triggers the repo's `release.yml` workflow
 * (into `dev` for figma/penpot/sketch/framer, into `prod` for web; for web a
 * second PR into `dev` is opened so dev also gets the version bump).
 *
 * Usage:
 *   npm run release -- <patch|minor|major|X.Y.Z> [options]
 *
 * Options:
 *   -n, --name <name>       Friendly name for this release only (default: RELEASE_NAME).
 *       --no-name           Do not append any friendly name.
 *   -e, --editions <list>   Editions shown in the title, comma separated (one,team).
 *                           Defaults: figma → one,team · others → one.
 *       --from <branch>     Branch the release starts from (default: dev).
 *   -b, --base <branch>     Branch the release PR targets (default: dev, web: prod).
 *       --repo <dir>        Platform repo to release (default: current directory).
 *       --draft             Open the PR(s) as drafts.
 *       --no-push           Stop after the local commit (no push, no PR).
 *       --no-pr             Push the branch but do not open any PR.
 *       --allow-dirty       Do not fail on uncommitted changes (they are NOT committed).
 *       --dry-run           Print what would happen without changing anything.
 *   -h, --help              Show this help.
 *
 * The friendly name that ends the PR title is the RELEASE_NAME constant below:
 * change it there to rename the release line for every platform.
 *
 * Examples:
 *   npm run release -- patch
 *   npm run release -- minor --name Trinity
 *   npm run release -- minor --draft
 *   npm run release -- 5.4.0 -n "Neo" -e one --dry-run
 */

import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import path from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const RELEASE_NAME = 'Neo'

const PRODUCT = 'UI Color Palette'
const BRANCH_PREFIX = 'release/ui-color-palette/'
const KNOWN_EDITIONS = ['one', 'team']
const CHANGELOG_URL =
  'https://ui-color-palette.canny.io/changelog/ui-color-palette-'

// Helpers

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
}

class ReleaseError extends Error {}

const fail = (msg) => {
  throw new ReleaseError(msg)
}

const run = (cmd, args, cwd, { allowFail = false } = {}) => {
  try {
    return execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    if (allowFail) return null
    const stderr = error.stderr?.toString().trim()
    fail(
      `\`${cmd} ${args.join(' ')}\` failed in ${cwd}${stderr ? `\n${stderr}` : ''}`
    )
  }
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

const setJsonString = (file, key, transform) => {
  const raw = readFileSync(file, 'utf8')
  const re = new RegExp(`("${key}"\\s*:\\s*")([^"]*)(")`)
  if (!re.test(raw)) fail(`${file}: no "${key}" field found`)
  writeFileSync(
    file,
    raw.replace(re, (_, a, value, z) => `${a}${transform(value)}${z}`)
  )
}

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/

const bump = (version, kind) => {
  const m = version.match(SEMVER)
  if (!m) fail(`Current version "${version}" is not plain semver (X.Y.Z)`)
  const [major, minor, patch] = m.slice(1).map(Number)
  if (kind === 'major') return `${major + 1}.0.0`
  if (kind === 'minor') return `${major}.${minor + 1}.0`
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`
  return kind
}

const compareSemver = (a, b) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
  return 0
}

const parseEditions = (value) => {
  const list = value
    .split(',')
    .map((s) => s.trim().replace(/^\//, '').toLowerCase())
    .filter(Boolean)
  const unknown = list.filter((v) => !KNOWN_EDITIONS.includes(v))
  if (unknown.length)
    fail(
      `Unknown edition(s): ${unknown.join(', ')} (allowed: ${KNOWN_EDITIONS.join(', ')})`
    )
  if (!list.length) fail('No edition given')
  return [...new Set(list)]
}

// Platforms

const sketchFiles = (cwd, version) => {
  const files = []
  const manifest = path.join(cwd, 'src/manifest.json')
  if (existsSync(manifest)) {
    setJsonString(manifest, 'version', () => version)
    files.push('src/manifest.json')
  }
  const appcast = path.join(cwd, 'appcast.json')
  if (existsSync(appcast)) {
    setJsonString(appcast, 'versionID', () => version)
    setJsonString(appcast, 'downloadURL', (url) =>
      url.replace(/\/download\/v[^/]+\//, `/download/v${version}/`)
    )
    setJsonString(appcast, 'creationDate', () =>
      new Date().toUTCString().replace('GMT', '+0000')
    )
    files.push('appcast.json')
  }
  return files
}

/**
 * editions   → default title flags
 * base       → branch whose merge triggers release.yml
 * syncInto   → extra PRs so those branches also receive the version bump
 * extraFiles → platform files holding the version besides package.json
 */
const PLATFORMS = {
  figma: { editions: ['one', 'team'], base: 'dev' },
  penpot: { editions: ['one'], base: 'dev' },
  sketch: { editions: ['one'], base: 'dev', extraFiles: sketchFiles },
  framer: { editions: ['one'], base: 'dev' },
  web: { editions: ['one'], base: 'prod', syncInto: ['dev'] },
}

// GitHub

const buildTitle = (version, editions, name) =>
  [PRODUCT, version, ...editions.map((e) => `/${e}`), name]
    .filter(Boolean)
    .join(' ')

const buildBody = (version, platform, target, releaseBase) =>
  [
    `## ${PRODUCT} ${version}`,
    '',
    target === releaseBase
      ? `Release of **${platform}**. Merging into \`${target}\` runs the \`Release production version\` workflow (tag \`v${version}\`, GitHub release).`
      : `Brings the **${platform}** ${version} version bump back into \`${target}\`. The release itself is triggered by the PR into \`${releaseBase}\`.`,
    '',
    `- [Friendly release note](${CHANGELOG_URL}${version.replaceAll('.', '')})`,
    '',
    '🤖 Generated with `npm run release` (packages/ui-ui-color-palette/scripts/release.mjs)',
  ].join('\n')

// Main

const HELP = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .match(/\/\*\*([\s\S]*?)\*\//)[1]
  .replace(/^ \* ?/gm, '')

const remoteHas = (cwd, kind, ref) =>
  Boolean(
    run('git', ['ls-remote', '--exit-code', kind, 'origin', ref], cwd, {
      allowFail: true,
    })
  )

const main = () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string', short: 'n' },
      'no-name': { type: 'boolean', default: false },
      editions: { type: 'string', short: 'e' },
      from: { type: 'string', default: 'dev' },
      base: { type: 'string', short: 'b' },
      repo: { type: 'string' },
      draft: { type: 'boolean', default: false },
      'no-push': { type: 'boolean', default: false },
      'no-pr': { type: 'boolean', default: false },
      'allow-dirty': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })

  if (values.help || positionals.length === 0) {
    console.log(HELP)
    process.exit(values.help ? 0 : 1)
  }
  if (positionals.length > 1)
    fail(`Expected a single bump argument, got: ${positionals.join(' ')}`)

  const kind = positionals[0]
  if (!['patch', 'minor', 'major'].includes(kind) && !SEMVER.test(kind))
    fail(
      `Bump must be patch, minor, major or an explicit X.Y.Z version (got "${kind}")`
    )

  const dryRun = values['dry-run']

  // Resolve the platform repo
  const start = path.resolve(values.repo ?? process.cwd())
  const cwd = run('git', ['rev-parse', '--show-toplevel'], start, {
    allowFail: true,
  })
  if (!cwd) fail(`${start} is not inside a git repository`)
  const pkgName = readJson(path.join(cwd, 'package.json')).name
  const platform = pkgName?.match(/^(\w+)-ui-color-palette$/)?.[1]
  const config = PLATFORMS[platform]
  if (!config)
    fail(
      `"${pkgName}" is not a platform repo (expected one of: ${Object.keys(
        PLATFORMS
      )
        .map((p) => `${p}-ui-color-palette`)
        .join(', ')}).\nRun the script from the platform repo, or pass --repo.`
    )

  const from = values.from
  const base = values.base ?? config.base
  const syncInto = (config.syncInto ?? []).filter((b) => b !== base)
  const editions = values.editions
    ? parseEditions(values.editions)
    : config.editions

  run('gh', ['auth', 'status'], cwd)

  // ---- 1. Preflight: nothing is changed until every check passes
  console.log(
    c.bold(
      `\n🔎 ${platform}-ui-color-palette${dryRun ? c.yellow(' (dry run)') : ''}\n`
    )
  )

  const dirty = run(
    'git',
    ['status', '--porcelain', '--ignore-submodules=dirty'],
    cwd
  )
  if (dirty && !values['allow-dirty'])
    fail(
      `Working tree is not clean (commit/stash, or pass --allow-dirty)\n${dirty}`
    )

  const current = run('git', ['branch', '--show-current'], cwd)
  if (current !== from && dirty)
    fail(`On "${current}" with uncommitted changes, cannot switch to "${from}"`)

  run('git', ['fetch', 'origin', '--prune', '--quiet'], cwd)
  for (const b of new Set([from, base, ...syncInto]))
    if (
      !run('git', ['rev-parse', '--verify', '--quiet', `origin/${b}`], cwd, {
        allowFail: true,
      })
    )
      fail(`origin/${b} does not exist`)

  const ahead = run(
    'git',
    ['rev-list', '--count', `origin/${from}..${from}`],
    cwd,
    { allowFail: true }
  )
  if (Number(ahead) > 0)
    console.log(
      c.yellow(
        `  ! local ${from} has ${ahead} unpushed commit(s), they will ship in the release branch`
      )
    )

  const currentVersion = JSON.parse(
    run('git', ['show', `origin/${from}:package.json`], cwd)
  ).version
  const nextVersion = bump(currentVersion, kind)
  if (compareSemver(nextVersion, currentVersion) <= 0)
    fail(
      `Next version ${nextVersion} is not greater than current ${currentVersion}`
    )

  const branch = `${BRANCH_PREFIX}${nextVersion}`
  if (
    run(
      'git',
      ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`],
      cwd,
      {
        allowFail: true,
      }
    )
  )
    fail(`Local branch ${branch} already exists`)
  if (remoteHas(cwd, '--heads', branch))
    fail(`Remote branch ${branch} already exists`)
  if (remoteHas(cwd, '--tags', `v${nextVersion}`))
    fail(`Tag v${nextVersion} already exists on origin`)

  const name = values['no-name'] ? '' : (values.name ?? RELEASE_NAME).trim()
  const title = buildTitle(nextVersion, editions, name)

  console.log(`  version  ${currentVersion} → ${c.cyan(nextVersion)}`)
  console.log(`  branch   ${c.cyan(branch)} (from origin/${from})`)
  console.log(
    `  PR       ${[base, ...syncInto].map((b, i) => (i ? b : c.bold(b))).join(' + ')}  ${c.dim(title)}`
  )
  if (dirty) console.log(c.yellow('  ! dirty tree, changes left uncommitted'))

  if (dryRun) {
    console.log(c.yellow('\nDry run: nothing was changed.\n'))
    return
  }

  // ---- 2. Branch, bump, commit
  console.log()
  if (current !== from) run('git', ['checkout', from], cwd)
  run('git', ['merge', '--ff-only', `origin/${from}`], cwd)
  run('git', ['checkout', '-b', branch], cwd)

  // npm bumps package.json + package-lock.json; no git tag (release.yml creates v<version>)
  run('npm', ['version', kind, '--no-git-tag-version'], cwd)
  const bumped = readJson(path.join(cwd, 'package.json')).version
  if (bumped !== nextVersion)
    fail(`npm version produced ${bumped}, expected ${nextVersion}`)
  const files = ['package.json']
  if (existsSync(path.join(cwd, 'package-lock.json')))
    files.push('package-lock.json')
  files.push(...(config.extraFiles?.(cwd, nextVersion) ?? []))

  run('git', ['add', '--', ...files], cwd)
  run('git', ['commit', '-m', nextVersion, '--', ...files], cwd)
  console.log(`  ${c.green('✓')} ${branch} created, bumped ${files.join(', ')}`)

  if (values['no-push']) {
    console.log(c.yellow('\nNot pushed (--no-push).\n'))
    return
  }

  // ---- 3. Push and open the PR(s)
  run('git', ['push', '-u', 'origin', branch], cwd)
  console.log(`  ${c.green('✓')} pushed`)

  if (values['no-pr']) {
    console.log(c.yellow('\nNo PR opened (--no-pr).\n'))
    return
  }

  const urls = []
  for (const target of [base, ...syncInto]) {
    const args = [
      'pr',
      'create',
      '--base',
      target,
      '--head',
      branch,
      '--title',
      title,
      '--body',
      buildBody(nextVersion, platform, target, base),
    ]
    if (values.draft) args.push('--draft')
    const url = run('gh', args, cwd)
    urls.push(url)
    console.log(`  ${c.green('✓')} PR → ${target}  ${url}`)
  }

  console.log(c.bold(`\n✅ ${title}\n`))
}

try {
  main()
} catch (error) {
  if (error instanceof ReleaseError) {
    console.error(c.red(`\n✗ ${error.message}\n`))
    process.exit(1)
  }
  throw error
}
