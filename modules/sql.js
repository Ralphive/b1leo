/* Module to interact with SQL Database (PostreSQL) */
/** Persistence Layer (PostGree) library */
var pgClient;

module.exports = {
    Initialize: function (callback) {
        return (Initialize(callback));
    },
    Select: function (callback) {
        return (Select(callback));
    },
    SelectImages: function (callback) {
        return (SelectImages(callback));
    },
    SelectErpItems: function (origin, callback) {
        return (SelectErpItems(origin, callback));
    },
    Insert: function (data, callback) {
        return (Insert(data, callback));
    },
    UpdateVector: function (data, callback) {
        return (UpdateVector(data, callback));
    },
    setClient: function (inClient) { pgClient = inClient; }

}

function Initialize(callback) {
    console.log('Initializing PostgreSQL database')

    var query = 'CREATE TABLE IF NOT EXISTS '
        + 'items (productid varchar(256) NOT NULL, origin varchar(10) NOT NULL, image varchar(500), imgvector text,'
        + 'PRIMARY KEY (productid, origin))'

    if (pgClient) {
        pgClient.query(query, function (err, result) {
            if (err) {
                console.error("Error Initializing PostgreSQL db: " + err.message)
                callback(err.message)
            } else {
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
        } else {
            callback(null, result.rows)
        }
    });
}

function SelectErpItems(origin, callback) {
    var query = 'SELECT * FROM items where origin = $1'
    pgClient.query(query, [origin], function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null, result.rows)
        }
    });
}

function SelectImages(callback) {
    var query = 'SELECT * FROM items where imgvector IS NOT null'
    pgClient.query(query, function (err, result) {
        if (err) {
            callback(err)
        } else {
            callback(null, result.rows)
        }
    });
}

function Insert(data, callback) {
    if (!data.hasOwnProperty('imgvector')) {
        data.imgvector = null;
    }

    console.log('PG Inserting Table data for ' + data.origin + ' item ' + data.productid)

    var query = 'INSERT INTO items(productid,origin,image,imgvector) '
        + 'VALUES($1, $2, $3, $4) '
        + 'ON CONFLICT (productid,origin) DO UPDATE '
        + 'SET image = $3'

    pgClient.query(query, [data.productid, data.origin, data.image, data.imgvector], function (err, result) {
        if (err) {
            console.error(err)
            if (typeof callback === "function") { callback(err) }
        } else {
            if (typeof callback === "function") { callback(null, result) }
        }
    });
}

function UpdateVector(data, callback) {
    console.log('PG Updating Vector Table for ' + data.origin + ' item ' + data.productid)

    var pgvector = data.imgvector;
    pgvector ="["+pgvector.toString()+"]" 

    var query = 'UPDATE items SET imgvector = $3 WHERE productid = $1 and origin = $2';
    
    pgClient.query(query, [data.productid, data.origin, pgvector], function (err, result) {
        if (err) {
            console.error(err)
            if (typeof callback === "function") { callback(err) }
        } else {
            if (typeof callback === "function") { callback(null, result) }
        }
    });
}