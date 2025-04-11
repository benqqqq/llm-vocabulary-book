# Technical Context

## Technologies Used

- **React**: Frontend library for building the user interface
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Vite**: Fast build tool and development server
- **Material UI**: Component library for UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Dexie.js**: Wrapper for IndexedDB for client-side storage
- **OpenAI API**: For generating vocabulary explanations

## Development Setup

- Node.js v20.11.1 (note: dependency issues may require downgrading)
- PNPM package manager
- ESLint and Prettier for code linting and formatting

## Technical Constraints

1. Dependency issues with ESM/CommonJS compatibility
2. Current version of hastscript has issues with property-information package
3. Project was initially part of a larger application with different features

## Dependencies

- **Core Frontend**: React, React DOM, React Router
- **UI Components**: Material UI, Tailwind CSS
- **Database**: Dexie.js, Dexie React Hooks
- **API Integration**: OpenAI API via custom OpenAIProvider
- **Build Tools**: Vite, TypeScript, ESLint

## Architecture

1. **Services Layer**:

   - OpenAIContext: Handles API interactions with OpenAI
   - SettingContext: Manages application settings (API keys)

2. **Storage Layer**:

   - Database: Dexie.js wrapper for IndexedDB
   - Tables: vocabulary, credentials

3. **UI Layer**:

   - Pages: Main route components (Vocabulary)
   - Components: Reusable UI components

4. **Components**:
   - VocabularyList: Displays list of vocabulary items
   - VocabularyDetail: Shows detailed information about a vocabulary item
   - VocabularyInput: Form for adding new vocabulary items
