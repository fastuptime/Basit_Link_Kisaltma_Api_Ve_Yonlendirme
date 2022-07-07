const express = require('express');
const moment = require('moment');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const server_domain = 'http://localhost'; //Örnek: https://fastuptime.com
const port = 80;

let data_base = mongoose.createConnection('mongodb://localhost/');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let link_schema = new mongoose.Schema({
    link: String,
    url: String,
    code: String,
    created_at: String
});

let link_model = data_base.model('link', link_schema);

function log(msg) {
  console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} ➾ ${msg}`);
  fs.appendFileSync("./log.txt", `${moment().format("YYYY-MM-DD HH:mm:ss")} ➾ ${msg} \n`);
}

app.post('/short', async (req, res) => {
    let data = req.body;
    if(!data.url) return res.json({ status: 'error', message: 'url is required' });
    log(`${data.url} is trying to be shortened`);
    let url = data.url;
    if(!url.includes('http')) return res.json({ status: 'error', message: 'url is required' });
    let short = '';
    let kar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for(let i = 0; i < 12; i++) {
        short += kar.charAt(Math.floor(Math.random() * kar.length));
    }
    let short_url = `${server_domain}/short/${short}`;
    let link = new link_model({
        link: short_url,
        url: url,
        code: short,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss")
    });
    link.save((err, result) => {
        if(err) return res.json({ status: 'error', message: err });
        log(`${url} short link: ${short_url}`);
        res.json({ status: 'success', message: 'link created', link: short_url });
    });
});

app.get('/short/:short', async (req, res) => {
    let short = req.params.short;
    let data = await link_model.findOne({ code: short });
    if(!data) return res.json({ status: 'error', message: 'link not found' });
    log(`${short} link: ${data.link} visited`);
    res.redirect(data.url);
});

app.listen(port, () =>
    log(`Express Başlatıldı`)
);