var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require("body-parser"),
	fs = require('fs');

var commentModel,ObjectId;


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

(function connectToDatabase(){

	mongoose.connect("mongodb://localhost/commentsDatabase");

	var schema = mongoose.Schema;
	ObjectId = mongoose.Types.ObjectId;
	var commentSchema = new schema({
		name : {type:String,required:true},
		age : Number,
		email : {type:String,required:true},
		comment : {type:String,required:true}
	});

	commentModel = mongoose.model("comments",commentSchema);
})();

app.get("/",function(req,res){
	var divTag = "";
	fs.readFile(__dirname+"/index.html",'utf8',function(err,html){
		if(err)
			console.log("HTML Error : "+err);
		
		else{
			commentModel.find({},function(err,data){
				if(err)
					console.log("Error : "+err);
				else{
					data.forEach(function(doc){
						divTag += "<tr><td>"+doc.name+"</td><td>"+doc.age+"</td><td>"+doc.email+"</td><td>"+doc.comment+"</td><td><button type='submit' class='btn btn-warning btnEdit center-block' id='"+doc._id.toString()+"Edit'>Edit</button></td><td><button type='submit' class='btn btn-danger btnDelete center-block' id='"+doc._id.toString()+"Delete'>Delete</button></td></tr>";
					});
				}

				html = html.replace("{{Database}}",divTag);
				//res.writeHead(200, {"Content-Type": "text/html"});
				res.send(html);
			});			
		}
	});
});

app.post("/addComment",function(req,res){
	var newComment = new commentModel();
	newComment.name = req.body.name;
	newComment.age = req.body.age;
	newComment.email = req.body.email;
	newComment.comment = req.body.comment;
	newComment.save(function(err,doc){
		if(err)
			res.send(err);
		else
			res.send(doc);
	});
});

app.put("/updateComment",function(req,res){
	commentModel.findByIdAndUpdate(ObjectId(req.body.id),{$set:{name:req.body.name,age:req.body.age,email:req.body.email,comment:req.body.comment}},
		{new: true,runValidators: true},
		function(err,data){
		if(err)
			res.send(err);
		else
			res.send(data);
	});
});

app.delete("/deleteComment",function(req,res){
	commentModel.remove({_id:ObjectId(req.body.id)},function(err,data){
		if(err)
			res.send(err);
		else
			res.send(data);
	})
})

app.listen("8000",function(){console.log("Listening to port 8000...");});