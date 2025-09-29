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
        background jobs, scheduled tasks and agentic workflow orchestration through a unified runtime. Thanks to its
        event driven architecture you can run tasks in parallel, stream data to clients, or allow for seamless
        orchestration of flows.
        <br />
        <br />
        Let's start with <b>Workbench</b>, it is a development tool provided by Motia's ecosystem, from here you'll be
        able to visualize your flows and observe their behavior.
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
        Let's evaluate the Step that will allow you to receive traffic from external applications. This API Step allows
        you to create new pets by exposing an HTTP endpoint for external traffic.
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('http-response') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('logger') }],
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
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('http-response') }],
  },

  // GET API Step

  {
    elementXpath: workbenchXPath.flows.node('tslistpets'),
    title: 'List Pets API Step',
    link: 'https://www.motia.dev/docs/concepts/steps/api',
    description: () => (
      <p>
        Now let's look at another API Step that demonstrates different functionality. This step allows you to
        retrieve all pets from the system.
        <br />
        <br />
        This demonstrates a simple GET endpoint that doesn't require any request body or complex processing.
        <br />
        <br />
        💡 Different API Steps can have different HTTP methods and serve different purposes in your application.
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
        Let's do a recap of what you've learned, thus far you've become familiar with <b>CREATE</b> and{' '}
        <b>READ</b> API operations.
        <br />
        <br />
        You've also started to learn how to navigate around Workbench. Let's complete the CRUD operations by looking at the
        <b>UPDATE</b> operation. Let's take a deeper look at its definition.
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
        Now that we've looked at different API Step types, let's trigger the API Step from the <b>endpoints</b> section in
        Workbench.
        <br />
        <br />
        💡 All of your API Steps declare HTTP endpoints that can be reviewed and tested from the <b>Endpoints</b>{' '}
        section in Workbench.
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
          {`curl -X POST http://localhost:3000/ts/pets \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: 'Jack',
    species: 'dog',
    ageMonths: 24,
  }, null, 2)}'`}
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
          name: 'Jack',
          species: 'dog',
          ageMonths: 24,
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

  // Test GET Single Pet Endpoint

  {
    elementXpath: workbenchXPath.endpoints.endpoint('GET', '/ts/pets/:id'),
    title: 'Get Single Pet',
    description: () => (
      <p>
        Now let's test the GET endpoint to retrieve a specific pet by ID. This demonstrates how path parameters work in GET requests.
        <br />
        <br />
        Click on the GET /ts/pets/:id endpoint to test fetching a single pet.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'GET with Path Parameters',
    description: () => (
      <p>
        This GET endpoint uses path parameters to identify which specific pet to retrieve.
        <br />
        <br />
        Notice the <b>:id</b> in the path - this allows clients to request specific resources.
        <br />
        <br />
        💡 <b>GET endpoints with path parameters are perfect for retrieving individual resources.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('GET', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsgetpet') },
      { type: 'click', selector: workbenchXPath.flows.feature('path-parameters') },
    ],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'GET Handler Logic',
    description: () => (
      <p>
        The GET handler demonstrates simple resource retrieval logic.
        <br />
        <br />
        It uses the path parameter to find the specific pet and returns either the pet data or a 404 error.
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
          {`curl http://localhost:3000/ts/pets/1`}
        </code>
        <br />
        💡 <b>Always return proper HTTP status codes (200 for found, 404 for not found).</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.flows.feature('get-operation') }],
  },

  // Test GET All Pets Endpoint

  {
    elementXpath: workbenchXPath.endpoints.endpoint('GET', '/ts/pets'),
    title: 'Test GET All Pets',
    description: () => (
      <p>
        Now let's test the GET endpoint to retrieve all pets. This endpoint returns a list of all pets in the system.
        <br />
        <br />
        Click on the GET /ts/pets endpoint to test the list functionality.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.endpoints.playButton,
    title: 'Test GET Request',
    description: () => (
      <p>
        GET requests are simple - no request body needed! Just click the <b>Play</b> button to retrieve all pets.
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
          {`curl http://localhost:3000/ts/pets`}
        </code>
        <br />
        💡 This should return the pet you just created in the previous step.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('GET', '/ts/pets') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
    ],
  },

  // Test PUT Endpoint

  {
    elementXpath: workbenchXPath.endpoints.endpoint('PUT', '/ts/pets/:id'),
    title: 'Test UPDATE Endpoint',
    description: () => (
      <p>
        Now let's test the PUT endpoint to update a pet. This endpoint requires both a path parameter (pet ID) and a request body.
        <br />
        <br />
        Click on the PUT /ts/pets/:id endpoint to test the update functionality.
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.endpoints.callPanel,
    title: 'UPDATE Request Body',
    description: () => (
      <p>
        For UPDATE operations, you only need to provide the fields you want to change. The handler will selectively update only those fields.
        <br />
        <br />
        Example update payload:
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
          {`curl -X PUT http://localhost:3000/ts/pets/1 \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: 'Updated Jack',
    status: 'available',
    ageMonths: 30,
  }, null, 2)}'`}
        </code>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('PUT', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.playButton,
    title: 'Test PUT Request',
    description: () => (
      <p>
        Enter the pet ID in the path parameter field (try "1" if you created a pet earlier) and provide update data in the request body using the example above.
        <br />
        <br />
        💡 Try updating the pet's name, status, or age to see how selective updates work.
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
    ],
  },

  // Test DELETE Endpoint

  {
    elementXpath: workbenchXPath.endpoints.endpoint('DELETE', '/ts/pets/:id'),
    title: 'Test DELETE Endpoint',
    description: () => (
      <p>
        Finally, let's test the DELETE endpoint to remove a pet. This endpoint only requires a path parameter.
        <br />
        <br />
        Click on the DELETE /ts/pets/:id endpoint to test the delete functionality.
        <br />
        <br />
        💡 <b>DELETE operations are destructive - use them carefully in production!</b>
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
  {
    elementXpath: workbenchXPath.sidebarContainer,
    title: 'DELETE Operation',
    description: () => (
      <p>
        DELETE endpoints are the simplest - they just need to identify which resource to remove using path parameters.
        <br />
        <br />
        The handler returns either 204 No Content (success) or 404 Not Found (pet doesn't exist).
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
          {`curl -X DELETE http://localhost:3000/ts/pets/1`}
        </code>
        <br />
        💡 <b>DELETE operations should be idempotent - safe to call multiple times.</b>
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.endpoint('DELETE', '/ts/pets/:id') },
      { type: 'click', selector: workbenchXPath.flows.previewButton('tsdeletepet') },
      { type: 'click', selector: workbenchXPath.flows.feature('delete-operation') },
    ],
  },
  {
    elementXpath: workbenchXPath.endpoints.playButton,
    title: 'Test DELETE Request',
    description: () => (
      <p>
        DELETE requests only need the resource ID in the path parameter (try "1"). No request body required.
        <br />
        <br />
        Click the <b>Play</b> button to delete the pet (you can create another one later to test again).
      </p>
    ),
    before: [
      { type: 'click', selector: workbenchXPath.endpoints.callTab },
    ],
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
    title: 'Congratulations 🎉',
    link: 'https://www.motia.dev/docs',
    description: () => (
      <p>
        You've completed our Motia basics tutorial!
        <br />
        <br />
        You've learned about Motia's Step types, how to navigate around Workbench, and how to build a complete CRUD API using different HTTP methods.
        <br />
        <br />
        We recommend you give our{' '}
        <a href="https://www.motia.dev/docs/concepts" target="_blank">
          core concepts
        </a>{' '}
        a read if you wish to learn further about Motia's fundamentals.
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
        Thank you for going this far in our tutorial!
      </p>
    ),
    before: [{ type: 'click', selector: workbenchXPath.closePanelButton }],
  },
]
