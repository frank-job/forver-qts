import './style.css'

// Initial database of curated, high-quality quotes
const DEFAULT_QUOTES = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Inspiration",
    gradient: "from-blue-600 via-indigo-600 to-purple-600"
  },
  {
    id: 2,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Wisdom",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600"
  },
  {
    id: 3,
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "Philosophy",
    gradient: "from-rose-500 via-pink-600 to-indigo-600"
  },
  {
    id: 4,
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "Wisdom",
    gradient: "from-amber-500 via-orange-600 to-red-600"
  },
  {
    id: 5,
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    category: "Tech",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600"
  },
  {
    id: 6,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success",
    gradient: "from-violet-600 via-purple-600 to-pink-600"
  },
  {
    id: 7,
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "Philosophy",
    gradient: "from-slate-700 via-slate-600 to-slate-800"
  },
  {
    id: 8,
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "Inspiration",
    gradient: "from-green-500 via-emerald-600 to-teal-700"
  },
  {
    id: 9,
    text: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
    category: "Tech",
    gradient: "from-teal-400 via-emerald-500 to-cyan-500"
  },
  {
    id: 10,
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "Inspiration",
    gradient: "from-fuchsia-500 via-purple-600 to-indigo-700"
  },
  {
    id: 11,
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
    category: "Success",
    gradient: "from-red-500 via-rose-600 to-purple-600"
  },
  {
    id: 12,
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Philosophy",
    gradient: "from-indigo-500 via-blue-600 to-cyan-500"
  }
];

// Available categories for filtering
const CATEGORIES = ["All", "Inspiration", "Wisdom", "Philosophy", "Tech", "Success"];

// Predefined gradient choices for custom quotes
const GRADIENTS = [
  { name: "Nebula", class: "from-purple-600 via-indigo-600 to-blue-600" },
  { name: "Sunset Glow", class: "from-rose-500 via-pink-600 to-orange-500" },
  { name: "Forest Mint", class: "from-emerald-500 via-teal-600 to-cyan-600" },
  { name: "Golden Aura", class: "from-amber-400 via-orange-500 to-rose-600" },
  { name: "Midnight Teal", class: "from-slate-800 via-cyan-950 to-blue-900" },
  { name: "Cosmic Pink", class: "from-fuchsia-600 via-pink-600 to-violet-600" }
];

// State variables
let quotes = [];
let favorites = [];
let activeTab = "single"; // "single" | "browse" | "favorites"
let selectedCategory = "All";
let searchQuery = "";
let currentQuoteIndex = 0;
let isPlaying = false;
let playInterval = null;
const AUTOPLAY_DURATION = 6000; // 6 seconds per quote
let progressWidth = 0;
let progressInterval = null;
let speechUtterance = null;
let isSpeaking = false;

// Initialize app data from localStorage or defaults
function initData() {
  const localQuotes = localStorage.getItem("forever_quotes");
  if (localQuotes) {
    quotes = JSON.parse(localQuotes);
  } else {
    quotes = [...DEFAULT_QUOTES];
    localStorage.setItem("forever_quotes", JSON.stringify(quotes));
  }

  const localFavorites = localStorage.getItem("forever_favorites");
  if (localFavorites) {
    favorites = JSON.parse(localFavorites);
  } else {
    favorites = [];
  }
}

// Save state helpers
function saveQuotes() {
  localStorage.setItem("forever_quotes", JSON.stringify(quotes));
}

function saveFavorites() {
  localStorage.setItem("forever_favorites", JSON.stringify(favorites));
}

// Render entire application interface
function render() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <!-- HEADER / NAVIGATION -->
    <header class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Logo -->
        <div class="flex items-center space-x-3 cursor-pointer" id="logo-btn">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Forever Quotes
            </h1>
            <p class="text-xs text-slate-500 font-medium tracking-wider uppercase">Treasury of Wisdom</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex items-center bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl">
          <button id="tab-single" class="px-4 py-2 text-sm font-medium rounded-lg btn-interactive transition-all duration-200 ${activeTab === 'single' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:text-slate-200'}">
            Spotlight
          </button>
          <button id="tab-browse" class="px-4 py-2 text-sm font-medium rounded-lg btn-interactive transition-all duration-200 ${activeTab === 'browse' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:text-slate-200'}">
            Library
          </button>
          <button id="tab-favorites" class="px-4 py-2 text-sm font-medium rounded-lg btn-interactive transition-all duration-200 ${activeTab === 'favorites' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:text-slate-200'}">
            Favorites (${favorites.length})
          </button>
          
        </nav>

        <!-- Quick actions -->
        <div>
          <button id="open-creator-btn" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all btn-interactive">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Write Quote
          </button>
        </div>

      </div>
    </header>

    <!-- MAIN BODY -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
      
      <!-- Tab Content Area -->
      <div id="tab-content" class="animate-fade-in">
        ${renderActiveTab()}
      </div>

    </main>

    <!-- FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-sm text-slate-500">
      <div class="max-w-6xl mx-auto px-4">
       
        <p class="mt-1">Inspired by the timeless wisdom of humanity, crafted for the digital age.</p>
        <p class="mt-1">Class by frank tech </p>
         <p>&copy; ${new Date().getFullYear()} Forever Quotes. Built with Tailwind CSS v4 & Vite .</p>
      </div>
    </footer>

    <!-- CREATE QUOTE MODAL (HIDDEN BY DEFAULT) -->
    <div id="creator-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300">
      <div class="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 glow-indigo transform scale-95 opacity-0 transition-all duration-300" id="creator-modal-body">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-heading font-bold text-white">Create Your Own Masterpiece</h3>
          <button id="close-creator-btn" class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form id="create-quote-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Quote</label>
            <textarea id="quote-input-text" required maxlength="180" rows="3" placeholder="\"Write something inspiring, timeless, or witty...\"" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-base resize-none"></textarea>
            <div class="text-right text-xs text-slate-600 mt-1" id="text-counter">0 / 180</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author Name</label>
              <input type="text" id="quote-input-author" required placeholder="e.g. Unknown, or Your Name" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select id="quote-input-category" class="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm">
                ${CATEGORIES.filter(c => c !== "All").map(c => `<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose Gradient theme</label>
            <div class="grid grid-cols-3 gap-2" id="gradient-selector">
              ${GRADIENTS.map((g, idx) => `
                <button type="button" data-gradient-idx="${idx}" class="gradient-option flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 transition-all text-left ${idx === 0 ? 'ring-2 ring-indigo-500 border-transparent' : ''}">
                  <span class="w-full h-8 rounded-lg bg-gradient-to-tr ${g.class} mb-1"></span>
                  <span class="text-[10px] text-slate-400 truncate max-w-full">${g.name}</span>
                </button>
              `).join("")}
            </div>
          </div>

          <button type="submit" class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all btn-interactive">
            Publish to My Library
          </button>
        </form>
      </div>
    </div>
  `;

  bindEvents();
}

// Render dynamic sub-content based on current view tab
function renderActiveTab() {
  if (activeTab === "single") {
    return renderSpotlightView();
  } else if (activeTab === "browse") {
    return renderLibraryView(getFilteredQuotes(), "Library");
  } else if (activeTab === "favorites") {
    return renderLibraryView(getFavoriteQuotes(), "My Favorites");
  }
}

// SPOTLIGHT VIEW: Hero focus card with options
function renderSpotlightView() {
  if (quotes.length === 0) {
    return `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <p class="text-slate-400 text-lg mb-4">No quotes available. Add some using the creator!</p>
        <button id="reset-default-btn" class="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all">
          Restore Defaults
        </button>
      </div>
    `;
  }

  const quote = quotes[currentQuoteIndex];
  const isFavorited = favorites.includes(quote.id);

  return `
    <div class="max-w-3xl mx-auto flex flex-col items-center space-y-8">
      
      <!-- Interactive Autoplay Progress / Info -->
      <div class="w-full flex items-center justify-between text-xs text-slate-500 px-2">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ${isPlaying ? 'animate-ping' : ''}"></span>
          <span class="font-medium tracking-wide uppercase">${isPlaying ? 'Autoplay Mode Active' : 'Spotlight Display'}</span>
        </div>
        <div class="font-semibold tracking-wider font-mono">
          ${currentQuoteIndex + 1} / ${quotes.length}
        </div>
      </div>

      <!-- Main Glowing Glassmorphic Card -->
      <div class="w-full glass-panel rounded-3xl p-8 sm:p-12 glow-indigo flex flex-col justify-between min-h-[360px] relative overflow-hidden transition-all duration-500 group">
        
        <!-- Gradient Background Bleed -->
        <div class="absolute -inset-10 bg-gradient-to-tr ${quote.gradient} opacity-5 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
        
        <!-- Quote Category Badge -->
        <div class="self-start px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 tracking-wider uppercase mb-6 z-10">
          ${quote.category}
        </div>

        <!-- Quote Text content -->
        <div class="z-10 flex-grow flex items-center justify-center my-4">
          <div class="text-center space-y-6">
            <span class="block text-4xl sm:text-5xl font-serif text-indigo-400/30 leading-none select-none">“</span>
            <p class="text-xl sm:text-3xl font-serif font-medium leading-relaxed bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent px-4 animate-fade-in" id="spotlight-text">
              ${quote.text}
            </p>
            <span class="block text-4xl sm:text-5xl font-serif text-indigo-400/30 leading-none select-none">”</span>
          </div>
        </div>

        <!-- Author and Action Row -->
        <div class="z-10 mt-8 pt-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <!-- Author Info -->
          <div class="text-center sm:text-left">
            <p class="text-xs text-slate-500 tracking-widest uppercase mb-0.5">Author</p>
            <p class="text-lg font-heading font-bold text-white tracking-wide" id="spotlight-author">${quote.author}</p>
          </div>

          <!-- Utility Micro Buttons -->
          <div class="flex items-center gap-2">
            <!-- Audio voice trigger -->
            <button id="btn-speak" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 hover:border-indigo-500/30 transition-all duration-200 btn-interactive" title="Listen to Quote">
              <svg class="w-5 h-5 ${isSpeaking ? 'animate-bounce text-indigo-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </button>
            
            <!-- Copy button -->
            <button id="btn-copy" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-900 hover:border-indigo-500/30 transition-all duration-200 btn-interactive" title="Copy to Clipboard">
              <svg class="w-5 h-5" id="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
            </button>

            <!-- Favorite toggle button -->
            <button id="btn-fav" class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-900 hover:border-rose-500/30 transition-all duration-200 btn-interactive" title="Favorite Quote">
              <svg class="w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- Dynamic autoplay progress bar -->
        <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-600 transition-all duration-100 ease-linear" style="width: ${progressWidth}%"></div>

      </div>

      <!-- Playback and Carousel Navigation Controls -->
      <div class="flex items-center justify-center gap-6">
        <button id="btn-prev" class="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all btn-interactive" title="Previous Quote">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>

        <button id="btn-toggle-play" class="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all btn-interactive">
          ${isPlaying ? `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Pause
          ` : `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Slideshow
          `}
        </button>

        <button id="btn-random" class="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-indigo-400 hover:text-indigo-300 transition-all btn-interactive" title="Random Quote">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.28 15H18"/></svg>
        </button>

        <button id="btn-next" class="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-300 hover:text-white transition-all btn-interactive" title="Next Quote">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

    </div>
  `;
}

// LIBRARY / FAVORITES VIEW: Searchable grid view
function renderLibraryView(listToRender, title) {
  return `
    <div class="space-y-8">
      
      <!-- Top Filters header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div>
          <h2 class="text-3xl font-heading font-extrabold text-white tracking-tight">${title}</h2>
          <p class="text-sm text-slate-500 mt-1">Discover inspiration across ${listToRender.length} curated entries.</p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input type="text" id="library-search" value="${searchQuery}" placeholder="Search text or author..." class="w-full bg-slate-900/60 border border-slate-850 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all">
          ${searchQuery ? `
            <button id="clear-search-btn" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        ${CATEGORIES.map(category => `
          <button data-category="${category}" class="category-pill px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 btn-interactive ${selectedCategory === category ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md' : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'}">
            ${category}
          </button>
        `).join("")}
      </div>

      <!-- Quotes Cards Grid -->
      ${listToRender.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-2xl p-8 border border-slate-900">
          <svg class="w-12 h-12 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-slate-400 font-medium">No matches found</p>
          <p class="text-xs text-slate-600 mt-1">Try relaxing your search terms or picking another category.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${listToRender.map(quote => renderGridCard(quote)).join("")}
        </div>
      `}

    </div>
  `;
}

// Renders an individual quote card for the grid
function renderGridCard(quote) {
  const isFavorited = favorites.includes(quote.id);
  
  return `
    <div class="glass-panel rounded-2xl p-6 glass-card-hover flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
      
      <!-- Gradient bleed -->
      <div class="absolute -inset-10 bg-gradient-to-tr ${quote.gradient} opacity-5 group-hover:opacity-10 blur-lg transition-all duration-300"></div>

      <!-- Header row -->
      <div class="flex items-center justify-between mb-4 z-10">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 tracking-wider uppercase">
          ${quote.category}
        </span>
        <div class="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          
          <!-- Card Speech Button -->
          <button class="btn-card-speak p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-indigo-400 transition-colors" data-quote-id="${quote.id}" title="Listen to Quote">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          </button>
          
          <!-- Card Copy Button -->
          <button class="btn-card-copy p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-indigo-400 transition-colors" data-quote-id="${quote.id}" title="Copy to Clipboard">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          </button>
          
          <!-- Card Favorite Button -->
          <button class="btn-card-fav p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-rose-500 transition-colors" data-quote-id="${quote.id}" title="Favorite Quote">
            <svg class="w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>

          <!-- Card Delete Button (if custom) -->
          ${quote.id > 12 ? `
            <button class="btn-card-delete p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 hover:text-red-500 transition-colors" data-quote-id="${quote.id}" title="Delete Custom Quote">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          ` : ''}

        </div>
      </div>

      <!-- Quote Body -->
      <div class="z-10 flex-grow py-2">
        <p class="font-serif italic text-base leading-relaxed text-slate-200">
          "${quote.text}"
        </p>
      </div>

      <!-- Footer Author -->
      <div class="z-10 mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
        <span class="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Author</span>
        <span class="font-heading font-bold text-sm text-indigo-300 tracking-wide">${quote.author}</span>
      </div>

    </div>
  `;
}

// Logic: Filters quotes array based on category & search terms
function getFilteredQuotes() {
  return quotes.filter(quote => {
    const categoryMatches = selectedCategory === "All" || quote.category === selectedCategory;
    const searchMatches = searchQuery === "" || 
      quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });
}

// Logic: Filters quotes to show only favorited
function getFavoriteQuotes() {
  return quotes.filter(quote => {
    const isFav = favorites.includes(quote.id);
    const searchMatches = searchQuery === "" || 
      quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase());
    return isFav && searchMatches;
  });
}

// Autoplay loop handles progress updates and transitions
function startProgressAnimation() {
  clearInterval(progressInterval);
  const step = 100 / (AUTOPLAY_DURATION / 100); // Amount of % to fill every 100ms
  
  progressInterval = setInterval(() => {
    progressWidth += step;
    if (progressWidth >= 100) {
      progressWidth = 0;
      nextQuote();
    }
    const bar = document.querySelector('.absolute.bottom-0.left-0');
    if (bar) {
      bar.style.width = `${progressWidth}%`;
    }
  }, 100);
}

function nextQuote() {
  if (quotes.length === 0) return;
  stopSpeaking();
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  progressWidth = 0;
  if (activeTab === "single") {
    render();
    if (isPlaying) {
      startProgressAnimation();
    }
  }
}

function prevQuote() {
  if (quotes.length === 0) return;
  stopSpeaking();
  currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
  progressWidth = 0;
  if (activeTab === "single") {
    render();
    if (isPlaying) {
      startProgressAnimation();
    }
  }
}

function selectRandomQuote() {
  if (quotes.length <= 1) return;
  stopSpeaking();
  let randomIndex = currentQuoteIndex;
  while (randomIndex === currentQuoteIndex) {
    randomIndex = Math.floor(Math.random() * quotes.length);
  }
  currentQuoteIndex = randomIndex;
  progressWidth = 0;
  render();
  if (isPlaying) {
    startProgressAnimation();
  }
}

// Speech utilities using Web Speech API
function speakQuote(text, author) {
  stopSpeaking();
  
  if (!('speechSynthesis' in window)) {
    alert("Text-to-speech not supported in this browser.");
    return;
  }

  isSpeaking = true;
  const speakText = `"${text}" by ${author}`;
  speechUtterance = new SpeechSynthesisUtterance(speakText);
  
  speechUtterance.onend = () => {
    isSpeaking = false;
    speechUtterance = null;
    updateSpeakingState(false);
  };
  
  speechUtterance.onerror = () => {
    isSpeaking = false;
    speechUtterance = null;
    updateSpeakingState(false);
  };

  window.speechSynthesis.speak(speechUtterance);
  updateSpeakingState(true);
}

function stopSpeaking() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  speechUtterance = null;
  updateSpeakingState(false);
}

function updateSpeakingState(speaking) {
  const speakButton = document.querySelector('#btn-speak');
  if (speakButton) {
    const icon = speakButton.querySelector('svg');
    if (speaking) {
      icon.classList.add('animate-bounce', 'text-indigo-400');
    } else {
      icon.classList.remove('animate-bounce', 'text-indigo-400');
    }
  }
}

// Clipboard copying with success trigger animation
function copyToClipboard(text, author, buttonElement) {
  const fullText = `"${text}" — ${author}`;
  navigator.clipboard.writeText(fullText).then(() => {
    const svgIcon = buttonElement.querySelector('svg');
    
    // Success State micro-animation
    const originalIconHTML = svgIcon.innerHTML;
    svgIcon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
    `;
    buttonElement.classList.remove('text-slate-400');
    buttonElement.classList.add('text-emerald-400', 'border-emerald-500/35', 'bg-emerald-950/20');

    setTimeout(() => {
      svgIcon.innerHTML = originalIconHTML;
      buttonElement.classList.add('text-slate-400');
      buttonElement.classList.remove('text-emerald-400', 'border-emerald-500/35', 'bg-emerald-950/20');
    }, 2000);
  }).catch(err => {
    console.error("Clipboard copy failed: ", err);
  });
}

// Event bindings and handler delegations
function bindEvents() {
  // Navigation Logo click returns to SpotLight view
  const logo = document.querySelector('#logo-btn');
  if (logo) {
    logo.addEventListener('click', () => {
      activeTab = "single";
      render();
    });
  }

  // Navigation tab controls
  const tabSingle = document.querySelector('#tab-single');
  if (tabSingle) {
    tabSingle.addEventListener('click', () => {
      activeTab = "single";
      render();
      if (isPlaying) startProgressAnimation();
    });
  }

  const tabBrowse = document.querySelector('#tab-browse');
  if (tabBrowse) {
    tabBrowse.addEventListener('click', () => {
      activeTab = "browse";
      stopAutoplay();
      render();
    });
  }

  const tabFavs = document.querySelector('#tab-favorites');
  if (tabFavs) {
    tabFavs.addEventListener('click', () => {
      activeTab = "favorites";
      stopAutoplay();
      render();
    });
  }

  // SPOTLIGHT CONTROLS
  const prevBtn = document.querySelector('#btn-prev');
  if (prevBtn) prevBtn.addEventListener('click', prevQuote);

  const nextBtn = document.querySelector('#btn-next');
  if (nextBtn) nextBtn.addEventListener('click', nextQuote);

  const randBtn = document.querySelector('#btn-random');
  if (randBtn) randBtn.addEventListener('click', selectRandomQuote);

  // Play / Pause Slideshow button
  const playBtn = document.querySelector('#btn-toggle-play');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        progressWidth = 0;
        startProgressAnimation();
      } else {
        stopAutoplay();
      }
      render();
    });
  }

  // Spotlight Speak synthesis
  const speakBtn = document.querySelector('#btn-speak');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        const quote = quotes[currentQuoteIndex];
        speakQuote(quote.text, quote.author);
      }
    });
  }

  // Spotlight Copy trigger
  const copyBtn = document.querySelector('#btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const quote = quotes[currentQuoteIndex];
      copyToClipboard(quote.text, quote.author, copyBtn);
    });
  }

  // Spotlight Favorite toggle
  const favBtn = document.querySelector('#btn-fav');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const quote = quotes[currentQuoteIndex];
      toggleFavorite(quote.id);
    });
  }

  // LIBRARY / SEARCH CONTROLS
  const searchInput = document.querySelector('#library-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      const filtered = activeTab === "favorites" ? getFavoriteQuotes() : getFilteredQuotes();
      const content = document.querySelector('#tab-content');
      if (content) {
        content.innerHTML = renderLibraryView(filtered, activeTab === "favorites" ? "My Favorites" : "Library");
        bindLibraryEvents();
      }
    });
  }

  const clearSearchBtn = document.querySelector('#clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = "";
      render();
    });
  }

  // Category pills selectors
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      selectedCategory = pill.getAttribute('data-category');
      render();
    });
  });

  // CUSTOM QUOTE CREATOR MODAL BINDINGS
  const openCreator = document.querySelector('#open-creator-btn');
  const closeCreator = document.querySelector('#close-creator-btn');
  const modal = document.querySelector('#creator-modal');
  const modalBody = document.querySelector('#creator-modal-body');

  if (openCreator && modal && modalBody) {
    openCreator.addEventListener('click', () => {
      stopAutoplay();
      modal.classList.remove('hidden');
      setTimeout(() => {
        modalBody.classList.remove('scale-95', 'opacity-0');
      }, 50);
    });
  }

  const hideModal = () => {
    if (modal && modalBody) {
      modalBody.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }
  };

  if (closeCreator) {
    closeCreator.addEventListener('click', hideModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }

  // Custom Gradient Selector
  let selectedGradientIdx = 0;
  const gradOptions = document.querySelectorAll('.gradient-option');
  gradOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      gradOptions.forEach(o => o.classList.remove('ring-2', 'ring-indigo-500', 'border-transparent'));
      opt.classList.add('ring-2', 'ring-indigo-500', 'border-transparent');
      selectedGradientIdx = parseInt(opt.getAttribute('data-gradient-idx'));
    });
  });

  // Textarea length indicator counter
  const textarea = document.querySelector('#quote-input-text');
  const txtCounter = document.querySelector('#text-counter');
  if (textarea && txtCounter) {
    textarea.addEventListener('input', () => {
      txtCounter.textContent = `${textarea.value.length} / 180`;
    });
  }

  // Form publish handler
  const form = document.querySelector('#create-quote-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const text = document.querySelector('#quote-input-text').value.trim();
      const author = document.querySelector('#quote-input-author').value.trim();
      const category = document.querySelector('#quote-input-category').value;
      const gradient = GRADIENTS[selectedGradientIdx].class;

      if (!text || !author) return;

      const newQuote = {
        id: Date.now(), // Unique ID using timestamp
        text,
        author,
        category,
        gradient
      };

      quotes.unshift(newQuote); // Put new quote at the beginning
      saveQuotes();
      
      form.reset();
      selectedGradientIdx = 0;
      if (txtCounter) txtCounter.textContent = "0 / 180";
      
      hideModal();

      // Show Spotlight or Library view with newly added quote
      currentQuoteIndex = 0;
      activeTab = "browse";
      selectedCategory = "All";
      searchQuery = "";
      render();
    });
  }

  // Spotlight restoration defaults helper (if database is empty)
  const resetBtn = document.querySelector('#reset-default-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
      currentQuoteIndex = 0;
      render();
    });
  }

  bindLibraryEvents();
}

// Extra Grid Specific delegation handlers (for Cards library)
function bindLibraryEvents() {
  // Card Speak synthesizing
  const cardSpeakBtns = document.querySelectorAll('.btn-card-speak');
  cardSpeakBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qId = parseInt(btn.getAttribute('data-quote-id'));
      const q = quotes.find(item => item.id === qId);
      if (q) {
        if (isSpeaking && speechUtterance && speechUtterance.text.includes(q.text)) {
          stopSpeaking();
        } else {
          speakQuote(q.text, q.author);
        }
      }
    });
  });

  // Card Copying clipboards
  const cardCopyBtns = document.querySelectorAll('.btn-card-copy');
  cardCopyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = parseInt(btn.getAttribute('data-quote-id'));
      const q = quotes.find(item => item.id === qId);
      if (q) copyToClipboard(q.text, q.author, btn);
    });
  });

  // Card Favorite toggles
  const cardFavBtns = document.querySelectorAll('.btn-card-fav');
  cardFavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = parseInt(btn.getAttribute('data-quote-id'));
      toggleFavorite(qId);
    });
  });

  // Card Deletion toggles (Custom quotes only)
  const cardDelBtns = document.querySelectorAll('.btn-card-delete');
  cardDelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = parseInt(btn.getAttribute('data-quote-id'));
      if (confirm("Are you sure you want to delete this custom quote?")) {
        quotes = quotes.filter(item => item.id !== qId);
        favorites = favorites.filter(id => id !== qId);
        saveQuotes();
        saveFavorites();
        
        // Readjust spotlight index if needed
        if (currentQuoteIndex >= quotes.length) {
          currentQuoteIndex = Math.max(0, quotes.length - 1);
        }
        
        render();
      }
    });
  });
}

// Helper: toggles favorite selection
function toggleFavorite(id) {
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  saveFavorites();
  
  // Re-render tab dynamically depending on active state
  if (activeTab === "single") {
    // Only update favorite button style to prevent fully reloading the view and interrupting voices
    const favBtn = document.querySelector('#btn-fav');
    if (favBtn) {
      const svg = favBtn.querySelector('svg');
      const isFav = favorites.includes(id);
      if (isFav) {
        svg.classList.add('fill-rose-500', 'text-rose-500');
      } else {
        svg.classList.remove('fill-rose-500', 'text-rose-500');
      }
    }
    
    // Update headers and badges
    const tabF = document.querySelector('#tab-favorites');
    if (tabF) tabF.textContent = `Favorites (${favorites.length})`;
  } else {
    render();
  }
}

// Cleans up active progress timer
function stopAutoplay() {
  isPlaying = false;
  clearInterval(progressInterval);
  progressWidth = 0;
}

// App bootstrapping init load
initData();
render();
