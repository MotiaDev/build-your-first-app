import { workbenchXPath, TutorialStep } from '@motiadev/workbench'

export const steps: TutorialStep[] = [
  {
    title: 'Pet Management AI Agents Tutorial',
    image: {
      height: 200,
      src: 'https://github.com/MotiaDev/motia/raw/main/packages/docs/public/github-readme-banner.png',
    },
    description: () => (
      <p>
        Welcome to the Pet Management AI Agents Tutorial! This comprehensive guide demonstrates how to build an intelligent 
        pet management system with Motia, featuring AI-driven decision making, workflow automation, and visible staff action triggers.
        <br />
        <br />
        You'll learn about:
        <ul>
          <li>🤖 <b>AI Agents</b> - Making intelligent decisions for pet health and adoption</li>
          <li>🔄 <b>Orchestrator</b> - Central workflow control with guard enforcement</li>
          <li>📋 <b>Staff Automation</b> - Automated task scheduling and management</li>
          <li>🛡️ <b>Guard Enforcement</b> - Business rule validation and error handling</li>
        </ul>
      </p>
    ),
  },

  // Setup Requirements

  {
    title: '⚙️ Setup: OpenAI API Key Required',
    link: 'https://platform.openai.com/api-keys',
    description: () => (
      <p>
        <b>Important!</b> This tutorial uses AI agents that require an OpenAI API key.
        <br />
        <br />
        <b>To set up your environment:</b>
        <ol>
          <li>- Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
          <li>- Create a <code>.env</code> file in the project root directory</li>
          <li>- Add this line: <code>OPENAI_API_KEY=your_api_key_here</code></li>
          <li>- Restart the Workbench server if it's already running</li>
        </ol>
        <br />
        Without this API key, the AI agents (Health Review, Adoption Review, Profile Enrichment) won't work.
        <br />
        <br />
        💡 You can still explore the rest of the tutorial, but AI-powered features will skip their processing.
      </p>
    ),
  },

  // Pet Management Flow Overview

  {
    elementXpath: workbenchXPath.flows.node('tscreatepet'),
    title: 'Pet Creation API',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's start by examining the Pet Creation API Step. This endpoint allows you to create new pets in the system
        and automatically triggers the pet lifecycle workflow.
        <br />
        <br />
        When a pet is created, it immediately triggers AI profile enrichment and sets up feeding reminders,
        demonstrating Motia's event-driven architecture.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.links.flows },
      { type: 'click', selector: workbenchXPath.flows.dropdownFlow('TsPetManagement') },
    ],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tscreatepet'),
    title: 'Code Preview',
    description: () => <p>Clicking on this icon will allow you to visualize the source code for the Pet Creation Step.</p>,
    before: [
      {
        type: 'click',
        selector: workbenchXPath.closePanelButton,
        optional: true,
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Step Source Code',
    description: () => (
      <p>
        This is the source code for the Pet Creation API Step. You can see the complete implementation
        including configuration, request validation, business logic, and event emission.
        <br />
        <br />
        The code is organized with features that you can click through to understand different aspects
        of the step implementation.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tscreatepet') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Creation Configuration',
    description: () => (
      <div>
        <p>
          The Pet Creation API Step demonstrates Motia's API configuration capabilities.
          <br />
          <br />
          Key configuration attributes:
        </p>
        <ul>
          <li>
            <b>type: 'api'</b> - Declares this as an API endpoint
          </li>
          <li>
            <b>path: '/ts/pets'</b> - The HTTP endpoint URL
          </li>
          <li>
            <b>method: 'POST'</b> - HTTP method for creating pets
          </li>
          <li>
            <b>emits: ['ts.pet.created']</b> - Emits events to trigger other steps
          </li>
        </ul>
        <br />
        When a pet is created, it emits a <b>ts.pet.created</b> event that triggers
        AI profile enrichment and feeding reminder setup.
      </div>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tscreatepet') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },


  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Request Body',
    link: 'https://zod.dev',
    description: () => (
      <p>
        The <b>bodySchema</b> attribute will define the shape of the request body.
        <br />
        <br />
        <i>💡 Both the request body and response payload are defined by zod schemas</i>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('request-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Response Payload',
    link: 'https://zod.dev',
    description: () => (
      <p>
        Through the <b>responseSchema</b> attribute you can declare the different type of http responses based on the
        http status code.
        <br />
        <br />
        <i>💡 Both the request body and response payload are defined by zod schemas</i>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('success-response') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Driven Architecture',
    description: () => (
      <p>
        Motia allows you to interact between Steps or flows through an event driven architecture.
        <br />
        <br />
        In order to connect your Steps during runtime you will use the <b>emits</b> and <b>subscribes</b> attributes.
        <br />
        <br />
        Through the <b>emits</b>, you can specify a list of topics that your Step emits for others to <i>subscribe</i>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('event-emission') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Step Handler',
    description: () => (
      <p>
        Now that we've covered how to declare a Step, let's dive into the <b>Step Handler</b>.<br />
        <br />
        Handlers are essential for the execution of your Step. For API Steps, the handler will receive the request
        object as the first argument, followed by a second argument that provides access to the <b>logger</b>,{' '}
        <b>event emitter</b>, <b>state manager</b>, and <b>trace id</b>.<br />
        <br />
        💡 We will cover these in depth further down the tutorial.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('pet-creation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Logger',
    description: () => (
      <p>
        We recommend using the provided <b>logger</b> util in order to guarantee observability through Motia's
        ecosystem.
        <br />
        <br />
        You can use logger similar to <i>console.log</i> for js or <i>print</i> for python, but with enhanced utilities,
        such as being able to provide additional context.
        <br />
        <br />
        Motia will take care of the rest to provide the best experience to visualize your logs and tie them through
        tracing.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('logging') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'HTTP Response',
    description: () => (
      <p>
        Now let's wrap our API Step and return a response.
        <br />
        <br /> You simply need to return an object that complies with one of the <b>responseSchema</b> definitions
        declared in your Step configuration.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('success-response') }],
  },

  // Section 4: AI Profile Enrichment (Automatic AI Agent)

  {
    elementXpath: workbenchXPath.flows.node('tsaiprofileenrichment'),
    title: 'AI Profile Enrichment',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Welcome to the AI Agents section! Let's start with <b>AI Profile Enrichment</b> - an automatic AI agent that
        enriches every new pet with a detailed profile using OpenAI.
        <br />
        <br />
        This Event Step automatically triggers when a pet is created and generates:
        <ul>
          <li><b>bio</b> - A warm, engaging description for potential adopters</li>
          <li><b>breedGuess</b> - AI's best guess at the breed or mix</li>
          <li><b>temperamentTags</b> - Personality traits like "friendly", "energetic"</li>
          <li><b>adopterHints</b> - Practical advice for potential adopters</li>
        </ul>
        <br />
        💡 This is a <b>non-routing AI agent</b> - it generates content but doesn't make workflow decisions.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tsaiprofileenrichment'),
    title: 'Code Preview',
    description: () => <p>Click this icon to view the source code for the AI Profile Enrichment Step.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Profile Enrichment Source Code',
    description: () => (
      <p>
        This is the source code for the AI Profile Enrichment agent. It demonstrates how AI can
        automatically enhance your data without blocking the main workflow.
        <br />
        <br />
        The agent subscribes to <b>ts.pet.created</b> events and runs asynchronously, so pet creation
        returns immediately while the AI works in the background.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsaiprofileenrichment') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step Configuration',
    description: () => (
      <p>
        The configuration defines this as an Event Step that subscribes to pet creation events.
        <br />
        <br />
        Notice it <b>subscribes</b> to <b>ts.pet.created</b> but doesn't emit any events itself - this is a
        pure data enrichment agent.
        <br />
        <br />
        💡 Event Steps are triggered internally by other steps emitting to their subscribed topics.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Key Validation',
    description: () => (
      <p>
        Before calling OpenAI, the agent checks for the <b>OPENAI_API_KEY</b> environment variable.
        <br />
        <br />
        This is a best practice for external API integrations - fail fast with clear error messages
        if credentials are missing.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('api-key-check') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Prompt Engineering',
    description: () => (
      <p>
        The prompt is carefully crafted to get structured, adoption-focused content from the AI.
        <br />
        <br />
        Key elements:
        <ul>
          <li>Clear instructions on what fields to generate</li>
          <li>Specific tone guidance ("warm, engaging")</li>
          <li>Expected output format (JSON)</li>
          <li>Context about the use case (adoption)</li>
        </ul>
        <br />
        💡 Good prompts are specific about format, tone, and content expectations.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('ai-prompt') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Calling OpenAI API',
    description: () => (
      <p>
        The agent makes an HTTP request to OpenAI's GPT-3.5 model with the prepared prompt.
        <br />
        <br />
        Configuration includes:
        <ul>
          <li><b>model</b>: gpt-3.5-turbo (fast and cost-effective)</li>
          <li><b>temperature</b>: 0.7 (balanced creativity)</li>
          <li><b>max_tokens</b>: 500 (controls response length)</li>
        </ul>
        <br />
        The response is validated and parsed before use.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('openai-call') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Error Handling with Fallback',
    description: () => (
      <p>
        Robust error handling ensures pets always get a profile, even if the AI fails.
        <br />
        <br />
        If OpenAI is unavailable or returns invalid data, the agent creates a basic fallback profile.
        This ensures the workflow continues smoothly rather than failing completely.
        <br />
        <br />
        💡 Always have fallback strategies for external dependencies to keep your system resilient.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('error-handling') }],
  },

  // Section 5: AI Health Review Agent (Agentic Routing)

  {
    elementXpath: workbenchXPath.flows.node('tshealthreviewagent'),
    title: 'AI Health Review Agent',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Now let's explore <b>Agentic Decision Making</b>! This is where AI actively chooses which path
        the workflow should take based on pet health data.
        <br />
        <br />
        The Health Review Agent is an <b>API Step</b> that staff can call to get AI-powered health assessments.
        The AI analyzes the pet's symptoms and chooses from predefined actions:
        <ul>
          <li><b>emit.health.treatment_required</b> - Pet needs medical treatment → orchestrator → under_treatment</li>
          <li><b>emit.health.no_treatment_needed</b> - Pet is healthy → orchestrator → stays healthy</li>
        </ul>
        <br />
        💡 This is <b>agentic routing</b> - the AI makes decisions that control workflow state transitions.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tshealthreviewagent'),
    title: 'Code Preview',
    description: () => <p>Click this icon to view the source code for the Health Review Agent Step.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Health Review Agent Source Code',
    description: () => (
      <p>
        This is the source code for the AI Health Review Agent - a RESTful API endpoint that uses AI
        to make routing decisions in the workflow.
        <br />
        <br />
        Unlike the Profile Enrichment agent, this one makes <b>decisions that affect workflow state</b>,
        choosing which emit to fire based on the pet's health condition.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tshealthreviewagent') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Configuration',
    description: () => (
      <p>
        This is an <b>API Step</b> that staff can call via POST request to trigger a health review.
        <br />
        <br />
        Notice the <b>emits</b> array lists all possible events this agent can fire. The AI will
        choose exactly one based on the pet's health data.
        <br />
        <br />
        💡 Agent API endpoints provide explicit trigger points for AI decision making.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Validation',
    description: () => (
      <p>
        The agent validates the pet exists and is in the right status for a health review.
        <br />
        <br />
        Only pets in <b>healthy</b>, <b>in_quarantine</b>, or <b>available</b> status can be reviewed.
        This prevents reviewing pets that are already under treatment or adopted.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('pet-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Building Agent Context',
    description: () => (
      <p>
        The agent builds a comprehensive context object with all data the AI needs to make a decision:
        <ul>
          <li>Pet ID, species, age, weight</li>
          <li>Current symptoms array</li>
          <li>Health flags (special needs, etc.)</li>
          <li>Current status</li>
        </ul>
        <br />
        This context is sent to OpenAI along with the available emits registry.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('agent-context') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Idempotency Check',
    description: () => (
      <p>
        Before calling OpenAI, the agent checks if we recently made a decision for this pet in the same state.
        <br />
        <br />
        If found, it returns the cached decision instead of making another expensive AI call.
        This improves performance and reduces API costs.
        <br />
        <br />
        💡 Idempotency is critical for agent endpoints that might be called multiple times.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('idempotency-check') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Decision Call',
    description: () => (
      <p>
        This is where the agent calls OpenAI to make the actual decision!
        <br />
        <br />
        The agent sends:
        <ul>
          <li>Pet health context (symptoms, age, species)</li>
          <li>Available emits with descriptions and effects</li>
          <li>Instructions to choose exactly one emit</li>
        </ul>
        <br />
        OpenAI responds with a structured decision including the chosen emit and rationale.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('ai-decision') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Decision Validation',
    description: () => (
      <p>
        After receiving the AI's decision, the agent validates it:
        <ul>
          <li>Check if the AI call succeeded</li>
          <li>Verify the chosen emit is in the registry</li>
          <li>Validate the response format</li>
        </ul>
        <br />
        If anything is invalid, return clear error messages. Never fire an unvalidated emit!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('decision-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Firing the Chosen Emit',
    description: () => (
      <p>
        Once validated, the agent fires the emit chosen by the AI.
        <br />
        <br />
        This emit goes to the orchestrator, which validates the transition and applies it.
        The AI's decision becomes a real workflow state change!
        <br />
        <br />
        💡 This is the key difference between non-routing (enrichment) and routing (decision) agents.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('emit-firing') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Response Formatting',
    description: () => (
      <p>
        The agent returns a detailed response showing what decision was made and why:
        <ul>
          <li><b>agentDecision</b>: chosen emit + rationale</li>
          <li><b>emitFired</b>: the actual topic that was emitted</li>
          <li><b>artifact</b>: metadata for tracking and debugging</li>
        </ul>
        <br />
        This transparency is crucial for understanding and debugging AI decisions.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('response-formatting') }],
  },

  // Section 6: AI Adoption Review Agent

  {
    elementXpath: workbenchXPath.flows.node('tsadoptionreviewagent'),
    title: 'AI Adoption Review Agent',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        The Adoption Review Agent is another agentic routing example, focusing on adoption readiness assessment.
        <br />
        <br />
        The AI evaluates if a pet has complete enough data for adoption and chooses:
        <ul>
          <li><b>emit.adoption.needs_data</b> - Missing info → adds needs_data flag</li>
          <li><b>emit.adoption.ready</b> - Complete profile → pet can be marked available</li>
        </ul>
        <br />
        This demonstrates how agents can enforce data quality requirements in workflows.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tsadoptionreviewagent'),
    title: 'Code Preview',
    description: () => <p>Click this icon to view the source code for the Adoption Review Agent Step.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Adoption Review Agent Source Code',
    description: () => (
      <p>
        This agent follows the same pattern as the Health Review Agent but focuses on data completeness
        rather than health assessment.
        <br />
        <br />
        It demonstrates how multiple AI agents can work together in the same workflow, each with
        their own decision domain and emit registry.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsadoptionreviewagent') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Adoption API Configuration',
    description: () => (
      <p>
        Similar to the Health Review Agent, this is an API Step that staff can trigger.
        <br />
        <br />
        The key difference is in the <b>emits</b> registry - these emits focus on adoption readiness
        rather than health status.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Profile Completeness Check',
    description: () => (
      <p>
        The agent checks if the pet has all necessary adoption data:
        <ul>
          <li>Complete AI-generated profile</li>
          <li>Breed guess present</li>
          <li>Temperament tags defined</li>
          <li>Adopter hints provided</li>
        </ul>
        <br />
        Only healthy or available pets can be reviewed for adoption.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('pet-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Decision with Profile Context',
    description: () => (
      <p>
        The AI receives the pet's profile completeness info and decides if it's adoption-ready.
        <br />
        <br />
        This shows how agents can make different types of decisions in the same system:
        <ul>
          <li>Health Review: symptom-based medical decisions</li>
          <li>Adoption Review: data quality and completeness decisions</li>
        </ul>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('ai-decision') }],
  },

  // Orchestrator

  {
    elementXpath: workbenchXPath.flows.node('tspetlifecycleorchestrator'),
    title: 'Pet Lifecycle Orchestrator',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        The Pet Lifecycle Orchestrator is the central brain of our system! It manages all pet status transitions
        and enforces business rules.
        <br />
        <br />
        Key responsibilities:
        <ul>
          <li><b>Status Management</b> - Controls pet lifecycle transitions</li>
          <li><b>Guard Enforcement</b> - Validates business rules</li>
          <li><b>Event Emission</b> - Triggers staff actions</li>
          <li><b>Automatic Progression</b> - Moves pets through stages</li>
        </ul>
        <br />
        💡 The orchestrator ensures data integrity and provides <b>visible workflow</b> by emitting
        events that trigger specific staff actions.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.node('tsdeletionreaper'),
    title: 'Deletion Reaper Cron Job',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        Let's explore the Deletion Reaper - a scheduled cron job that automatically cleans up soft-deleted pets!
        <br />
        <br />
        This demonstrates how <b>Cron Steps</b> enable automated maintenance tasks that run on a schedule,
        keeping your system clean and efficient without manual intervention.
        <br />
        <br />
        💡 Cron jobs are perfect for periodic cleanup, reporting, and maintenance tasks.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tsdeletionreaper'),
    title: 'Code Preview',
    description: () => <p>Click this icon to view the source code for the Deletion Reaper Cron Step.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Deletion Reaper Source Code',
    description: () => (
      <p>
        This is the source code for the Deletion Reaper cron job. It demonstrates how scheduled tasks
        can automate system maintenance.
        <br />
        <br />
        The job runs daily at 2:00 AM to permanently remove pets that have been soft-deleted and passed
        their retention period.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsdeletionreaper') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Schedule',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        <b>CRON</b> Steps are similar to the other primitives, they are composed by a configuration and a handler.
        <br />
        <br />
        The <b>CRON</b> Step config has a distinct attribute, the <b>cron</b> attribute, through this attribute you will
        define the cron schedule for your Step.
        <br />
        <br />
        For instance, in this example the cron schedule is configured to execute the Step handler daily at 2:00 AM. Let's
        take a look at the handler definition.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsdeletionreaper') },
      { type: 'click', selector: workbenchXPath.flows.feature('cron-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Step Handler',
    description: () => (
      <p>
        The <b>CRON</b> Step handler only receives one argument, which is the Motia context, if you recall the Motia
        context gives you access to utilities to emit <i>topics</i>, <i>log</i>, <i>manage state</i>, and it provides
        the <i>trace id</i> associated to your Step's execution.
        <br />
        <br />
        In this CRON Step example we are scanning for pets that have been soft deleted past their purge date, and
        permanently removing them from the system to maintain data hygiene.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },

  // Testing the Pet Management APIs

  {
    elementXpath: workbenchXPath.links.endpoints,
    title: 'Pet Management Endpoints',
    description: () => (
      <p>
        Let's test our Pet Management APIs! The <b>Endpoints</b> section shows all the HTTP endpoints
        we've created for pet management.
        <br />
        <br />
        Available endpoints:
        <ul>
          <li><b>POST /ts/pets</b> - Create new pets</li>
          <li><b>POST /ts/pets/:id/health-review</b> - AI health review</li>
          <li><b>POST /ts/pets/:id/adoption-review</b> - AI adoption review</li>
          <li><b>PUT /ts/pets/:id</b> - Update pet status</li>
        </ul>
        <br />
        💡 You can test all these endpoints directly from Workbench!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.endpoints.endpoint('POST', '/ts/pets'),
    title: 'Pet Creation Endpoint',
    description: () => (
      <p>
        Here's the Pet Creation endpoint! You can test creating pets with different characteristics
        and observe how the system automatically triggers AI enrichment and lifecycle progression.
        <br />
        <br />
        Try creating pets with:
        <ul>
          <li>Different species (dog, cat, bird, other)</li>
          <li>Symptoms for health testing</li>
          <li>Various ages and weights</li>
        </ul>
        <br />
        💡 Watch the logs to see the complete workflow in action!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.endpoints }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Endpoint Docs',
    description: () => (
      <p>
        This section will provide an overview of your API endpoint.
        <br />
        <br />
        It will display documentation on how to use the endpoint in the <b>Details</b> Tab, and a form to test the
        endpoint in the <b>Call</b> Tab.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') }],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'API Endpoint Test',
    description: () => (
      <p>
        This form will allow you to validate your API Step by executing an HTTP request against your API endpoint.
        <br />
        <br />
        You can also test your API endpoints using your terminal through the curl command.
        <br />
        <br />
        💡 Thanks to the <b>bodySchema</b> attribute from the API Step config, you are automatically provided with a
        sample request payload.
        <br />
        <br />
        <pre className="code-preview">
          <code className="language-bash">
            curl -X POST http://localhost:3000/ts/pets \<br />
            {'  '}-H "Content-Type: application/json" \<br />
            {'  '}-d '
            {JSON.stringify({
              name: 'Jack',
              species: 'dog',
              ageMonths: 24
            })}
            '
          </code>
        </pre>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.endpoints.callTab }],
  },
  {
    elementXpath: workbenchXPath.endpoints.playButton,
    title: 'API Endpoint Test',
    description: () => (
      <p>
        Once you've filled the request payload, you can click on the <b>Play</b> button to trigger an HTTP request
        against your API endpoint.
      </p>
    ),
    before: [
      {
        type: 'fill-editor',
        content: {
          name: 'Jack',
          species: 'dog',
          ageMonths: 24
        },
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Test Result',
    description: () => <p>Once your request has been resolved, you will see the response from here.</p>,
    before: [{ type: 'click', selector: workbenchXPath.endpoints.playButton }],
  },

  // Tracing

  {
    elementXpath: workbenchXPath.bottomPanel,
    title: 'Tracing',
    description: () => (
      <p>
        Great! You have triggered your first flow, now let's take a look at our example flow behavior using Workbench's
        observability tools.
        <br />
        <br />
        Let's start with <b>tracing</b>, in this section you will be able to see all of your flow executions grouped by{' '}
        <b>trace id</b>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.tracing }],
  },
  {
    elementXpath: workbenchXPath.tracing.trace(1),
    title: 'Tracing Tool',
    description: () => (
      <p>
        Trace IDs are auto generated and injected throughout the execution of all Steps in your flow.
        <br />
        <br />
        Clicking on a trace item from this list will allow you to dive deeper into your flow behavior.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.tracing.trace(1) }],
  },
  {
    elementXpath: workbenchXPath.tracing.details,
    title: 'Trace Timeline',
    description: () => (
      <p>
        This section will show all Step executions associated to the selected trace, you will see a list of executed
        Steps and their sequencing over a <b>timeline</b>.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.tracing.timeline(1),
    title: 'Trace Timeline Segment',
    description: () => (
      <p>
        Each <b>timeline segment</b> will show you the time it took to execute each Step, you can click on any segment
        and dive even deeper into that specific Step execution logs.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Trace Details',
    description: () => (
      <p>
        This is the <b>Trace Details View</b>, this will allow you to look deeper into the logs raised during the
        execution of a Step.
        <br />
        <br />
        💡 This is a simplified version of the logs, if you wish to look further into a log you will need to use the{' '}
        <b>Logs Tool</b>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.tracing.timeline(1) }],
  },

  // Logs

  {
    elementXpath: workbenchXPath.logs.container,
    title: 'Logs',
    description: () => (
      <p>
        Let's take a look at your execution logs, click on this tab will take you to the <b>Logs Tool</b>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.logs }],
  },
  {
    elementXpath: workbenchXPath.logs.traceColumn(1),
    title: 'Filtering by Trace ID',
    description: () => (
      <p>
        Your log results will show their associated <b>Trace ID</b> in the third column, the <b>Trace ID</b> values are
        linked to update your search.
        <br />
        <br />
        💡 Clicking a <b>Trace ID</b> will narrow down your search to only show logs from that trace.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.logs.searchContainer,
    title: 'Search Criteria',
    description: () => (
      <p>
        By clicking the <b>Trace ID</b>, your search is updated to match results associated with that <b>Trace ID</b>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.logs.traceColumn(1) }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Logs',
    description: () => (
      <p>
        When you click on a log row, it will open the <b>Log Details View</b>.
        <br />
        <br />
        In here you will be able to look at your log details (<b>Log Level</b>, <b>Timestamp</b>, <b>Step Name</b>,{' '}
        <b>Flow Name</b>, and <b>Trace ID</b>), along with any additional context you've provided in your log call.
      </p>
    ),
  },


  // End of Tutorial

  {
    title: 'Congratulations! Pet Management Master 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed the Pet Management AI Agents Tutorial!
        <br />
        <br />
        You've learned how to build an intelligent pet management system with:
        <ul>
          <li>🤖 <b>AI Profile Enrichment</b> - Automatic content generation with OpenAI</li>
          <li>🧠 <b>AI Health Review Agent</b> - Intelligent symptom-based decision making</li>
          <li>📊 <b>AI Adoption Review Agent</b> - Data quality assessment and routing</li>
          <li>🔄 <b>Pet Lifecycle Orchestrator</b> - Central workflow control with guard enforcement</li>
          <li>📋 <b>Staff Automation</b> - Treatment scheduling, adoption posting, recovery monitoring</li>
          <li>🛡️ <b>Guard Enforcement</b> - Business rule validation and idempotency</li>
          <li>⚡ <b>Event-Driven Architecture</b> - Seamless workflow orchestration</li>
          <li>🔍 <b>Decision Artifacts</b> - Complete AI decision tracking and debugging</li>
        </ul>
        <br />
        This demonstrates how Motia transforms simple CRUD APIs into intelligent workflow automation platforms
        where AI agents make decisions that guide staff through every step of complex processes.
        <br />
        <br />
        Explore more examples in the{' '}
        <a href="https://github.com/MotiaDev/motia-examples" target="_blank">
          Motia Examples Repository
        </a>{' '}
        or dive deeper into{' '}
        <a href="https://www.motia.dev/docs/getting-started/core-concepts" target="_blank">
          Motia's core concepts
        </a>
        .
        <br />
        <br />
        Join our{' '}
        <a href="https://discord.com/invite/nJFfsH5d6v" target="_blank">
          Discord community
        </a>{' '}
        to share what you've built with Motia!
        <br />
        <br />
        Thank you for exploring intelligent workflow automation with Motia! 🐾
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
]





