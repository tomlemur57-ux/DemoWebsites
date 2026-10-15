import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprint = JSON.parse(fs.readFileSync(path.join(root, 'dist/wordpress/form-earth-woocommerce.json'), 'utf8'));
blueprint.steps.push({ step: 'runPHP', code: fs.readFileSync(path.join(root, 'scripts/verify-woocommerce.php'), 'utf8') });
fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/woocommerce-verification.json'), JSON.stringify(blueprint));
console.log('Prepared artifacts/woocommerce-verification.json. Boot it with the official Playground CLI; failed runtime assertions stop startup.');
