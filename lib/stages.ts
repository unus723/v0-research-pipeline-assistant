export interface Stage {
  id: number
  title: string
  goal: string
  explanation: string
  guidance: {
    whyItMatters: string
    commonMistakes: string[]
    reviewerWarning: string
    requiredOutput: string
  }
}

export const stages: Stage[] = [
  {
    id: 0,
    title: "Project Setup",
    goal: "Establish the foundation, tooling, and workspace for the research project.",
    explanation:
      "Define how you will organize files, references, notes, and version control before starting any real research work.",
    guidance: {
      whyItMatters:
        "A clean setup prevents lost work and makes every later stage faster and reproducible.",
      commonMistakes: [
        "Skipping a reference manager",
        "No version control or backups",
        "Disorganized note structure",
      ],
      reviewerWarning: "Reviewers notice when reproducibility was an afterthought.",
      requiredOutput: "An organized project workspace and tooling checklist.",
    },
  },
  {
    id: 1,
    title: "Understand the Field",
    goal: "Build a broad mental map of the research domain and its key concepts.",
    explanation:
      "Survey the landscape: major themes, terminology, key venues, and influential authors in the area.",
    guidance: {
      whyItMatters: "You cannot find a meaningful gap without understanding the surrounding field.",
      commonMistakes: ["Diving too deep too early", "Ignoring foundational work", "Confusing jargon"],
      reviewerWarning: "Shallow domain understanding shows in weak motivation.",
      requiredOutput: "A concept map and glossary of the field.",
    },
  },
  {
    id: 2,
    title: "Observation",
    goal: "Capture concrete observations, patterns, or anomalies worth investigating.",
    explanation:
      "Record what you notice in practice, data, or literature that seems surprising, inconsistent, or unexplained.",
    guidance: {
      whyItMatters: "Strong research often starts from a sharp, real observation.",
      commonMistakes: ["Vague observations", "No supporting evidence", "Confirmation bias"],
      reviewerWarning: "Unsupported claims undermine credibility early.",
      requiredOutput: "A list of documented observations with evidence.",
    },
  },
  {
    id: 3,
    title: "Problem Statement",
    goal: "Articulate a clear, specific problem worth solving.",
    explanation: "Translate observations into a precise statement of the problem and why it matters.",
    guidance: {
      whyItMatters: "A crisp problem statement focuses the entire project.",
      commonMistakes: ["Too broad", "Solution disguised as a problem", "No stated impact"],
      reviewerWarning: "Ambiguous problems lead to unfocused contributions.",
      requiredOutput: "A one-paragraph problem statement.",
    },
  },
  {
    id: 4,
    title: "Literature Review",
    goal: "Systematically survey and synthesize related work.",
    explanation: "Find, read, and organize prior work to understand what has and has not been done.",
    guidance: {
      whyItMatters: "Reviewers expect you to know the state of the art.",
      commonMistakes: ["Listing instead of synthesizing", "Missing recent work", "No critical analysis"],
      reviewerWarning: "Missing key citations is a common rejection reason.",
      requiredOutput: "An annotated, organized literature summary.",
    },
  },
  {
    id: 5,
    title: "Gap Analysis",
    goal: "Identify the specific gap your work will address.",
    explanation: "Compare existing work against the problem to pinpoint what is missing or unsolved.",
    guidance: {
      whyItMatters: "The gap justifies why your research is needed.",
      commonMistakes: ["Manufactured gaps", "Gap too small", "Gap already filled"],
      reviewerWarning: "A weak gap signals incremental, low-impact work.",
      requiredOutput: "A clearly stated, defensible research gap.",
    },
  },
  {
    id: 6,
    title: "Research Question",
    goal: "Formulate precise, answerable research questions.",
    explanation: "Turn the gap into one or more focused questions that the study will answer.",
    guidance: {
      whyItMatters: "Research questions drive design and evaluation.",
      commonMistakes: ["Unanswerable questions", "Too many questions", "Yes/no questions"],
      reviewerWarning: "Vague questions produce vague conclusions.",
      requiredOutput: "A short list of research questions.",
    },
  },
  {
    id: 7,
    title: "Hypothesis",
    goal: "State testable hypotheses or expected outcomes.",
    explanation: "Where applicable, define hypotheses that your experiments can confirm or refute.",
    guidance: {
      whyItMatters: "Hypotheses make your reasoning falsifiable.",
      commonMistakes: ["Untestable hypotheses", "No clear variables", "Confirmation only"],
      reviewerWarning: "Unfalsifiable claims weaken scientific rigor.",
      requiredOutput: "A set of testable hypotheses.",
    },
  },
  {
    id: 8,
    title: "Research Design",
    goal: "Plan the methodology and overall study structure.",
    explanation: "Choose the approach, variables, controls, and evaluation strategy.",
    guidance: {
      whyItMatters: "A sound design determines whether results will be valid.",
      commonMistakes: ["No controls", "Mismatched methods", "Undefined metrics"],
      reviewerWarning: "Methodological flaws are hard to fix after data collection.",
      requiredOutput: "A documented research design plan.",
    },
  },
  {
    id: 9,
    title: "Data Collection / Setup",
    goal: "Gather data or build the experimental environment.",
    explanation: "Collect datasets or configure the systems and tools needed to run the study.",
    guidance: {
      whyItMatters: "Data quality bounds the quality of every result.",
      commonMistakes: ["Biased sampling", "Insufficient data", "Undocumented setup"],
      reviewerWarning: "Reviewers scrutinize data provenance and ethics.",
      requiredOutput: "A prepared dataset or reproducible environment.",
    },
  },
  {
    id: 10,
    title: "Method / Implementation",
    goal: "Build the core method, model, or system.",
    explanation: "Implement the approach you designed, keeping it reproducible and well documented.",
    guidance: {
      whyItMatters: "The implementation is the heart of your contribution.",
      commonMistakes: ["No documentation", "Hard-coded assumptions", "Untracked changes"],
      reviewerWarning: "Irreproducible implementations are increasingly rejected.",
      requiredOutput: "A working, documented implementation.",
    },
  },
  {
    id: 11,
    title: "Experiments",
    goal: "Run experiments to evaluate the method.",
    explanation: "Execute planned experiments and record results, configurations, and conditions.",
    guidance: {
      whyItMatters: "Experiments provide the evidence for your claims.",
      commonMistakes: ["No baselines", "Cherry-picked runs", "Unlogged parameters"],
      reviewerWarning: "Missing baselines invalidate comparisons.",
      requiredOutput: "Complete experimental results and logs.",
    },
  },
  {
    id: 12,
    title: "Statistical Validation",
    goal: "Verify that results are statistically meaningful.",
    explanation: "Apply appropriate statistical tests and report significance and effect sizes.",
    guidance: {
      whyItMatters: "Statistics separate real effects from noise.",
      commonMistakes: ["No significance tests", "Misused tests", "Ignoring variance"],
      reviewerWarning: "p-hacking and missing tests draw heavy criticism.",
      requiredOutput: "Statistical analysis with reported significance.",
    },
  },
  {
    id: 13,
    title: "Result Analysis",
    goal: "Interpret what the results mean.",
    explanation: "Explain findings, relate them to the research questions, and discuss implications.",
    guidance: {
      whyItMatters: "Interpretation turns numbers into knowledge.",
      commonMistakes: ["Overclaiming", "Ignoring negatives", "No connection to questions"],
      reviewerWarning: "Overstated conclusions are a frequent flag.",
      requiredOutput: "A clear analysis tied to your questions.",
    },
  },
  {
    id: 14,
    title: "Threats to Validity",
    goal: "Identify and discuss limitations and threats.",
    explanation: "Acknowledge internal, external, and construct validity concerns honestly.",
    guidance: {
      whyItMatters: "Honest limitations build trust with reviewers.",
      commonMistakes: ["Hiding limitations", "Generic threats", "No mitigations"],
      reviewerWarning: "Ignoring obvious threats signals weak rigor.",
      requiredOutput: "A threats-to-validity section.",
    },
  },
  {
    id: 15,
    title: "Contributions",
    goal: "Clearly state your contributions.",
    explanation: "Summarize what is new, useful, and validated in your work.",
    guidance: {
      whyItMatters: "Contributions are what reviewers evaluate.",
      commonMistakes: ["Vague contributions", "Overlapping with prior work", "Unsupported claims"],
      reviewerWarning: "Unclear novelty leads to rejection.",
      requiredOutput: "A concise list of contributions.",
    },
  },
  {
    id: 16,
    title: "Paper Outline",
    goal: "Structure the paper before writing.",
    explanation: "Draft section headings and the narrative flow of the manuscript.",
    guidance: {
      whyItMatters: "A strong outline makes writing far easier.",
      commonMistakes: ["No narrative arc", "Unbalanced sections", "Missing logic flow"],
      reviewerWarning: "Disorganized papers frustrate reviewers.",
      requiredOutput: "A complete section-level outline.",
    },
  },
  {
    id: 17,
    title: "Internal Review",
    goal: "Get feedback before submission.",
    explanation: "Have collaborators or mentors critically review the draft.",
    guidance: {
      whyItMatters: "Internal review catches issues early and cheaply.",
      commonMistakes: ["Reviewing too late", "Ignoring feedback", "No fresh eyes"],
      reviewerWarning: "Errors that internal review would catch look careless.",
      requiredOutput: "A revised draft incorporating feedback.",
    },
  },
  {
    id: 18,
    title: "Submission Planning",
    goal: "Choose a venue and prepare submission materials.",
    explanation: "Match the work to a suitable venue and meet its formatting and scope requirements.",
    guidance: {
      whyItMatters: "Venue fit strongly affects acceptance odds.",
      commonMistakes: ["Wrong venue", "Ignoring formatting", "Missing deadlines"],
      reviewerWarning: "Scope mismatch leads to desk rejection.",
      requiredOutput: "A target venue and submission checklist.",
    },
  },
  {
    id: 19,
    title: "Peer Review Tracking",
    goal: "Track the status and feedback of submissions.",
    explanation: "Monitor review timelines and organize reviewer comments as they arrive.",
    guidance: {
      whyItMatters: "Organized tracking keeps responses timely and complete.",
      commonMistakes: ["Losing track of versions", "Missing rebuttal windows", "Disorganized comments"],
      reviewerWarning: "Late or incomplete responses hurt your case.",
      requiredOutput: "A review-tracking record.",
    },
  },
  {
    id: 20,
    title: "Revision",
    goal: "Address reviewer feedback and improve the paper.",
    explanation: "Revise content and prepare a clear response to each reviewer comment.",
    guidance: {
      whyItMatters: "Thoughtful revisions often turn rejections into acceptances.",
      commonMistakes: ["Dismissing comments", "Partial fixes", "No response letter"],
      reviewerWarning: "Defensive responses alienate reviewers.",
      requiredOutput: "A revised paper and response letter.",
    },
  },
  {
    id: 21,
    title: "Publication and Extension",
    goal: "Publish the work and plan future directions.",
    explanation: "Finalize publication, share artifacts, and outline follow-up research.",
    guidance: {
      whyItMatters: "Dissemination and follow-up maximize impact.",
      commonMistakes: ["No artifact sharing", "Ignoring outreach", "No future plan"],
      reviewerWarning: "Unshared artifacts limit reproducibility and citations.",
      requiredOutput: "A published paper and extension roadmap.",
    },
  },
]
