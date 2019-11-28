require('dotenv').config()

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dbConn = require('./database');

app.use(bodyParser.json())

// API request headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Port 8080 for Google App Engine
app.set('port', process.env.PORT || 8080);
app.listen(8080);

// check the api status running or not
app.get('/status', (req, res) => res.send('Working!'));


app.get('/api/gethere/', function (req, res) {
		res.send('Working! gethere')
});

// get data of all users
app.get('/api/getdata', function (req, res) {
	query = 'select * from users';			
	dbConn.query(query, function (error, results, fields) {
	  if (error) throw error;
	  // console.log('The solution is: ', results);
	  res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
	});
	dbConn.end();
});

// login 
app.post('/login',function(req,res){
    var email=req.body.email;
    var password=req.body.password;
    dbConn.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
        if(results.length >0){
            if(password==results[0].password){
                res.json({
                    status:true,
					errorType:'success',
                    message:'successfully authenticated',
					data:results
                })
            }else{
                res.json({
                  status:false,
				  errorType:'notmatch',
                  message:"Email or password does not match",
				  data:''
                 });
            }         
        }
        else{
          res.json({
			status:false,  
			errorType:'notexist',			
			message:"Email does not exits",
			 data:''
          });
        }
    });
});

// Retrieve all users 
app.get('/users', function (req, res) {
    dbConn.query('SELECT * FROM users', function (error, results, fields) {
        if (error) throw error;
        return res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
});

// Add spin result after wheel spin
app.post('/addspin-results', function (req, res) {
    dbConn.query('insert into spinresult (email, result) values("'+req.body.email+'", "'+req.body.result+'")', function (error, results, fields) {
        if (error) throw error;
        return res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
});

// get wheeldetail
app.get('/getWheelDetail', function (req, res) {
    dbConn.query('select A.*, B.label, B.promocode, B.winratio, B.wintext, B.wheelsettingID from wheelsetting A LEFT OUTER JOIN slices B on A.ID = B.wheelsettingID', function (error, results, fields) {
        if (error) throw error;
        return res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
});

// Add spin result after wheel spin
app.get('/getAllWheels', function (req, res) {
    dbConn.query('SELECT m.*, \
       (SELECT COUNT(*) \
          FROM spinresult WHERE wheelsettingid = m.ID) emailcount\
  FROM wheelsetting m', function (error, results, fields) {
        if (error) throw error;
        return res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
});

app.post('/signup',function(req,res){
    var email=req.body.email;
	var password= req.body.password;
   
    dbConn.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
      // if (error) {
          // res.json({
            // status:false,
            // message:'there are some error with query'
            // })
		// }else{
        if(results.length >0 && email==results[0].email){
			res.json({
				status:true,
				message:'email already exist'
			})			
            }else{
			var users={        
				"email":req.body.email,
				"password":req.body.password
			}
		dbConn.query('insert into users (email, password) values("'+req.body.email+'", "'+req.body.password+'")', function (error, results, fields) {
		  if (error) {
			res.json({
				status:false,
				message:error
			})
			}else{
				  res.json({
					status:true,
					data:results,
					message:'user registered sucessfully'
				})
			}
		});
		}         
	// }
    });
});

// app.post('/signup',(req, res) => {
  // let data = {email: req.body.email, password: req.body.password};
   // let sql = "INSERT INTO users SET ?";
   // console.log(sql);
   // let query = dbConn.query(sql, data,(err, results) => {
     // if(err) throw err;
     // res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
   // });
 // });

// Registration
 // app.post('/signup',function(req,res){  
    // var users={        
       // "email":req.body.email,
       // "password":req.body.password
		
   // }
     // dbConn.query('INSERT INTO users(email, password) Values ("'+req.body.email+'", "'+req.body.password+'")', function (error, results) {
       // // if (error) {
         // // res.json({
             // // status:false,
             // // message:'there are some error with query'
        // // })
       // // }else{
           // res.json({
             // status:true,
             // data:results,
             // message:'user registered sucessfully'
			// })
		// // }
	// }); 
// })
 module.exports = app;