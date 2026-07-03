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
  {
    name: '@sphereon/did-auth-siop',
    patchFile: '@sphereon-did-auth-siop-npm-0.20.1-592a249255.patch',
    packageDir: path.join(nodeModules, '@sphereon', 'did-auth-siop'),
  },
]

// String-replacement patches for partially-applied packages
// (jose: Yarn patches package.json via direct dep but misses webcrypto.js for transitive deps)
const stringPatches = [
  {
    // musap-native's KeyAttribute value-initializer is `internal`, so musap-react-native
    // (a separate module) can only see the `public init(name:cert:)` overload. Its
    // MapperFunctions.swift calls `KeyAttribute(name:value:)`, which then fails to compile
    // ("expected 'name:cert:'" / "cannot convert String? to SecCertificate"). Make the
    // value-initializer public so it is accessible across the module boundary.
    name: '@sphereon/musap-native (KeyAttribute value init)',
    file: path.join(nodeModules, '@sphereon', 'musap-native', 'ios', 'Sources', 'internal', 'datatype', 'KeyAttribute.swift'),
    find: '    init(name: String, value: String?) {',
    replace: '    public init(name: String, value: String?) {',
  },
  {
    name: 'jose (webcrypto.js)',
    file: path.join(nodeModules, 'jose', 'dist', 'browser', 'runtime', 'webcrypto.js'),
    find: 'export const isCryptoKey = (key) => key instanceof CryptoKey;',
    replace: "export const isCryptoKey = (key) => typeof key === 'object';",
  },
  {
    // OID4VP 1.0 final OpenID4VPHandover (ISO 18013-7 §B.2.6). The published kmp-mdoc-core compiled lib
    // emits the DRAFT handover [clientIdHash, responseUriHash, nonce]; strict OID4VP 1.0 verifiers (e.g.
    // the IDK HAIP verifier) expect ["OpenID4VPHandover", sha256(cbor([client_id, nonce, JwkThumbprint|null,
    // response_uri]))], and the signing SessionTranscript = [null, null, handover]. For unencrypted
    // direct_post the JwkThumbprint element is CBOR null. kmp-mdoc-core is a compiled KMP lib with no source
    // to rebuild, so we patch the single handover factory. CBOR bytes are hand-built (node-validated) and the
    // sha256 + CborItem wrapping use the lib's own in-scope primitives (hash / get_cborSerializer / etc).
    name: '@sphereon/kmp-mdoc-core (OID4VP 1.0 handover)',
    file: path.join(nodeModules, '@sphereon', 'kmp-mdoc-core', '@sphereon', 'kmp-mdoc-core.js'),
    find: '    return new OID4VPHandoverCbor(toCborByteString_0(clientIdToHash(clientId, mdocGeneratedNonce)), toCborByteString_0(responseUriToHash(responseUri, mdocGeneratedNonce)), toCborString(authorizationRequestNonce));',
    replace: [
      '    var __u8 = function (s) { var o = []; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c < 128) o.push(c); else if (c < 2048) o.push(192 | (c >> 6), 128 | (c & 63)); else o.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63)); } return o; };',
      "    var __ts = function (s) { var b = __u8(s), n = b.length, h; if (n < 24) h = [96 | n]; else if (n < 256) h = [120, n]; else h = [121, (n >> 8) & 255, n & 255]; return h.concat(b); };",
      '    var __info = [132].concat(__ts(clientId), __ts(authorizationRequestNonce), [246], __ts(responseUri));',
      '    var __ih = hash(Int8Array.from(__info), DigestAlg_SHA256_getInstance());',
      '    var __hb = []; for (var __i = 0; __i < __ih.length; __i++) __hb.push(__ih[__i] & 255);',
      "    var __handover = [130].concat(__ts('OpenID4VPHandover'), [88, 32], __hb);",
      '    var __transcript = [131, 246, 246].concat(__handover);',
      '    var __ho = new OID4VPHandoverCbor(toCborByteString_0(__ih), toCborByteString_0(__ih), toCborString(authorizationRequestNonce));',
      "    __ho.cborBuilder = function () { return Static_instance_6.builder(__ho).addRequired([toCborString('OpenID4VPHandover')]).addRequired([toCborByteString_0(__ih)]).end(); };",
      '    __ho.toCbor = function () { return get_cborSerializer().decode(Int8Array.from(__transcript)); };',
      '    return __ho;',
    ].join('\n'),
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
