// Initialize map 

const map = L.map('map').setView([20, 0], 2); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 

  attribution: '© OpenStreetMap' 

}).addTo(map); 

 

let drawnItems = new L.FeatureGroup(); 

map.addLayer(drawnItems); 

 

// Draw domains based on user selection 

document.getElementById('drawBtn').addEventListener('click', () => { 

  drawnItems.clearLayers(); 

  const domainCount = parseInt(document.getElementById('domainCount').value); 

  let bounds = map.getBounds(); 

 

  for (let i = 0; i < domainCount; i++) { 

    // Adjust bounds for nested domains (example: shrink by 20%) 

    const nestFactor = 0.8 ** i; 

    const nestedBounds = L.latLngBounds( 

      map.getCenter().lat - (map.getCenter().lat - bounds.getSouth()) * nestFactor, 

      map.getCenter().lng - (map.getCenter().lng - bounds.getWest()) * nestFactor, 

      map.getCenter().lat + (bounds.getNorth() - map.getCenter().lat) * nestFactor, 

      map.getCenter().lng + (bounds.getEast() - map.getCenter().lng) * nestFactor 

    ); 

     

    L.rectangle(nestedBounds, { color: i === 0 ? 'red' : 'blue', weight: 2 }).addTo(drawnItems); 

  } 

 

  // Display coordinates 

  updateOutput(bounds, domainCount); 

}); 

 

// Update the UI with domain info 

function updateOutput(bounds, domainCount) { 

  let output = `<h5>Domain Boundaries</h5>`; 

  for (let i = 0; i < domainCount; i++) { 

    const nestFactor = 0.8 ** i; 

    const nestedBounds = L.latLngBounds( 

      map.getCenter().lat - (map.getCenter().lat - bounds.getSouth()) * nestFactor, 

      map.getCenter().lng - (map.getCenter().lng - bounds.getWest()) * nestFactor, 

      map.getCenter().lat + (bounds.getNorth() - map.getCenter().lat) * nestFactor, 

      map.getCenter().lng + (bounds.getEast() - map.getCenter().lng) * nestFactor 

    ); 

    output += ` 

      <p><strong>Domain ${i + 1}:</strong><br> 

      SW: ${nestedBounds.getSouthWest().lat.toFixed(2)}, ${nestedBounds.getSouthWest().lng.toFixed(2)}<br> 

      NE: ${nestedBounds.getNorthEast().lat.toFixed(2)}, ${nestedBounds.getNorthEast().lng.toFixed(2)} 

      </p> 

    `; 

  } 

  document.getElementById('output').innerHTML = output; 

} 

 

// Export namelist.wps 

document.getElementById('exportBtn').addEventListener('click', () => { 

  const domainCount = parseInt(document.getElementById('domainCount').value); 

  const bounds = map.getBounds(); 

  const namelist = generateNamelist(bounds, domainCount); 

   

  // Create downloadable file 

  const blob = new Blob([namelist], { type: 'text/plain' }); 

  const url = URL.createObjectURL(blob); 

  const a = document.createElement('a'); 

  a.href = url; 

  a.download = 'namelist.wps'; 

  a.click(); 

}); 