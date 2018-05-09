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
                + 'items (code varchar(256) NOT NULL, origin varchar(10) NOT NULL, imgvector decimal array,'
                + 'PRIMARY KEY (code, origin))'

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
    var query = 'SELECT code, name, integrated FROM items where integrated = false'
    pgClient.query(query, function (err, result) {
        if (err) {
            callback(err)
        }else{
            callback(null, result.rows)
        }
    });
}

function Insert(data, callback) {
    console.log('PG Inserting Table data '+ JSON.stringify(data))

    var query = 'INSERT INTO items(code,name,integrated) VALUES($1, $2, $3)';
    pgClient.query(query, [data.code,data.name,false], function (err,result){
        if (err) {
            callback(err)
        }else{
            callback(null, result)
        }
    });
}

function Update(item, callback) {
    console.log('PG Updating Table data '+ JSON.stringify(item))

    var query = 'UPDATE items SET integrated = true WHERE code = $1';
    pgClient.query(query, [item], function (err,result){
        if (err) {
            callback(err)
        }else{
            callback(null, result)
        }
    });
}
