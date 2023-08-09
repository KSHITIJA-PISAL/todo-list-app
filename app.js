const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
var _ = require('lodash');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://kshitijapisal41:Nimbus2000@cluster0.wzj2gal.mongodb.net/todolistDB"); 

const itemsSchema = {
  name: String
}

const Item = mongoose.model(
  "Item", itemsSchema
);

const item1 = new Item({
  name: "Do homework"
});

const item2 = new Item({
  name: "Play"
});

const item3 = new Item({
  name: "Eat dinner"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  

   Item.find({}).then (function(foundItems){
     if(foundItems.length ===0 ){
      Item.insertMany(defaultItems);
      res.redirect("/");
     } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
     }
 })
 .catch(function(err){
  console.log(err);
})
});  

app.post("/", function(req, res){

  const itemName =  req.body.newItem;
  const listName= req.body.list;

  const item= new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }  
});

app.get("/:customListName", function(req, res){
  const customListName =_.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    
      if(foundList){
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }else{
        //Create a new list
        const list = new List({
          name:customListName,
          items: defaultItems
        });
        list.save(); 
        res.redirect("/"+ customListName);
      } 
  });
});


app.get("/about", function(req, res){
  res.render("about");  
});

app.post("/delete", function(req,res){
 const checkedItemId= req.body.checkbox;
 const listName = req.body.listName;

 if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId).then(function (Item) {
    console.log("Successfully deleted checked item: ",Item)
})
.catch(function(err){
 console.log(err)
});
res.redirect("/");
  }else{
  List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}).then(function(foundList){
    res.redirect("/" + listName);
  })
  .catch(function(err){
    console.log(err);
  })     
 }
 
 });

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
