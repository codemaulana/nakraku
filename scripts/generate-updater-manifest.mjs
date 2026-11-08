import fs from 'node:fs';
import path from 'node:path';

export function generateManifest(version, notes, signature, assetUrl, platform = 'windows-x86_64') {
  if (!version || typeof version !== 'string') {
    throw new Error('Version must be a valid non-empty string');
  }
  if (!signature || typeof signature !== 'string') {
    throw new Error('Signature must be a non-empty base64 string');
  }
  if (!assetUrl || typeof assetUrl !== 'string') {
    throw new Error('Asset URL must be a valid URL string');
  }

  const manifest = {
    version: version.replace(/^v/u, ''),
    notes: notes || `Release v${version}`,
    pub_date: new Date().toISOString(),
    platforms: {
      [platform]: {
        signature,
        url: assetUrl,
      },
    },
  };

  return manifest;
}

function runCli() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    return;
  }

  const [version, signatureFileOrString, assetUrl, outputFile = 'latest.json'] = args;
  let signature = signatureFileOrString;

  if (fs.existsSync(signatureFileOrString)) {
    signature = fs.readFileSync(signatureFileOrString, 'utf-8').trim();
  }

  const notes = process.env.RELEASE_NOTES || `Nakraku Stash v${version}`;
  const manifest = generateManifest(version, notes, signature, assetUrl);
  const outPath = path.resolve(process.cwd(), outputFile);

  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[UPDATER:MANIFEST] Generated ${outPath} for v${manifest.version}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-updater-manifest.mjs')) {
  runCli();
}
