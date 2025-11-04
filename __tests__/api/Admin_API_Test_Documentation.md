# Admin API Testing Documentation

This document outlines the automated tests for the shelter admin-side API endpoints in the SafeHaven application.

## Overview

The admin API tests verify the functionality of shelter administrators' interactions with applications and document management. These tests ensure that admin users can:

1. View applications submitted to their shelter
2. Update application status (approved, rejected, pending)
3. Update application workflow stages
4. Request documents from applicants
5. View and manage uploaded documents

## Test Files

- `admin-applications.test.js`: Tests for admin-side application management and document handling

## Test Coverage

### Shelter Applications API

Tests verify that shelter admins can:
- Fetch all applications for a specific shelter
- Handle error cases (missing shelter ID, invalid shelter ID)

### Application Status Update API

Tests verify that admins can:
- Update an application's status (approved, rejected, pending)
- Handle validation of required fields
- Handle cases when application is not found

### Application Stage Update API

Tests verify that admins can:
- Update an application's workflow stage (initial_review, documents_requested, etc.)
- Validate correct stage values
- Retrieve current stage and stage history

### Document Requests API

Tests verify that admins can:
- Create a document request for an applicant
- Specify document types and custom messages
- List all document requests

### Document Uploads API

Tests verify that users can:
- Upload documents in response to document requests
- Retrieve metadata about uploaded files
- Retrieve file contents

## Running the Tests

To run the admin API tests:

```bash
npm test -- __tests__/api/admin-applications.test.js
```

## Mocks and Stubs

The tests use Jest mock functions to simulate:
- MongoDB interactions (collections, queries, documents)
- NextResponse for API responses
- FormData and File handling for document uploads
- GridFS bucket operations for file storage

## Test Structure

Each test follows this structure:
1. Set up the test environment and mocks
2. Create a request with appropriate parameters
3. Call the API handler function
4. Verify the response status and data
5. Verify expected database interactions

## Future Improvements

Potential areas for expanding test coverage:
- More edge cases and error handling
- Integration tests with actual database
- Testing admin authentication and authorization
- Performance testing for document upload/download 