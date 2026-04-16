Assumptions:

    Tests are not run in parallel. (The randomization method could potentially create two issues with the same name; using a timestamp would be preferable.)
    The GitHub account language is set to English for everyone running the tests.

Tradeoffs:

    Authentication remains rudimentary and is only accessible to the project author.
    Occasionally flaky depending on GitHub's response times and the number of requests.

Possible Improvements:

    Better credential management (using a vault would be a good idea).
    Improve the stability of the waitForResponse() calls (by targeting specific requests more precisely).
    Add tests for different paths to create an issue (e.g., clicking the top-right icon triggers a different behavior).
    Add negative test cases (invalid characters, SQL injection, etc.).
