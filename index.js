require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyparser = require('body-parser');
const dns = require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;
var global = new Array();
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = parseInt(req.params.short_url)
  global.at(short_url - 1) ? res.redirect(global.at(short_url - 1)) : res.json({ error: 'invalid url' })
});

app.post('/api/shorturl', bodyparser.urlencoded({ extended: false }),
  (req, res, next) => {
    const domain = new URL(req.body.url).hostname;
    dns.lookup(domain, (err, address, family) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        next();
      }
    });
  }, (req, res) => {
    if (req.body && req.body.url && new RegExp('/https?://www\..*\..*').test(req.body.url)) {
      let data = { original_url: req.body.url, short_url: global.length + 1 };
      global.push(data)
      return res.json(data)
    }

    return res.json({ error: 'invalid url' })
  });
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
