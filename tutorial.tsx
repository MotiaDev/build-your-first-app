import { workbenchXPath, TutorialStep } from '@motiadev/workbench'

export const steps: TutorialStep[] = [
  {
    title: 'Welcome to Motia Pet Management',
    image: {
      height: 200,
      src: 'https://github.com/MotiaDev/motia/raw/main/packages/docs/public/github-readme-banner.png',
    },
    description: () => (
      <p>
        Welcome to the <b>Pet Management Background Jobs</b> tutorial! This example demonstrates how to build robust, event-driven workflows using Motia's background job orchestration capabilities.
        <br />
        <br />
        You'll learn how to implement:
        <br />
        • <b>API Steps</b> - Entry points that trigger background workflows
        <br />
        • <b>Event Steps</b> - Asynchronous background jobs for data processing
        <br />
        • <b>Cron Steps</b> - Scheduled maintenance and cleanup operations
        <br />
        • <b>Background Job Orchestration</b> - How jobs chain together through events
        <br />
        <br />
        This tutorial shows how to build a pet management system where creating a pet automatically triggers feeding reminders, status updates, and scheduled cleanup - all running in the background!
        <br />
        <br />
        💡 <b>Background jobs</b> enable you to build responsive APIs while handling complex processing asynchronously.
      </p>
    ),
  },

  // Flows

  {
    elementXpath: workbenchXPath.flows.node('TsCreatePet'),
    title: 'API Step - Create Pet',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's explore the <b>Create Pet API Step</b> - this is your workflow entry point that triggers a chain of background jobs!
        <br />
        <br />
        When a user creates a pet through the API, this step immediately returns a response while triggering multiple background jobs:
        <br />
        • Feeding reminder setup
        <br />
        • Status lifecycle management
        <br />
        • Data enrichment processes
        <br />
        <br />
        This pattern keeps your API responsive while handling complex processing in the background.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.links.flows },
      { type: 'click', selector: workbenchXPath.flows.dropdownFlow('TsPetManagement') },
    ],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('TsCreatePet'),
    title: 'Code Preview',
    description: () => <p>Clicking on this icon will allow you to visualize the source code for the Create Pet Step.</p>,
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
    title: 'Step Configuration',
    description: () => (
      <div>
        <p>
          All Steps are defined by two main components, the <b>configuration</b> and the <b>handler</b>.
          <br />
          <br />
          Let's start with the configuration, the common config attributes are
          <i>type, name, description, and flows</i>.<br />
          <br />
        </p>
        <ul>
          <li>
            The <b>type</b> attribute declares this as an API Step primitive
          </li>
          <li>
            The <b>flows</b> attribute associates this Step with the TsPetManagement flow
          </li>
          <li>
            The <b>name</b> and <b>description</b> attributes provide context in the visualization and
            observability tools.
          </li>
        </ul>
      </div>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('TsCreatePet') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Endpoint Configuration',
    description: () => (
      <p>
        There are specific configuration attributes for an API Step. The <b>method</b> attribute declares the HTTP method (POST in this case).
        <br />
        The <b>path</b> attribute declares the URL path (/ts/pets) used to trigger your API Step.
        <br />
        <br />
        Notice the <b>emits</b> attribute - this API step emits events to trigger background jobs!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Request Body Schema',
    link: 'https://zod.dev',
    description: () => (
      <p>
        The <b>bodySchema</b> attribute defines the shape of the request body using Zod validation.
        <br />
        <br />
        This schema validates that incoming requests have the required fields: name, species, and ageMonths.
        <br />
        <br />
        <i>💡 Zod provides automatic validation and type safety for your API endpoints</i>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('request-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Workflow Trigger',
    description: () => (
      <p>
        This is the heart of <b>background job orchestration</b>! The Create Pet API emits events that queue background jobs for processing.
        <br />
        <br />
        When a pet is created, this step emits events that trigger:
        <br />
        • <b>ts.pet.created</b> - queues the lifecycle orchestrator job
        <br />
        • <b>ts.feeding.reminder.enqueued</b> - queues the feeding reminder background job
        <br />
        <br />
        These events are processed asynchronously, allowing the API to return immediately while background jobs handle the heavy lifting.
        <br />
        <br />
        💡 This pattern enables <b>eventual consistency</b> - your API stays fast while background jobs ensure data integrity.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('event-emission') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Handler Function',
    description: () => (
      <p>
        The <b>handler function</b> contains the business logic for creating pets.
        <br />
        <br />
        It receives the validated request data (thanks to Zod), creates the pet record, 
        logs the operation, and emits events to trigger background jobs.
        <br />
        <br />
        Notice the try-catch block for proper error handling with validation errors and unexpected failures.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Logging',
    description: () => (
      <p>
        The <b>logger</b> provides structured logging for pet creation events with context like petId, name, species, and status.
        <br />
        <br />
        Motia's logger automatically ties logs to trace IDs, providing excellent observability 
        throughout the workflow execution.
        <br />
        <br />
        This makes debugging and monitoring your pet management system much easier.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('logging') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Success Response',
    description: () => (
      <p>
        The handler returns a <b>201 Created</b> response with the newly created pet object.
        <br />
        <br />
        The response includes all pet details: ID, name, species, status, and creation timestamp.
        <br />
        <br />
        If validation fails, it returns a 400 error with detailed validation messages.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('success-response') }],
  },

  // Event Steps

  {
    elementXpath: workbenchXPath.flows.node('TsSetNextFeedingReminder'),
    title: 'Background Job - Feeding Reminder',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        Now let's explore a <b>Background Job</b> that processes asynchronously after the API responds!
        <br />
        <br />
        The <b>Feeding Reminder Job</b> runs in the background, triggered by the 'ts.feeding.reminder.enqueued' event from the Create Pet API.
        <br />
        <br />
        This demonstrates the power of <b>background job processing</b>:
        <br />
        • Jobs run independently of the API response
        <br />
        • They can retry on failure
        <br />
        • They provide eventual consistency
        <br />
        • They scale automatically with your workload
        <br />
        <br />
        💡 <b>Background jobs</b> are perfect for tasks that don't need immediate completion but require reliability.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step Configuration',
    link: 'https://www.motia.dev/docs/concepts/steps/event',
    description: () => (
      <p>
        The <b>Feeding Reminder Background Job</b> is configured as an Event Step with job-specific attributes:
        <br /> <br />
        • <b>type: 'event'</b> - declares this as a background job processor
        <br />
        • <b>subscribes: ['ts.feeding.reminder.enqueued']</b> - listens for job queue events from the Create Pet API
        <br />
        • <b>emits: ['ts.feeding.reminder.completed']</b> - signals job completion to downstream processors
        <br /> <br />
        This creates a background job chain: API → Job Queue → Background Processor → Completion Event
        <br /> <br />
        💡 <b>Event Steps</b> are Motia's background job processors - they handle asynchronous work reliably and scalably.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('TsSetNextFeedingReminder') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Subscription',
    description: () => (
      <p>
        The <b>subscribes</b> attribute declares which job queue this background processor listens to.
        <br />
        <br />
        In this case, it subscribes to 'ts.feeding.reminder.enqueued' events, creating a job queue for feeding reminder processing.
        <br />
        <br />
        The background job handler receives the job payload (petId and enqueuedAt timestamp) as the first argument.
        <br />
        <br />
        💡 <b>Multiple background jobs can subscribe to the same queue, enabling horizontal scaling and load balancing.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('event-subscription') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Background Job Handler',
    description: () => (
      <p>
        The <b>background job handler</b> processes the feeding reminder job by:
        <br />
        <br />
        • Retrieving the pet record from the data store
        <br />
        • Adding welcome notes and calculating next feeding time
        <br />
        • Updating the pet record with feeding schedule
        <br />
        • Logging the operation for job monitoring and debugging
        <br />
        <br />
        This demonstrates how background jobs can reliably process data asynchronously, 
        with built-in retry mechanisms and error handling.
        <br />
        <br />
        💡 <b>Background job handlers</b> are designed to be idempotent and fault-tolerant.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Update Logic',
    link: 'https://www.motia.dev/docs/concepts/state-management',
    description: () => (
      <p>
        The background job performs data enrichment and updates the pet record:
        <br />
        <br />
        • Adds welcome notes to help with pet care
        <br />
        • Calculates the next feeding time based on age and species
        <br />
        • Updates the pet record with enriched data
        <br />
        • Ensures data consistency through atomic updates
        <br />
        <br />
        This demonstrates how background jobs can perform data processing and enrichment 
        asynchronously, maintaining data integrity while keeping APIs responsive.
        <br />
        <br />
        💡 <b>Background data processing</b> is perfect for complex calculations and data transformations.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('pet-update-logic') }],
  },

  // Cron Steps

  {
    elementXpath: workbenchXPath.flows.node('TsDeletionReaper'),
    title: 'Cron Step - Deletion Reaper',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        Now let's explore <b>Scheduled Background Jobs</b> with Cron Steps!
        <br />
        <br />
        The <b>Deletion Reaper</b> is a scheduled background job that runs daily to permanently remove pets that have been soft-deleted.
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> enable automated maintenance and cleanup tasks:
        <br />
        • Run on a predictable schedule
        <br />
        • Handle bulk operations efficiently
        <br />
        • Perform system maintenance automatically
        <br />
        • Ensure data hygiene and compliance
        <br />
        <br />
        💡 <b>Scheduled background jobs</b> are perfect for maintenance tasks, cleanup operations, and batch processing.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Schedule Configuration',
    link: 'https://www.motia.dev/docs/concepts/steps/cron',
    description: () => (
      <p>
        The <b>Deletion Reaper</b> is configured with a cron schedule for reliable, scheduled background job execution.
        <br />
        <br />
        The schedule '0 2 * * *' means it runs daily at 2:00 AM to permanently remove soft-deleted pets.
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> enable automated maintenance:
        <br />
        • Predictable execution timing
        <br />
        • Automatic retry on failure
        <br />
        • Built-in monitoring and alerting
        <br />
        • Scalable batch processing
        <br />
        <br />
        Let's examine the handler to see how it processes the cleanup job.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('TsDeletionReaper') },
      { type: 'click', selector: workbenchXPath.flows.feature('cron-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Step Handler',
    description: () => (
      <p>
        The <b>Deletion Reaper</b> scheduled background job performs automated cleanup by:
        <br />
        <br />
        • Finding all pets that have been soft-deleted and are past their purge date
        <br />
        • Permanently removing them from the store in batches
        <br />
        • Logging the cleanup operation for audit and compliance
        <br />
        • Handling errors gracefully with retry logic
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> can perform maintenance tasks automatically, 
        completing the background job ecosystem: API → Event-driven Jobs → Scheduled Cleanup Jobs.
        <br />
        <br />
        💡 <b>Scheduled background jobs</b> ensure your system stays clean and compliant without manual intervention.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },

  // Endpoints

  {
    elementXpath: workbenchXPath.links.endpoints,
    title: 'Testing the Pet Management API',
    description: () => (
      <p>
        Now that we've explored all background job types, let's test the <b>Pet Management API</b> to see the complete background job orchestration in action!
        <br />
        <br />
        💡 The Endpoints section shows all API Steps and provides tools to test them, triggering the entire background job chain.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.endpoints.endpoint('POST', '/ts/pets'),
    title: 'Pet Management Endpoints',
    description: () => (
      <p>
        Here you can see all the <b>Pet Management API endpoints</b>:
        <br />
        <br />
        • <b>POST /ts/pets</b> - Create a new pet (triggers background job chain)
        <br />
        • <b>GET /ts/pets/:id</b> - Retrieve a specific pet
        <br />
        • <b>PUT /ts/pets/:id</b> - Update pet information
        <br />
        • <b>DELETE /ts/pets/:id</b> - Soft-delete a pet (scheduled for cleanup)
        <br />
        <br />
        💡 Let's test the Create Pet endpoint to see the complete background job orchestration in action!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.endpoints }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Create Pet API Documentation',
    description: () => (
      <p>
        This section provides documentation for the <b>Create Pet API endpoint</b>.
        <br />
        <br />
        The <b>Details</b> tab shows the API specification, and the <b>Call</b> tab provides a form to test the endpoint.
        <br />
        <br />
        When you create a pet, it will trigger the complete background job chain: API → Event-driven Jobs → Scheduled Cleanup Jobs!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') }],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'Test Create Pet API',
    description: () => (
      <p>
        This form allows you to test the <b>Create Pet API</b> and see the complete background job orchestration in action!
        <br />
        <br />
        When you create a pet, watch how the API immediately returns while background jobs process asynchronously:
        <br />
        • Feeding reminder setup
        <br />
        • Status lifecycle management
        <br />
        • Data enrichment processes
        <br />
        <br />
        You can also test using curl:
        <br />
        <br />
        💡 The <b>bodySchema</b> provides automatic validation and sample request payload.
        <br />
        <br />
        <pre className="code-preview">
          <code className="language-bash">
            curl -X POST http://localhost:3000/ts/pets \<br />
            {'  '}-H "Content-Type: application/json" \<br />
            {'  '}-d '
            {JSON.stringify({
              name: 'Buddy',
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
    title: 'Execute Create Pet API',
    description: () => (
      <p>
        Click the <b>Play</b> button to create a pet and trigger the complete background job orchestration!
        <br />
        <br />
        This will:
        <br />
        • Create the pet record and return immediately
        <br />
        • Queue the feeding reminder background job
        <br />
        • Queue the lifecycle orchestrator job
        <br />
        • Start scheduled cleanup jobs (if applicable)
        <br />
        <br />
        Watch how the API stays responsive while background jobs handle the heavy lifting!
      </p>
    ),
    before: [
      {
        type: 'fill-editor',
        content: {
          name: 'Buddy',
          species: 'dog',
          ageMonths: 24
        },
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Pet Created Successfully!',
    description: () => (
      <p>
        🎉 <b>Pet created successfully!</b> The API returned a 201 status with the new pet details.
        <br />
        <br />
        Notice the pet has been assigned:
        <br />
        • A unique ID
        <br />
        • Initial status ('new')
        <br />
        • Creation timestamp
        <br />
        <br />
        <b>Background jobs are now queued and processing!</b> The API responded immediately while background jobs handle:
        <br />
        • Feeding reminder setup
        <br />
        • Status lifecycle management
        <br />
        • Data enrichment
        <br />
        <br />
        Check the Flows view to see the background job orchestration in action!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.endpoints.playButton }],
  },

  // Tracing

  {
    elementXpath: workbenchXPath.bottomPanel,
    title: 'Workflow Orchestration in Action',
    description: () => (
      <p>
        🎉 <b>Amazing!</b> You've successfully triggered the complete pet management workflow!
        <br />
        <br />
        Now let's observe the <b>workflow orchestration</b> using Workbench's powerful observability tools.
        <br />
        <br />
        The <b>Tracing</b> section shows all workflow executions grouped by <b>trace ID</b>, 
        allowing you to see how the API → Background Job → Orchestrator chain executed.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.tracing }
    ],
  },
  {
    elementXpath: workbenchXPath.tracing.trace(1),
    title: 'Pet Management Workflow Trace',
    description: () => (
      <p>
        Here you can see the <b>complete workflow orchestration</b> for your pet creation!
        <br />
        <br />
        The trace ID links all related step executions: Create Pet API → Feeding Reminder Job → Lifecycle Orchestrator.
        <br />
        <br />
        Click on the trace to see the detailed execution timeline and how each step connected to the next.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.tracing.trace(1) }],
  },
  {
    elementXpath: workbenchXPath.tracing.details,
    title: 'Workflow Execution Timeline',
    description: () => (
      <p>
        This timeline shows the <b>complete workflow orchestration</b> execution:
        <br />
        <br />
        • <b>Create Pet API</b> - Handled the HTTP request and emitted events
        <br />
        • <b>Feeding Reminder Job</b> - Background job that updated pet with feeding schedule
        <br />
        • <b>Lifecycle Orchestrator</b> - Managed pet status transitions
        <br />
        <br />
        Notice how the steps executed in sequence, creating a seamless workflow!
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.tracing.timeline(1),
    title: 'Step Execution Details',
    description: () => (
      <p>
        Click on any <b>timeline segment</b> to see detailed execution information for that step.
        <br />
        <br />
        You can see execution time, logs, and how each step contributed to the overall workflow orchestration.
        <br />
        <br />
        This demonstrates Motia's powerful observability for complex, multi-step workflows.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Workflow Step Details',
    description: () => (
      <p>
        This <b>Trace Details View</b> shows detailed execution information for each step in your workflow orchestration.
        <br />
        <br />
        You can see logs, execution time, and context for each step: Create Pet API, Feeding Reminder Job, and Lifecycle Orchestrator.
        <br />
        <br />
        💡 For more detailed logs, use the <b>Logs Tool</b> to dive deeper into the workflow execution.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.tracing.timeline(1) }],
  },

  // Logs

  {
    elementXpath: workbenchXPath.logs.container,
    title: 'Workflow Execution Logs',
    description: () => (
      <p>
        Let's examine the detailed logs from your <b>pet management workflow orchestration</b>!
        <br />
        <br />
        The Logs Tool shows all execution logs with trace IDs, making it easy to follow the complete workflow.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.logs }],
  },
  {
    elementXpath: workbenchXPath.logs.traceColumn(1),
    title: 'Trace-Based Log Filtering',
    description: () => (
      <p>
        Each log entry shows the associated <b>Trace ID</b> from your workflow execution.
        <br />
        <br />
        Click on a <b>Trace ID</b> to filter logs and see the complete execution flow:
        <br />
        • Create Pet API logs
        <br />
        • Feeding Reminder Job logs  
        <br />
        • Lifecycle Orchestrator logs
        <br />
        <br />
        💡 This trace-based filtering makes debugging complex workflows much easier!
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.logs.searchContainer,
    title: 'Workflow Log Search',
    description: () => (
      <p>
        The search is now filtered to show only logs from your <b>pet management workflow trace</b>.
        <br />
        <br />
        This gives you a complete view of how the API → Background Job → Orchestrator chain executed.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.logs.traceColumn(1) }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Workflow Log Details',
    description: () => (
      <p>
        Click on any log entry to see detailed execution information including:
        <br />
        <br />
        • <b>Log Level</b> and <b>Timestamp</b>
        <br />
        • <b>Step Name</b> (Create Pet, Feeding Reminder, etc.)
        <br />
        • <b>Flow Name</b> (TsPetManagement)
        <br />
        • <b>Trace ID</b> linking all related executions
        <br />
        • <b>Context Data</b> like petId, status changes, etc.
        <br />
        <br />
        This provides complete visibility into your workflow orchestration!
      </p>
    ),
  },

  // States

  {
    elementXpath: workbenchXPath.links.states,
    title: 'Pet Data Storage',
    description: () => (
      <p>
        Finally, let's check the <b>State Management Tool</b> to see how the pet data is stored and managed throughout the workflow.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.states }],
  },
  {
    elementXpath: workbenchXPath.states.container,
    title: 'Pet Store State',
    description: () => (
      <p>
        The <b>State Management Tool</b> shows all persisted pet data from your workflow orchestration.
        <br />
        <br />
        You can see the pet records created by the API and updated by the background jobs, 
        demonstrating how data flows through the complete workflow.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.states.row(1) }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Record Details',
    description: () => (
      <p>
        Here you can see the complete pet record including:
        <br />
        <br />
        • <b>Pet Information</b> - name, species, age
        <br />
        • <b>Status</b> - managed by the lifecycle orchestrator
        <br />
        • <b>Feeding Schedule</b> - added by the background job
        <br />
        • <b>Timestamps</b> - creation and update times
        <br />
        <br />
        This demonstrates how the workflow orchestration maintains and updates data across multiple steps!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.states }],
  },

  // End of Tutorial

  {
    title: 'Workflow Orchestration Master! 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        🎊 <b>Congratulations!</b> You've mastered Motia's workflow orchestration capabilities!
        <br />
        <br />
        You've successfully learned how to build and orchestrate complex workflows using:
        <br />
        • <b>API Steps</b> - CRUD operations with event emission
        <br />
        • <b>Event Steps</b> - Background jobs triggered by events
        <br />
        • <b>Cron Steps</b> - Scheduled maintenance tasks
        <br />
        • <b>Workflow Orchestration</b> - How these components work together seamlessly
        <br />
        <br />
        You've also mastered Motia's observability tools for monitoring and debugging complex workflows.
        <br />
        <br />
        Ready to build your own workflows? Check out our{' '}
        <a href="https://www.motia.dev/docs/getting-started/core-concepts" target="_blank">
          core concepts
        </a>{' '}
        and{' '}
        <a href="https://www.motia.dev/docs/concepts/workflows" target="_blank">
          workflow orchestration guide
        </a>
        .
        <br />
        <br />
        Join our{' '}
        <a href="https://discord.com/invite/nJFfsH5d6v" target="_blank">
          Discord community
        </a>{' '}
        to share your workflow creations and get help from other Motia developers!
        <br />
        <br />
        We're open source! Contribute to{' '}
        <a href="https://github.com/MotiaDev/motia" target="_blank">
          Motia
        </a>{' '}
        or share your{' '}
        <a href="https://github.com/MotiaDev/motia/issues" target="_blank">
          feedback
        </a>
        .
        <br />
        <br />
        Thank you for exploring the power of workflow orchestration with Motia! 🚀
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }],
  },
]
