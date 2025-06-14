// GUILTY - Detective Mystery Game - Complete Implementation
document.addEventListener('DOMContentLoaded', function() {
    const GameManager = (function() {
        // Game state
        let gameState = {
            difficulty: 'medium',
            suspects: [],
            culprit: null,
            cluesRevealed: [],
            startTime: null,
            timerInterval: null,
            gameActive: false,
            eliminationRound: 1,
            phase: 'elimination' // 'elimination' or 'final'
        };

        // Trait definitions with progressions
        const TRAIT_PROGRESSIONS = {
            access: ['None', 'Visitor', 'Contractor', 'Staff', 'VIP'],
            timing: ['Asleep', 'Working', 'Home', 'Out', 'Verified'],
            knowledge: ['None', 'Basic', 'Limited', 'Familiar', 'Expert'],
            motive: ['None', 'Curious', 'Vengeful', 'Greedy', 'Desperate'],
            behavior: ['Helpful', 'Normal', 'Changed', 'Nervous', 'Suspicious']
        };

        // Crime scenarios
        const CRIME_SCENARIOS = [
            {
                title: "The Museum Heist",
                description: "A priceless artifact has vanished from the Metropolitan Museum during a private gala. The thief left behind only subtle clues and disappeared into the night."
            },
            {
                title: "TechCorp Data Breach",
                description: "Confidential client data has been stolen from TechCorp's secure servers. The insider threat has compromised years of sensitive information."
            },
            {
                title: "The Restaurant Poisoning",
                description: "A celebrity chef has been poisoned at an exclusive restaurant opening. Someone with access to the kitchen had deadly intentions."
            }
        ];

        // Names pool for suspects
        const SUSPECT_NAMES = [
            'Alex Chen', 'Jordan Rivera', 'Morgan Blake', 'Taylor Swift', 'Casey Wong',
            'Riley Park', 'Avery Stone', 'Quinn Davis', 'Sage Miller', 'Drew Wilson',
            'Finley Cruz', 'Rowan Foster', 'Harper Lane', 'Kendall Gray', 'Logan Reed',
            'Cameron Bell'
        ];

        const JOBS = [
            'Security Guard', 'Curator', 'Caterer', 'Guest', 'Maintenance',
            'IT Specialist', 'Manager', 'Artist', 'Journalist', 'VIP',
            'Staff Member', 'Contractor', 'Volunteer', 'Photographer', 'Server',
            'Chef'
        ];

        // Initialize game
        function init() {
            bindEvents();
            showMainMenu();
        }

        function bindEvents() {
            // Main menu events
            document.getElementById('start-game').addEventListener('click', startGame);
            document.getElementById('rules-btn').addEventListener('click', showRules);

            // Game events
            document.getElementById('checkExonerationsBtn').addEventListener('click', checkExonerations);
        }

        function showMainMenu() {
            document.getElementById('main-menu').style.display = 'block';
            document.getElementById('game-screen').style.display = 'none';
        }

        function showRules() {
            document.getElementById('rulesModal').style.display = 'block';
        }

        function closeRules() {
            document.getElementById('rulesModal').style.display = 'none';
        }

        function startGame() {
            // Hide menu, show game
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('game-screen').style.display = 'block';

            // Initialize game state
            gameState.startTime = Date.now();
            gameState.gameActive = true;
            gameState.eliminationRound = 1;
            gameState.phase = 'elimination';
            gameState.cluesRevealed = [];

            // Generate game content
            setupCrimeScenario();
            generateSuspects();
            generateCulprit();
            generateInitialClues();
            
            // Start UI updates
            startTimer();
            updateGameStats();
            renderSuspects();
            updatePhaseIndicator();
            updateExonerationTracker();
        }

        function setupCrimeScenario() {
            const scenario = CRIME_SCENARIOS[Math.floor(Math.random() * CRIME_SCENARIOS.length)];
            document.getElementById('crimeTitle').textContent = scenario.title;
            document.getElementById('crimeDescription').textContent = scenario.description;
        }

        function generateSuspects() {
            gameState.suspects = [];
            const shuffledNames = [...SUSPECT_NAMES].sort(() => Math.random() - 0.5);
            const shuffledJobs = [...JOBS].sort(() => Math.random() - 0.5);

            for (let i = 0; i < 16; i++) {
                const suspect = {
                    id: i,
                    name: shuffledNames[i],
                    job: shuffledJobs[i],
                    traits: generateRandomTraits(),
                    hiddenTraits: [],
                    exonerated: false,
                    shouldExonerate: false
                };
                
                // Hide 2 traits per suspect to increase strategic challenge
                const traitTypes = Object.keys(TRAIT_PROGRESSIONS);
                const shuffledTraits = [...traitTypes].sort(() => Math.random() - 0.5);
                suspect.hiddenTraits = shuffledTraits.slice(0, 2);
                
                gameState.suspects.push(suspect);
            }
        }

        function generateRandomTraits() {
            const traits = {};
            Object.keys(TRAIT_PROGRESSIONS).forEach(traitType => {
                const values = TRAIT_PROGRESSIONS[traitType];
                traits[traitType] = values[Math.floor(Math.random() * values.length)];
            });
            return traits;
        }

        function generateCulprit() {
            // Select random suspect as culprit
            const availableSuspects = gameState.suspects.filter(s => !s.exonerated);
            gameState.culprit = availableSuspects[Math.floor(Math.random() * availableSuspects.length)];
        }

        function generateInitialClues() {
            // Always start with exactly 1 YELLOW clue that leaves 8-11 viable suspects
            let attempts = 0;
            const maxAttempts = 50;
            
            while (attempts < maxAttempts) {
                gameState.cluesRevealed = [];
                
                const traitTypes = Object.keys(TRAIT_PROGRESSIONS);
                const selectedTraitType = traitTypes[Math.floor(Math.random() * traitTypes.length)];
                const culpritValue = gameState.culprit.traits[selectedTraitType];
                
                // Try a clue that's 1 step away from the culprit's trait (creates yellow match for culprit)
                const progression = TRAIT_PROGRESSIONS[selectedTraitType];
                const culpritIndex = progression.indexOf(culpritValue);
                
                // Try both directions (one step before and one step after)
                // CRITICAL: Avoid extreme positions (0 and length-1) as they only have one adjacent position
                const possibleClueIndices = [];
                if (culpritIndex > 0) {
                    const clueIndex = culpritIndex - 1;
                    // Only use this clue if it's not at an extreme (has neighbors on both sides)
                    if (clueIndex > 0 && clueIndex < progression.length - 1) {
                        possibleClueIndices.push(clueIndex);
                    }
                }
                if (culpritIndex < progression.length - 1) {
                    const clueIndex = culpritIndex + 1;
                    // Only use this clue if it's not at an extreme (has neighbors on both sides)
                    if (clueIndex > 0 && clueIndex < progression.length - 1) {
                        possibleClueIndices.push(clueIndex);
                    }
                }
                
                for (const clueIndex of possibleClueIndices) {
                    const clueValue = progression[clueIndex];
                    
                    // Count how many suspects would remain viable with this clue
                    const viableSuspects = gameState.suspects.filter(suspect => {
                        // If this trait is hidden for the suspect, they're always viable (wildcard)
                        if (suspect.hiddenTraits.includes(selectedTraitType)) {
                            return true;
                        }
                        
                        const suspectValue = suspect.traits[selectedTraitType];
                        const distance = getTraitDistance(selectedTraitType, suspectValue, clueValue);
                        return distance === 1; // Yellow logic - only distance 1 is viable
                    }).length;
                    
                    // Check if this gives us the right number of viable suspects (8-11)
                    if (viableSuspects >= 8 && viableSuspects <= 11) {
                        gameState.cluesRevealed.push({
                            type: selectedTraitType,
                            value: clueValue
                        });
                        console.log(`Yellow clue generated: ${selectedTraitType} = ${clueValue}, viable suspects: ${viableSuspects}`);
                        updateSuspectStatuses();
                        renderClues();
                        updateExonerationTracker();
                        return;
                    }
                }
                
                attempts++;
            }
            
            // Fallback if no good yellow clue found - generate any yellow clue
            console.warn('No optimal yellow clue found, using fallback yellow clue');
            const traitTypes = Object.keys(TRAIT_PROGRESSIONS);
            const selectedTraitType = traitTypes[Math.floor(Math.random() * traitTypes.length)];
            const culpritValue = gameState.culprit.traits[selectedTraitType];
            const progression = TRAIT_PROGRESSIONS[selectedTraitType];
            const culpritIndex = progression.indexOf(culpritValue);
            
            // Generate a yellow clue (1 step away) for fallback
            let fallbackClueValue = culpritValue; // Default to green if no yellow possible
            if (culpritIndex > 0) {
                fallbackClueValue = progression[culpritIndex - 1]; // One step before
            } else if (culpritIndex < progression.length - 1) {
                fallbackClueValue = progression[culpritIndex + 1]; // One step after
            }
            
            gameState.cluesRevealed.push({
                type: selectedTraitType,
                value: fallbackClueValue
            });

            updateSuspectStatuses();
            renderClues();
            updateExonerationTracker();
        }

        function updateSuspectStatuses() {
            gameState.suspects.forEach(suspect => {
                suspect.shouldExonerate = !matchesCulpritClues(suspect);
            });
        }

        function matchesCulpritClues(suspect) {
            return gameState.cluesRevealed.every(clue => {
                // If this trait is hidden for the suspect, we can't eliminate them based on this clue
                // Hidden traits act as wildcards - they could match or not match
                if (suspect.hiddenTraits.includes(clue.type)) {
                    return true; // Assume it could match, so don't eliminate
                }
                
                const suspectValue = suspect.traits[clue.type];
                const culpritValue = clue.value;
                const distance = getTraitDistance(clue.type, suspectValue, culpritValue);
                
                // Yellow clue logic: clue is 1 step away from culprit's actual trait
                // - If suspect exactly matches clue (distance = 0): ELIMINATE (culprit is 1 step away from clue, not at clue)
                // - If suspect is 1 step away from clue (distance = 1): VIABLE (could be the culprit)
                // - If suspect is 2+ steps away from clue (distance >= 2): ELIMINATE (too far)
                return distance === 1;
            });
        }

        function getTraitDistance(traitType, value1, value2) {
            const progression = TRAIT_PROGRESSIONS[traitType];
            const index1 = progression.indexOf(value1);
            const index2 = progression.indexOf(value2);
            return Math.abs(index1 - index2);
        }

        function renderClues() {
            const gameBoard = document.getElementById('gameBoard');
            gameBoard.innerHTML = '<h3>Current Clues:</h3>';
            
            if (gameState.cluesRevealed.length === 0) {
                gameBoard.innerHTML += '<p>No clues revealed yet. Start eliminating suspects!</p>';
                return;
            }

            const clueRow = document.createElement('div');
            clueRow.className = 'clue-row';
            
            const clueFeedback = document.createElement('div');
            clueFeedback.className = 'clue-feedback';
            
            gameState.cluesRevealed.forEach(clue => {
                const traitDiv = document.createElement('div');
                traitDiv.className = 'trait-feedback close';
                traitDiv.innerHTML = `<strong>${capitalizeFirst(clue.type)}:</strong> ${clue.value}`;
                clueFeedback.appendChild(traitDiv);
            });
            
            clueRow.appendChild(clueFeedback);
            gameBoard.appendChild(clueRow);
        }

        function renderSuspects() {
            const grid = document.getElementById('suspectsGrid');
            grid.innerHTML = '';

            // Check if we're in accusation phase (2 suspects remaining)
            const remainingSuspects = gameState.suspects.filter(s => !s.exonerated);
            const isAccusationPhase = remainingSuspects.length === 2;

            gameState.suspects.forEach(suspect => {
                const card = document.createElement('div');
                card.className = 'suspect-card';
                card.dataset.suspectId = suspect.id;

                // Apply visual states
                if (suspect.exonerated) {
                    card.classList.add('exonerated');
                }
                // REMOVED: should-exonerate visual indicator to preserve "thinking game" principle
                // Players must deduce which suspects to eliminate without visual hints

                // Special styling for accusation phase
                if (isAccusationPhase && !suspect.exonerated) {
                    card.classList.add('accusation-ready');
                }

                // Create action buttons based on game phase and exonerated state
                let actionButton = '';
                if (suspect.exonerated) {
                    actionButton = `<button class="suspect-button un-exonerate-btn" onclick="GameManager.unExonerateSuspect(${suspect.id})">
                        Un-Exonerate
                    </button>`;
                } else if (isAccusationPhase) {
                    actionButton = `<button class="suspect-button accuse-btn" onclick="GameManager.accuseSuspect(${suspect.id})">
                        🎯 ACCUSE
                    </button>`;
                } else {
                    actionButton = `<button class="suspect-button exonerate-btn" onclick="GameManager.exonerateSuspect(${suspect.id})">
                        Exonerate
                    </button>`;
                }

                card.innerHTML = `
                    <div class="suspect-name">${suspect.name}</div>
                    <div class="suspect-job">${suspect.job}</div>
                    <div class="suspect-traits">
                        ${Object.entries(suspect.traits).map(([type, value]) => 
                            `<div class="trait-item">
                                <span>${capitalizeFirst(type)}</span>
                                <span class="${suspect.hiddenTraits.includes(type) ? 'hidden-trait' : ''}">${suspect.hiddenTraits.includes(type) ? '?' : value}</span>
                            </div>`
                        ).join('')}
                    </div>
                    <div class="suspect-actions">
                        ${actionButton}
                    </div>
                `;

                grid.appendChild(card);
            });
        }

        function exonerateSuspect(suspectId) {
            const suspect = gameState.suspects.find(s => s.id === suspectId);
            if (!suspect || suspect.exonerated) return;

            console.log(`Exonerating suspect: ${suspect.name}`);
            suspect.exonerated = true;
            
            // Check if this was the culprit
            if (suspect === gameState.culprit) {
                endGame(false, "You exonerated the culprit!");
                return;
            }

            // Update all displays and trackers
            updateGameStats();
            renderSuspects();
            updateExonerationTracker();

            // Check if we've reached accusation phase (2 suspects remaining)
            const remainingSuspects = gameState.suspects.filter(s => !s.exonerated);
            if (remainingSuspects.length === 2) {
                enterAccusationPhase();
            }
        }

        function accuseSuspect(suspectId) {
            const suspect = gameState.suspects.find(s => s.id === suspectId);
            if (!suspect || suspect.exonerated) return;

            console.log(`Accusing suspect: ${suspect.name}`);
            
            // Check if this is the correct accusation
            if (suspect === gameState.culprit) {
                // Victory!
                endGame(true, `🎉 Correct accusation! ${suspect.name} was indeed the culprit!`);
            } else {
                // Wrong accusation - game over
                endGame(false, `❌ Wrong accusation! ${suspect.name} was innocent. The real culprit was ${gameState.culprit.name}.`);
            }
        }

        function enterAccusationPhase() {
            gameState.phase = 'accusation';
            updatePhaseIndicator();
            showHint(`🎯 <strong>ACCUSATION PHASE!</strong> You've narrowed it down to 2 suspects. Choose carefully - accuse the culprit to win!`);
        }

        function unExonerateSuspect(suspectId) {
            const suspect = gameState.suspects.find(s => s.id === suspectId);
            if (!suspect || !suspect.exonerated) return;

            console.log(`Un-exonerating suspect: ${suspect.name}`);
            suspect.exonerated = false;
            
            // Update all displays and trackers
            updateGameStats();
            renderSuspects();
            updateExonerationTracker();
        }

        function checkExonerations() {
            console.log('checkExonerations called'); // Debug log
            
            // Ensure suspect statuses are up to date
            updateSuspectStatuses();
            
            let correctExonerations = 0;
            let incorrectExonerations = 0;
            let shouldExonerateCount = 0;
            let notExoneratedCount = 0;
            let incorrectlyExoneratedNames = [];
            let shouldExonerateNames = [];

            gameState.suspects.forEach(suspect => {
                if (suspect.shouldExonerate) {
                    shouldExonerateCount++;
                    if (suspect.exonerated) {
                        correctExonerations++;
                    } else {
                        notExoneratedCount++;
                        shouldExonerateNames.push(suspect.name);
                    }
                } else if (suspect.exonerated && suspect !== gameState.culprit) {
                    incorrectExonerations++;
                    incorrectlyExoneratedNames.push(suspect.name);
                }
            });

            console.log('Exoneration Check:', {
                shouldExonerateCount,
                correctExonerations,
                notExoneratedCount,
                incorrectExonerations,
                incorrectlyExoneratedNames,
                shouldExonerateNames
            });

            // Check if all eligible suspects have been exonerated and no incorrect ones
            if (correctExonerations === shouldExonerateCount && incorrectExonerations === 0 && shouldExonerateCount > 0) {
                // Perfect round - give new clue
                addNewClue();
                gameState.eliminationRound++;
                updatePhaseIndicator();
                updateExonerationTracker();
                showHint(`✅ Perfect elimination! New clue revealed for Round ${gameState.eliminationRound}`);
            } else {
                // Show specific feedback about what needs to be fixed
                let message = "";
                if (incorrectExonerations > 0) {
                    message = `❌ You incorrectly exonerated: <strong>${incorrectlyExoneratedNames.join(', ')}</strong>. These suspects DO match the current clues (including yellow/close matches). Please un-exonerate them.`;
                } else if (notExoneratedCount > 0) {
                    message = `⚠️ You still need to exonerate: <strong>${shouldExonerateNames.join(', ')}</strong>. These suspects don't match ALL the clues.`;
                } else if (shouldExonerateCount === 0) {
                    message = `🤔 No suspects need to be exonerated right now. All remaining suspects are viable matches for the current clues.`;
                } else {
                    message = `📝 Review the current clues and suspect traits carefully.`;
                }
                showHint(message);
                
                // Highlight incorrectly exonerated suspects
                highlightIncorrectExonerations(incorrectlyExoneratedNames);
            }
        }

        function addNewClue() {
            const availableTraits = Object.keys(TRAIT_PROGRESSIONS).filter(type => 
                !gameState.cluesRevealed.some(clue => clue.type === type)
            );

            if (availableTraits.length > 0) {
                // Get remaining non-exonerated suspects
                const remainingSuspects = gameState.suspects.filter(s => !s.exonerated);
                
                let bestTraitType = null;
                let bestClueValue = null;
                let maxEliminable = 0;
                
                // Find the trait that allows eliminating the most suspects while keeping game solvable
                for (const traitType of availableTraits) {
                    const culpritValue = gameState.culprit.traits[traitType];
                    const progression = TRAIT_PROGRESSIONS[traitType];
                    const culpritIndex = progression.indexOf(culpritValue);
                    
                    // Generate possible yellow clues (1 step away from culprit's trait)
                    // CRITICAL: Avoid extreme positions (0 and length-1) as they only have one adjacent position
                    const possibleClueIndices = [];
                    if (culpritIndex > 0) {
                        const clueIndex = culpritIndex - 1;
                        // Only use this clue if it's not at an extreme (has neighbors on both sides)
                        if (clueIndex > 0 && clueIndex < progression.length - 1) {
                            possibleClueIndices.push(clueIndex);
                        }
                    }
                    if (culpritIndex < progression.length - 1) {
                        const clueIndex = culpritIndex + 1;
                        // Only use this clue if it's not at an extreme (has neighbors on both sides)
                        if (clueIndex > 0 && clueIndex < progression.length - 1) {
                            possibleClueIndices.push(clueIndex);
                        }
                    }
                    
                    // Try each possible yellow clue for this trait
                    for (const clueIndex of possibleClueIndices) {
                        const clueValue = progression[clueIndex];
                        
                        // Count how many remaining suspects would NOT match this new clue
                        const eliminableCount = remainingSuspects.filter(suspect => {
                            if (suspect === gameState.culprit) return false; // Never eliminate culprit
                            
                            // Simulate adding this clue and check if suspect would match ALL clues
                            const tempClues = [...gameState.cluesRevealed, { type: traitType, value: clueValue }];
                            return !wouldMatchAllClues(suspect, tempClues);
                        }).length;
                        
                        // Ensure at least 1 suspect can be eliminated but not all non-culprit suspects
                        const nonCulpritRemaining = remainingSuspects.filter(s => s !== gameState.culprit).length;
                        if (eliminableCount > 0 && eliminableCount < nonCulpritRemaining) {
                            if (eliminableCount > maxEliminable) {
                                maxEliminable = eliminableCount;
                                bestTraitType = traitType;
                                bestClueValue = clueValue;
                            }
                        }
                    }
                }
                
                // If no good yellow clue found, use fallback with extreme position restrictions
                if (!bestTraitType) {
                    console.warn('No optimal yellow clue found, using fallback');
                    bestTraitType = availableTraits[Math.floor(Math.random() * availableTraits.length)];
                    const culpritValue = gameState.culprit.traits[bestTraitType];
                    const progression = TRAIT_PROGRESSIONS[bestTraitType];
                    const culpritIndex = progression.indexOf(culpritValue);
                    
                    // Generate fallback yellow clue with extreme position restrictions
                    bestClueValue = culpritValue; // Default fallback
                    if (culpritIndex > 0) {
                        const clueIndex = culpritIndex - 1;
                        if (clueIndex > 0 && clueIndex < progression.length - 1) {
                            bestClueValue = progression[clueIndex];
                        }
                    } else if (culpritIndex < progression.length - 1) {
                        const clueIndex = culpritIndex + 1;
                        if (clueIndex > 0 && clueIndex < progression.length - 1) {
                            bestClueValue = progression[clueIndex];
                        }
                    }
                }
                
                gameState.cluesRevealed.push({
                    type: bestTraitType,
                    value: bestClueValue
                });

                console.log(`New yellow clue added: ${bestTraitType} = ${bestClueValue} (eliminable: ${maxEliminable})`);
                
                // Update everything after new clue
                updateSuspectStatuses();
                renderClues();
                renderSuspects();
                updateGameStats();
                updateExonerationTracker();
            }
        }
        
        function wouldMatchAllClues(suspect, clues) {
            return clues.every(clue => {
                // If this trait is hidden for the suspect, we can't eliminate them based on this clue
                // Hidden traits act as wildcards - they could match or not match
                if (suspect.hiddenTraits.includes(clue.type)) {
                    return true; // Assume it could match, so don't eliminate
                }
                
                const suspectValue = suspect.traits[clue.type];
                const culpritValue = clue.value;
                const distance = getTraitDistance(clue.type, suspectValue, culpritValue);
                
                // Yellow clue logic: only suspects exactly 1 step away from clue are viable
                return distance === 1;
            });
        }

        function highlightIncorrectExonerations(incorrectNames) {
            // Clear any existing highlights
            document.querySelectorAll('.suspect-card').forEach(card => {
                card.classList.remove('incorrectly-exonerated');
            });
            
            // Highlight incorrectly exonerated suspects
            if (incorrectNames.length > 0) {
                gameState.suspects.forEach(suspect => {
                    if (incorrectNames.includes(suspect.name)) {
                        const card = document.querySelector(`[data-suspect-id="${suspect.id}"]`);
                        if (card) {
                            card.classList.add('incorrectly-exonerated');
                        }
                    }
                });
            }
        }

        function showHint(message) {
            const existing = document.querySelector('.hint-reveal');
            if (existing) existing.remove();

            const hint = document.createElement('div');
            hint.className = 'hint-reveal';
            hint.innerHTML = `
                <div class="hint-title">Investigation Update</div>
                <div>${message}</div>
            `;

            document.getElementById('gameBoard').appendChild(hint);

            // Auto-hide after 8 seconds for longer messages
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.remove();
                }
            }, 8000);
        }

        function updateExonerationTracker() {
            // Recalculate suspect statuses first to ensure accuracy
            updateSuspectStatuses();
            
            const shouldExonerate = gameState.suspects.filter(s => s.shouldExonerate && !s.exonerated).length;
            const exonerated = gameState.suspects.filter(s => s.exonerated).length;
            const remaining = gameState.suspects.filter(s => !s.exonerated).length;
            
            // Count incorrect exonerations (suspects who are exonerated but shouldn't be, excluding culprit)
            const incorrectlyExonerated = gameState.suspects.filter(s => 
                s.exonerated && !s.shouldExonerate && s !== gameState.culprit
            ).length;

            document.getElementById('shouldExonerateCount').textContent = shouldExonerate;
            document.getElementById('exoneratedCount').textContent = exonerated;
            document.getElementById('remainingCount').textContent = remaining;

            // Hide exoneration tracker during accusation phase
            const tracker = document.getElementById('exonerationTracker');
            if (gameState.phase === 'accusation') {
                tracker.style.display = 'none';
                return;
            } else {
                tracker.style.display = 'flex';
            }

            // Enable check button when:
            // 1. Suspects that should be exonerated but aren't
            // 2. Suspects that are incorrectly exonerated 
            // 3. Player has done correct exonerations and needs to check them to get next clue
            const checkBtn = document.getElementById('checkExonerationsBtn');
            const hasCorrectExonerations = exonerated > 0 && shouldExonerate === 0 && incorrectlyExonerated === 0;
            const hasWork = shouldExonerate > 0 || incorrectlyExonerated > 0 || hasCorrectExonerations;
            checkBtn.disabled = !hasWork;
            
            // Debug logging (remove in production)
            console.log('Tracker Update:', {
                shouldExonerate,
                exonerated, 
                remaining,
                incorrectlyExonerated,
                hasCorrectExonerations,
                hasWork,
                buttonDisabled: checkBtn.disabled
            });
        }

        function updatePhaseIndicator() {
            const indicator = document.getElementById('phaseIndicator');
            const title = indicator.querySelector('.phase-title');
            const description = indicator.querySelector('.phase-description');

            if (gameState.phase === 'accusation') {
                title.textContent = '🎯 ACCUSATION PHASE';
                description.textContent = 'You\'ve narrowed it down to 2 suspects! Choose wisely - accuse the correct culprit to win!';
                indicator.classList.add('accusation-phase');
            } else {
                title.textContent = `Elimination Round ${gameState.eliminationRound}`;
                description.textContent = 'Exonerate all suspects who don\'t match the clues to receive another trait!';
                indicator.classList.remove('accusation-phase');
            }
        }

        function startTimer() {
            gameState.timerInterval = setInterval(() => {
                if (!gameState.gameActive) return;

                const elapsed = Date.now() - gameState.startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                document.getElementById('timerDisplay').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }

        function updateGameStats() {
            document.getElementById('cluesDisplay').textContent = gameState.cluesRevealed.length;
            document.getElementById('viableDisplay').textContent = 
                gameState.suspects.filter(s => !s.exonerated).length;
            document.getElementById('roundsDisplay').textContent = gameState.eliminationRound;
        }

        function endGame(won, message) {
            gameState.gameActive = false;
            clearInterval(gameState.timerInterval);

            // Show culprit
            if (gameState.culprit) {
                const culpritCard = document.querySelector(`[data-suspect-id="${gameState.culprit.id}"]`);
                if (culpritCard) {
                    culpritCard.classList.add('the-culprit');
                }
            }

            // Show game over screen
            setTimeout(() => {
                const gameOver = document.getElementById('gameOver');
                const title = document.getElementById('gameOverTitle');
                const messageDiv = document.getElementById('gameOverMessage');

                title.textContent = won ? '🎉 Case Solved!' : '❌ Case Failed!';
                messageDiv.innerHTML = `
                    <p>${message}</p>
                    <p>The culprit was: <strong>${gameState.culprit.name}</strong></p>
                    <p>Time: ${document.getElementById('timerDisplay').textContent}</p>
                    <p>Rounds: ${gameState.eliminationRound}</p>
                `;

                if (won) {
                    gameOver.classList.add('won');
                }

                gameOver.style.display = 'block';
            }, 2000);
        }

        function capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Public API
        return {
            init,
            exonerateSuspect,
            unExonerateSuspect,
            accuseSuspect,
            closeRules
        };
    })();

    // Initialize the game
    GameManager.init();
    
    // Make GameManager globally accessible
    window.GameManager = GameManager;
}); 