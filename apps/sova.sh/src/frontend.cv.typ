// CV source for Sergey Sova. Compiled to PDF via scripts/build-cv.ts
// (typst npm package — no browser/puppeteer involved).

#set page(width: 210mm, height: 297mm, margin: (x: 18mm, y: 14mm))
#set text(size: 9.5pt, lang: "en")
#set par(leading: 0.5em, justify: false)
#set list(indent: 0.8em, spacing: 0.35em)

#let accent = rgb("#4f46e5")
#let muted = rgb("#64748b")

#let section(title) = [
  #v(0.32em)
  #block(text(size: 9pt, weight: "bold", tracking: 0.08em, fill: muted)[#upper(title)])
  #v(-0.3em)
  #line(length: 100%, stroke: 0.5pt + luma(220))
  #v(0.1em)
]

// One job entry. `body` holds the bullet list (and, for multi-project
// roles, nested sub-headings + their own bullet lists).
#let job(company, location, blurb: none, title, dates, body, stack: none) = [
  #block(above: 0.5em, below: 0.15em)[
    #text(weight: "bold", size: 10.5pt)[#company] #text(fill: muted)[— #emph(location)]
    #if blurb != none [
      #v(0.1em)
      #text(size: 8.5pt, fill: muted, style: "italic")[#blurb]
    ]
    #v(0.1em)
    #text(weight: "bold")[#title] #text(fill: muted)[· #emph(dates)]
  ]
  #body
  #if stack != none [
    #v(0.15em)
    #text(size: 8.5pt, fill: muted)[_Tech stack_: #stack]
  ]
]

#let subproject(name, desc) = [
  #v(0.2em)
  #text(weight: "bold", size: 9pt)[#name] #text(fill: muted)[— #desc]
]

// ---------------------------------------------------------------------

#align(center)[
  #text(size: 22pt, weight: "bold", tracking: 0.02em)[SERGEY SOVA]
  #v(0.15em)
  #text(size: 11pt, fill: accent, weight: "medium")[Senior Frontend Engineer]
  #v(0.1em)
  #text(size: 9pt, fill: muted)[Armenia (Remote / Relocation-ready)]
  #v(0.2em)
  #text(size: 8.5pt)[
    +37455544011 ~ work\@sergeysova.com ~
    #link("https://github.com/sergeysova")[GitHub] ~
    #link("https://linkedin.com/in/sergeysova")[LinkedIn]
  ]
]

#v(0.3em)
#line(length: 100%, stroke: 0.5pt + luma(200))

#section[Summary]

Product-focused *Senior Frontend Engineer* with 10+ years of experience
building modern web applications and UI platforms. Specialized in
*React*, *TypeScript*, and *Effector*, with strong skills in frontend
architecture, component libraries, and performance optimization. Proven
success in startup environments — from launching video generation tools
to building flow editors — with a deep understanding of
business-technical alignment, team collaboration, and cost-saving
design. Contributor to OSS, mentor, and architectural decision maker.

#section[Skills]

- *Languages*: TypeScript, JavaScript (ES6+), HTML, CSS, Node.js
- *Frontend*: React, Effector, Redux, Next.js
- *State Management*: Effector, Redux, MobX, Nanostores
- *Tooling*: Vite, Webpack, ESLint, Prettier, Remotion, Electron, Git
- *Testing*: Vitest, Jest, React Testing Library, Puppeteer
- *Architecture*: Modular/FSD, DDD, SSR, CLI tools, Microfrontends
- *Soft Skills*: Mentoring, Hiring, Communication, Product-thinking

#section[Professional Experience]

#job(
  "Performante", "Remote (Armenia)",
  blurb: "AI tools for automating video content creation, including platforms like BigMotion.ai and ScreenStory.",
  "Senior Frontend Engineer", "June 2023 – Mar 2025",
  stack: "React, TypeScript, Effector, FeatureSliced, Electron, Node.js, Serverless",
)[
  #subproject("ScreenStory", "Desktop video editing app with Electron + React")
  - Refactored legacy UI core and implemented timeline editor (snapping, dragging, resizing)
  - Built modular UI controls using Effector → reduced bugs by *40%*
  - Introduced test coverage and stabilized release process
  - Mentored junior → promoted to senior

  #subproject("BigMotion.ai", "AI platform for short video generation")
  - Designed frontend architecture for AI video generation pipeline
  - Integrated Cloudflare to reduce infra costs → saved *50%*
  - Created ADRs, conducted interviews, helped scale product team
  - Supported rapid iteration with maintainable codebase
]

#job(
  "Selzy", "Remote",
  blurb: "AI-powered email marketing platform offering automation, segmentation, and real-time analytics for small and medium-sized businesses.",
  "Senior Frontend Developer", "Sep 2022 – Apr 2023",
  stack: "React, TypeScript, Redux, Webpack, Jest, Node.js",
)[
  - Built visual *flow editor* for email automation → opened new monetization channel
  - Introduced testing culture → improved reliability, reduced client churn
  - Implemented i18n → enabled international expansion
]

#job(
  "Haiku", "Remote",
  blurb: "Remote engineering talent for startups and growing companies.",
  "Chief Technical Officer", "Oct 2021 – Sep 2022",
  stack: "React, TypeScript, Effector, Webpack, Jest",
)[
  - Managed 5 frontend teams, aligned stacks (React, Effector, TS)
  - Conducted final tech interviews, built team development plan
  - Mentored leads, standardized architecture and component design
  - Wrote internal guides and ran internal workshops
]

#job(
  "Mission:Luna", "St Petersburg, Russia",
  blurb: "Internal tools for business process automation.",
  "Head of Web Development", "Nov 2020 – Oct 2021",
  stack: "React, TypeScript, Effector, FeatureSliced, Webpack, Jest, Testing Library",
)[
  - Launched frontend team from scratch: hired, onboarded, set up review processes and code standards
  - Introduced internal dev handbook and CI flows → accelerated onboarding
  - Built structured review process and backend API spec approval
  - Implemented code base for initial three projects
]

#job(
  "Redmadrobot", "St Petersburg, Russia",
  blurb: "Leading Russian digital agency with enterprise clients.",
  "Frontend Lead", "Jul 2019 – Nov 2020",
  stack: "React, TypeScript, Atomic Design, Feature-Sliced",
)[
  - Formalized review pipeline (API, code, release) → improved delivery quality
  - Delivered multiple Javascript-based projects to production
  - Conducted internal tech syncs, mentored devs in Atomic Design and Feature-Slices
  - Organized the first public Frontend Meetup in St. Petersburg
]

#job(
  "Yandex LLC", "St Petersburg, Russia",
  blurb: "Largest Russian tech company building search and cloud services.",
  "Senior Frontend Developer", "Sep 2017 – Sep 2018",
  stack: "React, TypeScript, Redux, Webpack, Jest, Testing Library, Node.js",
)[
  - Built frontend project from scratch using React and Node.js for internal admin tools
  - Designed REST-like APIs, integrated Postgres and Redis for caching and auth
  - Implemented first valuable product version and tested on real users using A/B
  - Mentored junior devs and spoke at React meetups on frontend architecture
]

#job(
  "KORUS Consulting CIS", "St Petersburg, Russia",
  blurb: "IT integrator working with enterprise clients in fintech and logistics.",
  "Lead Frontend Engineer", "Jan 2017 – Aug 2017",
  stack: "React, TypeScript, Webpack",
)[
  - Created component library in React with dark/light theme support (Atomic Design)
  - Delivered enterprise app with CryptoPro token support for enterprise client
]

#job(
  "The Recon Group Inc.", "St Petersburg, Russia",
  "Senior Frontend Developer", "Sep 2016 – Jan 2017",
  stack: "React, TypeScript, Redux, Webpack",
)[
  - Built new distributed storage management platform using React and Redux
  - Tested it with enterprise clients using A/B
  - Introduced modular architecture and testing with Jest
]

#job(
  "4xxi", "St Petersburg, Russia",
  "Frontend Developer", "Apr 2016 – Sep 2016",
  stack: "React, TypeScript, Webpack",
)[
  - Maintained and extended React-based financial dashboard
  - Reviewed and improved performance of the frontend
  - Managed small frontend team and modernized Webpack config
]

#job(
  "akme.info", "St Petersburg, Russia",
  "Fullstack Developer", "Mar 2015 – Feb 2016",
  stack: "Angular, React, Typescript, Webpack, CSS-in-JS",
)[
  - Migrated legacy Ruby on Rails app to SPA (React + Webpack)
  - Introduced development processes and code review culture
  - Developed components, handled UI/UX and API integration
]

#job(
  "M.Finance Group LLC", "Pyatigorsk, Russia",
  "PHP Developer", "Mar 2014 – Aug 2014",
)[
  - Developed e-commerce websites on OpenCart from scratch
  - Maintained Red5 video streaming services and internal Node.js tools
]

#job(
  "Stroimasters LLC", "Pyatigorsk, Russia",
  "Web Developer", "Apr 2012 – Feb 2014",
)[
  - Upgraded existing e-commerce platforms using PHP, OpenCart
  - Migrated legacy MySQL backend to MongoDB
  - Built mobile-first UI for main company website
]

#section[Education]

*FGBOU SPO "GK"* — Bachelor's Degree · Technician, Computer Software and
Multimedia Applications · 2009–2013

#section[Languages]

- Russian: Native
- English: B2

#section[Additional]

- OSS: Contributor to Effector ecosystem
- Remote-first, async-friendly communicator
- Open to relocation
