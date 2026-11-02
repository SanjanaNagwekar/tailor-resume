const assert = require('node:assert/strict');
const { analyze, scoreMatch, estimateTailoredScore, applyExperiencePhrase } = require('../public/tailoring-engine.js');

const supportJob = `Provide developer support for a production web platform.
Triage and debug technical issues, help users, improve diagnostics, and build internal support tooling.
Work with React, Python, PostgreSQL, GitHub, and CI/CD. Go experience and GPU infrastructure are useful but optional.`;

const jakeProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Information Technology Support Specialist', bullets: [
    'Assess and troubleshoot computer problems brought by students, faculty and staff',
    'Maintain upkeep of computers, classroom equipment, and 200 printers across campus',
    'Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data',
  ] }] },
  { name: 'Projects', entries: [{ title: 'Simple Paintball', bullets: [
    'Implemented continuous delivery using TravisCI to build the plugin upon a new release',
    'Collaborated with server administrators to suggest features and get feedback about the plugin',
  ] }] },
  { name: 'Technical Skills', text: 'Java, Python, SQL, React, Flask, PostgreSQL, Git, GitHub, Docker' },
] };

const supportResult = analyze(supportJob, jakeProfile, JSON.stringify(jakeProfile));
assert.ok(supportResult.changes.some(change => /technical support by diagnosing and resolving/i.test(change.after)));
assert.ok(supportResult.changes.some(change => /production full-stack web application/i.test(change.after)));
assert.ok(supportResult.hits.includes('github'));
assert.ok(supportResult.skillCandidates.some(skill => skill.label === 'Go'));
assert.ok(supportResult.skillCandidates.some(skill => skill.label === 'GPU Infrastructure'));
assert.ok(supportResult.changes.every(change => !/GPU Infrastructure|\bGo\b/.test(change.after)), 'unsupported tools must never be invented');

const fullstackJob = `Build production full-stack web applications and APIs with React, JavaScript, Node.js, and PostgreSQL.
Debug backend issues, improve high-frequency user workflows, and make the work measurable with clear success metrics.
Realtime experience with WebRTC, WebSockets, protobuf, gRPC, and GCP is a plus.`;

const janeProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Web Developer', bullets: [
    'Designed and developed dynamic and responsive websites using HTML, CSS, JavaScript, and PHP',
    'Worked with REST APIs to retrieve and display data from databases',
    'Improved website performance and speed through optimization techniques by 55%',
    'Troubleshot and fixed bugs and issues in the backend to ensure smooth operation of the applications',
  ] }] },
  { name: 'Technical Skills', text: 'JavaScript, PHP, Java, HTML, CSS, React.js, Express, Node.js, MongoDB, PostgreSQL, Git' },
] };

const fullstackResult = analyze(fullstackJob, janeProfile, JSON.stringify(janeProfile));
assert.ok(fullstackResult.changes.some(change => /responsive production web interfaces/i.test(change.after)));
assert.ok(fullstackResult.changes.some(change => /Debugged and resolved/i.test(change.after)));
assert.ok(fullstackResult.changes.some(change => /by 55% through optimization techniques/i.test(change.after)));
for (const unsupported of ['WebRTC', 'WebSockets', 'Protobuf', 'gRPC', 'GCP']) assert.ok(fullstackResult.skillCandidates.some(skill => skill.label === unsupported));

const successMetrics = fullstackResult.experienceCandidates.find(item => item.key === 'success metrics');
assert.ok(successMetrics, 'quantified performance evidence should allow a user-confirmed success-metrics phrase');
assert.match(applyExperiencePhrase(successMetrics.evidence, successMetrics.key), /Defined success metrics/i);

const tailoredProfile = JSON.parse(JSON.stringify(janeProfile));
tailoredProfile.sections[0].entries[0].bullets = tailoredProfile.sections[0].entries[0].bullets.map(
  bullet => fullstackResult.changes.find(change => change.text === bullet)?.after || bullet,
);
const rescored = scoreMatch(fullstackJob, tailoredProfile, JSON.stringify(tailoredProfile));
const estimate = estimateTailoredScore(fullstackResult.score, rescored.score, { wording: fullstackResult.changes.length, skills: 0, phrases: 0 });
assert.ok(estimate > fullstackResult.score, `accepted edits should improve the estimated score (${fullstackResult.score} → ${estimate})`);

console.log(JSON.stringify({
  support: { before: supportResult.score, changes: supportResult.changes.length },
  fullstack: { before: fullstackResult.score, after: estimate, changes: fullstackResult.changes.length },
}, null, 2));

