# Generalize Question Screens

## Context
`QuestionScreen` and `ScoringScreen` currently duplicate significant amounts of logic for managing the question lifecycle: tracking the current index, handling answer selection, revealing the correct answer, and navigating to the next question. This duplication makes the codebase harder to maintain and increases the risk of inconsistent behavior (e.g., `onAnswer` is called at different times in each screen).

The goal is to extract this common "question state machine" into a reusable `QuestionBase` component.

## Proposed Approach

### 1. Create `QuestionBase` Component
Create a new component in `src/components/question-base.js` that manages the following:
- **State**: `qIndex`, `selected`, `revealed`.
- **Lifecycle**:
    - `handleSubmit`: Sets `revealed` to true and triggers `onAnswer(isCorrect)`. (Standardizing `ScoringScreen` to trigger `onAnswer` on reveal rather than on "Next").
    - `handleNext`: Resets `selected`/`revealed` and increments `qIndex` or calls `onBack` if finished.
- **UI Layout**:
    - A standardized header with a back button, title, and a progress bar.
    - A slot for the "Scenario" display (provided via `renderScenario` prop).
    - A slot for the "Question Text" (provided via `renderQuestionText` prop).
    - A standardized "Options" list.
    - A standardized "Feedback/Explanation" block.
    - A "Submit/Next" button.

### 2. Refactor `QuestionScreen`
Update `QuestionScreen` to be a wrapper that passes the following to `QuestionBase`:
- `questions`: The module's question bank.
- `renderScenario`: A function that switches between "Bidding/Conventions" layout and "Count/Play" layout based on `mod.type`.
- `renderQuestionText`: Returns the question wrapped in the existing styled `div`.

### 3. Refactor `ScoringScreen`
Update `ScoringScreen` to be a wrapper that passes the following to `QuestionBase`:
- `questions`: The shuffled/sliced scoring bank.
- `renderScenario`: Returns the Scoring-specific layout (Contract, Result, Vul, Doubled).
- `renderQuestionText`: Returns the question in its specific italicized style.
- `headerProps`: Custom label and the current `score`.

### 4. Integration
- Add `<script src="src/components/question-base.js"></script>` to `index.html` before other components to ensure it is loaded globally.

## Critical Files
- `src/components/question-base.js` (New)
- `src/components/question-screen.js` (Modified)
- `src/components/scoring-screen.js` (Modified)
- `index.html` (Modified)

## Verification Plan
1. **Home Screen**: Ensure both "SAYC Opening Bids" (Bidding) and "Bridge Scoring" (Scoring) can still be launched.
2. **Question Flow**:
   - Verify that selecting an option and clicking "Submit" reveals the correct answer.
   - Verify that `onAnswer` is triggered and statistics are updated.
   - Verify that clicking "Next" correctly advances the index or returns to the home screen.
3. **Visual Regression**: Ensure the "Scenario" areas (Bidding tables, Card Hands, Scoring details) look identical to the original versions.
4. **Edge Cases**: Verify that a module with 0 or 1 questions is handled gracefully.
