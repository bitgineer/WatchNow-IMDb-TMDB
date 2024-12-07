// ==UserScript==
// @name         IMDb Quick Watch
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Quickly redirect IMDb and TMDB titles to vidbinge.dev with custom settings.
// @author       Bitgineer https://github.com/bitgineer
// @match        https://www.imdb.com/title/tt*/*
// @match        https://www.themoviedb.org/*/*/*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /*************** Styles Injection ***************/
    const styles = `
    /* IMDb Quick Watch Styles */
    #imdb-quick-watch-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        background-color: #ffffff;
        border: 1px solid #cccccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: 'Roboto', sans-serif;
        padding: 20px;
        box-sizing: border-box;
    }

    #imdb-quick-watch-container h2 {
        font-size: 1.4rem;
        margin-bottom: 20px;
        text-align: center;
        color: #6200ea;
    }

    .iqw-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 16px;
        font-size: 1rem;
        background-color: #6200ea;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s, box-shadow 0.3s;
        width: 100%;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .iqw-button:hover {
        background-color: #3700b3;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .iqw-toggle-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
    }

    .iqw-toggle-label {
        font-size: 1rem;
        flex: 1;
        margin-right: 10px;
    }

    .iqw-toggle-switch {
        position: relative;
        width: 50px;
        height: 24px;
        flex-shrink: 0;
    }

    .iqw-toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .iqw-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.4s;
        border-radius: 24px;
    }

    .iqw-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }

    .iqw-toggle-switch input:checked + .iqw-slider {
        background-color: #6200ea;
    }

    .iqw-toggle-switch input:checked + .iqw-slider:before {
        transform: translateX(26px);
    }

    .iqw-section {
        margin-bottom: 15px;
        display: none;
    }

    .iqw-section.active {
        display: block;
    }

    .iqw-section label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.95rem;
    }

    .iqw-radio-group {
        display: flex;
        justify-content: space-around;
        margin-bottom: 15px;
        flex-wrap: wrap;
    }

    .iqw-radio-group label {
        display: flex;
        align-items: center;
        font-size: 0.95rem;
        cursor: pointer;
        margin-bottom: 8px;
        width: 45%;
    }

    .iqw-radio-group input {
        margin-right: 6px;
        flex-shrink: 0;
    }

    .iqw-input-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .iqw-input-group label {
        font-size: 0.95rem;
    }

    .iqw-input-group input {
        padding: 8px 12px;
        font-size: 1rem;
        border: 1px solid #cccccc;
        border-radius: 4px;
        outline: none;
        transition: border-color 0.3s;
        width: 100%;
    }

    .iqw-input-group input:focus {
        border-color: #6200ea;
    }

    .iqw-footer {
        font-size: 0.85rem;
        color: #777777;
        text-align: center;
    }

    /* Snackbar Styles */
    #iqw-snackbar {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333333;
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.5s ease, bottom 0.5s ease;
        z-index: 10001;
        font-size: 0.9rem;
        max-width: 80%;
        text-align: center;
        pointer-events: none;
    }

    #iqw-snackbar.show {
        opacity: 1;
        bottom: 30px;
    }

    /* Responsive Design */
    @media (max-width: 400px) {
        #imdb-quick-watch-container {
            width: 90%;
            right: 5%;
            bottom: 10px;
            padding: 15px;
        }

        #imdb-quick-watch-container h2 {
            font-size: 1.2rem;
        }

        .iqw-button {
            font-size: 0.95rem;
            padding: 10px 12px;
        }

        .iqw-toggle-label, .iqw-section label, .iqw-radio-group label, .iqw-input-group label {
            font-size: 0.85rem;
        }
    }
    `;

    GM_addStyle(styles);

    /*************** UI Injection ***************/
    const container = document.createElement('div');
    container.id = 'imdb-quick-watch-container';
    container.innerHTML = `
        <h2>IMDb Quick Watch</h2>

        <button id="iqw-redirectButton" class="iqw-button">
            ▶️ Watch Now!
        </button>

        <div class="iqw-toggle-container">
            <span class="iqw-toggle-label">Enable Redirect</span>
            <label class="iqw-toggle-switch">
                <input type="checkbox" id="iqw-redirectCheckbox">
                <span class="iqw-slider"></span>
            </label>
        </div>

        <!-- Redirect Options Section -->
        <div id="iqw-redirectOptions" class="iqw-section">
            <label>Open Redirect:</label>
            <div class="iqw-radio-group">
                <label>
                    <input type="radio" name="iqw-redirectTarget" value="same" id="iqw-redirectSame">
                    Same Tab
                </label>
                <label>
                    <input type="radio" name="iqw-redirectTarget" value="new" id="iqw-redirectNew">
                    New Tab
                </label>
            </div>
        </div>

        <!-- Season and Episode Inputs -->
        <div id="iqw-seasonEpisodeOptions" class="iqw-section">
            <div class="iqw-input-group">
                <label for="iqw-seasonInput">Season:</label>
                <input type="number" id="iqw-seasonInput" min="1" value="1">
            </div>
            <div class="iqw-input-group">
                <label for="iqw-episodeInput">Episode:</label>
                <input type="number" id="iqw-episodeInput" min="1" value="1">
            </div>
        </div>

        <div class="iqw-footer">
            <p>Stream effortlessly with IMDb Quick Watch.</p>
        </div>
    `;
    document.body.appendChild(container);

    // Snackbar Element
    const snackbar = document.createElement('div');
    snackbar.id = 'iqw-snackbar';
    document.body.appendChild(snackbar);

    /*************** Utility Functions ***************/
    // Function to show snackbar messages
    function showSnackbar(message) {
        snackbar.textContent = message;
        snackbar.classList.add('show');
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 3000);
    }

    // Function to toggle visibility of sections
    function toggleSections(show) {
        const redirectOptions = document.getElementById('iqw-redirectOptions');
        const seasonEpisodeOptions = document.getElementById('iqw-seasonEpisodeOptions');
        if (show) {
            redirectOptions.classList.add('active');
            seasonEpisodeOptions.classList.add('active');
        } else {
            redirectOptions.classList.remove('active');
            seasonEpisodeOptions.classList.remove('active');
        }
    }

    // Function to extract IMDb ID using a robust regex
    function getImdbId(url) {
        const regex = /\/title\/(tt\d{7,8})/; // IMDb IDs typically have 7 or 8 digits
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Function to determine the title type on IMDb by inspecting specific list items
    function determineImdbTitleType() {
        const listItems = document.querySelectorAll('ul.ipc-inline-list.ipc-inline-list--show-dividers li.ipc-inline-list__item');
        for (const item of listItems) {
            const text = item.textContent.trim().toLowerCase();
            if (text.includes('tv series') || text.includes('tv mini-series')) {
                return 'tv';
            }
            // You can add more conditions here for other types if needed
        }
        return 'movie'; // Default to 'movie' if no TV indicators are found
    }

    // Function to extract TMDB ID and type from the URL
    function getTmdbInfo(url) {
        const regex = /https:\/\/www\.themoviedb\.org\/(movie|tv)\/(\d+)/;
        const match = url.match(regex);
        if (match) {
            return { type: match[1], id: match[2] };
        }
        return null;
    }

    // Function to build the redirect URL with optional season and episode for TV
    function buildRedirectUrl(titleType, id, season, episode) {
        let url = `https://vidbinge.dev/embed/${titleType}/${id}`;
        if (titleType === 'tv' && season && episode) {
            url += `/${season}/${episode}`;
        }
        return url;
    }

    /*************** Settings Management ***************/
    // Load existing settings
    let redirectEnabled = GM_getValue('redirectEnabled', false);
    let redirectTarget = GM_getValue('redirectTarget', 'same');
    let season = GM_getValue('season', 1);
    let episode = GM_getValue('episode', 1);

    // Initialize UI with settings
    const redirectCheckbox = document.getElementById('iqw-redirectCheckbox');
    const redirectSame = document.getElementById('iqw-redirectSame');
    const redirectNew = document.getElementById('iqw-redirectNew');
    const seasonInput = document.getElementById('iqw-seasonInput');
    const episodeInput = document.getElementById('iqw-episodeInput');

    redirectCheckbox.checked = redirectEnabled;
    toggleSections(redirectEnabled);

    if (redirectTarget === 'same') {
        redirectSame.checked = true;
    } else {
        redirectNew.checked = true;
    }

    seasonInput.value = season;
    episodeInput.value = episode;

    /*************** Event Listeners ***************/
    // Event listener for the redirect checkbox
    redirectCheckbox.addEventListener('change', function() {
        const isEnabled = redirectCheckbox.checked;
        GM_setValue('redirectEnabled', isEnabled);
        toggleSections(isEnabled);
    });

    // Event listeners for radio buttons
    redirectSame.addEventListener('change', function() {
        if (this.checked) {
            GM_setValue('redirectTarget', 'same');
        }
    });

    redirectNew.addEventListener('change', function() {
        if (this.checked) {
            GM_setValue('redirectTarget', 'new');
        }
    });

    // Event listeners for Season and Episode inputs
    seasonInput.addEventListener('input', function() {
        let val = parseInt(seasonInput.value, 10);
        if (isNaN(val) || val < 1) {
            val = 1;
            seasonInput.value = val;
        }
        GM_setValue('season', val);
    });

    episodeInput.addEventListener('input', function() {
        let val = parseInt(episodeInput.value, 10);
        if (isNaN(val) || val < 1) {
            val = 1;
            episodeInput.value = val;
        }
        GM_setValue('episode', val);
    });

    // Event listener for the redirect button
    document.getElementById('iqw-redirectButton').addEventListener('click', function() {
        const url = window.location.href;

        // Check if URL is IMDb
        const imdbId = getImdbId(url);
        if (imdbId) {
            const titleType = determineImdbTitleType();

            if (titleType === 'tv') {
                const currentSeason = GM_getValue('season', 1);
                const currentEpisode = GM_getValue('episode', 1);
                const redirectUrl = buildRedirectUrl(titleType, imdbId, currentSeason, currentEpisode);
                performRedirect(redirectUrl);
            } else {
                // For movies, no season and episode
                const redirectUrl = buildRedirectUrl(titleType, imdbId);
                performRedirect(redirectUrl);
            }
            return;
        }

        // Check if URL is TMDB
        const tmdbInfo = getTmdbInfo(url);
        if (tmdbInfo) {
            const { type, id } = tmdbInfo;
            if (type === 'tv') {
                const currentSeason = GM_getValue('season', 1);
                const currentEpisode = GM_getValue('episode', 1);
                const redirectUrl = buildRedirectUrl(type, id, currentSeason, currentEpisode);
                performRedirect(redirectUrl);
            } else {
                // For movies, no season and episode
                const redirectUrl = buildRedirectUrl(type, id);
                performRedirect(redirectUrl);
            }
            return;
        }

        showSnackbar('This is not a supported title page.');
    });

    /*************** Redirection Function ***************/
    function performRedirect(url) {
        if (!GM_getValue('redirectEnabled', false)) {
            showSnackbar('Redirect is disabled in settings.');
            return;
        }

        const target = GM_getValue('redirectTarget', 'same');
        if (target === 'same') {
            window.location.href = url;
            showSnackbar('Redirecting...');
        } else if (target === 'new') {
            window.open(url, '_blank');
            showSnackbar('Redirecting to new tab...');
        } else {
            showSnackbar('Invalid redirect target.');
        }
    }

    /*************** Optional: Auto Redirect ***************/
    // Uncomment the following block if you want to auto redirect when enabled
    /*
    if (redirectEnabled) {
        const url = window.location.href;

        // Check if URL is IMDb
        const imdbId = getImdbId(url);
        if (imdbId) {
            const titleType = determineImdbTitleType();

            if (titleType === 'tv') {
                const currentSeason = GM_getValue('season', 1);
                const currentEpisode = GM_getValue('episode', 1);
                const redirectUrl = buildRedirectUrl(titleType, imdbId, currentSeason, currentEpisode);
                performRedirect(redirectUrl);
            } else {
                // For movies, no season and episode
                const redirectUrl = buildRedirectUrl(titleType, imdbId);
                performRedirect(redirectUrl);
            }
            return;
        }

        // Check if URL is TMDB
        const tmdbInfo = getTmdbInfo(url);
        if (tmdbInfo) {
            const { type, id } = tmdbInfo;
            if (type === 'tv') {
                const currentSeason = GM_getValue('season', 1);
                const currentEpisode = GM_getValue('episode', 1);
                const redirectUrl = buildRedirectUrl(type, id, currentSeason, currentEpisode);
                performRedirect(redirectUrl);
            } else {
                // For movies, no season and episode
                const redirectUrl = buildRedirectUrl(type, id);
                performRedirect(redirectUrl);
            }
            return;
        }

        console.error('This is not a valid IMDb or TMDB title page.');
    }
    */

})();
