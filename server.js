'use strict';
//Setup
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 4000;
const app = express();
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);

client.on('error',err=>console.log(err));
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static('./public'));




// Routes
app.get('/',homeHandler)
app.post('/addToFavorites',addToFavoriteHandler)
app.get('/favorites',favoriteHandler)
app.get('/details/:id',detailsHandler)
app.put('/update/:id',updateHandler)
app.delete('/delete/:id', deleteHandler)

// Route functions

function homeHandler(req,res){
    const URL = 'https://digimon-api.herokuapp.com/api/digimon';
    superagent(URL).then(result=>{
        let digimonResults = result.body.map(value=>{
            return new Digimon(value);
        })
        res.render('./pages/index',{digimonResults: digimonResults})
    })
}

function addToFavoriteHandler(req,res){
    const SQL = 'INSERT INTO digimon(name,img,level) VALUES ($1,$2,$3)'
    const {theName,theImg,theLevel} = req.body;
    const values = [theName,theImg,theLevel];
    client.query(SQL,values).then(result=>{
        res.redirect('/favorites')
    })
}

function favoriteHandler(req,res){
    const SQL = 'SELECT * FROM digimon';
    client.query(SQL).then(result=>{
        console.log(result.rows)
        res.render('./pages/favorites',{result:result.rows})
    })
}

function detailsHandler(req,res){
    const SQL = 'SELECT * FROM digimon WHERE id=$1'
    const values = [req.params.id];
    client.query(SQL,values).then(result=>{
        console.log(result.rows)
        res.render('./pages/details',{result:result.rows})
    })
}

function updateHandler(req,res){
    const SQL = 'UPDATE digimon SET name=$1,img=$2,level=$3 WHERE id=$4';
    const {theName,theImg,theLevel} = req.body;
    const values = [theName,theImg,theLevel,req.params.id];
    client.query(SQL,values).then(result=>{
        res.redirect(`/details/${req.params.id}`)
    })
}

function deleteHandler(req,res){
    const SQL= 'DELETE FROM digimon WHERE id=$1';
    const values = [req.params.id];
    client.query(SQL,values).then(result=>{
        res.redirect('/favorites')
    })
}


// Constructor Function

function Digimon(data){
    this.name = data.name;
    this.img = data.img;
    this.level = data.level;
}



client.connect().then(()=>{
    app.listen(PORT,()=>console.log(`Server is up and running on port ${PORT}`))
})