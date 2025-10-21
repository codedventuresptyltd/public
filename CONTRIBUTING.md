# Contributing to CommerceBridge Examples

Thank you for your interest in contributing! We welcome examples, improvements, and bug fixes.

## How to Contribute

### Adding a New Example

1. Fork this repository
2. Create a new branch (`git checkout -b feature/new-example`)
3. Add your example in the appropriate directory:
   - `examples/workers/` - Worker implementations
   - `examples/bridge/` - Bridge integration patterns
   - `examples/engagements/` - Engagement workflows
   - `examples/translators/` - Translation examples
   - `examples/integrations/` - External service integrations
   - `examples/end-to-end/` - Complete flows

4. Follow the example template:
   ```typescript
   /**
    * Example Name
    * 
    * Demonstrates:
    * - Feature 1
    * - Feature 2
    * 
    * Prerequisites:
    * - Requirement 1
    * - Requirement 2
    */
   ```

5. Add your example to `package.json` scripts:
   ```json
   "example:your-name": "ts-node examples/category/your-file.ts"
   ```

6. Test your example:
   ```bash
   npm run example:your-name
   ```

7. Commit your changes with a descriptive message
8. Push to your fork and submit a pull request

### Code Style

- Use TypeScript
- Include detailed comments
- Add console.log statements to show progress
- Export reusable classes/functions
- Keep examples focused and concise

### Example Structure

Each example should:
- ✅ Have a clear, descriptive name
- ✅ Include a header comment explaining what it demonstrates
- ✅ List prerequisites
- ✅ Show realistic use cases
- ✅ Include error handling
- ✅ Be runnable as a standalone file
- ✅ Export reusable components

### Testing

Before submitting:
- [ ] Example runs without errors
- [ ] Code follows existing patterns
- [ ] Comments are clear and helpful
- [ ] No sensitive data hardcoded

## Questions?

Open an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

