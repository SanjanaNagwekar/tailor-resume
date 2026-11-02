const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const examples = [
  { file: 'jake-ryan.tex', name: 'Jake Ryan' },
  { file: 'jane-doe.tex', name: 'Jane Doe' },
];

for (const example of examples) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'examples', example.file), 'utf8');
  assert.match(source, /License\s*:\s*MIT/i, `${example.file} must preserve its MIT license notice`);
  assert.match(source, /\\begin\s*\{document\}/, `${example.file} must be a complete LaTeX document`);
  assert.match(source, /\\end\s*\{document\}/, `${example.file} must be a complete LaTeX document`);
  assert.ok(source.includes(example.name), `${example.file} must retain its fictional sample identity`);
  assert.doesNotMatch(source, /Sanjana|Nagwekar|sanjana\.nagwekar/i, `${example.file} must not contain project-owner resume data`);
}

console.log(`Validated ${examples.length} attributed LaTeX example resumes.`);

