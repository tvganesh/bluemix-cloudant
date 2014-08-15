/**************************************************************************************************
 * 
 * IBM Bluemix app with Cloudant service using Node.js
 * Developed by : Tinniam V Ganesh                                               
 * Date:15 Aug 2014
 * 
 */

// Obtain the pouchdb interface from VCAP_SERVICES
var pouchdb = require('pouchdb');
var http = require('http');
if (process.env.VCAP_SERVICES) {
	  // Running on Bluemix. Parse the process.env for the port and host that we've been assigned.
	  var env = JSON.parse(process.env.VCAP_SERVICES);
	  var host = process.env.VCAP_APP_HOST; 
	  var port = process.env.VCAP_APP_PORT;
	  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    
	  // Also parse out Cloudant settings.
	  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
}

//Insert records into the books DB
 var insert_records = function(req, res) {
	//Parse the process.env for the port and host that we've been assigned
	if (process.env.VCAP_SERVICES) {
		  // Running on Bluemix. Parse the port and host that we've been assigned.
		  var env = JSON.parse(process.env.VCAP_SERVICES);
		  var host = process.env.VCAP_APP_HOST; 
		  var port = process.env.VCAP_APP_PORT;

		  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    
		  // Also parse Cloudant settings.
		  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
	}
	
	var db = new pouchdb('books'),
	 remote =cloudant.url + '/books';
	opts = {
	  continuous: true
	  };
     // Replicate the DB to remote
	console.log(remote);
	db.replicate.to(remote, opts);
	db.replicate.from(remote, opts);
	
	// Put 3 documents into the DB
	db.put({
		  author: 'John Grisham',
		  Title : 'The Firm'		  
		}, 'book1', function (err, response) {
		  console.log(err || response);
		});
	 db.put({
		  author: 'Authur C Clarke',
		  Title : '2001: A Space Odyssey'		  
		}, 'book2', function (err, response) {
		  console.log(err || response);
		});
	 db.put({
		  author: 'Dan Brown',
		  Title : 'Digital Fortress'		  
		}, 'book3', function (err, response) {
		  console.log(err || response);
		});
	 res.writeHead(200, {'Content-Type': 'text/plain'});
	 res.write("3 documents is inserted");
	 res.end();
}; // End insert_records


// Update records in the books DB
var update_records = function(req, res) {
	if (process.env.VCAP_SERVICES) {
		  // Running on Bluemix. Parse for the port and host 
		  var env = JSON.parse(process.env.VCAP_SERVICES);
		  var host = process.env.VCAP_APP_HOST; 
		  var port = process.env.VCAP_APP_PORT;

		  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    

		  // Also parse Cloudant settings.
		  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
	}
	
	var db = new pouchdb('books'),
	remote =cloudant.url + '/books';
	opts = {
	  continuous: true
	  };
     //Create a collection books
	console.log(remote);
	db.replicate.to(remote, opts);
	db.replicate.from(remote, opts);
	
	// Update book3
	db.get('book3', function(err, response) {
		console.log(response);
		return db.put({
		    _id: 'book3',
		    _rev: response._rev,
		    author: response.author,
			Title : 'The da Vinci Code',			  
		 });
		}, function(err, response) {
		  if (err) {
		    console.log("error " + err);
		  } else {
		    console.log("Success " + response);
		  }
	});
	res.writeHead(200, {'Content-Type': 'text/plain'});
 	res.write("Updated the book3 document. Changed the Title from Digital Fortress to The Da Vinci Code");
 	res.end();

}; //End update-records

//Delete a document from the books DB
var delete_record = function(req, res) {
	
	if (process.env.VCAP_SERVICES) {
		  // Running on Bluemix. Parse for the port and host that we've been assigned.
		  var env = JSON.parse(process.env.VCAP_SERVICES);
		  var host = process.env.VCAP_APP_HOST; 
		  var port = process.env.VCAP_APP_PORT;
		  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    
		  // Also parse out Cloudant settings.
		  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
	}
		
	var db = new pouchdb('books'),
	  remote =cloudant.url + '/books';
	  opts = {
	    continuous: true
	  };
     //Create a collection books
	db.replicate.to(remote, opts);
	db.replicate.from(remote, opts);
	
    //Deleting document book1
	db.get('book1', function(err, doc) {
		db.remove(doc, function(err, response) { 
			console.log(err || response);
		});
	});
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
 	res.write("Deleted book1");
 	res.end();
}; //End delete-records


//List Records from the books DB
var list_records = function(req, res) {
	
	if (process.env.VCAP_SERVICES) {
		  // Running on Bluemix. Parse out the port and host that we've been assigned.
		  var env = JSON.parse(process.env.VCAP_SERVICES);
		  var host = process.env.VCAP_APP_HOST; 
		  var port = process.env.VCAP_APP_PORT;
		  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    

		  // Also parse out Cloudant settings.
		  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
	}
		
	var db = new pouchdb('books'),
	  remote =cloudant.url + '/books';
	opts = {
	  continuous: true
	 };
		
   //Create a collection books
	console.log(remote);
	db.replicate.to(remote, opts);
	db.replicate.from(remote, opts);	

	var docs = db.allDocs(function(err, response) { 
		val = response.total_rows;		
		var details = "";
		j=0;
		for(i=0; i < val; i++) {
						
			
			db.get(response.rows[i].id, function (err,doc){
				 j++;	
			    details= details + JSON.stringify(doc.Title) + " by  " +  JSON.stringify(doc.author) + "\n";
			    // Kludge because of Node.js asynchronous handling. To be fixed - T V Ganesh
			    if(j == val) {
			    	
			    	res.writeHead(200, {'Content-Type': 'text/plain'});
			    	res.write(details);
			    	res.end();
			    	console.log(details);
			    }		    
			   
		   }); // End db.get
			
		} //End for	
	
     }); // End db.allDocs

   
  };


var port = (process.env.VCAP_APP_PORT || 1337);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

//Create a Webserver and wait for REST API CRUD calls
require('http').createServer(function(req, res) {	  
	//Set up the DB connection
	 if (process.env.VCAP_SERVICES) {
		  // Running on Bluemix. Parse for  the port and host that we've been assigned.
		  var env = JSON.parse(process.env.VCAP_SERVICES);
		  var host = process.env.VCAP_APP_HOST; 
		  var port = process.env.VCAP_APP_PORT;

		  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    

		  // Also parse out Cloudant settings.
		  var cloudant = env['cloudantNoSQLDB'][0]['credentials'];
	 }
	
	 var db = new pouchdb('books'),
  	    remote =cloudant.url + '/books';	  
	    opts = {
	      continuous: true
	    };	   
	    console.log(remote);
		db.replicate.to(remote, opts);
		db.replicate.from(remote, opts);			
		console.log("Reached3");
		
	 // Perform CRUD operations through REST APIs
		
	  // Insert document
	  if(req.method == 'POST') {
	             insert_records(req,res);           
	  }
	  // List documents
	  else if(req.method == 'GET') {   
	          list_records(req,res);	          
	   }
	   // Update a document
	   else if(req.method == 'PUT') {
	          update_records(req,res);
	    }
	    // Delete a document
	     else if(req.method == 'DELETE') {
	          delete_record(req,res);
	    }      
  
}).listen(port, host);
console.log("Connected to port =" + port + " host =  " + host);