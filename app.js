/**
 * FitCRM - Client Management Application
 * Main JavaScript Module
 * 
 * Handles all client CRUD operations, localStorage persistence,
 * form validation, and UI interactions.
 */

// ============================================
// Storage Keys & Constants
// ============================================
const STORAGE_KEY = 'fitcrm_clients';

// ============================================
// Client Data Management
// ============================================

/**
 * Get all clients from localStorage
 * @returns {Array} Array of client objects
 */
function getClients() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Save clients array to localStorage
 * @param {Array} clients - Array of client objects
 */
function saveClients(clients) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

/**
 * Generate a unique ID for new clients
 * @returns {string} Unique identifier
 */
function generateId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Add a new client to storage
 * @param {Object} clientData - Client information
 * @returns {Object} The saved client with ID
 */
function addClient(clientData) {
    const clients = getClients();
    const newClient = {
        id: generateId(),
        ...clientData,
        createdAt: new Date().toISOString(),
        exerciseHistory: []
    };
    clients.push(newClient);
    saveClients(clients);
    return newClient;
}

/**
 * Update an existing client
 * @param {string} id - Client ID
 * @param {Object} updatedData - Updated client information
 * @returns {Object|null} Updated client or null if not found
 */
function updateClient(id, updatedData) {
    const clients = getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    clients[index] = {
        ...clients[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    saveClients(clients);
    return clients[index];
}

/**
 * Delete a client by ID
 * @param {string} id - Client ID
 * @returns {boolean} True if deleted, false if not found
 */
function deleteClient(id) {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== id);
    if (filtered.length === clients.length) return false;
    saveClients(filtered);
    return true;
}

/**
 * Get a single client by ID
 * @param {string} id - Client ID
 * @returns {Object|null} Client object or null
 */
function getClientById(id) {
    const clients = getClients();
    return clients.find(c => c.id === id) || null;
}

/**
 * Search clients by name
 * @param {string} query - Search query
 * @returns {Array} Filtered clients
 */
function searchClients(query) {
    const clients = getClients();
    if (!query.trim()) return clients;
    const lowerQuery = query.toLowerCase();
    return clients.filter(c => c.fullName.toLowerCase().includes(lowerQuery));
}

/**
 * Add an exercise entry to client's history
 * @param {string} clientId - Client ID
 * @param {Object} exerciseData - Exercise entry data
 * @returns {Object|null} Updated client or null
 */
function addExerciseEntry(clientId, exerciseData) {
    const client = getClientById(clientId);
    if (!client) return null;
    
    const exerciseHistory = client.exerciseHistory || [];
    exerciseHistory.push({
        id: generateId(),
        ...exerciseData
    });
    
    return updateClient(clientId, { exerciseHistory });
}

// ============================================
// Form Validation
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    // Allow digits, spaces, dashes, parentheses, plus sign
    const phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate the client form
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateClientForm(form) {
    const errors = {};
    const formData = new FormData(form);
    
    // Full Name - required
    const fullName = formData.get('fullName')?.trim();
    if (!fullName) {
        errors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
        errors.fullName = 'Name must be at least 2 characters';
    }
    
    // Age - required, must be 1-120
    const age = parseInt(formData.get('age'));
    if (!age || isNaN(age)) {
        errors.age = 'Age is required';
    } else if (age < 1 || age > 120) {
        errors.age = 'Age must be between 1 and 120';
    }
    
    // Gender - required
    const gender = formData.get('gender');
    if (!gender) {
        errors.gender = 'Please select a gender';
    }
    
    // Email - required, valid format
    const email = formData.get('email')?.trim();
    if (!email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // Phone - required, valid format
    const phone = formData.get('phone')?.trim();
    if (!phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    
    // Fitness Goal - required
    const goal = formData.get('goal');
    if (!goal) {
        errors.goal = 'Please select a fitness goal';
    }
    
    // Start Date - required
    const startDate = formData.get('startDate');
    if (!startDate) {
        errors.startDate = 'Membership start date is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Display validation errors on form
 * @param {HTMLFormElement} form - The form element
 * @param {Object} errors - Error messages by field name
 */
function displayFormErrors(form, errors) {
    // Clear existing errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    
    // Display new errors
    Object.entries(errors).forEach(([fieldName, message]) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('input-error');
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = message;
            field.parentNode.appendChild(errorEl);
        }
    });
}

/**
 * Clear all form errors
 * @param {HTMLFormElement} form - The form element
 */
function clearFormErrors(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

/**
 * Get form data as an object
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} Form data object
 */
function getFormData(form) {
    const formData = new FormData(form);
    return {
        fullName: formData.get('fullName')?.trim(),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        email: formData.get('email')?.trim(),
        phone: formData.get('phone')?.trim(),
        goal: formData.get('goal'),
        goalText: formData.get('goalText')?.trim() || '',
        startDate: formData.get('startDate')
    };
}

// ============================================
// UI Helpers
// ============================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
function showConfirmDialog(message, onConfirm, onCancel) {
    // Remove existing dialogs
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h3 id="confirm-title" class="modal-title">Confirm Action</h3>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                <button class="btn btn-danger" data-action="confirm">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus the cancel button
    overlay.querySelector('[data-action="cancel"]').focus();
    
    // Handle clicks
    overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
            onConfirm?.();
            overlay.remove();
        } else if (action === 'cancel' || e.target === overlay) {
            onCancel?.();
            overlay.remove();
        }
    });
    
    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            onCancel?.();
            overlay.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// ============================================
// Exercise API (Wger)
// ============================================

/**
 * Fetch 5 random suggested exercises from Wger REST API
 * As per assignment: "Retrieve the suggested exercises for the next session 
 * by grabbing 5 exercises from an online workout manager that provides REST APIs"
 * 
 * Fetches a larger pool (50 exercises) and randomly selects 5 unique ones
 * so each client gets different exercise suggestions.
 * 
 * @param {string} goal - Fitness goal (optional)
 * @param {number} limit - Number of exercises to return (default: 5)
 * @returns {Promise<Object>} Object with success flag and exercises array
 */
async function fetchSuggestedExercises(goal = null, limit = 5) {
    // Wger API - fetch a larger pool of exercises (50) for randomization
    // language=2 is English
    const apiUrl = `https://wger.de/api/v2/exerciseinfo/?language=2&limit=50`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Wger API: received', data.results?.length || 0, 'exercises');
        
        // Process ALL API results - extract: name, category, description
        const allExercises = [];
        
        if (data.results && Array.isArray(data.results)) {
            for (const ex of data.results) {
                // Get name and description from translations array
                // Look for English translation (language id 2)
                let name = '';
                let description = '';
                
                if (ex.translations && Array.isArray(ex.translations)) {
                    // Find English translation
                    const englishTrans = ex.translations.find(t => t.language === 2);
                    if (englishTrans) {
                        name = (englishTrans.name || '').trim();
                        description = englishTrans.description || '';
                    }
                    // If no English, try first available translation
                    if (!name && ex.translations.length > 0) {
                        name = (ex.translations[0].name || '').trim();
                        description = ex.translations[0].description || '';
                    }
                }
                
                // Skip if no name
                if (!name) continue;
                
                // Process description
                if (description) {
                    description = stripHtml(description).substring(0, 200);
                } else {
                    description = 'A great exercise for your fitness routine.';
                }
                
                // Get category name
                let categoryName = null;
                if (ex.category && typeof ex.category === 'object' && ex.category.name) {
                    categoryName = ex.category.name;
                }
                
                allExercises.push({
                    name: name,
                    category: categoryName,
                    description: description
                });
            }
        }
        
        // If we got exercises from API, shuffle and pick 5 random ones
        if (allExercises.length > 0) {
            // Shuffle the array using Fisher-Yates algorithm for true randomness
            const shuffled = shuffleArray([...allExercises]);
            
            // Select 5 unique random exercises
            const selectedExercises = shuffled.slice(0, limit);
            
            console.log(`Wger API: Randomly selected ${selectedExercises.length} exercises from ${allExercises.length} available`);
            return { success: true, exercises: selectedExercises };
        }
        
        // If no valid exercises, use fallback
        console.log('Wger API: No valid exercises, using fallback');
        throw new Error('No valid exercises returned from API');
        
    } catch (error) {
        console.error('Error fetching exercises from Wger API:', error);
        // Return shuffled fallback exercises
        const fallbackExercises = shuffleArray(getFallbackExercises(goal)).slice(0, limit);
        return { 
            success: false, 
            exercises: fallbackExercises,
            error: 'Unable to load suggested exercises right now.'
        };
    }
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Alias for backward compatibility
async function fetchExercises(goal, limit = 5) {
    const result = await fetchSuggestedExercises(goal, limit);
    return result.exercises;
}

/**
 * Strip HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Get fallback exercises if API fails
 * @param {string} goal - Fitness goal
 * @returns {Array} Fallback exercises
 */
function getFallbackExercises(goal) {
    const exercises = {
        'Weight Loss': [
            { name: 'Jumping Jacks', description: 'Full body cardio exercise. Jump while spreading legs and raising arms overhead.' },
            { name: 'Burpees', description: 'High-intensity exercise combining squat, plank, and jump.' },
            { name: 'Mountain Climbers', description: 'Core and cardio exercise in plank position with alternating knee drives.' },
            { name: 'High Knees', description: 'Running in place while lifting knees to hip level.' },
            { name: 'Jump Rope', description: 'Classic cardio exercise for endurance and coordination.' }
        ],
        'Muscle Gain': [
            { name: 'Push-ups', description: 'Upper body exercise targeting chest, shoulders, and triceps.' },
            { name: 'Squats', description: 'Lower body exercise for quadriceps, hamstrings, and glutes.' },
            { name: 'Lunges', description: 'Unilateral leg exercise for strength and balance.' },
            { name: 'Plank', description: 'Isometric core exercise for stability and strength.' },
            { name: 'Dumbbell Rows', description: 'Back exercise targeting lats and biceps.' }
        ],
        'General Fitness': [
            { name: 'Walking', description: 'Low-impact cardio for overall health and endurance.' },
            { name: 'Stretching', description: 'Flexibility exercises for mobility and injury prevention.' },
            { name: 'Bodyweight Squats', description: 'Functional movement for lower body strength.' },
            { name: 'Plank Hold', description: 'Core stability exercise for posture and strength.' },
            { name: 'Arm Circles', description: 'Shoulder mobility and warm-up exercise.' }
        ]
    };
    
    return exercises[goal] || exercises['General Fitness'];
}

// ============================================
// Initialize Sample Data
// ============================================

/**
 * Initialize localStorage with sample clients if empty
 */
function initializeSampleData() {
    const clients = getClients();
    if (clients.length > 0) return; // Already has data
    
    const sampleClients = [
        {
            id: generateId(),
            fullName: 'Sara Ahmed',
            age: 28,
            gender: 'Female',
            email: 'sara.ahmed@example.com',
            phone: '+20 10 1234 5678',
            goal: 'Weight Loss',
            goalText: '',
            startDate: '2025-09-01',
            createdAt: new Date().toISOString(),
            exerciseHistory: [
                { id: generateId(), date: '2025-09-12', title: 'HIIT Exercise', notes: 'High intensity interval training', tags: ['Burpees', 'Jump Rope', 'Mountain Climbers'] },
                { id: generateId(), date: '2025-09-05', title: 'Initial Assessment – 30 min Cardio', notes: 'First cardio session', tags: ['Treadmill', 'Cycling'] },
                { id: generateId(), date: '2025-08-28', title: 'Strength Training – Upper Body', notes: 'Focus on upper body strength', tags: ['Bench Press', 'Rows', 'Shoulder Press'] }
            ]
        },
        {
            id: generateId(),
            fullName: 'Omar Hassan',
            age: 32,
            gender: 'Male',
            email: 'omar.hassan@example.com',
            phone: '+20 12 2345 6789',
            goal: 'Muscle Gain',
            goalText: '',
            startDate: '2025-08-15',
            createdAt: new Date().toISOString(),
            exerciseHistory: [
                { id: generateId(), date: '2025-09-10', title: 'HIIT Exercise', notes: 'High intensity circuit', tags: ['Burpees', 'Jump Rope', 'Mountain Climbers'] },
                { id: generateId(), date: '2025-09-01', title: 'Initial Assessment – 30 min Cardio', notes: 'Baseline cardio test', tags: ['Treadmill', 'Cycling'] },
                { id: generateId(), date: '2025-08-20', title: 'Strength Training – Upper Body', notes: 'Chest and shoulders focus', tags: ['Bench Press', 'Rows', 'Shoulder Press'] }
            ]
        },
        {
            id: generateId(),
            fullName: 'Mariam Nabil',
            age: 25,
            gender: 'Female',
            email: 'mariam.nabil@example.com',
            phone: '+20 13 4567 8901',
            goal: 'General Fitness',
            goalText: '',
            startDate: '2025-07-10',
            createdAt: new Date().toISOString(),
            exerciseHistory: [
                { id: generateId(), date: '2025-08-15', title: 'HIIT Exercise', notes: 'Interval training session', tags: ['Burpees', 'Jump Rope', 'Mountain Climbers'] },
                { id: generateId(), date: '2025-08-01', title: 'Initial Assessment – 30 min Cardio', notes: 'Cardio baseline', tags: ['Treadmill', 'Cycling'] },
                { id: generateId(), date: '2025-07-20', title: 'Strength Training – Upper Body', notes: 'Upper body introduction', tags: ['Bench Press', 'Rows', 'Shoulder Press'] }
            ]
        },
        {
            id: generateId(),
            fullName: 'Youssef Ali',
            age: 29,
            gender: 'Male',
            email: 'youssef.ali@example.com',
            phone: '+20 15 5566 6777',
            goal: 'Muscle Gain',
            goalText: '',
            startDate: '2025-09-20',
            createdAt: new Date().toISOString(),
            exerciseHistory: [
                { id: generateId(), date: '2025-10-15', title: 'HIIT Exercise', notes: 'High intensity workout', tags: ['Burpees', 'Jump Rope', 'Mountain Climbers'] },
                { id: generateId(), date: '2025-10-05', title: 'Initial Assessment – 30 min Cardio', notes: 'First cardio evaluation', tags: ['Treadmill', 'Cycling'] },
                { id: generateId(), date: '2025-09-25', title: 'Strength Training – Upper Body', notes: 'Building upper body strength', tags: ['Bench Press', 'Rows', 'Shoulder Press'] }
            ]
        },
        {
            id: generateId(),
            fullName: 'Laila Samir',
            age: 35,
            gender: 'Female',
            email: 'laila.samir@example.com',
            phone: '+20 17 7788 8999',
            goal: 'Weight Loss',
            goalText: '',
            startDate: '2025-06-01',
            createdAt: new Date().toISOString(),
            exerciseHistory: [
                { id: generateId(), date: '2025-07-12', title: 'HIIT Exercise', notes: 'Fat burning HIIT', tags: ['Burpees', 'Jump Rope', 'Mountain Climbers'] },
                { id: generateId(), date: '2025-06-25', title: 'Initial Assessment – 30 min Cardio', notes: 'Starting cardio routine', tags: ['Treadmill', 'Cycling'] },
                { id: generateId(), date: '2025-06-15', title: 'Strength Training – Upper Body', notes: 'Light upper body work', tags: ['Bench Press', 'Rows', 'Shoulder Press'] }
            ]
        }
    ];
    
    saveClients(sampleClients);
}

// ============================================
// URL Parameter Helpers
// ============================================

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Set URL parameter
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setUrlParam(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// ============================================
// Format Helpers
// ============================================

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date for input field
 * @param {string} dateStr - Date string
 * @returns {string} YYYY-MM-DD format
 */
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

// Initialize sample data on load
document.addEventListener('DOMContentLoaded', function() {
    // Force reset sample data to include exercise history entries
    // Remove this condition after first load if you want to preserve user data
    const clients = getClients();
    const hasExerciseHistory = clients.length > 0 && clients[0].exerciseHistory && clients[0].exerciseHistory.length > 0;
    
    if (!hasExerciseHistory) {
        // Clear old data and reload with new sample data that includes exercise history
        localStorage.removeItem(STORAGE_KEY);
    }
    
    initializeSampleData();
});

