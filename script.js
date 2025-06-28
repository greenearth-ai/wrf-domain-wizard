// Initialize map 
const map = L.map('map').setView([20, 0], 2); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
  attribution: '© OpenStreetMap' 
}).addTo(map); 

let drawnItems = new L.FeatureGroup(); 
map.addLayer(drawnItems);

// Store domain references
const domains = [];

// Initialize draw control (disabled for now)
const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: false
});
map.addControl(drawControl);

// Ensure map is fully initialized
map.whenReady(function() {
  document.getElementById('drawBtn').addEventListener('click', drawDomains);
  document.getElementById('exportBtn').addEventListener('click', exportNamelist);
});

function drawDomains() {
  try {
    // Clear previous domains
    drawnItems.clearLayers();
    domains.length = 0;
    
    const domainCount = parseInt(document.getElementById('domainCount').value);
    const bounds = map.getBounds();
    
    // Validate bounds
    if (!bounds.isValid()) {
      throw new Error("Invalid map bounds. Please zoom to a valid area.");
    }
    
    // Draw each domain
    for (let i = 0; i < domainCount; i++) {
      const nestFactor = 0.8 ** i;
      const nestedBounds = calculateNestedBounds(bounds, nestFactor);
      
      const domain = L.rectangle(nestedBounds, {  
        color: i === 0 ? 'red' : i === 1 ? 'blue' : 'green',  
        weight: 2,
        fillOpacity: 0.1,
        className: `domain-${i}`
      }).addTo(drawnItems);
      
      // Enable editing (resizing and moving)
      if (domain.editing) {
        domain.editing.enable();
      } else {
        domain.editing = new L.Handler.RectangleEdit(domain, map);
        domain.editing.enable();
      }
      
      // Store reference
      domains.push(domain);
      
      // Update output when domain is modified
      domain.on('edit', function() {
        updateOutputFromDomains();
      });
    }
    
    updateOutputFromDomains();
    
  } catch (error) {
    console.error("Drawing error:", error);
    alert(`Error: ${error.message}`);
  }
}

function calculateNestedBounds(bounds, nestFactor) {
  return L.latLngBounds(
    [
      bounds.getSouth() + (bounds.getCenter().lat - bounds.getSouth()) * (1 - nestFactor),
      bounds.getWest() + (bounds.getCenter().lng - bounds.getWest()) * (1 - nestFactor)
    ],
    [
      bounds.getNorth() - (bounds.getNorth() - bounds.getCenter().lat) * (1 - nestFactor),
      bounds.getEast() - (bounds.getEast() - bounds.getCenter().lng) * (1 - nestFactor)
    ]
  );
}

function updateOutputFromDomains() {
  let output = `<h5>Domain Boundaries</h5>`;
  
  domains.forEach((domain, i) => {
    const bounds = domain.getBounds();
    output += `
      <p><strong>Domain ${i + 1}:</strong><br>
      SW: ${bounds.getSouthWest().lat.toFixed(4)}, ${bounds.getSouthWest().lng.toFixed(4)}<br>
      NE: ${bounds.getNorthEast().lat.toFixed(4)}, ${bounds.getNorthEast().lng.toFixed(4)}
      </p>
    `;
  });
  
  document.getElementById('output').innerHTML = output;
}

function exportNamelist() {
  try {
    if (domains.length === 0) {
      throw new Error("Please draw domains first");
    }
    
    const domainCount = domains.length;
    const bounds = domains[0].getBounds(); // Use parent domain bounds
    
    const namelist = generateNamelist(bounds, domainCount);
    
    const blob = new Blob([namelist], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namelist.wps';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export error:", error);
    alert(`Error: ${error.message}`);
  }
}