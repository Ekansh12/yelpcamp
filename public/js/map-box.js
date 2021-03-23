const error= ()=>{
    const layerList = document.getElementById('map');
    const map = new mapboxgl.Map({
        container: layerList,
        style: 'mapbox://styles/mapbox/streets-v11'
    });

    const para = document.createElement("p");
    para.classList.add("locationNotFound");
    const node = document.createTextNode("This place is not found!!");
    para.appendChild(node);
    const element = document.getElementById("map");
    element.appendChild(para);

    
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZWthbnNoMjQiLCJhIjoiY2ttZ21uMTY2MzFobzJ2bGFjYWFqcGx6NiJ9.RYkq5Y8YGhcnrYlUS6ABpw';
const mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });

mapboxClient.geocoding
.forwardGeocode({
    query: campLocation,
    autocomplete: false,
    limit: 1
})
.send(error())
.then(function (response) {
    if (response && response.body && response.body.features && response.body.features.length){
        const layerList = document.getElementById('map');
        const inputs = layerList.getElementsByClassName('input');
        const button=layerList.getElementsByClassName("button");
        const para=layerList.getElementsByClassName("locationNotFound")[0];
        para.classList.add("d-none");
        
        const feature = response.body.features[0];
        const map = new mapboxgl.Map({
            container: layerList,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: feature.center,
            zoom: 12
        });

        map.scrollZoom.disable();
        
        function switchLayer(layer) {
            const layerId = layer.target.id;
            map.setStyle('mapbox://styles/mapbox/' + layerId);
        }

        button[0].onclick = ()=> map.flyTo({ center: feature.center });;
        
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].onclick = switchLayer;
        }
        new mapboxgl.Marker().setLngLat(feature.center).addTo(map);
        map.addControl(new mapboxgl.NavigationControl());
    }
});