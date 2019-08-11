var express = require("express");
var sql = require('mysql');
const fs = require('fs');
var ip = require("ip");
var session = require('express-session');
const bodyParser = require('body-parser');
var connection = sql.createConnection({
	  host     : 'userdb.c75hsef0b9wp.us-east-1.rds.amazonaws.com',
	  user     : 'root',
	  password : 'password',
	  database : 'userdb'
	});
var redis   = require("redis");
var redisStore = require('connect-redis')(session);
var client  = redis.createClient();
var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) ;
app.use(session({

secret: 'my express secret',
saveUninitialized: true,
resave: true,
rolling: true,
maxAge: 900000,
store: new redisStore({ host: 'userdb.c75hsef0b9wp.us-east-1.rds.amazonaws.com', port: 6379, client: client,ttl :  260}) //change url

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
console.log('register');
  var username = req.body.username;
  var password = req.body.password;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var email = req.body.email;
  if(!username){
    res.send({"message":"The input you provided is not valid"});
  }
  else{
    console.log(username +" is the user who has to be registered");
  connection.query('SELECT * from userinfo where username=?',[username],function(err,rows,fields){
    if(!err){
      //Already in db or one of the parameters is missing
      console.log(username +" is the user who has to be registered");
      console.log('no querying error for select *');

      if(rows.length!=0||!password||!fname||!lname||!address||!city||!state||!zip||!email){


        console.log('either already in db or missing parameters');
        res.send({"message":"The input you provided is not valid"});
        }
      else {
          //add to db
          console.log('all values provided');
          connection.query('INSERT INTO userinfo(fname,lname,address,city,state,zip,email,username,password) VALUES (?,?,?,?,?,?,?,?,?)',[fname,lname,address,city,state,zip,email,username,password],function(err,result){
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
  }

});

/***
Login Functionality
***/
app.post("/login",function(req,res){
var uname = req.body.username;
var pw = req.body.password;
var fname;
var ret;
console.log('login');
if(uname&&pw){


connection.query('SELECT * from userinfo where username = ?',[uname], function(err, rows, fields) {
  if(err){
    res.send("Querying Error");
  }
  else{
    if(rows.length==0){//username does not exist
      console.log('username does not exist');
      res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
    }
    else{//username exists,validate password
      console.log('username exists');
      if(rows[0].password==pw){//password matches
        console.log('User has been validated');
        fname=rows[0].fname;
        if(uname=='jadmin'){//This person is an admin
          req.session.isAdmin=true;
        }
        else{//Not an admin
          req.session.isAdmin=false;
        }
        req.session.loginstatus=true;
        req.session.username=uname;
        req.session.firstname=fname;
        res.send({"message":"Welcome "+fname});
      }
      else{//password does not match
        res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
      }
    }
  }
});
}
else{
  res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
}
});
/***
Logout Functionality
***/

app.post('/logout', function(req, res){
  console.log('logout');
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
/***
Update user information
***/
app.post('/updateInfo',function(req,res){
  console.log('update');
  var username = req.body.username;
  var password = req.body.password;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var zip = req.body.zip;
  var email = req.body.email;

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
  console.log('addProducts');
  var asin = req.body.asin;
  var pname = req.body.productName;
  var pdes = req.body.productDescription;
  var pgroup = req.body.group;
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
          // if(pgroup.length>0){
            // for(var i =0; i<pgroup.length; i++){
                connection.query('INSERT INTO products VALUES (?,?,?,?)',[asin,pname,pdes,pgroup],function(err,result){
                  if(err)
                    throw err;
                  else{
                    console.log("1 record inserted into products");
                  }
                });
              //}
            //}
            /*else{
              connection.query('INSERT INTO products VALUES (?,?,?,?)',[asin,pname,pdes,pgroup],function(err,result){
                if(err)
                  throw err;
                else{
                  console.log("1 record inserted into products");
                  //Move the 2 lines elsewhere

                }
              });
            }*/
            var ret = {"message":pname+ " was successfully added to the system"};
            res.send(ret);
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
/***
Modify a product based on asin
***/
app.post('/modifyProduct',function(req,res){
  console.log('modifyProduct');
  var asin = req.body.asin;
  var pname = req.body.productName;
  var pdes = req.body.productDescription;
  var pgroup = req.body.group;
  if(req.session.loginstatus==false||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  if(req.session.isAdmin==true){
    console.log("Your are an admin, and you are inside modify products");
    connection.query('SELECT * FROM products where asin=?',[asin],function(err,rows,fields){
      if(!err){
        //Not in DB or missing attributes
        if(rows.length==0||!pname||!pdes||!pgroup||!asin){
          console.log("Your are an admin, and you are inside modify products, but no valid input");
          res.send({"message":"The input you provided is not valid"});
        }

        else {
            //update
            console.log("Your are an admin, and you are inside modify products, but yes valid input");
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
/***
View Users of the system
***/
app.post("/viewUsers",function(req,res){
  console.log('view users');
  var fname=req.body.fname;
  var lname=req.body.lname;
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
/***
View the products in the system
***/
app.post("/viewProducts",function(req,res){
  console.log('view products');
  var asin=req.body.asin;
  var keyword=req.body.keyword;
  var pgroup = req.body.group;
  if(!asin){
    asin='';
  }
  if(!keyword){
    keyword='';
  }
  if(!pgroup){
    pgroup='';
  }
  if(asin){
    var sql = "SELECT asin,productName FROM products WHERE asin="+asin;
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
  }
  else{
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
  }

});
app.post("/dummy",function(req,res){
  var count = req.body.count;
  var promise = new Promise(function(resolve,reject){
    while(count<6){
      count++;
    }
    if(count>0)
      resolve(count);
    /*else {
      reject
    }*/
  });

  console.log("Count not inside then: "+count);
  promise.then(function(value){
    if(resolve){
      console.log(value);
      res.send('The final value of count from resolve: '+value);
    }
    else{
      console.log('Within Reject');
      res.send('The final value of count from reject: '+value);
    }

  });
  //console.log('End of dummy!');




});
/***
Buy Products
***/

app.post("/buyProducts",function(req,res){
  var count = 0;var errc =0;
  const products = req.body.products;
  if(req.session.loginstatus){

    console.log('Buy products');

    var i;
    if(!products){
      res.send({"message":"There are no products that match that criteria"});
    }
    else{


      for (i = 0; i < products.length ; i++){
      const asin = products[i].asin;
      var sql = "SELECT productName from products WHERE asin="+asin;
      connection.query(sql,function(err,rows,fields){
      if(!err){
        if(rows.length==0){ //Invalid asin
          errc++;
          console.log({"message":"There are no products that match that criteria"});
        //  console.log('Asin does not exist,   = '+ );
        console.log('Errc = '+errc+' when i ='+i+' and count = '+count);
          if(i==products.length && errc>=products.length)
          {
             res.send({"message":"There are no products that match that criteria"});
          }

        }
        else{ //asin exists
          //Get productName from the products TABLE
          const pname = rows[0].productName
          //Insert into orders TABLE
          connection.query("INSERT INTO orders VALUES(?,?,?,?)",[pname,req.session.username,asin,1],function(err1,result){

          if(!err1 && result!=null){
              count++;
              console.log('Errc in opposite and count in proper : '+errc+' '+count+' i='+i);
              if(i==products.length && count>=products.length)
              {
                console.log('Value of count: '+count);
                if(count!=products.length){
                  ret = true;
                  res.send({"message":"There are no products that match that criteria"});
                }
                else{
                  console.log('Within 1st if');
                  ret = true;
                  res.send({"message":"The action was successful"});
                }
              }
             if(i==products.length && errc>0 && (count+errc)==products.length){
                  console.log('Within 2nd if, i = '+i);
                  if(count<products.length && count>0){
                    console.log('2 nd if if');
                    ret = true;
                    res.send({"message":"The action was successful"});
                  } //partial case

              }
          }
          else{
              console.log('Error while performing Query.');
          }


          });
        }
      }
      else{
        console.log('Error while performing Query.');
      }
      });
    } // end of for



  }

    for(i=0;i<products.length;i++){

        const asin_one = products[i].asin;
        for(var j=0; j<products.length;j++){ //Populate frequent_items

            const asin_bought_with_one=products[j].asin;
            if(asin_bought_with_one == asin_one){ //do not add
              console.log('Same id');
              continue;
            }
            else{
              console.log('ASIN ONE: '+asin_one+' ASIN TWO: '+asin_bought_with_one);
              var query = "SELECT * FROM frequent_items WHERE asin_one="+asin_one+" AND asin="+asin_bought_with_one;
              connection.query(query,function(err,rows,fields){
                if(!err){
                  if(rows.length==0){
                    var insertintotable = "INSERT INTO frequent_items VALUES(?,?,?)";
                    connection.query(insertintotable,[asin_one,asin_bought_with_one,1],function(err,result){
                        if(!err){
                          console.log('Inserted into frequent_items');
                        }
                        else{
                          console.log('Error while performing Query - frequent-items insert.')
                        }
                    });
                  }
                  else{
                    var updatetable = "UPDATE frequent_items SET frequency=? WHERE asin_one=? AND asin=?";
                    const frequency = rows[0].frequency;
                    connection.query(updatetable,[frequency+1,asin_one,asin_bought_with_one],function(err,results){
                      if(!err){
                        console.log('Update successful in frequent_items');
                      }
                      else{
                        console.log('Error while performing Query.- frequent-items update');
                      }
                    });
                  }

                }
                else{
                  console.log('Error while performing Query.');
                }
              });
            }


        }


    }


}
else{
  res.send({"message":"You are not currently logged in"});
}
});














/***
View purchased products by a given user
***/
app.post("/productsPurchased",function(req,res){
  console.log('Products purchased');
  const uname=req.body.username;
  if(!uname){
    res.send({"message":"There are no users that match that criteria"});
  }
  else if(!req.session.loginstatus||req.session.loginstatus==undefined){
    res.send({"message":"You are not currently logged in"});
  }
  else if(!req.session.isAdmin){
    res.send({"message":"You must be an admin to perform this action"});
  }
  else{//is an admin and is logged interval
        connection.query("SELECT productName,quantity FROM orders WHERE userid=?",[uname],function(err,rows,fields){
        if(!err){
          if(rows.length==0){
            res.send({"message":"There are no users that match that criteria"});
          }
          else{
            console.log(rows);
            res.send({"message":"The action was successful","products":rows});
          }
        }
        else{
          console.log('Error while performing Query.');
          res.send("Querying Error");
        }
      });
  }
});

/***
Recommendation Engine
***/
app.post("/getRecommendations",function(req,res){
  console.log('Get recommendations');
  const asin_one = req.body.asin;
  if(!req.session.loginstatus){
    res.send({"message":"You are not currently logged in"});
  }
  else{
    connection.query("SELECT asin FROM frequent_items WHERE asin_one=? ORDER BY frequency DESC LIMIT 5",[asin_one],function(err,rows,fields){
      if(!err){
        if(rows.length==0){
          console.log('No product found!');
          res.send({"message": "There are no recommendations for that product"});
        }
        else{
          console.log('Product found!');
          res.send({"message":"The action was successful","products":rows});
        }
      }
      else{
        console.log('Querying Error!')
      }
    });

  }




});


app.listen(3000, () => {
 console.log("Server running on port 3000");
});
