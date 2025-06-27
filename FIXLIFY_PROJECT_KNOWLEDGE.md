# Fixlify AI Automate - Project Knowledge Base

## 🎯 Project Context

**Fixlify AI Automate** is a comprehensive business management and automation platform designed for service-based businesses (HVAC, plumbing, electrical, etc.). It combines traditional business management tools with advanced AI automation capabilities.

### Working Environment
- **Project Location**: `C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main`
- **Development Tools**: 
  - Desktop Commander for local file system operations
  - Supabase MCP for database operations
  - Vite development server on port 8080

## 🏗️ Technical Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **UI Components**: 
  - shadcn/ui with Radix UI primitives
  - Tailwind CSS 3.4.11 with custom animations
  - Lucide React for icons
- **State Management**: 
  - TanStack React Query 5.56.2 for server state
  - React Hook Form 7.53.0 with Zod validation
- **Routing**: React Router DOM 6.26.2
- **Charts**: Recharts 2.12.7
- **3D Graphics**: Three.js with React Three Fiber

### Backend & Database
- **BaaS**: Supabase (PostgreSQL)
- **Supabase URL**: `https://mqppvcrlvsgrsqelglod.supabase.co`
- **Authentication**: Supabase Auth with JWT
- **Real-time**: Supabase Realtime subscriptions
- **Storage Key**: `fixlify-auth-token`

## 📁 Project Structure

```
fixlify-ai-automate/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── lib/              # Utility libraries
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── services/         # Business logic services
│   ├── contexts/         # React contexts
│   ├── utils/            # Helper functions
│   └── styles/           # Global styles
├── supabase/            # Database migrations and functions
├── scripts/             # Build and deployment scripts
└── public/              # Static assets
```

## 🔑 Key Features & Modules

### 1. **Dashboard & Analytics**
- Real-time KPIs and metrics
- Interactive charts using Recharts
- AI-powered insights
- Predictive analytics

### 2. **Client Management**
- Client profiles with complete history
- Self-service portal
- Communication tracking
- Relationship management

### 3. **Job Management**
- Full lifecycle management
- Scheduling and dispatch
- Estimates and invoicing
- Service categorization

### 4. **AI Center**
- AI Assistant with business data access
- Call Analytics
- Automation Rules engine
- Predictive Insights
- Smart Dispatch optimization

### 5. **Team Management**
- Member profiles and skills
- Commission tracking
- Role-based access control (RBAC)
- Performance scorecards

### 6. **Financial Management**
- Invoice generation
- Payment processing
- Financial reporting
- Revenue forecasting

### 7. **Communication Hub**
- Internal messaging
- Client communications
- Automated notifications
- Call masking features

### 8. **Automation Engine**
- Workflow builder
- Trigger-based actions
- External integrations
- Custom automation rules

## 🗄️ Database Schema (Key Tables)

### Core Tables
- `profiles` - User profiles and settings
- `clients` - Client information
- `jobs` - Job records and status
- `team_members` - Team member data
- `invoices` - Financial records
- `automations` - Automation rules
- `automation_templates` - Pre-built automation templates
- `messages` - Communication records
- `ai_conversations` - AI interaction history

### Multi-tenancy
- Row-level security (RLS) based on `organization_id`
- User isolation through Supabase policies

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Port 8080
npm run dev:8081    # Port 8081

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 🔌 Key Integrations

### Supabase Integration
- Client initialized in `/src/integrations/supabase/client.ts`
- Types generated in `/src/integrations/supabase/types.ts`
- Auth persistence with localStorage
- Real-time subscriptions for live updates

### Environment Variables
```
VITE_SUPABASE_URL=https://mqppvcrlvsgrsqelglod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg
```

## 🛠️ Common Development Tasks

### Working with Components
- Components follow compound pattern (e.g., Card.Header, Card.Content)
- Use shadcn/ui components from `/src/components/ui/`
- Custom business components in `/src/components/`

### Database Operations
- Use Supabase MCP for database queries
- Check RLS policies for multi-tenancy
- Use TypeScript types from `/src/types/`

### Adding New Features
1. Define types in `/src/types/`
2. Create database migrations in `/supabase/migrations/`
3. Build UI components
4. Implement business logic in services
5. Add to routing if needed

### AI Integration Points
- AI hooks in `/src/hooks/use-ai/`
- AI-related components in AI Center
- Automation engine for AI-driven workflows

## 🚨 Important Considerations

### Security
- All database operations respect RLS
- Authentication required for all routes
- API keys stored securely in environment variables

### Performance
- Lazy loading for route components
- React Query for efficient data fetching
- Optimistic updates for better UX

### Multi-tenancy
- Organization-based data isolation
- Proper RLS policies on all tables
- User permissions managed through roles

## 📝 Common Issues & Solutions

### CORS Issues
- Supabase client configured without global headers
- Use proper authentication headers

### Authentication
- Token stored in localStorage as `fixlify-auth-token`
- Auto-refresh enabled
- Session detection in URL

### Build Issues
- Check Node.js version compatibility
- Clear node_modules and reinstall
- Verify all environment variables

## 🎯 Development Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Component Reusability**: Use compound components
3. **State Management**: Server state in React Query, local state in components
4. **Error Handling**: Proper error boundaries and toast notifications
5. **Testing**: Test database operations with Supabase MCP
6. **Code Organization**: Follow existing patterns in codebase

## 🔗 Quick References

- **Supabase Dashboard**: Access via Supabase URL
- **Component Library**: `/src/components/ui/`
- **API Types**: `/src/types/database.ts`
- **Automation Docs**: Various AUTOMATION_*.md files
- **Setup Guides**: SETUP_INSTRUCTIONS.md, FIXLIFY_SETUP_GUIDE.md

---

This knowledge base should be used in conjunction with the actual codebase. Always verify current implementations as the project evolves.
