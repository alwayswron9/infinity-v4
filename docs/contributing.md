# Contributing Guide

This document provides guidelines for contributing to the Infinity v4 project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/infinity-v4.git`
3. Navigate to the project directory: `cd infinity-v4`
4. Install dependencies: `npm install`
5. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

## Development Workflow

1. Make your changes in the relevant files
2. Test your changes locally
3. Commit your changes using conventional commit messages
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a pull request against the main repository

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

## Code Style Guidelines

- Follow the ESLint configuration provided in the project
- Use TypeScript for type safety
- Write clear, descriptive variable and function names
- Include JSDoc comments for functions and complex code sections
- Keep functions small and focused on a single responsibility
- Use async/await for asynchronous code

## Pull Request Process

1. Ensure your PR addresses a specific issue or feature
2. Update the documentation to reflect any changes
3. Include tests for new functionality
4. Make sure all tests pass
5. Get approval from at least one maintainer
6. Your PR will be merged once approved

## Development Environment

The project uses:
- Next.js for the framework
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling

## Testing

- Write unit tests for utilities and components
- Ensure tests pass before submitting a PR
- Consider edge cases in your testing

## Reporting Issues

When reporting issues, please include:
- A clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment information (browser, OS, etc.)

## Feature Requests

For feature requests, describe:
- The proposed feature
- The use case and benefits
- Any alternatives you've considered
- Whether you're willing to work on the implementation

## Code of Conduct

Please follow our code of conduct when interacting with the project:
- Be respectful and inclusive
- Focus on constructive feedback
- Respect decisions made by maintainers
- Be patient with other contributors

## License

By contributing to this project, you agree that your contributions will be licensed under the project's custom license. 

Please note that this project uses a custom OSS-like license that:
- Permits personal, business, and agency use
- Prohibits white-labeling and reselling the software
- Prohibits offering the software as a service without significant modifications

See the [License documentation](./license.md) and the [LICENSE.md](/LICENSE.md) file in the project root for the full license text and terms.
