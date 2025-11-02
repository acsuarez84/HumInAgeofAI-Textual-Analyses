# LLM & Latino Women Rhetoric Tracker

A comprehensive tracking website exploring the enhancements and limitations of Large Language Models (LLMs) in analyzing Latino women's rhetoric through textual analysis of 100 works spanning a century.

## 🌟 Overview

This interactive web application provides a platform for exploring connections between user-generated texts and a curated collection of 100 books by Latino women authors across multiple genres and theoretical frameworks. The tool demonstrates both the powerful capabilities and inherent limitations of LLM-based textual analysis.

## 📚 Features

### Book Library
- **100 Curated Works**: Spanning 1689-2025, representing a century of Latino women's rhetoric
- **Multiple Genres**: Poetry, History, Biography, Autobiography, Diaspora, The Body
- **Theoretical Frameworks**: Grammar, Culture, Rhetorical Listening, Multiliteracies, Multimodalities, Media, Transfer, Translingualism, Transliteration
- **Advanced Filtering**: Search by title, author, theme, genre, theory, and time period
- **Rich Metadata**: Each book includes author, country of origin, themes, connecting theories, and abstract

### Text Analysis
- **User Input**: Enter your original writing, excerpts, or abstracts
- **Book Selection**: Choose multiple books for comparative analysis
- **Customizable Parameters**: Select specific analysis dimensions (thematic, theoretical, temporal, geographic, genre, linguistic)
- **Semantic Mapping**: Generate visual connections between your text and selected works

### Analysis Capabilities
- **Thematic Pattern Recognition**: Identifies shared themes across texts
- **Theoretical Framework Mapping**: Maps scholarly discourse patterns
- **Historical Contextualization**: Provides temporal context across centuries
- **Transnational Analysis**: Explores geographic and cultural connections
- **Linguistic Analysis**: Basic word frequency and pattern detection

### LLM Enhancement & Limitation Tracking
- **Enhancements**: Highlights areas where LLMs excel (rapid synthesis, pattern recognition, cross-referencing)
- **Limitations**: Identifies critical gaps (cultural nuance, embodied knowledge, translingual complexities, rhetorical listening)

### History & Storage
- **Local Storage**: All data stored in browser (privacy-focused, no external servers)
- **Analysis History**: Save and retrieve up to 50 previous analyses
- **Export Functionality**: Download analysis history as JSON
- **Draft Saving**: Automatically save and restore text drafts

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/acsuarez84/HumInAgeofAI-Textual-Analyses.git
   cd HumInAgeofAI-Textual-Analyses
   ```

2. **Open locally**:
   - Simply open `index.html` in a modern web browser
   - No build process or dependencies required

3. **Or use a local server** (recommended):
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (with http-server installed)
   npx http-server
   ```
   Then navigate to `http://localhost:8000`

### GitHub Pages Deployment

This site is optimized for GitHub Pages deployment:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select source branch (usually `main`)
   - Select root folder (`/`)
   - Save

2. **Access your site**:
   - Your site will be available at: `https://acsuarez84.github.io/HumInAgeofAI-Textual-Analyses/`

## 📖 How to Use

### 1. Explore the Library
- Browse 100 books using the search and filter tools
- Filter by genre (poetry, history, biography, etc.)
- Filter by theoretical framework (translingualism, culture, etc.)
- Filter by time period (1600-2025)

### 2. Analyze Your Text
- Navigate to the "Text Analysis" tab
- Enter your original writing, excerpts, or abstracts
- Search and select books for comparison
- Choose analysis parameters
- Click "Generate Semantic Map"

### 3. Review Results
- Explore thematic connections
- Review theoretical framework mappings
- Examine temporal and geographic contexts
- Understand LLM enhancements and limitations

### 4. Track Your Work
- View analysis history in the "Analysis History" tab
- Reload previous analyses
- Export history for external analysis
- Save text drafts for later use

## 🎯 Educational Applications

This tool is designed for:
- **Researchers**: Exploring Latino women's rhetoric across time and space
- **Students**: Learning about theoretical frameworks and literary analysis
- **Educators**: Teaching digital humanities and computational text analysis
- **Writers**: Finding connections between their work and established literature
- **Critical AI Studies**: Examining LLM capabilities and limitations in cultural analysis

## 🔍 Understanding LLM Enhancements

The tool demonstrates areas where LLMs excel:
- **Rapid Pattern Recognition**: Instant identification of themes across multiple texts
- **Cross-Referencing**: Connecting your text to relevant works from the corpus
- **Aggregation**: Quick synthesis of temporal, geographic, and theoretical data
- **Scalability**: Analyzing connections across 100 works in seconds

## ⚠️ Understanding LLM Limitations

The tool highlights critical limitations:
- **Cultural Nuance**: Missing culturally-specific rhetorical strategies and oral traditions
- **Translingual Complexity**: Struggling with code-switching, Spanglish, and language politics
- **Embodied Knowledge**: Cannot process lived experience or somatic knowledge
- **Rhetorical Listening**: Lacks capacity for ethical, relational listening across difference
- **Poetic Dimensions**: Missing aesthetic elements like sound, rhythm, and visual arrangement
- **Historical Trauma**: Cannot comprehend intergenerational and communal trauma
- **Multimodality**: Lost visual, gestural, and spatial meaning-making strategies

## 🗂️ Project Structure

```
HumInAgeofAI-Textual-Analyses/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── books.json          # Book database (100 entries)
├── README.md           # This file
└── .gitignore          # Git ignore rules
```

## 📊 Data Structure

Each book entry contains:
```json
{
  "id": 1,
  "title": "Book Title",
  "author": "Author Name",
  "year": 1987,
  "country": "Country of Origin",
  "genre": "genre",
  "themes": ["theme1", "theme2"],
  "connectingTheory": ["theory1", "theory2"],
  "abstract": "Brief description..."
}
```

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or build tools required
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: All data persists in browser
- **GitHub Pages Optimized**: Zero configuration deployment
- **Accessibility**: Semantic HTML and keyboard navigation
- **Performance**: Optimized for fast loading and smooth interactions

## 🎨 Design Philosophy

- **Clean & Modern**: Minimalist interface focusing on content
- **Accessible**: Clear typography and color contrast
- **Responsive**: Adapts to all screen sizes
- **User-Friendly**: Intuitive navigation and clear instructions

## 🔒 Privacy & Data

- **100% Local**: No data sent to external servers
- **No Tracking**: No analytics or user tracking
- **Browser Storage**: Uses localStorage API for persistence
- **No Account Required**: Fully functional without registration

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution
- Adding more books to the database
- Improving analysis algorithms
- Enhancing visualizations
- Adding multilingual support
- Improving accessibility features

## 📝 License

This project is open source and available for educational and research purposes.

## 🙏 Acknowledgments

This project builds on the rich tradition of Latino women's rhetoric and the theoretical frameworks of:
- Gloria Anzaldúa (Borderlands theory)
- Cherríe Moraga (Chicana feminism)
- Krista Ratcliffe (Rhetorical listening)
- New London Group (Multiliteracies)
- Suresh Canagarajah (Translingualism)
- And many others who have shaped our understanding of rhetoric, language, and culture

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

## 🌐 Live Demo

Visit the live demo: [https://acsuarez84.github.io/HumInAgeofAI-Textual-Analyses/](https://acsuarez84.github.io/HumInAgeofAI-Textual-Analyses/)

---

**Built with dedication to exploring the intersections of technology, rhetoric, and Latino women's voices across time and space.**
