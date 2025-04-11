# Active Context

## Current Focus

The current focus is on maintaining and ensuring the vocabulary feature works correctly after removing all other features from the original application.

## Recent Changes

1. Removed all non-vocabulary related features
2. Updated the application configuration to reflect the new focus
3. Modified the database schema to only include necessary tables
4. Updated the README and documentation

## Active Development Considerations

- The vocabulary feature relies on OpenAI API integration
- Users need to provide their own OpenAI API key
- The application uses local storage via IndexedDB to store vocabulary items
- Material UI components and Tailwind CSS are used for styling

## Test Scenarios

1. Adding a new vocabulary word
2. Viewing the vocabulary list
3. Selecting a vocabulary item to see its details
4. Deleting a vocabulary item
5. Ensuring the OpenAI integration works for generating explanations

## Next Steps

1. Test the application thoroughly to ensure the vocabulary feature works as expected
2. Consider improving the UI/UX for the vocabulary feature
3. Add additional functionality specific to vocabulary learning if needed
