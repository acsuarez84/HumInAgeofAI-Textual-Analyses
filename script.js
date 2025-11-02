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

    booksGrid.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}">
            <h3>${book.title}</h3>
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
    `).join('');
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
    visualizationContainer.innerHTML = '';
    analysisText.innerHTML = '';

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

    return `
        <div class="timeline-item">
            <span class="timeline-year-marker">${book.year}</span>
            <div class="timeline-book">
                <div class="timeline-book-cover" style="background: linear-gradient(135deg, #${color} 0%, #${color}CC 100%);">
                    <img src="${book.coverImage}" alt="${book.title}" onerror="this.style.display='none'" />
                </div>
                <div class="timeline-book-content">
                    <div class="timeline-book-year">${book.year}</div>
                    <h4 class="timeline-book-title">${book.title}</h4>
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
