const assert = require('node:assert/strict');
const { analyze, scoreMatch, estimateTailoredScore, applyExperiencePhrase, focusJobDescription } = require('../public/tailoring-engine.js');

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
assert.equal(estimate, rescored.score, 'the after score must come from rescoring the final resume, not the number of accepted edits');

const keywordStuffedProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Candidate', bullets: [
    'React Python PostgreSQL GitHub CI/CD support debugging diagnostics internal tooling',
  ] }] },
] };
const keywordStuffed = scoreMatch(supportJob, keywordStuffedProfile, JSON.stringify(keywordStuffedProfile));
assert.equal(keywordStuffed.breakdown.evidence.score, 0, 'a keyword list without an evidence-bearing statement must not receive responsibility credit');
assert.ok(keywordStuffed.score <= keywordStuffed.breakdown.keywords.weight, 'keyword presence alone must not produce a high overall match');

const countOnlyLift = estimateTailoredScore(20, 20, { wording: 12, skills: 8, phrases: 4 });
assert.equal(countOnlyLift, 20, 'accepted edit counts must never inflate the score');

const consultantJob = `WHY BOX NEEDS YOU
Technical consultants turn business vision into secure, production-grade solutions.
Translate complex business requirements into scalable solutions and robust API integration strategies.
Lead technical discovery and architectural reviews and deliver an end-to-end client experience.
Required skills include SaaS and cloud technologies, Python or Java, RESTful APIs, OAuth, data analysis, ETL, and information security.
Box lives its values, with community and collaboration being central to our culture.
EQUAL OPPORTUNITY
We value community and do not discriminate.`;

const consultantProfile = { sections: [{ name: 'Experience', entries: [{ title: 'Software Engineer', bullets: [
  'Designed and shipped multi-tenant data and credential isolation for a document platform across cloud providers using Redis, PostgreSQL, and Kubernetes.',
  'Refactored WDU’s distributed Kubernetes architecture to move VLM image verbalization into Redis-backed, queue-driven AI worker jobs, decoupling AI inference from page processing and enabling independent scaling across worker pods.',
  'Built and automated an AWS ETL pipeline with Python and PySpark, consolidating 2,000 files and reducing processing time by 65%.',
  'Owned dashboard delivery from Figma design sprint and requirements and data-gap analysis through Power BI implementation, automated refreshes, and stakeholder iteration, reducing vehicle-information lookup time by 80%.',
  'Built and deployed a full-stack marketplace supporting discovery, profiles, rentals, and purchases using React, TypeScript, and Express.',
  'Designed REST APIs and a relational data model, integrated Auth0 authentication, and debugged application-state and data-flow issues across end-to-end user journeys.',
] }] }] };

const consultantBefore = analyze(consultantJob, consultantProfile, JSON.stringify(consultantProfile));
const consultantAfterProfile = JSON.parse(JSON.stringify(consultantProfile));
consultantAfterProfile.sections[0].entries[0].bullets = consultantAfterProfile.sections[0].entries[0].bullets.map(
  bullet => consultantBefore.changes.find(change => change.text === bullet)?.after || bullet,
);
const consultantAfter = scoreMatch(consultantJob, consultantAfterProfile, JSON.stringify(consultantAfterProfile));
assert.ok(consultantAfter.score > consultantBefore.score, 'fact-supported consulting edits must improve the rescored match');
assert.ok(consultantBefore.changes.some(change => /production-grade/.test(change.after)));
assert.ok(consultantBefore.changes.some(change => /business requirements/.test(change.after)));
assert.ok(consultantBefore.changes.some(change => /scalable (?:solution|distributed Kubernetes architecture)/.test(change.after)));
assert.ok(consultantBefore.changes.some(change => /RESTful APIs and API integrations/.test(change.after)));
assert.ok(!consultantBefore.priorities.some(priority => priority.id === 'open_source'), 'culture and EEO boilerplate must not create an open-source requirement');
for (const unsupported of ['SAML', 'Active Directory', 'iOS', 'Android']) {
  assert.ok(consultantBefore.changes.every(change => !change.after.includes(unsupported)), `must not invent ${unsupported}`);
}
assert.ok(!focusJobDescription(consultantJob).includes('EQUAL OPPORTUNITY'), 'non-role boilerplate must be excluded from analysis');

const ownershipJob = 'Lead cross-functional delivery and stakeholder management.';
const ownedProfile = { sections: [{ name: 'Experience', entries: [{ title: 'Engineer', bullets: ['Owned stakeholder delivery across engineering and product teams.'] }] }] };
const owningProfile = { sections: [{ name: 'Experience', entries: [{ title: 'Engineer', bullets: ['Owning stakeholder delivery across engineering and product teams.'] }] }] };
assert.equal(
  scoreMatch(ownershipJob, ownedProfile, JSON.stringify(ownedProfile)).breakdown.evidence.score,
  scoreMatch(ownershipJob, owningProfile, JSON.stringify(owningProfile)).breakdown.evidence.score,
  'normal grammatical variants must receive the same evidence credit',
);

const startupJob = `THE ROLE
We are looking for product-minded Full Stack Engineers to build scalable and robust core product infrastructure for customers at a fast-paced AI-first startup.
WHAT YOU'LL DO
Build interfaces for enterprise workflows, develop intuitive UX for non-technical users, create enterprise-grade backend services, and shape product direction.
WHAT'S IN YOUR TOOLBOX
You have shipped production features across frontend and backend and understand APIs, databases, authentication, and deployment. You use AI coding tools, verify outputs, write tests, and monitor production systems.
WHAT WE ARE LOOKING FOR
Clear communication, comfort with ambiguity, high initiative, and an ownership mindset.`;
const startupProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Software Engineer', bullets: [
    'Designed and shipped multi-tenant data and credential isolation for a cloud document platform using Redis, PostgreSQL, and Kubernetes; eliminated a 17-second startup API call through caching and concurrency controls.',
    'Instrumented document extraction with OpenTelemetry and Prometheus to expose latency and cost bottlenecks.',
    'Owned dashboard delivery from requirements through implementation and stakeholder iteration, reducing lookup time by 80%.',
  ] }] },
  { name: 'Technical Skills', text: 'Python, TypeScript, React, Next.js, Express, PostgreSQL, Auth0, Vercel, pytest' },
] };
const startupBefore = analyze(startupJob, startupProfile, JSON.stringify(startupProfile));
assert.ok(startupBefore.keys.length >= 12, 'a detailed engineering posting must not collapse to only a handful of scoreable terms');
assert.ok(!startupBefore.hits.includes('startup'), 'startup API latency must not be mistaken for startup-company experience');
assert.ok(!startupBefore.priorities.some(priority => priority.id === 'data_migration'), 'feedback language must not match the standalone DBA acronym');
const startupWithConfirmedSkill = JSON.parse(JSON.stringify(startupProfile));
startupWithConfirmedSkill.sections[1].text += ' · AI Coding Tools';
const startupSkillScore = scoreMatch(startupJob, startupWithConfirmedSkill, JSON.stringify(startupWithConfirmedSkill));
assert.ok(startupSkillScore.score - startupBefore.score <= 5, 'one confirmed tool must never add more than five score points');
const startupTailored = JSON.parse(JSON.stringify(startupProfile));
startupTailored.sections[0].entries[0].bullets = startupTailored.sections[0].entries[0].bullets.map(
  bullet => startupBefore.changes.find(change => change.text === bullet)?.after || bullet,
);
const startupTailoredScore = scoreMatch(startupJob, startupTailored, JSON.stringify(startupTailored));
assert.ok(startupTailoredScore.score > startupBefore.score, 'a supported product-infrastructure rewrite must improve the rescored match');

const productJob = `ABOUT SELA
We build mortgage software and offer great benefits.
WHAT YOU WILL DO
Direct AI agents through Cursor and Claude Code, own customer requests and relationships, learn customer workflows, and build new voice agents end to end.
Verify every change through evals and simulations before it goes live.
WHAT YOU WILL OWN
Spot patterns across customers, push missing features into the roadmap, and set the quality bar.
WHAT WE ARE LOOKING FOR
Clear writing, prioritization judgment, comfort with ambiguity, and curiosity about AI.
BENEFITS
Medical and dental coverage.`;
const productProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Product Engineer', bullets: [
    'Owned AI-platform capabilities from requirements and technical design through implementation, validation, release, and production support, including multi-tenant isolation and scalable VLM processing for a document platform.',
    'Defined stage-level latency, token-consumption, and confidence signals for LLM-powered extraction, giving the team measurable inputs for performance, cost, and quality prioritization.',
    "Triaged and resolved 20+ enterprise customer issues spanning document ingestion, extraction confidence, OCR and layout, and input formats; filed defects and validated fixes with an open-source project.",
    'Owned a vehicle-analytics product through the SDLC, leading a design sprint, creating the Figma prototype, gathering requirements and missing data, and iterating on stakeholder feedback through delivery.',
  ] }] },
  { name: 'Skills', text: 'Product Ownership · Model Evaluation · AI and Technical: LLMs, VLMs, Python' },
] };
const productBefore = analyze(productJob, productProfile, JSON.stringify(productProfile));
const productTailored = JSON.parse(JSON.stringify(productProfile));
productTailored.sections[0].entries[0].bullets = productTailored.sections[0].entries[0].bullets.map(
  bullet => productBefore.changes.find(change => change.text === bullet)?.after || bullet,
);
const productAfter = scoreMatch(productJob, productTailored, JSON.stringify(productTailored));
assert.ok(productBefore.changes.length >= 3, 'a PM role must produce evidence-backed product wording changes');
assert.ok(productBefore.changes.some(change => /quality bar/.test(change.after)));
assert.ok(productBefore.changes.some(change => /customer requests/.test(change.after)));
assert.ok(productAfter.score > productBefore.score, 'PM wording changes must improve the rescored match');
assert.ok(!productBefore.keys.includes('go'), 'the phrase go live must not be interpreted as the Go programming language');
assert.ok(productBefore.changes.every(change => !/voice agents/.test(change.after)), 'voice-agent experience must not be invented');
assert.ok(!focusJobDescription(productJob).includes('BENEFITS'), 'benefits must be excluded from PM role analysis');
const productSkill = productBefore.skillCandidates.find(skill => skill.key === 'ai coding tools');
assert.equal(productSkill?.category, 'AI and Technical', 'confirmed AI tools must target an existing PM resume skill category');

const systemsJob = `ABOUT THE ROLE
Build backend and robotics infrastructure for production products. Design and ship reliable services, APIs, and operational tooling.
Collaborate across ML and product teams to define requirements and build well-architected systems through strong solution architecture.
Improve reliability and scalability through testing, observability, incident response, and performance tuning.
Strong Python, backend services, distributed systems, API design, AWS, Kubernetes, CI/CD, and OpenTelemetry experience.`;
const systemsProfile = { sections: [
  { name: 'Experience', entries: [{ title: 'Software Engineer', bullets: [
    'Designed and shipped multi-tenant data and credential isolation for a document platform across cloud providers using Redis, PostgreSQL, and Kubernetes; eliminated a 17-second startup API call through caching and concurrency controls.',
    'Refactored WDU’s distributed Kubernetes architecture to move VLM image verbalization into Redis-backed, queue-driven AI worker jobs, decoupling AI inference from page processing and enabling independent scaling across worker pods.',
    'Instrumented LLM-powered document extraction with OpenTelemetry and Prometheus, capturing runtime and token usage to expose latency and cost bottlenecks.',
    'Built and deployed a full-stack marketplace using React, TypeScript, Express, and SQLite.',
    'Designed REST APIs and a relational data model, integrated Auth0 authentication, and debugged application-state issues across end-to-end user journeys.',
  ] }] },
  { name: 'Technical Skills', text: 'Python, Backend, Distributed Systems, APIs, AWS, Kubernetes, CI/CD, OpenTelemetry, Testing, Monitoring' },
] };
const systemsBefore = analyze(systemsJob, systemsProfile, JSON.stringify(systemsProfile));
assert.ok(systemsBefore.changes.length >= 3, 'systems roles should still produce several useful edits');
assert.ok(systemsBefore.changes.some(change => /distributed Kubernetes architecture/.test(change.after)), 'architecture rewrites must preserve strong architecture evidence');
for (let mask = 0; mask < (1 << systemsBefore.changes.length); mask++) {
  const tailored = JSON.parse(JSON.stringify(systemsProfile));
  tailored.sections[0].entries[0].bullets = tailored.sections[0].entries[0].bullets.map(bullet => {
    const change = systemsBefore.changes.find((candidate, index) => (mask & (1 << index)) && candidate.text === bullet);
    return change?.after || bullet;
  });
  const score = scoreMatch(systemsJob, tailored, JSON.stringify(tailored)).score;
  assert.ok(score >= systemsBefore.score, 'every user-selectable subset of automatic edits must preserve or improve the original score');
}

console.log(JSON.stringify({
  support: { before: supportResult.score, changes: supportResult.changes.length },
  fullstack: { before: fullstackResult.score, after: estimate, changes: fullstackResult.changes.length },
  consulting: { before: consultantBefore.score, after: consultantAfter.score, changes: consultantBefore.changes.length },
  startup: { before: startupBefore.score, afterSkill: startupSkillScore.score, afterEdits: startupTailoredScore.score, changes: startupBefore.changes.length },
  product: { before: productBefore.score, after: productAfter.score, changes: productBefore.changes.length },
  systems: { before: systemsBefore.score, changes: systemsBefore.changes.length },
}, null, 2));

