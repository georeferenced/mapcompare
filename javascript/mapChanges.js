  dojo.require("esri.map");
  dojo.require("esri.layout");
  dojo.require("esri.widgets");
  dojo.require("esri.arcgis.utils");
  dojo.require("esri.IdentityManager");
  dojo.requireLocalization("esriTemplate","template");


    var urlObject;
    var mapChange = false;
    var mapExtent;
	var firstMap = false;
	var mapsLoaded = 1;
	var i18n;
	var tempExtentMap=[];  //  2014 05 15  Added var

     function initMap() {
      patchID();

      dojo.some(["ar","he"], function(l){
         if(dojo.locale.indexOf(l) !== -1){
           configOptions.isRightToLeft = true;
           return true;
         }
       });
       var dirNode = document.getElementsByTagName("html")[0];
       if(configOptions.isRightToLeft){
         dirNode.setAttribute("dir","rtl");
         dojo.addClass( dirNode,"esriRtl");
         //Page Specific
         dojo.forEach(dojo.query(".legend"),function(leg){
             dojo.attr(leg,"dir","rtl");
         });
         dojo.forEach(dojo.query(".description"),function(leg){
             dojo.attr(leg,"dir","rtl");
         });
       }else{
         dirNode.setAttribute("dir","ltr");
         dojo.addClass(dirNode,"esriLtr");
         //Page Specific
         dojo.forEach(dojo.query(".legend"),function(leg){
             dojo.attr(leg,"dir","ltr");
         });
         dojo.forEach(dojo.query(".description"),function(leg){
             dojo.attr(leg,"dir","ltr");
         });
       }

	  i18n = dojo.i18n.getLocalization("esriTemplate","template");

	  dojo.byId('loadText').innerHTML = i18n.viewer.loading.message;
	  dojo.byId('syncHead').innerHTML = i18n.viewer.sync.head;
	  dojo.byId('scale').innerHTML = i18n.viewer.sync.scale;
	  dojo.byId('location').innerHTML = i18n.viewer.sync.location;
	  dojo.byId('legText').innerHTML = i18n.viewer.toggles.legend;
	  dojo.byId('desText').innerHTML = i18n.viewer.toggles.description;

      if(configOptions.geometryserviceurl && location.protocol === "https:"){
        configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:','https:');
      }
      esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);



      if(!configOptions.sharingurl){
        configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
      }
      esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

      if(!configOptions.proxyurl){
        configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
      }

      esri.config.defaults.io.proxyUrl =  configOptions.proxyurl;

      esri.config.defaults.io.alwaysUseProxy = false;

      urlObject = esri.urlToObject(document.location.href);
      urlObject.query = urlObject.query || {};

	  if(urlObject.query.title){
        configOptions.title = urlObject.query.title;
      }
      if(urlObject.query.subtitle){
        configOptions.subtitle = urlObject.query.subtitle;
      }
      if(urlObject.query.description){
        configOptions.description = urlObject.query.description;
      }
      if(urlObject.query.legend){
        configOptions.legend = urlObject.query.legend;
      }
      if(urlObject.query.webmap){
        configOptions.webmaps = getWebMaps(urlObject.query.webmap);
      }
      if(urlObject.query.bingMapsKey){
        configOptions.bingmapskey = urlObject.query.bingMapsKey;
      }

	  //is an appid specified - if so read json from there
	  if(configOptions.appid || (urlObject.query && urlObject.query.appid)){
		var appid = configOptions.appid || urlObject.query.appid;
		var requestHandle = esri.request({
		  url: configOptions.sharingurl + "/" + appid + "/data",
		  content: {f:"json"},
		  callbackParamName:"callback",
		  load: function(response){
			   if(response.values.title !== undefined){configOptions.title = response.values.title;}
			   if(response.values.subtitle !== undefined){configOptions.subtitle = response.values.subtitle;}
			   if(response.values.description !== undefined){configOptions.description = response.values.description; }
			   if(response.values.legend !== undefined) {configOptions.legend = response.values.legend;}
			   if(response.values.webmap !== undefined) {configOptions.webmaps = getWebMaps(response.values.webmap);}

			   initMaps();
	  		   bannerSetup();
		  },
		  error: function(response){
			var e = response.message;
		   alert(i18n.viewer.errors.createMap +  response.message);
		  }
		});
		 }else{
			initMaps();
	 		bannerSetup();
		 }

      }


    function createMap(j){

	  //esriConfig.defaults.map.slider = { left:200 };


      var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmaps[j].id, "mapDiv"+[j], {
        mapOptions: {
          slider: true,
          sliderPosition: "top-right",
          nav: false,
          wrapAround180: true,
		  extent: mapExtent
        },
        ignorePopups:false,
        bingMapsKey: configOptions.bingmapskey
      });

      mapDeferred.addCallback(function (response) {

		//dojo.byId("title"+[j]).innerHTML = response.itemInfo.item.title;
        dojo.byId("description"+[j]).innerHTML = response.itemInfo.item.description;

        eval("map"+[j]+" = response.map");

		dojo.connect(eval("map"+[j]),"onUpdateEnd",hideLoader);
		dojo.connect(eval("map"+[j]),"onExtentChange",syncMaps);
		dojo.connect(eval("map"+[j]),"onPanEnd",enableSyncing);
		dojo.connect(eval("map"+[j]),"onZoomEnd",enableSyncing);

        var layers = response.itemInfo.itemData.operationalLayers;
        if(eval("map"+[j]).loaded){
          initUI(layers,j);
        }
        else{
          dojo.connect(eval("map"+[j]),"onLoad",function(){
            initUI(layers,j);
          });
        }
       });

      mapDeferred.addErrback(function (error) {
          alert(i18n.viewer.errors.createMap + " " + dojo.toJson(error.message));
      });



    }

    function initUI(layers,j) {
      //add chrome theme for popup
      dojo.addClass(eval("map"+[j]).infoWindow.domNode, "chrome");
      //add the scalebar
	  /*
      var scalebar = new esri.dijit.Scalebar({
        map: eval("map"+[j]),
        scalebarUnit:i18n.viewer.main.scaleBarUnits //metric or english
      });
	  */
      var layerInfo = buildLayersList(layers);

      if(layerInfo.length > 0){
        var legendDijit = new esri.dijit.Legend({
          map:eval("map"+[j]),
          layerInfos:layerInfo
        },'legend'+[j]);
        legendDijit.startup();
      }
      else{
        dojo.byId('legend'+[j]).innerHTML = 'No Legend';
      }

    }
//build a list of layers to dispaly in the legend
  function buildLayersList(layers){

 //layers  arg is  response.itemInfo.itemData.operationalLayers;
  var layerInfos = [];
  dojo.forEach(layers, function (mapLayer, index) {
      var layerInfo = {};
      if (mapLayer.featureCollection && mapLayer.type !== "CSV") {
        if (mapLayer.featureCollection.showLegend === true) {
            dojo.forEach(mapLayer.featureCollection.layers, function (fcMapLayer) {
              if (fcMapLayer.showLegend !== false) {
                  layerInfo = {
                      "layer": fcMapLayer.layerObject,
                      "title": mapLayer.title,
                      "defaultSymbol": false
                  };
                  if (mapLayer.featureCollection.layers.length > 1) {
                      layerInfo.title += " - " + fcMapLayer.layerDefinition.name;
                  }
                  layerInfos.push(layerInfo);
              }
            });
          }
      } else if (mapLayer.showLegend !== false && mapLayer.layerObject) {
      var showDefaultSymbol = false;
      if (mapLayer.layerObject.version < 10.1 && (mapLayer.layerObject instanceof esri.layers.ArcGISDynamicMapServiceLayer || mapLayer.layerObject instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
        showDefaultSymbol = true;
      }
      layerInfo = {
        "layer": mapLayer.layerObject,
        "title": mapLayer.title,
        "defaultSymbol": showDefaultSymbol
      };
        //does it have layers too? If so check to see if showLegend is false
        if (mapLayer.layers) {
            var hideLayers = dojo.map(dojo.filter(mapLayer.layers, function (lyr) {
                return (lyr.showLegend === false);
            }), function (lyr) {
                return lyr.id;
            });
            if (hideLayers.length) {
                layerInfo.hideLayers = hideLayers;
            }
        }
        layerInfos.push(layerInfo);
    }
  });
  return layerInfos;
  }

     function patchID() {  //patch id manager for use in apps.arcgis.com
       esri.id._isIdProvider = function(server, resource) {
       // server and resource are assumed one of portal domains

       var i = -1, j = -1;

       dojo.forEach(this._gwDomains, function(domain, idx) {
         if (i === -1 && domain.regex.test(server)) {
           i = idx;
         }
         if (j === -1 && domain.regex.test(resource)) {
           j = idx;
         }
       });

       var retVal = false;

       if (i > -1 && j > -1) {
         if (i === 0 || i === 4) {
           if (j === 0 || j === 4) {
             retVal = true;
           }
         }
         else if (i === 1) {
           if (j === 1 || j === 2) {
             retVal = true;
           }
         }
         else if (i === 2) {
           if (j === 2) {
             retVal = true;
           }
         }
         else if (i === 3) {
           if (j === 3) {
             retVal = true;
           }
         }
       }

       return retVal;
     };
    }

	function setExtent(){
		if (configOptions.syncMaps == true){
			if (firstMap == false){
				mapExtent = map0.extent(); 
				firstMap = true;
			}
		}
	}

	function hideLoader(){
		if (mapsLoaded == configOptions.webmaps.length){
			$("#loadingCon").hide();
            syncMaps();
			//if(configOptions.webmaps.length == 2){
				$("#mapDiv1_zoom_slider").show();
			//}
		}
		else{
			mapsLoaded++
		}
	}

	function resizeMaps(){
		if(map0 != null){
			map0.resize();
		}
		if(map1 != null){
			map1.resize();
		}
		if(map2 != null){
			map2.resize();
		}
		if(map3 != null){
			map3.resize();
		}
		if(map4 != null){
			map4.resize();
		}
	}

	$(window).resize(function(e) {
		resizeMaps();
    });

	function getWebMaps(webmaps) {
	  if (webmaps.indexOf(',') !== -1) {
	    // load array of mapID's    // 2014 05 23 Added line
		var mapIds = webmaps.split(',');
		webmapresults = dojo.map(mapIds, function (mapId) {
		  return {
			id: mapId
		  };
		});
	  } else {
		// I don't understand what this is doing  // 2014 05 23 Added line
		alert("Inside previewWebMap: what is this?");
		var previewWebMap = {
		  id: webmaps
		};
		webmapresults = [previewWebMap, previewWebMap, previewWebMap];
	  }
		//return duplicate id if only only mapid loaded?   // 2014 05 23 Added line
	  if (webmapresults.length < 2){
		  webmapresults[1] = webmapresults[0];
	  }

	  return webmapresults;
	}