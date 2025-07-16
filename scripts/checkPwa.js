import fs from 'node:fs/promises';
import { resolve } from 'node:path';

(async () => {
  const manifest = JSON.parse(
    await fs.readFile(resolve('dist', 'manifest.webmanifest'), 'utf-8')
  );

  if (!manifest.scope === "/") {
    console.error('❌  PWA manifest is missing icons');
    process.exit(1);
  }
  console.log('✅  PWA manifest looks OK');
})();