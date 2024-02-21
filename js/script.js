CHEMIN_LISTE_FLUX = "data/listeFlux.json"
VERSION_WMS = "1.3.0"

const app = Vue.createApp({
    data() {
        return {
            maxNbCartes: 6,
            nbCartes: 1,

            hauteurEcran: window.innerHeight,
            largeurEcran: window.innerWidth,
            largeurCarte: window.innerWidth,
            hauteurCarte: window.innerHeight,

            listeFlux: {},
            listeFluxCategories: {},
            listeSelectionFlux: Array(6).fill("OpenStreetMaps"),

            cartes: [],
            couchesCumulees: [],
            coordonnees: [46.5, 2],
            zoom: 6,

            recherche: ""
        }
    },
    
    mounted() {
        window.addEventListener('resize', this.actualiserDimensionsEcran);
        this.initialiserFlux().then(() => {this.actualiserAffichage()});
    },

    beforeUnmout() {
        window.removeEventListener('resize', this.actualiserDimensionsEcran);
    },

    methods: {
        actualiserAffichage() {
            if (this.cartes.length > 0) {
                this.coordonnees = this.cartes[0].getCenter()
                this.zoom = this.cartes[0].getZoom()
            }
            this.actualiserDimensionsCartes();   
            this.$nextTick(() => {
                this.supprimerCartes()

                this.initialiserCartes();

                this.cartes.forEach(carte1 => {
                    this.cartes.forEach(carte2 => {
                        if (carte1 !== carte2) {
                            carte1.sync(carte2);
                        }
                    });
                });
            });
        },

        
        actualiserCarte(i) {
            let fluxChoisi = this.listeFlux[this.listeSelectionFlux[i]];
            let carte = this.cartes[i];
            if (this.couchesCumulees[i].length > 1 ) {
                let derniereCouche = this.couchesCumulees[i].pop();
                carte.removeLayer(derniereCouche);
            }
            let coucheFlux = this.ajouterCoucheFlux(carte, fluxChoisi);
            this.couchesCumulees[i].push(coucheFlux);
        },

        actualiserDimensionsCartes() {
            if (this.nbCartes == 1) {
                this.largeurCarte = this.largeurEcran;
                this.hauteurCarte = this.hauteurEcran;
            } else if (this.nbCartes == 2) {
                this.largeurCarte = this.largeurEcran/2;
                this.hauteurCarte = this.hauteurEcran;
            } else if (this.nbCartes == 3) {
                this.largeurCarte = this.largeurEcran/3;
                this.hauteurCarte = this.hauteurEcran/1;
            } else if (this.nbCartes == 4) {
                this.largeurCarte = this.largeurEcran/2;
                this.hauteurCarte = this.hauteurEcran/2;
            } else if (this.nbCartes == 5) {
                this.largeurCarte = this.largeurEcran/5;
                this.hauteurCarte = this.hauteurEcran/1;
            } else if (this.nbCartes == 6) {
                this.largeurCarte = this.largeurEcran/3;
                this.hauteurCarte = this.hauteurEcran/2;
            }
        },

        actualiserDimensionsEcran() {
            this.largeurEcran = window.innerWidth;
            this.hauteurEcran = window.innerHeight;
            
            this.actualiserDimensionsCartes()
        },

        ajouterCoucheFlux(carte, fluxChoisi) {
            let coucheFlux;
            if (fluxChoisi.service === 'XYZ') {
                coucheFlux = L.tileLayer(fluxChoisi.url, {maxZoom: 18}).addTo(carte);
            } else if (fluxChoisi.service === 'WMS') {
                coucheFlux = L.tileLayer.wms(fluxChoisi.url, {layers: fluxChoisi.couche_wms, version: VERSION_WMS}).addTo(carte);
            } else if (fluxChoisi.service === 'TMS') {
                coucheFlux =  L.tileLayer(fluxChoisi.url, {maxZoom: 18, tms: true}).addTo(carte);
            }

            carte.attributionControl.setPrefix(fluxChoisi.url);

            return coucheFlux;
        },

        initialiserCartes() {
            for (let i = 0; i < this.nbCartes; i++) {
                let fluxChoisi = this.listeFlux[this.listeSelectionFlux[i]];
                let carte = L.map('carte' + i).setView(this.coordonnees, this.zoom);
                let coucheFlux = this.ajouterCoucheFlux(carte, fluxChoisi);
                this.cartes.push(carte);
                this.couchesCumulees[i].push(coucheFlux);
            }
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

        supprimerCartes() {
            this.couchesCumulees = Array(this.maxNbCartes).fill([]).map(() => []);
                while (this.cartes.length > 0) {
                    derniereCarte = this.cartes.pop();
                    derniereCarte.remove()
                }
        },

        telechargerImage() {
            for (let i = 0; i < this.cartes.length; i++) {
                leafletImage(this.cartes[i], function(err, canvas) {
                    let a = document.createElement("a");
                    a.href = canvas.toDataURL();
                    a.download = "carte" + i + ".png"; 
                    a.click();
                });
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
                
                this.cartes.forEach(carte => {
                    carte.setView(coordin, 13)
                });
            })
        }
    }
});

app.mount("#app");