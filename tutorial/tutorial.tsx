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
        Motia is an all-in-one framework for modern backend systems. Every backend pattern, API endpoints, background jobs, queues, workflows, AI agents, streaming, observability, and state, is expressed with the same primitive.
        <br />
        <br />
        This tutorial focuses on building <b>CRUD API endpoints</b> - the fundamental building blocks of most web applications.
        You'll learn how to create, read, update, and delete resources using Motia's API Steps.
        <br />
        <br />
        Let's start with <b>Workbench</b>, it is a development tool provided by Motia's ecosystem, from here you'll be
        able to visualize your API endpoints and test them interactively.
        <br />
        <br />
        💡 If you are already familiar with Motia, you can skip this tutorial.
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
        This is the first step in building a complete CRUD API - you'll create, read, update, and delete pet resources.
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
    title: 'Step Config',
    description: () => (
      <div>
        <p>
          All Steps are defined by two main components, the <b>configuration</b> and the <b>handler</b>.
          <br />
          <br />
        Let's start with the configuration, the common config attributes are
        <i> type, name, description, and flows</i>.
        <br />
        <br />
        </p>
        <ul>
        <li>
          The <b>type</b> attribute is important since it declares the type of Step
        </li>
          <li>
            The <b>flows</b> attribute will associate your Step with a given flow or set of flows.
          </li>
          <li>
            The <b>name</b> and <b>description</b> attributes will provide context in the visualization and
            observability tools.
          </li>
        </ul>
      </div>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tscreatepet') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'API Step Configuration',
    description: () => (
      <p>
        There are specific configuration attributes for an API Step. Let's start with the <b>method</b> attribute. This
        will declare the type of HTTP method used to talk to your API Step.
        <br />
        <br />
        Through the <b>path</b> attribute you'll declare the url path used to trigger your API Step
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Request Validation',
    link: 'https://zod.dev',
    description: () => (
      <p>
        This step demonstrates how to validate incoming request data to ensure it meets expected requirements.
        <br />
        <br />
        <i>💡 Input validation is crucial for API security and data integrity</i>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('request-validation') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'HTTP Response',
    link: 'https://zod.dev',
    description: () => (
      <p>
        The handler returns appropriate HTTP responses with proper status codes and response data.
        <br />
        <br />
        <i>💡 Proper HTTP responses help clients understand the result of their requests</i>
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
        <br />
        <br />
        💡 <b>For this CRUD tutorial, we're focusing on simple API endpoints without complex event flows.</b>
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
        <b>event emitter</b>, and <b>trace id</b>.<br />
        <br />
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('logging') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'HTTP Response',
    description: () => (
      <p>
        Now let's wrap our API Step and return a response.
        <br />
        <br />
        <br />
        You simply need to return an object that complies with one of the <b>responseSchema</b> definitions
        declared in your Step configuration.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('success-response') }],
  },

  // GET API Step

  {
    elementXpath: workbenchXPath.flows.node('tslistpets'),
    title: 'List Pets API Step',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Now let's explore the <b>READ</b> operation in our CRUD API. This step allows you to
        retrieve all pets from the system.
        <br />
        <br />
        This demonstrates a simple GET endpoint that doesn't require any request body or complex processing.
        <br />
        <br />
        💡 <b>READ operations (GET) are typically the simplest in CRUD APIs - they just retrieve data without modifying it.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'List Pets API Step',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        This step shows how to implement a simple GET API endpoint.
        <br /> <br />
        Unlike the create pet step, this one doesn't require any request validation or complex processing.
        <br /> <br />
        It simply retrieves all pets from the store and returns them to the client.
        <br /> <br />
        💡 GET endpoints are typically used for retrieving data without modifying the system state.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tslistpets') },
      { type: 'click', selector: workbenchXPath.flows.feature('step-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'No Events Emitted',
    description: () => (
      <p>
        Notice that this step doesn't emit any events, unlike the CREATE step.
        <br />
        <br />
        This is because GET operations are typically simple read operations that don't need to trigger other processes.
        <br />
        <br />
        The empty emits array indicates this step is focused purely on data retrieval.
        <br />
        <br /> 💡 <b>GET endpoints are usually the end of a flow rather than triggering other steps.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('no-emissions') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'List Pets Handler',
    description: () => (
      <p>
        Let's take a look at the <b>List Pets</b> Step Handler.
        <br />
        <br />
        The handler is very simple for this GET endpoint - it just calls the store's list method and returns the data.
        <br />
        <br />
        💡 GET endpoints typically have simpler handlers since they don't need complex validation or data processing.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('handler') }],
  },

  // UPDATE API Step

  {
    elementXpath: workbenchXPath.flows.node('tsupdatepet'),
    title: 'Update Pet API Step',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Let's continue with the <b>UPDATE</b> operation in our CRUD API. So far you've learned about <b>CREATE</b> and{' '}
        <b>READ</b> operations.
        <br />
        <br />
        Now let's explore the <b>UPDATE</b> operation, which allows you to modify existing pet records.
        <br />
        <br />
        💡 <b>UPDATE operations use PUT/PATCH HTTP methods and typically require both path parameters and request body.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Update Configuration',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        <b>UPDATE</b> Steps are similar to the other API Step types, they are composed by a configuration and a handler.
        <br />
        <br />
        The <b>UPDATE</b> Step config uses a <b>PUT</b> method and includes path parameters to identify which resource to update.
        <br />
        <br />
        Let's look at the specific configuration for update operations.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsupdatepet') },
      { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Path Parameters',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Notice how this step uses <b>:id</b> in the path to capture the pet ID that should be updated.
        <br />
        <br />
        Path parameters allow you to identify specific resources in RESTful APIs. The <b>:id</b> will be available in the handler as <b>req.pathParams.id</b>.
        <br />
        <br />
        💡 <b>Path parameters are essential for resource identification in UPDATE and DELETE operations.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('path-parameters') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Selective Update Logic',
    description: () => (
      <p>
        This step demonstrates selective updating - only the fields provided in the request body are updated.
        <br />
        <br />
        The handler builds a patch object with only valid fields, leaving other pet properties unchanged.
        <br />
        <br />
        💡 <b>Selective updates prevent accidentally clearing data when clients send partial updates.</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('selective-update') }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'Update Step Handler',
    description: () => (
      <p>
        The <b>UPDATE</b> Step handler receives the request object which includes both the request body and path parameters.
        <br />
        <br />
        In this UPDATE Step example we are selectively updating pet properties based on what's provided in the request body,
        using the pet ID from the path parameters to identify which pet to update.
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
        Now that we've explored the different CRUD API Step types, let's test our API endpoints from the <b>endpoints</b> section in
        Workbench.
        <br />
        <br />
        💡 All of your API Steps declare HTTP endpoints that can be reviewed and tested from the <b>Endpoints</b>{' '}
        section. This is perfect for testing your complete CRUD API.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.endpoints.endpoint('POST', '/ts/pets'),
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
    before: [{ type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') }],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'Request Payload',
    description: () => (
      <p>
        Thanks to the <b>bodySchema</b> attribute, you get an auto-generated sample request payload.
        <br />
        <br />
        The tutorial will fill in sample data:
        <br />
        <br />
        <code style={{ 
          display: 'block', 
          backgroundColor: 'var(--color-bg-secondary)', 
          color: 'var(--color-text-primary)',
          padding: '10px', 
          borderRadius: '4px', 
          whiteSpace: 'pre',
          border: '1px solid var(--color-border)'
        }}>
          {JSON.stringify({ name: 'Buddy', species: 'dog', ageMonths: 18 }, null, 2)}
        </code>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.playButton,
    title: 'API Endpoint Test',
    description: () => (
      <p>
        The tutorial has automatically filled in a sample request payload for you. You can click on the <b>Play</b> button to trigger an HTTP request
        against your API endpoint.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
            name: 'Buddy',
          species: 'dog',
            ageMonths: 18,
        },
      },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Test Result',
    description: () => (
      <p>
        Once your request has been resolved, you will see the response from here.
        <br />
        <br />
        The POST request should return a 201 Created status with the newly created pet data.
        <br />
        <br />
        💡 <b>POST operations typically return 201 Created for successful resource creation.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Pet Created Successfully',
    description: () => (
      <p>
        Excellent! The POST endpoint successfully created a new pet.
        <br />
        <br />
        You can see the response showing the created pet with its assigned ID, name, species, age, and timestamps.
        <br />
        <br />
        💡 <b>The system automatically assigned an ID and timestamps to the new pet.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true }
    ],
  },

  // Test GET Endpoints

  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'List All Pets',
    description: () => (
      <p>
        Let's test GET /ts/pets to list all pets. <b>Check the response to see what pet IDs exist</b> - you'll use these IDs in the next steps.
        <br />
        <br />
        <b>If the list is empty:</b> Create a pet first using POST /ts/pets at the top of the endpoints list.
        <br />
        <br />
        💡 <b>GET collection endpoints return arrays.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('GET', '/ts/pets') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Get Single Pet',
    description: () => (
      <p>
        Now let's test GET /ts/pets/:id. Check the previous response to see what pet IDs exist, then use that ID.
        <br />
        <br />
        <b>💡 If you see 404 "Pet not found":</b> Create a pet first using POST /ts/pets, then come back here.
        <br />
        <br />
        💡 <b>GET with path parameters return single objects, not arrays.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('GET', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
          id: '1'
        },
      },
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },

  // Test PUT Endpoint

  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Update Pet',
    description: () => (
      <p>
        Let's test PUT /ts/pets/:id. Payload: <code>{JSON.stringify({ name: 'Updated Buddy', status: 'available', ageMonths: 20 })}</code>
        <br />
        <br />
        <b>💡 If you see 404:</b> The pet was deleted or doesn't exist. Create a new pet with POST /ts/pets first.
        <br />
        <br />
        💡 <b>PUT allows selective updates - only provided fields change.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('PUT', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
          id: '1',
          name: 'Updated Buddy',
          status: 'available',
          ageMonths: 20
        },
      },
      { type: 'click', selector: workbenchXPath.endpoints.playButton }
    ],
  },

  // Test DELETE Endpoint

  {
    elementXpath: workbenchXPath.endpoints.response,
    title: 'Delete Pet',
    description: () => (
      <p>
        Finally, let's test DELETE /ts/pets/:id to remove a pet.
        <br />
        <br />
        <b>Success:</b> 204 No Content (pet deleted) | <b>404:</b> Pet already deleted or doesn't exist - that's okay!
        <br />
        <br />
        💡 <b>DELETE operations are destructive - use carefully in production!</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('DELETE', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
      {
        type: 'fill-editor',
        content: {
          id: '1'
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
        Great! You have tested your CRUD API endpoints, now let's take a look at the execution traces using Workbench's
        observability tools.
        <br />
        <br />
        Let's start with <b>tracing</b>, in this section you will be able to see all of your API endpoint executions grouped by{' '}
        <b>trace id</b>.
        <br />
        <br />
        💡 <b>Each API call creates a trace that you can follow through the system for debugging and monitoring.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.tracing }
    ],
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
    elementXpath: workbenchXPath.links.logs,
    title: 'Logs',
    description: () => (
      <p>
        Let's take a look at your API execution logs. The <b>Logs Tool</b> shows all log messages from your CRUD operations.
        <br />
        <br />
        You can see logs from all your API endpoint calls, including request details, validation results, and responses.
        <br />
        <br />
        💡 <b>Logs help you debug your CRUD API endpoints and monitor their performance.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
      { type: 'click', selector: workbenchXPath.links.logs }
    ],
  },


  // End of Tutorial

  {
    title: 'Congratulations 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed our Motia CRUD API tutorial! 🎉
        <br />
        <br />
        You've learned how to build a complete CRUD API using Motia's API Steps:
        <br />
        • <b>CREATE</b> - POST endpoints for creating new resources
        <br />
        • <b>READ</b> - GET endpoints for retrieving data (single and list)
        <br />
        • <b>UPDATE</b> - PUT endpoints for modifying existing resources
        <br />
        • <b>DELETE</b> - DELETE endpoints for removing resources
        <br />
        <br />
        You also learned how to navigate Workbench, test API endpoints, and monitor execution traces and logs.
        <br />
        <br />
        We recommend you give our{' '}
        <a href="https://www.motia.dev/docs/concepts" target="_blank">
          core concepts
        </a>{' '}
        a read if you wish to learn further about Motia's advanced features like event-driven architecture and background jobs.
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
        Thank you for completing our CRUD API tutorial!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
]



