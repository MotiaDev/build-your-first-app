import { workbenchXPath, TutorialStep } from '@motiadev/workbench'

export const steps: TutorialStep[] = [
  {
    title: 'Welcome to Motia',
    image: {
      height: 200,
      src: 'https://github.com/MotiaDev/motia/raw/main/packages/docs/public/github-readme-banner.png',
    },
    description: () => (
      <p>
        Motia is an all-in-one framework for modern backend systems. Out of the box support for API endpoints,
        background jobs, scheduled tasks and agentic workflow orchestration through a unified runtime.
        <br />
        <br />
        This tutorial is an <b>extension of the CRUD API tutorial</b> that adds <b>workflow orchestration</b> capabilities.
        You'll learn how to build complete workflows that combine API endpoints with <b>async background jobs</b> and <b>scheduled cron jobs</b>.
        <br />
        <br />
        The workflow includes:
        <br />
        • <b>CRUD API endpoints</b> for pet management (Create, Read, Update, Delete)
        <br />
        • <b>Async background jobs</b> for feeding reminders (triggered by events)
        <br />
        • <b>Scheduled cron jobs</b> for data cleanup (time-based execution)
        <br />
        <br />
        Let's start with <b>Workbench</b>, it is a development tool provided by Motia's ecosystem, from here you'll be
        able to visualize your complete workflow and test the orchestration.
        <br />
        <br />
        💡 If you haven't completed the basic CRUD tutorial yet, we recommend starting there first.
      </p>
    ),
  },

  // Flows

  {
    elementXpath: workbenchXPath.flows.node('tscreatepet'),
    title: 'API Step',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's start with the <b>CREATE</b> operation in our CRUD API. This API Step allows
        you to create new pets by exposing an HTTP POST endpoint for external traffic.
        <br />
        <br />
        This step also demonstrates <b>workflow orchestration</b> - when a pet is created, it automatically triggers
        background jobs for feeding reminders and other automated processes.
        <br />
        <br />
        💡 <b>This is the entry point of our complete workflow that combines CRUD operations with background processing.</b>
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
    description: () => <p>Clicking on this icon will allow you to visualize the source code for a given Step.</p>,
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
    title: 'API Step Configuration',
    description: () => (
      <p>
        All Steps are defined by a <b>configuration</b> and a <b>handler</b>. Let's look at the configuration.
        <br />
        <br />
        For API Steps, you'll define attributes like <b>method</b> (the HTTP method) and <b>path</b> (the URL path).
        <br />
        <br />
        You'll also set <b>type</b>, <b>name</b>, and <b>flows</b> to declare the step type and associate it with your workflows.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tscreatepet') },
      { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }
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

  // Event Steps

  {
    elementXpath: workbenchXPath.flows.node('tssetnextfeedingreminder'),
    title: 'Event Step',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Now let's explore <b>async background jobs</b> in our pet management workflow. After a pet is created, 
        we need to set up automated feeding reminders.
        <br />
        <br />
        For this we will look at the <b>Event Step</b> that handles feeding reminder scheduling.
        <b>Event Steps</b> are essential for Motia's event-driven architecture and enable background processing.
        <br />
        <br />
        💡 <b>Event Steps are triggered by internal events, making them perfect for background jobs and workflow orchestration.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Let's examine how this <b>async background job</b> works. This Event Step subscribes to the 
        feeding reminder event that gets emitted when a pet is created.
        <br /> <br />
        The <b>Event Step</b> then processes the background job by setting up automated feeding schedules
        based on the pet's age, species, and health status.
        <br /> <br />
        This demonstrates how <b>Event Steps</b> enable background processing and workflow orchestration
        in response to API operations.
        <br /> <br />
        💡 <b>Background jobs allow you to perform complex, time-consuming tasks without blocking API responses.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tssetnextfeedingreminder') },
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
    title: 'Background Job Business Logic',
    link: 'https://www.motia.dev/docs/concepts/state-management',
    description: () => (
      <p>
        Let's take a closer look at the background job's business logic.
        <br />
        <br />
        In this section, the job calculates the next feeding time and updates the pet record with feeding schedules
        and welcome notes. This demonstrates how background jobs can perform complex data operations asynchronously.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('business-logic') }],
  },

  // Cron Steps

  {
    elementXpath: workbenchXPath.flows.node('tsdeletionreaper'),
    title: 'Cron Step',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        Now let's explore <b>scheduled cron jobs</b> in our pet management workflow. So far you've learned about 
        <b>CRUD API endpoints</b> and <b>async background jobs</b>.
        <br />
        <br />
        The <b>CRON</b> Step allows you to schedule tasks that run automatically at specified intervals.
        In our pet management system, we use cron jobs for data cleanup and maintenance tasks.
        <br />
        <br />
        💡 <b>Cron jobs are perfect for scheduled maintenance, cleanup, and recurring tasks that don't depend on user actions.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
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
        In our pet management system, the deletion reaper cron job runs periodically to clean up soft-deleted pets.
        This ensures data cleanup happens automatically without manual intervention.
        <br />
        <br />
        Let's take a look at the handler definition to see how it processes the cleanup.
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
        In our deletion reaper cron job, we are checking for pets that have been soft-deleted and have passed their
        purge date. The handler removes these pets permanently from the system and logs the cleanup activities.
        <br />
        <br />
        💡 <b>This demonstrates how cron jobs can automate maintenance tasks that need to run on a schedule.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },

  // // Endpoints

  {
    elementXpath: workbenchXPath.links.endpoints,
    title: 'Endpoints',
    description: () => (
      <p>
        Now that we've looked at Motia primitives, let's trigger the API Step from the <b>endpoints</b> section in
        Workbench.
        <br />
        <br />
        💡 All of your API Steps declare HTTP endpoints that can be reviewed and tested from the <b>Endpoints</b>{' '}
        section in Workbench.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.endpoints.endpoint('POST', '/basic-tutorial'),
    title: 'Endpoints Tool',
    description: () => (
      <p>
        This section will display all of the endpoints declared in your API Steps. It will list the HTTP method, the URL
        path, and the description declared in the Step configuration.
        <br />
        <br />
        💡 Clicking on an endpoint from the list will open the endpoint overview which provides documentation on how to
        use the endpoint and a tool to test the endpoint.
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
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab }
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'API Endpoint Test',
    description: () => (
      <p>
        Once you've filled the request payload, you can click on the <b>Play</b> button to trigger an HTTP request
        against your API endpoint. The response will appear below.
      </p>
    ),
    before: [
      {
        type: 'fill-editor',
        content: {
          name: 'Jack',
          species: 'dog',
          ageMonths: 24,
        },
      },
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },

  // UPDATE API Test with Background Job

  {
    elementXpath: workbenchXPath.endpoints.endpoint('PUT', '/ts/pets/:id'),
    title: 'UPDATE API with Background Job',
    description: () => (
      <p>
        Now let's test the <b>UPDATE</b> operation that demonstrates background job functionality.
        <br />
        <br />
        When you update a pet's status, it can trigger background jobs for status-based workflows.
        This shows how UPDATE operations can also orchestrate complex background processes.
        <br />
        <br />
        💡 <b>UPDATE operations can trigger background jobs based on the changes made.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'UPDATE API with Background Job',
    description: () => (
      <p>
        For UPDATE operations, you need to provide both the pet ID in the path parameter and the fields you want to change in the request body.
        <br />
        <br />
        The tutorial will automatically fill in both the path parameter and request body, then execute the request.
        <br />
        <br />
        💡 <b>This UPDATE will change the pet status, which can trigger background job workflows.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('PUT', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
          id: '1',
          status: 'available',
          name: 'Updated Buddy'
        },
      },
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },

  // Tracing

  {
    elementXpath: workbenchXPath.links.tracing,
    title: 'Tracing',
    description: () => (
      <p>
        Great! You have triggered your first flow, now let's take a look at our example flow behavior using Workbench's
        observability tools.
        <br />
        <br />
        The <b>Tracing</b> section shows all trace executions from your API requests and workflow runs.
        <br />
        <br />
        Each trace shows the complete execution path including:
        <br />
        • <b>TsCreatePet</b> - Initial pet creation and event emission
        <br />
        • <b>TsSetNextFeedingReminder</b> - Background job for feeding reminders
        <br />
        <br />
        Click on any trace to see its timeline and detailed execution logs.
        <br />
        <br />
        💡 <b>Tracing helps you understand the complete flow of your workflow executions.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.tracing }
    ],
  },

  // Logs

  {
    elementXpath: workbenchXPath.links.logs,
    title: 'Logs',
    description: () => (
      <p>
        Let's take a look at your execution logs. The <b>Logs Tool</b> shows all log messages with their associated <b>Trace ID</b>.
        <br />
        <br />
        Click on any log entry to see its details, or click on a <b>Trace ID</b> to filter logs by that specific trace.
        <br />
        <br />
        💡 This helps you debug and monitor your workflow execution by filtering logs to specific traces.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.logs }
    ],
  },

  // States

  {
    elementXpath: workbenchXPath.links.states,
    title: 'State Management',
    description: () => (
      <p>
        Ok now that we've seen the observability tools, let's take a look at the <b>State Management Tool</b>.
        <br />
        <br />
        The State Management Tool allows you to view and manage persisted state key/value pairs from your workflow executions.
        <br />
        <br />
        If you have state data from your Steps, you can click on any state key to view its details and manage its value.
        <br />
        <br />
        💡 <b>State management allows your workflows to persist data across Step executions.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.states }
    ],
  },

  // Background Jobs Showcase

  {
    elementXpath: workbenchXPath.flows.previewButton('tssetnextfeedingreminder'),
    title: 'Background Job - Feeding Reminder',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Now let's explore the <b>background job</b> that gets triggered when a pet is created.
        <br />
        <br />
        The <b>Set Next Feeding Reminder</b> job automatically schedules feeding reminders based on the pet's age and species.
        This demonstrates how API operations can trigger background processing workflows.
        <br />
        <br />
        This background job subscribes to the <b>ts.pet.created</b> event and processes it asynchronously, determining feeding schedules and creating reminder events.
        <br />
        <br />
        💡 <b>Background jobs are triggered by events and run asynchronously without blocking the API response.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.flows },
      { type: 'click', selector: workbenchXPath.flows.node('tssetnextfeedingreminder') },
      { type: 'click', selector: workbenchXPath.flows.previewButton('tssetnextfeedingreminder') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') }
    ],
  },

  // Cron Job Showcase

  {
    elementXpath: workbenchXPath.flows.previewButton('tsdeletionreaper'),
    title: 'Cron Job - Deletion Reaper',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        Finally, let's examine the <b>scheduled cron job</b> that runs periodically for data cleanup.
        <br />
        <br />
        The <b>Deletion Reaper</b> cron job runs on a schedule to permanently remove pets that have been soft-deleted
        and have passed their purge date.
        <br />
        <br />
        The cron job handler scans for pets that need permanent deletion, logs cleanup activities, and ensures data integrity during the deletion process.
        <br />
        <br />
        💡 <b>Cron jobs run on a schedule and are perfect for maintenance tasks and data cleanup.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.flows.node('tsdeletionreaper') },
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsdeletionreaper') },
      { type: 'click', selector: workbenchXPath.flows.feature('cron-configuration') }
    ],
  },

  // Workflow Demonstration

  {
    elementXpath: workbenchXPath.endpoints.endpoint('POST', '/ts/pets'),
    title: 'Complete Workflow Test',
    description: () => (
      <p>
        Let's test the complete workflow by creating a new pet and observing how it triggers background jobs.
        <br />
        <br />
        When you create a pet, you'll see:
        <br />
        • The API returns the created pet immediately
        <br />
        • Background jobs are triggered asynchronously
        <br />
        • Feeding reminders are scheduled automatically
        <br />
        <br />
        💡 <b>This demonstrates the power of event-driven architecture for workflow orchestration.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.endpoints }
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'Create Pet to Trigger Workflow',
    description: () => (
      <p>
        Create a new pet to see the complete workflow in action. The tutorial will automatically fill in test data.
        <br />
        <br />
        After creating the pet, check the logs and tracing to see how the background jobs are triggered.
        <br />
        <br />
        💡 <b>Watch how the workflow orchestrates multiple steps automatically.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
          name: 'Workflow Test Pet',
          species: 'dog',
          ageMonths: 12,
        },
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Workflow Execution',
    description: () => (
      <p>
        Click the <b>Play</b> button to create the pet and trigger the complete workflow.
        <br />
        <br />
        You'll see the pet creation response, and then can check the logs to see background jobs executing.
        <br />
        <br />
        💡 <b>The workflow demonstrates how API operations can trigger complex background processing.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.playButton },
      { type: 'click', selector: workbenchXPath.links.logs }
    ],
  },

  // End of Tutorial

  {
    title: 'Congratulations 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed our Motia Workflow Orchestration tutorial! 🎉
        <br />
        <br />
        You've learned how to build a complete pet management system that combines:
        <br />
        • <b>CRUD API endpoints</b> for pet management (Create, Read, Update, Delete)
        <br />
        • <b>Async background jobs</b> for feeding reminders and automated processes
        <br />
        • <b>Scheduled cron jobs</b> for data cleanup and maintenance
        <br />
        • <b>Event-driven architecture</b> for workflow orchestration
        <br />
        <br />
        You've also learned how to navigate Workbench, test workflows, and monitor execution
        through tracing and logging.
        <br />
        <br />
        We recommend you give our{' '}
        <a href="https://www.motia.dev/docs/concepts" target="_blank">
          core concepts
        </a>{' '}
        a read if you wish to learn further about Motia's advanced features like AI agents and streaming.
        <br />
        <br />
        Don't forget to join our{' '}
        <a href="https://discord.com/invite/nJFfsH5d6v" target="_blank">
          Discord community
        </a>{' '}
        or tag us in socials to show us what you've built with Motia.
        <br />
        <br />
        We are an open source project, so feel free to raise your{' '}
        <a href="https://github.com/MotiaDev/motia/issues" target="_blank">
          issues
        </a>{' '}
        or{' '}
        <a href="https://github.com/MotiaDev/motia/discussions" target="_blank">
          suggestions
        </a>{' '}
        in our{' '}
        <a href="https://github.com/MotiaDev/motia" target="_blank">
          Github repo
        </a>
        .
        <br />
        <br />
        Thank you for completing our workflow orchestration tutorial!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
]


