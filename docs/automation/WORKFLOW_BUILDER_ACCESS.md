# How to Access the Vertical Workflow Builder

## Quick Access

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the Automations page:**
   - Go to: `http://localhost:8080/automations`
   - Or use the sidebar navigation

3. **Click on the "Workflows" tab:**
   - It's the 3rd tab in the tab list
   - Has a workflow icon
   - Tab value is "workflow-builder"

4. **Create a new workflow:**
   - Click the "Create Workflow" button
   - The vertical workflow builder will open

## What You Should See

When you open the Workflows tab for the first time, you'll see:
- A grid of existing workflows (if any)
- A "Create Workflow" button in the top-right
- If no workflows exist, a centered card with the create button

When you click "Create Workflow", you'll see:
- The vertical drag-and-drop workflow builder
- "Create New Workflow" as the title
- A "Back to Workflows" button to return

## Features Available

1. **Add Trigger** - Start your workflow with various trigger types
2. **Add Steps** - Add actions between any steps
3. **Drag & Drop** - Reorder steps by dragging the grip icon
4. **Inline Editing** - Click the chevron to expand/collapse configuration
5. **Step Controls** - Enable/disable, duplicate, or delete steps
6. **Test Workflow** - Test before saving
7. **Save Workflow** - Save your automation

## Troubleshooting

If you don't see the workflow builder:

1. **Check Console Errors:**
   - Open browser DevTools (F12)
   - Look for any red errors in Console

2. **Verify Tab Navigation:**
   - Make sure you clicked "Workflows" tab
   - The URL should still be `/automations`

3. **Check Authentication:**
   - Make sure you're logged in
   - Have proper permissions

4. **Clear Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Rebuild Project:**
   ```bash
   npm run build
   npm run dev
   ```

## Direct Test

To directly set the Workflows tab as active, you can:
1. Add `?tab=workflow-builder` to the URL
2. Or modify the default state in AutomationsPage.tsx

The vertical workflow builder is integrated and ready to use!