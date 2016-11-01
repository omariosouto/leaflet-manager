(function() {
	"use strict";

	var LeafletManager = {
		/**
		* Objetos de configuração do Mapa Atual
		**/ 
		currentID: 0,
		currentObject: {},
		currentMapObject: {},
		currentMapMarkers: [],
		currentMarkerImg: undefined,
		currentMarkerActiveImg: undefined,
		currentMarker: undefined,
		/**
		* Inicializador do Mapa
		**/ 
		maps: document.querySelectorAll('.leaflet-map'),
		/**
		* Aplica o evento de Click para mudar a Localização de forma externa
		**/ 
		changeLocation: function changeLocation() {
			var self = this;
			// - Change Location
			var currentID = self.currentID;

			var currClickelement = self.currentObject.getAttribute('lm-changeLocation');
				currClickelement = document.querySelectorAll(currClickelement);
				
				if(currClickelement.length <= 0 ) {
					return false;
				}

				currClickelement = Array.prototype.slice.call(currClickelement,0);
				
				currClickelement.forEach(function(value, index){
					currClickelement[index].addEventListener('click', function(e) {
						
						console.log(currentID); // Mapa Atual

						var lat = this.getAttribute("lat");
						var long = this.getAttribute("long");
						var lm_id = this.getAttribute("lm-id");
						self.currentMapMarkers[currentID][lm_id].togglePopup();

					}, false);
				});

		},
		nextLocation: function nextLocation() {
			var self = this;
			// Config
			var currentID = self.currentID;
			var currentObject = self.currentObject;
			
			var currClickelement = currentObject.getAttribute('lm-next');
				currClickelement = document.querySelectorAll(currClickelement);
				currClickelement = Array.prototype.slice.call(currClickelement,0);

				if(currClickelement.length <= 0 ) {
					return false;
				}
				console.log(currClickelement);

				currClickelement.forEach(function(value, index){
					
					currClickelement[index].addEventListener('click', function(e) {
						var lm_id = currentObject.LeafletManager.currentMarker;
						var totalMarkers = self.currentMapMarkers[currentID].length - 1;

						if( lm_id == undefined || lm_id >= totalMarkers) {
							lm_id = -1;
						}
						
						console.log('ID Mapa: ', currentID);
						console.log('Marcador atual: ', lm_id + 1);
						self.currentMapMarkers[currentID][lm_id + 1].togglePopup();

					});

				});

		},
		prevLocation: function prevLocation() {
			var self = this;
			// Config
			var currentID = self.currentID;
			var currentObject = self.currentObject;
			
			var currClickelement = currentObject.getAttribute('lm-prev');
				currClickelement = document.querySelectorAll(currClickelement);
				currClickelement = Array.prototype.slice.call(currClickelement,0);

				if(currClickelement.length <= 0 ) {
					return false;
				}
				console.log(currClickelement);

				currClickelement.forEach(function(value, index){
					
					currClickelement[index].addEventListener('click', function(e) {

						var lm_id = currentObject.LeafletManager.currentMarker;
						var totalMarkers = self.currentMapMarkers[currentID].length;

						if( lm_id == undefined || lm_id == 0 ) {
							lm_id = totalMarkers;
						}
						
						console.log('ID Mapa: ', currentID);
						console.log('Marcador atual: ', lm_id - 1);
						self.currentMapMarkers[currentID][lm_id - 1].togglePopup();

					});

				});
		},
		/**
		* Define os Marcadores (PINs)
		**/ 
		setMarkers: function setMarkers() {
			var self = this;

			var curr;
			var currentObject = self.currentObject;
			var currentMapObject = self.currentMapObject;
			var markers = []; // Criando o array de markers (é usado como referencia na hora de atribuir um click externo para ativação)
			var obj = document.getElementById(self.currentObject.getAttribute('lm-placelist')); // Pega o elemento que contem a lista para gerar os marcadores
			var placesList = JSON.parse(obj.innerHTML); //Pega a lista que DEVE ser um JSONP
			var markerImg = self.currentObject.getAttribute('lm-marker'); //Imagem do Marcador atual
			
			// - Criando os Marcadores
		    placesList.map(function(item, index){
		    	var content = "<div class='map-card'></div>";	
				var showCard = self.currentObject.getAttribute('lm-showcard') === 'true' ? true : false;
	

				if(showCard) {
			    	// Criação do card que aparece ao clicar no marcador
				    content = "<div class='map-card'><div class='map-card-image' style='background-image: url("+item.img+");'></div><h3 class='map-card-title'>"+item.nome+"<span>("+item.sigla+")</span></h3><p>"+item.excerpt+"</p></div>";
				}

			    var marker = L.marker([item.lat, item.long]).bindPopup(content).addTo( self.currentMapObject );
			    markers.push(marker);

			    if(markerImg) {
			    	markers[index]._icon.setAttribute('src', markerImg); // Atribuição da imagem ao PIN
			    }
			    markers[index]._icon.lm_id = index;

		    });

		    // Atribuição dos marcadores do mapa atual ao objeto atual.
		    self.currentMapMarkers[self.currentID] = markers;

			// Definição das imagens dos marcadores
			self.currentMapObject.on('popupopen', function() {

				var markerActive = currentObject.getAttribute('lm-marker-active');
				if(!markerActive) {
					markerActive = 'https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon.png';
				}
				var currIcon = this._popup._source._icon;
				currIcon.classList.add('active');
				currIcon.setAttribute('src', markerActive);

				// Pegando todos os marcadores
				var allMarkers = currentMapObject.getPane('markerPane').querySelectorAll('img');
				allMarkers = Array.prototype.slice.call(allMarkers,0);
				allMarkers.forEach(function(value, index){
					value.setAttribute('lm-index', index);

					if(value.classList.contains('active')) {
						curr = index;
					}

				});

				//console.log(allMarkers);
				// Setando o atual
				currentObject.LeafletManager.currentMarker = curr;

			});
			self.currentMapObject.on('popupclose', function() {
				var marker = currentObject.getAttribute('lm-marker');
				if(!marker) {
					marker = 'https://unpkg.com/leaflet@1.0.1/dist/images/marker-icon.png';
				}
				var currIcon = currentMapObject.getPane('markerPane').querySelectorAll('.active');


				currIcon = Array.prototype.slice.call(currIcon,0);
				currIcon.forEach(function(value, index){
						value.setAttribute('src', marker);
						value.classList.remove('active');
				});
			});

		},
		setMapPosition: function setMapPosition(position, currentMap) {
			// Verificando resolução para setar o mapa ao centro no mobile
			if( window.innerWidth <= 868 ) {
				position = 'center';
			}

			switch(position) {
				case 'center':
					currentMap.on('popupopen', function(centerMarker) {
					     var cM = currentMap.project(centerMarker.popup._latlng);
					     cM.y -= centerMarker.popup._container.clientHeight/2;
					     currentMap.setView(currentMap.unproject(cM),2, {animate: true});
					 });
					break;

				case 'left':
					currentMap.on('popupopen', function(centerMarker) {
					     var cM = currentMap.project(centerMarker.popup._latlng);
					     cM.y -= centerMarker.popup._container.clientHeight/2;
					     cM.x -= centerMarker.popup._container.clientWidth - (centerMarker.popup._container.clientWidth * .5);
					     currentMap.setView(currentMap.unproject(cM),2, {animate: true});
					 });
					break;
				case 'right':
					currentMap.on('popupopen', function(centerMarker) {
					     var cM = currentMap.project(centerMarker.popup._latlng);
					     cM.y -= centerMarker.popup._container.clientHeight/2;
					     cM.x += centerMarker.popup._container.clientWidth - (centerMarker.popup._container.clientWidth * .5);
					     currentMap.setView(currentMap.unproject(cM),2, {animate: true});
					 });
					break;

				default:
					break; 
			}
		},
		initMaps: function initMaps(initialConfig) {
			var self = this;

			var objID = self.currentObject.getAttribute('id');
			var newMap = L.map(objID).setView([0, -0], 2);
			self.currentMapObject = newMap; // Atribuição da objeto do novo mapa ao elemento.

			// - Variáveis de configuração inicial do Mapa atual (initialConfig e tema do mapa)
			var mapTheme = 'https://api.mapbox.com/styles/v1/soutomario/ciu06arqp008v2jo155ouaw6y/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic291dG9tYXJpbyIsImEiOiJjaXUwNjlkZTcwMTY4MnRtZ3VrYTB4aW5rIn0.g0iiQ7D477Dn3ZD2EnOiKw';
			initialConfig = {
				maxZoom: 50,
				zoom: 5,
				id: 'mapbox.streets',
				animate: true
			};
			L.tileLayer(mapTheme, initialConfig).addTo(newMap);

			// Posicionamento do Mapa
			self.setMapPosition( self.currentObject.getAttribute('lm-clickposition'), newMap );

			
		},
		init: function init() {
			var self = this;

			//console.log(self.maps);

			self.maps = Array.prototype.slice.call(self.maps,0);
			self.maps.forEach(function(value, index){
				
				console.log(index);
				self.currentID = index; // Pega a index do mapa atual.
				self.currentObject = value; // Elemento/Objeto onde será atribuido o mapa.

				self.initMaps(); // Função que criar o objeto do mapa.
				self.setMarkers(); // Função que define os marcadores (PINs) do mapa
				self.changeLocation(); // Função que define um evento de click em um elemento externo a um determinado mapa, para alterar a localização.
				self.nextLocation();
				self.prevLocation();


				/** 
				* Public API
				**/
				value.LeafletManager = {
					currentMarker: self.currentMarker
				};
			});
		}
	};

	LeafletManager.init();
})();

