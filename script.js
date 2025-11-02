// Global State
let allBooks = [];
let filteredBooks = [];
let selectedBooksForAnalysis = [];
let analysisHistory = [];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const booksGrid = document.getElementById('books-grid');
const searchInput = document.getElementById('search-input');
const genreFilter = document.getElementById('genre-filter');
const theoryFilter = document.getElementById('theory-filter');
const yearFilter = document.getElementById('year-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const bookCount = document.getElementById('book-count');

// Analysis Elements
const userText = document.getElementById('user-text');
const clearTextBtn = document.getElementById('clear-text');
const saveDraftBtn = document.getElementById('save-draft');
const loadDraftBtn = document.getElementById('load-draft');
const analysisSearch = document.getElementById('analysis-search');
const selectedBooksContainer = document.getElementById('selected-books');
const analysisBookList = document.getElementById('analysis-book-list');
const generateAnalysisBtn = document.getElementById('generate-analysis');
const analysisResults = document.getElementById('analysis-results');
const visualizationContainer = document.getElementById('visualization-container');
const analysisText = document.getElementById('analysis-text');

// History Elements
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const exportHistoryBtn = document.getElementById('export-history');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    setupEventListeners();
    loadHistoryFromStorage();
    loadDraftFromStorage();

    // Set About tab as active by default
    switchTab('about');
});

// Load Books from JSON
async function loadBooks() {
    try {
        const response = await fetch('books.json');
        allBooks = await response.json();
        filteredBooks = [...allBooks];
        renderBooks(filteredBooks);
        updateBookCount();
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = '<p class="error">Error loading books. Please refresh the page.</p>';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Filters
    searchInput.addEventListener('input', applyFilters);
    genreFilter.addEventListener('change', applyFilters);
    theoryFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Text Controls
    clearTextBtn.addEventListener('click', clearUserText);
    saveDraftBtn.addEventListener('click', saveDraft);
    loadDraftBtn.addEventListener('click', loadDraft);

    // Analysis
    analysisSearch.addEventListener('input', filterAnalysisBooks);
    generateAnalysisBtn.addEventListener('click', generateAnalysis);

    // History
    clearHistoryBtn.addEventListener('click', clearHistory);
    exportHistoryBtn.addEventListener('click', exportHistory);
}

// Tab Switching
function switchTab(tabName) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}-tab`);

    if (activeButton && activeContent) {
        activeButton.classList.add('active');
        activeContent.classList.add('active');
    }

    // Load analysis books when switching to analysis tab
    if (tabName === 'analysis') {
        renderAnalysisBooks(allBooks);
    }
}

// Render Books
function renderBooks(books) {
    if (books.length === 0) {
        booksGrid.innerHTML = '<p class="empty-state">No books found matching your criteria.</p>';
        return;
    }

    booksGrid.innerHTML = books.map(book => {
        // Create search link for the book
        const searchQuery = encodeURIComponent(`"${book.title}" ${book.author}`);
        const bookLink = book.link || `https://www.google.com/search?q=${searchQuery}`;

        return `
            <div class="book-card" data-id="${book.id}">
                <h3><a href="${bookLink}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); text-decoration: none;">${book.title}</a></h3>
                <p class="author">${book.author}</p>
                <div class="meta">
                    <span class="meta-item">📅 ${book.year}</span>
                    <span class="meta-item">🌍 ${book.country}</span>
                </div>
                <span class="genre-badge">${book.genre}</span>
                <div class="themes">
                    ${book.themes.slice(0, 3).map(theme =>
                        `<span class="theme-tag">${theme}</span>`
                    ).join('')}
                    ${book.themes.length > 3 ? `<span class="theme-tag">+${book.themes.length - 3} more</span>` : ''}
                </div>
                <div class="theories">
                    ${book.connectingTheory.map(theory =>
                        `<span class="theory-tag">${theory}</span>`
                    ).join('')}
                </div>
                <p class="abstract">${book.abstract}</p>
            </div>
        `;
    }).join('');
}

// Apply Filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value.toLowerCase();
    const selectedTheory = theoryFilter.value.toLowerCase();
    const selectedYearRange = yearFilter.value;

    filteredBooks = allBooks.filter(book => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.themes.some(theme => theme.toLowerCase().includes(searchTerm)) ||
            book.abstract.toLowerCase().includes(searchTerm);

        // Genre filter
        const matchesGenre = selectedGenre === '' ||
            book.genre.toLowerCase() === selectedGenre;

        // Theory filter
        const matchesTheory = selectedTheory === '' ||
            book.connectingTheory.some(theory => theory.toLowerCase() === selectedTheory);

        // Year filter
        let matchesYear = true;
        if (selectedYearRange) {
            const [startYear, endYear] = selectedYearRange.split('-').map(Number);
            matchesYear = book.year >= startYear && book.year <= endYear;
        }

        return matchesSearch && matchesGenre && matchesTheory && matchesYear;
    });

    renderBooks(filteredBooks);
    updateBookCount();
}

// Clear Filters
function clearFilters() {
    searchInput.value = '';
    genreFilter.value = '';
    theoryFilter.value = '';
    yearFilter.value = '';
    applyFilters();
}

// Update Book Count
function updateBookCount() {
    bookCount.textContent = filteredBooks.length;
}

// Text Controls
function clearUserText() {
    userText.value = '';
    localStorage.removeItem('textDraft');
}

function saveDraft() {
    const text = userText.value;
    if (text.trim()) {
        localStorage.setItem('textDraft', text);
        showNotification('Draft saved successfully!');
    } else {
        showNotification('No text to save.', 'error');
    }
}

function loadDraft() {
    const draft = localStorage.getItem('textDraft');
    if (draft) {
        userText.value = draft;
        showNotification('Draft loaded successfully!');
    } else {
        showNotification('No saved draft found.', 'error');
    }
}

function loadDraftFromStorage() {
    const draft = localStorage.getItem('textDraft');
    if (draft) {
        userText.value = draft;
    }
}

// Analysis Book Selection
function renderAnalysisBooks(books) {
    analysisBookList.innerHTML = books.map(book => `
        <div class="analysis-book-item ${selectedBooksForAnalysis.some(b => b.id === book.id) ? 'selected' : ''}"
             data-id="${book.id}"
             onclick="toggleBookSelection(${book.id})">
            <h4>${book.title}</h4>
            <p class="author">${book.author} (${book.year})</p>
            <span class="genre-badge">${book.genre}</span>
        </div>
    `).join('');
}

function toggleBookSelection(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    const index = selectedBooksForAnalysis.findIndex(b => b.id === bookId);

    if (index > -1) {
        selectedBooksForAnalysis.splice(index, 1);
    } else {
        selectedBooksForAnalysis.push(book);
    }

    updateSelectedBooksDisplay();
    renderAnalysisBooks(allBooks);

    // Auto-generate analysis if we have text and books selected
    autoGenerateAnalysis();
}

function updateSelectedBooksDisplay() {
    if (selectedBooksForAnalysis.length === 0) {
        selectedBooksContainer.innerHTML = '<p class="empty-state">No books selected. Search and click books to add them.</p>';
        return;
    }

    selectedBooksContainer.innerHTML = selectedBooksForAnalysis.map(book => `
        <div class="selected-book-item">
            <span>${book.title} - ${book.author}</span>
            <button class="remove-btn" onclick="toggleBookSelection(${book.id})">×</button>
        </div>
    `).join('');
}

function filterAnalysisBooks() {
    const searchTerm = analysisSearch.value.toLowerCase();
    const filtered = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm)
    );
    renderAnalysisBooks(filtered);
}

// Generate Analysis
function generateAnalysis() {
    const text = userText.value.trim();

    if (!text) {
        showNotification('Please enter some text to analyze.', 'error');
        return;
    }

    if (selectedBooksForAnalysis.length === 0) {
        showNotification('Please select at least one book for comparison.', 'error');
        return;
    }

    // Get selected analysis options
    const options = {
        themes: document.getElementById('theme-analysis').checked,
        theory: document.getElementById('theory-analysis').checked,
        temporal: document.getElementById('temporal-analysis').checked,
        geographic: document.getElementById('geographic-analysis').checked,
        genre: document.getElementById('genre-analysis').checked,
        linguistic: document.getElementById('linguistic-analysis').checked
    };

    // Perform analysis
    const analysis = performSemanticAnalysis(text, selectedBooksForAnalysis, options);

    // Display results
    displayAnalysisResults(analysis);

    // Save to history
    saveToHistory(text, selectedBooksForAnalysis, analysis);

    // Show results section
    analysisResults.classList.add('show');
    analysisResults.scrollIntoView({ behavior: 'smooth' });
}

// Perform Semantic Analysis
function performSemanticAnalysis(text, books, options) {
    const analysis = {
        timestamp: new Date().toISOString(),
        userText: text,
        books: books,
        connections: {
            themes: [],
            theories: [],
            temporal: [],
            geographic: [],
            genres: [],
            linguistic: []
        },
        enhancements: [],
        limitations: []
    };

    // Extract themes from user text (simple keyword matching)
    const textLower = text.toLowerCase();
    const allThemes = new Set();
    const allTheories = new Set();
    const years = [];
    const countries = new Set();
    const genres = new Set();

    books.forEach(book => {
        // Theme analysis
        if (options.themes) {
            book.themes.forEach(theme => {
                if (textLower.includes(theme.toLowerCase())) {
                    allThemes.add(theme);
                    analysis.connections.themes.push({
                        theme: theme,
                        book: book.title,
                        author: book.author
                    });
                }
            });
        }

        // Theory analysis
        if (options.theory) {
            book.connectingTheory.forEach(theory => {
                allTheories.add(theory);
                if (textLower.includes(theory.toLowerCase().split(' ')[0])) {
                    analysis.connections.theories.push({
                        theory: theory,
                        book: book.title,
                        author: book.author
                    });
                }
            });
        }

        // Temporal analysis
        if (options.temporal) {
            years.push(book.year);
        }

        // Geographic analysis
        if (options.geographic) {
            countries.add(book.country);
        }

        // Genre analysis
        if (options.genre) {
            genres.add(book.genre);
        }
    });

    // Temporal analysis
    if (options.temporal && years.length > 0) {
        const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        analysis.connections.temporal = {
            timeSpan: `${maxYear - minYear} years`,
            range: `${minYear} - ${maxYear}`,
            average: avgYear,
            distribution: categorizeYears(years)
        };
    }

    // Geographic analysis
    if (options.geographic) {
        analysis.connections.geographic = Array.from(countries);
    }

    // Genre analysis
    if (options.genre) {
        analysis.connections.genres = Array.from(genres);
    }

    // Linguistic analysis (simple word frequency)
    if (options.linguistic) {
        analysis.connections.linguistic = analyzeLinguisticPatterns(text, books);
    }

    // Identify LLM enhancements
    analysis.enhancements = identifyEnhancements(text, books, analysis.connections);

    // Identify LLM limitations
    analysis.limitations = identifyLimitations(text, books, analysis.connections);

    return analysis;
}

// Categorize years into periods
function categorizeYears(years) {
    const periods = {
        '1600-1900': 0,
        '1900-1950': 0,
        '1950-1980': 0,
        '1980-2000': 0,
        '2000-2025': 0
    };

    years.forEach(year => {
        if (year < 1900) periods['1600-1900']++;
        else if (year < 1950) periods['1900-1950']++;
        else if (year < 1980) periods['1950-1980']++;
        else if (year < 2000) periods['1980-2000']++;
        else periods['2000-2025']++;
    });

    return periods;
}

// Analyze linguistic patterns
function analyzeLinguisticPatterns(text, books) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};

    words.forEach(word => {
        if (word.length > 3) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

    return {
        wordCount: words.length,
        uniqueWords: Object.keys(wordFreq).length,
        topWords: topWords,
        averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length || 0
    };
}

// Identify LLM enhancements
function identifyEnhancements(text, books, connections) {
    const enhancements = [];

    if (connections.themes.length > 0) {
        enhancements.push({
            title: 'Thematic Pattern Recognition',
            description: `LLMs excel at identifying ${connections.themes.length} thematic connections across selected texts, revealing patterns that might not be immediately apparent to human readers.`
        });
    }

    if (connections.theories.length > 0) {
        enhancements.push({
            title: 'Theoretical Framework Mapping',
            description: `Successfully mapped theoretical frameworks across multiple texts, demonstrating LLMs' ability to recognize scholarly discourse patterns.`
        });
    }

    if (connections.temporal) {
        enhancements.push({
            title: 'Historical Contextualization',
            description: `LLMs can quickly aggregate temporal data spanning ${connections.temporal.timeSpan}, providing instant historical context across a century of Latino women's rhetoric.`
        });
    }

    if (connections.geographic && connections.geographic.length > 1) {
        enhancements.push({
            title: 'Transnational Analysis',
            description: `Identified connections across ${connections.geographic.length} countries, highlighting LLMs' capacity for transnational comparative analysis.`
        });
    }

    enhancements.push({
        title: 'Rapid Synthesis',
        description: 'LLMs can process and synthesize connections across large text corpora in seconds, enabling exploratory research at unprecedented speeds.'
    });

    return enhancements;
}

// Identify LLM limitations
function identifyLimitations(text, books, connections) {
    const limitations = [];

    limitations.push({
        title: 'Cultural Nuance and Context',
        description: 'LLMs may miss culturally-specific rhetorical strategies, particularly those rooted in oral traditions, code-switching, or community-specific language practices prevalent in Latino women\'s rhetoric.'
    });

    limitations.push({
        title: 'Translingual Complexities',
        description: 'While detecting some linguistic patterns, LLMs may struggle with the full complexity of translingual practices, including Spanglish, indigenous language influences, and the political dimensions of language choice.'
    });

    limitations.push({
        title: 'Embodied Knowledge',
        description: 'Texts about the body and embodied experiences may resist computational analysis, as LLMs lack lived experience and may reduce complex embodied rhetoric to surface-level patterns.'
    });

    limitations.push({
        title: 'Rhetorical Listening',
        description: 'True rhetorical listening requires openness to difference and standing under discourse. LLMs process text but cannot engage in the ethical, relational practice of listening across cultural and linguistic differences.'
    });

    if (books.some(book => book.genre === 'poetry')) {
        limitations.push({
            title: 'Poetic and Aesthetic Dimensions',
            description: 'Poetry\'s aesthetic elements—sound, rhythm, silences, and visual arrangement—resist computational analysis, limiting LLM understanding of poetic rhetoric.'
        });
    }

    limitations.push({
        title: 'Historical Trauma and Memory',
        description: 'LLMs may identify themes of trauma but cannot fully comprehend the intergenerational, somatic, and communal dimensions of historical trauma in diasporic and colonized communities.'
    });

    limitations.push({
        title: 'Multimodal Meaning-Making',
        description: 'Many Latino women\'s texts employ multimodal strategies (visual, gestural, spatial) that are lost in text-only computational analysis.'
    });

    return limitations;
}

// Display Analysis Results
function displayAnalysisResults(analysis) {
    // Clear previous results
    const networkViz = document.getElementById('network-visualization');
    visualizationContainer.innerHTML = '';
    analysisText.innerHTML = '';

    // Create network visualization
    createSemanticWebMap(analysis, networkViz);

    // Display connections
    let connectionsHTML = '<h4>Connections Found</h4>';

    if (analysis.connections.themes.length > 0) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Thematic Connections (${analysis.connections.themes.length})</h4>
                <div class="connections">
                    ${analysis.connections.themes.slice(0, 10).map(conn =>
                        `<span class="connection-tag">${conn.theme}: ${conn.book}</span>`
                    ).join('')}
                    ${analysis.connections.themes.length > 10 ?
                        `<span class="connection-tag">+${analysis.connections.themes.length - 10} more</span>` : ''}
                </div>
            </div>
        `;
    }

    if (analysis.connections.theories.length > 0) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Theoretical Frameworks (${analysis.connections.theories.length})</h4>
                <div class="connections">
                    ${analysis.connections.theories.slice(0, 10).map(conn =>
                        `<span class="connection-tag">${conn.theory}: ${conn.book}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    if (analysis.connections.temporal && analysis.connections.temporal.range) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Temporal Analysis</h4>
                <p>Time span: ${analysis.connections.temporal.timeSpan} (${analysis.connections.temporal.range})</p>
                <p>Average year: ${analysis.connections.temporal.average}</p>
            </div>
        `;
    }

    if (analysis.connections.geographic.length > 0) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Geographic Distribution</h4>
                <div class="connections">
                    ${analysis.connections.geographic.map(country =>
                        `<span class="connection-tag">${country}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    if (analysis.connections.genres.length > 0) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Genre Distribution</h4>
                <div class="connections">
                    ${analysis.connections.genres.map(genre =>
                        `<span class="connection-tag">${genre}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    if (analysis.connections.linguistic && analysis.connections.linguistic.wordCount) {
        connectionsHTML += `
            <div class="connection-node">
                <h4>Linguistic Analysis</h4>
                <p>Word count: ${analysis.connections.linguistic.wordCount}</p>
                <p>Unique words: ${analysis.connections.linguistic.uniqueWords}</p>
                <p>Average word length: ${analysis.connections.linguistic.averageWordLength.toFixed(2)}</p>
                <p>Top words: ${analysis.connections.linguistic.topWords.join(', ')}</p>
            </div>
        `;
    }

    visualizationContainer.innerHTML = connectionsHTML;

    // Display enhancements and limitations
    let textHTML = `
        <div class="analysis-section">
            <h4>LLM Enhancements</h4>
            <ul>
                ${analysis.enhancements.map(enhancement =>
                    `<li><strong>${enhancement.title}:</strong> ${enhancement.description}</li>`
                ).join('')}
            </ul>
        </div>
        <div class="analysis-section">
            <h4>LLM Limitations</h4>
            <ul>
                ${analysis.limitations.map(limitation =>
                    `<li><strong>${limitation.title}:</strong> ${limitation.description}</li>`
                ).join('')}
            </ul>
        </div>
        <div class="analysis-section">
            <h4>Books Analyzed</h4>
            <ul>
                ${analysis.books.map(book =>
                    `<li><strong>${book.title}</strong> by ${book.author} (${book.year})</li>`
                ).join('')}
            </ul>
        </div>
    `;

    analysisText.innerHTML = textHTML;
}

// Save to History
function saveToHistory(text, books, analysis) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userText: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        fullText: text,
        books: books.map(b => ({ id: b.id, title: b.title, author: b.author })),
        analysis: analysis
    };

    analysisHistory.unshift(historyItem);

    // Keep only last 50 items
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }

    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    renderHistory();
}

// Load History from Storage
function loadHistoryFromStorage() {
    const stored = localStorage.getItem('analysisHistory');
    if (stored) {
        analysisHistory = JSON.parse(stored);
        renderHistory();
    }
}

// Render History
function renderHistory() {
    if (analysisHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No analysis history yet. Generate your first semantic map!</p>';
        return;
    }

    historyList.innerHTML = analysisHistory.map(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleString();

        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-header">
                    <span class="history-item-date">${formattedDate}</span>
                    <div class="history-item-actions">
                        <button onclick="viewHistoryItem(${item.id})">View</button>
                        <button onclick="deleteHistoryItem(${item.id})">Delete</button>
                    </div>
                </div>
                <p class="history-item-summary">${item.userText}</p>
                <div class="history-item-books">
                    ${item.books.map(book =>
                        `<span class="history-book-tag">${book.title}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// View History Item
function viewHistoryItem(itemId) {
    const item = analysisHistory.find(i => i.id === itemId);
    if (!item) return;

    // Switch to analysis tab
    switchTab('analysis');

    // Load the text
    userText.value = item.fullText;

    // Load the books
    selectedBooksForAnalysis = item.books.map(bookRef =>
        allBooks.find(b => b.id === bookRef.id)
    ).filter(Boolean);

    updateSelectedBooksDisplay();

    // Display the analysis
    displayAnalysisResults(item.analysis);
    analysisResults.classList.add('show');

    showNotification('History item loaded successfully!');
}

// Delete History Item
function deleteHistoryItem(itemId) {
    if (confirm('Are you sure you want to delete this analysis?')) {
        analysisHistory = analysisHistory.filter(i => i.id !== itemId);
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        renderHistory();
        showNotification('Analysis deleted successfully!');
    }
}

// Clear History
function clearHistory() {
    if (confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
        analysisHistory = [];
        localStorage.removeItem('analysisHistory');
        renderHistory();
        showNotification('History cleared successfully!');
    }
}

// Export History
function exportHistory() {
    if (analysisHistory.length === 0) {
        showNotification('No history to export.', 'error');
        return;
    }

    const dataStr = JSON.stringify(analysisHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llm-latino-women-rhetoric-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification('History exported successfully!');
}

// Show Notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== TIMELINE FUNCTIONALITY =====

// Timeline state
let timelineBooks = [];
let currentView = 'vertical';

// Timeline DOM elements
const timelineDisplay = document.getElementById('timeline-display');
const timelineGenreFilter = document.getElementById('timeline-genre-filter');
const timelinePeriodFilter = document.getElementById('timeline-period-filter');
const timelineResetBtn = document.getElementById('timeline-reset');
const viewButtons = document.querySelectorAll('.view-btn');

// Initialize timeline when tab is clicked
function initializeTimeline() {
    if (timelineBooks.length === 0) {
        timelineBooks = [...allBooks].sort((a, b) => a.year - b.year);
        renderTimeline(timelineBooks);
        updateTimelineStats();
    }
}

// Setup timeline event listeners
function setupTimelineListeners() {
    if (timelineGenreFilter) {
        timelineGenreFilter.addEventListener('change', filterTimeline);
    }
    if (timelinePeriodFilter) {
        timelinePeriodFilter.addEventListener('change', filterTimeline);
    }
    if (timelineResetBtn) {
        timelineResetBtn.addEventListener('click', resetTimeline);
    }

    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            toggleView(currentView);
        });
    });
}

// Filter timeline
function filterTimeline() {
    const selectedGenre = timelineGenreFilter.value.toLowerCase();
    const selectedPeriod = timelinePeriodFilter.value;

    let filtered = [...allBooks];

    // Apply genre filter
    if (selectedGenre) {
        filtered = filtered.filter(book => book.genre.toLowerCase() === selectedGenre);
    }

    // Apply period filter
    if (selectedPeriod) {
        const [startYear, endYear] = selectedPeriod.split('-').map(Number);
        filtered = filtered.filter(book => book.year >= startYear && book.year <= endYear);
    }

    // Sort by year
    filtered.sort((a, b) => a.year - b.year);

    timelineBooks = filtered;
    renderTimeline(timelineBooks);
    updateTimelineStats();
}

// Reset timeline
function resetTimeline() {
    timelineGenreFilter.value = '';
    timelinePeriodFilter.value = '';
    timelineBooks = [...allBooks].sort((a, b) => a.year - b.year);
    renderTimeline(timelineBooks);
    updateTimelineStats();
}

// Render timeline
function renderTimeline(books) {
    if (!timelineDisplay) return;

    if (books.length === 0) {
        timelineDisplay.innerHTML = '<p class="empty-state">No books found matching your criteria.</p>';
        return;
    }

    // Group books by period for headers
    const periods = groupBooksByPeriod(books);

    let html = '';

    periods.forEach(period => {
        // Add period header
        if (currentView === 'vertical') {
            html += `<div class="timeline-period-header"><h3>${period.name}</h3></div>`;
        }

        // Add books
        period.books.forEach((book, index) => {
            html += createTimelineBookHTML(book, index);
        });
    });

    timelineDisplay.innerHTML = html;
}

// Group books by period
function groupBooksByPeriod(books) {
    const periods = [
        { name: '1600-1900: Early Period', range: [1600, 1900], books: [] },
        { name: '1900-1950: Modern Era', range: [1900, 1950], books: [] },
        { name: '1950-1980: Civil Rights & Beyond', range: [1950, 1980], books: [] },
        { name: '1980-2000: Contemporary Wave', range: [1980, 2000], books: [] },
        { name: '2000-2025: Current Voices', range: [2000, 2025], books: [] }
    ];

    books.forEach(book => {
        for (let period of periods) {
            if (book.year >= period.range[0] && book.year < period.range[1]) {
                period.books.push(book);
                break;
            }
        }
    });

    return periods.filter(p => p.books.length > 0);
}

// Create timeline book HTML
function createTimelineBookHTML(book, index) {
    const genreColors = {
        'poetry': '9F7AEA',
        'history': 'F59E0B',
        'biography': '10B981',
        'autobiography': 'EF4444',
        'diaspora': '3B82F6',
        'the body': 'EC4899'
    };

    const color = genreColors[book.genre] || '6B7280';

    // Create search link for the book
    const searchQuery = encodeURIComponent(`"${book.title}" ${book.author}`);
    const bookLink = book.link || `https://www.google.com/search?q=${searchQuery}`;

    return `
        <div class="timeline-item">
            <span class="timeline-year-marker">${book.year}</span>
            <div class="timeline-book">
                <div class="timeline-book-cover" style="background: linear-gradient(135deg, #${color} 0%, #${color}CC 100%);">
                    <img src="${book.coverImage}" alt="${book.title}" onerror="this.style.display='none'" />
                </div>
                <div class="timeline-book-content">
                    <div class="timeline-book-year">${book.year}</div>
                    <h4 class="timeline-book-title"><a href="${bookLink}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-color); text-decoration: none;">${book.title}</a></h4>
                    <p class="timeline-book-author">${book.author}</p>
                    <div class="timeline-book-meta">
                        <span class="timeline-book-meta-item">🌍 ${book.country}</span>
                    </div>
                    <span class="timeline-book-genre">${book.genre}</span>
                    <div class="timeline-book-themes">
                        ${book.themes.slice(0, 3).map(theme =>
                            `<span class="timeline-book-theme">${theme}</span>`
                        ).join('')}
                        ${book.themes.length > 3 ?
                            `<span class="timeline-book-theme">+${book.themes.length - 3} more</span>` : ''}
                    </div>
                    <p class="timeline-book-abstract">${book.abstract}</p>
                </div>
            </div>
        </div>
    `;
}

// Toggle view
function toggleView(view) {
    if (!timelineDisplay) return;

    timelineDisplay.classList.remove('vertical-view', 'grid-view');
    timelineDisplay.classList.add(`${view}-view`);
}

// Update timeline stats
function updateTimelineStats() {
    const totalBooks = timelineBooks.length;
    const years = timelineBooks.map(b => b.year);
    const yearsSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0;
    const countries = new Set(timelineBooks.map(b => b.country)).size;
    const genres = new Set(timelineBooks.map(b => b.genre)).size;

    document.getElementById('timeline-total').textContent = totalBooks;
    document.getElementById('timeline-years').textContent = yearsSpan;
    document.getElementById('timeline-countries').textContent = countries + '+';
    document.getElementById('timeline-genres').textContent = genres;
}

// Initialize timeline listeners
setupTimelineListeners();

// Modify switchTab function to initialize timeline
const originalSwitchTab = switchTab;
window.switchTab = function(tabName) {
    originalSwitchTab(tabName);
    if (tabName === 'timeline') {
        initializeTimeline();
    }
};

// ===== TRANSLATION FUNCTIONALITY =====

// Translation state
let translationService = null;
let currentSourceLang = 'auto';
let currentTranslation = '';
let isSideBySideView = false;

// Translation DOM elements
const sourceLanguageSelect = document.getElementById('source-language');
const translateBtn = document.getElementById('translate-btn');
const toggleTranslationViewBtn = document.getElementById('toggle-translation-view');
const textInputContainer = document.getElementById('text-input-container');
const translatedTextArea = document.getElementById('translated-text');
const translationAnalysisDiv = document.getElementById('translation-analysis');
const grammarAnalysisList = document.getElementById('grammar-analysis');
const structureAnalysisList = document.getElementById('structure-analysis');
const meaningAnalysisList = document.getElementById('meaning-analysis');
const qualityScoreBadge = document.getElementById('quality-score');
const originalLangLabel = document.getElementById('original-lang-label');
const charCount = document.getElementById('char-count');
const translationStatus = document.getElementById('translation-status');

// Initialize translation service
function initializeTranslation() {
    translationService = new TranslationService();
    populateLanguageDropdown();
    setupTranslationListeners();
}

// Populate language dropdown with 200+ languages
function populateLanguageDropdown() {
    const languages = TranslationService.getAllLanguages();

    // Add auto-detect option
    const autoOption = document.createElement('option');
    autoOption.value = 'auto';
    autoOption.textContent = 'Auto-Detect';
    sourceLanguageSelect.appendChild(autoOption);

    // Add separator
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    sourceLanguageSelect.appendChild(separator);

    // Add all languages
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        sourceLanguageSelect.appendChild(option);
    });
}

// Setup translation event listeners
function setupTranslationListeners() {
    // Translate button
    if (translateBtn) {
        translateBtn.addEventListener('click', handleTranslation);
    }

    // Toggle view button
    if (toggleTranslationViewBtn) {
        toggleTranslationViewBtn.addEventListener('click', toggleTranslationView);
    }

    // Source language change
    if (sourceLanguageSelect) {
        sourceLanguageSelect.addEventListener('change', (e) => {
            currentSourceLang = e.target.value;
            updateOriginalLangLabel();
        });
    }

    // Character count
    if (userText) {
        userText.addEventListener('input', updateCharCount);
    }
}

// Handle translation
async function handleTranslation() {
    const text = userText.value.trim();

    if (!text) {
        showNotification('Please enter some text to translate.', 'error');
        return;
    }

    // Disable button and show loading
    translateBtn.disabled = true;
    translateBtn.textContent = '🔄 Translating...';
    translationStatus.textContent = 'Translating...';
    translationStatus.className = 'translating';

    try {
        let sourceLang = currentSourceLang;

        // Auto-detect language if needed
        if (sourceLang === 'auto') {
            translationStatus.textContent = 'Detecting language...';
            sourceLang = await translationService.detectLanguage(text);
            currentSourceLang = sourceLang;
            sourceLanguageSelect.value = sourceLang;
            updateOriginalLangLabel();
        }

        // Translate to English
        translationStatus.textContent = 'Translating to English...';
        const result = await translationService.translate(text, sourceLang, 'en');

        if (result.error) {
            throw new Error(result.error);
        }

        currentTranslation = result.translation;
        translatedTextArea.value = currentTranslation;

        // Analyze translation
        const analysis = translationService.analyzeTranslation(text, currentTranslation, sourceLang, 'en');
        displayTranslationAnalysis(analysis);

        // Show success
        translationStatus.textContent = '✓ Translated';
        translationStatus.className = 'success';

        // Auto-enable side-by-side view if not already
        if (!isSideBySideView) {
            toggleTranslationView();
        }

        showNotification('Translation completed successfully!');

    } catch (error) {
        console.error('Translation error:', error);
        translationStatus.textContent = '✗ Translation failed';
        translationStatus.className = 'error';
        showNotification('Translation failed: ' + error.message, 'error');
    } finally {
        translateBtn.disabled = false;
        translateBtn.textContent = '🌐 Translate to English';
    }
}

// Toggle translation view
function toggleTranslationView() {
    isSideBySideView = !isSideBySideView;

    if (isSideBySideView) {
        textInputContainer.classList.remove('single-view');
        textInputContainer.classList.add('side-by-side-view');
        toggleTranslationViewBtn.textContent = '⬅️ Single View';
    } else {
        textInputContainer.classList.remove('side-by-side-view');
        textInputContainer.classList.add('single-view');
        toggleTranslationViewBtn.textContent = '↔️ Toggle Side-by-Side';
    }
}

// Display translation analysis
function displayTranslationAnalysis(analysis) {
    // Clear previous analysis
    grammarAnalysisList.innerHTML = '';
    structureAnalysisList.innerHTML = '';
    meaningAnalysisList.innerHTML = '';

    // Add grammar points
    analysis.grammar.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        grammarAnalysisList.appendChild(li);
    });

    // Add structure points
    analysis.structure.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        structureAnalysisList.appendChild(li);
    });

    // Add meaning points
    analysis.meaning.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        meaningAnalysisList.appendChild(li);
    });

    // Set quality score
    qualityScoreBadge.textContent = analysis.quality;
    qualityScoreBadge.className = `quality-badge ${analysis.quality}`;

    // Show analysis section
    translationAnalysisDiv.style.display = 'block';
}

// Update original language label
function updateOriginalLangLabel() {
    if (currentSourceLang === 'auto') {
        originalLangLabel.textContent = 'Original Text (Auto-Detect)';
    } else {
        const langName = TranslationService.getLanguageName(currentSourceLang);
        originalLangLabel.textContent = `Original Text (${langName})`;
    }

    // Apply RTL or CJK styles if needed
    const textBoxWrapper = document.querySelector('.text-box-wrapper');
    const rtlLanguages = ['ar', 'iw', 'fa', 'ur'];
    const cjkLanguages = ['zh-CN', 'zh-TW', 'ja', 'ko'];

    textBoxWrapper.classList.remove('rtl', 'cjk');

    if (rtlLanguages.includes(currentSourceLang)) {
        textBoxWrapper.classList.add('rtl');
    } else if (cjkLanguages.includes(currentSourceLang)) {
        textBoxWrapper.classList.add('cjk');
    }
}

// Update character count
function updateCharCount() {
    const count = userText.value.length;
    charCount.textContent = `${count} characters`;

    // Clear translation if text changed significantly
    if (currentTranslation && Math.abs(count - currentTranslation.length) > 100) {
        translatedTextArea.value = '';
        translationStatus.textContent = '';
        translationAnalysisDiv.style.display = 'none';
    }
}

// Initialize translation when document loads
if (typeof TranslationService !== 'undefined') {
    initializeTranslation();
}

// ===== ACCESSIBILITY FUNCTIONALITY =====

// Accessibility state
let isHighContrast = false;
let fontSizeLevel = 0; // 0 = normal, 1 = large, 2 = larger, 3 = largest
let isTTSEnabled = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Accessibility DOM elements
const highContrastToggle = document.getElementById('high-contrast-toggle');
const fontSizeIncrease = document.getElementById('font-size-increase');
const fontSizeDecrease = document.getElementById('font-size-decrease');
const ttsToggle = document.getElementById('text-to-speech-toggle');
const ttsLabel = document.getElementById('tts-label');
const resetAccessibility = document.getElementById('reset-accessibility');
const closeIntroBtn = document.getElementById('close-intro');
const introductionSection = document.getElementById('introduction');

// Initialize accessibility features
function initializeAccessibility() {
    // Load saved preferences
    loadAccessibilityPreferences();

    // Setup event listeners
    if (highContrastToggle) {
        highContrastToggle.addEventListener('click', toggleHighContrast);
    }

    if (fontSizeIncrease) {
        fontSizeIncrease.addEventListener('click', increaseFontSize);
    }

    if (fontSizeDecrease) {
        fontSizeDecrease.addEventListener('click', decreaseFontSize);
    }

    if (ttsToggle) {
        ttsToggle.addEventListener('click', toggleTextToSpeech);
    }

    if (resetAccessibility) {
        resetAccessibility.addEventListener('click', resetAccessibilitySettings);
    }

    if (closeIntroBtn) {
        closeIntroBtn.addEventListener('click', closeIntroduction);
    }

    // Setup tab guide item listeners
    const tabGuideItems = document.querySelectorAll('.tab-guide-item');
    tabGuideItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            if (tabName) {
                closeIntroduction();
                switchTab(tabName);
            }
        });
    });

    // Check if intro was already closed
    const introClosed = localStorage.getItem('introClosed');
    if (introClosed === 'true') {
        introductionSection.classList.add('hidden');
    }
}

// Toggle high contrast mode
function toggleHighContrast() {
    isHighContrast = !isHighContrast;
    document.body.classList.toggle('high-contrast', isHighContrast);
    highContrastToggle.classList.toggle('active', isHighContrast);

    // Save preference
    localStorage.setItem('highContrast', isHighContrast);

    // Announce change
    const message = isHighContrast ?
        'High contrast mode enabled. Black background with white text.' :
        'High contrast mode disabled. Normal colors restored.';
    announceToScreenReader(message);
}

// Increase font size
function increaseFontSize() {
    if (fontSizeLevel < 3) {
        // Remove current font size class
        document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest');

        fontSizeLevel++;

        // Add new font size class
        if (fontSizeLevel === 1) {
            document.body.classList.add('font-size-large');
        } else if (fontSizeLevel === 2) {
            document.body.classList.add('font-size-larger');
        } else if (fontSizeLevel === 3) {
            document.body.classList.add('font-size-largest');
        }

        // Save preference
        localStorage.setItem('fontSizeLevel', fontSizeLevel);

        announceToScreenReader(`Font size increased to level ${fontSizeLevel}`);
    } else {
        announceToScreenReader('Maximum font size reached');
    }
}

// Decrease font size
function decreaseFontSize() {
    if (fontSizeLevel > 0) {
        // Remove current font size class
        document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest');

        fontSizeLevel--;

        // Add new font size class
        if (fontSizeLevel === 1) {
            document.body.classList.add('font-size-large');
        } else if (fontSizeLevel === 2) {
            document.body.classList.add('font-size-larger');
        }

        // Save preference
        localStorage.setItem('fontSizeLevel', fontSizeLevel);

        const message = fontSizeLevel === 0 ?
            'Font size reset to normal' :
            `Font size decreased to level ${fontSizeLevel}`;
        announceToScreenReader(message);
    } else {
        announceToScreenReader('Minimum font size reached');
    }
}

// Toggle text-to-speech
function toggleTextToSpeech() {
    isTTSEnabled = !isTTSEnabled;
    ttsToggle.classList.toggle('active', isTTSEnabled);

    if (isTTSEnabled) {
        ttsLabel.textContent = 'Disable Reading';
        announceToScreenReader('Text-to-speech enabled. Click any paragraph, heading, or text element to have it read aloud.');
        setupTextToSpeechListeners();
    } else {
        ttsLabel.textContent = 'Enable Reading';
        announceToScreenReader('Text-to-speech disabled.');
        removeTextToSpeechListeners();
        stopSpeaking();
    }

    // Save preference
    localStorage.setItem('ttsEnabled', isTTSEnabled);
}

// Setup text-to-speech listeners
function setupTextToSpeechListeners() {
    document.body.addEventListener('click', handleTextToSpeechClick);
}

// Remove text-to-speech listeners
function removeTextToSpeechListeners() {
    document.body.removeEventListener('click', handleTextToSpeechClick);
}

// Handle text-to-speech click
function handleTextToSpeechClick(e) {
    if (!isTTSEnabled) return;

    // Get the clicked element
    let element = e.target;

    // Find the nearest readable element (p, h1-h6, li, span, div with text)
    while (element && element !== document.body) {
        const tagName = element.tagName.toLowerCase();
        const readableTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'div', 'label', 'button', 'a'];

        if (readableTags.includes(tagName) && element.textContent.trim()) {
            const text = element.textContent.trim();

            // Don't read if it's a button click we want to handle normally
            if (tagName === 'button' && !element.classList.contains('accessibility-btn')) {
                return;
            }

            // Read the text
            speakText(text, element);
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        element = element.parentElement;
    }
}

// Speak text
function speakText(text, element) {
    // Stop any current speech
    stopSpeaking();

    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Configure utterance
    currentUtterance.rate = 0.9; // Slightly slower for clarity
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;

    // Highlight element while speaking
    if (element) {
        element.classList.add('tts-reading');

        currentUtterance.onend = () => {
            element.classList.remove('tts-reading');
            currentUtterance = null;
        };

        currentUtterance.onerror = () => {
            element.classList.remove('tts-reading');
            currentUtterance = null;
        };
    }

    // Speak
    speechSynthesis.speak(currentUtterance);
}

// Stop speaking
function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    // Remove all reading highlights
    document.querySelectorAll('.tts-reading').forEach(el => {
        el.classList.remove('tts-reading');
    });

    currentUtterance = null;
}

// Reset all accessibility settings
function resetAccessibilitySettings() {
    // Reset high contrast
    if (isHighContrast) {
        toggleHighContrast();
    }

    // Reset font size
    while (fontSizeLevel > 0) {
        decreaseFontSize();
    }

    // Disable TTS if enabled
    if (isTTSEnabled) {
        toggleTextToSpeech();
    }

    // Clear local storage
    localStorage.removeItem('highContrast');
    localStorage.removeItem('fontSizeLevel');
    localStorage.removeItem('ttsEnabled');

    announceToScreenReader('All accessibility settings reset to default');
    showNotification('Accessibility settings reset to default');
}

// Load accessibility preferences from localStorage
function loadAccessibilityPreferences() {
    // Load high contrast
    const savedHighContrast = localStorage.getItem('highContrast');
    if (savedHighContrast === 'true') {
        isHighContrast = true;
        document.body.classList.add('high-contrast');
        highContrastToggle.classList.add('active');
    }

    // Load font size
    const savedFontSize = localStorage.getItem('fontSizeLevel');
    if (savedFontSize) {
        fontSizeLevel = parseInt(savedFontSize);

        if (fontSizeLevel === 1) {
            document.body.classList.add('font-size-large');
        } else if (fontSizeLevel === 2) {
            document.body.classList.add('font-size-larger');
        } else if (fontSizeLevel === 3) {
            document.body.classList.add('font-size-largest');
        }
    }

    // Load TTS preference (but don't auto-enable)
    const savedTTS = localStorage.getItem('ttsEnabled');
    if (savedTTS === 'true') {
        // Show as previously enabled but don't activate automatically
        // User needs to click to reactivate
    }
}

// Close introduction
function closeIntroduction() {
    introductionSection.classList.add('hidden');
    localStorage.setItem('introClosed', 'true');
    announceToScreenReader('Introduction closed. Now viewing book library.');
}

// Announce to screen reader (uses aria-live region)
function announceToScreenReader(message) {
    // Create or use existing announcement region
    let announcer = document.getElementById('screen-reader-announcer');

    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
    }

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
        announcer.textContent = message;
    }, 100);
}

// Initialize accessibility on page load
initializeAccessibility();

// ===== SEMANTIC WEB MAP VISUALIZATION =====

function createSemanticWebMap(analysis, container) {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const width = container.clientWidth || 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    container.innerHTML = '';
    container.appendChild(canvas);

    // Create nodes for visualization
    const nodes = [];

    // Central node - user's text
    nodes.push({
        id: 'user-text',
        label: 'Your Text',
        x: width / 2,
        y: height / 2,
        radius: 30,
        color: '#6B46C1',
        type: 'center'
    });

    // Add book nodes
    const bookCount = analysis.books.length;
    const angleStep = (2 * Math.PI) / bookCount;
    const bookRadius = Math.min(width, height) * 0.3;

    analysis.books.forEach((book, i) => {
        const angle = i * angleStep;
        const x = width / 2 + Math.cos(angle) * bookRadius;
        const y = height / 2 + Math.sin(angle) * bookRadius;

        nodes.push({
            id: `book-${book.id}`,
            label: book.title.length > 30 ? book.title.substring(0, 27) + '...' : book.title,
            author: book.author,
            year: book.year,
            x: x,
            y: y,
            radius: 20,
            color: '#D946A6',
            type: 'book'
        });
    });

    // Add theme nodes
    const themes = new Set();
    analysis.connections.themes.forEach(conn => themes.add(conn.theme));
    const themeArray = Array.from(themes).slice(0, 8); // Limit to 8 themes
    const themeAngleStep = (2 * Math.PI) / themeArray.length;
    const themeRadius = Math.min(width, height) * 0.42;

    themeArray.forEach((theme, i) => {
        const angle = i * themeAngleStep + Math.PI / 4;
        const x = width / 2 + Math.cos(angle) * themeRadius;
        const y = height / 2 + Math.sin(angle) * themeRadius;

        nodes.push({
            id: `theme-${theme}`,
            label: theme,
            x: x,
            y: y,
            radius: 15,
            color: '#F59E0B',
            type: 'theme'
        });
    });

    // Create connections (edges)
    const edges = [];

    // Connect user text to all books
    analysis.books.forEach(book => {
        edges.push({
            from: 'user-text',
            to: `book-${book.id}`,
            strength: 1,
            color: 'rgba(107, 70, 193, 0.3)'
        });
    });

    // Connect books to themes
    analysis.connections.themes.forEach(conn => {
        edges.push({
            from: `book-${analysis.books.find(b => b.title === conn.book)?.id}`,
            to: `theme-${conn.theme}`,
            strength: 0.5,
            color: 'rgba(245, 158, 11, 0.2)'
        });
    });

    // Animation variables
    let animationFrame = 0;
    let hoveredNode = null;

    // Mouse interaction
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        hoveredNode = null;
        for (const node of nodes) {
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < node.radius) {
                hoveredNode = node;
                canvas.style.cursor = 'pointer';
                break;
            }
        }

        if (!hoveredNode) {
            canvas.style.cursor = 'default';
        }

        draw();
    });

    // Draw function
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw edges
        edges.forEach(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);

            if (fromNode && toNode) {
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.strokeStyle = edge.color;
                ctx.lineWidth = edge.strength * 2;
                ctx.stroke();
            }
        });

        // Draw nodes
        nodes.forEach(node => {
            const isHovered = hoveredNode === node;

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + (isHovered ? 5 : 0), 0, 2 * Math.PI);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Add glow for hovered node
            if (isHovered) {
                ctx.strokeStyle = node.color;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Draw border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            ctx.fillStyle = '#1F2937';
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (node.type === 'center') {
                ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillStyle = '#FFFFFF';
            }

            // Wrap text for long labels
            const maxWidth = node.radius * 2.5;
            const words = node.label.split(' ');
            let line = '';
            let yOffset = 0;

            if (words.length === 1 || node.label.length < 20) {
                ctx.fillText(node.label, node.x, node.y + node.radius + 15);
            } else {
                words.forEach((word, i) => {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && i > 0) {
                        ctx.fillText(line, node.x, node.y + node.radius + 15 + yOffset);
                        line = word + ' ';
                        yOffset += 15;
                    } else {
                        line = testLine;
                    }
                });
                ctx.fillText(line, node.x, node.y + node.radius + 15 + yOffset);
            }

            // Show additional info on hover
            if (isHovered && node.type === 'book') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(node.x - 100, node.y - 60, 200, 50);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillText(node.label, node.x, node.y - 45);
                ctx.fillText(node.author, node.x, node.y - 30);
                ctx.fillText(`Year: ${node.year}`, node.x, node.y - 15);
            }
        });

        // Add legend
        drawLegend(ctx, width, height);
    }

    // Draw legend
    function drawLegend(ctx, width, height) {
        const legendX = 20;
        const legendY = height - 80;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 10, 150, 70);
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 10, 150, 70);

        // Legend items
        const legendItems = [
            { color: '#6B46C1', label: 'Your Text' },
            { color: '#D946A6', label: 'Books' },
            { color: '#F59E0B', label: 'Themes' }
        ];

        legendItems.forEach((item, i) => {
            ctx.beginPath();
            ctx.arc(legendX + 10, legendY + i * 20, 6, 0, 2 * Math.PI);
            ctx.fillStyle = item.color;
            ctx.fill();

            ctx.fillStyle = '#1F2937';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 25, legendY + i * 20 + 4);
        });
    }

    // Initial draw
    draw();

    // Animate connections
    function animate() {
        animationFrame++;
        if (animationFrame % 60 === 0) { // Subtle animation every second
            draw();
        }
        requestAnimationFrame(animate);
    }

    // Don't start animation to keep it simple and performant
    // animate();
}

// ===== AUTO-ANALYSIS FUNCTIONALITY =====

let autoAnalysisTimeout = null;

function autoGenerateAnalysis() {
    // Clear any pending auto-analysis
    if (autoAnalysisTimeout) {
        clearTimeout(autoAnalysisTimeout);
    }

    // Only auto-generate if we have text and selected books
    const text = userText.value.trim();
    if (!text || selectedBooksForAnalysis.length === 0) {
        return;
    }

    // Show notification that analysis is being prepared
    showAutoAnalysisNotification();

    // Debounce the analysis generation
    autoAnalysisTimeout = setTimeout(() => {
        // Get selected analysis options
        const options = {
            themes: document.getElementById('theme-analysis').checked,
            theory: document.getElementById('theory-analysis').checked,
            temporal: document.getElementById('temporal-analysis').checked,
            geographic: document.getElementById('geographic-analysis').checked,
            genre: document.getElementById('genre-analysis').checked,
            linguistic: document.getElementById('linguistic-analysis').checked
        };

        // Perform analysis
        const analysis = performSemanticAnalysis(text, selectedBooksForAnalysis, options);

        // Display results
        displayAnalysisResults(analysis);

        // Save to history
        saveToHistory(text, selectedBooksForAnalysis, analysis);

        // Show results section
        analysisResults.classList.add('show');

        // Show completion notification
        showNotification('📊 Semantic analysis automatically generated!', 'success');

        // Scroll to results
        analysisResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1500); // Wait 1.5 seconds after last selection
}

function showAutoAnalysisNotification() {
    const notification = document.createElement('div');
    notification.className = 'auto-analysis-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🔄</span>
            <span class="notification-text">Preparing semantic analysis...</span>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6B46C1 0%, #D946A6 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInUp 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 1200);
}

// Add animation styles for auto-analysis notification
const autoAnalysisStyle = document.createElement('style');
autoAnalysisStyle.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .auto-analysis-notification .notification-icon {
        font-size: 1.25rem;
        animation: rotate 1s linear infinite;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .notification-text {
        font-weight: 600;
        font-size: 0.95rem;
    }
`;
document.head.appendChild(autoAnalysisStyle);
