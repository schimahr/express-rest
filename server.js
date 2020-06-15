const express = require('express');
const app = express();
const port = 8080;
const db = require('./baza.js');
const md5 = require('md5');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Pokretanje servera
app.listen(port, () => console.log('Server je pokrenut na portu: ', port));

app.get('/', (req, res, next) => res.json({"poruka":"početna stranica"}));

// Svi korisnici
app.get('/api/korisnici', (req,res,next) => {
    var sql = 'SELECT * FROM korisnik';
    var parametri = [];
    db.all(sql,parametri, (err, rows) => {
        if (err){
            res.status(400).json({"pogreška":err.message});
            return;
        }
        res.json({
            "poruka":"uspjeh",
            "podatci":rows
        })
    });
});

// Pojedinačno po ID
app.get('/api/korisnik/:id', (req,res,next) => {
    var sql = 'SELECT * FROM korisnik WHERE id = ?';
    var parametri = [req.params.id];
    db.get(sql, parametri, (err, row) => {
        if (err){
            res.status(400).json({"pogreška":err.message});
            return;
        }
        res.json({
            "poruka":"uspjeh",
            "podatci":row
        })
    });
});

// Kreiranje

app.post('/api/korisnik/', (req,res,next) => {
    var errors = [];
    if (!req.body.email){
        errors.push("Niste unijeli email.");
    }
    if (!req.body.lozinka){
        errors.push("Niste unijeli lozinku.");
    }
    if (errors.length){
        res.status(400).json({"pogreška":errors.join(",")});
        return
    }
    var podatci = {
        ime: req.body.ime,
        prezime: req.body.prezime,
        email: req.body.email,
        lozinka: md5(req.body.lozinka)
    }
    var sql = 'INSERT INTO korisnik (ime,prezime,email,lozinka) VALUES (?,?,?,?)';
    var parametri = [podatci.ime, podatci.prezime, podatci.email, podatci.lozinka];
    db.run(sql, parametri, (err,result) => {
        if (err){
            res.status(400).json({"pogreška":err.message});
            return;
        }
        res.json({
            "poruka":"uspjeh",
            "podatci":podatci,
            "id": this.lastID,
        })
    });
})

// Ažuriranje

app.patch('/api/korisnik/:id', (req,res,next) => {
    var podatci = {
        ime: req.body.ime,
        prezime: req.body.prezime,
        email: req.body.email,
        lozinka: req.body.lozinka ? md5(req.body.password): null
    }
    db.run(
        `UPDATE korisnik SET 
        ime = COALESCE(?,ime),
        prezime = COALESCE(?, prezime),
        email = COALESCE(?, email),
        lozinka = COALESCE(?, lozinka)
        WHERE id = ?`,
    [podatci.ime,podatci.prezime,podatci.email,podatci.lozinka,req.params.id],
    (err,result) => {
        if(err){
            res.status(400).json({"pogreška":err.message});
            return;
        }
        res.json({
            message:"uspješno ažurirano",
            podatci:podatci,
            changes: this.changes
        })
    });
});

// Brisanje

app.delete('/api/korisnik/:id', (req, res, next) => {
    db.run('DELETE FROM korisnik WHERE id = ?',
    req.params.id,
    (err, result) => {
        if(err){
            res.status(400).json({"pogreška":err.message});
            return;
        }
        res.json({
            "poruka":"uspješno obrisano",
            changes: this.changes
        })
    });
});




// Odgovor za nepostojeće stranice
app.use((req,res, next) => res.status(404).send('Stranica ne postoji'));

