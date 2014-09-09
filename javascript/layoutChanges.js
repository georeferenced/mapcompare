  // Still need to add 
  var map0,map1,map2,map3,map4;  // 2014 05 23 Added map3,map4
  var mapCount = 0;
  var syncLoc = true;
  var syncLevel = true;
  var sync = true;
  var mapExtent, mapCenter, mapScale;
  var mouseDown = 0;
  var myMapNames= [   
  ['Wildland Fire Potential','df11848c32d442388ce99d31705d3cb8'],
  ['Unemployment',           '0f1bc846f3634b33916c79fb3e0962c6'],
  ['Land Status',            '7409ec0f7ac4424285cc1d88d18453d4'],
  ['Population',             'bca9eb9162664887a92a8a246beaa4ad'],
  ['Federal Lands',          'e03864cb528f4185affd001d3a9f4687']
  ];   // 2014 05 25  Added array
  
	function bannerSetup(){
		document.title = configOptions.title|| response.itemInfo.item.title || "";
        dojo.byId("title").innerHTML = configOptions.title || "";
		dojo.byId("subtitle").innerHTML = configOptions.subtitle|| response.itemInfo.item.snippet || "";
		if (configOptions.description == false || configOptions.description == "false"){
			$(".descriptionCon").hide();
			$(".desToggle").hide();
			$(".map").css('height','100%');
		}
		if (configOptions.legend == false || configOptions.legend == "false"){
			$(".legendCon").hide();
			$(".legToggle").hide();
		}
		dijit.byId('mainWindow').resize();
	}

	function initMaps(){
/* 	    if ($("#titleCon2").position().top === 45){
			$("#titleCon2").css('margin-top','-45px');
	  	} 
		if(configOptions.webmaps.length >= 2){   //was == 2
 			$("#mapCon2").hide();
			$("#titleCon2").hide(); 
			//$("#titleCono").css('width','50%');
			//$("#titleCon1").css('width','50%');
			//$("#titleCon1").css('float','right');
			//$("#titleCon1").css('margin-right','-1px');
			//$("#mapCon0"0).css('width','50%');
			dijit.byId('mainWindow').resize();
		}*/
		createMap(0);
		createMap(1);
		createMap(2);
		createMap(3);   // 2014 05 23 Added line
		createMap(4);   // 2014 05 23 Added line

		// if (configOptions.webmaps.length == 3){
			// createMap(2);
		// }
		$("#mapDiv0").mousemove(function(e) {
			if (mouseDown == 0){
            	mapCount = 0;
			}
        });
		$("#mapDiv1").mousemove(function(e) {
			if (mouseDown == 0){
	            mapCount = 1;
			}
        });
		$("#mapDiv2").mousemove(function(e) {   // 2014 05 23 Added lines
			if (mouseDown == 0){
	            mapCount = 2;
			}
        });
		$("#mapDiv3").mousemove(function(e) {   // 2014 05 23 Added lines
			if (mouseDown == 0){
	            mapCount = 3;
			}
        });
		$("#mapDiv4").mousemove(function(e) {   // 2014 05 23 Added lines
			if (mouseDown == 0){
	            mapCount = 4;
			}
        });

	}

	function enableSyncing(){
		sync = true;
		syncMaps();
	}

	function syncMaps(){
		if (sync == true){
			if (syncLoc == true && syncLevel == false){
				if (mapExtent != eval("map"+[mapCount]).extent){
					mapExtent = eval("map"+[mapCount]).extent;
					mapCenter = eval("map"+[mapCount]).extent.getCenter();
					for(i=0;i<configOptions.webmaps.length;i++){
						if(eval("map"+[i]) != null){
							if(i != mapCount ){
								eval("map"+[i]).centerAt(mapCenter);
							}
						}
					}
				}
			}
			else if (syncLoc == false && syncLevel == true){
				if (mapScale != eval("map"+[mapCount]).getLevel()){
					mapScale = eval("map"+[mapCount]).getLevel();
					for(i=0;i<configOptions.webmaps.length;i++){
						if(eval("map"+[i]) != null){
							if(i != mapCount ){
								eval("map"+[i]).setLevel(mapScale);
							}
						}
					}
				}
			}
			else if (syncLoc == true && syncLevel == true){
				if (mapExtent != eval("map"+[mapCount]).extent){
					mapExtent = eval("map"+[mapCount]).extent;
					for(i=0;i<configOptions.webmaps.length;i++){
						if(eval("map"+[i]) != null){
							if(i != mapCount ){
								eval("map"+[i]).setExtent(mapExtent);
							}
						}
					}
				}
			}
		}
	}

	$(document).ready(function(e) {
		$(document).mousedown(function(e) {
			mouseDown = 1;
		});
		$(document).mouseup(function(e) {
			mouseDown = 0;
		});
        $("#scaleCheck").click(function(e) {
			if($("#syncScale").hasClass('checked')){
				$("#syncScale").removeClass('checked');
				$("#syncScale").addClass('unchecked');
				$("#mapDiv0_zoom_slider").show();
/* 				if(configOptions.webmaps.length == 3){
					$("#mapDiv1_zoom_slider").show();
				} */
				syncLevel = false;
			}
			else{
				$("#syncScale").removeClass('unchecked');
				$("#syncScale").addClass('checked');
				$("#mapDiv0_zoom_slider").hide();
/* 				if(configOptions.webmaps.length == 3){
					$("#mapDiv1_zoom_slider").hide();
				} */
				syncLevel = true;
				mapExtent = null;
				syncMaps();
			}
        });
		$("#locCheck").click(function(e) {
			if($("#syncLoc").hasClass('checked')){
				$("#syncLoc").removeClass('checked');
				$("#syncLoc").addClass('unchecked');
				syncLoc = false;
			}
			else{
				$("#syncLoc").removeClass('unchecked');
				$("#syncLoc").addClass('checked');
				syncLoc = true;
				syncMaps();
			}
        });
    });

	function legendToggle(){
		sync = false;
		if ($(".legendCon").is(':visible')){
			$(".legendCon").hide();
			$(".legToggle").html(i18n.viewer.toggles.legend+' ▼');
			if ($(".descriptionCon").is(':visible')){
				$(".map").css('height','75%');
			}
			else{
				$(".map").css('height','100%');
			}
			resizeMaps();
		}
		else{
			$(".legendCon").show();
			$(".legToggle").html(i18n.viewer.toggles.legend+' ▼');
			if ($(".descriptionCon").is(':visible')){
				$(".map").css('height','40%');
			}
			else{
				$(".map").css('height','65%');
			}
			resizeMaps();
		}
	}

	function descriptionToggle(){
		sync = false;
		if ($(".descriptionCon").is(':visible')){
			$(".descriptionCon").hide();
			$(".desToggle").html(i18n.viewer.toggles.description+' ▼');
			$(".desToggle").css('bottom','0%');
			if ($(".legendCon").is(':visible')){
				$(".map").css('height','65%');
			}
			else{
				$(".map").css('height','100%');
			}
			resizeMaps();
		}
		else{
			$(".descriptionCon").show();
			$(".desToggle").html(i18n.viewer.toggles.description+' ▼');
			$(".desToggle").css('bottom','25%');
			if ($(".legendCon").is(':visible')){
				$(".map").css('height','40%');
			}
			else{
				$(".map").css('height','75%');
			}
			resizeMaps();
		}
	}