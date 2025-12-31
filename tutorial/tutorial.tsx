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
        Welcome to the <b>Pet Management System</b> tutorial! This comprehensive
        example demonstrates how to build a complete, production-ready system
        with API endpoints, background jobs, and workflow orchestration.
        <br />
        <br />
        You'll learn how to implement:
        <br />• <b>API Steps</b> - RESTful endpoints for creating and managing
        pets
        <br />• <b>Event Steps</b> - Background jobs for async processing
        <br />• <b>Cron Steps</b> - Scheduled cleanup and maintenance tasks
        <br />• <b>Workflow Orchestration</b> - Coordinating complex business
        logic and state transitions
        <br />
        <br />
        This tutorial progresses through three key sections:
        <br />
        1️⃣ <b>API Endpoints</b> - Building the Create Pet API
        <br />
        2️⃣ <b>Background Jobs</b> - Adding async processing and scheduled tasks
        <br />
        3️⃣ <b>Workflow Orchestration</b> - Managing pet lifecycle with state
        machines
        <br />
        <br />
        💡 <b>By the end</b>, you'll understand how to build scalable,
        event-driven systems with Motia!
      </p>
    ),
  },

  // Flows

  {
    elementXpath: workbenchXPath.flows.node('tscreatepet'),
    title: 'API Step - Create Pet',
    link: 'https://www.motia.dev/docs/concepts/steps#api-trigger',
    description: () => (
      <p>
        Let's explore the <b>Create Pet API Step</b> - this is your workflow
        entry point that triggers a chain of background jobs!
        <br />
        <br />
        When a user creates a pet through the API, this step immediately returns
        a response while triggering multiple background jobs:
        <br />
        • Feeding reminder setup
        <br />
        • Status lifecycle management
        <br />
        • Data enrichment processes
        <br />
        <br />
        This pattern keeps your API responsive while handling complex processing
        in the background.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.links.flows },
      {
        type: 'click',
        selector: workbenchXPath.flows.dropdownFlow('TsPetManagement'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.flows.previewButton('tscreatepet'),
    title: 'Code Preview',
    description: () => (
      <p>
        Clicking on this icon will allow you to visualize the source code for
        the Create Pet Step.
      </p>
    ),
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
    title: 'API Endpoint Setup',
    description: () => (
      <p>
        This sets up a POST endpoint at <b>/ts/pets</b> where clients can send
        requests to create new pets.
        <br />
        <br />
        The configuration includes:
        <br />• <b>method: POST</b> - accepts POST requests
        <br />• <b>path: /ts/pets</b> - the URL for this endpoint
        <br />• <b>emits</b> - events this API will trigger (for background
        jobs!)
        <br />
        <br />
        💡 <b>Notice the emits array</b> - this is how we trigger background
        jobs when a pet is created!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.previewButton('tscreatepet'),
      },
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('api-configuration'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Request Body',
    link: 'https://zod.dev',
    description: () => (
      <p>
        This defines what data the API expects from clients:
        <br />• <b>name</b> - the pet's name (required)
        <br />• <b>species</b> - dog, cat, bird, or other
        <br />• <b>ageMonths</b> - pet's age in months
        <br />
        <br />
        Using Zod for validation means requests are automatically checked before
        your code runs. If something's missing or wrong, clients get a clear
        error message.
        <br />
        <br />
        💡 <b>Type safety and validation all in one!</b>
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('request-validation'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Creating the Pet',
    description: () => (
      <p>
        This is where the pet actually gets created! After the data is
        validated, it's sent to the store to create a new pet record.
        <br />
        <br />
        The store automatically handles:
        <br />
        • Generating a unique ID
        <br />
        • Setting the initial status
        <br />
        • Adding timestamps
        <br />
        <br />
        💡 <b>In a real app, this would be a database call</b> (like Prisma,
        MongoDB, etc.)
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('pet-creation') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Logging',
    description: () => (
      <p>
        Records that a pet was created with helpful details like ID, name, and
        species.
        <br />
        <br />
        These logs show up in the Workbench's Logs section, automatically tied
        to the request's trace ID. This makes it super easy to track what
        happened during each API call.
        <br />
        <br />
        💡 <b>Pro tip:</b> Good logging is your best friend when debugging!
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('logging') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Triggering Background Jobs',
    description: () => (
      <p>
        This is where the magic happens! After creating the pet, we emit events
        to kick off background jobs:
        <br />
        <br />• <b>ts.pet.created</b> - notifies other parts of the system about
        the new pet
        <br />• <b>ts.feeding.reminder.enqueued</b> - triggers a background job
        to set up feeding reminders
        <br />
        <br />
        The API returns immediately to the client while these background jobs
        process asynchronously. This keeps your API fast and responsive!
        <br />
        <br />
        💡 <b>This is the heart of event-driven architecture</b> - APIs stay
        fast while background jobs handle the heavy lifting.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('event-emission'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Success Response',
    description: () => (
      <p>
        Returns the newly created pet back to the client with a{' '}
        <b>201 Created</b> status code.
        <br />
        <br />
        The client gets all the pet details: ID, name, species, status, and
        timestamps. They can use this to show confirmation to the user or update
        their UI.
        <br />
        <br />
        💡 <b>201 status code</b> is the standard for "successfully created a
        new resource"
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('success-response'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Error Handling',
    description: () => (
      <p>
        Catches problems like missing required fields or invalid data types.
        <br />
        <br />
        If validation fails (like forgetting the pet's name), returns a{' '}
        <b>400 Bad Request</b> with helpful error messages showing exactly what
        went wrong.
        <br />
        <br />
        For unexpected errors, returns a <b>500 Internal Server Error</b> to let
        the client know something broke.
        <br />
        <br />
        💡 <b>Always handle errors gracefully</b> - it makes your API much
        easier to work with!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('error-handling'),
      },
    ],
  },

  // Event Steps

  {
    elementXpath: workbenchXPath.flows.node('tssetnextfeedingreminder'),
    title: 'Background Job - Feeding Reminder',
    link: 'https://www.motia.dev/docs/concepts/steps#event-trigger',
    description: () => (
      <p>
        Now let's explore a <b>Background Job</b> that processes asynchronously
        after the API responds!
        <br />
        <br />
        The <b>Feeding Reminder Job</b> runs in the background, triggered by the
        'ts.feeding.reminder.enqueued' event from the Create Pet API.
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
        💡 <b>Background jobs</b> are perfect for tasks that don't need
        immediate completion but require reliability.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Step Configuration',
    link: 'https://www.motia.dev/docs/concepts/steps#event-trigger',
    description: () => (
      <p>
        The <b>Feeding Reminder Background Job</b> is configured as an Event
        Step with job-specific attributes:
        <br /> <br />• <b>type: 'event'</b> - declares this as a background job
        processor
        <br />• <b>subscribes: ['ts.feeding.reminder.enqueued']</b> - listens
        for job queue events from the Create Pet API
        <br />• <b>emits: ['ts.feeding.reminder.completed']</b> - signals job
        completion to downstream processors
        <br /> <br />
        This creates a background job chain: API → Job Queue → Background
        Processor → Completion Event
        <br /> <br />
        💡 <b>Event Steps</b> are Motia's background job processors - they
        handle asynchronous work reliably and scalably.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.previewButton(
          'tssetnextfeedingreminder'
        ),
      },
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('step-configuration'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Event Subscription',
    description: () => (
      <p>
        The <b>subscribes</b> attribute declares which job queue this background
        processor listens to.
        <br />
        <br />
        In this case, it subscribes to 'ts.feeding.reminder.enqueued' events,
        creating a job queue for feeding reminder processing.
        <br />
        <br />
        The background job handler receives the job payload (petId and
        enqueuedAt timestamp) as the first argument.
        <br />
        <br />
        💡{' '}
        <b>
          Multiple background jobs can subscribe to the same queue, enabling
          horizontal scaling and load balancing.
        </b>
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('event-subscription'),
      },
    ],
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
        This demonstrates how background jobs can reliably process data
        asynchronously, with built-in retry mechanisms and error handling.
        <br />
        <br />
        💡 <b>Background job handlers</b> are designed to be idempotent and
        fault-tolerant.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('handler') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Pet Update Logic',
    link: 'https://www.motia.dev/docs/development-guide/state-management',
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
        This demonstrates how background jobs can perform data processing and
        enrichment asynchronously, maintaining data integrity while keeping APIs
        responsive.
        <br />
        <br />
        💡 <b>Background data processing</b> is perfect for complex calculations
        and data transformations.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('pet-update-logic'),
      },
    ],
  },

  // Cron Steps

  {
    elementXpath: workbenchXPath.flows.node('tsdeletionreaper'),
    title: 'Cron Step - Deletion Reaper',
    link: 'https://www.motia.dev/docs/concepts/steps#cron-trigger',
    description: () => (
      <p>
        Now let's explore <b>Scheduled Background Jobs</b> with Cron Steps!
        <br />
        <br />
        The <b>Deletion Reaper</b> is a scheduled background job that runs daily
        to permanently remove pets that have been soft-deleted.
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> enable automated
        maintenance and cleanup tasks:
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
        💡 <b>Scheduled background jobs</b> are perfect for maintenance tasks,
        cleanup operations, and batch processing.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Schedule Configuration',
    link: 'https://www.motia.dev/docs/concepts/steps#cron-trigger',
    description: () => (
      <p>
        The <b>Deletion Reaper</b> is configured with a cron schedule for
        reliable, scheduled background job execution.
        <br />
        <br />
        The schedule '0 2 * * *' means it runs daily at 2:00 AM to permanently
        remove soft-deleted pets.
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> enable automated
        maintenance:
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
      {
        type: 'click',
        selector: workbenchXPath.flows.previewButton('tsdeletionreaper'),
      },
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('cron-configuration'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Cron Step Handler',
    description: () => (
      <p>
        The <b>Deletion Reaper</b> scheduled background job performs automated
        cleanup by:
        <br />
        <br />
        • Finding all pets that have been soft-deleted and are past their purge
        date
        <br />
        • Permanently removing them from the store in batches
        <br />
        • Logging the cleanup operation for audit and compliance
        <br />
        • Handling errors gracefully with retry logic
        <br />
        <br />
        This demonstrates how <b>scheduled background jobs</b> can perform
        maintenance tasks automatically, completing the background job
        ecosystem: API → Event-driven Jobs → Scheduled Cleanup Jobs.
        <br />
        <br />
        💡 <b>Scheduled background jobs</b> ensure your system stays clean and
        compliant without manual intervention.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.feature('handler') },
    ],
  },

  // Workflow Orchestration - Pet Lifecycle Orchestrator

  {
    elementXpath: workbenchXPath.flows.node('tspetlifecycleorchestrator'),
    title: 'Workflow Orchestration - Lifecycle Management',
    link: 'https://www.motia.dev/docs/concepts/steps#event-trigger',
    description: () => (
      <p>
        Now let's explore <b>Workflow Orchestration</b> with the Pet Lifecycle
        Orchestrator!
        <br />
        <br />
        This orchestrator manages the entire lifecycle of a pet from creation to
        adoption, handling status transitions like:
        <br />
        • Quarantine → Healthy → Available
        <br />
        • Illness → Treatment → Recovery
        <br />
        • Adoption process management
        <br />
        <br />
        This demonstrates how <b>workflow orchestration</b> coordinates multiple
        steps and enforces business rules across your system.
        <br />
        <br />
        💡 <b>Workflow orchestrators</b> are the brain of your system - they
        ensure everything flows correctly!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Orchestrator Configuration',
    description: () => (
      <p>
        The lifecycle orchestrator is an <b>Event Step</b> that listens for
        three types of events:
        <br />
        <br />• <b>ts.pet.created</b> - when a new pet is added
        <br />• <b>ts.feeding.reminder.completed</b> - when feeding setup
        finishes
        <br />• <b>ts.pet.status.update.requested</b> - when staff requests a
        status change
        <br />
        <br />
        By subscribing to these events, the orchestrator can manage the pet's
        entire lifecycle automatically.
        <br />
        <br />
        💡 <b>Notice:</b> It has no emits! The orchestrator directly updates pet
        status instead of emitting events.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.node('tspetlifecycleorchestrator'),
      },
      {
        type: 'click',
        selector: workbenchXPath.flows.previewButton(
          'tspetlifecycleorchestrator'
        ),
      },
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('orchestrator-configuration'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Transition Rules',
    description: () => (
      <p>
        These rules define all valid status transitions for pets - think of them
        as the "business rules" of your workflow.
        <br />
        <br />
        Each rule specifies:
        <br />• <b>from</b> - what status(es) the pet can be in
        <br />• <b>to</b> - what status it transitions to
        <br />• <b>event</b> - what triggers this transition
        <br />• <b>description</b> - why this transition happens
        <br />
        <br />
        For example: A pet in quarantine can only move to "healthy" when staff
        does a health check.
        <br />
        <br />
        💡 <b>Defining clear rules</b> ensures your workflow stays consistent
        and predictable!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('transition-rules'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Finding the Right Rule',
    description: () => (
      <p>
        When an event comes in, the orchestrator searches through all the
        transition rules to find one that matches:
        <br />
        <br />• The pet's <b>current status</b>
        <br />• The <b>requested new status</b> (if applicable)
        <br />• The <b>event type</b> that triggered it
        <br />
        <br />
        This ensures only valid transitions can happen - you can't skip steps!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('rule-validation'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Rejecting Invalid Transitions',
    description: () => (
      <p>
        If no valid rule is found (like trying to mark a quarantined pet as
        adopted), the transition is rejected.
        <br />
        <br />
        The orchestrator logs exactly why it was rejected - which helps staff
        understand what went wrong and what they need to do instead.
        <br />
        <br />
        💡 <b>Clear rejection reasons</b> make your workflow much easier to use
        and debug!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('transition-rejection'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Applying the Transition',
    description: () => (
      <p>
        When a valid rule is found, the orchestrator updates the pet's status in
        the store.
        <br />
        <br />
        This is where the actual state change happens - the pet moves from one
        lifecycle stage to the next.
        <br />
        <br />
        If the update fails for any reason, the orchestrator logs the error and
        stops.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('status-update'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Transition Logging',
    description: () => (
      <p>
        Every successful transition is logged with full details:
        <br />
        • What status the pet was in
        <br />
        • What status it moved to
        <br />
        • Why the transition happened
        <br />
        • When it happened
        <br />
        <br />
        These logs create a complete audit trail of each pet's lifecycle, making
        it easy to track their journey.
        <br />
        <br />
        💡 <b>Good logging</b> is essential for compliance, debugging, and
        understanding how your workflow performs!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('transition-logging'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Automatic Progressions',
    description: () => (
      <p>
        Here's where workflow orchestration gets powerful! Some transitions
        automatically trigger follow-up transitions.
        <br />
        <br />
        For example:
        <br />• When a pet becomes <b>healthy</b> → automatically mark as{' '}
        <b>available</b> for adoption
        <br />• When a pet is marked <b>ill</b> → automatically start{' '}
        <b>treatment</b>
        <br />• When a pet <b>recovers</b> → automatically mark as{' '}
        <b>healthy</b> → then <b>available</b>
        <br />
        <br />
        This reduces manual work and ensures the workflow flows smoothly without
        staff having to remember every step!
        <br />
        <br />
        💡 <b>Automatic progressions</b> are like dominoes - one action triggers
        the next automatically!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.flows.feature('automatic-progression'),
      },
    ],
  },

  // Endpoints

  {
    elementXpath: workbenchXPath.links.endpoints,
    title: 'Testing the Complete Workflow',
    description: () => (
      <p>
        Now that we've explored API endpoints, background jobs, and workflow
        orchestration, let's test the complete system!
        <br />
        <br />
        💡 The Endpoints section shows all API Steps and provides tools to test
        them, triggering the entire workflow.
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
        <br />• <b>POST /ts/pets</b> - Create a new pet (triggers background job
        chain)
        <br />• <b>GET /ts/pets/:id</b> - Retrieve a specific pet
        <br />• <b>PUT /ts/pets/:id</b> - Update pet information
        <br />• <b>DELETE /ts/pets/:id</b> - Soft-delete a pet (scheduled for
        cleanup)
        <br />
        <br />
        💡 Let's test the Create Pet endpoint to see the complete background job
        orchestration in action!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.endpoints }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Create Pet API Documentation',
    description: () => (
      <p>
        This section provides documentation for the{' '}
        <b>Create Pet API endpoint</b>.
        <br />
        <br />
        The <b>Details</b> tab shows the API specification, and the <b>Call</b>{' '}
        tab provides a form to test the endpoint.
        <br />
        <br />
        When you create a pet, it will trigger the complete background job
        chain: API → Event-driven Jobs → Scheduled Cleanup Jobs!
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets'),
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'Test Create Pet API',
    description: () => (
      <p>
        This form allows you to test the <b>Create Pet API</b> and see the
        complete background job orchestration in action!
        <br />
        <br />
        When you create a pet, watch how the API immediately returns while
        background jobs process asynchronously:
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
        💡 The <b>bodySchema</b> provides automatic validation and sample
        request payload.
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
              ageMonths: 24,
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
        Click the <b>Play</b> button to create a pet and trigger the complete
        background job orchestration!
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
        Watch how the API stays responsive while background jobs handle the
        heavy lifting!
      </p>
    ),
    before: [
      {
        type: 'fill-editor',
        content: {
          name: 'Buddy',
          species: 'dog',
          ageMonths: 24,
        },
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Pet Created Successfully!',
    description: () => (
      <p>
        🎉 <b>Pet created successfully!</b> The API returned a 201 status with
        the new pet details.
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
        <b>Background jobs are now queued and processing!</b> The API responded
        immediately while background jobs handle:
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
        🎉 <b>Amazing!</b> You've successfully triggered the complete pet
        management workflow!
        <br />
        <br />
        Now let's observe the <b>workflow orchestration</b> using Workbench's
        powerful observability tools.
        <br />
        <br />
        The <b>Tracing</b> section shows all workflow executions grouped by{' '}
        <b>trace ID</b>, allowing you to see how the API → Background Job →
        Orchestrator chain executed.
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.closePanelButton,
        optional: true,
      },
      { type: 'click', selector: workbenchXPath.links.tracing },
    ],
  },
  {
    elementXpath: workbenchXPath.tracing.trace(1),
    title: 'Pet Management Workflow Trace',
    description: () => (
      <p>
        Here you can see the <b>complete workflow orchestration</b> for your pet
        creation!
        <br />
        <br />
        The trace ID links all related step executions: Create Pet API → Feeding
        Reminder Job → Lifecycle Orchestrator.
        <br />
        <br />
        Click on the trace to see the detailed execution timeline and how each
        step connected to the next.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.tracing.trace(1) }],
  },
  {
    elementXpath: workbenchXPath.tracing.details,
    title: 'Workflow Execution Timeline',
    description: () => (
      <p>
        This timeline shows the <b>complete workflow orchestration</b>{' '}
        execution:
        <br />
        <br />• <b>Create Pet API</b> - Handled the HTTP request and emitted
        events
        <br />• <b>Feeding Reminder Job</b> - Background job that updated pet
        with feeding schedule
        <br />• <b>Lifecycle Orchestrator</b> - Managed pet status transitions
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
        Click on any <b>timeline segment</b> to see detailed execution
        information for that step.
        <br />
        <br />
        You can see execution time, logs, and how each step contributed to the
        overall workflow orchestration.
        <br />
        <br />
        This demonstrates Motia's powerful observability for complex, multi-step
        workflows.
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Workflow Step Details',
    description: () => (
      <p>
        This <b>Trace Details View</b> shows detailed execution information for
        each step in your workflow orchestration.
        <br />
        <br />
        You can see logs, execution time, and context for each step: Create Pet
        API, Feeding Reminder Job, and Lifecycle Orchestrator.
        <br />
        <br />
        💡 For more detailed logs, use the <b>Logs Tool</b> to dive deeper into
        the workflow execution.
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
        Let's examine the detailed logs from your{' '}
        <b>pet management workflow orchestration</b>!
        <br />
        <br />
        The Logs Tool shows all execution logs with trace IDs, making it easy to
        follow the complete workflow.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.links.logs }],
  },
  {
    elementXpath: workbenchXPath.logs.traceColumn(1),
    title: 'Trace-Based Log Filtering',
    description: () => (
      <p>
        Each log entry shows the associated <b>Trace ID</b> from your workflow
        execution.
        <br />
        <br />
        Click on a <b>Trace ID</b> to filter logs and see the complete execution
        flow:
        <br />
        • Create Pet API logs
        <br />
        • Feeding Reminder Job logs
        <br />
        • Lifecycle Orchestrator logs
        <br />
        <br />
        💡 This trace-based filtering makes debugging complex workflows much
        easier!
      </p>
    ),
  },
  {
    elementXpath: workbenchXPath.logs.searchContainer,
    title: 'Workflow Log Search',
    description: () => (
      <p>
        The search is now filtered to show only logs from your{' '}
        <b>pet management workflow trace</b>.
        <br />
        <br />
        This gives you a complete view of how the API → Background Job →
        Orchestrator chain executed.
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
        <br />• <b>Log Level</b> and <b>Timestamp</b>
        <br />• <b>Step Name</b> (Create Pet, Feeding Reminder, etc.)
        <br />• <b>Flow Name</b> (TsPetManagement)
        <br />• <b>Trace ID</b> linking all related executions
        <br />• <b>Context Data</b> like petId, status changes, etc.
        <br />
        <br />
        This provides complete visibility into your workflow orchestration!
      </p>
    ),
  },

  // End of Tutorial

  {
    title: 'Workflow Orchestration Completed! 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        🎊 <b>Congratulations!</b> You've mastered Motia's workflow
        orchestration capabilities!
        <br />
        <br />
        You've successfully learned how to build and orchestrate complex
        workflows using:
        <br />• <b>API Steps</b> - CRUD operations with event emission
        <br />• <b>Event Steps</b> - Background jobs triggered by events
        <br />• <b>Cron Steps</b> - Scheduled maintenance tasks
        <br />• <b>Workflow Orchestration</b> - How these components work
        together seamlessly
        <br />
        <br />
        You've also mastered Motia's observability tools for monitoring and
        debugging complex workflows.
        <br />
        <br />
        Ready to build your own workflows? Check out our{' '}
        <a
          href="https://www.motia.dev/docs/getting-started/core-concepts"
          target="_blank"
        >
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
        to share your workflow creations and get help from other Motia
        developers!
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
        Thank you for exploring the power of workflow orchestration with Motia!
        🚀
      </p>
    ),
    before: [
      {
        type: 'click',
        selector: workbenchXPath.closePanelButton,
        optional: true,
      },
    ],
  },
]
