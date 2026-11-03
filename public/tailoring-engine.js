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
    { id: 'open_source', label: 'Open-source community engagement', role: ['open-source', 'open source', 'github issues', 'github discussions', 'discord community'], evidence: ['open-source contributor', 'open source contributor', 'maintainer', 'community triage', 'community support'] },
    { id: 'ml_infrastructure', label: 'Model and ML infrastructure', role: ['model deployment', 'gpu', 'ml infrastructure', 'run models', 'open models', 'runtime'], evidence: ['model', 'llm', 'vlm', 'inference', 'kubernetes', 'gpu', 'deployment', 'multimodal'] },
    { id: 'consulting', label: 'Technical consulting and requirements translation', role: ['technical advisor', 'technical consultant', 'consultative role', 'enterprise clients', 'business requirements', 'technical discovery', 'architectural reviews', 'technical and non-technical'], evidence: ['stakeholder', 'requirements', 'business users', 'discovery', 'figma', 'dashboard', 'client', 'customer'] },
    { id: 'architecture', label: 'Solution architecture and API integration', role: ['architecting', 'architecture', 'scalable solutions', 'api integration', 'technical execution', 'production-grade solutions'], evidence: ['architecture', 'api', 'microservice', 'distributed', 'kubernetes', 'serverless', 'integrated', 'relational data model'] },
    { id: 'cloud_saas', label: 'SaaS and cloud delivery', role: ['saas', 'cloud technologies', 'cloud advisory', 'platform capabilities', 'cloud platform'], evidence: ['cloud', 'aws', 'kubernetes', 'docker', 'openshift', 'deployed', 'platform'] },
    { id: 'security_identity', label: 'Security, identity, and access', role: ['information security', 'single sign-on', 'oauth', 'saml', 'openid', 'active directory', 'secure'], evidence: ['credential isolation', 'authentication', 'authorization', 'oauth', 'auth0', 'security', 'rate limiting', 'private storage'] },
    { id: 'data_migration', label: 'Data analysis, mapping, and migration', role: ['data analysis', 'data mapping', 'data migration', 'content migrations', 'etl', 'dba'], evidence: ['etl', 'dataframe', 'consolidat', 'data-gap', 'data gap', 'mapping', 'migration'] },
    { id: 'product_engineering', label: 'Product-minded software engineering', role: ['product minded', 'product direction', 'product suite', 'product infrastructure', 'real world products'], evidence: ['full-stack', 'built', 'shipped', 'deployed', 'user experience', 'requirements', 'figma', 'prototype'] },
    { id: 'ownership', label: 'Ownership, initiative, and ambiguity', role: ['full ownership', 'ownership mindset', 'high initiative', 'agency', 'comfort with ambiguity', 'ambiguity'], evidence: ['owned', 'end-to-end', 'proposed', 'independent', 'initiative'] },
    { id: 'customer_product', label: 'Customer workflow ownership', role: ['talking to them directly', 'customer requests', 'customer relationship', 'customer process', 'customers interact', 'learning what their', 'largest lenders'], evidence: ['enterprise customer issues', 'customer issue triage', 'stakeholder feedback', 'requirements', 'user workflows', 'user journey'] },
    { id: 'quality_judgment', label: 'Product quality and prioritization judgment', role: ['quality bar', 'good enough', 'worth building', 'judgment about what matters', 'requests than time', 'verified through our evals', 'evals and simulations'], evidence: ['quality prioritization', 'evaluation framework', 'tradeoffs', 'confidence signals', 'product metrics', 'benchmarking', 'projected', 'validated fixes'] },
    { id: 'technical', label: 'Hands-on engineering', role: ['ship code', 'software engineer', 'codebase', 'hands-on', 'engineering'], evidence: ['engineer', 'built', 'implemented', 'shipped', 'refactored', 'python', 'java', 'typescript'] },
    { id: 'communication', label: 'Clear technical communication', role: ['communicate clearly', 'communicate', 'empathy', 'simplify complex', 'voice of the customer'], evidence: ['communicat', 'stakeholder', 'requirements', 'presentation', 'customer', 'user'] },
    { id: 'data_systems', label: 'Data systems, schemas, and access', role: ['schema changes', 'data systems', 'lab data', 'data checks', 'data pipelines', 'permission structure', 'queryable', 'metadata'], evidence: ['schema', 'data', 'pipeline', 'postgres', 'sql', 'permission', 'credential', 'access', 'etl'] },
    { id: 'strategy', label: 'Product strategy and prioritization', role: ['product strategy', 'roadmap', 'prioritization', 'product vision', 'tradeoffs'], evidence: ['strategy', 'roadmap', 'prioriti', 'tradeoff', 'requirements'] },
    { id: 'customer', label: 'Customer research and insight', role: ['customer research', 'user research', 'customer problems', 'interviews', 'customer insight'], evidence: ['customer', 'user research', 'interview', 'feedback', 'requirements'] },
    { id: 'analytics', label: 'Data, metrics, and experimentation', role: ['success metrics', 'analytics', 'sql', 'experimentation', 'experiments', 'data-driven', 'make the work measurable', 'instrument these interfaces'], evidence: ['metric', 'sql', 'experiment', 'analytics', 'dashboard', 'activation', 'adoption', 'retention', 'measuring', 'performance', 'improv'] },
    { id: 'leadership', label: 'Cross-functional leadership', role: ['cross-functional', 'stakeholder management', 'partner with', 'influence', 'leadership'], evidence: ['cross-functional', 'stakeholder', 'partner', 'collaborat', 'led', 'owned'] },
    { id: 'execution', label: 'End-to-end execution', role: ['ship', 'launch', 'execution', 'delivery', 'discovery'], evidence: ['ship', 'launch', 'deliver', 'release', 'built', 'created', 'implemented'] },
  ];

  const importantTerms = ['support engineering', 'support queue', 'triage', 'debugging', 'diagnostics', 'automation', 'internal dashboards', 'internal products', 'developer experience', 'developer tools', 'open source', 'github', 'discord', 'go', 'gpu', 'ml infrastructure', 'model deployment', 'documentation', 'error messages', 'lims', 'eln', 'benchling', 'schema changes', 'ai coding tools', 'ai agents', 'voice agents', 'evals', 'simulations', 'quality bar', 'pattern recognition', 'customer relationship', 'customer requests', 'customer workflows', 'clear writing', 'lab data', 'rest apis', 'pytest', 'testing', 'monitoring', 'product strategy', 'product judgment', 'product direction', 'product infrastructure', 'roadmap', 'prioritization', 'customer research', 'cross-functional', 'success metrics', 'requirements', 'adoption', 'user workflows', 'user experience', 'full-stack', 'frontend', 'backend', 'databases', 'authentication', 'deployment', 'enterprise workflows', 'ownership', 'initiative', 'ambiguity', 'startup', 'realtime', 'webrtc', 'websockets', 'streaming video', 'state synchronization', 'protobuf', 'grpc', 'on-prem', 'on-device', 'degraded network', 'versioning', 'teleoperation', 'robotics', 'safety-critical', 'hardware', 'observability', 'sql', 'experimentation', 'apis', 'machine learning', 'stakeholder management', 'typescript', 'react', 'python', 'java', 'aws', 'gcp', 'ci/cd', 'figma', 'kubernetes', 'prometheus', 'opentelemetry', 'technical advisor', 'business requirements', 'scalable solutions', 'api integrations', 'production-grade', 'ai workflows', 'content migrations', 'technical discovery', 'architectural reviews', 'customer outcomes', 'saas', 'cloud technologies', 'application development lifecycle', 'apis at scale', 'oauth', 'data analysis', 'data mapping', 'data migration', 'end-to-end', 'etl', 'information security'];
  const termAliases = {
    'rest apis': ['rest api', 'restful api'],
    'api integrations': ['api integration', 'api integrations'],
    'production-grade': ['production grade'],
    'scalable solutions': ['scalable solution'],
    'cloud technologies': ['cloud platforms', 'ibm cloud', 'aws'],
    'data analysis': ['data-gap analysis', 'data gap analysis'],
    'full-stack': ['fullstack', 'full stack'],
    'authentication': ['auth0', 'oauth', 'authentication'],
    'deployment': ['deploy', 'deployed'],
    'testing': ['tests', 'pytest', 'testing'],
    'monitoring': ['monitor', 'monitoring', 'prometheus', 'opentelemetry'],
    'user experience': ['user experience', 'ux'],
    'frontend': ['frontend', 'front-end', 'react', 'angular'],
    'databases': ['database', 'databases', 'postgresql', 'sqlite', 'oracle'],
    'ownership': ['ownership', 'owned', 'owning'],
    'ai coding tools': ['ai coding tools', 'ai coding assistant', 'cursor', 'windsurf', 'claude code'],
    'evals': ['evals', 'evaluation', 'evaluations'],
    'customer workflows': ['customer workflow', 'customer workflows', 'customer process', 'customer processes'],
    'clear writing': ['clear writing', 'strong writer'],
    'prioritization': ['prioritization', 'prioritize', 'prioritized'],
    'end-to-end': ['end to end'],
    'saas': ['saas'],
  };
  const skillCatalog = [
    { key: 'go', label: 'Go', category: 'Languages', aliases: ['go experience', 'go language', 'golang'] },
    { key: 'lims', label: 'LIMS', category: 'Cloud and Data', aliases: ['lims', 'laboratory information management system'] },
    { key: 'eln', label: 'ELN', category: 'Cloud and Data', aliases: ['eln', 'electronic lab notebook'] },
    { key: 'benchling', label: 'Benchling', category: 'Cloud and Data', aliases: ['benchling'] },
    { key: 'gpu', label: 'GPU Infrastructure', category: 'Cloud and Data', aliases: ['gpu infrastructure', 'gpu/ml infrastructure'] },
    { key: 'schema changes', label: 'Schema Design', category: 'Backend and AI', aliases: ['schema changes', 'schema design', 'database schema'] },
    { key: 'ai coding tools', label: 'AI Coding Tools', category: 'Quality and Observability', aliases: ['ai coding tools', 'ai coding assistant', 'cursor', 'windsurf', 'claude code'] },
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
  const stemToken = rawToken => {
    const token = rawToken.replace(/^[./]+|[./]+$/g, '');
    if (token.length <= 3 || /[+#/.]/.test(token)) return token;
    if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
    if (token.endsWith('ing') && token.length > 5) {
      let base = token.slice(0, -3);
      if (/(.)\1$/.test(base)) base = base.slice(0, -1);
      return base;
    }
    if (token.endsWith('ed') && token.length > 4) {
      let base = token.slice(0, -2);
      if (/(.)\1$/.test(base)) base = base.slice(0, -1);
      return base;
    }
    if (token.endsWith('es') && token.length > 5) return token.slice(0, -2);
    if (token.endsWith('s') && token.length > 4) return token.slice(0, -1);
    return token;
  };
  const canonicalize = value => normalize(value).split(' ').map(stemToken).join(' ');
  const prefixTerms = new Set(['automat', 'collaborat', 'communicat', 'consolidat', 'diagnos', 'improv', 'prioriti']);
  function countTerm(text, term) {
    const haystack = canonicalize(text).split(' ').filter(Boolean), needle = canonicalize(term).split(' ').filter(Boolean);
    if (!needle.length || haystack.length < needle.length) return 0;
    let count = 0;
    for (let start = 0; start <= haystack.length - needle.length; start++) {
      const matches = needle.every((token, offset) => haystack[start + offset] === token || (prefixTerms.has(token) && haystack[start + offset].startsWith(token)));
      if (matches) count++;
    }
    return count;
  }
  const sentences = text => String(text || '').split(/\n|(?<=[.!?])\s+/).map(s => s.replace(/^[•*-]\s*/, '').trim()).filter(s => s.length > 12);
  const evidenceVerb = /^(?:achieved|analyzed|architected|assess|assessed|automated|built|collaborated|conducted|created|debugged|defined|delivered|designed|developed|diagnosed|drove|established|implemented|improved|increased|instrumented|integrated|launched|led|maintain|maintained|managed|optimized|owned|owning|partnered|prioritized|provided|reduced|refactored|resolved|shipped|support|supported|translated|triaged|troubleshot|used|work|worked)\b/i;

  function flattenBullets(profile) {
    const bullets = [];
    for (const section of profile?.sections || []) for (const entry of section.entries || []) for (const text of entry.bullets || []) bullets.push({ section: section.name, entry: entry.title, text });
    return bullets;
  }

  function focusJobDescription(jd) {
    let text = String(jd || '').replace(/\r/g, '');
    const roleStartMarkers = [/\bWHY [A-Z0-9 '&-]+ NEEDS YOU\b/i, /\bABOUT THE ROLE\b/i, /\bTHE ROLE\b/i, /\bWHAT YOU(?:'|’)LL DO\b/i, /\bWHAT YOU WILL DO\b/i];
    const starts = roleStartMarkers.map(marker => text.search(marker)).filter(index => index >= 0);
    if (starts.length) text = text.slice(Math.min(...starts));
    const stopMarkers = [
      /\n\s*[A-Z][^\n]{0,50}\blives its values\b/i,
      /\n\s*EQUAL OPPORTUNITY\b/i,
      /\n\s*WHAT WE OFFER\b/i,
      /\n\s*BENEFITS\b/i,
      /\n\s*NOTICE TO APPLICANTS\b/i,
      /\n\s*NOTICE OF USE OF AI\b/i,
      /\n\s*(?:[A-Z][A-Za-z ]+ )?PAY RANGE\b/i,
      /\n\s*PRIVACY (?:POLICY|NOTICE)\b/i,
    ];
    const stops = stopMarkers.map(marker => text.search(marker)).filter(index => index >= 0);
    if (stops.length) text = text.slice(0, Math.min(...stops));
    return text.trim();
  }

  function conceptScore(text, terms) {
    return terms.reduce((score, term) => score + countTerm(text, term), 0);
  }

  function looksLikeEvidence(text) {
    const value = String(text || '').trim();
    return value.split(/\s+/).length >= 5 && evidenceVerb.test(value);
  }

  function rolePriorities(jd, bullets, resumeText) {
    const focusedJd = focusJobDescription(jd);
    const jdSentences = sentences(focusedJd);
    return concepts.map(concept => {
      const score = conceptScore(focusedJd, concept.role);
      if (!score) return null;
      const evidenceSentence = jdSentences.find(sentence => concept.role.some(term => normalize(sentence).includes(normalize(term)))) || '';
      const matches = bullets.map(bullet => ({ ...bullet, strength: conceptScore(bullet.text, concept.evidence) })).filter(match => match.strength && looksLikeEvidence(match.text)).sort((a, b) => b.strength - a.strength);
      const bestStrength = matches[0]?.strength || 0;
      const evidenceQuality = matches.length ? Math.min(1, (bestStrength + Math.min(2, matches.length - 1) * 0.25) / 3) : 0;
      return { ...concept, score, evidence: evidenceSentence, matches, supported: matches.length > 0, evidenceQuality };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function safeRewrite(original, matchedConcepts) {
    let text = original, reason = '';
    const ids = new Set(matchedConcepts.map(concept => concept.id));
    if ((ids.has('ai_product') || ids.has('ownership')) && /^Owned AI-platform capabilities from requirements and technical design through implementation, validation, release, and production support,/i.test(text)) {
      text = text.replace(/^Owned AI-platform capabilities from requirements and technical design through implementation, validation, release, and production support,/i, 'Owned AI-platform capabilities end to end, translating requirements into technical design, implementation, validation, release, and production support,');
      reason = 'Makes the existing end-to-end AI product ownership explicit without claiming voice-agent experience.';
    } else if ((ids.has('quality_judgment') || ids.has('model_evaluation')) && /^Defined stage-level latency, token-consumption, and confidence signals for LLM-powered extraction,/i.test(text)) {
      text = text.replace(/^Defined stage-level latency, token-consumption, and confidence signals for LLM-powered extraction,/i, 'Established the quality bar for LLM-powered extraction by defining evaluation signals for stage-level latency, token consumption, and confidence,');
      reason = 'Connects the existing measurement framework to the role’s evaluation and quality-bar responsibility.';
    } else if (ids.has('customer_product') && /^Triaged and resolved 20\+ enterprise customer issues spanning/i.test(text)) {
      text = text.replace(/^Triaged and resolved 20\+ enterprise customer issues spanning/i, 'Owned resolution of 20+ enterprise customer requests spanning').replace(/; filed defects and validated fixes/i, ', translating reported problems into defects and validated fixes');
      reason = 'Surfaces the existing ownership of enterprise customer requests and the path from problems to product fixes.';
    } else if (ids.has('customer_product') && /^Owned a vehicle-analytics product through the SDLC,/i.test(text)) {
      text = 'Translated stakeholder workflows and missing-data requirements into a vehicle-analytics product, leading the SDLC from design sprint and Figma prototype through stakeholder feedback and delivery.';
      reason = 'Leads with the existing workflow discovery and translation work most relevant to customer-driven product ownership.';
    } else if ((ids.has('security_identity') || ids.has('architecture')) && /^Designed and shipped multi-tenant data and credential isolation\b/i.test(text) && !/production-grade/i.test(text)) {
      text = text.replace(/^Designed and shipped /i, 'Designed and shipped secure, production-grade ');
      reason = 'Surfaces the security and production scope already supported by the credential-isolation implementation.';
    } else if (ids.has('product_engineering') && /^Designed and shipped multi-tenant data and credential isolation\b/i.test(text) && !/product infrastructure/i.test(text)) {
      text = text.replace(/^Designed and shipped /i, 'Built scalable product infrastructure by designing and shipping ');
      reason = 'Connects the existing multi-tenant cloud implementation to the role’s core product-infrastructure responsibility.';
    } else if (ids.has('consulting') && /^Owned dashboard delivery from Figma design sprint and requirements and data-gap analysis through Power BI implementation, automated refreshes, and stakeholder iteration, reducing vehicle-information lookup time by 80%\.?$/i.test(text)) {
      text = 'Translated business requirements and data-gap analysis into a Power BI dashboard, owning technical discovery from Figma design sprint through implementation, automated refreshes, and stakeholder iteration; reduced vehicle-information lookup time by 80%.';
      reason = 'Leads with the existing requirements translation, delivery ownership, and quantified business result.';
    } else if (ids.has('architecture') && /^Refactored WDU’s distributed Kubernetes architecture to move VLM image verbalization into Redis-backed, queue-driven AI worker jobs,/i.test(text)) {
      text = text.replace(/^Refactored WDU’s distributed Kubernetes architecture to move /i, 'Architected and delivered a scalable solution using Kubernetes and Redis-backed workers that moved ');
      reason = 'Frames the existing distributed-system refactor as solution architecture without changing its implementation.';
    } else if (ids.has('execution') && /^Built and deployed a full-stack marketplace\b/i.test(text) && !/end-to-end/i.test(text)) {
      text = text.replace(/^Built and deployed a /i, 'Built and deployed an end-to-end ');
      reason = 'Makes the already demonstrated end-to-end application delivery explicit.';
    } else if (ids.has('architecture') && /^Designed REST APIs\b/i.test(text)) {
      text = text.replace(/^Designed REST APIs and a relational data model, integrated Auth0 authentication,/i, 'Designed RESTful APIs and API integrations with a relational data model and Auth0 authentication,');
      reason = 'Uses the job description’s standard API design terminology for the same work.';
    } else if (ids.has('consulting') && /^Implemented search and filtering enhancements for internal global supply-chain applications\b/i.test(text)) {
      text = text.replace(/^Implemented /i, 'Delivered ').replace(/, improving access to operational data\.?$/i, ', improving access to operational data for business users.');
      reason = 'Connects the existing technical delivery to its internal business users and outcome.';
    } else if ((ids.has('observability') || ids.has('reliability')) && /^Instrumented\s+/i.test(text)) {
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
    const focusedJd = focusJobDescription(jd);
    const selected = importantTerms.filter(term => {
      const n = normalize(term);
      if (n === 'go') return /\b(?:golang|go\s+(?:experience|code|language|developer|programming))\b/i.test(focusedJd);
      if (n === 'debugging') return /\bdebug(?:ging|ged)?\b/i.test(focusedJd);
      if (n === 'startup') return /\b(?:startup|start-up)\s+(?:company|environment|team|role|culture)|\bfast-paced\s+(?:ai-first\s+)?startup\b/i.test(focusedJd);
      if (n === 'customer requests') return /\b(?:customer|lender)[^.!?\n]{0,80}\brequests?\b|\brequests?\s+come\s+to\s+you\b/i.test(focusedJd);
      if (n === 'customer relationship') return /\b(?:customer|lender)[^.!?\n]{0,100}\brelationship\b|\bown\s+both\s+the\s+work\s+and\s+the\s+relationship\b/i.test(focusedJd);
      if (n === 'customer workflows') return /\bcustomer(?:'s|s')?\s+(?:workflow|process)|\bwhat\s+their\s+[^.!?\n]{0,50}\bdo\s+all\s+day\b/i.test(focusedJd);
      return [term, ...(termAliases[term] || [])].some(alias => countTerm(focusedJd, alias) > 0);
    });
    return selected.filter(term => !selected.some(other => other !== term && normalize(other).includes(normalize(term))));
  }

  function hasDirectTerm(text, term) {
    const normalizedText = normalize(text), normalizedTerm = normalize(term);
    if (normalizedTerm === 'go') return /\b(?:golang|go\s+(?:experience|code|language|developer|programming))\b/.test(normalizedText);
    if (normalizedTerm === 'debugging') return /\bdebug(?:ging|ged)?\b/.test(normalizedText);
    if (normalizedTerm === 'startup') return /\b(?:startup|start up)\s+(?:company|environment|team|role|culture)|\bfast paced\s+(?:ai first\s+)?startup\b/.test(normalizedText);
    return [term, ...(termAliases[term] || [])].some(alias => countTerm(text, alias) > 0);
  }

  function confirmableSkills(jd, resumeText) {
    const job = focusJobDescription(jd), resume = String(resumeText || '');
    return skillCatalog.filter(skill => skill.aliases.some(alias => countTerm(job, alias) > 0) && !skill.aliases.some(alias => countTerm(resume, alias) > 0)).map(skill => {
      if (skill.key === 'ai coding tools' && /ai and technical/i.test(resume)) return { ...skill, category: 'AI and Technical' };
      return skill;
    });
  }

  function calculateScore(priorities, keys, hits) {
    const weightedTotal = priorities.reduce((sum, priority) => sum + priority.score, 0);
    const weightedSupported = priorities.reduce((sum, priority) => sum + priority.score * (priority.evidenceQuality || 0), 0);
    const evidenceCoverage = weightedTotal ? weightedSupported / weightedTotal : 0;
    const directCoverage = keys.length ? hits.length / keys.length : 0;
    const keywordWeight = Math.min(0.5, keys.length * 0.05), evidenceWeight = 1 - keywordWeight;
    const score = Math.round((directCoverage * keywordWeight + evidenceCoverage * evidenceWeight) * 100);
    return {
      score,
      evidenceCoverage,
      directCoverage,
      breakdown: {
        keywords: { score: Math.round(directCoverage * 100), weight: Math.round(keywordWeight * 100), matched: hits.length, total: keys.length },
        evidence: { score: Math.round(evidenceCoverage * 100), weight: Math.round(evidenceWeight * 100), supported: priorities.filter(priority => priority.supported).length, total: priorities.length },
      },
    };
  }

  function scoreMatch(jd, profile, resumeText) {
    const bullets = flattenBullets(profile);
    const priorities = rolePriorities(jd, bullets, resumeText);
    const keys = directTerms(jd);
    const base = normalize(`${resumeText} ${JSON.stringify(profile || {})}`);
    const hits = keys.filter(term => hasDirectTerm(base, term));
    return { ...calculateScore(priorities, keys, hits), priorities, keys, hits };
  }

  function estimateTailoredScore(baseScore, rescoredScore) {
    const value = Number.isFinite(Number(rescoredScore)) ? Number(rescoredScore) : Number(baseScore) || 0;
    return Math.max(0, Math.min(100, Math.round(value)));
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
    const scoring = calculateScore(priorities, keys, hits);
    return { priorities, keys, hits, miss, skillCandidates, experienceCandidates, surfacedTerms, changes, ...scoring, automaticLimit };
  }

  return { analyze, scoreMatch, estimateTailoredScore, concepts, normalize, focusJobDescription, safeRewrite, applyExperiencePhrase };
});
