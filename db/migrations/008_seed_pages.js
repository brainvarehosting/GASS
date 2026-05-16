// Generates db/migrations/008_seed_pages.sql with the 7 service pages.
// Run with: node db/migrations/008_seed_pages.js

const fs = require('fs');
const path = require('path');

const pages = [
  {
    slug: 'services',
    title: 'Our Services',
    description: 'Comprehensive solutions designed to create meaningful impact and long-term results.',
    sections: [
      { type: 'hero', data: {
        eyebrow: '', heading: 'Our Services', heading_accent: '',
        description: 'Comprehensive solutions designed to create meaningful impact and long-term results.',
        btn1_text: '', btn1_link: '', btn2_text: '', btn2_link: '',
        bg_image_url: '/assets/gallery-corporate-1.jpg',
        overlay_opacity: 0.55, text_align: 'center', text_color: '#ffffff',
      }},
      { type: 'rich_text', data: { html: '<p style="text-align:center;color:var(--gray-500);font-size:.95rem;max-width:740px;margin:0 auto 1.5rem;line-height:1.8;">At GreenApple Success Factors, we combine insight, strategy, and meaningful interventions to deliver solutions that generate lasting impact and sustainable results. Our services are tailored to empower organizations and individuals at every stage of their growth journey.</p>' }},
      { type: 'quick_services', data: {
        heading: '', subtext: '',
        items: [
          { icon: '📊', title: 'Business Consulting & Growth',           link: '/p/business-consulting' },
          { icon: '🚀', title: 'Startup & Entrepreneurial Mentoring',     link: '/p/startup-mentoring' },
          { icon: '🏛️', title: 'Academic & Institutional Empowerment',    link: '/p/academic-empowerment' },
          { icon: '🎓', title: 'Corporate Training & Professional Development', link: '/p/training-programs' },
          { icon: '🛡️', title: 'Risk, Compliance, ESG & Funding Advisory', link: '/p/risk-compliance-funding' },
          { icon: '⭐', title: 'Branding, Collaborations & Transformation', link: '/p/branding-transformation' },
        ],
      }},
      { type: 'cta', data: {
        heading: 'Ready to Begin Your Growth Journey?',
        subtext: 'Enabling leadership to think beyond the obvious, act with clarity, and create lasting impact.',
        btn_text: 'Talk to us', btn_link: '/reach-us.html',
        bg_color: '#0a7575',
      }},
    ],
  },

  // ---- 6 service detail pages ----
  {
    slug: 'business-consulting',
    title: 'Business Consulting & Growth',
    description: 'Scaling Businesses with Strategy & Operational Excellence.',
    sections: [
      heroService({ eyebrow:'Strategic Growth', heading:'Business Consulting & Growth', subtitle:'Scaling Businesses with Strategy & Operational Excellence. Transforming Vision into Measurable Growth.', bg:'/assets/building-modern.png' }),
      leadPara('Sustained performance is the result of deliberate strategy, disciplined execution, and continuous alignment with market realities. At GreenApple Success Factors Pvt Ltd, we work with leadership teams to strengthen business fundamentals, unlock growth, and navigate complexity with clarity and control.', 'We engage as strategic partners—bringing structured thinking, objective perspective, and execution focus. From performance improvement to growth acceleration, our work is anchored in building organisations that are resilient, competitive, and future-ready.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Assess business performance and identify growth levers',
          'Refine strategy and strengthen competitive positioning',
          'Improve operational efficiency and execution discipline',
          'Design scalable business and operating models',
          'Support leadership in critical strategic decisions',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Greater strategic clarity and alignment',
          'Improved performance and operational efficiency',
          'Stronger competitive positioning',
          'Structured and sustainable growth pathways',
          'Enhanced leadership decision-making confidence',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Established businesses seeking renewed growth',
          'Organisations facing performance or execution challenges',
          'Leadership teams navigating change or transition',
          'Companies preparing for expansion or scale',
        ],
      }},
      ctaConsult('Ready to build a growth engine?', "Let's build a growth engine for your business—structured, scalable, and future-ready."),
    ],
  },
  {
    slug: 'startup-mentoring',
    title: 'Startup & Entrepreneurial Mentoring',
    description: 'Guiding Vision. Enabling Execution. Accelerating Growth.',
    sections: [
      heroService({ eyebrow:'Entrepreneurial Growth', heading:'Startup & Entrepreneurial Mentoring', subtitle:'Guiding Vision. Enabling Execution. Accelerating Growth.', bg:'/assets/abstract-pattern.png' }),
      leadPara('Enduring ventures are shaped by clarity of thought, quality of decisions, and disciplined execution. We partner with founders to translate ideas into structured, scalable enterprises—through rigorous thinking and experience-led guidance.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Validate ideas and refine business models',
          'Define go-to-market and growth pathways',
          'Support founders in high-stakes decision-making',
          'Prepare ventures for investor engagement',
          'Build systems and structures for scale',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Clear strategic direction and reduced uncertainty',
          'Stronger market fit and positioning',
          'Structured growth path with defined priorities',
          'Increased investor readiness and credibility',
          'Scalable and resilient business foundation',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Early-stage founders and startups',
          'Entrepreneurs moving from concept to execution',
          'Founders preparing for funding',
          'Scaling ventures seeking structured guidance',
        ],
      }},
      ctaConsult('Ready to turn your idea into impact?', 'Build your startup with clarity, confidence, and the right strategic foundation.'),
    ],
  },
  {
    slug: 'academic-empowerment',
    title: 'Academic & Institutional Empowerment',
    description: 'Shaping Institutions. Empowering Futures. Enabling Excellence.',
    sections: [
      heroService({ eyebrow:'Education & Institution Building', heading:'Academic & Institutional Empowerment', subtitle:'Shaping Institutions. Empowering Futures. Enabling Excellence.', bg:'/assets/office-minimal.png' }),
      leadPara('Institutions play a defining role in shaping future capability. We work with academic and professional institutions to enhance relevance, strengthen outcomes, and align with evolving industry expectations.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Align academic frameworks with industry expectations',
          'Design capability-building and employability initiatives',
          'Strengthen institutional strategy and positioning',
          'Enable faculty development and academic excellence',
          'Facilitate industry-academia collaboration',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Enhanced institutional relevance and credibility',
          'Improved student outcomes and employability',
          'Stronger industry connect and partnerships',
          'Elevated academic quality and engagement',
          'Future-ready institutional positioning',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Colleges and universities seeking differentiation',
          'Institutions aiming to improve student outcomes',
          'Academic leaders driving transformation',
          'Professional bodies strengthening impact and reach',
        ],
      }},
      ctaConsult('Ready to lead the future of education?', 'Create an institution that educates, inspires, and leads the future.'),
    ],
  },
  {
    slug: 'training-programs',
    title: 'Corporate Training & Professional Development',
    description: 'Capability building, when approached with intent, becomes a strategic advantage.',
    sections: [
      heroService({ eyebrow:'Professional Development', heading:'Corporate Training & Professional Development', subtitle:'Capability building, when approached with intent, becomes a strategic advantage.', bg:'/assets/hero-training.png' }),
      leadPara('We design and deliver learning interventions that go beyond knowledge transfer—focusing on behavioural shift, decision-making, and real-world application.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Design customised leadership and capability programmes',
          'Deliver high-impact training aligned to business needs',
          'Focus on decision-making, execution, and behavioural change',
          'Support leadership development and succession readiness',
          'Enable continuous professional growth frameworks',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Improved individual and team performance',
          'Stronger leadership capability and bench strength',
          'Better decision-making and execution quality',
          'Higher engagement and professional confidence',
          'Measurable impact on business outcomes',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Organisations investing in leadership development',
          'Companies seeking performance-driven training',
          'Teams navigating change or increased complexity',
          'Professionals aiming for accelerated growth',
        ],
      }},
      ctaConsult("Ready to elevate your team's capability?", "Let's build a performance-driven training programme tailored to your goals."),
    ],
  },
  {
    slug: 'risk-compliance-funding',
    title: 'Risk, Compliance, ESG & Funding Advisory',
    description: 'Ensuring Resilience. Enabling Responsibility. Driving Sustainable Growth.',
    sections: [
      heroService({ eyebrow:'Governance & Risk', heading:'Risk, Compliance, ESG & Funding Advisory', subtitle:'Ensuring Resilience. Enabling Responsibility. Driving Sustainable Growth.', bg:'/assets/hero-risk-compliance.png' }),
      leadPara('In an environment of heightened scrutiny and evolving expectations, organisations must manage risk with precision while remaining growth-oriented. We support businesses in strengthening governance, ensuring compliance, and integrating ESG considerations into core strategy.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Strengthen risk management and governance frameworks',
          'Ensure regulatory compliance and control effectiveness',
          'Integrate ESG into strategy and operations',
          'Support funding readiness and investor positioning',
          'Advise on financial structuring and stakeholder engagement',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Enhanced governance and risk visibility',
          'Improved compliance and regulatory confidence',
          'Stronger ESG alignment and credibility',
          'Increased investor trust and funding readiness',
          'Sustainable and well-governed growth',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Organisations strengthening governance and compliance',
          'Businesses preparing for funding or investment',
          'Companies integrating ESG into strategy',
          'Leadership teams managing risk in dynamic environments',
        ],
      }},
      ctaConsult('Secure your strategic financial direction.', 'Secure your growth with strong governance and strategic financial direction.'),
    ],
  },
  {
    slug: 'branding-transformation',
    title: 'Branding, Collaborations & Transformation',
    description: 'Positioning with Purpose. Partnering for Growth. Transforming for Impact.',
    sections: [
      heroService({ eyebrow:'Brand Evolution', heading:'Branding, Collaborations & Transformation', subtitle:'Positioning with Purpose. Partnering for Growth. Transforming for Impact.', bg:'/assets/hero-branding-transformation.png' }),
      leadPara('Sustained relevance demands more than visibility—it requires clarity of identity, strength of partnerships, and the ability to evolve with purpose. We help organisations articulate their brand, build meaningful collaborations, and drive transformation initiatives with strategic intent.'),
      { type: 'service_detail_grid', data: {
        left_title: 'What We Do',
        left_items: [
          'Define and refine brand positioning and narrative',
          'Enable strategic partnerships and collaborations',
          'Support business and organisational transformation initiatives',
          'Align brand, strategy, and execution',
          'Strengthen market presence and differentiation',
        ],
        right_title: 'Outcomes You Can Expect',
        right_items: [
          'Clear and compelling brand identity',
          'Stronger market visibility and differentiation',
          'High-value strategic partnerships',
          'Structured and effective transformation outcomes',
          'Enhanced long-term relevance and adaptability',
        ],
        ideal_title: 'Ideal For',
        ideal_items: [
          'Organisations redefining their market positioning',
          'Businesses seeking strategic collaborations',
          'Companies undergoing transformation',
          'Leadership teams driving change and growth',
        ],
      }},
      ctaConsult('Transform your brand and reach.', 'Transform your brand, expand your reach, and lead your market with strategic direction.'),
    ],
  },
];

function heroService({ eyebrow, heading, subtitle, bg }) {
  return { type: 'hero', data: {
    eyebrow, heading, heading_accent: '',
    description: subtitle,
    btn1_text: '', btn1_link: '', btn2_text: '', btn2_link: '',
    bg_image_url: bg,
    overlay_opacity: 0.55, text_align: 'center', text_color: '#ffffff',
  }};
}
function leadPara(p1, p2) {
  const html = `<p class="lead-text">${p1}</p>` + (p2 ? `<p style="color:var(--gray-500);font-size:.94rem;line-height:1.85;margin-bottom:1.5rem;">${p2}</p>` : '');
  return { type: 'rich_text', data: { html } };
}
function ctaConsult(heading, subtext) {
  return { type: 'cta', data: {
    heading, subtext,
    btn_text: 'Connect for Consulting →', btn_link: '/mentoring-form.html',
    bg_color: '#0a7575',
  }};
}

// SQL-escape: replace ' with ''
function sqlEsc(s) { return String(s).replace(/'/g, "''"); }

const lines = [
  '-- Migration 008: seed CMS pages from existing static service pages',
  '-- Auto-generated by db/migrations/008_seed_pages.js',
  '',
];

for (const p of pages) {
  const sectionsJson = sqlEsc(JSON.stringify(p.sections));
  lines.push(
    `INSERT INTO cms_pages (slug, title, description, sections_json, status) VALUES`,
    `  ('${sqlEsc(p.slug)}', '${sqlEsc(p.title)}', '${sqlEsc(p.description)}', '${sectionsJson}', 'published')`,
    `  ON CONFLICT(slug) DO UPDATE SET`,
    `    title=excluded.title, description=excluded.description,`,
    `    sections_json=excluded.sections_json, status='published',`,
    `    updated_at=datetime('now');`,
    ''
  );
}

// Redirect rules — old paths → /p/...
const redirects = [
  ['/services.html',                '/p/services'],
  ['/business-consulting.html',     '/p/business-consulting'],
  ['/startup-mentoring.html',       '/p/startup-mentoring'],
  ['/academic-empowerment.html',    '/p/academic-empowerment'],
  ['/training-programs.html',       '/p/training-programs'],
  ['/risk-compliance-funding.html', '/p/risk-compliance-funding'],
  ['/branding-transformation.html', '/p/branding-transformation'],
];
lines.push('-- Redirects from old static paths');
for (const [src, dst] of redirects) {
  lines.push(
    `INSERT INTO redirects (source_path, target_url, status_code, is_active) VALUES`,
    `  ('${src}', '${dst}', 301, 1)`,
    `  ON CONFLICT(source_path) DO UPDATE SET target_url=excluded.target_url, status_code=301, is_active=1, updated_at=datetime('now');`,
    ''
  );
}

const outPath = path.join(__dirname, '008_seed_pages.sql');
fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${outPath} (${lines.length} lines)`);
