document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const mapElement = document.getElementById('map');
    const domainsContainer = document.getElementById('domains-container');
    const addDomainBtn = document.getElementById('add-domain');
    const generateNamelistBtn = document.getElementById('generate-namelist');
    const presetSelect = document.getElementById('preset');
    const savePresetBtn = document.getElementById('save-preset');
    const shareConfigBtn = document.getElementById('share-config');
    const baseMapSelect = document.getElementById('base-map');
    const validationErrors = document.getElementById('validation-errors');
    const domainInfo = document.getElementById('domain-info');

    // Initialize map with different base layers
    const map = L.map(mapElement).setView([20, 0], 2);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
    
    osmLayer.addTo(map);
    
    // Map layer control
    baseMapSelect.addEventListener('change', function() {
        switch(this.value) {
            case 'satellite':
                map.removeLayer(osmLayer);
                map.removeLayer(terrainLayer);
                satelliteLayer.addTo(map);
                break;
            case 'terrain':
                map.removeLayer(osmLayer);
                map.removeLayer(satelliteLayer);
                terrainLayer.addTo(map);
                break;
            default:
                map.removeLayer(satelliteLayer);
                map.removeLayer(terrainLayer);
                osmLayer.addTo(map);
        }
    });

    // Date picker configuration
    const dateConfig = {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date()
    };

    // Store all domains
    let domains = [];
    let domainRectangles = {};
    let domainCounter = 0;
    let activeDomainId = null;

    // Load presets
    loadPresets();

    // Add first domain
    addDomain();

    // Event listeners
    addDomainBtn.addEventListener('click', addDomain);
    generateNamelistBtn.addEventListener('click', generateNamelist);
    savePresetBtn.addEventListener('click', savePreset);
    shareConfigBtn.addEventListener('click', shareConfiguration);
    presetSelect.addEventListener('change', loadPresetConfiguration);

    // Function to add a new domain form
    function addDomain(parentId = null) {
        const domainId = `domain-${domainCounter}`;
        const isParent = domainCounter === 0;
        
        const domainHTML = `
            <div class="domain-item" id="${domainId}" data-parent="${parentId}">
                <div class="domain-header">
                    <h3>${isParent ? 'Parent Domain' : `Nested Domain ${domainCounter}`}</h3>
                    ${!isParent ? `<button class="remove-domain" data-domain="${domainId}">Remove</button>` : ''}
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${domainId}-start-date">Start Date</label>
                        <input type="text" id="${domainId}-start-date" class="date-picker" placeholder="Select start date">
                    </div>
                    
                    <div class="form-group">
                        <label for="${domainId}-end-date">End Date</label>
                        <input type="text" id="${domainId}-end-date" class="date-picker" placeholder="Select end date">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${domainId}-interval">Interval Seconds</label>
                        <input type="number" id="${domainId}-interval" value="21600" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="${domainId}-resolution">Resolution (km)</label>
                        <input type="number" id="${domainId}-resolution" value="10" min="0.1" step="0.1">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${domainId}-e_we">Grid Dimension (E-W)</label>
                        <input type="number" id="${domainId}-e_we" value="100" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="${domainId}-e_sn">Grid Dimension (N-S)</label>
                        <input type="number" id="${domainId}-e_sn" value="100" min="1">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${domainId}-ref-lat">Reference Latitude</label>
                        <input type="number" id="${domainId}-ref-lat" value="0" min="-90" max="90" step="0.0001" class="coord-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="${domainId}-ref-lon">Reference Longitude</label>
                        <input type="number" id="${domainId}-ref-lon" value="0" min="-180" max="180" step="0.0001" class="coord-input">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="${domainId}-truelat1">True Latitude 1</label>
                        <input type="number" id="${domainId}-truelat1" value="30" min="-90" max="90" step="0.0001">
                    </div>
                    
                    <div class="form-group">
                        <label for="${domainId}-truelat2">True Latitude 2</label>
                        <input type="number" id="${domainId}-truelat2" value="60" min="-90" max="90" step="0.0001">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="${domainId}-stand-lon">Stand Longitude</label>
                    <input type="number" id="${domainId}-stand-lon" value="0" min="-180" max="180" step="0.0001">
                </div>
                
                <div class="form-group">
                    <label for="${domainId}-parent-grid-ratio">Parent Grid Ratio</label>
                    <input type="number" id="${domainId}-parent-grid-ratio" value="${isParent ? 1 : 3}" min="1" step="1" ${isParent ? 'disabled' : ''}>
                </div>
            </div>
        `;
        
        domainsContainer.insertAdjacentHTML('beforeend', domainHTML);
        
        // Initialize date pickers
        flatpickr(`#${domainId}-start-date`, dateConfig);
        flatpickr(`#${domainId}-end-date`, dateConfig);
        
        // Add event listeners for coordinate inputs
        document.querySelectorAll(`#${domainId} .coord-input`).forEach(input => {
            input.addEventListener('change', () => updateDomainOnMap(domainId));
        });
        
        // Add event listeners for other inputs
        const gridInputs = [`${domainId}-e_we`, `${domainId}-e_sn`, `${domainId}-resolution`];
        gridInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', () => updateDomainOnMap(domainId));
        });
        
        // Add remove button event if not parent
        if (!isParent) {
            document.querySelector(`.remove-domain[data-domain="${domainId}"]`).addEventListener('click', function() {
                removeDomain(domainId);
            });
        }
        
        // Store domain data
        domains.push(domainId);
        domainCounter++;
        
        // Update map with new domain
        updateDomainOnMap(domainId);
        
        // Set as active domain
        setActiveDomain(domainId);
        
        // Validate configuration
        validateConfiguration();
    }
    
    // Function to remove a domain
    function removeDomain(domainId) {
        // Remove from DOM
        document.getElementById(domainId).remove();
        
        // Remove from domains array
        domains = domains.filter(id => id !== domainId);
        
        // Remove from map
        if (domainRectangles[domainId]) {
            map.removeLayer(domainRectangles[domainId]);
            delete domainRectangles[domainId];
        }
        
        // Remove any child domains
        document.querySelectorAll(`.domain-item[data-parent="${domainId}"]`).forEach(child => {
            removeDomain(child.id);
        });
        
        // Validate configuration
        validateConfiguration();
    }
    
    // Function to update domain visualization on map
    function updateDomainOnMap(domainId) {
        const refLat = parseFloat(document.getElementById(`${domainId}-ref-lat`).value) || 0;
        const refLon = parseFloat(document.getElementById(`${domainId}-ref-lon`).value) || 0;
        const eWe = parseInt(document.getElementById(`${domainId}-e_we`).value) || 100;
        const eSn = parseInt(document.getElementById(`${domainId}-e_sn`).value) || 100;
        const resolution = parseFloat(document.getElementById(`${domainId}-resolution`).value) || 10;
        
        // Calculate bounds (simplified calculation)
        const latSpan = (eSn * resolution) / 111.32; // Approximate km to degrees
        const lonSpan = (eWe * resolution) / (111.32 * Math.cos(refLat * Math.PI / 180));
        
        const southWest = L.latLng(refLat - latSpan/2, refLon - lonSpan/2);
        const northEast = L.latLng(refLat + latSpan/2, refLon + lonSpan/2);
        const bounds = L.latLngBounds(southWest, northEast);
        
        // Remove existing rectangle if it exists
        if (domainRectangles[domainId]) {
            map.removeLayer(domainRectangles[domainId]);
        }
        
        // Add new rectangle
        domainRectangles[domainId] = L.rectangle(bounds, {
            color: domainId === 'domain-0' ? '#ff0000' : '#0000ff',
            weight: 2,
            fillOpacity: 0.1,
            fillColor: domainId === 'domain-0' ? '#ff0000' : '#0000ff'
        }).addTo(map);
        
        // Add interactivity
        domainRectangles[domainId].on('click', () => setActiveDomain(domainId));
        domainRectangles[domainId].on('dragend', function(e) {
            const newBounds = this.getBounds();
            const newCenter = newBounds.getCenter();
            
            // Update coordinates in form
            document.getElementById(`${domainId}-ref-lat`).value = newCenter.lat.toFixed(4);
            document.getElementById(`${domainId}-ref-lon`).value = newCenter.lng.toFixed(4);
            
            // Update domain info
            updateDomainInfo(domainId);
        });
        
        // Make rectangle draggable
        domainRectangles[domainId].dragging.enable();
        
        // Add label
        const center = bounds.getCenter();
        domainRectangles[domainId].bindTooltip(
            domainId === 'domain-0' ? 'Parent Domain' : `Nested Domain ${domainId.split('-')[1]}`,
            {permanent: true, direction: 'center', className: 'domain-label'}
        ).openTooltip();
        
        // Fit map to show all domains
        fitMapToDomains();
        
        // Update domain info
        updateDomainInfo(domainId);
    }
    
    // Function to set active domain
    function setActiveDomain(domainId) {
        activeDomainId = domainId;
        
        // Highlight active domain on map
        Object.entries(domainRectangles).forEach(([id, rectangle]) => {
            if (id === domainId) {
                rectangle.setStyle({weight: 4, fillOpacity: 0.2});
            } else {
                rectangle.setStyle({weight: 2, fillOpacity: 0.1});
            }
        });
        
        // Update domain info
        updateDomainInfo(domainId);
    }
    
    // Function to update domain info display
    function updateDomainInfo(domainId) {
        if (!domainId) return;
        
        const refLat = parseFloat(document.getElementById(`${domainId}-ref-lat`).value) || 0;
        const refLon = parseFloat(document.getElementById(`${domainId}-ref-lon`).value) || 0;
        const eWe = parseInt(document.getElementById(`${domainId}-e_we`).value) || 100;
        const eSn = parseInt(document.getElementById(`${domainId}-e_sn`).value) || 100;
        const resolution = parseFloat(document.getElementById(`${domainId}-resolution`).value) || 10;
        
        const widthKm = (eWe * resolution).toFixed(1);
        const heightKm = (eSn * resolution).toFixed(1);
        
        domainInfo.innerHTML = `
            <strong>${domainId === 'domain-0' ? 'Parent Domain' : `Nested Domain ${domainId.split('-')[1]}`}</strong><br>
            Center: ${refLat.toFixed(4)}°, ${refLon.toFixed(4)}°<br>
            Dimensions: ${eWe} x ${eSn} grid points<br>
            Resolution: ${resolution} km<br>
            Physical size: ${widthKm} km x ${heightKm} km
        `;
    }
    
    // Function to fit map to show all domains
    function fitMapToDomains() {
        const allBounds = Object.values(domainRectangles).map(rect => rect.getBounds());
        if (allBounds.length === 0) return;
        
        const combinedBounds = allBounds.reduce((acc, bound) => acc.extend(bound), L.latLngBounds(allBounds[0]));
        map.fitBounds(combinedBounds, {padding: [20, 20]});
    }
    
    // Function to generate namelist.wps content
    function generateNamelist() {
        // Validate configuration first
        const errors = validateConfiguration(true);
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }
        
        let namelistContent = `&share\n`;
        namelistContent += ` wrf_core = 'ARW',\n`;
        namelistContent += ` max_dom = ${domains.length},\n`;
        
        // Add dates (use first domain's dates for simplicity)
        const startDates = domains.map(domainId => 
            `'${formatDateForNamelist(document.getElementById(`${domainId}-start-date`).value)}'`
        );
        const endDates = domains.map(domainId => 
            `'${formatDateForNamelist(document.getElementById(`${domainId}-end-date`).value)}'`
        );
        
        namelistContent += ` start_date = ${startDates.join(', ')},\n`;
        namelistContent += ` end_date   = ${endDates.join(', ')},\n`;
        namelistContent += ` interval_seconds = ${document.getElementById(`${domains[0]}-interval`).value || 21600},\n`;
        namelistContent += ` io_form_geogrid = 2,\n`;
        namelistContent += `/\n\n`;
        
        namelistContent += `&geogrid\n`;
        
        // Add domain-specific parameters
        const domainParams = [
            'e_we', 'e_sn', 'dx', 'dy', 'ref_lat', 'ref_lon', 
            'truelat1', 'truelat2', 'stand_lon', 'parent_id',
            'parent_grid_ratio', 'i_parent_start', 'j_parent_start'
        ];
        
        // Regular parameters
        const regularParams = [
            'e_we', 'e_sn', 'dx', 'dy', 'ref_lat', 'ref_lon', 
            'truelat1', 'truelat2', 'stand_lon'
        ];
        
        regularParams.forEach(param => {
            const values = domains.map(domainId => {
                const inputId = param === 'dx' || param === 'dy' ? 
                    `${domainId}-resolution` : `${domainId}-${param.replace('_', '-')}`;
                return document.getElementById(inputId).value;
            });
            namelistContent += ` ${param} = ${values.join(', ')},\n`;
        });
        
        // Parent-child relationships
        const parentIds = domains.map((_, i) => i === 0 ? 1 : i);
        const gridRatios = domains.map(domainId => 
            document.getElementById(`${domainId}-parent-grid-ratio`).value
        );
        
        namelistContent += ` parent_id         = ${parentIds.join(', ')},\n`;
        namelistContent += ` parent_grid_ratio = ${gridRatios.join(', ')},\n`;
        namelistContent += ` i_parent_start    = 1, ${domains.slice(1).map(() => '10').join(', ')},\n`;
        namelistContent += ` j_parent_start    = 1, ${domains.slice(1).map(() => '10').join(', ')},\n`;
        namelistContent += `/\n\n`;
        
        namelistContent += `&ungrib\n`;
        namelistContent += ` out_format = 'WPS',\n`;
        namelistContent += `/\n\n`;
        
        namelistContent += `&metgrid\n`;
        namelistContent += ` fg_name = 'FILE',\n`;
        namelistContent += ` io_form_metgrid = 2,\n`;
        namelistContent += `/\n`;
        
        // Create download
        const blob = new Blob([namelistContent], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'namelist.wps';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Function to validate configuration
    function validateConfiguration(forNamelist = false) {
        const errors = [];
        
        // Check domain count
        if (domains.length === 0) {
            errors.push("At least one domain must be configured");
        }
        
        // Check each domain
        domains.forEach(domainId => {
            const isParent = domainId === 'domain-0';
            const parentId = document.getElementById(domainId).dataset.parent;
            
            // Check dates
            const startDate = document.getElementById(`${domainId}-start-date`).value;
            const endDate = document.getElementById(`${domainId}-end-date`).value;
            
            if (!startDate || !endDate) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: Start and end dates are required`);
            } else if (new Date(startDate) >= new Date(endDate)) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: End date must be after start date`);
            }
            
            // Check grid dimensions
            const eWe = parseInt(document.getElementById(`${domainId}-e_we`).value);
            const eSn = parseInt(document.getElementById(`${domainId}-e_sn`).value);
            
            if (eWe < 1 || eSn < 1) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: Grid dimensions must be positive integers`);
            }
            
            // Check resolution
            const resolution = parseFloat(document.getElementById(`${domainId}-resolution`).value);
            if (resolution <= 0) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: Resolution must be greater than 0`);
            }
            
            // Check coordinates
            const refLat = parseFloat(document.getElementById(`${domainId}-ref-lat`).value);
            const refLon = parseFloat(document.getElementById(`${domainId}-ref-lon`).value);
            
            if (isNaN(refLat) || refLat < -90 || refLat > 90) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: Latitude must be between -90 and 90`);
            }
            
            if (isNaN(refLon) || refLon < -180 || refLon > 180) {
                errors.push(`Domain ${domainId.split('-')[1] || 'Parent'}: Longitude must be between -180 and 180`);
            }
            
            // For nested domains, check parent relationship
            if (!isParent && forNamelist) {
                const parentRatio = parseInt(document.getElementById(`${domainId}-parent-grid-ratio`).value);
                
                if (parentRatio < 1) {
                    errors.push(`Domain ${domainId.split('-')[1]}: Parent grid ratio must be at least 1`);
                }
                
                // Check if nested domain is within parent
                if (domainRectangles[parentId] && domainRectangles[domainId]) {
                    const parentBounds = domainRectangles[parentId].getBounds();
                    const childBounds = domainRectangles[domainId].getBounds();
                    
                    if (!parentBounds.contains(childBounds)) {
                        errors.push(`Domain ${domainId.split('-')[1]}: Nested domain must be completely within its parent domain`);
                    }
                }
            }
        });
        
        if (errors.length > 0 && forNamelist) {
            showValidationErrors(errors);
        } else if (errors.length === 0) {
            hideValidationErrors();
        }
        
        return errors;
    }
    
    // Function to show validation errors
    function showValidationErrors(errors) {
        validationErrors.innerHTML = errors.map(error => 
            `<div class="error">${error}</div>`
        ).join('');
        validationErrors.style.display = 'block';
    }
    
    // Function to hide validation errors
    function hideValidationErrors() {
        validationErrors.style.display = 'none';
    }
    
    // Function to load presets
    async function loadPresets() {
        try {
            const response = await fetch('presets.json');
            const presets = await response.json();
            
            // Clear existing options
            presetSelect.innerHTML = '<option value="">Custom Configuration</option>';
            
            // Add presets
            presets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading presets:', error);
            // Fallback to hardcoded presets if fetch fails
            const fallbackPresets = [
                {
                    name: "US Midwest Example",
                    description: "Example configuration for Midwest US with 2 nested domains",
                    configuration: {
                        domains: [
                            {
                                start_date: new Date().toISOString(),
                                end_date: new Date(Date.now() + 86400000).toISOString(),
                                interval_seconds: 21600,
                                resolution: 12,
                                e_we: 120,
                                e_sn: 100,
                                ref_lat: 40.0,
                                ref_lon: -95.0,
                                truelat1: 30.0,
                                truelat2: 60.0,
                                stand_lon: -95.0,
                                parent_grid_ratio: 1
                            },
                            {
                                resolution: 4,
                                e_we: 100,
                                e_sn: 100,
                                ref_lat: 40.0,
                                ref_lon: -95.0,
                                parent_grid_ratio: 3
                            }
                        ]
                    }
                }
            ];
        
            presetSelect.innerHTML = '<option value="">Custom Configuration</option>';
            fallbackPresets.forEach((preset, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = preset.name;
                presetSelect.appendChild(option);
            });
        }
    }
    
    // Function to load a preset configuration
    async function loadPresetConfiguration() {
        const presetIndex = this.value;
        if (!presetIndex) return;
        
        try {
            const response = await fetch('presets.json');
            const presets = await response.json();
            const preset = presets[presetIndex];
            
            // Clear existing domains
            while (domains.length > 0) {
                removeDomain(domains[0]);
            }
            
            // Add domains from preset
            preset.configuration.domains.forEach((domainConfig, index) => {
                if (index === 0) {
                    // First domain is parent
                    addDomain();
                } else {
                    // Nested domains
                    addDomain(`domain-${index-1}`);
                }
                
                const domainId = `domain-${domains.length-1}`;
                
                // Set values for each field
                for (const [key, value] of Object.entries(domainConfig)) {
                    const inputId = `${domainId}-${key.replace(/_/g, '-')}`;
                    const input = document.getElementById(inputId);
                    if (input) {
                        if (key.includes('date')) {
                            // Handle date fields
                            const datePicker = input._flatpickr;
                            if (datePicker) {
                                datePicker.setDate(value);
                            }
                        } else {
                            input.value = value;
                        }
                    }
                }
                
                // Update map
                updateDomainOnMap(domainId);
            });
            
            // Validate configuration
            validateConfiguration();
            
        } catch (error) {
            console.error('Error loading preset:', error);
            alert('Failed to load preset configuration');
        }
    }
    
    // Function to save current configuration as a preset
    function savePreset() {
        const presetName = prompt("Enter a name for this preset:");
        if (!presetName) return;
        
        const domainsConfig = domains.map(domainId => {
            const config = {
                resolution: parseFloat(document.getElementById(`${domainId}-resolution`).value),
                e_we: parseInt(document.getElementById(`${domainId}-e_we`).value),
                e_sn: parseInt(document.getElementById(`${domainId}-e_sn`).value),
                ref_lat: parseFloat(document.getElementById(`${domainId}-ref-lat`).value),
                ref_lon: parseFloat(document.getElementById(`${domainId}-ref-lon`).value),
                parent_grid_ratio: parseInt(document.getElementById(`${domainId}-parent-grid-ratio`).value)
            };
            
            if (domainId === 'domain-0') {
                config.start_date = document.getElementById(`${domainId}-start-date`).value;
                config.end_date = document.getElementById(`${domainId}-end-date`).value;
                config.interval_seconds = parseInt(document.getElementById(`${domainId}-interval`).value);
                config.truelat1 = parseFloat(document.getElementById(`${domainId}-truelat1`).value);
                config.truelat2 = parseFloat(document.getElementById(`${domainId}-truelat2`).value);
                config.stand_lon = parseFloat(document.getElementById(`${domainId}-stand-lon`).value);
            }
            
            return config;
        });
        
        const newPreset = {
            name: presetName,
            description: "Custom configuration saved by user",
            configuration: {
                domains: domainsConfig
            }
        };
        
        // In a real application, you would save this to a database or local storage
        // For this example, we'll just show an alert
        alert(`Preset "${presetName}" would be saved in a real application.`);
        console.log("New preset:", newPreset);
    }
    
    // Function to share configuration
    function shareConfiguration() {
        const domainsConfig = domains.map(domainId => {
            const config = {
                resolution: parseFloat(document.getElementById(`${domainId}-resolution`).value),
                e_we: parseInt(document.getElementById(`${domainId}-e_we`).value),
                e_sn: parseInt(document.getElementById(`${domainId}-e_sn`).value),
                ref_lat: parseFloat(document.getElementById(`${domainId}-ref-lat`).value),
                ref_lon: parseFloat(document.getElementById(`${domainId}-ref-lon`).value),
                parent_grid_ratio: parseInt(document.getElementById(`${domainId}-parent-grid-ratio`).value)
            };
            
            if (domainId === 'domain-0') {
                config.start_date = document.getElementById(`${domainId}-start-date`).value;
                config.end_date = document.getElementById(`${domainId}-end-date`).value;
                config.interval_seconds = parseInt(document.getElementById(`${domainId}-interval`).value);
                config.truelat1 = parseFloat(document.getElementById(`${domainId}-truelat1`).value);
                config.truelat2 = parseFloat(document.getElementById(`${domainId}-truelat2`).value);
                config.stand_lon = parseFloat(document.getElementById(`${domainId}-stand-lon`).value);
            }
            
            return config;
        });
        
        const configString = JSON.stringify({
            domains: domainsConfig
        });
        
        // In a real application, you would upload this to a server and get a shareable link
        // For this example, we'll just copy to clipboard
        navigator.clipboard.writeText(configString)
            .then(() => alert("Configuration copied to clipboard! Share this with others."))
            .catch(() => alert("Could not copy configuration to clipboard."));
    }
    
    // Helper function to format date for namelist
    function formatDateForNamelist(dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}_${hours}:${minutes}:00`;
    }
});