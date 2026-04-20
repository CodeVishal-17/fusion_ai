
import fs from 'fs';

const content = fs.readFileSync('frontend/src/app/page.tsx', 'utf8');

// Remove comments
const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

const divOpen = (cleanContent.match(/<div/g) || []).length;
const divClose = (cleanContent.match(/<\/div>/g) || []).length;
const fragmentOpen = (cleanContent.match(/<>/g) || []).length;
const fragmentClose = (cleanContent.match(/<\/>/g) || []).length;
const mainOpen = (cleanContent.match(/<main/g) || []).length;
const mainClose = (cleanContent.match(/<\/main>/g) || []).length;
const headerOpen = (cleanContent.match(/<header/g) || []).length;
const headerClose = (cleanContent.match(/<\/header>/g) || []).length;
const sectionOpen = (cleanContent.match(/<section/g) || []).length;
const sectionClose = (cleanContent.match(/<\/section>/g) || []).length;

console.log(`Divs: ${divOpen} open, ${divClose} close`);
console.log(`Fragments: ${fragmentOpen} open, ${fragmentClose} close`);
console.log(`Main: ${mainOpen} open, ${mainClose} close`);
console.log(`Header: ${headerOpen} open, ${headerClose} close`);
console.log(`Section: ${sectionOpen} open, ${sectionClose} close`);
