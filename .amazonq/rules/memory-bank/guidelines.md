# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Mode Enabled**: All code must pass TypeScript strict checks
- **Explicit Types**: Define interfaces for all component props and function parameters
- **Type Imports**: Use `import type` for type-only imports when possible
- **No Any Types**: Avoid `any` type; use proper type definitions or `unknown` with type guards

### File Naming Conventions
- **Components**: PascalCase with `.tsx` extension (e.g., `PriceTableBlock.tsx`, `BuilderCanvas.tsx`)
- **Utilities**: kebab-case with `.ts` extension (e.g., `block-helpers.ts`, `quote-number.ts`)
- **Stores**: kebab-case with `-store.ts` suffix (e.g., `builder-store.ts`)
- **Types**: kebab-case with `.ts` extension (e.g., `blocks.ts`, `quote.ts`)
- **API Routes**: kebab-case directories with `route.ts` files

### Import Organization
1. External dependencies (React, Next.js, MUI, etc.)
2. Internal type imports from `@/types`
3. Internal component imports from `@/components`
4. Internal utility imports from `@/lib`
5. Internal store imports from `@/stores`

Example:
```typescript
import { Box, Typography } from '@mui/material';
import { PriceTableBlockData } from '@/types/blocks';
import { formatCurrency } from '@/lib/utils/currency';
import { useBuilderStore } from '@/stores/builder-store';
```

## Architectural Patterns

### Component Structure
- **Client Components**: Mark with `'use client'` directive at top of file when using hooks or browser APIs
- **Server Components**: Default for App Router; no directive needed
- **Props Interface**: Define inline above component or in separate types file
- **Default Exports**: Use default exports for page components and major features

Example:
```typescript
'use client';

import { Box } from '@mui/material';

interface MyComponentProps {
  data: SomeData;
}

export default function MyComponent({ data }: MyComponentProps) {
  // Component logic
}
```

### State Management Patterns

#### Zustand Store Pattern (5/5 files)
- **Immutable Updates**: Always create new objects/arrays, never mutate state
- **Action Methods**: Define actions as methods within the store
- **Computed Values**: Use getter functions for derived state
- **Deep Cloning**: Use `JSON.parse(JSON.stringify())` for history/undo features
- **Selector Pattern**: Access only needed state to prevent unnecessary re-renders

Example from `builder-store.ts`:
```typescript
export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  
  addBlock: (type, order) => {
    const { blocks } = get();
    const newBlock = { id: nanoid(), type, order, data: getDefaultBlockData(type) };
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(order, 0, newBlock);
    set({ blocks: updatedBlocks, isDirty: true });
    get().addToHistory();
  },
}));
```

#### History Management Pattern
- **History Array**: Store snapshots of state for undo/redo
- **History Index**: Track current position in history
- **Limit History**: Cap at 50 entries to prevent memory issues
- **Deep Clone**: Clone state before adding to history to prevent reference issues

### Database Patterns

#### Prisma Usage (5/5 files)
- **Singleton Client**: Use single Prisma client instance via `@/lib/prisma`
- **Upsert Pattern**: Use `upsert` for idempotent operations (seed scripts)
- **Cascade Deletes**: Define `onDelete: Cascade` in schema for related data
- **Batch Operations**: Use `createMany` for bulk inserts with `skipDuplicates: true`
- **Transactions**: Wrap related operations in `$transaction` when needed

Example from `seed.ts`:
```typescript
const template = await prisma.template.upsert({
  where: { id: 'minimal-template' },
  update: {},
  create: {
    id: 'minimal-template',
    name: 'Minimal',
    isSystem: true,
  },
});

await prisma.templateBlock.createMany({
  data: [...blocks],
  skipDuplicates: true,
});
```

#### Schema Design Patterns
- **CUID IDs**: Use `@default(cuid())` for primary keys
- **Timestamps**: Include `createdAt` and `updatedAt` on all models
- **Indexes**: Add `@@index` for foreign keys and frequently queried fields
- **Enums**: Define enums in schema for fixed value sets (BlockType, QuoteStatus)
- **JSON Fields**: Use `Json` type for polymorphic/flexible data (block data)

### Drag & Drop Pattern (dnd-kit)

#### Setup Pattern
- **Sensors**: Configure MouseSensor and TouchSensor with activation constraints
- **Collision Detection**: Use `closestCenter` for vertical lists
- **Sortable Context**: Wrap sortable items in SortableContext with strategy
- **Drag Overlay**: Provide visual feedback during drag with DragOverlay

Example from `BuilderCanvas.tsx`:
```typescript
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 6 },
  })
);

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
    {blocks.map(block => <BlockWrapper key={block.id} block={block} />)}
  </SortableContext>
</DndContext>
```

#### Reordering Pattern
- **arrayMove**: Use from `@dnd-kit/sortable` to reorder arrays
- **Update Orders**: Recalculate order property after reordering
- **Persist Changes**: Mark state as dirty and trigger save

## UI/UX Patterns

### Material-UI Conventions
- **Box Component**: Use for layout containers instead of divs
- **Typography**: Use Typography component for all text with semantic variants
- **Paper**: Use for card-like containers with elevation
- **Spacing**: Use `sx` prop with theme spacing units (e.g., `sx={{ p: 3, mb: 2 }}`)
- **Theme Colors**: Reference theme colors (e.g., `color="primary"`, `bgcolor="grey.50"`)

Example from `PriceTableBlock.tsx`:
```typescript
<Box sx={{ p: 3 }}>
  <Typography variant="h6" gutterBottom>
    {data.title || 'Items'}
  </Typography>
  <TableContainer component={Paper} variant="outlined">
    <Table>
      {/* Table content */}
    </Table>
  </TableContainer>
</Box>
```

### Empty State Pattern
- **Visual Feedback**: Show dashed border and centered message
- **Instructional Text**: Provide clear guidance on next steps
- **Consistent Styling**: Use grey tones and larger padding

Example:
```typescript
<Paper
  sx={{
    p: 8,
    textAlign: 'center',
    bgcolor: 'grey.50',
    border: '2px dashed',
    borderColor: 'grey.300',
  }}
>
  <Typography variant="h6" color="text.secondary" gutterBottom>
    Your quote is empty
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Drag blocks from the toolbar to start building your quote
  </Typography>
</Paper>
```

## Data Handling Patterns

### Block Data Pattern
- **Polymorphic Data**: Store block-specific data in JSON field
- **Type Discrimination**: Use BlockType enum to determine data structure
- **Default Data Factory**: Create helper function to generate default data per type
- **Validation**: Validate data structure matches expected type

Example from `builder-store.ts`:
```typescript
function getDefaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case BlockType.HEADER:
      return { companyName: 'Your Company', /* ... */ };
    case BlockType.PRICE_TABLE:
      return { title: 'Items', items: [/* ... */], currency: 'EUR' };
    case BlockType.TEXT:
      return { content: '<p>Enter your text here...</p>' };
    case BlockType.TERMS:
      return { title: 'Terms & Conditions', terms: ['...'] };
  }
}
```

### Currency Formatting Pattern
- **Utility Function**: Centralize currency formatting in `@/lib/utils/currency`
- **Locale Support**: Use Intl.NumberFormat for proper formatting
- **Currency Parameter**: Pass currency code with each format call

### Calculation Helpers
- **Pure Functions**: Keep calculation logic in separate utility files
- **Reusable**: Create helpers for common calculations (subtotals, tax, totals)
- **Type-Safe**: Use proper TypeScript types for inputs and outputs

Example usage:
```typescript
import { calculateItemSubtotal, calculatePriceTableTotals } from '@/lib/utils/block-helpers';

const totals = calculatePriceTableTotals(data);
const itemSubtotal = calculateItemSubtotal(item);
```

## Configuration Patterns

### Next.js Configuration
- **React Strict Mode**: Always enabled for development checks
- **Server Actions**: Configure body size limits for file uploads
- **Image Domains**: Whitelist domains for next/image optimization
- **Experimental Features**: Document any experimental features used

Example from `next.config.js`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  images: {
    domains: ['localhost'],
  },
};
```

### Environment Variables
- **Required Variables**: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
- **Type Safety**: Validate environment variables at startup
- **Example File**: Maintain `.env.example` with all required variables

## Error Handling

### Database Operations
- **Try-Catch**: Wrap database operations in try-catch blocks
- **Disconnect**: Always disconnect Prisma client in finally block
- **Exit Codes**: Use `process.exit(1)` for failed scripts
- **Logging**: Use emoji prefixes for visual clarity (✅, ❌, 🌱, 🎉)

Example from `seed.ts`:
```typescript
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

## Performance Patterns

### Unique ID Generation
- **nanoid**: Use nanoid for generating unique IDs (shorter than UUID)
- **Client-Side**: Generate IDs on client for immediate feedback
- **Server-Side**: Use CUID from Prisma for database records

### Memoization
- **React Hooks**: Use useMemo for expensive calculations
- **Selector Pattern**: Select only needed state from Zustand stores
- **Avoid Re-renders**: Use proper dependency arrays in useEffect/useMemo

## Testing & Development

### Console Logging
- **Emoji Prefixes**: Use emojis for visual distinction (🌱, ✅, ❌, 🎉)
- **Descriptive Messages**: Include context in log messages
- **Development Only**: Remove or guard console.logs in production

### Scripts Organization
- **Seed Scripts**: Place in `prisma/seed.ts` with tsx execution
- **Database Scripts**: Prefix with `db:` in package.json
- **Development Scripts**: Use `dev`, `build`, `start` convention

## Code Comments

### When to Comment
- **Complex Logic**: Explain non-obvious algorithms or business rules
- **Section Headers**: Use comments to separate logical sections
- **TODOs**: Mark incomplete features with TODO comments
- **Type Annotations**: JSDoc for complex types when needed

### When NOT to Comment
- **Self-Explanatory Code**: Let code speak for itself with good naming
- **Obvious Operations**: Don't comment simple assignments or returns
- **Redundant Information**: Avoid comments that repeat what code does

## Accessibility

### Semantic HTML
- **Table Structure**: Use proper table elements for tabular data
- **Typography Variants**: Use semantic variants (h1-h6, body1, body2)
- **ARIA Labels**: Add aria-labels for icon-only buttons

### Keyboard Navigation
- **Focus Management**: Ensure all interactive elements are keyboard accessible
- **Tab Order**: Maintain logical tab order through components
