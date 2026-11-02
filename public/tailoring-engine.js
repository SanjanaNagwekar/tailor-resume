(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.TailorEngine = engine;
})(typeof window !== 'undefined' ? window : this, function () {
  const concepts = [
    { id: 'support', label: 'Developer support and issue ownership', role: ['support queue', 'support systems', 'support engineering', 'helping users', 'unblock', 'answering questions'], evidence: ['support queue', 'support engineer', 'support specialist', 'customer-facing support', 'helped users', 'unblocked', 'ticket', 'troubleshoot'] },
    { id: 'debugging', label: 'Troubleshooting and issue resolution', role: ['triage', 'reproduce', 'resolve issues', 'fix bugs', 'debug', 'stack trace', 'error messages', 'diagnostics'], evidence: ['diagnos', 'debug', 'defect', 'resolved', 'troubleshoot', 'fixed bugs', 'reliability', 'bottleneck', 'observability', 'opentelemetry', 'prometheus'] },
    { id: 'automation', label: 'Support automation and internal tooling', role: ['automate', 'automation', 'triage tooling', 'self-serve', 'internal dashboards', 'build a system'], evidence: ['automat', 'dashboard', 'tooling', 'workflow', 'self-serve'] },
    { id: 'observability', label: 'Diagnostics and observability', role: ['diagnostics', 'debugging', 'error messages', 'spotting patterns', 'where developers get stuck'], evidence: ['diagnos', 'observability', 'opentelemetry', 'prometheus', 'instrument', 'latency', 'bottleneck', 'metrics'] },
    { id: 'developer_experience', label: 'Developer and user experience', role: ['developer experience', 'developers', 'users', 'docs', 'documentation', 'developer tools', 'successful'], evidence: ['developer', 'user experience', 'customer-facing', 'api', 'documentation', 'github', 'workflow'] },
    { id: 'fullstack', label: 'Full-stack product engineering', role: ['fullstack', 'full-stack', 'production web applications', 'react', 'typescript', 'frontend', 'backend', 'web applications'], evidence: ['full-stack', 'fullstack', 'react', 'typescript', 'javascript', 'html', 'php', 'responsive', 'next.js', 'node.js', 'express', 'api'] },
    { id: 'user_workflows', label: 'User workflows and product judgment', role: ['user workflows', 'human-robot interfaces', 'work directly with users', 'product judgment', 'gather requirements', 'drive adoption', 'high-frequency interfaces', 'ux instincts'], evidence: ['user journey', 'workflow', 'requirements', 'figma', 'stakeholder', 'user experience', 'discovery', 'prototype'] },
    { id: 'realtime', label: 'Realtime and streaming systems', role: ['realtime', 'real-time', 'webrtc', 'websockets', 'streaming video', 'state synchronization', 'latency budgets'], evidence: ['streaming', 'latency', 'real-time', 'websocket', 'state', 'serialization'] },
    { id: 'reliability', label: 'Reliability and production operations', role: ['reliable software', 'reliability', 'degraded-network', 'degraded network', 'failure obvious', 'observability', 'monitoring', 'productionization', 'production systems'], evidence: ['reliability', 'observability', 'prometheus', 'opentelemetry', 'monitor', 'latency', 'bottleneck', 'production', 'ci/cd'] },
    { id: 'model_evaluation', label: 'Model evaluation and AI quality', role: ['model evaluation', 'evaluation framework', 'evals', 'experimentation', 'model quality', 'quality and reliability'], evidence: ['evaluation framework', 'model evaluation', 'speaker similarity', 'groundedness', 'quality signals', 'experiments'] },
    { id: 'ai_product', label: 'Production AI product engineering', role: ['ai-powered', 'ai product', 'llm', 'foundation models', 'model-powered', 'model integration', 'agents', 'orchestration'], evidence: ['llm', 'vlm', 'model-based', 'ai worker', 'synthetic', 'speech synthesis', 'model evaluation', 'inference'] },
    { id: 'open_source', label: 'Open-source community engagement', role: ['open-source', 'open source', 'github', 'discord', 'community'], evidence: ['open-source contributor', 'open source contributor', 'maintainer', 'community triage', 'community support'] },
    { id: 'ml_infrastructure', label: 'Model and ML infrastructure', role: ['model deployment', 'gpu', 'ml infrastructure', 'run models', 'open models', 'runtime'], evidence: ['model', 'llm', 'vlm', 'inference', 'kubernetes', 'gpu', 'deployment', 'multimodal'] },
    { id: 'technical', label: 'Hands-on engineering', role: ['ship code', 'software engineer', 'codebase', 'hands-on', 'engineering'], evidence: ['engineer', 'built', 'implemented', 'shipped', 'refactored', 'python', 'java', 'typescript'] },
    { id: 'communication', label: 'Clear technical communication', role: ['communicate clearly', 'communicate', 'empathy', 'simplify complex', 'voice of the customer'], evidence: ['communicat', 'stakeholder', 'requirements', 'presentation', 'customer', 'user'] },
    { id: 'data_systems', label: 'Data systems, schemas, and access', role: ['schema changes', 'data systems', 'lab data', 'data checks', 'data pipelines', 'permission structure', 'queryable', 'metadata'], evidence: ['schema', 'data', 'pipeline', 'postgres', 'sql', 'permission', 'credential', 'access', 'etl'] },
    { id: 'strategy', label: 'Product strategy and prioritization', role: ['product strategy', 'roadmap', 'prioritization', 'product vision', 'tradeoffs'], evidence: ['strategy', 'roadmap', 'prioriti', 'tradeoff', 'requirements'] },
    { id: 'customer', label: 'Customer research and insight', role: ['customer research', 'user research', 'customer problems', 'interviews', 'customer insight'], evidence: ['customer', 'user research', 'interview', 'feedback', 'requirements'] },
    { id: 'analytics', label: 'Data, metrics, and experimentation', role: ['success metrics', 'analytics', 'sql', 'experimentation', 'experiments', 'data-driven', 'make the work measurable', 'instrument these interfaces'], evidence: ['metric', 'sql', 'experiment', 'analytics', 'dashboard', 'activation', 'adoption', 'retention', 'measuring', 'performance', 'improv'] },
    { id: 'leadership', label: 'Cross-functional leadership', role: ['cross-functional', 'stakeholder management', 'partner with', 'influence', 'leadership'], evidence: ['cross-functional', 'stakeholder', 'partner', 'collaborat', 'led', 'owned'] },
    { id: 'execution', label: 'End-to-end execution', role: ['ship', 'launch', 'execution', 'delivery', 'discovery'], evidence: ['ship', 'launch', 'deliver', 'release', 'built', 'created', 'implemented'] },
  ];

  const importantTerms = ['support engineering', 'support queue', 'triage', 'debugging', 'diagnostics', 'automation', 'internal dashboards', 'internal products', 'developer experience', 'developer tools', 'open source', 'github', 'discord', 'go', 'gpu', 'ml infrastructure', 'model deployment', 'documentation', 'error messages', 'lims', 'eln', 'benchling', 'schema changes', 'ai coding tools', 'lab data', 'rest apis', 'pytest', 'product strategy', 'product judgment', 'roadmap', 'customer research', 'cross-functional', 'success metrics', 'requirements', 'adoption', 'user workflows', 'full-stack', 'realtime', 'webrtc', 'websockets', 'streaming video', 'state synchronization', 'protobuf', 'grpc', 'on-prem', 'on-device', 'degraded network', 'versioning', 'teleoperation', 'robotics', 'safety-critical', 'hardware', 'observability', 'sql', 'experimentation', 'apis', 'machine learning', 'stakeholder management', 'typescript', 'react', 'python', 'aws', 'gcp', 'ci/cd', 'figma', 'kubernetes', 'prometheus', 'opentelemetry'];
  const skillCatalog = [
    { key: 'go', label: 'Go', category: 'Languages', aliases: ['go experience', 'go language', 'golang'] },
    { key: 'lims', label: 'LIMS', category: 'Cloud and Data', aliases: ['lims', 'laboratory information management system'] },
    { key: 'eln', label: 'ELN', category: 'Cloud and Data', aliases: ['eln', 'electronic lab notebook'] },
    { key: 'benchling', label: 'Benchling', category: 'Cloud and Data', aliases: ['benchling'] },
    { key: 'gpu', label: 'GPU Infrastructure', category: 'Cloud and Data', aliases: ['gpu infrastructure', 'gpu/ml infrastructure'] },
    { key: 'schema changes', label: 'Schema Design', category: 'Backend and AI', aliases: ['schema changes', 'schema design', 'database schema'] },
    { key: 'ai coding tools', label: 'AI Coding Tools', category: 'Quality and Observability', aliases: ['ai coding tools', 'ai coding assistant'] },
    { key: 'webrtc', label: 'WebRTC', category: 'Backend and AI', aliases: ['webrtc'] },
    { key: 'websockets', label: 'WebSockets', category: 'Backend and AI', aliases: ['websockets', 'websocket'] },
    { key: 'protobuf', label: 'Protobuf', category: 'Backend and AI', aliases: ['protobuf', 'protocol buffers'] },
    { key: 'grpc', label: 'gRPC', category: 'Backend and AI', aliases: ['grpc'] },
    { key: 'gcp', label: 'GCP', category: 'Cloud and Data', aliases: ['gcp', 'google cloud platform'] },
  ];
  const experiencePhraseCatalog = [
    { key: 'debugging', label: 'Debugging', conceptId: 'debugging', evidence: /diagnos|debug|defect|resolved|reliability/i },
    { key: 'success metrics', label: 'Success metrics', conceptId: 'analytics', evidence: /metric|dashboard|activation|adoption|retention|experiment|reduc|improv|\d+%/i },
  ];
  const normalize = value => String(value || '').toLowerCase().replace(/[–—-]/g, ' ').replace(/[^a-z0-9+#/. ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const countTerm = (text, term) => text.split(term).length - 1;
  const sentences = text => String(text || '').split(/\n|(?<=[.!?])\s+/).map(s => s.replace(/^[•*-]\s*/, '').trim()).filter(s => s.length > 12);

  function flattenBullets(profile) {
    const bullets = [];
    for (const section of profile?.sections || []) for (const entry of section.entries || []) for (const text of entry.bullets || []) bullets.push({ section: section.name, entry: entry.title, text });
    return bullets;
  }

  function conceptScore(text, terms) {
    const lower = normalize(text);
    return terms.reduce((score, term) => score + countTerm(lower, normalize(term)), 0);
  }

  function rolePriorities(jd, bullets, resumeText) {
    const jdSentences = sentences(jd), combinedResume = normalize(`${resumeText} ${bullets.map(b => b.text).join(' ')}`);
    return concepts.map(concept => {
      const score = conceptScore(jd, concept.role);
      if (!score) return null;
      const evidenceSentence = jdSentences.find(sentence => concept.role.some(term => normalize(sentence).includes(normalize(term)))) || '';
      const matches = bullets.map(bullet => ({ ...bullet, strength: conceptScore(bullet.text, concept.evidence) })).filter(match => match.strength).sort((a, b) => b.strength - a.strength);
      const skillMatch = concept.evidence.some(term => combinedResume.includes(normalize(term)));
      return { ...concept, score, evidence: evidenceSentence, matches, supported: matches.length > 0 || skillMatch };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function safeRewrite(original, matchedConcepts) {
    let text = original, reason = '';
    const ids = new Set(matchedConcepts.map(concept => concept.id));
    if ((ids.has('observability') || ids.has('reliability')) && /^Instrumented\s+/i.test(text)) {
      text = text.replace(/^Instrumented\s+/i, 'Built observability and diagnostic coverage for ');
      reason = 'Makes the existing instrumentation and diagnostic evidence explicit.';
    } else if (ids.has('debugging') && /^Assess and troubleshoot\s+/i.test(text)) {
      text = text.replace(/^Assess and troubleshoot\s+/i, 'Provided technical support by diagnosing and resolving ');
      reason = 'Leads with the troubleshooting and user-support work already described.';
    } else if (ids.has('debugging') && /^Troubleshot and (?:fixed|resolved)\s+/i.test(text)) {
      text = text.replace(/^Troubleshot and (?:fixed|resolved)\s+/i, 'Debugged and resolved ');
      reason = 'Uses direct debugging language for the same issue-resolution work.';
    } else if (ids.has('debugging') && /^Diagnosed and resolved (?:defects|issues) in\s+/i.test(text)) {
      text = text.replace(/^Diagnosed and resolved (?:defects|issues) in\s+/i, 'Debugged and resolved issues in ');
      reason = 'Makes the existing debugging work explicit without changing its scope.';
    } else if (ids.has('fullstack') && /^Developed a full-stack web application using\s+/i.test(text)) {
      text = text.replace(/^Developed a full-stack web application using\s+/i, 'Built a production full-stack web application with ');
      reason = 'Surfaces the production full-stack scope already present in the bullet.';
    } else if (ids.has('fullstack') && /^Designed and developed dynamic and responsive websites using\s+/i.test(text)) {
      text = text.replace(/^Designed and developed dynamic and responsive websites using\s+/i, 'Built responsive production web interfaces with ');
      reason = 'Condenses the existing web-development evidence around production interface work.';
    } else if (ids.has('automation') && /^Implemented continuous delivery using\s+/i.test(text)) {
      text = text.replace(/^Implemented continuous delivery using\s+/i, 'Automated CI/CD with ');
      reason = 'Uses standard automation terminology for the continuous-delivery work already described.';
    } else if (ids.has('automation') && /^Used (.+?) for asynchronous tasks/i.test(text)) {
      text = text.replace(/^Used (.+?) for asynchronous tasks/i, 'Built asynchronous task processing with $1');
      reason = 'Makes the existing background-task implementation more direct.';
    } else if (ids.has('analytics') && /^Improved (.+?) through (.+?) by (\d+(?:\.\d+)?%)/i.test(text)) {
      text = text.replace(/^Improved (.+?) through (.+?) by (\d+(?:\.\d+)?%)/i, 'Improved $1 by $3 through $2');
      reason = 'Moves the existing quantified result forward without changing the evidence.';
    } else if (ids.has('leadership') && /partnered with/i.test(text) && !/cross-function/i.test(text)) {
      text = text.replace(/partnered with/i, 'Partnered cross-functionally with');
      reason = 'Clarifies the cross-functional scope already present in the bullet.';
    } else if (ids.has('strategy') && /owned (the )?roadmap/i.test(text) && !/strategy/i.test(text)) {
      text = text.replace(/owned (the )?roadmap/i, 'Owned product strategy and roadmap');
      reason = 'Connects existing roadmap ownership to the role’s strategy emphasis.';
    } else if (ids.has('customer') && /^Ran\s+/i.test(text)) {
      text = text.replace(/^Ran\s+/i, 'Conducted ');
      reason = 'Uses standard customer-research language without changing the underlying evidence.';
    } else if (ids.has('analytics') && /^Defined\s+/i.test(text)) {
      text = text.replace(/^Defined\s+/i, 'Established ');
      reason = 'Emphasizes the existing metrics and analytical ownership.';
    } else if (ids.has('execution') && /^Shipped\s+/i.test(text)) {
      text = text.replace(/^Shipped\s+/i, 'Launched ');
      reason = 'Aligns existing delivery evidence with the role’s launch language.';
    }
    return text === original ? null : { after: text, reason };
  }

  function directTerms(jd) {
    const lower = normalize(jd);
    return importantTerms.filter(term => {
      const n = normalize(term);
      if (n === 'go') return /\bgo(?: experience| code| language|\b)/i.test(jd);
      if (n === 'debugging') return /\bdebug(?:ging|ged)?\b/i.test(jd);
      return lower.includes(n);
    });
  }

  function hasDirectTerm(text, term) {
    const normalizedText = normalize(text), normalizedTerm = normalize(term);
    if (normalizedTerm === 'go') return /(?:^|\s)go(?:\s|$)/.test(normalizedText);
    if (normalizedTerm === 'debugging') return /\bdebug(?:ging|ged)?\b/.test(normalizedText);
    return normalizedText.includes(normalizedTerm);
  }

  function confirmableSkills(jd, resumeText) {
    const job = normalize(jd), resume = normalize(resumeText);
    return skillCatalog.filter(skill => skill.aliases.some(alias => job.includes(normalize(alias))) && !skill.aliases.some(alias => resume.includes(normalize(alias))));
  }

  function scoreMatch(jd, profile, resumeText) {
    const bullets = flattenBullets(profile);
    const priorities = rolePriorities(jd, bullets, resumeText);
    const keys = directTerms(jd);
    const base = normalize(`${resumeText} ${JSON.stringify(profile || {})}`);
    const hits = keys.filter(term => hasDirectTerm(base, term));
    const weightedTotal = priorities.reduce((sum, priority) => sum + priority.score, 0) || 1;
    const weightedSupported = priorities.filter(priority => priority.supported).reduce((sum, priority) => sum + priority.score, 0);
    const evidenceCoverage = weightedSupported / weightedTotal;
    const directCoverage = keys.length ? hits.length / keys.length : 0;
    const score = Math.max(15, Math.min(95, Math.round(20 + evidenceCoverage * 50 + directCoverage * 25)));
    return { score, priorities, keys, hits, evidenceCoverage, directCoverage };
  }

  function estimateTailoredScore(baseScore, rescoredScore, counts = {}) {
    const wordingLift = Math.max(0, Number(counts.wording) || 0);
    const skillLift = Math.max(0, Number(counts.skills) || 0) * 2;
    const phraseLift = Math.max(0, Number(counts.phrases) || 0);
    return Math.min(95, Math.max(rescoredScore, baseScore + wordingLift + skillLift + phraseLift));
  }

  function termRepresented(term, text) {
    const value = normalize(text);
    if (term === 'debugging') return /\bdebugg(?:ing|ed|er|ers)?\b/.test(value);
    return hasDirectTerm(value, term);
  }

  function applyExperiencePhrase(text, key) {
    if (key === 'debugging') {
      if (/^Assess and troubleshoot/i.test(text)) return text.replace(/^Assess and troubleshoot/i, 'Debugged and resolved');
      if (/^Troubleshot and (?:fixed|resolved)/i.test(text)) return text.replace(/^Troubleshot and (?:fixed|resolved)/i, 'Debugged and resolved');
      if (/^Diagnosed and resolved defects in/i.test(text)) return text.replace(/^Diagnosed and resolved defects in/i, 'Debugged and resolved defects in');
      if (/^Resolved defects in/i.test(text)) return text.replace(/^Resolved defects in/i, 'Debugged and resolved defects in');
      return text;
    }
    if (key === 'success metrics') {
      if (/^Defined metrics/i.test(text)) return text.replace(/^Defined metrics/i, 'Defined success metrics');
      if (/\d+(?:\.\d+)?%/.test(text) && !/^Defined success metrics/i.test(text)) return `Defined success metrics and ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
      return text;
    }
    return text;
  }

  function analyze(jd, profile, resumeText, limit = null) {
    const bullets = flattenBullets(profile), priorities = rolePriorities(jd, bullets, resumeText), base = normalize(`${resumeText} ${JSON.stringify(profile || {})}`);
    const keys = directTerms(jd), hits = keys.filter(term => hasDirectTerm(base, term)), miss = keys.filter(term => !hasDirectTerm(base, term));
    const skillCandidates = confirmableSkills(jd, base);
    const rankedBullets = bullets.map(bullet => {
      const matched = priorities.filter(priority => priority.matches.some(match => match.text === bullet.text));
      return { ...bullet, matched, weight: matched.reduce((sum, priority) => sum + priority.score, 0) };
    }).sort((a, b) => b.weight - a.weight);
    const changes = [], automaticLimit = limit ?? Math.min(5, Math.max(3, Math.ceil(priorities.length * 0.7)));
    for (const bullet of rankedBullets) {
      if (!bullet.weight) continue;
      const rewrite = safeRewrite(bullet.text, bullet.matched);
      if (rewrite) changes.push({ section: bullet.section, entry: bullet.entry, text: bullet.text, after: rewrite.after, reason: rewrite.reason, accepted: true, concepts: bullet.matched.map(c => c.label) });
      if (changes.length >= automaticLimit) break;
    }
    const surfacedTerms = miss.filter(term => changes.some(change => termRepresented(term, change.after)));
    const experienceCandidates = experiencePhraseCatalog.map(item => {
      if (!miss.includes(item.key) || surfacedTerms.includes(item.key)) return null;
      const priority = priorities.find(candidate => candidate.id === item.conceptId && candidate.supported);
      const matches = priority?.matches || [];
      const evidence = matches.find(match => item.evidence.test(match.text)) || matches[0];
      if (!evidence) return null;
      const existingChange = changes.find(change => change.text === evidence.text);
      const previewBase = existingChange?.after || evidence.text;
      const previewAfter = applyExperiencePhrase(previewBase, item.key);
      if (previewAfter === previewBase) return null;
      return { ...item, sourceText: evidence.text, evidence: evidence.text, previewAfter };
    }).filter(Boolean);
    const weightedTotal = priorities.reduce((sum, priority) => sum + priority.score, 0) || 1;
    const weightedSupported = priorities.filter(priority => priority.supported).reduce((sum, priority) => sum + priority.score, 0);
    const evidenceCoverage = weightedSupported / weightedTotal, directCoverage = keys.length ? hits.length / keys.length : 0;
    const score = Math.max(15, Math.min(95, Math.round(20 + evidenceCoverage * 50 + directCoverage * 25)));
    return { priorities, keys, hits, miss, skillCandidates, experienceCandidates, surfacedTerms, changes, score, evidenceCoverage, directCoverage, automaticLimit };
  }

  return { analyze, scoreMatch, estimateTailoredScore, concepts, normalize, safeRewrite, applyExperiencePhrase };
});
