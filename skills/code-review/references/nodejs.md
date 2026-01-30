# Node.js Review Checklist

## Async/Error Handling

- Unhandled promise rejections
- Missing try-catch in async functions
- Callback error parameter ignored
- `await` in loop instead of `Promise.all` for parallel operations
- Missing `.catch()` on promise chains

## Security

- SQL/NoSQL injection (unsanitized user input in queries)
- Path traversal (user input in file paths without validation)
- Command injection (user input in `exec`/`spawn`)
- Sensitive data in logs or error messages
- Missing rate limiting on APIs
- CORS misconfiguration

## Memory & Performance

- Event listeners not removed (memory leak)
- Large file read into memory (should use streams)
- Synchronous file operations blocking event loop
- Missing connection pooling for databases
- Unbounded cache growth

## Common Pitfalls

- `require()` with dynamic paths (security + bundling issues)
- Environment variables accessed without defaults
- Missing input validation on API endpoints
- Circular dependencies
- Blocking the event loop with CPU-intensive tasks
