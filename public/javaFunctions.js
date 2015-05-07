$(document).ready(function(){

		//Recoger y  añadir los botones de los Streams existentes	
	   getStreams();

	   //Añade a el div 
	   $("#streamlist").append("<button id='NEW' width='1%'><b>+</b></button>");
	   
	 
	   
	   $(".stream").click(function(){
			actionButton(this);
		});
	   
	   //event for button "NEW"
	   $("#NEW").click(function(){
			//make visible the form
			$("#form-container").css({"visibility":"visible"});
			//newdata=$("#name").val("");
	   });
	   
	   //event for form button
	   $("#create").click(function(){


 			//Llamada ajax para hacer un post al servidor pasandole un json con el nombre y la query del stream
 			//Cuando termina sin error, hace un get al servidor para saber la cantidad de tweets existentes 
 			//y añadir el boton
 			$("#form-container").css({"visibility":"hidden"});
 			var jsonLD = getObject();
 			$.ajax({
			    type: "POST",
			    url: "/stream/",
			    contentType: "application/json",
			    data: jsonLD,
			    beforeSend: function() { alert("Enviando...") },
			    success: function() {
			    	var array = [];
			    	$.getJSON("/stream/",function(data,status){
        				$.each(data.result,function(key,value){
				        	if(key === ide){				 
				        		array.push(key);
				        		array.push(value);
				        		alert(array);
				        		addButton(array);
				        	}
        				});

    				});

			    	alert("Insertado correctamente!");
			    },
			    error: function() {alert("ajax error"); },
			    dataType: 'json'
			});
	    });
	});
	
	//Crea un boton pasandole un array con el nombre del stream y la cantidad de tweets existentes
	//A cada boton le asigna una llamada a actionButton cuando se le haga click

	function addButton(data){
		if (data.length>0){
				newbutton="<button class='stream' id="+data[0]+">"+data[0]+" "+data[1]+"</button>";
				$(newbutton).insertBefore($("#NEW")).click(function(){actionButton(this);});
			};
	};
	

	//Funcion que genera la nube de palabras, las polaridades, las ids (con un limite de 5),
	//actualiza los streams y actualiza el mapa de geolocalización
	function actionButton(data){
		streamname=data.getAttribute("id");

		$("#idTwits").empty();

		lwords=[];
		$.getJSON("/stream/"+streamname+"/words?limit=15",function(data,status){
        	$.each(data.result,function(key,value){
        		lwords.push(value);
        	});
    		update_cloud(lwords);
    	});
	
		
		var polarity = {};
		$.getJSON("/stream/"+streamname+"/polaridad",function(data,status){
        	$.each(data.result,function(key,value){
        		if(key !== "neutrales"){
        			polarity[key] = value*2;
        		}
        	});
    		update_polar(polarity);
    	});


		$.getJSON("/stream/"+streamname+"?limit=5",function(data,status){
        	$.each(data.result,function(key,value){      		
        		newIdButton = "<li><button id ="+ key +">"+ value +"</button></li>"
        		$(newIdButton).appendTo($("#idTwits")).click(function(){ location.href = "https://twitter.com/statuses/" + value;});
        	});
    	});

    	$.ajax({
			    type: "PUT",
			    url: "/stream/"+streamname,
			    data: {},
			    beforeSend: function() { alert("Enviando...") },
			    success: function() {
 					$.getJSON("/stream/",function(data,status){
        				$.each(data.result,function(key,value){
				        	if(key === streamname){
				        		$("#"+streamname).text(key+ " " + value);
				        	}
        				});

    				});

			    	alert("Actualizado correctamente!");
			    },
			    error: function() {alert("ajax error"); },
			    dataType: 'json'
			});


		
		
		marklabel=streamname+":tweet1";
		geoPos={marklabel:[40.3,0]};
		update_map(geoPos);
		
		update_pictures(streamname);
	};

	function update_polar(data){
		var canvas=document.getElementById("polarity");
	    var contexto=canvas.getContext("2d");
		
		//limpia canvas
		contexto.clearRect(0, 0, canvas.width, canvas.height);
		
		contexto.font = "20px Arial";
		contexto.fillStyle="black";
		contexto.fillText("Polaridad",10,20);

	    contexto.fillStyle="green";
	    contexto.lineWidth=2;
	    contexto.beginPath();
	    contexto.arc(150,50,50.0*data["positive"]/(data["positive"]+data["negative"]),0,2*Math.PI,true);
	    contexto.fill();
		
	    contexto.fillStyle="red";
	    contexto.lineWidth=2;
	    contexto.beginPath();
	    contexto.arc(150,100,50.*data["negative"]/(data["positive"]+data["negative"]),0,2*Math.PI,true);
	    contexto.fill();
	};

	function update_map(data){
		var mapProp = {
			center:new google.maps.LatLng(40.0,-0.624207),
			zoom:7,
			mapTypeId:google.maps.MapTypeId.ROADMAP
	  };
		var map=new google.maps.Map(document.getElementById("mapcanvas"),mapProp);
		
		$.each(data,function(key,pos){
			mark=new google.maps.LatLng(pos[0],pos[1]);
			var marker=new google.maps.Marker({position:mark, title:key});
			marker.setMap(map);
		});
		
		google.maps.event.addDomListener(window, 'load', update_map);
		
	};

	function update_pictures(labels){
		var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
		$.getJSON( flickerAPI, {
				tags:labels,
				tagmode: "any",
				format: "json"
		}).done(function(data){
				//limpia fotos
				$("#fotos").empty();
		
				$.each( data.items, function( i, item ) {
					$( "<img>" ).attr( "src", item.media.m ).attr("height","145").appendTo( "#fotos" );
					if ( i === 3 ) {return false;}
				});
				
			})
		
	}

	function update_cloud(data){
	  options= { list : data}; 
	  WordCloud(document.getElementById('wordcloud'), options);
	};


	function getStreams(){

	    $.getJSON("/stream/",function(data,status){
	        $.each(data.result,function(key,value){
	        	var datos = [];
	          	datos.push(key);
	          	datos.push(value);
	          	addButton(datos);
	        });

	    });  
	}
