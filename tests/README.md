# Unit Tests for Streamer Simulator 2

This directory contains example unit tests for the core game modules. These tests demonstrate how to test the game logic in isolation using modern JavaScript testing approaches.

## 🧪 **Test Setup**

### **Using Node.js Built-in Test Runner (Recommended)**

Node.js 18+ includes a built-in test runner that requires no additional dependencies:

```bash
# Run all tests
node --test tests/

# Run specific test file
node --test tests/Player.test.js

# Run with coverage (Node.js 20+)
node --test --experimental-test-coverage tests/

# Watch mode
node --test --watch tests/
```

### **Using Vitest (Alternative)**

For a more feature-rich testing experience:

```bash
npm install --save-dev vitest
npm test
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

## 📁 **Test Files**

### **Player.test.js**
Tests for the Player class covering:
- Money management (add, spend, validation)
- Subscriber management (add, remove, limits)
- Energy system (use, recovery, limits)
- Skill progression
- Win condition detection
- Streaming ability checks

### **SaveManager.test.js**
Tests for the SaveManager class covering:
- Game state serialization/deserialization
- Save/load operations
- Auto-save functionality
- Error handling (corrupted saves, storage errors)
- Save metadata and information
- Delete operations

### **Stream.test.js**
Tests for the Stream class covering:
- Stream lifecycle (start, update, end)
- Viewer calculation algorithms
- Energy drain calculation
- Reward calculation based on performance
- Stream type switching
- Donation mechanics
- Error conditions

## 🎯 **Testing Philosophy**

### **Unit Testing Best Practices**

1. **Isolation**: Each test focuses on a single unit of functionality
2. **Mocking**: External dependencies are mocked (UI, localStorage, etc.)
3. **Deterministic**: Tests produce consistent results
4. **Fast**: Tests run quickly without real timers or network calls
5. **Readable**: Test names clearly describe what is being tested

### **Test Structure**

```javascript
describe('Class Name', () => {
    describe('Feature Group', () => {
        test('should do specific thing', () => {
            // Arrange
            const input = setupTestData();
            
            // Act
            const result = methodUnderTest(input);
            
            // Assert
            assert.equal(result, expectedValue);
        });
    });
});
```

### **Mocking Strategies**

1. **Callback Mocking**: Mock UI callbacks for Player class
2. **Object Mocking**: Mock game/UI objects for complex interactions
3. **Function Mocking**: Mock external APIs (localStorage, Math.random)
4. **Dependency Injection**: Pass mocks through constructors

## 🔍 **What to Test**

### **Business Logic** ✅
- Player progression calculations
- Reward algorithms
- Win/lose conditions
- Resource management (money, energy, subs)

### **State Management** ✅
- Save/load functionality
- State transitions
- Data validation
- Error recovery

### **Game Mechanics** ✅
- Streaming simulation
- Viewer behavior
- Energy drain calculations
- Event systems

### **Edge Cases** ✅
- Boundary conditions (zero energy, max money)
- Error conditions (invalid inputs)
- Resource exhaustion
- Timing edge cases

### **What NOT to Test** ❌
- DOM manipulation (belongs in integration tests)
- CSS styling
- External library behavior
- Browser-specific features

## 🚀 **Running Tests in CI/CD**

### **GitHub Actions Example**

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: node --test tests/
```

## 📊 **Coverage Goals**

| Module | Target Coverage | Focus Areas |
|--------|----------------|-------------|
| **Player** | 95%+ | Money/energy logic, progression |
| **SaveManager** | 90%+ | Serialization, error handling |
| **Stream** | 85%+ | Calculations, state transitions |
| **UI Modules** | 70%+ | Event handling, data display |

## 🎮 **Integration Testing**

While these are unit tests, consider adding integration tests for:

1. **End-to-End Game Flow**
   - Complete streaming session
   - Save → Quit → Load → Continue

2. **Module Integration**
   - Player ↔ Stream interactions
   - UI ↔ Game state synchronization
   - SaveManager ↔ All modules

3. **Performance Testing**
   - Long streaming sessions
   - Memory usage over time
   - Timer accuracy

## 📝 **Adding New Tests**

When adding new features, follow this checklist:

1. **Create test file** following naming convention (`Feature.test.js`)
2. **Write failing test** first (TDD approach)
3. **Implement feature** to make test pass
4. **Refactor** while keeping tests green
5. **Add edge cases** and error scenarios
6. **Update documentation** if needed

## 🛠️ **Debugging Tests**

```bash
# Run with verbose output
node --test --reporter=verbose tests/

# Debug specific test
node --inspect-brk --test tests/Player.test.js

# Run only tests matching pattern
node --test --grep="money" tests/
```

## 📚 **Additional Resources**

- [Node.js Test Runner Docs](https://nodejs.org/api/test.html)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Mock Strategies](https://martinfowler.com/articles/mocksArentStubs.html)

Happy testing! 🎉