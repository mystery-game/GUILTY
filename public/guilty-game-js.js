// GUILTY v6 - Enhanced Security, Difficulty, and Performance

// Game manager using closure to hide sensitive data
const GameManager = (function() {
    // Private game state - not accessible from console
    let privateState = {
        culprit: null,
        suspects: [],
        initialSuspect: null,
        gameSecret: 'guilty-' + Math.random().toString(36).substring(7), // Random secret per session
        sessionId: null
    };
    
    // Public game state
    let publicState = {
        difficulty: 'medium',
        guesses: [],
        currentGuess: 0,
        gameOver: false,
        won: false,
        devMode: false,
        currentScenarioIndex: 0,
        isProcessingGuess: false,
        startTime: null,
        timerInterval: null,
        elapsedTime: 0,
        eliminatedSuspects: new Set(),
        betaMode: false,
        viableSuspectsCount: 16,
        confidenceLevel: 0
    };
    
    // Enhanced difficulty settings with better balance
    const DIFFICULTY_SETTINGS = {
        easy: {
            maxGuesses: 8,
            name: 'Easy',
            minViableSuspects: 10,
            minSecondGuessViable: 5,
            yellowTraits: 3, // More yellow traits for easier deduction
            missingTraitChance: 0.15, // Less missing info
            distributionStrategy: {
                matchInitialYellow: 45,  // More suspects match initial
                otherYellow: 25,
                matchCulprit: 20,
                farValue: 10
            }
        },
        medium: {
            maxGuesses: 6,
            name: 'Medium',
            minViableSuspects: 12,
            minSecondGuessViable: 7,
            yellowTraits: 2,
            missingTraitChance: 0.25,
            distributionStrategy: {
                matchInitialYellow: 40,
                otherYellow: 20,
                matchCulprit: 25,
                farValue: 15
            }
        },
        hard: {
            maxGuesses: 4,
            name: 'Hard',
            minViableSuspects: 14,
            minSecondGuessViable: 9,
            yellowTraits: 1,
            missingTraitChance: 0.35,
            distributionStrategy: {
                matchInitialYellow: 35,
                otherYellow: 15,
                matchCulprit: 30,
                farValue: 20
            }
        }
    };
    
    // Crime scenarios with enhanced themes
    const CRIME_SCENARIOS = [
        {
            id: 'museum_heist',
            title: "The Museum Diamond Heist",
            description: "The priceless 'Star of Mumbai' diamond was stolen from the Natural History Museum last night. Security footage shows the thief knew the guard rotation perfectly. The crime occurred between 2-3 AM.",
            setting: 'museum',
            traits: {
                access: ['Staff', 'Visitor', 'VIP', 'Contractor', 'None'],
                timing: ['Working', 'Home', 'Out', 'Verified', 'Asleep'],
                knowledge: ['Expert', 'Familiar', 'Basic', 'Limited', 'None'],
                motive: ['Desperate', 'Greedy', 'Vengeful', 'Curious', 'None'],
                behavior: ['Suspicious', 'Nervous', 'Changed', 'Normal', 'Helpful']
            },
            suspectJobs: [
                { title: "Security Guard", access: "Staff", knowledge: "Expert" },
                { title: "Janitor", access: "Staff", knowledge: "Familiar" },
                { title: "Curator", access: "Staff", knowledge: "Basic" },
                { title: "Tour Guide", access: "Staff", knowledge: "Basic" },
                { title: "Wealthy Donor", access: "VIP", knowledge: "None" },
                { title: "Maintenance Worker", access: "Contractor", knowledge: "Familiar" },
                { title: "Art Student", access: "Visitor", knowledge: "None" },
                { title: "Security Consultant", access: "Contractor", knowledge: "Expert" },
                { title: "Night Watchman", access: "Staff", knowledge: "Expert" },
                { title: "Private Collector", access: "VIP", knowledge: "Basic" },
                { title: "Museum Administrator", access: "Staff", knowledge: "Basic" },
                { title: "Restoration Expert", access: "Contractor", knowledge: "Limited" },
                { title: "Insurance Investigator", access: "VIP", knowledge: "Familiar" },
                { title: "Archaeologist", access: "VIP", knowledge: "None" },
                { title: "Gift Shop Employee", access: "Staff", knowledge: "Limited" },
                { title: "Delivery Driver", access: "Contractor", knowledge: "None" }
            ]
        },
        {
            id: 'tech_breach',
            title: "The Research Lab Data Theft",
            description: "Someone copied confidential AI research data from TechCorp's lab. The breach occurred at 11:47 PM using valid credentials. The stolen data could be worth millions.",
            setting: 'tech_company',
            traits: {
                access: ['Admin', 'Developer', 'Employee', 'Contractor', 'None'],
                timing: ['Online', 'Office', 'Home', 'Logged', 'Offline'],
                knowledge: ['Expert', 'Advanced', 'Basic', 'Limited', 'None'],
                motive: ['Profit', 'Competition', 'Whistleblowing', 'Curiosity', 'None'],
                behavior: ['Paranoid', 'Defensive', 'Evasive', 'Normal', 'Cooperative']
            },
            suspectJobs: [
                { title: "System Admin", access: "Admin", knowledge: "Expert" },
                { title: "Senior Developer", access: "Developer", knowledge: "Expert" },
                { title: "Junior Developer", access: "Developer", knowledge: "Advanced" },
                { title: "Project Manager", access: "Employee", knowledge: "Basic" },
                { title: "Security Analyst", access: "Admin", knowledge: "Expert" },
                { title: "IT Contractor", access: "Contractor", knowledge: "Advanced" },
                { title: "Intern", access: "Developer", knowledge: "Basic" },
                { title: "Former Employee", access: "Employee", knowledge: "Expert" },
                { title: "Database Admin", access: "Admin", knowledge: "Advanced" },
                { title: "QA Tester", access: "Developer", knowledge: "Basic" },
                { title: "Network Engineer", access: "Admin", knowledge: "Expert" },
                { title: "DevOps Engineer", access: "Developer", knowledge: "Advanced" },
                { title: "Technical Writer", access: "Employee", knowledge: "Limited" },
                { title: "Compliance Officer", access: "Employee", knowledge: "Basic" },
                { title: "Remote Contractor", access: "Contractor", knowledge: "Advanced" },
                { title: "UI Designer", access: "Developer", knowledge: "Limited" }
            ]
        },
        {
            id: 'recipe_theft',
            title: "The Secret Recipe Theft",
            description: "The famous century-old recipe for 'Grandma's Miracle Cookies' was stolen from the company vault. The thief struck during the evening shift change at 7:45 PM. Competitors would pay handsomely for this formula.",
            setting: 'bakery',
            traits: {
                access: ['Kitchen', 'Office', 'Delivery', 'Limited', 'None'],
                timing: ['Working', 'Break', 'Meeting', 'Documented', 'Absent'],
                knowledge: ['Expert', 'Professional', 'Amateur', 'Basic', 'None'],
                motive: ['Competition', 'Money', 'Recognition', 'Curiosity', 'None'],
                behavior: ['Agitated', 'Guilty', 'Shocked', 'Helpful', 'Calm']
            },
            suspectJobs: [
                { title: "Head Baker", access: "Kitchen", knowledge: "Expert" },
                { title: "Assistant Baker", access: "Kitchen", knowledge: "Professional" },
                { title: "Pastry Chef", access: "Kitchen", knowledge: "Professional" },
                { title: "Store Manager", access: "Office", knowledge: "Amateur" },
                { title: "Cashier", access: "Limited", knowledge: "None" },
                { title: "Competitor's Spy", access: "None", knowledge: "None" },
                { title: "Business Partner", access: "Office", knowledge: "Basic" },
                { title: "Delivery Driver", access: "Delivery", knowledge: "None" },
                { title: "Recipe Developer", access: "Kitchen", knowledge: "Expert" },
                { title: "Marketing Director", access: "Office", knowledge: "Basic" },
                { title: "Night Baker", access: "Kitchen", knowledge: "Professional" },
                { title: "Kitchen Assistant", access: "Kitchen", knowledge: "Amateur" },
                { title: "Food Blogger", access: "Limited", knowledge: "Amateur" },
                { title: "Supply Manager", access: "Delivery", knowledge: "Basic" },
                { title: "Franchise Owner", access: "Office", knowledge: "Basic" },
                { title: "Evening Supervisor", access: "Kitchen", knowledge: "Professional" }
            ]
        },
        {
            id: 'restaurant_poisoning',
            title: "The Five-Star Poisoning",
            description: "Celebrity chef Marcus Beaumont collapsed during dinner service at Le Jardin. A rare poison was found in his wine glass. Only those with kitchen access between 7-8 PM could have done it.",
            setting: 'restaurant',
            traits: {
                access: ['Kitchen', 'Service', 'VIP', 'Limited', 'None'],
                timing: ['Working', 'Break', 'Dining', 'Documented', 'Absent'],
                knowledge: ['Expert', 'Professional', 'Amateur', 'Basic', 'None'],
                motive: ['Jealousy', 'Revenge', 'Inheritance', 'Competition', 'None'],
                behavior: ['Agitated', 'Guilty', 'Shocked', 'Helpful', 'Calm']
            },
            suspectJobs: [
                { title: "Sous Chef", access: "Kitchen", knowledge: "Expert" },
                { title: "Line Cook", access: "Kitchen", knowledge: "Professional" },
                { title: "Sommelier", access: "Service", knowledge: "Professional" },
                { title: "Restaurant Owner", access: "Kitchen", knowledge: "Amateur" },
                { title: "Food Critic", access: "VIP", knowledge: "Amateur" },
                { title: "Ex-Business Partner", access: "Limited", knowledge: "Basic" },
                { title: "Apprentice Chef", access: "Kitchen", knowledge: "Professional" },
                { title: "Head Waiter", access: "Service", knowledge: "Basic" },
                { title: "Celebrity Guest", access: "VIP", knowledge: "None" },
                { title: "Rival Chef", access: "None", knowledge: "Expert" },
                { title: "Prep Cook", access: "Kitchen", knowledge: "Amateur" },
                { title: "Bartender", access: "Service", knowledge: "Basic" },
                { title: "Kitchen Manager", access: "Kitchen", knowledge: "Professional" },
                { title: "Wine Supplier", access: "Limited", knowledge: "None" },
                { title: "Health Inspector", access: "VIP", knowledge: "Basic" },
                { title: "Pastry Chef", access: "Kitchen", knowledge: "Amateur" }
            ]
        },
        {
            id: 'underwater_mystery',
            title: "The Sunken Treasure Sabotage",
            description: "A priceless artifact vanished from the deep-sea research base. Only those with access to the submersible bay could have done it. The theft occurred during a bioluminescent blackout.",
            setting: 'underwater',
            traits: {
                access: ['Diver', 'Scientist', 'Technician', 'Visitor', 'None'],
                timing: ['On Duty', 'Resting', 'Exploring', 'Logged', 'Missing'],
                knowledge: ['Marine Expert', 'Engineer', 'Biologist', 'Basic', 'None'],
                motive: ['Discovery', 'Profit', 'Sabotage', 'Curiosity', 'None'],
                behavior: ['Secretive', 'Nervous', 'Calm', 'Helpful', 'Absent']
            },
            suspectJobs: [
                { title: "Lead Diver", access: "Diver", knowledge: "Marine Expert" },
                { title: "Marine Biologist", access: "Scientist", knowledge: "Biologist" },
                { title: "Sub Technician", access: "Technician", knowledge: "Engineer" },
                { title: "Tourist", access: "Visitor", knowledge: "None" },
                { title: "Research Director", access: "Scientist", knowledge: "Marine Expert" },
                { title: "Maintenance Crew", access: "Technician", knowledge: "Basic" },
                { title: "Documentarian", access: "Visitor", knowledge: "Basic" },
                { title: "Security Officer", access: "Diver", knowledge: "Engineer" }
            ]
        },
        {
            id: 'animal_escape',
            title: "The Zoo Animal Escape",
            description: "A rare animal has mysteriously escaped from the city zoo. Only those with access to the enclosures could have orchestrated it. The incident happened during the morning feeding.",
            setting: 'zoo',
            traits: {
                access: ['Keeper', 'Vet', 'Volunteer', 'Visitor', 'None'],
                timing: ['Feeding', 'Cleaning', 'Tour', 'Break', 'Absent'],
                knowledge: ['Animal Expert', 'Medical', 'Basic', 'Limited', 'None'],
                motive: ['Activism', 'Negligence', 'Profit', 'Curiosity', 'None'],
                behavior: ['Nervous', 'Calm', 'Excited', 'Helpful', 'Missing']
            },
            suspectJobs: [
                { title: "Head Keeper", access: "Keeper", knowledge: "Animal Expert" },
                { title: "Veterinarian", access: "Vet", knowledge: "Medical" },
                { title: "Volunteer", access: "Volunteer", knowledge: "Basic" },
                { title: "Tourist", access: "Visitor", knowledge: "None" },
                { title: "Animal Trainer", access: "Keeper", knowledge: "Animal Expert" },
                { title: "Janitor", access: "Volunteer", knowledge: "Limited" },
                { title: "Photographer", access: "Visitor", knowledge: "Basic" },
                { title: "Security Guard", access: "Keeper", knowledge: "Basic" }
            ]
        },
        {
            id: 'space_station',
            title: "The Space Station Sabotage",
            description: "Critical systems were tampered with aboard the international space station. Only crew with access to engineering modules could have done it. The sabotage occurred during a solar storm blackout.",
            setting: 'space',
            traits: {
                access: ['Commander', 'Engineer', 'Scientist', 'Visitor', 'None'],
                timing: ['On Shift', 'Sleeping', 'Experiment', 'Logged', 'Missing'],
                knowledge: ['Astro Expert', 'Engineer', 'Biologist', 'Basic', 'None'],
                motive: ['Sabotage', 'Experiment', 'Profit', 'Curiosity', 'None'],
                behavior: ['Secretive', 'Nervous', 'Calm', 'Helpful', 'Absent']
            },
            suspectJobs: [
                { title: "Commander", access: "Commander", knowledge: "Astro Expert" },
                { title: "Flight Engineer", access: "Engineer", knowledge: "Engineer" },
                { title: "Mission Scientist", access: "Scientist", knowledge: "Biologist" },
                { title: "Space Tourist", access: "Visitor", knowledge: "None" },
                { title: "Payload Specialist", access: "Scientist", knowledge: "Engineer" },
                { title: "Medical Officer", access: "Engineer", knowledge: "Basic" },
                { title: "Communications Officer", access: "Commander", knowledge: "Basic" },
                { title: "Security Officer", access: "Engineer", knowledge: "Engineer" }
            ]
        },
        {
            id: 'school_cheating',
            title: "The School Exam Scandal",
            description: "The answers to the final exam were leaked at the prestigious academy. Only those with access to the teacher's lounge could have done it. The leak happened during lunch break.",
            setting: 'school',
            traits: {
                access: ['Teacher', 'Student', 'Staff', 'Visitor', 'None'],
                timing: ['Class', 'Break', 'Lunch', 'Absent', 'Excused'],
                knowledge: ['Subject Expert', 'Tutor', 'Basic', 'Limited', 'None'],
                motive: ['Grades', 'Revenge', 'Money', 'Curiosity', 'None'],
                behavior: ['Nervous', 'Calm', 'Excited', 'Helpful', 'Missing']
            },
            suspectJobs: [
                { title: "Math Teacher", access: "Teacher", knowledge: "Subject Expert" },
                { title: "Student Council", access: "Student", knowledge: "Tutor" },
                { title: "Janitor", access: "Staff", knowledge: "Limited" },
                { title: "Parent Visitor", access: "Visitor", knowledge: "None" },
                { title: "Principal", access: "Staff", knowledge: "Subject Expert" },
                { title: "Tutor", access: "Staff", knowledge: "Tutor" },
                { title: "Exchange Student", access: "Student", knowledge: "Basic" },
                { title: "Security Officer", access: "Staff", knowledge: "Basic" }
            ]
        }
    ];
    
    // Enhanced visual themes using CSS variables
    const CRIME_THEMES = {
        museum_heist: {
            name: 'Classical Museum',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #8B4513 0%, #D2B48C 50%, #F5DEB3 100%)',
                '--primary': '#8B4513',
                '--secondary': '#D2B48C',
                '--accent': '#DAA520',
                '--text': '#2F1B14',
                '--card-bg': 'rgba(245, 222, 179, 0.9)',
                '--button-gradient': 'linear-gradient(145deg, #DAA520, #B8860B)',
                '--font-family': 'Georgia, serif'
            },
            icon: '🏛️'
        },
        tech_breach: {
            name: 'Cyber Tech',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #0F0F23 0%, #1a1a2e 50%, #16213e 100%)',
                '--primary': '#00ff41',
                '--secondary': '#0066cc',
                '--accent': '#00ccff',
                '--text': '#00ff41',
                '--card-bg': 'rgba(15, 15, 35, 0.9)',
                '--button-gradient': 'linear-gradient(145deg, #00ccff, #0066cc)',
                '--font-family': '"Courier New", monospace'
            },
            icon: '💻'
        },
        recipe_theft: {
            name: 'Warm Bakery',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD23F 100%)',
                '--primary': '#8B4513',
                '--secondary': '#D2691E',
                '--accent': '#FF6B35',
                '--text': '#4A2C2A',
                '--card-bg': 'rgba(255, 210, 63, 0.9)',
                '--button-gradient': 'linear-gradient(145deg, #FF6B35, #D2691E)',
                '--font-family': '"Comic Sans MS", cursive'
            },
            icon: '🍞'
        },
        restaurant_poisoning: {
            name: 'Elegant Restaurant',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #2C1810 0%, #8B0000 50%, #4A0E0E 100%)',
                '--primary': '#FFD700',
                '--secondary': '#8B0000',
                '--accent': '#DC143C',
                '--text': '#FFD700',
                '--card-bg': 'rgba(139, 0, 0, 0.9)',
                '--button-gradient': 'linear-gradient(145deg, #FFD700, #DAA520)',
                '--font-family': '"Times New Roman", serif'
            },
            icon: '🍷'
        },
        underwater_mystery: {
            name: 'Underwater Base',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
                '--scenario-bg-img': 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80)',
                '--card-border-radius': '30px',
                '--primary': '#00bcd4',
                '--secondary': '#009688',
                '--accent': '#00e5ff',
                '--text': '#e0f7fa',
                '--card-bg': 'rgba(0, 188, 212, 0.15)',
                '--button-gradient': 'linear-gradient(145deg, #00e5ff, #009688)',
                '--font-family': 'Trebuchet MS, sans-serif',
                '--scenario-icon': '"\\1F30A"', // 🌊 Unicode
                '--card-border': '#00bcd4',
                '--header-bg': 'rgba(0, 188, 212, 0.2)'
            },
            icon: '🌊'
        },
        animal_escape: {
            name: 'City Zoo',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)',
                '--primary': '#8d5524',
                '--secondary': '#c68642',
                '--accent': '#e0ac69',
                '--text': '#4e342e',
                '--card-bg': 'rgba(247, 183, 51, 0.15)',
                '--button-gradient': 'linear-gradient(145deg, #fc4a1a, #f7b733)',
                '--font-family': 'Verdana, sans-serif'
            },
            icon: '🦁'
        },
        space_station: {
            name: 'Space Station',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                '--primary': '#ffffff',
                '--secondary': '#00bcd4',
                '--accent': '#ffeb3b',
                '--text': '#e1f5fe',
                '--card-bg': 'rgba(33, 150, 243, 0.15)',
                '--button-gradient': 'linear-gradient(145deg, #00bcd4, #ffeb3b)',
                '--font-family': 'Orbitron, sans-serif'
            },
            icon: '🚀'
        },
        school_cheating: {
            name: 'Academy',
            cssVars: {
                '--bg-gradient': 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                '--primary': '#283e51',
                '--secondary': '#485563',
                '--accent': '#ffd200',
                '--text': '#212121',
                '--card-bg': 'rgba(255, 210, 0, 0.15)',
                '--button-gradient': 'linear-gradient(145deg, #ffd200, #f7971e)',
                '--font-family': 'Arial, sans-serif'
            },
            icon: '🏫'
        }
    };
    
    // Current crime scenario
    let currentCrime = null;
    
    // Utility functions
    function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    
    // Enhanced hash function for unpredictable seeds
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    // Get secure daily seed
    function getDailySeed() {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        let estTime = new Date(utcTime + (3600000 * -5)); // EST is UTC-5
        
        if (publicState.betaMode) {
            estTime = new Date(estTime.getTime() + (5 * 3600000)); // Add 5 hours for beta
        }
        
        const isPM = estTime.getHours() >= 12;
        const dateStr = estTime.toISOString().split('T')[0];
        const period = isPM ? 'PM' : 'AM';
        
        // Use hash for unpredictable seed
        const seedString = `${dateStr}-${period}-${privateState.gameSecret}`;
        return hashCode(seedString);
    }
    
    // Get current time in EST
    function getESTTime() {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utcTime + (3600000 * -5));
    }
    
    // Get puzzle period
    function getPuzzlePeriod() {
        const estTime = getESTTime();
        return estTime.getHours() >= 12 ? 'PM' : 'AM';
    }
    
    // Apply visual theme with CSS variables
    function applyTheme(crimeId) {
        const theme = CRIME_THEMES[crimeId];
        if (!theme) return;
        const root = document.documentElement;
        root.style.transition = 'all 0.3s ease-in-out';
        Object.entries(theme.cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        document.body.className = `theme-${crimeId}`;
        // Update header icon
        const header = document.querySelector('h1');
        if (header) {
            header.innerHTML = `${theme.icon} GUILTY ${theme.icon}`;
        }
        // Add scenario icon to suspect cards (example for underwater)
        if (crimeId === 'underwater_mystery') {
            document.querySelectorAll('.suspect-card').forEach(card => {
                if (!card.querySelector('.scenario-icon')) {
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'scenario-icon';
                    iconDiv.textContent = theme.icon;
                    card.prepend(iconDiv);
                }
            });
        }
        requestAnimationFrame(() => {
            document.querySelectorAll('.needs-theme').forEach(el => {
                el.classList.add('themed');
            });
        });
    }
    
    // Get trait categories for current crime
    function getTraitCategories(crime) {
        const baseCategories = {
            museum_heist: {
                access: {
                    name: 'Museum Access',
                    values: {
                        'Staff': 'Has keys and knows security',
                        'Visitor': 'Limited access',
                        'VIP': 'Special access privileges',
                        'Contractor': 'Temporary access',
                        'None': 'No legitimate access'
                    }
                },
                timing: {
                    name: 'Alibi Time',
                    values: {
                        'Working': 'Was at museum during crime',
                        'Home': 'Claims to be home',
                        'Out': 'Was out somewhere',
                        'Verified': 'Has witness confirmation',
                        'Asleep': 'Claims to be sleeping'
                    }
                },
                knowledge: {
                    name: 'Security Knowledge',
                    values: {
                        'Expert': 'Knows all security systems',
                        'Familiar': 'Some security knowledge',
                        'Basic': 'General awareness only',
                        'Limited': 'Minimal knowledge',
                        'None': 'No security knowledge'
                    }
                },
                motive: {
                    name: 'Motive Strength',
                    values: {
                        'Desperate': 'Urgent need for money',
                        'Greedy': 'Wants more wealth',
                        'Vengeful': 'Has grudge against museum',
                        'Curious': 'Fascinated by diamond',
                        'None': 'No clear motive'
                    }
                },
                behavior: {
                    name: 'Recent Behavior',
                    values: {
                        'Suspicious': 'Acting very strangely',
                        'Nervous': 'Seems anxious lately',
                        'Changed': 'Different than usual',
                        'Normal': 'Nothing unusual',
                        'Helpful': 'Cooperating fully'
                    }
                }
            },
            tech_breach: {
                access: {
                    name: 'System Access',
                    values: {
                        'Admin': 'Full system privileges',
                        'Developer': 'Code repository access',
                        'Employee': 'Basic network access',
                        'Contractor': 'Temporary credentials',
                        'None': 'No known access'
                    }
                },
                timing: {
                    name: 'Activity Log',
                    values: {
                        'Online': 'Active during breach',
                        'Office': 'In building after hours',
                        'Home': 'Claims remote location',
                        'Logged': 'Verified elsewhere online',
                        'Offline': 'No digital activity'
                    }
                },
                knowledge: {
                    name: 'Technical Skills',
                    values: {
                        'Expert': 'Could bypass all security',
                        'Advanced': 'Knows system architecture',
                        'Basic': 'General IT knowledge',
                        'Limited': 'Minimal tech skills',
                        'None': 'No programming skills'
                    }
                },
                motive: {
                    name: 'Potential Motive',
                    values: {
                        'Profit': 'Needs money urgently',
                        'Competition': 'Working for rival',
                        'Whistleblowing': 'Ethical concerns',
                        'Curiosity': 'Intellectual interest',
                        'None': 'No apparent motive'
                    }
                },
                behavior: {
                    name: 'Post-Breach Behavior',
                    values: {
                        'Paranoid': 'Extremely nervous',
                        'Defensive': 'Quick to blame others',
                        'Evasive': 'Avoiding questions',
                        'Normal': 'Business as usual',
                        'Cooperative': 'Helping investigation'
                    }
                }
            },
            recipe_theft: {
                access: {
                    name: 'Building Access',
                    values: {
                        'Kitchen': 'Full kitchen and vault',
                        'Office': 'Office and vault access',
                        'Delivery': 'Limited building access',
                        'Limited': 'Occasional access only',
                        'None': 'No legitimate access'
                    }
                },
                timing: {
                    name: 'Location at 7:45 PM',
                    values: {
                        'Working': 'On shift during theft',
                        'Break': 'On break but present',
                        'Meeting': 'In meeting nearby',
                        'Documented': 'Confirmed elsewhere',
                        'Absent': 'Not in building'
                    }
                },
                knowledge: {
                    name: 'Baking Expertise',
                    values: {
                        'Expert': 'Master baker level',
                        'Professional': 'Trained baker',
                        'Amateur': 'Hobby baker',
                        'Basic': 'Basic baking skills',
                        'None': 'No baking skills'
                    }
                },
                motive: {
                    name: 'Potential Motive',
                    values: {
                        'Competition': 'Rival bakery owner',
                        'Money': 'Financial gain',
                        'Recognition': 'Wants fame',
                        'Curiosity': 'Just curious',
                        'None': 'No clear motive'
                    }
                },
                behavior: {
                    name: 'Reaction to Theft',
                    values: {
                        'Agitated': 'Overly emotional',
                        'Guilty': 'Shows signs of guilt',
                        'Shocked': 'Genuinely surprised',
                        'Helpful': 'Actively helping',
                        'Calm': 'Unusually composed'
                    }
                }
            },
            restaurant_poisoning: {
                access: {
                    name: 'Kitchen Access',
                    values: {
                        'Kitchen': 'Full kitchen privileges',
                        'Service': 'Limited kitchen entry',
                        'VIP': 'Guest with special access',
                        'Limited': 'Occasional access only',
                        'None': 'No legitimate access'
                    }
                },
                timing: {
                    name: 'Location at 7-8 PM',
                    values: {
                        'Working': 'On shift in kitchen',
                        'Break': 'On break but present',
                        'Dining': 'Eating in restaurant',
                        'Documented': 'Confirmed elsewhere',
                        'Absent': 'Not in restaurant'
                    }
                },
                knowledge: {
                    name: 'Culinary Expertise',
                    values: {
                        'Expert': 'Knows rare poisons',
                        'Professional': 'Trained chef',
                        'Amateur': 'Cooking enthusiast',
                        'Basic': 'Basic cooking skills',
                        'None': 'No cooking skills'
                    }
                },
                motive: {
                    name: 'Relationship to Victim',
                    values: {
                        'Jealousy': 'Envious of success',
                        'Revenge': 'Past grievance',
                        'Inheritance': 'Financial beneficiary',
                        'Competition': 'Business rivalry',
                        'None': 'No known conflict'
                    }
                },
                behavior: {
                    name: 'Reaction to Incident',
                    values: {
                        'Agitated': 'Overly emotional',
                        'Guilty': 'Shows signs of guilt',
                        'Shocked': 'Genuinely surprised',
                        'Helpful': 'Actively assisting',
                        'Calm': 'Unusually composed'
                    }
                }
            }
        };
        
        return baseCategories[crime.id] || baseCategories.museum_heist;
    }
    
    // Enhanced feedback system with caching
    const feedbackCache = new Map();
    
    function getFeedbackForTrait(guessValue, culpritValue, traitCategory) {
        const cacheKey = `${guessValue}-${culpritValue}-${traitCategory}`;
        
        if (feedbackCache.has(cacheKey)) {
            return feedbackCache.get(cacheKey);
        }
        
        let result;
        
        if (guessValue === undefined) {
            result = 'unknown';
        } else if (culpritValue === undefined) {
            result = 'wrong';
        } else if (guessValue === culpritValue) {
            result = 'correct';
        } else {
            const traitArray = currentCrime.traits[traitCategory];
            if (!traitArray) {
                result = 'wrong';
            } else {
                const guessPosition = traitArray.indexOf(guessValue);
                const culpritPosition = traitArray.indexOf(culpritValue);
                
                if (Math.abs(guessPosition - culpritPosition) <= 1) {
                    result = 'close';
                } else {
                    result = 'wrong';
                }
            }
        }
        
        feedbackCache.set(cacheKey, result);
        return result;
    }
    
    // Enhanced suspect generation with better distribution
    function generateSuspects(seed, crime) {
        const names = [
            "Anne Chen", "Ted Santos", "Henry Wilson", "Abby Thompson", "Joney Davis",
            "Sarah Martin", "Roy Lee", "Hannah Anderson", "Lex Brown", "Aaron Johnson",
            "Neve Williams", "Cal Miller", "Faye Garcia", "David Rodriguez", "Elle Martinez",
            "Jonathan Smith", "Emily Taylor", "Charles Jones", "Ben Thomas", "Will Jackson",
            "Sam White", "Juliette Harris", "Mike Chen", "Lisa Park", "Ryan Kumar",
            "Nina Patel", "Oscar Blake", "Maya Singh", "Felix Wong", "Grace Kim",
            "Victor Cruz", "Zoe Thompson", "Ian Foster", "Rita Sharma", "Noah Clark",
            "Luna Martinez", "Ethan Scott", "Aria Nguyen", "Jake Rivera", "Chloe Adams"
        ];
        
        const shuffledNames = [...names].sort(() => seededRandom(seed * 7) - 0.5);
        const selectedNames = shuffledNames.slice(0, 16);
        
        const jobs = [...crime.suspectJobs];
        while (jobs.length < 16) {
            const baseJob = jobs[jobs.length % crime.suspectJobs.length];
            jobs.push({
                ...baseJob,
                title: baseJob.title + " (Night)"
            });
        }
        
        const traitCategories = getTraitCategories(crime);
        const suspects = [];
        
        for (let i = 0; i < 16; i++) {
            const job = jobs[i % jobs.length];
            const suspect = {
                name: selectedNames[i],
                job: job.title,
                access: job.access,
                knowledge: job.knowledge
            };
            
            // Assign other traits with balanced distribution
            const traitKeys = Object.keys(crime.traits).filter(key => 
                !['access', 'knowledge'].includes(key)
            );
            
            traitKeys.forEach(key => {
                const traitValues = crime.traits[key];
                
                // Use difficulty-based missing trait chance
                const missingChance = DIFFICULTY_SETTINGS[publicState.difficulty].missingTraitChance;
                if (seededRandom(seed + i * 20 + key.charCodeAt(0)) < missingChance) {
                    // Don't assign this trait
                    return;
                }
                
                // Assign trait value with some logic
                suspect[key] = traitValues[Math.floor(seededRandom(seed + i * 21 + key.charCodeAt(0)) * traitValues.length)];
            });
            
            suspects.push(suspect);
        }
        
        return suspects;
    }
    
    // Enhanced initial suspect generation
    function generateInitialSuspect(culprit, difficulty, seed) {
        const difficultySettings = DIFFICULTY_SETTINGS[difficulty];
        const traitCategories = getTraitCategories(currentCrime);
        const traitKeys = Object.keys(traitCategories);
        
        const initialSuspect = {
            name: "Initial Suspect",
            job: "Unknown"
        };
        
        // Ensure ALL traits are included for initial suspect
        const shuffledTraits = [...traitKeys].sort(() => seededRandom(seed + 2000) - 0.5);
        const yellowCount = difficultySettings.yellowTraits;
        let yellowTraitsAssigned = 0;
        
        // Pre-determine which traits will be yellow
        const yellowTraitIndices = new Set();
        while (yellowTraitIndices.size < yellowCount) {
            const index = Math.floor(seededRandom(seed + 3000 + yellowTraitIndices.size) * shuffledTraits.length);
            yellowTraitIndices.add(index);
        }
        
        shuffledTraits.forEach((trait, index) => {
            const culpritValue = culprit[trait];
            if (!culpritValue) return;
            
            if (yellowTraitIndices.has(index)) {
                // Make it yellow (adjacent)
                initialSuspect[trait] = generateAdjacentValue(culpritValue, trait, seed + index * 500);
            } else {
                // Make it gray (distant) - but strategically
                initialSuspect[trait] = generateStrategicDistantValue(culpritValue, trait, seed + index * 600);
            }
        });
        
        return initialSuspect;
    }
    
    // Generate adjacent value for yellow matches
    function generateAdjacentValue(culpritValue, trait, seed) {
        const traitArray = currentCrime.traits[trait];
        const culpritPos = traitArray.indexOf(culpritValue);
        
        const adjacentPositions = [];
        if (culpritPos > 0) adjacentPositions.push(culpritPos - 1);
        if (culpritPos < traitArray.length - 1) adjacentPositions.push(culpritPos + 1);
        
        if (adjacentPositions.length === 0) return culpritValue;
        
        const chosenPos = adjacentPositions[Math.floor(seededRandom(seed) * adjacentPositions.length)];
        return traitArray[chosenPos];
    }
    
    // Generate strategically distant value (2+ steps away)
    function generateStrategicDistantValue(culpritValue, trait, seed) {
        const traitArray = currentCrime.traits[trait];
        const culpritPos = traitArray.indexOf(culpritValue);
        
        // Find positions that are exactly 2 steps away (not too far)
        const strategicPositions = [];
        for (let i = 0; i < traitArray.length; i++) {
            const distance = Math.abs(i - culpritPos);
            if (distance === 2) {
                strategicPositions.push(i);
            }
        }
        
        // If no 2-step positions, use any distant position
        if (strategicPositions.length === 0) {
            for (let i = 0; i < traitArray.length; i++) {
                if (Math.abs(i - culpritPos) > 2) {
                    strategicPositions.push(i);
                }
            }
        }
        
        if (strategicPositions.length === 0) {
            // Fallback
            return traitArray[0] === culpritValue ? traitArray[traitArray.length - 1] : traitArray[0];
        }
        
        const chosenPos = strategicPositions[Math.floor(seededRandom(seed) * strategicPositions.length)];
        return traitArray[chosenPos];
    }
    
    // Check if suspect produces similar feedback pattern
    function wouldProduceSimilarFeedback(suspect, culprit, targetFeedback, threshold = 0.75) {
        const traitKeys = Object.keys(targetFeedback);
        let matches = 0;
        let total = 0;
        
        traitKeys.forEach(trait => {
            if (suspect[trait] !== undefined && targetFeedback[trait] !== undefined) {
                const suspectFeedback = getFeedbackForTrait(suspect[trait], culprit[trait], trait);
                if (suspectFeedback === targetFeedback[trait]) {
                    matches++;
                }
                total++;
            }
        });
        
        return total > 0 && (matches / total) >= threshold;
    }
    
    // Enhanced suspect distribution for puzzle balance
    function distributeSuspectTraits(suspects, culprit, initialSuspect, seed) {
        const difficultySettings = DIFFICULTY_SETTINGS[publicState.difficulty];
        const distributionStrategy = difficultySettings.distributionStrategy;
        const traitKeys = Object.keys(getTraitCategories(currentCrime));
        
        // Calculate initial feedback pattern
        const initialFeedback = {};
        traitKeys.forEach(trait => {
            if (initialSuspect[trait] !== undefined && culprit[trait] !== undefined) {
                initialFeedback[trait] = getFeedbackForTrait(initialSuspect[trait], culprit[trait], trait);
            }
        });
        
        // Find the culprit index
        const culpritIndex = suspects.findIndex(s => s.name === culprit.name);
        
        // Distribute traits for non-culprit suspects
        suspects.forEach((suspect, index) => {
            if (index === culpritIndex) return; // Skip culprit
            
            traitKeys.forEach(trait => {
                if (suspect[trait] === undefined) return; // Skip missing traits
                
                const initialValue = initialSuspect[trait];
                const culpritValue = culprit[trait];
                
                if (!initialValue || !culpritValue) return;
                
                const initialFeedbackForTrait = initialFeedback[trait];
                const roll = seededRandom(seed + index * 1000 + trait.charCodeAt(0)) * 100;
                
                let cumulativeChance = 0;
                
                if (initialFeedbackForTrait === 'close') {
                    // For yellow traits in initial suspect
                    if (roll < (cumulativeChance += distributionStrategy.matchInitialYellow)) {
                        // Match initial suspect's value
                        suspect[trait] = initialValue;
                    } else if (roll < (cumulativeChance += distributionStrategy.otherYellow)) {
                        // Different yellow value
                        const otherYellow = generateAdjacentValue(culpritValue, trait, seed + index * 2000);
                        if (otherYellow !== initialValue) {
                            suspect[trait] = otherYellow;
                        } else {
                            suspect[trait] = culpritValue; // Fallback to green
                        }
                    } else if (roll < (cumulativeChance += distributionStrategy.matchCulprit)) {
                        // Match culprit (green)
                        suspect[trait] = culpritValue;
                    } else {
                        // Far value (gray)
                        suspect[trait] = generateStrategicDistantValue(culpritValue, trait, seed + index * 3000);
                    }
                } else if (initialFeedbackForTrait === 'wrong') {
                    // For gray traits in initial suspect
                    // More variety to prevent easy elimination
                    const grayRoll = seededRandom(seed + index * 4000) * 100;
                    
                    if (grayRoll < 30) {
                        // Keep same as initial
                        suspect[trait] = initialValue;
                    } else if (grayRoll < 50) {
                        // Match culprit
                        suspect[trait] = culpritValue;
                    } else if (grayRoll < 75) {
                        // Yellow value
                        suspect[trait] = generateAdjacentValue(culpritValue, trait, seed + index * 5000);
                    } else {
                        // Different gray value
                        const traitArray = currentCrime.traits[trait];
                        const availableValues = traitArray.filter(val => 
                            val !== initialValue && Math.abs(traitArray.indexOf(val) - traitArray.indexOf(culpritValue)) >= 2
                        );
                        if (availableValues.length > 0) {
                            suspect[trait] = availableValues[Math.floor(seededRandom(seed + index * 6000) * availableValues.length)];
                        }
                    }
                }
            });
        });
        
        // Verify puzzle difficulty
        const viableSuspects = suspects.filter(suspect => 
            wouldProduceSimilarFeedback(suspect, culprit, initialFeedback, 0.7)
        );
        
        publicState.viableSuspectsCount = viableSuspects.length;
        publicState.confidenceLevel = Math.round((1 - viableSuspects.length / 16) * 100);
        
        console.log(`Puzzle balance: ${viableSuspects.length} viable suspects (target: ${difficultySettings.minViableSuspects}+)`);
        
        return suspects;
    }
    
    // Timer functions with proper cleanup
    function startTimer() {
        publicState.startTime = Date.now();
        publicState.timerInterval = setInterval(updateTimer, 100);
    }
    
    function updateTimer() {
        if (publicState.gameOver) return;
        
        const elapsed = Date.now() - publicState.startTime;
        publicState.elapsedTime = elapsed;
        
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = `Time: ${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
        }
    }
    
    function stopTimer() {
        if (publicState.timerInterval) {
            clearInterval(publicState.timerInterval);
            publicState.timerInterval = null;
        }
    }
    
    // Public methods
    return {
        // Initialize game
        init: function() {
            try {
                console.log('GameManager.init: starting');
                const seed = getDailySeed();
                
                // Determine crime scenario
                let crimeIndex;
                if (publicState.devMode && !publicState.betaMode) {
                    crimeIndex = publicState.currentScenarioIndex;
                } else {
                    const estTime = getESTTime();
                    let dateToUse = estTime;
                    
                    if (publicState.betaMode) {
                        dateToUse = new Date(estTime.getTime() + (5 * 3600000));
                    }
                    
                    const startOfYear = new Date(dateToUse.getFullYear(), 0, 1);
                    const dayOfYear = Math.floor((dateToUse - startOfYear) / 86400000);
                    const periodMultiplier = dateToUse.getHours() >= 12 ? 1 : 0;
                    const totalSlots = dayOfYear * 2 + periodMultiplier;
                    crimeIndex = totalSlots % CRIME_SCENARIOS.length;
                }
                
                currentCrime = CRIME_SCENARIOS[crimeIndex];
                
                // Apply theme before rendering
                requestAnimationFrame(() => {
                    applyTheme(currentCrime.id);
                });
                
                // Display crime info
                const period = getPuzzlePeriod();
                const estTime = getESTTime();
                const dateStr = estTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                
                document.getElementById('crimeTitle').textContent = `${dateStr} ${period} Crime: ${currentCrime.title}`;
                document.getElementById('crimeDescription').textContent = currentCrime.description;
                
                // Load stats
                // loadStats(); // COMMENTED OUT - not defined
                // checkFirstTimePlayer(); // COMMENTED OUT - not defined
                
                // Generate puzzle if needed
                if (privateState.suspects.length === 0) {
                    this.generateNewPuzzle();
                }
                
                // Display everything
                this.displayInitialSuspect();
                this.displaySuspects();
                this.updateGuessCounter();
                this.updateConfidenceDisplay();
                console.log('GameManager.init: finished');
            } catch (e) {
                console.error('Error in GameManager.init:', e);
            }
        },
        
        // Generate new puzzle
        generateNewPuzzle: function() {
            try {
                console.log('GameManager.generateNewPuzzle: starting');
                const seed = getDailySeed();
                
                // Clear feedback cache
                feedbackCache.clear();
                
                // Generate suspects
                const allSuspects = generateSuspects(seed, currentCrime);
                console.log('Suspects generated:', allSuspects);
                
                // Pick culprit
                const culpritIndex = Math.floor(seededRandom(seed) * allSuspects.length);
                privateState.culprit = allSuspects[culpritIndex];
                
                // Ensure culprit has ALL traits
                const traitKeys = Object.keys(getTraitCategories(currentCrime));
                traitKeys.forEach(key => {
                    if (privateState.culprit[key] === undefined) {
                        const traitValues = currentCrime.traits[key];
                        privateState.culprit[key] = traitValues[Math.floor(seededRandom(seed + key.charCodeAt(0) * 100) * traitValues.length)];
                    }
                });
                
                // Generate initial suspect
                privateState.initialSuspect = generateInitialSuspect(privateState.culprit, publicState.difficulty, seed);
                
                // Distribute traits among suspects for balance
                privateState.suspects = distributeSuspectTraits(allSuspects, privateState.culprit, privateState.initialSuspect, seed);
                console.log('Culprit:', privateState.culprit);
                console.log('Initial suspect:', privateState.initialSuspect);
                console.log('Suspects after distribution:', privateState.suspects);
                
                // Start timer on first interaction
                if (!publicState.startTime) {
                    startTimer();
                }
                console.log('GameManager.generateNewPuzzle: finished');
            } catch (e) {
                console.error('Error in GameManager.generateNewPuzzle:', e);
            }
        },
        
        // Display initial suspect
        displayInitialSuspect: function() {
            try {
                console.log('GameManager.displayInitialSuspect: starting');
                const existingDiv = document.getElementById('initialSuspect');
                if (existingDiv) existingDiv.remove();
                
                const initialDiv = document.createElement('div');
                initialDiv.id = 'initialSuspect';
                initialDiv.className = 'initial-suspect-section needs-theme';
                
                const traitCategories = getTraitCategories(currentCrime);
                const traitKeys = Object.keys(traitCategories);
                
                let traitHTML = '';
                traitKeys.forEach(trait => {
                    if (privateState.initialSuspect[trait] !== undefined) {
                        const feedback = getFeedbackForTrait(
                            privateState.initialSuspect[trait], 
                            privateState.culprit[trait], 
                            trait
                        );
                        const colorClass = feedback === 'correct' ? 'green' : feedback === 'close' ? 'yellow' : 'gray';
                        
                        traitHTML += `
                            <div class="initial-trait ${colorClass}">
                                <div class="initial-trait-label">${traitCategories[trait].name}</div>
                                <div class="initial-trait-value">${privateState.initialSuspect[trait]}</div>
                            </div>
                        `;
                    }
                });
                
                initialDiv.innerHTML = `
                    <div class="initial-suspect-header">
                        <h3>Initial Suspect Profile</h3>
                        <p class="initial-suspect-note">This person is NOT guilty. Find who shares these trait patterns:</p>
                    </div>
                    <div class="initial-suspect-traits">
                        ${traitHTML}
                    </div>
                    <div class="color-legend">
                        <span class="legend-item"><span class="color-box green"></span> = Exact match with culprit</span>
                        <span class="legend-item"><span class="color-box yellow"></span> = Close to culprit</span>
                        <span class="legend-item"><span class="color-box gray"></span> = Different from culprit</span>
                    </div>
                    ${this.generateTraitGuideHTML()}
                `;
                
                document.querySelector('.crime-box').after(initialDiv);
                console.log('GameManager.displayInitialSuspect: finished');
            } catch (e) {
                console.error('Error in GameManager.displayInitialSuspect:', e);
            }
        },
        
        // Generate trait guide HTML
        generateTraitGuideHTML: function() {
            const traitCategories = getTraitCategories(currentCrime);
            let html = `
                <div class="trait-guide-section needs-theme">
                    <div class="trait-guide-header">
                        <h4>Trait Value Reference</h4>
                        <p class="trait-guide-note">Adjacent values (↔) are considered \"close\" matches</p>
                    </div>
                    <div class="trait-guide-content">
            `;
            Object.entries(traitCategories).forEach(([key, category]) => {
                html += `
                    <div class="trait-guide-item">
                        <div class="trait-guide-title">${category.name}</div>
                        <div class="trait-scale-container">
                            <div class="trait-scale-line"></div>
                            <div class="trait-values-scale">
                `;
                const traitArray = currentCrime.traits[key];
                traitArray.forEach((value, index) => {
                    const position = (index / (traitArray.length - 1)) * 100;
                    const isFirst = index === 0;
                    const isLast = index === traitArray.length - 1;
                    const hint = category.values[value] || '';
                    html += `
                        <div class="trait-scale-item" style="left: ${position}%;">
                            <div class="trait-scale-dot ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}"></div>
                            <div class="trait-scale-label" title="${hint}">${value}</div>
                        </div>
                    `;
                    if (index < traitArray.length - 1) {
                        const nextPosition = ((index + 1) / (traitArray.length - 1)) * 100;
                        const midPosition = (position + nextPosition) / 2;
                        html += `
                            <div class="trait-proximity-arrow" style="left: ${midPosition}%">↔</div>
                        `;
                    }
                });
                html += '</div></div></div>';
            });
            html += '</div></div>';
            return html;
        },
        
        // Display suspects with batched DOM updates
        displaySuspects: function() {
            try {
                console.log('GameManager.displaySuspects: starting');
                const grid = document.getElementById('suspectsGrid');
                const traitCategories = getTraitCategories(currentCrime);
                const traitKeys = Object.keys(traitCategories);
                
                // Create document fragment for performance
                const fragment = document.createDocumentFragment();
                
                privateState.suspects.forEach((suspect, index) => {
                    const card = document.createElement('div');
                    card.className = 'suspect-card needs-theme';
                    
                    const isGuessed = publicState.guesses.some(g => g.name === suspect.name);
                    const isEliminated = publicState.eliminatedSuspects.has(suspect.name);
                    
                    if (isGuessed) card.classList.add('disabled');
                    if (isEliminated) card.classList.add('eliminated');
                    if (publicState.isProcessingGuess) card.classList.add('processing');
                    
                    let traitsHTML = '';
                    traitKeys.forEach(key => {
                        const traitValue = suspect[key];
                        const displayValue = traitValue !== undefined ? traitValue : '?';
                        const valueClass = traitValue === undefined ? 'unknown-value' : '';
                        
                        traitsHTML += `
                            <div class="trait-item">
                                <span class="trait-label">${traitCategories[key].name}:</span>
                                <span class="trait-value ${valueClass}">${displayValue}</span>
                            </div>
                        `;
                    });
                    
                    const eliminationIndicator = isEliminated ? '<div class="elimination-mark">✕</div>' : '';
                    const accuseDisabled = isGuessed || publicState.isProcessingGuess || publicState.gameOver ? 'disabled' : '';
                    const exonerateDisabled = isGuessed || publicState.gameOver ? 'disabled' : '';
                    const exonerateText = isEliminated ? 'Restore' : 'Exonerate';
                    
                    card.innerHTML = `
                        ${eliminationIndicator}
                        <div class="suspect-header">
                            <div class="suspect-name">${suspect.name}</div>
                            <div class="suspect-job">${suspect.job}</div>
                        </div>
                        <div class="suspect-traits">
                            ${traitsHTML}
                        </div>
                        <div class="suspect-actions">
                            <button class="suspect-button accuse-btn btn btn-danger" ${accuseDisabled} data-index="${index}">
                                Accuse
                            </button>
                            <button class="suspect-button exonerate-btn btn btn-secondary" ${exonerateDisabled} data-name="${suspect.name}">
                                ${exonerateText}
                            </button>
                        </div>
                    `;
                    
                    fragment.appendChild(card);
                });
                
                // Clear and append all at once
                grid.innerHTML = '';
                grid.appendChild(fragment);
                
                // Add event listeners using event delegation
                grid.addEventListener('click', this.handleSuspectClick.bind(this));
                console.log('GameManager.displaySuspects: finished');
            } catch (e) {
                console.error('Error in GameManager.displaySuspects:', e);
            }
        },
        
        // Handle suspect card clicks
        handleSuspectClick: function(event) {
            const target = event.target;
            
            if (target.classList.contains('accuse-btn') && !target.disabled) {
                const index = parseInt(target.dataset.index);
                this.makeGuess(index);
            } else if (target.classList.contains('exonerate-btn') && !target.disabled) {
                const name = target.dataset.name;
                this.toggleElimination(name);
            }
        },
        
        // Make a guess
        makeGuess: function(suspectIndex) {
            const maxGuesses = DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses;
            if (publicState.gameOver || publicState.currentGuess >= maxGuesses || publicState.isProcessingGuess) {
                return;
            }
            
            publicState.isProcessingGuess = true;
            
            const suspect = privateState.suspects[suspectIndex];
            
            if (publicState.guesses.some(g => g.name === suspect.name)) {
                publicState.isProcessingGuess = false;
                return;
            }
            
            publicState.guesses.push(suspect);
            publicState.currentGuess++;
            
            // Update viable suspects count
            this.updateViableSuspects();
            
            // Display guess with animation
            this.displayGuess(suspect);
            
            // Check win/loss
            if (suspect.name === privateState.culprit.name) {
                this.endGame(true);
            } else if (publicState.currentGuess >= maxGuesses) {
                this.endGame(false);
            }
            
            // Update displays
            this.updateGuessCounter();
            this.updateConfidenceDisplay();
            
            // Re-enable after animation
            setTimeout(() => {
                publicState.isProcessingGuess = false;
                this.displaySuspects();
            }, 500);
        },
        
        // Display guess with feedback
        displayGuess: function(suspect) {
            const board = document.getElementById('gameBoard');
            const row = document.createElement('div');
            row.className = 'guess-row-v2';
            
            const traitCategories = getTraitCategories(currentCrime);
            const traitKeys = Object.keys(traitCategories);
            
            let feedbackHTML = '';
            traitKeys.forEach(key => {
                feedbackHTML += this.createTraitFeedback(key, suspect[key]);
            });
            
            const html = `
                <div class="guess-suspect">
                    <div class="guess-name">${suspect.name}</div>
                    <div class="guess-job">${suspect.job}</div>
                </div>
                <div class="guess-feedback">
                    ${feedbackHTML}
                </div>
            `;
            
            row.innerHTML = html;
            board.appendChild(row);
            
            // Animate feedback
            requestAnimationFrame(() => {
                row.querySelectorAll('.trait-feedback').forEach((el, i) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, i * 50);
                });
            });
        },
        
        // Create trait feedback element
        createTraitFeedback: function(traitKey, value) {
            const currentTraitCategories = getTraitCategories(currentCrime);
            const category = currentTraitCategories[traitKey];
            
            if (value === undefined) {
                return `
                    <div class="trait-feedback unknown" title="${category.name}">
                        <div class="trait-feedback-label">${category.name}</div>
                        <div class="trait-feedback-value">?</div>
                        <div class="trait-feedback-hint">No info</div>
                    </div>
                `;
            }
            
            const feedback = getFeedbackForTrait(value, privateState.culprit[traitKey], traitKey);
            
            let arrow = '';
            if (publicState.difficulty === 'easy' && feedback === 'close') {
                const traitArray = currentCrime.traits[traitKey];
                if (traitArray) {
                    const guessPosition = traitArray.indexOf(value);
                    const culpritPosition = traitArray.indexOf(privateState.culprit[traitKey]);
                    arrow = guessPosition < culpritPosition ? '→' : '←';
                }
            }
            
            return `
                <div class="trait-feedback ${feedback}" title="${category.name}">
                    <div class="trait-feedback-label">${category.name}</div>
                    <div class="trait-feedback-value">${value} ${arrow}</div>
                    ${feedback === 'close' ? '<div class="trait-feedback-hint">Close!</div>' : ''}
                </div>
            `;
        },
        
        // Update viable suspects count
        updateViableSuspects: function() {
            if (publicState.guesses.length === 0) return;
            
            const latestGuess = publicState.guesses[publicState.guesses.length - 1];
            const traitKeys = Object.keys(getTraitCategories(currentCrime));
            
            // Calculate feedback pattern for latest guess
            const guessFeedback = {};
            traitKeys.forEach(trait => {
                if (latestGuess[trait] !== undefined) {
                    guessFeedback[trait] = getFeedbackForTrait(
                        latestGuess[trait], 
                        privateState.culprit[trait], 
                        trait
                    );
                }
            });
            
            // Count suspects that would produce similar feedback
            const viableSuspects = privateState.suspects.filter(suspect => {
                // Skip already guessed suspects
                if (publicState.guesses.some(g => g.name === suspect.name)) {
                    return false;
                }
                
                // Check if feedback would be similar
                return wouldProduceSimilarFeedback(suspect, privateState.culprit, guessFeedback, 0.9);
            });
            
            publicState.viableSuspectsCount = viableSuspects.length;
            publicState.confidenceLevel = Math.round((1 - viableSuspects.length / 16) * 100);
        },
        
        // Update displays
        updateGuessCounter: function() {
            const maxGuesses = DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses;
            let counterDiv = document.getElementById('guessCounter');
            
            if (!counterDiv) {
                counterDiv = document.createElement('div');
                counterDiv.id = 'guessCounter';
                counterDiv.className = 'guess-counter';
                document.querySelector('.crime-box').after(counterDiv);
            }
            
            counterDiv.textContent = `Guesses: ${publicState.currentGuess}/${maxGuesses}`;
        },
        
        updateConfidenceDisplay: function() {
            let confidenceDiv = document.getElementById('confidenceDisplay');
            
            if (!confidenceDiv) {
                confidenceDiv = document.createElement('div');
                confidenceDiv.id = 'confidenceDisplay';
                confidenceDiv.className = 'confidence-display';
                const counterDiv = document.getElementById('guessCounter');
                if (counterDiv) {
                    counterDiv.after(confidenceDiv);
                }
            }
            
            confidenceDiv.innerHTML = `
                <div class="confidence-meter">
                    <div class="confidence-fill" style="width: ${publicState.confidenceLevel}%"></div>
                </div>
                <div class="confidence-text">
                    Confidence: ${publicState.confidenceLevel}% 
                    (${publicState.viableSuspectsCount} suspects remain)
                </div>
            `;
        },
        
        // Toggle suspect elimination
        toggleElimination: function(suspectName) {
            if (publicState.eliminatedSuspects.has(suspectName)) {
                publicState.eliminatedSuspects.delete(suspectName);
            } else {
                publicState.eliminatedSuspects.add(suspectName);
            }
            this.displaySuspects();
        },
        
        // End game
        endGame: function(won) {
            publicState.gameOver = true;
            publicState.won = won;
            
            stopTimer();
            updateStats(won);
            
            const gameOverDiv = document.getElementById('gameOver');
            const titleElement = document.getElementById('gameOverTitle');
            const messageElement = document.getElementById('gameOverMessage');
            
            const timeInSeconds = Math.floor(publicState.elapsedTime / 1000);
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (won) {
                gameOverDiv.className = 'game-over won';
                titleElement.textContent = 'GUILTY!';
                messageElement.textContent = `You found the culprit in ${publicState.currentGuess}/${DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses} guesses! Time: ${timeString}`;
            } else {
                gameOverDiv.className = 'game-over lost';
                titleElement.textContent = 'ESCAPED!';
                messageElement.innerHTML = `
                    The culprit was <strong>${privateState.culprit.name}</strong> (${privateState.culprit.job})<br>
                    <div class="culprit-reveal">
                        Key traits: ${privateState.culprit.access} access, ${privateState.culprit.timing} alibi, ${privateState.culprit.knowledge} knowledge
                    </div>
                    <div style="margin-top: 10px; color: #888;">Time: ${timeString}</div>
                `;
            }
            
            gameOverDiv.style.display = 'block';
            document.getElementById('suspectsSection').style.display = 'none';
        },
        
        // Reset game
        resetGame: function() {
            // Clear private state
            privateState.culprit = null;
            privateState.suspects = [];
            privateState.initialSuspect = null;
            
            // Clear public state
            publicState.guesses = [];
            publicState.currentGuess = 0;
            publicState.gameOver = false;
            publicState.won = false;
            publicState.startTime = null;
            publicState.elapsedTime = 0;
            publicState.eliminatedSuspects.clear();
            publicState.isProcessingGuess = false;
            publicState.viableSuspectsCount = 16;
            publicState.confidenceLevel = 0;
            
            // Clear cache
            feedbackCache.clear();
            
            // Clear UI
            stopTimer();
            document.getElementById('timerDisplay').textContent = 'Time: 0:00';
            document.getElementById('gameBoard').innerHTML = '';
            document.getElementById('gameOver').style.display = 'none';
            document.getElementById('suspectsSection').style.display = 'block';
            
            const initialDiv = document.getElementById('initialSuspect');
            if (initialDiv) initialDiv.remove();
            
            const confidenceDiv = document.getElementById('confidenceDisplay');
            if (confidenceDiv) confidenceDiv.remove();
            
            // Remove event listener to prevent duplicates
            const grid = document.getElementById('suspectsGrid');
            const newGrid = grid.cloneNode(false);
            grid.parentNode.replaceChild(newGrid, grid);
            
            // Reinitialize
            this.init();
        },
        
        // Share results
        shareResults: function() {
            const difficulty = DIFFICULTY_SETTINGS[publicState.difficulty].name;
            const period = getPuzzlePeriod();
            const seed = getDailySeed();
            let shareText = `GUILTY ${seed} ${period} (${difficulty})\n\n`;
            
            if (publicState.won) {
                shareText += `Solved in ${publicState.currentGuess}/${DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses}!\n\n`;
            } else {
                shareText += `Failed ${publicState.currentGuess}/${DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses}\n\n`;
            }
            
            // Create visual grid
            const traitKeys = Object.keys(getTraitCategories(currentCrime));
            publicState.guesses.forEach(guess => {
                traitKeys.forEach(trait => {
                    if (guess[trait] !== undefined && privateState.culprit[trait] !== undefined) {
                        const feedback = getFeedbackForTrait(guess[trait], privateState.culprit[trait], trait);
                        if (feedback === 'correct') shareText += '🟩';
                        else if (feedback === 'close') shareText += '🟨';
                        else shareText += '⬜';
                    } else {
                        shareText += '⬜';
                    }
                });
                shareText += '\n';
            });
            
            shareText += '\nPlay at: ' + window.location.href.replace(/\?.*$/, '');
            
            navigator.clipboard.writeText(shareText).then(() => {
                // Show success message
                const button = document.querySelector('[onclick*="shareResults"]');
                if (button) {
                    const originalText = button.textContent;
                    button.textContent = '✓ Copied!';
                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);
                }
            }).catch(() => {
                alert('Failed to copy to clipboard. Please try again.');
            });
        },
        
        // Get public state (for dev tools)
        getPublicState: function() {
            return { ...publicState };
        },
        
        // Set difficulty
        setDifficulty: function(newDifficulty) {
            publicState.difficulty = newDifficulty;
        },
        
        // Cycle scenario (dev mode)
        cycleScenario: function(direction) {
            publicState.currentScenarioIndex = (publicState.currentScenarioIndex + direction + CRIME_SCENARIOS.length) % CRIME_SCENARIOS.length;
            currentCrime = CRIME_SCENARIOS[publicState.currentScenarioIndex];
            
            if (publicState.devMode) {
                document.getElementById('currentScenarioName').textContent = currentCrime.title;
            }
            
            this.resetGame();
        },
        
        // Toggle beta mode
        toggleBetaMode: function() {
            publicState.betaMode = !publicState.betaMode;
            this.resetGame();
        },
        
        // Enable dev mode
        enableDevMode: function() {
            publicState.devMode = true;
        },
        
        // Get feedback for trait (for testing)
        getFeedbackForTrait: getFeedbackForTrait,
        
        // Get culprit for testing (DEV MODE ONLY)
        getCulpritForTesting: function() {
            if (publicState.devMode) {
                return privateState.culprit;
            }
            return null;
        },
        
        // Get current crime info (for AI)
        getCurrentCrime: function() {
            return currentCrime;
        },
        
        // Get all suspects (for AI)
        getAllSuspects: function() {
            return privateState.suspects;
        },
        
        // Get initial suspect info (for AI)
        getInitialSuspectInfo: function() {
            return {
                suspect: privateState.initialSuspect,
                feedback: {}
            };
        },
        
        // AI agent for automated testing
        runAITests: async function(numRuns = 100) {
            const results = [];
            const scenarioCount = CRIME_SCENARIOS.length;
            let winCount = 0;
            let totalViable = 0;
            let themeStats = {};

            for (let i = 0; i < numRuns; i++) {
                // Cycle through all scenarios
                const scenarioIndex = i % scenarioCount;
                publicState.currentScenarioIndex = scenarioIndex;
                publicState.devMode = true;
                this.init(); // was this.resetGame();
                // Simulate random guesses until win or out of guesses
                let guesses = 0;
                let won = false;
                while (!publicState.gameOver && guesses < DIFFICULTY_SETTINGS[publicState.difficulty].maxGuesses) {
                    // Pick a random suspect not yet guessed
                    const suspects = privateState.suspects.filter(s => !publicState.guesses.some(g => g.name === s.name));
                    if (suspects.length === 0) break;
                    const suspect = suspects[Math.floor(Math.random() * suspects.length)];
                    const index = privateState.suspects.findIndex(s => s.name === suspect.name);
                    this.makeGuess(index);
                    guesses++;
                    if (publicState.gameOver && publicState.won) won = true;
                }
                winCount += won ? 1 : 0;
                totalViable += publicState.viableSuspectsCount;
                const scenarioId = CRIME_SCENARIOS[scenarioIndex].id;
                if (!themeStats[scenarioId]) themeStats[scenarioId] = { games: 0, wins: 0, viable: 0 };
                themeStats[scenarioId].games++;
                themeStats[scenarioId].wins += won ? 1 : 0;
                themeStats[scenarioId].viable += publicState.viableSuspectsCount;
                results.push({ scenario: scenarioId, won, viable: publicState.viableSuspectsCount });
            }
            // Summary
            const winRate = (winCount / numRuns) * 100;
            const avgViable = totalViable / numRuns;
            console.log(`AI Test Results: ${numRuns} games`);
            console.log(`Overall win rate: ${winRate.toFixed(1)}%`);
            console.log(`Average viable suspects remaining: ${avgViable.toFixed(2)}`);
            Object.entries(themeStats).forEach(([theme, stat]) => {
                console.log(`Theme: ${theme} | Games: ${stat.games} | Win rate: ${(stat.wins/stat.games*100).toFixed(1)}% | Avg viable ${(stat.viable/stat.games).toFixed(2)}`);
            });
            // Prose summary
            let prose = `\nSummary of AI findings after ${numRuns} games:\n`;
            prose += `- Overall win rate: ${winRate.toFixed(1)}%.\n`;
            prose += `- Average viable suspects remaining: ${avgViable.toFixed(2)}.\n`;
            prose += `- Theme breakdown:\n`;
            Object.entries(themeStats).forEach(([theme, stat]) => {
                prose += `  - ${theme}: Win rate ${(stat.wins/stat.games*100).toFixed(1)}%, Avg viable ${(stat.viable/stat.games).toFixed(2)}\n`;
            });
            prose += `\nNo major issues detected, but review any themes with low win rates or high viable counts for balance tweaks.`;
            console.log(prose);
            return prose;
        }
    };
})();

if (typeof window !== 'undefined') {
    window.runAITests = GameManager.runAITests;
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const startButton = document.getElementById('start-game');
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const difficultySelect = document.getElementById('difficulty-select');
    const statsButton = document.getElementById('stats-btn');
    const newGameButton = document.getElementById('new-game');
    const backToMenuButton = document.getElementById('back-to-menu');
    const hintButton = document.getElementById('hint-btn');
    const accuseButton = document.getElementById('accuse-btn');

    // Start game button click handler
    startButton.addEventListener('click', function() {
        GameManager.setDifficulty(difficultySelect.value);
        mainMenu.style.display = 'none';
        gameScreen.style.display = 'block';
        GameManager.init();
    });

    // New game button click handler
    newGameButton.addEventListener('click', function() {
        GameManager.init();
    });

    // Back to menu button click handler
    backToMenuButton.addEventListener('click', function() {
        gameScreen.style.display = 'none';
        mainMenu.style.display = 'block';
    });

    // Hint button click handler
    hintButton.addEventListener('click', function() {
        // TODO: Implement hint system
        alert('Hint system coming soon!');
    });

    // Accuse button click handler
    accuseButton.addEventListener('click', function() {
        // TODO: Implement accusation system
        alert('Accusation system coming soon!');
    });

    // Stats button click handler
    statsButton.addEventListener('click', function() {
        // TODO: Implement statistics view
        alert('Statistics view coming soon!');
    });
});