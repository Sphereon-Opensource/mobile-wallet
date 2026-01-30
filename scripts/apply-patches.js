/**
 * Applies patches to transitive dependencies after yarn install.
 *
 * Yarn Berry has a known bug where patches applied via `resolutions`
 * don't reliably apply to transitive dependencies
 * (https://github.com/yarnpkg/berry/issues/4231).
 *
 * Additionally, `git apply` skips gitignored paths (node_modules),
 * so we use the `patch` command instead.
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const nodeModules = path.join(root, 'node_modules')
const patchesDir = path.join(root, 'patches')

const patchEntries = [
  {
    name: '@peculiar/webcrypto',
    patchFile: '@peculiar-webcrypto-npm-1.4.5-84054e5591.patch',
    packageDir: path.join(nodeModules, '@peculiar', 'webcrypto'),
  },
  {
    name: '@sphereon/openid-federation-client',
    patchFile: '@sphereon-openid-federation-client-npm-0.1.1-unstable.0647eb6-65cae8dee9.patch',
    packageDir: path.join(nodeModules, '@sphereon', 'openid-federation-client'),
  },
  {
    name: '@veramo/credential-w3c',
    patchFile: '@veramo-credential-w3c-npm-4.2.0-3dc01e76f9.patch',
    packageDir: path.join(nodeModules, '@veramo', 'credential-w3c'),
  },
  {
    name: '@veramo/data-store',
    patchFile: '@veramo-data-store-npm-4.2.0-bb461c197b.patch',
    packageDir: path.join(nodeModules, '@veramo', 'data-store'),
  },
]

// String-replacement patches for partially-applied packages
// (jose: Yarn patches package.json via direct dep but misses webcrypto.js for transitive deps)
const stringPatches = [
  {
    name: 'jose (webcrypto.js)',
    file: path.join(nodeModules, 'jose', 'dist', 'browser', 'runtime', 'webcrypto.js'),
    find: 'export const isCryptoKey = (key) => key instanceof CryptoKey;',
    replace: "export const isCryptoKey = (key) => typeof key === 'object';",
  },
]

// Apply patches using `patch -p1`
for (const { name, patchFile, packageDir } of patchEntries) {
  if (!fs.existsSync(packageDir)) {
    console.log(`[apply-patches] ${name}: package not found, skipping`)
    continue
  }

  const patchPath = path.resolve(patchesDir, patchFile)
  if (!fs.existsSync(patchPath)) {
    console.log(`[apply-patches] ${name}: patch file not found, skipping`)
    continue
  }

  // Normalize CRLF to LF
  const patchContent = fs.readFileSync(patchPath, 'utf8').replace(/\r\n/g, '\n')

  // Dry-run to check if patch is needed
  try {
    execSync('patch -p1 --dry-run --force', {
      cwd: packageDir,
      input: patchContent,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
  } catch (e) {
    // Dry-run failed — check if it's because the patch is already applied (reverse succeeds)
    try {
      execSync('patch -p1 --dry-run --force --reverse', {
        cwd: packageDir,
        input: patchContent,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      console.log(`[apply-patches] ${name}: already patched`)
    } catch {
      console.error(`[apply-patches] ${name}: patch does not apply cleanly`)
    }
    continue
  }

  // Apply for real
  try {
    execSync('patch -p1 --force', {
      cwd: packageDir,
      input: patchContent,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    console.log(`[apply-patches] ${name}: patch applied`)
  } catch (e) {
    console.error(`[apply-patches] ${name}: failed: ${e.stderr?.toString() || e.message}`)
  }
}

// Apply string-replacement patches
for (const { name, file, find, replace } of stringPatches) {
  if (!fs.existsSync(file)) {
    console.log(`[apply-patches] ${name}: file not found, skipping`)
    continue
  }

  const content = fs.readFileSync(file, 'utf8')
  if (content.includes(replace)) {
    console.log(`[apply-patches] ${name}: already patched`)
    continue
  }
  if (!content.includes(find)) {
    console.log(`[apply-patches] ${name}: pattern not found, skipping`)
    continue
  }

  fs.writeFileSync(file, content.replace(find, replace), 'utf8')
  console.log(`[apply-patches] ${name}: patched`)
}
