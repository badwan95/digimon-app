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
        res.redirect('/favList')
    })
}

function favoriteHandler(req,res){
    const SQL = 'SELECT * FROM digimon';
    client.query(SQL).then(result=>{
        console.log(result.rows)
        res.render('./pages/favorites',{result:result.rows})
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