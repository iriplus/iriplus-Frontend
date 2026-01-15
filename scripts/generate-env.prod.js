const fs = require('fs');
require('dotenv').config();

const env = {
  production: true,
  backendUrl: process.env.BACKEND_URL_PROD,
};

const content = `export const environment = ${JSON.stringify(env, null, 2)};`;

fs.writeFileSync('src/environments/environment.prod.ts', content);
