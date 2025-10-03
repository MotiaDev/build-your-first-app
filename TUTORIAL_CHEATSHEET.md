# Tutorial System Cheat Sheet

Quick reference for creating tutorials.

## Features.json Template

```json
[
  {
    "id": "kebab-case-id",
    "title": "Display Title",
    "description": "What this code does",
    "lines": ["10-20"]
  }
]
```

**File naming:** `<stepfile>-features.json`  
Example: `create-pet.step.ts-features.json`

---

## Tutorial.tsx Template

```typescript
{
  elementXpath: workbenchXPath.sidebarContainer,
  title: 'Step Title',
  description: () => (
    <p>
      Description with <b>bold</b> text.
      <br />
      <br />
      💡 <b>Tip:</b> Useful information.
    </p>
  ),
  before: [
    { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
    { type: 'click', selector: workbenchXPath.links.flows },
    { type: 'click', selector: workbenchXPath.flows.node('stepname') },
    { type: 'click', selector: workbenchXPath.flows.previewButton('stepname') },
    { type: 'click', selector: workbenchXPath.flows.feature('feature-id') }
  ],
  link: 'https://optional-link.com'
}
```

---

## Common Selectors

### Navigation
```typescript
workbenchXPath.links.flows
workbenchXPath.links.endpoints
workbenchXPath.links.tracing
workbenchXPath.links.logs
workbenchXPath.links.states
```

### Flows
```typescript
workbenchXPath.flows.node('stepname')           // lowercase step name
workbenchXPath.flows.previewButton('stepname')
workbenchXPath.flows.feature('feature-id')      // from features.json
workbenchXPath.sidebarContainer
workbenchXPath.closePanelButton
```

### Endpoints
```typescript
workbenchXPath.endpoints.endpoint('POST', '/path')
workbenchXPath.endpoints.callTab
workbenchXPath.endpoints.playButton
workbenchXPath.endpoints.response
```

---

## Common Patterns

### Navigate to Code Feature
```typescript
before: [
  { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
  { type: 'click', selector: workbenchXPath.links.flows },
  { type: 'click', selector: workbenchXPath.flows.node('tscreatepet') },
  { type: 'click', selector: workbenchXPath.flows.previewButton('tscreatepet') },
  { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }
]
```

### Test API Endpoint
```typescript
before: [
  { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
  { type: 'click', selector: workbenchXPath.links.endpoints },
  { type: 'click', selector: workbenchXPath.endpoints.endpoint('POST', '/ts/pets') },
  { type: 'click', selector: workbenchXPath.endpoints.callTab },
  { type: 'fill-editor', content: { name: 'Fluffy', species: 'cat' } },
  { type: 'click', selector: workbenchXPath.endpoints.playButton }
]
```

### Navigate to Section (Simple)
```typescript
before: [
  { type: 'click', selector: workbenchXPath.closePanelButton, optional: true },
  { type: 'click', selector: workbenchXPath.links.logs }
]
```

---

## Common Feature IDs

- `api-configuration`
- `step-configuration`
- `cron-configuration`
- `request-validation`
- `response-schema`
- `success-response`
- `error-handling`
- `handler`
- `event-emission`
- `event-subscription`
- `input-schema`
- `logging`
- `business-logic`

---

## Step Name Conversion

| Step Config | Node Name |
|-------------|-----------|
| `TsCreatePet` | `tscreatepet` |
| `TsSetNextFeedingReminder` | `tssetnextfeedingreminder` |
| `TsDeletionReaper` | `tsdeletionreaper` |

**Rule:** Lowercase, no special characters

---

## Checklist

### Creating Features.json
- [ ] File named correctly: `<stepfile>-features.json`
- [ ] All IDs are unique and kebab-case
- [ ] Line numbers are accurate
- [ ] Descriptions are clear
- [ ] No overlapping line ranges

### Creating Tutorial Step
- [ ] Title is descriptive
- [ ] Description uses JSX formatting
- [ ] Navigation starts with closePanelButton (optional)
- [ ] Navigation flows logically
- [ ] Feature IDs match features.json
- [ ] Step names are lowercase
- [ ] Tested the step

### Testing
- [ ] Run tutorial start to finish
- [ ] Each step navigates correctly
- [ ] Features highlight right code
- [ ] Descriptions make sense
- [ ] No broken links

---

## Quick Tips

✅ Always start navigation with:
```typescript
{ type: 'click', selector: workbenchXPath.closePanelButton, optional: true }
```

✅ Format descriptions with breaks:
```typescript
<br />
<br />
```

✅ Use bold for emphasis:
```typescript
<b>important text</b>
```

✅ Add tips with emoji:
```typescript
💡 <b>Tip:</b> Helpful information
```

✅ Navigate step-by-step (don't skip):
1. Close panel (optional)
2. Go to section
3. Select node
4. Open preview
5. Show feature

---

## Common Mistakes

❌ Wrong step name case:
```typescript
workbenchXPath.flows.node('TsCreatePet')  // ❌ Wrong
workbenchXPath.flows.node('tscreatepet')  // ✅ Correct
```

❌ Feature ID doesn't match:
```json
// features.json
"id": "api-config"
```
```typescript
// tutorial.tsx
workbenchXPath.flows.feature('api-configuration')  // ❌ Doesn't match
workbenchXPath.flows.feature('api-config')         // ✅ Correct
```

❌ Lines pointing to closing brace:
```json
"lines": ["53"]  // If line 53 is just };  ❌ Wrong
"lines": ["81"]  // If line 81 has actual code  ✅ Correct
```

❌ Missing navigation steps:
```typescript
before: [
  { type: 'click', selector: workbenchXPath.flows.feature('api-configuration') }  // ❌ Missing navigation
]
```

---

**Remember:** Test every step! 🧪

