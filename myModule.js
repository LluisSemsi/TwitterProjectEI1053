var gb=require('glob');
var fs=require('fs');
var sf=require('slice-file');

myDB = function(dataDir){
        this.dataDir=dataDir+"/";
        this.datasets=[];
        this.count = {};
        this.inspectDatasets();

        this.mapPolaridad = {};
        this.getPolaridad();
}

myDB.prototype.inspectDatasets = function(){
     var dataDir=this.dataDir
     files= gb.glob(this.dataDir+'*.json',{sync:true});
     this.datasets=files.map(function(e){
                     return e.trim().replace(dataDir,"").replace(".json","")
                    });
    for (var index in this.datasets){
    var name = this.datasets[index]; 
    var count = this.count;
    count[name] = 0;
    this.getLastObjects(name,1,function(data, name){
         var result = data["result"];        
          if(result!==null && result.length > 0){
            count[name] = parseInt(result[0].n);
          }
          return true;
     });
    
  }
     return true;
}

myDB.prototype.getPolaridad = function(){
      var mapaPol = this.mapPolaridad;
      var array = fs.readFileSync('./data/polaridades.txt').toString().split("\n");
      for(var i in array){
          var text = array[i].trim().split("\t");
          mapaPol[text[0]] = parseInt(text[1]);
      }
}

myDB.prototype.getDatasets = function(){
      return this.datasets;
}

myDB.prototype.filename = function(name){
	   return this.dataDir+name+".json";
}

myDB.prototype.getTimeStamp = function(){
     var date=new Date().toISOString();
     return date;
}


myDB.prototype.createDataset = function(name,data){
     if (this.datasets.indexOf(name) === -1){
         this.datasets.push(name);
         data.type="metadata";
         data.timestamp=this.getTimeStamp();
         this.count[name] = 0;
         fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
         return true;
      }
      else { return false; }
}

myDB.prototype.insertObject = function(name,data){

      if (this.datasets.indexOf(name) === -1 ){
        return false;
      }else{

      data.timestamp=this.getTimeStamp();
      this.count[name] ++;
      data.n=this.count[name];
      fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");

      return true;
      }
}

myDB.prototype.getLastObjects= function(name,n,callback){
    if (this.datasets.indexOf(name) !== -1 ){
        xs = sf(this.filename(name));
        var lista=[];
        xs.slice(-n)
        .on('data',function(chunk){
            object=JSON.parse(chunk.toString().trim());
            if (!(object.type !== null && object.type === "metadata")){
                lista.push(JSON.parse(chunk.toString().trim()))
            } 
        })
        .on('end',function(){
          callback({result: lista}, name)
        });
      }
      else{callback({error:'no valid dataset '+name}, name);}
}

myDB.prototype.deleteDataset= function(name){
    if (this.datasets.indexOf(name) !=-1 ){
        fs.unlinkSync(this.filename(name));
        this.datasets.splice(this.datasets.indexOf(name),1);
        return true;
      }
    else {return false; }

}

//myDB.prototype.getDatasetInfo = function(name){}
//return the first line of the filename of name

//myDB.prototype.searchDataset = function(keyword){}

//myDB.prototype.countWords = function(name){}


exports.myDB = myDB
