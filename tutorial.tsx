import { workbenchXPath, TutorialStep } from '@motiadev/workbench'

export const steps: TutorialStep[] = [
  {
    title: 'Pet Management with Real-Time Streaming',
    image: {
      height: 200,
      src: 'https://github.com/MotiaDev/motia/raw/main/packages/docs/public/github-readme-banner.png',
    },
    description: () => (
      <p>
        Welcome to the Pet Management with Real-Time Streaming Tutorial! This guide demonstrates how to build an intelligent 
        pet management system with Motia's <b>native Streams API</b>, featuring real-time updates, AI-driven decision making, 
        and workflow automation.
        <br />
        <br />
        You'll learn about:
        <ul>
          <li>🌊 <b>Real-Time Streaming</b> - Server-sent events for live progress updates</li>
          <li>🤖 <b>AI Agents</b> - Making intelligent decisions for pet health and adoption</li>
          <li>🔄 <b>Orchestrator</b> - Central workflow control with guard enforcement</li>
          <li>📋 <b>Background Jobs</b> - Asynchronous processing with streaming updates</li>
          <li>⏰ <b>Cron Jobs</b> - Scheduled maintenance tasks</li>
        </ul>
        <br />
        💡 This tutorial extends the AI Agents pattern by adding <b>real-time streaming responses</b> that provide
        immediate feedback while background processes complete.
      </p>
    ),
  },

  // Pet Management Flow Overview

  {
    elementXpath: workbenchXPath.flows.node('tscreatepet'),
    title: 'Pet Creation API with Streaming',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's start by examining the Pet Creation API Step with <b>real-time streaming</b>! This endpoint creates new pets
        and returns an immediate stream response that updates in real-time as background jobs process.
        <br />
        <br />
        When a pet is created:
        <ul>
          <li>✅ API returns immediately with a stream result</li>
          <li>🔄 Background jobs update the stream with progress</li>
          <li>🤖 AI enrichment streams profile generation updates</li>
          <li>📋 Feeding reminder job streams quarantine status</li>
        </ul>
        <br />
        💡 This demonstrates <b>Motia's native Streams API</b> for real-time user feedback during async workflows.
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
    title: 'Step Source Code with Streaming',
    description: () => (
      <p>
        This is the source code for the Pet Creation API Step with <b>streaming support</b>. You can see the complete implementation
        including configuration, request validation, business logic, stream initialization, and event emission.
        <br />
        <br />
        Notice how the API uses <b>streams.petCreation.set()</b> to create an initial stream message that will be
        updated by background jobs as they process.
        <br />
        <br />
        💡 The stream provides immediate feedback to users while async workflows complete in the background.
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
    title: 'Request Validation',
    link: 'https://zod.dev',
    description: () => (
      <p>
        The Pet Creation API uses <b>Zod</b> for request validation. This ensures type safety and automatic
        validation of incoming data.
        <br />
        <br />
        The schema validates:
        <ul>
          <li><b>name</b> - Required string, trimmed</li>
          <li><b>species</b> - Enum of dog, cat, bird, or other</li>
          <li><b>ageMonths</b> - Positive integer</li>
          <li><b>weightKg</b> - Optional positive number</li>
          <li><b>symptoms</b> - Optional array of strings</li>
        </ul>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('request-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Creation Logic',
    description: () => (
      <p>
        The handler creates a new pet record using the validated data. It generates a unique ID,
        sets the initial status to 'new', and stores the pet in the TypeScript store.
        <br />
        <br />
        💡 The TSStore provides in-memory storage for the tutorial example.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('pet-creation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Emission',
    description: () => (
      <p>
        After creating the pet, the handler emits two events:
        <br />
        <br />
        <ul>
          <li><b>ts.pet.created</b> - Triggers AI profile enrichment</li>
          <li><b>ts.feeding.reminder.enqueued</b> - Triggers feeding reminder background job</li>
        </ul>
        <br />
        💡 This demonstrates Motia's event-driven architecture where one action triggers multiple workflows.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('event-emission') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Logging',
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
    title: 'Stream Response',
    description: () => (
      <p>
        The API returns a <b>stream result</b> immediately after creating the pet. This stream can be consumed
        by clients to receive real-time updates as background jobs process.
        <br />
        <br />
        The initial stream message includes:
        <ul>
          <li>Pet creation confirmation</li>
          <li>Pet ID, name, species, age</li>
          <li>Initial status ('new')</li>
        </ul>
        <br />
        💡 Background jobs will update this stream with quarantine status, health checks, and enrichment progress.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('success-response') }],
  },

  // AI Agents

  {
    elementXpath: workbenchXPath.flows.node('tshealthreviewagent'),
    title: 'AI Health Review Agent',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's explore the AI Health Review Agent! This is where the magic happens - AI agents make intelligent decisions
        about pet health based on symptoms, age, and other factors.
        <br />
        <br />
        The Health Review Agent uses OpenAI to analyze pet data and choose from predefined actions:
        <ul>
          <li><b>emit.health.treatment_required</b> - Pet needs medical treatment</li>
          <li><b>emit.health.no_treatment_needed</b> - Pet is healthy</li>
        </ul>
        <br />
        💡 This demonstrates <b>agentic decision making</b> where AI chooses the next action in the workflow.
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
        This is the source code for the AI Health Review Agent. This step demonstrates how AI agents
        can make intelligent decisions in your workflow.
        <br />
        <br />
        The agent analyzes pet health data and chooses the appropriate action to emit, effectively
        making decisions that drive the workflow forward.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tshealthreviewagent') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Agent Configuration',
    description: () => (
      <p>
        The Health Review Agent is configured as an API step that can be triggered manually or automatically.
        <br />
        <br />
        It emits health assessment results that the orchestrator uses to make lifecycle decisions.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Input Validation',
    description: () => (
      <p>
        The agent validates the pet ID parameter and ensures the pet exists before proceeding with
        the health review.
        <br />
        <br />
        💡 Proper validation prevents errors and ensures data integrity throughout the workflow.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('input-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'AI Agent Handler',
    description: () => (
      <p>
        The handler uses OpenAI to analyze pet health data and make intelligent decisions.
        <br />
        <br />
        The AI agent considers:
        <ul>
          <li>Pet symptoms and health history</li>
          <li>Age and species-specific health risks</li>
          <li>Current health status</li>
        </ul>
        <br />
        Based on this analysis, it chooses the appropriate action to emit.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'State Management',
    link: 'https://www.motia.dev/docs/concepts/state-management',
    description: () => (
      <p>
        The agent caches recent AI decisions in <b>State</b> to prevent duplicate processing
        and improve performance for repeated health reviews.
        <br />
        <br />
        💡 State management helps optimize AI API calls and provides consistent results.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('state') }],
  },

  // Stream Configuration

  {
    elementXpath: workbenchXPath.flows.node('petcreation'),
    title: 'Pet Creation Stream Configuration',
    link: 'https://www.motia.dev/docs/concepts/streams',
    description: () => (
      <p>
        Before we dive into background jobs, let's look at the <b>Stream Configuration</b>! Motia's native
        Streams API enables real-time updates via Server-Sent Events (SSE).
        <br />
        <br />
        The Pet Creation Stream:
        <ul>
          <li>📝 Defines the stream schema with Zod</li>
          <li>🔗 Available as <code>context.streams.petCreation</code></li>
          <li>🌊 Supports real-time updates from multiple steps</li>
          <li>📡 Automatically handles SSE connections</li>
        </ul>
        <br />
        💡 Streams provide a unified channel for real-time updates across your entire workflow!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('petcreation'),
    title: 'Stream Code Preview',
    description: () => <p>Click this icon to view the stream configuration.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Stream Configuration Code',
    description: () => (
      <p>
        This is the stream configuration that enables real-time updates. Notice:
        <br />
        <br />
        <ul>
          <li><b>name: 'petCreation'</b> - Stream identifier</li>
          <li><b>schema</b> - Zod schema defining update structure</li>
          <li><b>storageType: 'default'</b> - Uses Motia's default storage</li>
        </ul>
        <br />
        💡 Once configured, any step can push updates to this stream using <code>streams.petCreation.set()</code>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('petcreation') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Stream Schema',
    description: () => (
      <p>
        The stream schema defines what data can be pushed to the stream. In this case, it's a simple
        message object that can contain any string update.
        <br />
        <br />
        This flexible schema allows different background jobs to push various types of updates
        (creation, quarantine, health checks, enrichment) through a single stream.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('schema-definition') },
    ],
  },

  // Streaming Background Job

  {
    elementXpath: workbenchXPath.flows.node('tssetnextfeedingreminder'),
    title: 'Feeding Reminder with Stream Updates',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Now let's explore how background jobs update the stream! The Feeding Reminder job demonstrates
        <b>real-time streaming updates</b> from async workflows.
        <br />
        <br />
        This background job:
        <ul>
          <li>🔄 Subscribes to 'ts.feeding.reminder.enqueued' event</li>
          <li>📝 Sets feeding schedule and welcome notes</li>
          <li>🏥 Updates pet status to 'in_quarantine'</li>
          <li>🌊 <b>Streams real-time updates</b> about quarantine and health checks</li>
        </ul>
        <br />
        💡 The stream updates provide live feedback to users while the background job processes!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tssetnextfeedingreminder'),
    title: 'Code Preview',
    description: () => <p>Click this icon to view how background jobs update streams in real-time.</p>,
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Background Job with Streaming',
    description: () => (
      <p>
        This background job demonstrates how to update streams from event handlers. Notice the
        <b>streams.petCreation.set()</b> calls that push real-time updates to the client.
        <br />
        <br />
        The job streams multiple updates:
        <ul>
          <li>Quarantine entry confirmation</li>
          <li>Health check results (based on symptoms)</li>
          <li>Final status (healthy or needs treatment)</li>
        </ul>
        <br />
        💡 Each stream update is sent immediately to connected clients via Server-Sent Events (SSE).
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tssetnextfeedingreminder') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Stream Updates in Handler',
    description: () => (
      <p>
        The handler uses <b>streams.petCreation.set(traceId, 'message', data)</b> to push updates.
        <br />
        <br />
        Key parameters:
        <ul>
          <li><b>traceId</b> - Links stream updates to the original request</li>
          <li><b>'message'</b> - The stream key/channel</li>
          <li><b>data</b> - The update payload matching the stream schema</li>
        </ul>
        <br />
        💡 Multiple background jobs can update the same stream, creating a unified real-time experience.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('handler') },
    ],
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
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
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
    title: 'Stream Response Result',
    description: () => (
      <p>
        Once your request has been resolved, you will see the <b>stream response</b> here.
        <br />
        <br />
        Notice the response includes:
        <ul>
          <li><b>traceId</b> - For tracking the request</li>
          <li><b>message</b> - Initial stream update</li>
          <li><b>Stream metadata</b> - For SSE connection</li>
        </ul>
        <br />
        💡 You can connect to this stream via SSE to receive real-time updates as background jobs process!
        <br />
        <br />
        Try: <code>curl -N http://localhost:3000/streams/petCreation/[traceId]</code>
      </p>
    ),
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

  // States

  {
    elementXpath: workbenchXPath.links.states,
    title: 'State Management',
    description: () => (
      <p>
        Ok now that we've seen the observability tools, let's take a look at the <b>State Management Tool</b>.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.states }],
  },
  {
    elementXpath: workbenchXPath.states.container,
    title: 'State Management Tool',
    description: () => (
      <p>
        This is your <b>State Management Tool</b>, from here you will be able to see all of your persisted state
        key/value pairs.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.states.row(1) }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'State Details',
    description: () => (
      <p>
        This section presents the details for a given state key, from here you will be able to manage the value assigned
        to the selected state key.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.states }],
  },

  // End of Tutorial

  {
    title: 'Congratulations! Real-Time Streaming Master 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed the Pet Management with Real-Time Streaming Tutorial!
        <br />
        <br />
        You've learned how to build an intelligent pet management system with:
        <ul>
          <li>🌊 <b>Real-Time Streaming</b> - Server-sent events for live progress updates</li>
          <li>🤖 <b>AI Agents</b> - Making intelligent health and adoption decisions</li>
          <li>🔄 <b>Orchestrator</b> - Central workflow control with guard enforcement</li>
          <li>📋 <b>Background Jobs</b> - Asynchronous processing with streaming updates</li>
          <li>⏰ <b>Cron Jobs</b> - Scheduled maintenance tasks</li>
          <li>⚡ <b>Event-Driven Architecture</b> - Seamless workflow orchestration</li>
        </ul>
        <br />
        This demonstrates how Motia's <b>native Streams API</b> enables real-time user feedback during
        complex async workflows, providing immediate responses while background processes complete.
        <br />
        <br />
        <b>Key Takeaway:</b> APIs return immediately with streams, background jobs update streams in real-time,
        and users get live feedback throughout the entire workflow!
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
        Thank you for exploring real-time streaming with Motia! 🌊🐾
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
]



