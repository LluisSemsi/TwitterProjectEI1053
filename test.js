db=require('./myModule')

DB=new myDB('./Streams')

util=require('util')


console.log(DB)


setTimeout(function(){

       DB.getLastObjects('coches',2,function(data){console.log(data);});

       DB.createDataset('motos',{'creator':'yo','about':'vehiculos'});

       DB.createDataset('xico',{'creator':'yo','about':'vehiculos'});

       DB.createDataset('camiones',{'creator':'yo','about':'vehiculos'});


       DB.insertObject('camiones',{body:',mi primer coche',creator:'yo'});


       DB.insertObject('xico',{body:',mi primer tren',creator:'yo'});

       DB.insertObject('xico',{body:',mi primer tren',creator:'yo'})
       DB.insertObject('camiones',{body:',mi primer tren',creator:'yo'})
       DB.insertObject('xico',{body:',mi primer tren',creator:'yo'})
       DB.insertObject('camiones',{body:',mi primer tren',creator:'yo'})

       var data = DB.getDatasets();

       console.log("Probandoooooooooo")

		for(var i = 0; i < data.length; i++){
    		var name = data[i];
    		console.log(name + ", " + DB.count[name]);
		}

}, 1000);



setTimeout(function(){console.log(DB)},1500);
