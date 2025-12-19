## Deployment via Motia Workbench (UI-based)

This project can be deployed directly from the **Motia Workbench** without using the CLI.
This method is recommended for users who prefer a visual workflow-driven deployment.

---

### Create Project in Motia Workbench

1. Open **Motia Workbench** in your browser
2. Create a new project
3. Import or build the Pet Management workflow
4. Register all steps successfully:
   - API steps
   - Background jobs
   - Orchestrator
   - AI agents
   - Streams
5. Verify the workflow graph renders correctly
6. Ensure the project is in **Running** state

At this point, the project should be fully functional inside the Workbench.

---

### 2️⃣ Configure Environment Variables

In the Workbench project settings, configure:


This is required for AI agents (Profile Enrichment, Health Review, Adoption Review).

---

### 3️⃣ Import Project into Motia Cloud

1. Open **Motia Cloud**
2. Navigate to **Projects**
3. Select **Import Existing Project**
4. Choose the **running port name** from Workbench
5. Confirm import

Motia Cloud will:
- Package the workflow
- Deploy APIs, jobs, agents, and streams
- Expose a public URL

---

### 4️⃣ Verify Deployment

Once deployment completes, Motia Cloud provides a **public base URL**:

