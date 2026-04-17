const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let errors = 0;

files.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    try {
        parse(code, {
            sourceType: 'module',
            plugins: ['jsx']
        });
    } catch (e) {
        console.error(`SYNTAX ERROR in ${file}: ${e.message}`);
        errors++;
    }
});

if (errors === 0) {
    console.log('All files parsed successfully!');
} else {
    process.exit(1);
}
