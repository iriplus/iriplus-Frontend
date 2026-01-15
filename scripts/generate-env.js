const fs = require('fs');
require('dotenv').config();

const env = {
  production: false,
  backendUrl: process.env.BACKEND_URL_DEV,
};

const content = `export const environment = ${JSON.stringify(env, null, 2)};`;

fs.writeFileSync('src/environments/environment.ts', content);
