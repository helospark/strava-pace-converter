function parseTimeToSeconds(timeStr) {
    timeStr = timeStr.trim().split(' ')[0];
    
    // Handle "46s" format
    if (timeStr.endsWith('s')) {
        return parseInt(timeStr) || 0;
    }

    // Handle "MM:SS" or "HH:MM:SS"
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    return 0;
}

function parseDistanceToKm(distText) {
        let distanceInKm = 0;
        
        console.log(distText);

        if (distText == 'Marathon') {
            distanceInKm = 42.2;
        } else if (distText == 'Half-Marathon') {
            distanceInKm = 21.1;
        } else if (distText.includes('km') || distText.includes('k') || distText.includes('K')) {
            distanceInKm = parseFloat(distText);
        } else if (distText.includes('mile') || distText.includes('mi')) {
            let val = distText.includes('1/2') ? 0.5 : parseFloat(distText);
            distanceInKm = val * 1.60934;
        } else if (distText.includes('m')) {
            distanceInKm = parseFloat(distText) / 1000;
        }
        
        console.log(distanceInKm);
        
        return distanceInKm;
}

function fixMapPopups() {
    const popups = document.querySelectorAll('.mapboxgl-popup-content');
    
    popups.forEach(popup => {
        // 1. Get Distance (Find span with title="Distance")
        const distSpan = popup.querySelector('span[title="Distance"]');
        if (!distSpan) return;
        const distanceKm = parseDistanceToKm(distSpan.textContent);
        if (!distanceKm) return;

        // 2. Find Top Effort links (using partial class match)
        const effortLinks = popup.querySelectorAll('div[class^="SegmentDetailsPopup_topEfforts__"] a');
        
        effortLinks.forEach(link => {
            const originalText = link.textContent.trim();
            
            // Skip if already converted or empty
            if (originalText.includes('/km') || !originalText) return;

            const totalSeconds = parseTimeToSeconds(originalText);
            const parts = originalText.split(" - ");
            
            if (totalSeconds > 0) {
                const paceInSeconds = totalSeconds / distanceKm;
                const paceMin = Math.floor(paceInSeconds / 60);
                const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
                
                link.textContent = `${paceMin}:${paceSec} /km`;
                if (parts.length > 1) {
                   link.textContent += " - " + parts[1];
                }
            }
        });
    });
}

function fixProfilePRs() {
    // Find all spans that define the "Best Efforts" / PR section
    const glossarySpans = document.querySelectorAll('span[data-glossary-term="definition-best-efforts"]');
    
    console.log(glossarySpans);
    
    glossarySpans.forEach(span => {
        // Navigate up: span -> th -> tr -> thead -> table -> tbody
        // Or more simply, find the closest table and then its tbody
        const tbody = span.closest('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        
        console.log("tr");
        console.log(rows);

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            console.log("ROW");
            console.log(cells);
            if (cells.length < 2) return;

            // Use the existing helper to parse distance from the first cell
            const distanceKm = parseDistanceToKm(cells[0].textContent);
            if (!distanceKm) return;

            // Process time cells (usually 2nd and 3rd)
            for (let i = 1; i < cells.length; i++) {
                const link = cells[i].querySelector('a');
                const timeStr = link ? link.textContent : cells[i].textContent;
                
                if (timeStr.includes('/km')) continue;

                const seconds = parseTimeToSeconds(timeStr);
                if (seconds > 0) {
                    const paceInSeconds = seconds / distanceKm;
                    const paceMin = Math.floor(paceInSeconds / 60);
                    const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
                    
                    const paceHtml = `${paceMin}:${paceSec}\u00A0<span style="white-space: nowrap;">/km</span>`;
                    
                    if (link) {
                        link.innerHTML = paceHtml;
                    } else {
                        cells[i].innerHTML = paceHtml;
                    }
                }
            }
        });
    });
}

function fixMySegmentsTable() {
    const table = document.querySelector('table.my-segments');
    if (!table) return;

    // 1. Handle the Header
    const theadRow = table.querySelector('thead tr');
    if (theadRow && !theadRow.querySelector('.pace-header')) {
        const paceHeader = document.createElement('th');
        paceHeader.textContent = 'Pace';
        paceHeader.classList.add('pace-header');
        // We'll place it at the end or relative to the time header
        theadRow.appendChild(paceHeader);
    }

    // 2. Handle the Rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (row.querySelector('.pace-cell')) return;

        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return;

        // --- Logic for Colspan Offset ---
        // If index 2 has colspan="1", an extra icon cell exists, shifting indices by +1
        const secondCell = cells[2];
        const isShifted = secondCell && secondCell.getAttribute('colspan') === "1";
        const offset = isShifted ? 1 : 0;

        // Original targets: Distance (3), Time (5)
        // Adjusted targets:
        const distCell = cells[3 + offset];
        const timeCell = cells[5 + offset];

        if (!distCell || !timeCell) return;

        const distStr = distCell.textContent;
        const timeLink = timeCell.querySelector('a');
        const timeStr = timeLink ? timeLink.textContent : timeCell.textContent;

        const distanceKm = parseDistanceToKm(distStr);
        const totalSeconds = parseTimeToSeconds(timeStr);

        let paceStr = "—"; 
        if (distanceKm > 0 && totalSeconds > 0) {
            const paceInSeconds = totalSeconds / distanceKm;
            const paceMin = Math.floor(paceInSeconds / 60);
            const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
            paceStr = `${paceMin}:${paceSec}\u00A0/km`;
        }

        // Create and insert the new cell
        const paceHtml = `<span style="white-space: nowrap;">${paceStr}\u00A0</span>`;
        const paceCell = document.createElement('td');
        paceCell.innerHTML = paceHtml;
        paceCell.classList.add('pace-cell');
        
        // Append to the end of the row to match the header placement
        row.appendChild(paceCell);
    });
}

function run() {
    fixProfilePRs();
    fixMapPopups();
    fixMySegmentsTable();
}

let debounceTimer;

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        observer.disconnect();

        run();
        console.log("Running pace converter.");

        startObserving();
    }, 200);
});

function startObserving() {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

startObserving();
run();

setTimeout(() => { run()}, 2000);

console.log("Strava Pace Fixer");
