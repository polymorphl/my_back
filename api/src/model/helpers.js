let selectFields = (dataSet, scope)=>{
  let fields =[];
  scope.forEach(function(tag){
    if(tag in dataSet){
      fields = fields.concat(dataSet[tag]);
    }
  });
  return fields; 
};

let mapModel = function(model, commands, dataSets){
  model.c = commands;
  if(dataSets){
    model.d = dataSets;
  }
  return model;
};

let mapQueries = (queries, model)=>{
  queries = queries || {};
  queries.fields = queries.fields || ['excerpt'];
  queries.related = queries.related || null;
  return queries;
};

let generateQuery = function(query, model, options){
  if(!model) throw new Error('[GenerateQuery] - model undefined');
  options = options || {};
  options.fields = options.fields || ['excerpt'];

  query = query || {};
  query.attributes = query.attributes || [];
  query.dataSets = query.dataSets || options.fields;
  if(query.dataSets instanceof Array){
    let l = query.dataSets.length;
    for(let i = 0; i < l; i++){
      query.attributes = query.attributes.concat(model.d[query.dataSets[i]]);
    }
  }
  delete query.dataSets;
  return query;
  // options.related = options.related ||[];
  // if(options.related instanceof Array){
  //   let l = options.related.length;
  //   for(let i = 0; i < l; i++) {
  //     query.include
  //   }
  // }
};

module.exports = {
  selectFields: selectFields,
  mapModel: mapModel,
  mapQueries: mapQueries,
  generateQuery: generateQuery
}
