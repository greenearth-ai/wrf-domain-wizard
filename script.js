// Initialize map 

const map = L.map('map').setView([20, 0], 2); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 

  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 

}).addTo(map); 

 

// Feature group for domains 

const drawnItems = new L.FeatureGroup(); 

map.addLayer(drawnItems); 

 

// Add draw controls 

const drawControl = new L.Control.Draw({ 

  edit: { 

    featureGroup: drawnItems, 

    edit: false 

  }, 

  draw: { 

    rectangle: { 

      showArea: false, 

      repeatMode: false 

    }, 

    polygon: false, 

    circle: false, 

    marker: false, 

    polyline: false 

  } 

}); 

map.addControl(drawControl); 

 

// Draw initial domains 

document.getElementById('drawBtn').addEventListener('click', () => { 

  drawnItems.clearLayers(); 

  const domainCount = parseInt(document.getElementById('domainCount').value); 

   

  for (let i = 0; i < domainCount; i++) { 

    const bounds = getNestedBounds(map.getBounds(), i); 

    const rectangle = L.rectangle(bounds, { 

      color: i === 0 ? '#d9534f' : '#5bc0de', 

      weight: 2, 

      fillOpacity: 0.1, 

      draggable: true 

    }).addTo(drawnItems); 

     

    rectangle.editing.enable(); 

    rectangle.on('edit', updateOutput); 

  } 

   

  updateOutput(); 

}); 

 

// Calculate nested bounds 

function getNestedBounds(bounds, index) { 

  const nestFactor = 0.8 ** index; 

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

 

// Update output display 

function updateOutput() { 

  let output = '<h5>Domain Boundaries</h5>'; 

  let counter = 1; 

   

  drawnItems.eachLayer(layer => { 

    const bounds = layer.getBounds(); 

    output += ` 

      <div class="domain-info mb-2 p-2 border rounded"> 

        <strong>Domain ${counter}:</strong><br> 

        SW: ${bounds.getSouthWest().lat.toFixed(4)}, ${bounds.getSouthWest().lng.toFixed(4)}<br> 

        NE: ${bounds.getNorthEast().lat.toFixed(4)}, ${bounds.getNorthEast().lng.toFixed(4)}<br> 

        Center: ${bounds.getCenter().lat.toFixed(4)}, ${bounds.getCenter().lng.toFixed(4)} 

      </div> 

    `; 

    counter++; 

  }); 

   

  document.getElementById('output').innerHTML = output; 

} 

 

// Export namelist.wps 

document.getElementById('exportBtn').addEventListener('click', () => { 

  const domains = []; 

  drawnItems.eachLayer(layer => domains.push(layer.getBounds())); 

   

  if (domains.length === 0) { 

    alert("Please generate domains first!"); 

    return; 

  } 

   

  const namelist = generateNamelist(domains); 

  const blob = new Blob([namelist], { type: 'text/plain' }); 

  const url = URL.createObjectURL(blob); 

  const a = document.createElement('a'); 

  a.href = url; 

  a.download = 'namelist.wps'; 

  document.body.appendChild(a); 

  a.click(); 

  document.body.removeChild(a); 

  URL.revokeObjectURL(url); 

}); 

 

// Initialize 

updateOutput(); 