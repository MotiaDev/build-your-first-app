import { workbenchXPath, TutorialStep } from '@motiadev/workbench'

export const steps: TutorialStep[] = [
  {
    title: 'Pet Management Workflow Tutorial',
    image: {
      height: 200,
      src: 'https://github.com/MotiaDev/motia/raw/main/packages/docs/public/github-readme-banner.png',
    },
    description: () => (
      <p>
        Welcome to the Pet Management Workflow Tutorial! This comprehensive guide demonstrates how to build an intelligent 
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
        <br />
        This tutorial is based on the structure from the{' '}
        <a href="https://github.com/MotiaDev/motia-examples/blob/main/examples/ai-content-moderation/tutorial.tsx" target="_blank">
          AI Content Moderation Tutorial
        </a>
        .
      </p>
    ),
  },

  // Pet Management Flow Overview

  {
    elementXpath: workbenchXPath.flows.node('createpet'),
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
    elementXpath: workbenchXPath.flows.previewButton('createpet'),
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
      { type: 'click', selector: workbenchXPath.flows.previewButton('createpet') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Step Configuration',
    description: () => (
      <p>
        There are specific configuration attributes for an API Step, let's start with the <b>method</b> attribute. This
        will declare the type of HTTP method used to talk to your API Step.
        <br />
        Through the <b>path</b> attribute you'll declare the url path used to trigger your API Step
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('request-body') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('response-payload') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('event-driven-architecture') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('logger') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('http-response') }],
  },

  // AI Agents

  {
    elementXpath: workbenchXPath.flows.node('healthreviewagent'),
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
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Now that we have an entry point in our flow, let's focus on subscribing to a <b>topic</b> and performing a
        specific task.
        <br /> <br />
        For this we will look at the <b>Event</b> Step.
        <br /> <br />
        <b>Event</b> Steps are an essential primitive for Motia's event driven architecture. Let's dive deeper into the
        anatomy of an Event Step by taking a look at the code visualization tool.
        <br /> <br />
        💡 <b>Event</b> Steps can only be triggered internally, through topic subscriptions.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('processfoodorder') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step Input',
    description: () => (
      <p>
        <b>Event</b> Steps like other primitives are composed by a configuration and a handler.
        <br />
        <br />
        <b>Event</b> Steps have a specific attribute from their config, the <b>input</b> attribute, which declares the
        data structure provided by the topic it is subscribed to.
        <br />
        <br />
        The <b>input</b> attributes is defined as a zod schema, think of the <b>input</b> attributes as a contract for
        other Steps that emit the topics that your Step subscribes to.
        <br />
        <br /> 💡 <b>Multiple Steps can subscribe to the same topic, but their input schema must be the same.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('input-schema') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step Handler',
    description: () => (
      <p>
        Let's take a look at the <b>Event</b> Step Handler.
        <br />
        <br />
        The handler will seem familiar other primitive Step Handlers, but notice that the first argument holds the data
        provided for the topic or topics your Step subscribes to.
        <br />
        <br />
        💡 The first argument will match the structure of your input schema, defined in the <b>Event</b> Step config.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Storing Data in State',
    link: 'https://www.motia.dev/docs/concepts/state-management',
    description: () => (
      <p>
        Let's take a closer look at storing data in state.
        <br />
        <br />
        In this example we are persisting the result of a third party HTTP request in <b>State</b>, scoping it to a
        group id named "orders".
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('state') }],
  },

  // Orchestrator

  {
    elementXpath: workbenchXPath.flows.node('petlifecycleorchestrator'),
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
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
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
        For instance, in this example the cron schedule is configured to execute the Step handler every 5 minutes. Let's
        take a look at the handler definition.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('stateauditjob') },
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
        In this CRON Step example we are evaluating orders persisted in state, and emitting warnings through a topic for
        each order that hasn't been processed and has a shipping date in the past.
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
    before: [{ type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/basic-tutorial') }],
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
            curl -X POST http://localhost:3000/basic-tutorial \<br />
            {'  '}-H "Content-Type: application/json" \<br />
            {'  '}-d '
            {JSON.stringify({
              pet: { name: 'Jack', photoUrl: 'https://images.dog.ceo/breeds/pug/n02110958_13560.jpg' },
              foodOrder: { id: 'food-order-1', quantity: 0 },
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
          pet: { name: 'Jack', photoUrl: 'https://images.dog.ceo/breeds/pug/n02110958_13560.jpg' },
          foodOrder: { id: 'food-order-1', quantity: 0 },
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
    title: 'Congratulations! Pet Management Master 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed the Pet Management Workflow Tutorial!
        <br />
        <br />
        You've learned how to build an intelligent pet management system with:
        <ul>
          <li>🤖 <b>AI Agents</b> - Making intelligent health and adoption decisions</li>
          <li>🔄 <b>Orchestrator</b> - Central workflow control with guard enforcement</li>
          <li>📋 <b>Staff Automation</b> - Automated task scheduling and management</li>
          <li>🛡️ <b>Guard Enforcement</b> - Business rule validation and error handling</li>
          <li>⚡ <b>Event-Driven Architecture</b> - Seamless workflow orchestration</li>
        </ul>
        <br />
        This demonstrates how Motia transforms simple CRUD APIs into intelligent workflow automation platforms
        that guide staff through every step of complex processes.
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





