/* Module to interact with SQL Database (PostreSQL) */
/** Persistence Layer (PostGree) library */
var pgClient;

module.exports = {
    Initialize: function (response) {
        return (Initialize(response));
    },
    Select: function (response) {
        return (Select(response));
    },
    Insert: function (data, response) {
        return (Insert(data, response));
    },
    Update: function (item, response) {
        return (Update(item, response));
    },
    setClient: function (inClient) { pgClient = inClient;}

}

function Initialize(callback){
    console.log('Initializing PostgreSQL database')
    
    var query   = 'CREATE TABLE IF NOT EXISTS '
                + 'items (productID varchar(256) NOT NULL, origin varchar(10) NOT NULL, image varchar(500), imgvector decimal array,'
                + 'PRIMARY KEY (productID, origin))'

    if(pgClient){
        pgClient.query(query, function (err, result) {
            if (err) {
                console.error("Error Initializing PostgreSQL db: "+err.message)
                callback(err.message)
            }else{
                console.log('PostgreDB initialized')
                callback(null)
            }
        });
    }
}

function Select(callback) {
    var query = 'SELECT * FROM items'
    pgClient.query(query, function (err, result) {
        if (err) {
            callback(err)
        }else{
            callback(null, result.rows)
        }
    });
}

function Insert(data, callback) {
    if (!data.hasOwnProperty('imgvector')){
        data.imgvector = null;
    }

    console.log('PG Inserting Table data for '+data.origin+' item '+ data.productID)
    
    var query   = 'INSERT INTO items(productID,origin,image,imgvector) '
                + 'VALUES($1, $2, $3, $4) '
                + 'ON CONFLICT (productID,origin) DO UPDATE '
                + 'SET image = $3'

    pgClient.query(query, [data.productID,data.origin,data.image,data.imgvector], function (err,result){
        if (err) {
            console.error(err)
            if(typeof callback === "function") {callbakc(err)}
        }else{
            if(typeof callback === "function") {callbakc(null, result)}
        }
    });
}

function Update(item, callback) {
    console.log('PG Updating Table data '+ JSON.stringify(item))

    var query = 'UPDATE items SET integrated = true WHERE productID = $1';
    pgClient.query(query, [item], function (err,result){
        if (err) {
            callback(err)
        }else{
            callback(null, result)
        }
    });
}