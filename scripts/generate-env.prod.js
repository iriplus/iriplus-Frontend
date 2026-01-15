import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL_PROD;

if (!backendUrl) {
  console.error('ERROR: BACKEND_URL is not defined');
  process.exit(1);
}

const dir = 'src/environments';
fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, 'environment.ts');

const content = `
export const environment = {
  production: true,
  backendUrl: '${backendUrl}'
};
`;

fs.writeFileSync(filePath, content.trim());

console.log('environment.ts generated at', filePath);
