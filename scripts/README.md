# Safe Haven Scripts

This directory contains utility scripts for the Safe Haven project.

## API Test Report Generator

The `generate-api-test-report.js` script automatically runs the API tests and generates a detailed Markdown report with test results and coverage metrics.

### Usage

Run the script with:

```bash
npm run test:api
```

### Features

- Automatically runs all API tests with coverage
- Extracts test results, pass/fail status, and durations
- Captures code coverage metrics
- Generates a comprehensive Markdown report in `__tests__/api/API_Test_Results.md`
- Updates with current date and time
- Provides visualization of code coverage

### Output

The generated report includes:

- Test execution summary with date and time
- Test results with pass/fail status for each test case
- Detailed tables of test cases grouped by API endpoint
- Code coverage report with metrics for statements, branches, functions, and lines
- Visual representation of coverage
- Analysis of uncovered code
- Summary conclusion

### Benefits

- Ensures consistent documentation of test results
- Provides a professional report for including in project documentation
- Automates the reporting process to save time
- Creates an auditable history of test results when committed to version control 