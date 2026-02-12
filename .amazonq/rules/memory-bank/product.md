# Product Overview

## Purpose
Preventivo Builder is a professional web application designed for creating, customizing, and exporting business quotes and estimates. It provides an intuitive drag-and-drop interface that simplifies the quote creation process while maintaining professional standards.

## Value Proposition
- Streamlines quote/estimate creation with visual builder
- Eliminates manual formatting and calculation errors
- Provides consistent, professional output via PDF export
- Enables reusability through template system
- Ensures data security with single-user isolation

## Key Features

### Core Capabilities
- **Drag & Drop Builder**: Intuitive visual interface for assembling quotes with real-time preview
- **Block System**: Modular components including Header, Price Tables, Free Text, and Terms & Conditions
- **PDF Export**: High-quality PDF generation with professional formatting using @react-pdf/renderer
- **Template Management**: Create, save, and reuse quote templates for common scenarios
- **Auto-save**: Automatic persistence prevents data loss during editing

### Authentication & Security
- Secure authentication system using NextAuth.js
- Single-user isolation ensuring data privacy
- Protected routes and API endpoints
- Session-based access control

### Data Management
- PostgreSQL database with Prisma ORM
- Structured quote storage with versioning
- Client information management
- Quote status tracking (Draft, Sent, Accepted, Rejected, Expired)

## Target Users
- Freelancers creating client proposals
- Small businesses generating estimates
- Consultants preparing service quotes
- Agencies building project proposals

## Use Cases
1. **Quick Quote Creation**: Build professional quotes in minutes using templates
2. **Custom Proposals**: Assemble unique quotes with flexible block system
3. **Client Management**: Track quotes by client with status updates
4. **Template Reuse**: Save frequently used quote structures for efficiency
5. **Professional Export**: Generate PDF documents ready for client delivery
