var express = require('express');
var cors = require('cors');
var app = express();
app.use(cors());

app.listen(4242, () => {
  
  console.log(`Server running on 4242`);

});


app.use(express.json());



/* GET home page. */
app.get('/', function(req, res) {
  res.render('index', { title: 'Comedy Backend' });
});


module.exports = app;
