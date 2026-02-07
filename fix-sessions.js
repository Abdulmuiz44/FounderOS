const fs = require('fs');
const path = require('path');

const apiDir = './src/app/api';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix conditional checks
    const beforeCheck = content;
    content = content.replace(/if \(!session\?\.\user\?\.\id\)/g, 'if (!user)');
    if (content !== beforeCheck) modified = true;

    // Fix userId assignments
    const beforeAssign = content;
    content = content.replace(/const userId = session\?\.\user\?\.\id;/g, 'const userId = user?.id;');
    if (content !== beforeAssign) modified = true;

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            fixedCount += walkDir(filePath);
        } else if (file.endsWith('.ts')) {
            if (processFile(filePath)) fixedCount++;
        }
    });

    return fixedCount;
}

const count = walkDir(apiDir);
console.log(`\nTotal files fixed: ${count}`);
