# Safe Haven API Tests

This directory contains API integration tests for the Safe Haven project, with a focus on the Shelter Matching and Application Submission Flow (Feature 1).

## Test Coverage

These tests cover the following API endpoints:

1. **User Form Submission API** - `POST /api/userForm/submit-form`
   - Test successful form submission
   - Test invalid input validation
   - Test database error handling
   - Test form update functionality

2. **Shelter Matching API** - `POST /api/shelter-matching`
   - Test successful shelter matching
   - Test scenario with no matching shelters
   - Test invalid input validation
   - Test database error handling

3. **Application Submission API** - `POST /api/shelter-applications/apply`
   - Test successful application submission
   - Test missing required fields validation
   - Test non-existent shelter validation
   - Test database error handling
   - Test urgency calculation logic

## Running the Tests

To run all the tests:

```bash
npm test
```

To run only the API tests:

```bash
npm test -- __tests__/api
```

To run a specific test file:

```bash
npm test -- __tests__/api/userForm.test.js
npm test -- __tests__/api/shelter-matching.test.js
npm test -- __tests__/api/shelter-applications.test.js
```

To run the tests with coverage report:

```bash
npm run test:coverage
```

## Important Note on Testing Next.js API Routes

When testing Next.js API routes, there are some specific considerations:

1. **NextResponse and Request objects**: Next.js API routes use `NextResponse` and custom request objects that need to be mocked in tests.

2. **Mocking approach**: These tests use the following pattern to properly mock Next.js dependencies:
   ```js
   
   jest.mock('next/server', () => ({
     NextResponse: {
       json: jest.fn((data, options) => ({
         status: options?.status || 200,
         json: async () => data,
         headers: new Map()
       }))
     }
   }));
   
   
   global.Request = class MockRequest {};
   
   
   const routeModule = require('@/app/api/userForm/submit-form/route');
   const { POST } = routeModule;
   ```

3. **Mock request objects**: Instead of using `createMocks()` from node-mocks-http, we create simple request objects with just the methods needed:
   ```js
   const req = {
     json: jest.fn().mockResolvedValue({
       
     })
   };
   ```

## Test Implementation Details

- Tests use Jest's mocking capabilities to mock MongoDB interactions
- All tests clean up mocks between test runs to ensure isolation
- The tests are designed to validate both happy paths and error scenarios
- Each test has its own independent mocking of request data and database responses

## Adding New Tests

When adding new tests, follow these patterns:

1. Always mock Next.js dependencies before importing route modules
2. Create a simple request object with a mocked `json()` method
3. Mock any MongoDB operations needed using Jest's mock functions
4. Call the API handler directly with the mock request
5. Assert on both the response status and body content
6. Verify that the correct database operations were performed 