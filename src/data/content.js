// Central place for the résumé-derived content that drives the site.
// Keeping this separate from components makes it easy to update copy
// without touching layout/animation code.

// Chronological résumé timeline — education, certifications, projects and
// roles as one arc, rendered as the scroll-tracked timeline section.
export const TIMELINE = [
  {
    step: '01',
    year: '2021 — 2025',
    title: 'VIT, Vellore',
    body: 'B.Tech in Computer Science, GPA 8.78/10. Four years that turned into a specialisation in data: how it moves, how it breaks, and how you prove where it came from.',
  },
  {
    step: '02',
    year: '2023',
    title: 'Decentralized Health Record Audit',
    body: 'Architected a tamper-proof health-record ledger on Ethereum in Solidity, with rule-based access control letting users grant or revoke metadata permissions in real time.',
  },
  {
    step: '03',
    year: '2024',
    title: 'AWS Certified',
    body: 'Cloud Practitioner in January, Solutions Architect – Associate in February. Both still current through February 2027.',
  },
  {
    step: '04',
    year: '2024',
    title: 'Geojit Technologies',
    body: 'Flutter intern on data visualization and product. Mapped custom charting libraries for portfolio tracking in a wealth-management app and shipped onboarding analytics dashboards.',
  },
  {
    step: '05',
    year: '2025',
    title: 'Air Quality Forecasting — Patent Filed',
    body: 'A Dual-Pathway Transformer Encoder forecasting eight pollutant vectors at once. RobustScaler and Huber Loss preprocessing cut predictive divergence by 300k+ units, validated with Dynamic Time Warping.',
  },
  {
    step: '06',
    year: '2025 — Present',
    title: 'Perficient — Client: BNY Mellon',
    body: 'Associate Technical Consultant on Data Lineage. Auditing 50+ banking applications per quarter, tracing Primary Data Elements for global regulatory compliance and stitching IBM Manta metadata into Solidatus models.',
  },
]

export const AT_A_GLANCE = [
  'B.Tech Computer Science, VIT — GPA 8.78/10',
  'AWS Certified Solutions Architect – Associate',
  'Patent filed on transformer-based forecasting',
  '50+ banking applications audited per quarter',
  'Based in Chennai, India',
]

export const PROJECTS = [
  {
    tag: '[001] · Patent filed',
    title: 'Air Quality Forecasting',
    description:
      'Dual-Pathway Transformer Encoder forecasting 8 pollutant vectors at once, validated with Dynamic Time Warping.',
    meta: 'Jan — Apr 2025',
    icon: 'forecast',
  },
  {
    tag: '[002] · Solidity · React · Web3.js',
    title: 'Health Record Audit',
    description:
      'Tamper-proof health-record ledger on Ethereum with real-time, rule-based access control.',
    meta: 'Nov — Dec 2023',
    icon: 'shield',
  },
  {
    tag: '[003] · AWS Certified',
    title: 'Solutions Architect & Cloud',
    description:
      'Solutions Architect – Associate and Cloud Practitioner, both active and current.',
    meta: 'Valid through Feb 2027',
    icon: 'badge',
  },
]

export const SKILL_GROUPS = [
  {
    title: 'Governance & Lineage',
    skills: ['STT Analysis', 'Data Lineage Tracking', 'Metadata Auditing', 'Data Reconciliation', 'Quantitative Research'],
  },
  {
    title: 'Languages & Tools',
    skills: ['Python', 'SQL (PostgreSQL)', 'Advanced Excel', 'IBM Manta', 'Solidatus', 'Linux', 'Git', 'AWS Cloud'],
  },
  {
    title: 'Statistical & ML Modeling',
    skills: ['Time-Series Forecasting', 'Attention Networks', 'Dynamic Time Warping', 'RobustScaler'],
  },
]

export const CONSTELLATION = {
  paths: [
    { id: 'cpath0', d: 'M 90 90 Q 250 40 460 220', label: 'Lineage', labelX: 90, labelY: 80 },
    { id: 'cpath1', d: 'M 250 55 Q 330 90 460 220', label: 'Reconciliation', labelX: 250, labelY: 45 },
    { id: 'cpath2', d: 'M 70 270 Q 220 260 460 220', label: 'Governance', labelX: 70, labelY: 290 },
  ],
  center: { x: 460, y: 220, label: 'Aditya Raj' },
}

export const CONTACT = {
  email: 'adityarajwork2002@gmail.com',
  linkedin: 'https://linkedin.com/in/aditya-raj2002',
  github: 'https://github.com/asteroy1012',
}

export const SECTIONS = [
  { key: 'source', label: 'Source' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'connect', label: 'Connect' },
]
