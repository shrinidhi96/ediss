var express = require("express");
var sql = require('mysql');
const fs = require('fs');
var ip = require("ip");
var isAlphanumeric = require('is-alphanumeric');
var session = require('express-session');

var global_increment=0;
var connection = sql.createConnection({
  host     : 'userdb.c75hsef0b9wp.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'password',
  database : 'userdb'
});
var app = express();

app.use(session({

secret: 'my express secret',
saveUninitialized: true,
resave: true,
rolling: true,
maxAge: 900000

}));

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error connecting database ...");
}
});

/***
Register users
***/
app.post("/registerUser",function(req,res){

  var username = req.param('username');
  var password = req.param('password');
  var fname = req.param('fname');
  var lname = req.param('lname');
  var address = req.param('address');
  var city = req.param('city');
  var state = req.param('state');
  var zip = req.param('zip');
  var email = req.param('email');
  connection.query('SELECT * from userinfo where username=?',[username],function(err,rows,fields){
    if(!err){
      //Already in db or one of the parameters is missing
      if(rows.length!=0||!username||!password||!fname||!lname||!address||!city||!state||!zip||!email)
        res.send({"message":"The input you provided is not valid"});
      else {
          //add to db
          connection.query('INSERT INTO userinfo VALUES (?,?,?,?,?,?,?,?,?)',[fname,lname,address,city,state,zip,email,username,password],function(err,result){
            if(err)
              throw err;
            else{
              console.log("1 record inserted into userinfo");
              var ret = {"message":fname +" was registered successfully"};
              res.send(ret);
            }
          });
        }
    }
    else{
      console.log('Error while performing Query.');
      res.send("Querying Error");
    }
  });
});



app.post("/login",function(req,res){
var uname = req.param('username');
var pw = req.param('password');
var fname;
var ret;
connection.query('SELECT * from userinfo where username = ?',[uname], function(err, rows, fields) {

  if (!err){

    if(pw==rows[0].password){
      console.log('User has been validated');
      fname = rows[0].fname;
      if(uname=='jadmin'){
        req.session.isAdmin = true;
      }
      else {
        req.session.isAdmin = false;
      }
      req.session.loginstatus=true;
      req.session.username=uname;
      req.session.firstname=fname;
      ret = {"message":"Welcome "+fname};

    }
    else {
      ret = {"message":"There seems to be an issue with the username/password combination that you entered"};

    }
    res.send(ret);

  }

  else{
    console.log('Error while performing Query.');
    res.send("Querying Error");
  }

  });


});


app.post('/logout', function(req, res){
  if(req.session.loginstatus == true){
    if(req.session.isAdmin==true){
      req.session.isAdmin=false;
    }
    req.session.loginstatus=false;
    req.session.destroy;
    res.send({"message":"You have been successfully logged out"});
  }
  else{
    res.send({"message":"You are not currently logged in"});
  }
});

app.post('/updateInfo',function(req,res){
  var username = req.param('username');
  var password = req.param('password');
  var fname = req.param('fname');
  var lname = req.param('lname');
  var address = req.param('address');
  var city = req.param('city');
  var state = req.param('state');
  var zip = req.param('zip');
  var email = req.param('email');

  if(req.session.loginstatus==false||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  else{
      //user is logged in
      if(email){
        connection.query('UPDATE userinfo SET email=? WHERE username=?',[email,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - email");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if email

      if(zip){
        connection.query('UPDATE userinfo SET zip=? WHERE username=?',[zip,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - zip");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if zip

      if(state){
        connection.query('UPDATE userinfo SET state=? WHERE username=?',[state,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - state");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if state

      if(city){
        connection.query('UPDATE userinfo SET city=? WHERE username=?',[city,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - city");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if city

      if(address){
        connection.query('UPDATE userinfo SET address=? WHERE username=?',[address,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - address");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if address

      if(lname){
        connection.query('UPDATE userinfo SET lname=? WHERE username=?',[lname,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - last name");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if lname

      if(fname){
        connection.query('UPDATE userinfo SET fname=? WHERE username=?',[fname,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - first name");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if firstname

      if(password){
        connection.query('UPDATE userinfo SET password=? WHERE username=?',[password,req.session.username],function(err,result){
          if(err)
            throw err;
          else{
            console.log("1 row updated successfully - password");
            res.send({"message":req.session.firstname+" your information was successfully updated"});
          }
        });
      }//end of if password

      if(username){
        connection.query('SELECT * FROM userinfo where username=?',[username],function(err,rows,fields){
          if(!err){

            if(rows.length!=0)
              res.send({"message":"The input you provided is not valid"});
            else {
                //update
                connection.query('UPDATE userinfo SET username=? WHERE username=?',[username,req.session.username],function(err,result){
                  if(err)
                    throw err;
                  else{
                    console.log("1 row updated successfully - username");
                    req.session.username=username;
                    res.send({"message":req.session.firstname+" your information was successfully updated"});
                  }
                });

              }
          }
          else{
            console.log('Error while performing Query.');
            res.send("Querying Error");
          }

        });

      }//end of if username

  }
});

/***
Add products
***/
app.post('/addProducts',function(req,res){
  var asin = req.param('asin');
  var pname = req.param('productName');
  var pdes = req.param('productDescription');
  var pgroup = req.param('group');
  if(req.session.loginstatus==false||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  if(req.session.isAdmin==true){
    if(!asin){
      res.send({"message":"The input you provided is not valid"});
    }
    connection.query('SELECT * from products where asin=?',[asin],function(err,rows,fields){
      if(!err){
        //Already in db or one of the parameters is missing
        if(rows.length!=0||!asin||!pname|!pdes||!pgroup)
          res.send({"message":"The input you provided is not valid"});
        else {
            //add to db
            connection.query('INSERT INTO products VALUES (?,?,?,?)',[asin,pname,pdes,pgroup],function(err,result){
              if(err)
                throw err;
              else{
                console.log("1 record inserted into products");
                var ret = {"message":pname+ " was successfully added to the system"};
                res.send(ret);
              }
            });
          }
      }
      else{
        console.log('Error while performing Query.');
        res.send("Querying Error");
      }
    });
  }
  else {
    res.send({"message":"You must be an admin to perform this action"});
  }
});

app.post('/modifyProduct',function(req,res){
  var asin = req.param('asin');
  var pname = req.param('productName');
  var pdes = req.param('productDescription');
  var pgroup = req.param('group');
  if(req.session.loginstatus==false||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  if(req.session.isAdmin==true){
    connection.query('SELECT * FROM products where asin=?',[asin],function(err,rows,fields){
      if(!err){
        //Not in DB or missing attributes
        if(rows.length==0||!pname||!pdes||!pgroup||!asin)
          res.send({"message":"The input you provided is not valid"});
        else {
            //update
            connection.query('UPDATE products SET productName=?,productDescription=?,pgroup=? WHERE asin=?',[pname,pdes,pgroup,asin],function(err,result){
              if(err)
                throw err;
              else{
                console.log("1 row updated successfully - in products");
                res.send({"message":pname+" was successfully updated"});
              }
            });

          }
      }
      else{
        console.log('Error while performing Query.');
        res.send("Querying Error");
      }

    });

  }
  else {
    res.send({"message":"You must be an admin to perform this action"});
  }
});

app.post("/viewUsers",function(req,res){
  //SELECT * FROM userinfo WHERE fname LIKE '%${fname}%' AND lname LIKE '%${lname}%'
  var fname=req.param('fname');
  var lname=req.param('lname');
  if(!req.session.loginstatus||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  else if(!req.session.isAdmin){
    res.send({"message":"You must be an admin to perform this action"});
  }
  else{//is an admin and is logged interval
    if(fname && lname){
    var sql ="SELECT fname,lname,id FROM userinfo WHERE fname LIKE '%" +fname+"%' AND lname LIKE '%"+lname+"%'";
        connection.query(sql,function(err,rows,fields){
        //Do logic to convert rows to JSON and send it in response
        if(!err){
          if(rows.length==0){
            res.send({"message":"There are no users that match that criteria"});
          }
          else{
            console.log(rows);
            res.send({"message":"The action was successful","user":rows});
          }

        }
        else{
          console.log('Error while performing Query.');
          res.send("Querying Error");
        }
      });
    }
    else if(fname && !lname){//Handle one parameter cases in 2 elseifs and if no parameter is provided, display all - different query
      var sql ="SELECT fname,lname,id FROM userinfo WHERE fname LIKE '%" +fname+"%'";
          connection.query(sql,function(err,rows,fields){
          //Do logic to convert rows to JSON and send it in response
          if(!err){
            if(rows.length==0){
              res.send({"message":"There are no users that match that criteria"});
            }
            else{
              console.log(rows);
              res.send({"message":"The action was successful","user":rows});
            }

          }
          else{
            console.log('Error while performing Query.');
            res.send("Querying Error");
          }
        });
    }
    else if(lname && !fname){
      var sql ="SELECT fname,lname,id FROM userinfo WHERE lname LIKE '%" +lname+"%'";
          connection.query(sql,function(err,rows,fields){
          //Do logic to convert rows to JSON and send it in response
          if(!err){
            if(rows.length==0){
              res.send({"message":"There are no users that match that criteria"});
            }
            else {
              console.log(rows);
              res.send({"message":"The action was successful","user":rows});
            }

          }
          else{
            console.log('Error while performing Query.');
            res.send("Querying Error");
          }
        });
    }
    else{ //
      var sql ="SELECT fname,lname,id FROM userinfo";
          connection.query(sql,function(err,rows,fields){
          //Do logic to convert rows to JSON and send it in response
          if(!err){
            if(rows.length==0){
              res.send({"message":"There are no users that match that criteria"});
            }
            else {
              console.log(rows);
              res.send({"message":"The action was successful","user":rows});
            }

          }
          else{
            console.log('Error while performing Query.');
            res.send("Querying Error");
          }
        });
    }
  }
});

app.post("/viewProducts",function(req,res){
  //SELECT * FROM userinfo WHERE fname LIKE '%${fname}%' AND lname LIKE '%${lname}%'
  var asin=req.param('asin');
  var keyword=req.param('keyword');
  var pgroup = req.param('group');
  if(!asin){
    asin='';
  }
  if(!keyword){
    keyword='';
  }
  if(!pgroup){
    pgroup='';
  }

  var sql = "SELECT asin,productName FROM products WHERE asin LIKE '%" +asin+"%' AND (productName LIKE '%"+keyword+"%' OR productDescription LIKE '%"+keyword+"%') AND pgroup LIKE '%"+pgroup+"%'";
  connection.query(sql,function(err,rows,fields){
  //Do logic to convert rows to JSON and send it in response
  if(!err){
    if(rows.length==0){
      res.send({"message":"There are no products that match that criteria"});
    }
    else{
      res.send({"product":rows});
    }

  }
  else{
    console.log('Error while performing Query.');
    res.send("Querying Error");
  }
});
});
app.listen(3000, () => {
 console.log("Server running on port 3000");
});
