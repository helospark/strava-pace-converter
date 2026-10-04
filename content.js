function appendPaceContent(parent, paceValue, unit, originalTime = null) {
    parent.textContent = '';
    parent.style.whiteSpace = 'nowrap';

    if (originalTime !== null) {
        parent.appendChild(document.createTextNode(`${originalTime} (`));
    }

    parent.appendChild(document.createTextNode(`${paceValue}\u00A0`));

    const unitSpan = document.createElement('span');
    unitSpan.style.whiteSpace = 'nowrap';
    unitSpan.textContent = unit == 'km' ? '/km' : '/mi';

    parent.appendChild(unitSpan);

    if (originalTime !== null) {
        parent.appendChild(document.createTextNode(')'));
    }
}

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

function parseDistanceToKm(distText, unit="km") {
        let distanceInKm = 0;
        
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
        
        // If user prefers miles, convert the km base distance into miles
        if (unit != 'km') {
            return distanceInKm / 1.60934;
        }
        
        return distanceInKm;
}

function fixMapPopups(config) {
    if (config.convertMap === false) {
      return;
    }
    const popups = document.querySelectorAll('div[data-testid="mre-popup"]');
    
    popups.forEach(popup => {
        // 1. Get Distance (Find span with title="Distance")
        const distSpan = popup.querySelector('span[title="Distance"]');
        if (!distSpan) return;
        const distanceKm = parseDistanceToKm(distSpan.textContent, config.unit);
        if (!distanceKm) return;

        // 2. Find Top Effort links (using partial class match)
        const effortLinks = popup.querySelectorAll('div[class^="SegmentDetailsPopup_topEfforts__"] a');
        
        effortLinks.forEach(link => {
            const originalText = link.textContent.trim();
            
            // Skip if already converted or empty
            if (originalText.includes('/') || !originalText) return;

            const totalSeconds = parseTimeToSeconds(originalText);
            const parts = originalText.split(" - ");
            
            if (totalSeconds > 0) {
                const paceInSeconds = totalSeconds / distanceKm;
                const paceMin = Math.floor(paceInSeconds / 60);
                const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
                
                link.textContent = `${paceMin}:${paceSec} /${config.unit}`;
                if (parts.length > 1) {
                   link.textContent += " - " + parts[1];
                }
            }
        });
    });
}

function fixProfilePRs(config) {
    if (config.convertBestEffort === false) {
      return;
    }

    // Find all spans that define the "Best Efforts" / PR section
    const glossarySpans = document.querySelectorAll('span[data-glossary-term="definition-best-efforts"]');
    
    glossarySpans.forEach(span => {
        // Navigate up: span -> th -> tr -> thead -> table -> tbody
        // Or more simply, find the closest table and then its tbody
        const tbody = span.closest('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;

            // Use the existing helper to parse distance from the first cell
            const distanceKm = parseDistanceToKm(cells[0].textContent, config.unit);
            if (!distanceKm) return;

            // Process time cells (usually 2nd and 3rd)
            for (let i = 1; i < cells.length; i++) {
                const link = cells[i].querySelector('a');
                const timeStr = link ? link.textContent : cells[i].textContent;
                
                if (timeStr.includes('/')) continue;

                const seconds = parseTimeToSeconds(timeStr);
                if (seconds > 0) {
                    const paceInSeconds = seconds / distanceKm;
                    const paceMin = Math.floor(paceInSeconds / 60);
                    const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
                    
                    var originalTimeToAppend = config.showOriginalTime ? timeStr : null;
                    
                    if (link) {
                        appendPaceContent(link, `${paceMin}:${paceSec}`, config.unit, originalTimeToAppend);
                    } else {
                        appendPaceContent(cells[i], `${paceMin}:${paceSec}`, config.unit, originalTimeToAppend);
                    }
                }
            }
        });
    });
}

function fixMySegmentsTable(config) {
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

        const distanceKm = parseDistanceToKm(distStr, config.unit);
        const totalSeconds = parseTimeToSeconds(timeStr);

        let paceStr = "—"; 
        if (distanceKm > 0 && totalSeconds > 0) {
            const paceInSeconds = totalSeconds / distanceKm;
            const paceMin = Math.floor(paceInSeconds / 60);
            const paceSec = Math.floor(paceInSeconds % 60).toString().padStart(2, '0');
            paceStr = `${paceMin}:${paceSec}`;
        }

        // Create and insert the new cell
        const paceCell = document.createElement('td');

        appendPaceContent(paceCell, paceStr, config.unit);
        paceCell.classList.add('pace-cell');
        
        // Append to the end of the row to match the header placement
        row.appendChild(paceCell);
    });
}

function run() {
    browser.storage.sync.get({
            unit: 'km',
            convertMap: true,
            convertBestEffort: true,
            showOriginalTime: false
        }).then((config) => {
            fixProfilePRs(config);
            fixMapPopups(config);
            fixMySegmentsTable(config);
    });
}

let debounceTimer;

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        observer.disconnect();

        run();

        startObserving();
    }, 100);
});

function startObserving() {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

startObserving();
run();
