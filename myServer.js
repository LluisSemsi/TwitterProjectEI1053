var application_root=__dirname,
    express = require("express"),
    path = require("path")

var util = require('util'),
    twitter = require('twitter');
var twit = new twitter({
    consumer_key: 'Q1yBIWyhwajwlOEqZV8Mw',
    consumer_secret: 'pEihqo1RgizDU7BtOBika6VxAcGK42uTr3cm36npE',
    access_token_key: '135457106-vO3VFVu3v6gOh4T0mPBS2gYZoF6vobjTBrS0ctry',
    access_token_secret: '4Ei0ylK7Z0TKIA5alS8LMll9drEDpzmPNhvIUbVSKlg'
});

var sf=require('slice-file');
var app = express();
var MongoClient = require('mongodb');
var assert=require("assert");   

app.use(express.static(path.join(application_root,"public")));

var bodyparser=require("body-parser");
//app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

var db=require('./myModule');
var DB=new myDB('./Streams');


app.get('/',function(req,res){
    res.sendFile("public/myMashupTwitter.html",{root:application_root});
});

app.get('/index.html',function(req,res){
    res.sendFile("public/myMashupTwitter.html",{root:application_root});
});

app.get('/stream',function(req,res){
    res.send({result : DB.count});
});

/*Creacion de un stream ligado a una query*/

/*

app.post('/stream',function(req,res){
    console.log(req.body);
    if(req.body["@id"] !== null && req.body["@id"].length > 0){
        if(DB.createDataset(req.body["@id"],req.body)){
            twit.get('search/tweets.json', {q:req.body.query}, function(error,data,status){
                var tweetList = data.statuses;
                var cuenta = 0;
                for(var i = 0; i < tweetList.length; i++){
                    if(DB.insertObject(req.body["@id"], {id : tweetList[i].id_str , text : tweetList[i].text , coordinates : tweetList[i].coordinates})){
                        cuenta ++;
                    }
                }
                if(cuenta === tweetList.length){
                    res.send({result: 'success'}); 
                }else{
                    res.send({error: 'No se han insertado todos o ninguno'});
                }
            });
        }
    }
    else{
        res.send({error: 'Nombre del strem incorrecto'});
    }       
});

*/


app.post('/stream',function(req,res){
    console.log(req.body);
    if(req.body["@id"] !== null && req.body["@id"].length > 0){
        if(DB.createDataset(req.body["@id"],req.body)){
            twit.get('search/tweets.json', {q:req.body.query}, function(error,data,status){
                var tweetList = data.statuses;
                var cuenta = 0;
                for(var i = 0; i < tweetList.length; i++){
                    if(DB.insertObject(req.body["@id"], {id : tweetList[i].id_str , text : tweetList[i].text , coordinates : tweetList[i].coordinates})){
                        cuenta ++;
                    }
                }
                if(cuenta === tweetList.length){
                    res.send({result: 'success'}); 
                }else{
                    res.send({error: 'No se han insertado todos o ninguno'});
                }
            });
        }
    }
    else{
        res.send({error: 'Nombre del strem incorrecto'});
    }       
});

app.put('/stream/:name',function(req,res){
      
      if(req.body !== null && req.params.name.length > 0){
            var qu;
            xs = sf(DB.filename(req.params.name));
            var lista = [];
            xs.slice(0,1)
            .on('data', function(chunk){
                var object = JSON.parse(chunk.toString().trim());
                if (object.type === "metadata"){
                    lista.push(JSON.parse(chunk.toString().trim()));
                }
            })
            .on('end',function(){
                qu = lista[0].query;
                twit.get('search/tweets.json', {q:qu}, function(error,data,status){
                var tweetList = data.statuses;
                var cuenta = 0;
                for(var i = 0; i < tweetList.length; i++){
                    if(DB.insertObject(req.params.name, {id : tweetList[i].id_str , text : tweetList[i].text , coordinates : tweetList[i].coordinates})){
                        cuenta ++;
                    }
                }
                if(cuenta === tweetList.length){
                    res.send({result: 'OK'}); 
                }else{
                    res.send({error: 'No se han insertado todos o ninguno'});
                }
                });
            });
            

            
      }else{
            res.send({error : 'Error en el parametro nombre'})
      }

});

/*Devuelve los n ultimos id del stream pasado por parametro*/

app.get('/stream/:name',function(req,res){
    var name = req.params.name;
    DB.getLastObjects(req.params.name,req.query.limit,function(data, name){
        var listaIds = data.result;
        for(var i = 0; i < listaIds.length; i++){
            data.result[i] = listaIds[i].id;
        }
        res.send(data);
    });
});

/*Devuelve las frecuencias de palabras*/

app.get('/stream/:name/words',function(req,res){
    var mapWords = {};
    n = req.query.limit;
    if(n !== null && n > 0){
        DB.getLastObjects(req.params.name,1,function(data){
            object = data.result[0]
            cant = object.n

            DB.getLastObjects(req.params.name,cant,function(data){
                var list = data.result;
                for ( var i = 0; i < list.length; i++) {
                    var text = list[i].text;
                    var textSplit = text.split(" ");
                    for ( var j = 0; j < textSplit.length; j++ ) {
                        if ( textSplit[j] in mapWords ){
                            mapWords[textSplit[j]] ++;
                        }
                        else {
                            mapWords[textSplit[j]] = 1;
                        }
                    }
                }

                // Create items array
                var items = Object.keys(mapWords).map(function(key) {
                    return [key, mapWords[key]];
                });

                // Sort the array based on the second element
                items.sort(function(first, second) {
                    return second[1] - first[1];
                });

                res.send({result: items.slice(0,n)});

            });

        });
    }
    
});

//Devuelve un array con las coordenadas de geolocalizacion de cada tweet, y si no las tiene activadas devuelve 
//[0,0]

app.get('/stream/:name/geo', function(req,res){
    if(req.body !== null && req.params.name.length > 0){    //comprobar que existe el nombre del sttream
        var nom = req.params.name;
        var mapCount = DB.count;
        var numeroTweets = parseInt(mapCount[nom]);
        DB.getLastObjects(nom, numeroTweets, function(data,name){
            console.log("Dentro del callback getLastObjects");
            var listaTweets = data.result;
            var resultado = {};
            var etiqueta;
            for(var i = 0; i < listaTweets.length; i ++){
                console.log("dentro de for");
                if(listaTweets[i].coordinates === null){
                    etiqueta = i+1;
                    resultado["tweet"+etiqueta] = [0,0];
                }else {
                    etiqueta = i+1;
                    resultado["tweet"+etiqueta] = listaTweets[i].coordinates;
                } 
            }
            res.send(resultado);
        });

    }else{
            res.send({error : 'Error en el parametro nombre'})
    }    
});

/*Obtener la polaridad de un stream*/

app.get('/stream/:name/polaridad', function(req,res){
    var pos = 0;
    var neg = 0;
    var neu = 0;

    DB.getLastObjects(req.params.name, 1, function(data,name){
        var object = data.result[0];
        var cant = object.n;

        DB.getLastObjects(req.params.name, cant, function(data,name){
            var lista = data.result;
            for(var i = 0; i < lista.length; i++){
                var text = lista[i].text;
                var textSplit = text.split(" ");
                for(var j = 0; j < textSplit.length; j++){
                    if (textSplit[j] in DB.mapPolaridad) {
                        if(DB.mapPolaridad[textSplit[j]] == 1){
                            pos ++;
                        }
                        else{
                            neg ++;
                        }
                    }else{
                        neu ++;
                    }
                }
            }

            var mapResult = {};
            mapResult["positive"] = pos;
            mapResult["negative"] = neg;
            mapResult["neutral"] = neu;
            res.send({result : mapResult});
         });
    });
});

app.listen(8080);


console.log("Web server running on port 8080");
/*
twit.get('search/tweets.json', {q:'nodejs'}, function(error,data,status){
    console.log(util.inspect(data.statuses[0]));
});
*/




