# GUILTY - Detective Mystery Game

🎮 **A strategic detective mystery game requiring logical deduction over multiple rounds**

> **IMPORTANT FOR FUTURE AI DEVELOPMENT:** This README contains ALL necessary context for maintaining and enhancing this game. Read this document completely before making any changes to preserve the intended design philosophy and user experience.

## Design Philosophy & Core Requirements

### **PRIMARY GOAL: THINKING GAME, NOT GUESSING GAME**
GUILTY is designed as a **logic puzzle** that requires **systematic analysis** over **multiple elimination rounds**. Success must come from **careful deduction**, not lucky guesses.

### **MANDATORY DESIGN PRINCIPLES:**
1. **Minimal Starting Information** - Game MUST start with only 1 clue
2. **Progressive Revelation** - New clues earned ONLY through perfect elimination rounds
3. **3+ Round Minimum** - Game MUST require at least 3 rounds of logical deduction
4. **No Guessing Shortcuts** - Players cannot win by random suspect selection
5. **Mistake Recovery** - Players MUST be able to correct exoneration errors
6. **Visual Clarity** - Game state and next actions MUST be immediately clear

## Technical Architecture

### **File Structure:**
```
/
├── index.html          # Main UI - NO embedded CSS/JS allowed
├── guilty-game-js.js   # Complete game logic (18KB)
├── styles.css          # All styling (12KB) 
├── server.js           # Express server for deployment
├── package.json        # Node.js dependencies
├── .gitignore          # Excludes node_modules
└── README.md           # This comprehensive guide
```

### **Technology Stack:**
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (NO frameworks)
- **Backend:** Node.js + Express (minimal server for static hosting)
- **Deployment:** Static hosting compatible (Render, Netlify, Vercel, GitHub Pages)
- **Dependencies:** express@^4.18.2 ONLY

## Game Logic Implementation

### **Core Game State Structure:**
```javascript
gameState = {
    difficulty: 'easy|medium|hard',
    suspects: Array[16],           // Always exactly 16 suspects
    culprit: Object,              // One randomly selected suspect
    cluesRevealed: Array,         // Progressive clue accumulation
    startTime: Number,            // For timer functionality
    gameActive: Boolean,          // Game session control
    eliminationRound: Number,     // Current round (starts at 1)
    phase: 'elimination'          // Always elimination-based
}
```

### **Suspect Object Structure:**
```javascript
suspect = {
    id: Number,                   // 0-15 unique identifier
    name: String,                 // From SUSPECT_NAMES array
    job: String,                  // From JOBS array
    traits: {                     // 5 required trait categories
        access: String,           // 5-level progression
        timing: String,           // 5-level progression  
        knowledge: String,        // 5-level progression
        motive: String,           // 5-level progression
        behavior: String          // 5-level progression
    },
    exonerated: Boolean,          // Player action state
    shouldExonerate: Boolean      // Logic calculation result
}
```

### **Trait Progression System (IMMUTABLE):**
```javascript
TRAIT_PROGRESSIONS = {
    access: ['None', 'Visitor', 'Contractor', 'Staff', 'VIP'],
    timing: ['Asleep', 'Working', 'Home', 'Out', 'Verified'],
    knowledge: ['None', 'Basic', 'Limited', 'Familiar', 'Expert'],
    motive: ['None', 'Curious', 'Vengeful', 'Greedy', 'Desperate'],
    behavior: ['Helpful', 'Normal', 'Changed', 'Nervous', 'Suspicious']
}
```

### **Difficulty Logic (EXACT SPECIFICATIONS):**

#### **Initial Clues:**
- **ALL difficulties:** Start with exactly **1 clue** (NEVER more)
- **Rationale:** Forces strategic multi-round gameplay

#### **Trait Matching Rules:**
- **Easy:** Exact match OR ±1 position distance (yellow zone)
- **Medium:** Exact match OR ±1 position distance (yellow zone)  
- **Hard:** ONLY exact matches (no yellow zone)

#### **Edge Case Handling:**
- Traits at position 0 or 4 have limited yellow zones
- Yellow highlighting MUST respect progression boundaries
- Distance calculation: `Math.abs(index1 - index2)`

## UI/UX Requirements

### **Exoneration System (CRITICAL):**
- **NEVER hide exonerated suspects** - they must remain visible
- Exonerated suspects: 40% opacity, grayscale filter, muted colors
- **Green "Un-Exonerate" button** for mistake correction
- **NO visual hints** - players must deduce which suspects to eliminate
- **Smart feedback** on Check Exonerations button

### **Visual States:**
```css
.suspect-card.exonerated {
    opacity: 0.4;
    filter: grayscale(50%);
    border: 1px solid var(--text-muted);
}

/* REMOVED: should-exonerate visual indicators to preserve "thinking game" principle
.suspect-card.should-exonerate {
    border: 2px solid var(--warning);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}
*/
```

### **Responsive Design:**
- **Mobile-first approach** with grid layouts
- **Flexible trait reference** that collapses on small screens  
- **Touch-friendly buttons** (minimum 44px tap targets)
- **Readable typography** across all device sizes

## Critical Functions & Logic

### **Game Initialization:**
```javascript
function generateInitialClues() {
    const numClues = 1;  // NEVER change this value
    // Must randomly select 1 trait type
    // Must ensure logical consistency
}
```

### **Suspect Matching Logic:**
```javascript
function matchesCulpritClues(suspect) {
    // MUST check ALL revealed clues
    // MUST handle edge cases for trait progressions
    // MUST respect difficulty-specific matching rules
}
```

### **Exoneration Validation:**
```javascript
function checkExonerations() {
    // MUST provide specific feedback messages
    // MUST require 100% accuracy for new clues
    // MUST handle both correct and incorrect exonerations
}
```

## Performance & Deployment

### **Bundle Size Targets:**
- **Total:** <50KB uncompressed
- **JavaScript:** ~18KB
- **CSS:** ~12KB  
- **HTML:** ~8KB
- **Load Time:** <2 seconds on 3G

### **Browser Compatibility:**
- **Modern browsers:** Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **NO Internet Explorer support**
- **Progressive enhancement** for older browsers

### **Deployment Configuration:**
```json
// package.json requirements
{
  "name": "guilty-detective-game",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Specific Implementation Rules

### **NEVER DO:**
1. **Remove the un-exonerate functionality** - players must be able to reverse mistakes
2. **Hide exonerated suspects** - they must remain visible but grayed out
3. **Start with more than 1 clue** - this breaks the strategic progression
4. **Allow winning without 3+ rounds** - defeats the logic puzzle purpose
5. **Add timers or pressure mechanics** - this is a thinking game
6. **Change trait progressions** - they are carefully balanced
7. **Use frameworks** - keep it vanilla JavaScript for performance
8. **Embed CSS/JS in HTML** - maintain clean file separation

### **ALWAYS DO:**
1. **Validate perfect elimination rounds** before revealing new clues
2. **Provide specific feedback** on player actions and progress  
3. **Maintain responsive design** across all screen sizes
4. **Test edge cases** in trait matching logic
5. **Preserve game state consistency** throughout the session
6. **Follow the established visual hierarchy** and color system
7. **Keep performance optimized** for mobile devices

## Future Enhancement Guidelines

### **Acceptable Additions:**
- **Statistics tracking** (win rates, average time, rounds)
- **Achievement system** (perfect games, speed solving)
- **Accessibility improvements** (ARIA labels, keyboard navigation)
- **Animation polish** (smooth transitions, micro-interactions)
- **Additional crime scenarios** (following existing pattern)

### **Architecture Expansions:**
- **Save/load game state** (localStorage)
- **Daily challenge mode** (seeded random generation)
- **Hint system** (limited use, maintains difficulty)
- **Tutorial mode** (guided first game)

### **Performance Optimizations:**
- **Lazy loading** for non-critical elements
- **Service worker** for offline play
- **Image optimization** for crime scenario graphics
- **Bundle splitting** if complexity grows

## Development History & Troubleshooting

### **Critical Fixes Log (January 2024)**

#### **Issue #6: Question Mark System for Hidden Traits (Latest)**
- **Problem:** Game needed more strategic difficulty without making it unfair
- **User Guidance:** "We should also add question marks that leave some of each suspect's traits ambiguous so that they can't be exonerated on the basis of that trait"
- **Solution:** Added `hiddenTraits` array to each suspect (2 traits hidden per suspect)
- **Implementation:**
  ```javascript
  suspect.hiddenTraits = shuffledTraits.slice(0, 2);
  // Renders '?' for hidden traits with distinctive yellow styling
  ${suspect.hiddenTraits.includes(type) ? '?' : value}
  ```
- **Logic:** Hidden traits act as wildcards in matching - can't eliminate suspects based on unknown information
- **Impact:** Forces players to rely only on revealed clues, increases strategic depth

#### **Issue #7: Single Difficulty Level Simplification**
- **Problem:** Multiple difficulty levels were confusing and still generating green clues
- **User Guidance:** "I want there to be only one difficulty level. It should always start with one yellow clue and leave between 8 and 11 viable suspects"
- **Root Cause:** Complex difficulty system was still buggy, needed simplification
- **Solution:** 
  - Removed difficulty dropdown entirely from UI
  - Simplified to single logic: always generate yellow clues leaving 8-11 viable suspects
  - Consistent yellow zone logic (`distance <= 1`) throughout game
- **Code Changes:**
  ```javascript
  // Always generates yellow clues (1 step away from culprit trait)
  if (viableSuspects >= 8 && viableSuspects <= 11) {
      gameState.cluesRevealed.push({ type: selectedTraitType, value: clueValue });
  }
  ```

#### **Issue #8: Green Clue Display Bug** 
- **Problem:** Clues appeared green (exact match styling) even when they were yellow clues
- **User Guidance:** "That didn't work. I'm still getting a green clue"
- **Root Cause:** `renderClues()` function used CSS class `trait-feedback correct` (green) instead of `trait-feedback close` (yellow)
- **Solution:** Changed CSS class from `correct` to `close` for proper yellow styling
- **Before:** `traitDiv.className = 'trait-feedback correct';`
- **After:** `traitDiv.className = 'trait-feedback close';`
- **Additional Fix:** Updated fallback logic to generate yellow clues instead of green ones

#### **Issue #9: Yellow Clue Logic Inversion (Critical)**
- **Problem:** Suspects who exactly matched yellow clue were kept as viable (incorrect)
- **User Guidance:** "Someone who exactly matches a yellow clue should be exonerated because the culprit will have a trait to the left or right, not the matching trait"
- **Root Cause:** Misunderstood yellow clue logic - had `distance <= 1` instead of `distance === 1`
- **Correct Logic:** 
  - Yellow clue = 1 step away from culprit's actual trait
  - Exact match to clue = ELIMINATE (distance 0)
  - 1 step from clue = VIABLE (distance 1, could be culprit)
  - 2+ steps from clue = ELIMINATE (distance >= 2)
- **Solution:** Changed matching logic from `return distance <= 1` to `return distance === 1`
- **Impact:** Fixed false "incorrectly exonerated" warnings, proper elimination logic restored

#### **Issue #10: Yellow Clues at Extreme Positions Remove Strategic Ambiguity**
- **Problem:** Yellow clues at trait progression extremes (positions 0 or 4) only have one possible adjacent position
- **User Guidance:** "There's one more issue with putting yellow clues at the either far end of the trait spectrum. Since there's only one trait that's 'next' to a yellow trait on the far end of the trait reference, that means the culprit has the trait directly next to it."
- **Strategic Impact:** 
  - Clue at "None" (index 0) → Culprit MUST be "Visitor" (index 1) - no ambiguity
  - Clue at "VIP" (index 4) → Culprit MUST be "Staff" (index 3) - no ambiguity
  - Violates "THINKING GAME, NOT GUESSING GAME" principle
- **Solution:** Restrict yellow clue generation to middle positions (indices 1, 2, 3) only
- **Implementation:**
  ```javascript
  // Only use clues if they're not at extremes (have neighbors on both sides)
  if (clueIndex > 0 && clueIndex < progression.length - 1) {
      possibleClueIndices.push(clueIndex);
  }
  ```
- **Result:** Every yellow clue now maintains exactly 2 possible culprit positions:
  - "Visitor" → Culprit could be "None" OR "Contractor"
  - "Contractor" → Culprit could be "Visitor" OR "Staff"  
  - "Staff" → Culprit could be "Contractor" OR "VIP"
- **Impact:** Preserves strategic depth and eliminates logic shortcuts

#### **Issue #10b: Extreme Position Restriction Only Applied to Initial Clues**
- **Problem:** The fix for Issue #10 only applied to initial clue generation, but subsequent rounds still generated extreme position clues
- **User Guidance:** "The problem persisted. In the second round I got a yellow clue at the extreme end, and then it wouldn't let me exonerate someone who was an exact match in that trait category"
- **Root Cause:** `addNewClue()` function was using culprit's actual trait value instead of generating proper yellow clues with extreme position restrictions
- **Before Fix:** `value: gameState.culprit.traits[bestTraitType]` could be "None" or "VIP"
- **Solution:** Completely rewrote `addNewClue()` function to:
  - Generate yellow clues (1 step away from culprit's trait) instead of using culprit's actual trait
  - Apply same extreme position restriction (indices 1, 2, 3 only) to ALL rounds
  - Evaluate multiple possible yellow clues to find optimal elimination potential
  - Include fallback logic with extreme position restrictions
- **Implementation:**
  ```javascript
  // Generate possible yellow clues with extreme position restrictions
  const possibleClueIndices = [];
  if (culpritIndex > 0) {
      const clueIndex = culpritIndex - 1;
      if (clueIndex > 0 && clueIndex < progression.length - 1) {
          possibleClueIndices.push(clueIndex);
      }
  }
  ```
- **Result:** Strategic ambiguity maintained in ALL rounds - no logic shortcuts possible
- **Impact:** Game now consistently requires strategic thinking throughout entire session

#### **Issue #11: Yellow Border Spoiler & Clue Display Overflow**
- **Problem 1:** Yellow border around suspects who should be exonerated gave away answers
- **Problem 2:** After 5 clues, page ran out of space and subsequent clues became invisible
- **User Guidance:** "There is a yellow border around suspects who should be exonerated that gives the answer away to players" and "once you get past clue 5 the page runs out of space and you can't see subsequent clues"
- **Strategic Impact:** Yellow borders completely defeated "THINKING GAME, NOT GUESSING GAME" principle
- **Solutions Applied:**
  - **Removed Yellow Border Spoiler:** Completely eliminated `.suspect-card.should-exonerate` CSS styling
  - **Removed JavaScript Logic:** Eliminated `should-exonerate` class application in `renderSuspects()`
  - **Fixed Clue Overflow:** Added scrollable game board with max-height 300px and custom scrollbars
  - **Improved Clue Layout:** Changed to grid layout for better space utilization
  - **Compact Clue Design:** Reduced padding and font size for more clues per screen
- **Implementation:**
  ```css
  .game-board {
      max-height: 300px;
      overflow-y: auto;
  }
  .clue-feedback {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  ```
- **Result:** Players must now use genuine logical deduction without visual hints
- **Impact:** Preserves game integrity and ensures all clues remain visible throughout session

### **Critical Fixes Log (Previous Issues)**

#### **Issue #1: Check Exonerations Button Not Working**
- **Problem:** Button had incorrect enable/disable logic and wasn't validating properly
- **User Guidance:** "The 'check exonerations' button still doesn't work"
- **Root Cause:** Button disabled when `shouldExonerate === 0` but should also check for incorrect exonerations
- **Solution:** 
  ```javascript
  const hasWork = shouldExonerate > 0 || incorrectlyExonerated > 0;
  checkBtn.disabled = !hasWork;
  ```
- **Additional:** Added comprehensive debug logging and better feedback messages

#### **Issue #2: Green Matches in Initial Clues**
- **Problem:** Initial clue could create exact matches, making game too easy
- **User Guidance:** "Change the difficulty so that there are no greens given as the current clue"
- **Root Cause:** Random trait selection didn't consider suspect distribution
- **Solution:** Intelligent clue generation with up to 50 attempts to find traits with no exact matches
- **Code:**
  ```javascript
  const exactMatches = gameState.suspects.filter(suspect => 
      suspect !== gameState.culprit && 
      suspect.traits[selectedTraitType] === gameState.culprit.traits[selectedTraitType]
  ).length;
  if (exactMatches === 0) break; // Perfect clue found
  ```

#### **Issue #3: Inaccurate Tracker Numbers**
- **Problem:** "Should exonerate"/"Exonerated"/"Remaining" counts were wrong
- **User Guidance:** "Make sure the logic is perfect so the number of suspects who should be exonerated in each round is accurate"
- **Root Cause:** Stale suspect status calculations and missing recalculations
- **Solution:** 
  - Always call `updateSuspectStatuses()` before counting
  - Recalculate on every UI update
  - Track incorrect exonerations separately
- **Result:** Perfect real-time accuracy in all tracker displays

#### **Issue #4: Deployment Dependency Issues**
- **Problem:** Express module not found when running locally
- **Context:** `Error: Cannot find module 'express'` in server.js
- **Solution:** Ensure `npm install` runs before `npm start`
- **Prevention:** Added to .gitignore and deployment documentation

#### **Issue #5: Game Stuck State - All Remaining Suspects Match Clues**
- **Problem:** Player reached state where all 4 remaining suspects had "Knowledge: Expert" (exact matches)
- **User Analysis:** "Can you analyze what went wrong here? Was I wrong or is there an issue with the game?"
- **Root Cause:** Initial "no green matches" fix only applied to first clue; subsequent clues could create unsolvable states
- **Impact:** 0 suspects should be exonerated → no way to progress → violates "3+ round minimum" design goal
- **Solution:** Intelligent clue progression that analyzes elimination potential
- **Implementation:**
  ```javascript
  // Find trait that eliminates most suspects while keeping game solvable
  const eliminableCount = remainingSuspects.filter(suspect => {
      if (suspect === gameState.culprit) return false;
      const tempClues = [...gameState.cluesRevealed, { type: traitType, value: culpritValue }];
      return !wouldMatchAllClues(suspect, tempClues);
  }).length;
  ```
- **Prevention:** Each new clue ensures 1+ suspects can be eliminated but game remains solvable

### **User Design Philosophy Enforcement:**

#### **Minimal Starting Information:**
- **Requirement:** "Start with minimal information - just 1 clue"
- **Implementation:** All difficulties now start with exactly 1 clue
- **Rationale:** Forces 3+ round strategic gameplay over lucky guessing

#### **No Green Shortcuts:**
- **Requirement:** "No greens given as the current clue"
- **Implementation:** Intelligent trait selection avoiding exact matches
- **Impact:** Players must use deductive reasoning, not pattern matching

#### **Perfect Logic Validation:**
- **Requirement:** "Make sure the logic is perfect"
- **Implementation:** Comprehensive status recalculation and validation
- **Tools:** Debug logging, real-time tracker updates, specific feedback messages

#### **Strategic Depth Over Speed:**
- **Philosophy:** "Thinking game, not guessing game"
- **Enforcement:** No timer pressure, mistake recovery, clear visual feedback
- **Result:** Game requires systematic analysis over multiple rounds

### **Common Issues & Solutions:**

#### **Runtime Issues:**
1. **Exoneration button not working** → Check event delegation and status updates
2. **Trait matching errors** → Verify getTraitDistance() edge cases and difficulty logic
3. **UI layout breaks** → Check CSS grid and flexbox fallbacks
4. **Game state corruption** → Validate suspect generation and status updates
5. **Tracker inaccuracy** → Ensure updateSuspectStatuses() called before counting

#### **Deployment Issues:**
1. **Express module missing** → Run `npm install` before `npm start`
2. **Render cache issues** → Force refresh deployment, check commit hashes
3. **Static file serving** → Verify server.js configuration for static assets

### **Testing Checklist:**
- [ ] All 3 difficulty levels work correctly
- [ ] Exonerate/un-exonerate cycle functions properly  
- [ ] Check Exonerations provides accurate feedback and works when clicked
- [ ] Game requires minimum 3 elimination rounds (no green matches initially)
- [ ] **No stuck states** - every elimination round allows meaningful progress
- [ ] Tracker numbers are accurate in real-time
- [ ] Intelligent clue progression prevents unsolvable situations
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Edge cases in trait matching handled correctly
- [ ] Performance acceptable on slower devices
- [ ] Debug logging visible in browser console for troubleshooting

### **Debug Commands:**
```javascript
// In browser console - check current game state
console.log('Game State:', gameState);
console.log('Culprit:', gameState.culprit);
console.log('Clues:', gameState.cluesRevealed);

// Check suspect statuses
gameState.suspects.forEach(s => {
    if (s.shouldExonerate) console.log('Should exonerate:', s.name);
});
```

## Version History & Evolution

### **v2.0 - Strategic Gameplay Overhaul (Current)**
- **Minimal clues:** Reduced to 1 starting clue
- **Exoneration system:** Visual feedback and mistake recovery
- **Logic fixes:** Proper trait matching and edge case handling  
- **UI improvements:** Grayed-out exonerated suspects, un-exonerate buttons
- **Performance:** Clean codebase, optimized for deployment

### **Design Evolution:**
- **v1.x:** Wordle-inspired with multiple starting clues (too easy)
- **v2.0:** Strategic logic puzzle requiring systematic analysis
- **Future:** Enhanced analytics and accessibility while preserving core logic

---

## Development Methodology & User Guidance

### **Iterative Problem-Solving Approach:**
This game has been developed through **direct user feedback** and **immediate problem resolution**. Each issue identified by the user results in:

1. **Clear Problem Statement** - User describes exact issue experienced
2. **Root Cause Analysis** - Technical investigation of underlying problems  
3. **Targeted Solution** - Specific code changes addressing the issue
4. **Comprehensive Testing** - Verification that fix works as intended
5. **Documentation Update** - Recording the problem and solution for future reference

### **User's Development Priorities:**
1. **Perfect Logic First** - Game mechanics must be flawlessly accurate
2. **Strategic Depth** - Every design decision prioritizes thinking over guessing
3. **No Shortcuts** - Players cannot bypass the intended deductive process
4. **Clear Feedback** - User always knows what to do next and why
5. **Mistake Recovery** - Players can correct errors without restarting

### **Quality Standards:**
- **Zero Tolerance for Logic Bugs** - Trackers, buttons, and validations must be perfect
- **Immediate User Testing** - Every change tested by actual gameplay
- **Comprehensive Documentation** - All fixes and rationale recorded
- **Debug Transparency** - Console logging enables troubleshooting

---

## For Future AI Developers

**This document represents the complete design intent and technical requirements for GUILTY.** Before making ANY changes:

1. **Read this entire README** to understand the design philosophy
2. **Test the current game** to experience the intended flow
3. **Respect the "NEVER DO" list** to avoid breaking core mechanics  
4. **Follow established patterns** for any new features
5. **Maintain the strategic, thinking-focused gameplay** above all else
6. **Document ALL fixes** in the Development History section when issues are resolved
7. **Preserve user guidance principles** that shaped each design decision

The game is designed to be a **sophisticated logic puzzle**. Any changes must enhance rather than compromise this core experience.

### **When Issues Arise:**
1. **Listen carefully** to user problem descriptions
2. **Investigate thoroughly** to find root causes
3. **Fix comprehensively** to prevent similar issues
4. **Document completely** for future reference
5. **Test extensively** to verify the solution

**Contact:** Preserve this design philosophy and development methodology in all future iterations.

**Latest Update:** Comprehensive documentation for AI-assisted development - January 2024 