# LLM Vocabulary Book

A vocabulary learning tool powered by large language models to provide detailed explanations.

## Features

- Add new vocabulary words
- Automatically generates detailed vocabulary explanations using OpenAI's API
- Includes pronunciation, etymology, examples, and related words
- Store and manage your personal vocabulary list

## Theme Colors

The application uses a natural, earthy color palette with a centralized theming system:

- Primary: `#556B2F` (Dark Olive Green)
- Secondary: `#8B4513` (Saddle Brown)
- Background: `#FFFFFF` (White)

All theme colors are defined in `src/theme.ts` as constants, making it easy to update the entire application's appearance by changing values in a single location. The theme is applied globally using Material UI's ThemeProvider.

## Usage

This application helps you build and explore your vocabulary with AI-powered explanations.

```bash
pnpm install
pnpm run dev
```

## Setup

1. You'll need an OpenAI API key to use this application
2. Enter your API key in the settings section
3. Start adding vocabulary words to see their detailed explanations

## Reference

This project is based on a template initialized from https://github.com/wtchnm/Vitamin
