//#NOTE: Browser console give error, but could be false positve as trophies work as e
// basic check to see if trophies.js is loaded
console.log('[BetterVLR] trophies.js loaded');
console.log('jQuery version:', $?.fn?.jquery || 'jQuery not loaded');

// Constants
const DEFAULT_IMAGE = "https://i.imgur.com/GKATx36.png";
const TROPHIES_API_URL = "https://json.link/bnPWObJhtr.json";

// Cache for storing fetched trophies data
let cachedTrophies = null;

/**
 * Generates HTML for a single trophy item
 * @param {Object} trophy - The trophy object containing trophy data
 * @returns {string} HTML string for the trophy item
 */
function generateTrophyItemHTML(trophy) {
    const trophyImage = trophy.image || DEFAULT_IMAGE;
    const eventTitle = trophy.event ? trophy.event : 'Trophy';
    
    return `
    <a class="wf-nav-item" href="${trophy.link || '#'}" style="padding: 5px">
        <div class="wf-nav-item-title">
            <img src="${trophyImage}" 
                 height="36" 
                 width="36" 
                 style="object-fit: cover;" 
                 title="${eventTitle}"
                 alt="${eventTitle} trophy">
        </div>
    </a>`;
}

/**
 * Inserts trophies container after the specified selector
 * @param {string} selector - CSS selector for the element to insert after
 * @param {Array} trophies - Array of trophy objects
 */
function insertTrophies(selector, trophies) {
    const $target = $(selector);
    if (!$target.length || !trophies.length) return;

    const trophiesHTML = trophies.map(generateTrophyItemHTML).join('');
    const $trophiesContainer = $(`<div class="wf-nav trophies">${trophiesHTML}</div>`);
    
    $target.after($trophiesContainer);
    $trophiesContainer.find("> a:first").addClass("mod-first");
}

/**
 * Fetches trophies data with caching
 * @returns {Promise<Array>} Promise resolving to trophies data
 */
async function fetchTrophies() {
    console.log('[BetterVLR] Fetching trophies...');
    if (cachedTrophies) {
        console.log('[BetterVLR] Using cached trophies');
        return cachedTrophies;
    }

    try {
        console.log(`[BetterVLR] Making API request to: ${TROPHIES_API_URL}`);
        const response = await $.getJSON(TROPHIES_API_URL);
        console.log('[BetterVLR] API response received');
        cachedTrophies = response.trophies || [];
        console.log(`[BetterVLR] Found ${cachedTrophies.length} trophies`);
        return cachedTrophies;
    } catch (error) {
        console.error('Failed to fetch trophies:', error);
        return [];
    }
}

/**
 * Main function to initialize trophies display
 */
async function initTrophies() {
    console.log('[BetterVLR] Initializing trophies...');
    const url = window.location.href;
    console.log(`[BetterVLR] Current URL: ${url}`);
    let selector, filterFn;

    if (url.includes("/team/")) {
        const teamId = url.split("/")[4];
        console.log(`[BetterVLR] Detected team page. Team ID: ${teamId}`);
        selector = ".team-header";
        filterFn = trophy => {
            console.log(`[BetterVLR] Checking trophy:`, trophy);
            return `${trophy.id}` === teamId;
        };
    } 
    else if (url.includes("/player/")) {
        console.log(`[BetterVLR] Detected player page. URL: ${url}`);
        console.log(`[BetterVLR] URL segments:`, url.split("/"));
        const playerId = url.split("/")[4];
        console.log(`[BetterVLR] Detected player page. Player ID: ${playerId}`);
        selector = ".player-header";
        filterFn = trophy => {
            console.log(`[BetterVLR] Checking trophy:`, trophy);
            return trophy.players?.some(player => 
                `${player.id}` === playerId
            );
        };
    } 
    else {
        return; // Not a team or player page
    }

    const allTrophies = await fetchTrophies();
    console.log(`[BetterVLR] Total trophies: ${allTrophies.length}`);
    
    const filteredTrophies = allTrophies.filter(filterFn);
    console.log(`[BetterVLR] Filtered trophies: ${filteredTrophies.length}`);
    
    if (filteredTrophies.length > 0) {
        console.log(`[BetterVLR] Inserting ${filteredTrophies.length} trophies after selector: ${selector}`);
        console.log('Target element exists:', $(selector).length > 0);
        insertTrophies(selector, filteredTrophies);
    } else {
        console.log('[BetterVLR] No matching trophies found');
    }

}

// Wrap the initialization in a function that can be called from bettervlr.js
window.initTrophies = function () {
    $(document).ready(async () => {
        try {
            console.log('[BetterVLR] Document ready, initializing trophies...');
            await initTrophies();
            console.log('[BetterVLR] Trophy initialization complete');
        } catch (error) {
            console.error('[BetterVLR] Error initializing trophies:', error);
        }
    });
};

// Call it immediately in case bettervlr.js is loaded after this script
initTrophies();

// Initialize the trophies when the document is ready
$(document).ready(async () => {
    try {
        console.log('[BetterVLR] Document ready, initializing trophies...');
        await initTrophies();
        console.log('[BetterVLR] Trophy initialization complete');
    } catch (error) {
        console.error('[BetterVLR] Error initializing trophies:', error);
    }
});
