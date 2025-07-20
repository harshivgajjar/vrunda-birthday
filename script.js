// Global variables
let chatData = [];
let filteredData = [];
let currentView = 'timeline';
let selectedRandomMessage = null;

// DOM elements
const messagesContainer = document.getElementById('messages-container');
const searchInput = document.getElementById('search-input');
const yearFilter = document.getElementById('year-filter');
const monthFilter = document.getElementById('month-filter');
const dateFilter = document.getElementById('date-filter');
const sortFilter = document.getElementById('sort-filter');
const randomMemoryBtn = document.getElementById('random-memory');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');
const modal = document.getElementById('message-modal');
const modalMessage = document.getElementById('modal-message');
const closeModal = document.getElementById('close-modal');
const loadingOverlay = document.getElementById('loading-overlay');

// Debug: Check if elements are found
console.log('DOM Elements Check:');
console.log('messagesContainer:', messagesContainer);
console.log('searchInput:', searchInput);
console.log('yearFilter:', yearFilter);
console.log('loadingOverlay:', loadingOverlay);
console.log('navItems count:', navItems.length);
console.log('contentSections count:', contentSections.length);

// Check timeline view specifically
const timelineView = document.getElementById('timeline-view');
console.log('timeline-view element:', timelineView);
console.log('timeline-view classes:', timelineView?.className);
console.log('timeline-view display style:', timelineView?.style.display);

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Re-check elements after DOM is loaded
    console.log('After DOM loaded - messagesContainer:', document.getElementById('messages-container'));
    console.log('After DOM loaded - timeline-view:', document.getElementById('timeline-view'));
    
    // Show loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        console.log('Loading overlay shown');
    } else {
        console.log('Loading overlay not found');
    }
    
    // Simulate loading time for dramatic effect
    setTimeout(() => {
        console.log('Starting to load chat data...');
        loadChatData();
    }, 1500);
    
    setupEventListeners();
    setupNavigation();
    
    // Ensure timeline view is active by default
    switchView('timeline');
});

// Load chat data from JSON file
async function loadChatData() {
    try {
        console.log('Fetching vrunda_chats.json...');
        const response = await fetch('vrunda_chats.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        chatData = await response.json();
        console.log('Chat data loaded:', chatData.length, 'messages');
        console.log('First message sample:', chatData[0]);
        console.log('Chat data type:', typeof chatData);
        console.log('Is chatData array?', Array.isArray(chatData));
        filteredData = [...chatData];
        
        // Populate filters
        populateYearFilter();
        populateDateFilter();
        
        // Display messages
        console.log('About to display messages...');
        displayMessages(filteredData);
        
        // Hide loading
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
            console.log('Loading element hidden');
        } else {
            console.log('Loading element not found');
        }
        
        // Update stats
        updateStats();
        
        // Generate memories
        generateMemories();
        
        // Hide loading overlay with animation
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
            console.log('Loading overlay hidden');
        }
        
        // Add confetti effect
        addConfetti();
        
    } catch (error) {
        console.error('Error loading chat data:', error);
        if (messagesContainer) {
            messagesContainer.innerHTML = '<p style="text-align: center; color: var(--error); font-size: 1.1rem; padding: 2rem;">Error loading chat data. Please check if vrunda_chats.json exists.</p>';
        } else {
            console.log('messagesContainer not found for error display');
        }
        
        // Hide loading overlay even on error
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            console.log('Mobile menu toggled');
        });
        
        // Close sidebar with close button
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('open');
                console.log('Sidebar closed with close button');
            });
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
        
        // Auto-close sidebar when clicking on navigation links
        const navLinks = document.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
                console.log('Sidebar auto-closed after navigation');
            });
        });
        
        console.log('Mobile menu toggle listener added');
    }
    
    // Help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', showKeyboardShortcuts);
        console.log('Help button listener added');
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        console.log('Search input listener added');
    } else {
        console.log('Search input not found');
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', handleFilterChange);
        console.log('Year filter listener added');
    } else {
        console.log('Year filter not found');
    }
    
    if (monthFilter) {
        monthFilter.addEventListener('change', handleFilterChange);
        console.log('Month filter listener added');
    } else {
        console.log('Month filter not found');
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', handleFilterChange);
        console.log('Date filter listener added');
    } else {
        console.log('Date filter not found');
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', handleFilterChange);
        console.log('Sort filter listener added');
    } else {
        console.log('Sort filter not found');
    }
    
    // Random memory button with mobile shortcuts
    if (randomMemoryBtn) {
        let touchCount = 0;
        let touchTimer = null;
        
        randomMemoryBtn.addEventListener('click', (e) => {
            touchCount++;
            
            if (touchCount === 1) {
                // First tap - show random memory
                showRandomMemory();
                
                // Set timer for second tap
                touchTimer = setTimeout(() => {
                    touchCount = 0;
                }, 2000);
            } else if (touchCount === 2) {
                // Second tap within 2 seconds - show mobile shortcuts
                clearTimeout(touchTimer);
                touchCount = 0;
                showMobileShortcuts();
            }
        });
        
        console.log('Random memory button with mobile shortcuts listener added');
    } else {
        console.log('Random memory button not found');
    }
    
    // Modal functionality
    if (closeModal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        console.log('Close modal listener added');
    } else {
        console.log('Close modal button not found');
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Advanced search
    const advancedSearch = document.getElementById('advanced-search');
    const searchBtn = document.getElementById('search-btn');
    const senderFilter = document.getElementById('sender-filter');
    
    if (advancedSearch) {
        advancedSearch.addEventListener('input', debounce(handleAdvancedSearch, 300));
        console.log('Advanced search listener added');
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleAdvancedSearch);
        console.log('Search button listener added');
    }
    if (senderFilter) {
        senderFilter.addEventListener('change', handleAdvancedSearch);
        console.log('Sender filter listener added');
    }
}

// Setup navigation
function setupNavigation() {
    console.log('Setting up navigation...');
    console.log('Nav items found:', navItems.length);
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            console.log('Navigation clicked:', view);
            switchView(view);
        });
    });
}

// Switch between views
function switchView(viewName) {
    console.log('Switching to view:', viewName);
    currentView = viewName;
    
    // Update active nav item
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update active content section
    contentSections.forEach(section => {
        section.classList.toggle('active', section.id === `${viewName}-view`);
    });
    
    // Update page title and subtitle
    updatePageHeader(viewName);
    
    // Load view-specific content
    switch(viewName) {
        case 'timeline':
            console.log('Displaying timeline messages...');
            displayMessages(filteredData);
            break;
        case 'search':
            // Search view is handled by its own event listeners
            break;
        case 'stats':
            updateStats();
            break;
        case 'memories':
            generateMemories();
            break;
    }
}

// Update page header
function updatePageHeader(viewName) {
    const pageTitle = document.querySelector('.page-title');
    const pageSubtitle = document.querySelector('.page-subtitle');
    
    const titles = {
        timeline: { title: 'Timeline', subtitle: 'Your chat journey with Vrunda' },
        search: { title: 'Search', subtitle: 'Find specific moments in your chat history' },
        stats: { title: 'Analytics', subtitle: 'Insights from your conversation history' },
        memories: { title: 'Memories', subtitle: 'Curated moments from your chat history' }
    };
    
    if (pageTitle && pageSubtitle && titles[viewName]) {
        pageTitle.textContent = titles[viewName].title;
        pageSubtitle.textContent = titles[viewName].subtitle;
    }
}

// Display messages
function displayMessages(messages) {
    console.log('Displaying messages:', messages.length);
    
    if (!messagesContainer) {
        console.log('messagesContainer not found!');
        return;
    }
    
    console.log('messagesContainer found, clearing content...');
    console.log('messagesContainer before clearing:', messagesContainer.innerHTML);
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 1.1rem; padding: 2rem;">No messages found. Try adjusting your search filters! 🔍</p>';
        console.log('No messages to display');
        return;
    }
    
    console.log('Creating message elements...');
    
    // Check CSS properties
    const computedStyle = window.getComputedStyle(messagesContainer);
    console.log('messagesContainer CSS properties:');
    console.log('- display:', computedStyle.display);
    console.log('- visibility:', computedStyle.visibility);
    console.log('- opacity:', computedStyle.opacity);
    console.log('- height:', computedStyle.height);
    console.log('- max-height:', computedStyle.maxHeight);
    console.log('- overflow:', computedStyle.overflow);
    
    // Check parent container
    const messagesArea = messagesContainer.parentElement;
    if (messagesArea) {
        const areaStyle = window.getComputedStyle(messagesArea);
        console.log('messagesArea CSS properties:');
        console.log('- display:', areaStyle.display);
        console.log('- visibility:', areaStyle.visibility);
        console.log('- height:', areaStyle.height);
        console.log('- max-height:', areaStyle.maxHeight);
    }
    
    messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        messagesContainer.appendChild(messageElement);
        
        // Remove staggered animation - messages are now visible immediately
        // setTimeout(() => {
        //     messageElement.style.opacity = '1';
        //     messageElement.style.transform = 'translateY(0)';
        // }, index * 30);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    console.log('Messages displayed successfully');
    console.log('messagesContainer children count:', messagesContainer.children.length);
    console.log('messagesContainer after adding messages:', messagesContainer.innerHTML.substring(0, 500) + '...');
}

// Create message element
function createMessageElement(message, index) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === 'Harshiv Gajjar' ? 'harshiv' : 'vrunda'}`;
    messageDiv.onclick = () => showMessageModal(message);
    
    // Remove initial animation state - make messages visible immediately
    // messageDiv.style.opacity = '0';
    // messageDiv.style.transform = 'translateY(10px)';
    // messageDiv.style.transition = 'all 0.4s ease';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const sender = document.createElement('div');
    sender.className = 'message-sender';
    sender.textContent = message.sender === 'Harshiv Gajjar' ? 'Harshiv' : 'Vrunda';
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = message.timestamp;
    
    header.appendChild(sender);
    header.appendChild(timestamp);
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.text;
    
    messageDiv.appendChild(header);
    messageDiv.appendChild(text);
    
    return messageDiv;
}

// Handle search and filters
function handleSearch() {
    applyFilters();
}

// Handle filter changes
function handleFilterChange() {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedYear = yearFilter.value;
    const selectedMonth = monthFilter.value;
    const selectedDate = dateFilter.value;
    const sortOrder = sortFilter.value;
    
    filteredData = chatData.filter(message => {
        const matchesSearch = message.text.toLowerCase().includes(searchTerm);
        const matchesYear = !selectedYear || message.timestamp.includes(selectedYear);
        const matchesMonth = !selectedMonth || message.timestamp.includes(selectedMonth);
        const matchesDate = !selectedDate || message.timestamp.includes(selectedDate);
        
        return matchesSearch && matchesYear && matchesMonth && matchesDate;
    });
    
    // Sort messages properly
    if (sortOrder === 'oldest') {
        // Keep original order (oldest first)
        filteredData = [...filteredData];
    } else if (sortOrder === 'newest') {
        // Reverse to show newest first
        filteredData = [...filteredData].reverse();
    }
    
    displayMessages(filteredData);
}

// Handle advanced search
function handleAdvancedSearch() {
    const searchTerm = document.getElementById('advanced-search')?.value.toLowerCase() || '';
    const selectedSender = document.getElementById('sender-filter')?.value || '';
    
    const results = chatData.filter(message => {
        const matchesSearch = !searchTerm || message.text.toLowerCase().includes(searchTerm);
        const matchesSender = !selectedSender || message.sender === selectedSender;
        return matchesSearch && matchesSender;
    });
    
    displaySearchResults(results);
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 1.1rem; padding: 2rem;">No messages found matching your criteria. 🔍</p>';
        return;
    }
    
    results.slice(0, 50).forEach((message, index) => { // Limit to 50 results
        const messageElement = createMessageElement(message, index);
        searchResults.appendChild(messageElement);
        
        // Add staggered animation
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, index * 30);
    });
    
    if (results.length > 50) {
        const moreText = document.createElement('p');
        moreText.style.textAlign = 'center';
        moreText.style.color = 'var(--text-muted)';
        moreText.style.padding = '1rem';
        moreText.textContent = `Showing 50 of ${results.length} results. Refine your search to see more.`;
        searchResults.appendChild(moreText);
    }
}

// Show random memory
function showRandomMemory() {
    if (chatData.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * chatData.length);
    const randomMessage = chatData[randomIndex];
    selectedRandomMessage = randomMessage;
    
    showMessageModal(randomMessage);
    
    // Add some fun animation
    randomMemoryBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        randomMemoryBtn.style.transform = 'scale(1)';
    }, 150);
}

// Show message in modal with context
function showMessageModal(message) {
    let contextMessages = [];
    
    // If this is from random memory, show context around it
    if (selectedRandomMessage && message === selectedRandomMessage) {
        const messageIndex = chatData.indexOf(message);
        const startIndex = Math.max(0, messageIndex - 5);
        const endIndex = Math.min(chatData.length, messageIndex + 6);
        contextMessages = chatData.slice(startIndex, endIndex);
    } else {
        contextMessages = [message];
    }
    
    let modalContent = '';
    
    if (contextMessages.length > 1) {
        modalContent = '<div style="margin-bottom: 1.5rem; text-align: center; color: var(--accent); font-weight: 600; font-size: 1.1rem;">📖 Context around this memory:</div>';
    }
    
    contextMessages.forEach((msg, index) => {
        const isHighlighted = msg === message ? 'border: 3px solid var(--warning);' : '';
        modalContent += `
            <div class="message ${msg.sender === 'Harshiv Gajjar' ? 'harshiv' : 'vrunda'}" style="${isHighlighted} margin-bottom: 1rem;">
                <div class="message-header">
                    <div class="message-sender">${msg.sender === 'Harshiv Gajjar' ? 'Harshiv' : 'Vrunda'}</div>
                    <div class="message-timestamp">${msg.timestamp}</div>
                </div>
                <div class="message-text">${msg.text}</div>
            </div>
        `;
    });
    
    modalMessage.innerHTML = modalContent;
    modal.style.display = 'block';
    
    // Reset selected random message
    selectedRandomMessage = null;
}

// Populate year filter
function populateYearFilter() {
    const years = new Set();
    
    chatData.forEach(message => {
        const year = extractYear(message.timestamp);
        if (year) years.add(year);
    });
    
    const sortedYears = Array.from(years).sort();
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Populate date filter
function populateDateFilter() {
    const dates = new Set();
    
    chatData.forEach(message => {
        const date = extractDate(message.timestamp);
        if (date) dates.add(date);
    });
    
    const sortedDates = Array.from(dates).sort();
    
    sortedDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
    });
}

// Extract year from timestamp
function extractYear(timestamp) {
    const match = timestamp.match(/(\d{4})/);
    return match ? match[1] : null;
}

// Extract date from timestamp
function extractDate(timestamp) {
    const match = timestamp.match(/(\w+), (\w+ \d+)/);
    return match ? match[2] : null;
}

// Update statistics
function updateStats() {
    if (chatData.length === 0) return;
    
    // Total messages
    const totalMessagesEl = document.getElementById('total-messages');
    if (totalMessagesEl) {
        totalMessagesEl.textContent = chatData.length.toLocaleString();
    }
    
    // Years of friendship
    const years = new Set();
    chatData.forEach(message => {
        const year = extractYear(message.timestamp);
        if (year) years.add(year);
    });
    
    const yearsFriendshipEl = document.getElementById('years-friendship');
    if (yearsFriendshipEl) {
        yearsFriendshipEl.textContent = years.size;
    }
    
    // Most active year
    const yearCounts = {};
    chatData.forEach(message => {
        const year = extractYear(message.timestamp);
        if (year) {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
    });
    
    const mostActiveYear = Object.keys(yearCounts).reduce((a, b) => 
        yearCounts[a] > yearCounts[b] ? a : b
    );
    
    const mostActiveYearEl = document.getElementById('most-active-year');
    if (mostActiveYearEl) {
        mostActiveYearEl.textContent = mostActiveYear;
    }
    
    // Longest message
    const longestMessage = chatData.reduce((longest, current) => 
        current.text.length > longest.text.length ? current : longest
    );
    
    const longestMessageEl = document.getElementById('longest-message');
    if (longestMessageEl) {
        longestMessageEl.textContent = longestMessage.text.length.toLocaleString();
    }
    
    // Update sidebar stats
    const sidebarMessageCountEl = document.getElementById('sidebar-message-count');
    if (sidebarMessageCountEl) {
        sidebarMessageCountEl.textContent = chatData.length.toLocaleString();
    }
    
    const sidebarYearCountEl = document.getElementById('sidebar-year-count');
    if (sidebarYearCountEl) {
        sidebarYearCountEl.textContent = years.size;
    }
}

// Generate memories with individual functionality
function generateMemories() {
    const memoriesGrid = document.getElementById('memories-grid');
    if (!memoriesGrid) return;
    
    memoriesGrid.innerHTML = '';
    
    // Find first message
    const firstMessage = chatData.length > 0 ? chatData[0] : null;
    
    // Find longest conversation (most messages in one day)
    const longestConversation = findLongestConversation();
    
    // Find most active month
    const mostActiveMonth = findMostActiveMonth();
    
    // Generate different types of memories
    const memories = [
        {
            title: '🐄 First Message',
            content: firstMessage ? `"${firstMessage.text.substring(0, 100)}..."` : 'No messages found',
            date: firstMessage ? firstMessage.timestamp : '',
            action: () => showFirstMessage()
        },
        {
            title: '🐱 Longest Conversation',
            content: longestConversation ? `A ${longestConversation.length} message conversation on ${longestConversation.date}` : 'Find the longest conversation in one day',
            date: longestConversation ? longestConversation.date : 'Click to explore!',
            action: () => showLongestConversation()
        },
        {
            title: '🎭 Most Active Month',
            content: mostActiveMonth ? `The month you two talked the most - ${mostActiveMonth.count} messages!` : 'The month you two talked the most',
            date: mostActiveMonth ? mostActiveMonth.month : 'Discover it in the timeline',
            action: () => showMostActiveMonth()
        },
        {
            title: '💭 Random Memory',
            content: 'Click to see a random message from your chat history',
            date: 'Always a surprise!',
            action: () => showRandomMemory()
        }
    ];
    
    memories.forEach((memory, index) => {
        const memoryCard = document.createElement('div');
        memoryCard.className = 'memory-card';
        memoryCard.innerHTML = `
            <h3>${memory.title}</h3>
            <p>${memory.content}</p>
            <small>${memory.date}</small>
        `;
        memoryCard.onclick = memory.action;
        
        // Add staggered animation
        memoryCard.style.opacity = '0';
        memoryCard.style.transform = 'translateY(20px)';
        memoryCard.style.transition = 'all 0.4s ease';
        
        memoriesGrid.appendChild(memoryCard);
        
        setTimeout(() => {
            memoryCard.style.opacity = '1';
            memoryCard.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// Find longest conversation (most messages in one day)
function findLongestConversation() {
    const dayCounts = {};
    const dayMessages = {};
    
    chatData.forEach(message => {
        const date = extractDate(message.timestamp);
        if (date) {
            if (!dayCounts[date]) {
                dayCounts[date] = 0;
                dayMessages[date] = [];
            }
            dayCounts[date]++;
            dayMessages[date].push(message);
        }
    });
    
    // Find the day with most messages
    const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => 
        dayCounts[a] > dayCounts[b] ? a : b
    );
    
    if (mostActiveDay && dayCounts[mostActiveDay] > 1) {
        return {
            date: mostActiveDay,
            messages: dayMessages[mostActiveDay],
            length: dayCounts[mostActiveDay]
        };
    }
    
    return null;
}

// Find most active month
function findMostActiveMonth() {
    const monthCounts = {};
    
    chatData.forEach(message => {
        const month = extractMonth(message.timestamp);
        if (month) {
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });
    
    const mostActive = Object.keys(monthCounts).reduce((a, b) => 
        monthCounts[a] > monthCounts[b] ? a : b
    );
    
    return mostActive ? { month: mostActive, count: monthCounts[mostActive] } : null;
}

// Extract month from timestamp
function extractMonth(timestamp) {
    const match = timestamp.match(/(\w+)/);
    return match ? match[1] : null;
}

// Show first message
function showFirstMessage() {
    if (chatData.length > 0) {
        showMessageModal(chatData[0]);
    }
}

// Show longest conversation
function showLongestConversation() {
    const longestConversation = findLongestConversation();
    if (longestConversation) {
        showConversationModal(longestConversation.messages, `Longest Conversation: ${longestConversation.date} (${longestConversation.length} messages)`);
    } else {
        showRandomMemory();
    }
}

// Show most active month
function showMostActiveMonth() {
    const mostActiveMonth = findMostActiveMonth();
    if (mostActiveMonth) {
        const monthMessages = chatData.filter(message => 
            extractMonth(message.timestamp) === mostActiveMonth.month
        );
        showConversationModal(monthMessages, `Most Active Month: ${mostActiveMonth.month} (${mostActiveMonth.count} messages)`);
    } else {
        showRandomMemory();
    }
}

// Show conversation modal
function showConversationModal(messages, title) {
    let modalContent = `<div style="margin-bottom: 1.5rem; text-align: center; color: var(--accent); font-weight: 600; font-size: 1.2rem;">${title}</div>`;
    
    messages.forEach(message => {
        modalContent += `
            <div class="message ${message.sender === 'Harshiv Gajjar' ? 'harshiv' : 'vrunda'}" style="margin-bottom: 1rem;">
                <div class="message-header">
                    <div class="message-sender">${message.sender === 'Harshiv Gajjar' ? 'Harshiv' : 'Vrunda'}</div>
                    <div class="message-timestamp">${message.timestamp}</div>
                </div>
                <div class="message-text">${message.text}</div>
            </div>
        `;
    });
    
    modalMessage.innerHTML = modalContent;
    modal.style.display = 'block';
}

// Utility function: debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some fun Easter eggs
document.addEventListener('keydown', function(e) {
    // Press 'B' for Brooklyn Nine-Nine theme
    if (e.key.toLowerCase() === 'b') {
        document.body.classList.toggle('b99-theme');
        showB99Message();
    }
    
    // Press 'N' for "Nine-Nine!"
    if (e.key.toLowerCase() === 'n') {
        showNineNineMessage();
    }
    
    // Press 'H' for Captain Holt
    if (e.key.toLowerCase() === 'h') {
        showCaptainHoltMessage();
    }
    
    // Press 'J' for Jake Peralta
    if (e.key.toLowerCase() === 'j') {
        showJakePeraltaMessage();
    }
    
    // Press 'A' for Amy Santiago
    if (e.key.toLowerCase() === 'a') {
        showAmySantiagoMessage();
    }
    
    // Press 'R' for Rosa Diaz
    if (e.key.toLowerCase() === 'r') {
        showRosaDiazMessage();
    }
    
    // Press 'T' for Terry Jeffords
    if (e.key.toLowerCase() === 't') {
        showTerryJeffordsMessage();
    }
    
    // Press 'G' for Gina Linetti
    if (e.key.toLowerCase() === 'g') {
        showGinaLinettiMessage();
    }
    
    // Press 'C' for Charles Boyle
    if (e.key.toLowerCase() === 'c') {
        showCharlesBoyleMessage();
    }
    
    // Press 'S' for random memory
    if (e.key.toLowerCase() === 's') {
        showRandomMemory();
    }
    
    // Press 'L' for home (timeline)
    if (e.key.toLowerCase() === 'l') {
        switchView('timeline');
    }
});

// Show B99 themed message
function showB99Message() {
    const messages = [
        "🚔 Welcome to the 99th Precinct! 👮",
        "🎭 Brooklyn Nine-Nine style activated! 🚨",
        "👮‍♀️ Time to solve some memory cases! 🔍",
        "🚔 The 99th Precinct is now in session! 📋"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showNotification(randomMessage, 'b99');
}

// Show "Nine-Nine!" message
function showNineNineMessage() {
    const messages = [
        "🎉 NINE-NINE! 🎉",
        "👮 NINE-NINE! 👮",
        "🚔 NINE-NINE! 🚔",
        "🎭 NINE-NINE! 🎭"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showNotification(randomMessage, 'ninenine');
}

// Real Brooklyn Nine-Nine Quotes Database
const b99Quotes = {
    jake: [
        { quote: "Cool cool cool cool cool, no doubt no doubt no doubt.", emoji: "🕶️" },
        { quote: "Noice. Smort.", emoji: "🕶️" },
        { quote: "I'm the human form of the 💯 emoji.", emoji: "🕶️" },
        { quote: "Bingpot!", emoji: "🕶️" },
        { quote: "Title of your sex tape.", emoji: "🕶️" },
        { quote: "Sarge, with all due respect, I am gonna completely ignore everything you just said.", emoji: "🕶️" },
        { quote: "I wasn't hurt that badly. The doctor said all my bleeding was internal. That's where the blood's supposed to be!", emoji: "🕶️" },
        { quote: "I've only had Arlo for a day and a half, but if anything happened to him I would kill everyone in this room and then myself.", emoji: "🕶️" },
        { quote: "Hope is for losers. I make my own luck.", emoji: "🕶️" },
        { quote: "The English language cannot fully capture the depth and complexity of my thoughts, so I'm incorporating emojis into my speech to better express myself. Winky face.", emoji: "🕶️" },
        { quote: "My entire life is a lie. My hair—this is a wig! I'm bald.", emoji: "🕶️" },
        { quote: "You think I'm not tough? I grew up on the streets of suburban Queens, man!", emoji: "🕶️" },
        { quote: "Let's just say it involved three double cheeseburgers and a lot of regret.", emoji: "🕶️" },
        { quote: "I want it to be fun and cool, like one of those slow-motion scenes where we walk away from an explosion and don't look back.", emoji: "🕶️" }
    ],
    holt: [
        { quote: "Everything is garbage.", emoji: "🧊" },
        { quote: "Hot damn.", emoji: "🧊" },
        { quote: "Wuntch time is over.", emoji: "🧊" },
        { quote: "You're a good detective, but an even better husband.", emoji: "🧊" },
        { quote: "BONE?! I HAVE NO BONES TO PICK.", emoji: "🧊" },
        { quote: "This folder is now my husband.", emoji: "🧊" },
        { quote: "This is a police precinct, not a canvas for your emo poetry.", emoji: "🧊" },
        { quote: "I'm ecstatic.", emoji: "🧊" },
        { quote: "You want my respect? Then earn it.", emoji: "🧊" },
        { quote: "Pain. That's it. Just pain.", emoji: "🧊" },
        { quote: "I'm not mad. I'm just disappointed… in everything.", emoji: "🧊" },
        { quote: "I was a damn good cop. And I will not let you or anyone else take that away from me.", emoji: "🧊" },
        { quote: "You know what they say: 'Fool me once, strike one. But fool me twice… strike three.'", emoji: "🧊" },
        { quote: "Why would I ever do something nice? I'm vindictive and petty.", emoji: "🧊" },
        { quote: "Yes, I do support the Make-A-Wish Foundation. I'm not a monster.", emoji: "🧊" }
    ],
    terry: [
        { quote: "Terry loves yogurt!", emoji: "💪" },
        { quote: "Terry is a beautiful mystery.", emoji: "💪" },
        { quote: "Terry hates rats. And irony.", emoji: "💪" },
        { quote: "Terry's not dying here. Terry's getting his girls through college!", emoji: "💪" },
        { quote: "Terry's muscles don't get sore. They get bored.", emoji: "💪" },
        { quote: "I was scared… but I never want my girls to be ashamed of who they are.", emoji: "💪" },
        { quote: "Terry does love a good fairy tale.", emoji: "💪" },
        { quote: "I'm a detective sergeant. I'm gonna detect and serge.", emoji: "💪" },
        { quote: "Terry don't do paper trails!", emoji: "💪" },
        { quote: "You mess with the bull, you get the horns!", emoji: "💪" },
        { quote: "Terry had nightmares for a month after seeing Ghostbusters.", emoji: "💪" },
        { quote: "Terry will find you. Terry always finds you.", emoji: "💪" },
        { quote: "Terry loves love.", emoji: "💪" }
    ],
    rosa: [
        { quote: "If you tell anyone I said this, I'll deny it and destroy you.", emoji: "💅" },
        { quote: "I hate small talk. Let's drink in silence.", emoji: "💅" },
        { quote: "I don't like feelings. I'm a stone-cold bitch.", emoji: "💅" },
        { quote: "Don't worry, I only threatened to kill him. I didn't do it… yet.", emoji: "💅" },
        { quote: "Cool motive. Still murder.", emoji: "💅" },
        { quote: "People are so clingy. I once broke up with a guy via text and he called me.", emoji: "💅" },
        { quote: "My whole life is a dark room.", emoji: "💅" },
        { quote: "I wasn't hurt, just lightly stabbed.", emoji: "💅" },
        { quote: "Do I not look intimidating enough? Should I sit in a chair backwards and threaten you with a switchblade?", emoji: "💅" },
        { quote: "You're all my best friends. Don't make a big deal out of it.", emoji: "💅" },
        { quote: "I don't have a 'soft side.'", emoji: "💅" },
        { quote: "Feelings are dumb. Love is cursed.", emoji: "💅" },
        { quote: "Do I not look intimidating enough?", emoji: "💅" }
    ],
    amy: [
        { quote: "I have seven planners. Each planner contains a schedule, a goal tracker, a to-do list…", emoji: "🎨" },
        { quote: "Oh, it is on like Donkey Kong. Which I know is a video game, don't quiz me on it!", emoji: "🎨" },
        { quote: "I'm gonna go cry in the bathroom. Peace out, homies.", emoji: "🎨" },
        { quote: "You read my dream journal?! That is private!", emoji: "🎨" },
        { quote: "My doctor said my blood pressure is 'pre-hypertension.' So it's basically fine.", emoji: "🎨" },
        { quote: "Binders are sacred.", emoji: "🎨" },
        { quote: "I can't be spontaneous. I once threw out a spontaneous purchase planner.", emoji: "🎨" },
        { quote: "Do you know how many germs are in the average elevator button? Don't touch me.", emoji: "🎨" },
        { quote: "I can't go to jail! I'll die. They'll eat me alive!", emoji: "🎨" },
        { quote: "I love puzzles, I love logic, I love being right, I love lists!", emoji: "🎨" },
        { quote: "I have seven planners.", emoji: "🎨" },
        { quote: "You read my dream journal?!", emoji: "🎨" },
        { quote: "I got into the academy because of hard work, not because of some famous relative.", emoji: "🎨" },
        { quote: "Oh, it is on like Donkey Kong. Which I know is a video game—don't quiz me on it!", emoji: "🎨" }
    ],
    boyle: [
        { quote: "Jake and I are like Batman and Robin, if Batman had a food blog and Robin was super into jiu-jitsu.", emoji: "🍩" },
        { quote: "You're the cream in my coffee, the butter on my biscuit.", emoji: "🍩" },
        { quote: "I have a name for every emotion. For example, I'm feeling glumpish right now.", emoji: "🍩" },
        { quote: "You think I'm sweet? You should see me with my dogs!", emoji: "🍩" },
        { quote: "Boyle's got the moves. Boyle's got the power.", emoji: "🍩" },
        { quote: "It's okay. I'm a Boyle. Pain is just the family curse.", emoji: "🍩" },
        { quote: "I tried to hide a meatball in my pants once.", emoji: "🍩" },
        { quote: "We're foodies, Jake. We need sustenance, not sustenance.", emoji: "🍩" },
        { quote: "Every time you talk about Amy, I hear this weird sound: 'doo-wop doo-wop.'", emoji: "🍩" },
        { quote: "What happens in Boyletown, stays in Boyletown.", emoji: "🍩" },
        { quote: "Jake and I are like Batman and Robin. If Batman had a food blog.", emoji: "🍩" },
        { quote: "The Vulture swooped in and stole my case… like a vulture!", emoji: "🍩" },
        { quote: "I have a name for every emotion.", emoji: "🍩" },
        { quote: "Don't worry Jake. I'd never let anything bad happen to you… unless it was funny.", emoji: "🍩" }
    ],
    gina: [
        { quote: "The English language cannot fully capture the depth and complexity of my thoughts, so I'm incorporating emojis into my speech.", emoji: "😬" },
        { quote: "The only thing I'm not good at is modesty. Because I'm great at it.", emoji: "😬" },
        { quote: "I'm the Paris of people.", emoji: "😬" },
        { quote: "Time is a construct.", emoji: "😬" },
        { quote: "The vibes are off. I'm out.", emoji: "😬" },
        { quote: "I don't have emotions. I'm a robot programmed to be sassy and love dance.", emoji: "😬" },
        { quote: "I'm gonna go sit in a corner and read the comments on my own Instagram.", emoji: "😬" },
        { quote: "I'm the human form of the 💅 emoji.", emoji: "😬" },
        { quote: "Confidence. I can't teach it. But I live it. I breathe it. I exude it.", emoji: "😬" },
        { quote: "You can't put a label on me. I'm not a label. I'm a person. And my label is Gina.", emoji: "😬" },
        { quote: "The vibes are off. I'm out.", emoji: "😬" },
        { quote: "Confidence. I can't teach it. But I live it.", emoji: "😬" },
        { quote: "The English language can't fully capture the depth of my thoughts, so I'm switching to emojis.", emoji: "😬" }
    ]
};

// Quote rotation tracking
let quoteIndexes = {
    holt: 0,
    jake: 0,
    amy: 0,
    rosa: 0,
    terry: 0,
    gina: 0,
    boyle: 0
};

// Get next quote for a character
function getNextQuote(character) {
    const quotes = b99Quotes[character];
    const currentIndex = quoteIndexes[character];
    const quote = quotes[currentIndex];
    
    // Move to next quote, reset if at end
    quoteIndexes[character] = (currentIndex + 1) % quotes.length;
    
    return quote;
}

// Show Captain Holt message
function showCaptainHoltMessage() {
    const quote = getNextQuote('holt');
    showNotification(`👨‍💼 Captain Holt: '${quote.quote}' ${quote.emoji}`, 'holt');
}

// Show Jake Peralta message
function showJakePeraltaMessage() {
    const quote = getNextQuote('jake');
    showNotification(`😎 Jake: '${quote.quote}' ${quote.emoji}`, 'jake');
}

// Show Amy Santiago message
function showAmySantiagoMessage() {
    const quote = getNextQuote('amy');
    showNotification(`📚 Amy: '${quote.quote}' ${quote.emoji}`, 'amy');
}

// Show Rosa Diaz message
function showRosaDiazMessage() {
    const quote = getNextQuote('rosa');
    showNotification(`😠 Rosa: '${quote.quote}' ${quote.emoji}`, 'rosa');
}

// Show Terry Jeffords message
function showTerryJeffordsMessage() {
    const quote = getNextQuote('terry');
    showNotification(`💪 Terry: '${quote.quote}' ${quote.emoji}`, 'terry');
}

// Show Gina Linetti message
function showGinaLinettiMessage() {
    const quote = getNextQuote('gina');
    showNotification(`💅 Gina: '${quote.quote}' ${quote.emoji}`, 'gina');
}

// Show Charles Boyle message
function showCharlesBoyleMessage() {
    const quote = getNextQuote('boyle');
    showNotification(`🥪 Charles: '${quote.quote}' ${quote.emoji}`, 'boyle');
}

// Show notification
function showNotification(message, type = 'default') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        'b99': '🚔',
        'ninenine': '🎉',
        'holt': '👨‍💼',
        'jake': '😎',
        'amy': '📚',
        'rosa': '😠',
        'terry': '💪',
        'gina': '💅',
        'boyle': '🥪',
        'default': '💬'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.default}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        border: 2px solid var(--secondary);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add confetti effect for birthday
function addConfetti() {
    const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--success)', 'var(--warning)'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '6px';
        confetti.style.height = '6px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add fall animation for confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(style); 

// Show keyboard shortcuts help
function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'B', description: 'Toggle B99 Theme', icon: '🚔' },
        { key: 'N', description: 'Nine-Nine!', icon: '🎉' },
        { key: 'H', description: 'Captain Holt Quotes', icon: '👨‍💼' },
        { key: 'J', description: 'Jake Peralta Quotes', icon: '😎' },
        { key: 'A', description: 'Amy Santiago Quotes', icon: '📚' },
        { key: 'R', description: 'Rosa Diaz Quotes', icon: '😠' },
        { key: 'T', description: 'Terry Jeffords Quotes', icon: '💪' },
        { key: 'G', description: 'Gina Linetti Quotes', icon: '💅' },
        { key: 'C', description: 'Charles Boyle Quotes', icon: '🥪' },
        { key: 'S', description: 'Random Memory', icon: '🎲' },
        { key: 'L', description: 'Go to Timeline', icon: '📅' }
    ];
    
    const mobileShortcuts = [
        { icon: '🚔', description: 'Toggle B99 Theme', action: 'Tap Random Memory + B99' },
        { icon: '🎉', description: 'Nine-Nine!', action: 'Tap Random Memory + Nine-Nine' },
        { icon: '👨‍💼', description: 'Captain Holt Quotes', action: 'Tap Random Memory + Holt' },
        { icon: '😎', description: 'Jake Peralta Quotes', action: 'Tap Random Memory + Jake' },
        { icon: '📚', description: 'Amy Santiago Quotes', action: 'Tap Random Memory + Amy' },
        { icon: '😠', description: 'Rosa Diaz Quotes', action: 'Tap Random Memory + Rosa' },
        { icon: '💪', description: 'Terry Jeffords Quotes', action: 'Tap Random Memory + Terry' },
        { icon: '💅', description: 'Gina Linetti Quotes', action: 'Tap Random Memory + Gina' },
        { icon: '🥪', description: 'Charles Boyle Quotes', action: 'Tap Random Memory + Boyle' }
    ];
    
    let modalContent = `
        <div class="shortcuts-header">
            <h3>🚔 Brooklyn Nine-Nine Shortcuts ⌨️</h3>
            <p>Use keyboard shortcuts on desktop or tap combinations on mobile!</p>
        </div>
        
        <div class="shortcuts-section">
            <h4>💻 Desktop Keyboard Shortcuts:</h4>
            <div class="shortcuts-grid">
    `;
    
    shortcuts.forEach(shortcut => {
        modalContent += `
            <div class="shortcut-item">
                <div class="shortcut-key">${shortcut.icon} ${shortcut.key}</div>
                <div class="shortcut-desc">${shortcut.description}</div>
            </div>
        `;
    });
    
    modalContent += `
            </div>
        </div>
        
        <div class="shortcuts-section">
            <h4>📱 Mobile Touch Shortcuts:</h4>
            <div class="shortcuts-grid mobile-shortcuts">
    `;
    
    mobileShortcuts.forEach(shortcut => {
        modalContent += `
            <div class="shortcut-item mobile">
                <div class="shortcut-icon">${shortcut.icon}</div>
                <div class="shortcut-desc">
                    <div class="shortcut-title">${shortcut.description}</div>
                    <div class="shortcut-action">${shortcut.action}</div>
                </div>
            </div>
        `;
    });
    
    modalContent += `
            </div>
        </div>
        
        <div class="quotes-preview">
            <h4>🎭 Real B99 Quotes Preview:</h4>
            <div class="quotes-list">
                <div class="quote-item">
                    <strong>Captain Holt:</strong> "Everything is garbage.", "Hot damn.", "Wuntch time is over."
                </div>
                <div class="quote-item">
                    <strong>Jake Peralta:</strong> "Cool cool cool cool cool, no doubt no doubt no doubt.", "Bingpot!", "Title of your sex tape."
                </div>
                <div class="quote-item">
                    <strong>Amy Santiago:</strong> "I have seven planners.", "Binders are sacred.", "I love puzzles, I love logic, I love being right, I love lists!"
                </div>
                <div class="quote-item">
                    <strong>Rosa Diaz:</strong> "Cool motive. Still murder.", "My whole life is a dark room.", "I wasn't hurt, just lightly stabbed."
                </div>
                <div class="quote-item">
                    <strong>Terry Jeffords:</strong> "Terry loves yogurt!", "Terry's muscles don't get sore. They get bored.", "You mess with the bull, you get the horns!"
                </div>
                <div class="quote-item">
                    <strong>Gina Linetti:</strong> "I'm the Paris of people.", "Time is a construct.", "The vibes are off. I'm out."
                </div>
                <div class="quote-item">
                    <strong>Charles Boyle:</strong> "Jake and I are like Batman and Robin.", "You're the cream in my coffee, the butter on my biscuit.", "What happens in Boyletown, stays in Boyletown."
                </div>
            </div>
        </div>
        <div class="shortcuts-footer">
            <p>🎭 Each character now has 13-15 unique authentic quotes that rotate in order! 🚔</p>
        </div>
    `;
    
    showModal('Keyboard Shortcuts', modalContent);
}

// Show mobile shortcuts panel
function showMobileShortcuts() {
    const shortcuts = [
        { icon: '🚔', description: 'Toggle B99 Theme', action: () => showB99Message() },
        { icon: '🎉', description: 'Nine-Nine!', action: () => showNineNineMessage() },
        { icon: '👨‍💼', description: 'Captain Holt', action: () => showCaptainHoltMessage() },
        { icon: '😎', description: 'Jake Peralta', action: () => showJakePeraltaMessage() },
        { icon: '📚', description: 'Amy Santiago', action: () => showAmySantiagoMessage() },
        { icon: '😠', description: 'Rosa Diaz', action: () => showRosaDiazMessage() },
        { icon: '💪', description: 'Terry Jeffords', action: () => showTerryJeffordsMessage() },
        { icon: '💅', description: 'Gina Linetti', action: () => showGinaLinettiMessage() },
        { icon: '🥪', description: 'Charles Boyle', action: () => showCharlesBoyleMessage() }
    ];
    
    let modalContent = `
        <div class="mobile-shortcuts-header">
            <h3>📱 Mobile B99 Shortcuts</h3>
            <p>Tap any character to hear their quote!</p>
        </div>
        <div class="mobile-shortcuts-grid">
    `;
    
    shortcuts.forEach(shortcut => {
        modalContent += `
            <button class="mobile-shortcut-btn" onclick="this.closest('.modal').remove(); ${shortcut.action.toString()}()">
                <div class="shortcut-icon">${shortcut.icon}</div>
                <div class="shortcut-label">${shortcut.description}</div>
            </button>
        `;
    });
    
    modalContent += `
        </div>
        <div class="mobile-shortcuts-footer">
            <p>💡 Double-tap Random Memory to open this panel anytime!</p>
        </div>
    `;
    
    showModal('Mobile Shortcuts', modalContent);
}

// Show modal with custom content
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal shortcuts-modal';
    modal.innerHTML = `
        <div class="modal-content shortcuts-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add CSS for shortcuts modal
    const style = document.createElement('style');
    style.textContent = `
        .shortcuts-modal .modal-content {
            background: linear-gradient(135deg, var(--surface) 0%, var(--surface-light) 100%);
            border: 3px solid var(--secondary);
            border-radius: var(--radius-xl);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }
        
        .shortcuts-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .shortcuts-header h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .shortcuts-header p {
            color: var(--secondary-light);
            font-size: 1rem;
        }
        
        .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .shortcut-item {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border: 2px solid var(--secondary);
            border-radius: var(--radius-lg);
            padding: 1rem;
            text-align: center;
            transition: all 0.2s ease;
        }
        
        .shortcut-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .shortcut-key {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--secondary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .shortcut-desc {
            color: var(--text-primary);
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .quotes-preview {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid var(--border);
        }
        
        .quotes-preview h4 {
            color: var(--text-primary);
            font-size: 1.1rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .quotes-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem;
            justify-content: center;
        }
        
        .quote-item {
            background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
        }
        
        .shortcuts-footer {
            text-align: center;
            padding-top: 1rem;
            border-top: 2px solid var(--border);
        }
        
        .shortcuts-footer p {
            color: var(--secondary-light);
            font-size: 0.9rem;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .shortcuts-grid {
                grid-template-columns: 1fr;
            }
            
            .shortcuts-modal .modal-content {
                width: 95%;
                max-height: 90vh;
            }
        }
    `;
    
    document.head.appendChild(style);
} 