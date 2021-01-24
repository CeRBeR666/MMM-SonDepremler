/* global Module */

/* Magic Mirror
 * Module: MMM-SonDepremler
 *
 * By 
 * MIT Licensed.
 */

Module.register("MMM-SonDepremler", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000,
		buyukluk : 4.0,
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "https://cors-anywhere.herokuapp.com/https://turkiyedepremapi.herokuapp.com/api?min=4.0";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			var wrapperDataRequest = document.createElement("div");
			// check format https://jsonplaceholder.typicode.com/posts/1
			//wrapperDataRequest.innerHTML = this.dataRequest.tarih;
			console.log("buradan sonrası");
			console.log(this.dataRequest[0].tarih);

			//var labelDataRequest = document.createElement("label");
			// Use translate function
			//             this id defined in translations files
			//labelDataRequest.innerHTML = this.translate("TITLE");
			
			//Buradan sonrası benim olay 
			
			var table = document.createElement("table");
			table.setAttribute("class", "kucuk");
			
			var head = document.createElement("tr");
			table.appendChild(head);
			var baslikYer = document.createElement("td");
			baslikYer.innerHTML = "Şehir - Yer";
			head.appendChild(baslikYer);
			
			var baslikBuyukluk = document.createElement("td");
			baslikBuyukluk.innerHTML = "Büyüklük";
			head.appendChild(baslikBuyukluk);
			
			var baslikDerinlik = document.createElement("td");
			baslikDerinlik.innerHTML = "Derinlik";
			head.appendChild(baslikDerinlik);
			
			var BaslikTarih = document.createElement("td");
			BaslikTarih.innerHTML = "Tarih - Saat";
			head.appendChild(BaslikTarih);
			
			
			for (i in this.dataRequest){			
				var row = document.createElement("tr");
				table.appendChild(row);
				var depremYer = document.createElement("td");
				depremYer.innerHTML = this.dataRequest[i].sehir + '/' +this.dataRequest[i].yer;
				row.appendChild(depremYer);
				
				var depremBuyukluk = document.createElement("td");
				depremBuyukluk.innerHTML = this.dataRequest[i].buyukluk;
				row.appendChild(depremBuyukluk);
				
				var depremDerinlik = document.createElement("td");
				depremDerinlik.innerHTML = this.dataRequest[i].derinlik;
				row.appendChild(depremDerinlik);
				
				var depremTarih = document.createElement("td");
				depremTarih.innerHTML = this.dataRequest[i].tarih + '/' +this.dataRequest[i].saat;
				row.appendChild(depremTarih);
			}
			wrapper.appendChild(table);

			//wrapper.appendChild(labelDataRequest);
			wrapper.appendChild(wrapperDataRequest);
		}

		// Data from helper
		/*if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			wrapper.appendChild(wrapperDataNotification);
		}*/
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-SonDepremler.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-SonDepremler-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-SonDepremler-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
