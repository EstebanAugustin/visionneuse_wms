CHEMIN_LISTE_FLUX = "data/listeFlux.json"
VERSION_WMS = "1.3.0"

const app = Vue.createApp({
    data() {
        return {
            nbCartes: 2,

            hauteurEcran: window.innerHeight,
            largeurEcran: window.innerWidth,
            largeurCarte: window.innerWidth,
            hauteurCarte: window.innerHeight,

            listeFlux: {},
            listeFluxCategories: {},
            listeSelectionFlux: Array(6).fill("OpenStreetMaps"),

            carte: null,

            dernierFluxGauche: null,
            dernierFluxDroit: null,

            recherche: "",

            attributionFluxDroit: "",
            attributionFluxGauche: ""
        }
    },
    
    mounted() {
        window.addEventListener('resize', this.actualiserDimensionsEcran);
        this.initialiserFlux().then(() => {this.initialiserCarte()});
    },

    beforeUnmout() {
        window.removeEventListener('resize', this.actualiserDimensionsEcran);
    },

    methods: {
        actualiserDimensionsEcran() {
            this.largeurEcran = window.innerWidth;
            this.hauteurEcran = window.innerHeight;
        },

        actualiserFluxGauche() {
            this.carte.removeLayer(this.dernierFluxGauche)
            let fluxGauche = this.listeFlux[this.listeSelectionFlux[0]]
            this.ajouterCoucheFluxGauche(this.carte, fluxGauche);
            this.dernierFluxGauche = fluxGauche;

        },

        actualiserFluxDroit() {
            this.carte.removeLayer(this.dernierFluxDroit)
            let fluxDroit = this.listeFlux[this.listeSelectionFlux[1]]
            this.ajouterCoucheFluxDroit(this.carte, fluxDroit);
            this.dernierFluxDroit = fluxDroit;
        },

        ajouterCoucheFluxDroit(carte, fluxChoisi) {
            let coucheFlux;
            if (fluxChoisi.service === 'XYZ') {
                coucheFlux = L.tileLayer(fluxChoisi.url, {maxZoom: 18}).addTo(carte);
            } else if (fluxChoisi.service === 'WMS') {
                coucheFlux = L.tileLayer.wms(fluxChoisi.url, {layers: fluxChoisi.couche_wms, version: VERSION_WMS}).addTo(carte);
            } else if (fluxChoisi.service === 'TMS') {
                let urlTMS = fluxChoisi.url.replace("{y}", "{-y}")
                coucheFlux =  L.tileLayer(urlTMS, {maxZoom: 18}).addTo(carte);
            }

            this.attributionFluxDroit = fluxChoisi.url;

            return coucheFlux;
        },

        ajouterCoucheFluxGauche(carte, fluxChoisi) {
            let coucheFlux;
            if (fluxChoisi.service === 'XYZ') {
                coucheFlux = L.tileLayer(fluxChoisi.url, {maxZoom: 18, pane: "swipePane"}).addTo(carte);
            } else if (fluxChoisi.service === 'WMS') {
                coucheFlux = L.tileLayer.wms(fluxChoisi.url, {layers: fluxChoisi.couche_wms, version: VERSION_WMS, pane: "swipePane"}).addTo(carte);
            } else if (fluxChoisi.service === 'TMS') {
                coucheFlux =  L.tileLayer(fluxChoisi.url, {maxZoom: 18, tms: true}).addTo(carte);
            }

            this.attributionFluxGauche = fluxChoisi.url;

            return coucheFlux;
        },

        initialiserCarte() {
            this.carte = L.map('carte0').setView([46.5, 2], 6);

            let fluxGauche = this.listeFlux[this.listeSelectionFlux[0]]
            let fluxDroit = this.listeFlux[this.listeSelectionFlux[1]]
            this.ajouterCoucheFluxGauche(this.carte, fluxGauche);
            this.ajouterCoucheFluxDroit(this.carte, fluxDroit);
            this.dernierFluxGauche = fluxGauche
            this.dernierFluxDroit = fluxDroit

            
            L.control.swipe().addTo(this.carte);
        },

        async initialiserFlux() {
            try {
                const response = await fetch(CHEMIN_LISTE_FLUX);
                if (!response.ok) {
                    throw new Error('Flux inatteignables.');
                }
                const data = await response.json();
                this.listeFlux = data.listeFlux;
    
                for (const nomFlux in this.listeFlux) {
                    const flux = this.listeFlux[nomFlux];
                    const categorie = flux.categorie;
                
                    if (!this.listeFluxCategories[categorie]) {
                        this.listeFluxCategories[categorie] = [];
                    }
                
                    this.listeFluxCategories[categorie].push(nomFlux);
                }

                // Trier les catégories par ordre alphabétique
                let categories = Object.keys(this.listeFluxCategories);
                categories.sort();
                let temp = {}
                categories.forEach(categorie => {
                    temp[categorie] = this.listeFluxCategories[categorie];
                  });
                this.listeFluxCategories = temp;
            } catch (error) {
                console.error(error);
            }

        },

        zoomRecherche() {
            fetch('https://nominatim.openstreetmap.org/search?format=json&q='+this.recherche)
            .then(rep => rep.json())
            .then(data => {
                let coordin = [
                    data[0].lat,
                    data[0].lon
                ]
                
                this.carte.setView(coordin,13)
            })
        }
    }
});

app.mount("#app");