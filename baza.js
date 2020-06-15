const sqlite = require('sqlite3').verbose();
const md5 = require('md5');
const dbsource = 'db.sqlite';

let db = new sqlite.Database(dbsource, (err) => {
    if (err) {
        console.log(err.message);
        throw err;
    } else {
        console.log('Uspješno spojen na bazu.');
        db.run(`CREATE TABLE korisnik(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ime TEXT,
            prezime TEXT,
            email TEXT UNIQUE,
            lozinka TEXT,
            CONSTRAINT email_unique UNIQUE (email)
            )`,
            (err) => {
                if(err){
                    console.log('Tablica već postoji');
                } else {
                    var insert = 'INSERT INTO korisnik (ime, prezime, email, lozinka) VALUES (?,?,?,?)';
                    db.run(insert, ['Ivan','Šimičić','ivansimicic@email.com',md5("ivansifra")]);
                    db.run(insert, ['Luka','Šimičić','luka@email.com',md5('lukasifra')]);
                }
            }

        )}
});

module.exports = db