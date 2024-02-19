let form = document.getElementById('form')
form.addEventListener('submit',function(evt){
    // empeche d'envoyer les donnees a serveur
    evt.preventDefault();
    
    let elemrech = document.getElementById('rech');
    let rech = elemrech.value
    console.log(rech);



        fetch('https://nominatim.openstreetmap.org/search?format=json&q='+rech)
        .then(function(rep){
            return rep.json()
        })
        .then(function(result){
            let coordin = [
                result[0].lat,
                result[0].lon
            ]
            mapHG.setView(coordin,13)
        })
    
})
