import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const inputPath = process.argv[2] || 'docs/architecture/schema.mmd';
const outputPath = 'docs/architecture/erd.svg';

try {
  mkdirSync(dirname(outputPath), { recursive: true });

  execFileSync(
    'npx',
    ['--no-install', 'mmdc', '-i', inputPath, '-o', outputPath],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        LD_LIBRARY_PATH: [
          '/home/ryank/.local/lib',
          process.env.LD_LIBRARY_PATH,
        ]
          .filter(Boolean)
          .join(':'),
      },
    },
  );

  console.log('SUCCESS');
} catch (error) {
  console.error('SYNTAX_ERROR:', error.stderr?.trim() || error.message);
  process.exitCode = 1;
}
