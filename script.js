// Initialize map 
const map = L.map('map').setView([20, 0], 2); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
  attribution: '© OpenStreetMap' 
}).addTo(map); 

let drawnItems = new L.FeatureGroup(); 
map.addLayer(drawnItems);

// Ensure map is fully initialized
map.whenReady(function() {
  document.getElementById('drawBtn').addEventListener('click', drawDomains);
  document.getElementById('exportBtn').addEventListener('click', exportNamelist);
});

function drawDomains() {
  try {
    // Clear previous domains
    drawnItems.clearLayers();
    
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
      
      L.rectangle(nestedBounds, {  
        color: i === 0 ? '#ff0000' : i === 1 ? '#0000ff' : '#00ff00',  
        weight: 2,
        fillOpacity: 0.1,
        className: `domain-${i}`
      }).addTo(drawnItems);
    }
    
    updateOutput(bounds, domainCount);
    
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

function updateOutput(bounds, domainCount) {
  let output = `<h5>Domain Boundaries</h5>`;
  for (let i = 0; i < domainCount; i++) {
    const nestFactor = 0.8 ** i;
    const nestedBounds = calculateNestedBounds(bounds, nestFactor);
    output += `
      <p><strong>Domain ${i + 1}:</strong><br>
      SW: ${nestedBounds.getSouthWest().lat.toFixed(2)}, ${nestedBounds.getSouthWest().lng.toFixed(2)}<br>
      NE: ${nestedBounds.getNorthEast().lat.toFixed(2)}, ${nestedBounds.getNorthEast().lng.toFixed(2)}
      </p>
    `;
  }
  document.getElementById('output').innerHTML = output;
}

function exportNamelist() {
  try {
    const domainCount = parseInt(document.getElementById('domainCount').value);
    const bounds = map.getBounds();
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
    alert("Error generating namelist.wps. Please draw domains first.");
  }
}