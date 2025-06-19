// Initialize map 

const map = L.map('map').setView([20, 0], 2); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 

  attribution: '© OpenStreetMap' 

}).addTo(map); 

 

let drawnItems = new L.FeatureGroup(); 

map.addLayer(drawnItems); 

 

// Draw domains 

document.getElementById('drawBtn').addEventListener('click', () => { 

  try { 

    drawnItems.clearLayers(); 

    const domainCount = parseInt(document.getElementById('domainCount').value); 

    const bounds = map.getBounds(); 

     

    for (let i = 0; i < domainCount; i++) { 

      const nestFactor = 0.8 ** i; 

      const nestedBounds = L.latLngBounds( 

        [ 

          bounds.getSouth() + (bounds.getCenter().lat - bounds.getSouth()) * (1 - nestFactor), 

          bounds.getWest() + (bounds.getCenter().lng - bounds.getWest()) * (1 - nestFactor) 

        ], 

        [ 

          bounds.getNorth() - (bounds.getNorth() - bounds.getCenter().lat) * (1 - nestFactor), 

          bounds.getEast() - (bounds.getEast() - bounds.getCenter().lng) * (1 - nestFactor) 

        ] 

      ); 

       

      L.rectangle(nestedBounds, {  

        color: i === 0 ? 'red' : 'blue',  

        weight: 2, 

        fillOpacity: 0.1 

      }).addTo(drawnItems); 

    } 

     

    updateOutput(bounds, domainCount); 

  } catch (error) { 

    console.error("Drawing error:", error); 

    alert("Error drawing domains. Check console for details."); 

  } 

}); 

 

// Update output display 

function updateOutput(bounds, domainCount) { 

  let output = `<h5>Domain Boundaries</h5>`; 

  for (let i = 0; i < domainCount; i++) { 

    const nestFactor = 0.8 ** i; 

    const nestedBounds = L.latLngBounds( 

      [ 

        bounds.getSouth() + (bounds.getCenter().lat - bounds.getSouth()) * (1 - nestFactor), 

        bounds.getWest() + (bounds.getCenter().lng - bounds.getWest()) * (1 - nestFactor) 

      ], 

      [ 

        bounds.getNorth() - (bounds.getNorth() - bounds.getCenter().lat) * (1 - nestFactor), 

        bounds.getEast() - (bounds.getEast() - bounds.getCenter().lng) * (1 - nestFactor) 

      ] 

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

    alert("Error generating namelist.wps. Check console for details."); 

  } 

}); 