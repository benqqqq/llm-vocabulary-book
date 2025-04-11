# Project Brief: LLM Vocabulary Book

## Overview

LLM Vocabulary Book is a simplified application that focuses solely on the vocabulary learning feature. The application allows users to add vocabulary words and get AI-generated detailed explanations for each word.

## Core Requirements

1. Maintain the vocabulary feature's functionality
2. Remove all unrelated features
3. Ensure the vocabulary feature works correctly with OpenAI integration

## Features

- Add new vocabulary words
- View list of saved vocabulary words
- Get detailed AI-generated explanations for each word
- Delete vocabulary entries

## Technical Stack

- React with TypeScript
- Dexie.js for local database
- OpenAI API for vocabulary explanations
- Material UI components
- Tailwind CSS for styling

## Architecture

The application uses a simple architecture:

- Local storage with IndexedDB (via Dexie.js)
- React components for UI
- OpenAI API for generating vocabulary explanations

## Changes Made

1. Removed all non-vocabulary related features
2. Updated the application name and description
3. Modified the database schema to only include necessary tables
4. Simplified the routing to focus on the vocabulary feature
5. Updated configuration and documentation
