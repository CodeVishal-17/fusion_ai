
import fs from 'fs';

const lines = fs.readFileSync('frontend/src/app/page.tsx', 'utf8').split('\n');
let balance = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const opens = (line.match(/<div(?![^>]*\/>)/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    balance += opens - closes;
    if (balance < 0) {
        console.log(`Line ${i + 1}: Negative balance! (${balance})`);
        console.log(lines[i]);
    }
}
console.log(`Final balance: ${balance}`);
