# MCP Setup Instructions for Claude Desktop

## What I've Done

I've created the MCP configuration file at:
`C:\Users\petru\AppData\Roaming\Claude\claude_desktop_config.json`

This configuration includes:
1. **Supabase MCP** - For database operations
2. **GitHub MCP** - For repository management
3. **Filesystem MCP** - For direct file access to your project

## Next Steps Required

### 1. Add Your GitHub Token
You need to replace `"your_github_token_here"` with your actual GitHub Personal Access Token.

To create a GitHub token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Claude MCP"
4. Select these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:packages` (Upload packages to GitHub Package Registry)
   - `read:org` (Read org and team membership)
5. Generate the token and copy it

### 2. Get Your Supabase Service Role Key (if needed)
The current configuration uses your anon key. For full access, you might need the service role key:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (keep this secret!)
4. Replace the SUPABASE_SERVICE_ROLE_KEY in the config

### 3. Restart Claude Desktop
After updating the configuration:
1. Completely close Claude Desktop
2. Restart Claude Desktop
3. The MCP servers will automatically start

## How to Verify MCP is Working

Once restarted, I'll be able to:
- Query your Supabase database directly
- Create and manage GitHub issues/PRs
- Access your project files more efficiently

## Security Notes

⚠️ **Important**: 
- Never commit the `claude_desktop_config.json` file to git
- Keep your service role key and GitHub token secure
- These tokens give full access to your resources

## Benefits of MCP Integration

With MCP enabled, I can:
1. **Supabase Operations**:
   - Run SQL queries directly
   - Manage database schema
   - Deploy edge functions
   - Handle auth and storage

2. **GitHub Operations**:
   - Create pull requests
   - Manage issues
   - Review code
   - Automate workflows

3. **File System Access**:
   - Faster file operations
   - Better project navigation
   - Direct file manipulation

This will significantly speed up our development process!