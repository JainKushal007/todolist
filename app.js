const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const loda=require("lodash");
const day=require(__dirname+"/date.js");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://KushalJain007:test123@atlascluster.1up8b3d.mongodb.net/todolistDB");
const itemsSchema=new mongoose.Schema({
    name:String
});
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Welcome to your todolist!"
});
const item2=new Item({
    name:"Hit the + button to add a new item."
});
const item3=new Item({
    name:"<-- Hit this to delete an item."
});
const defaultItems=[item1,item2,item3];
const listSchema=new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});
const List=mongoose.model("List",listSchema);

/**/
app.get("/",(req,res)=>{
    Item.find({}).then((foundItems)=>{
        if(foundItems.length===0)
        {
            Item.insertMany(defaultItems)
            .then(console.log)
            .catch(console.error);
            res.redirect('/');
        }
        else
        res.render('index',{kindOfDay:"Today",itemRcd:foundItems});
    });
});
app.get('/about',(req,res)=>{
    res.render('about');
});

app.post('/',(req,res)=>
{
    const itemName=req.body.item;
    const listName=req.body.btn;
    console.log(listName);
    const newItem=new Item({
        name:itemName
    });
    if(listName==="Today")
    {
        newItem.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:listName}).then((returnedList)=>{
            returnedList.items.push(newItem);
            returnedList.save();
            res.redirect('/'+listName);
        });
    }
});
app.get('/:topic',function(req,res){
    const customListName=loda.capitalize(req.params.topic);    
    List.findOne({name:customListName}).then((listName)=>{   
        if(listName===null&& customListName!='Favicon.ico')
        {
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect('/'+customListName);
        }
        else if(listName!=null)
        {
            res.render('index',{kindOfDay:customListName,itemRcd:listName.items});
        }
    })});
app.post('/delete',(req,res)=>{
    const checkedItem=req.body.checkbox;
    const listName=req.body.listName;
    console.log(checkedItem);
    console.log(listName);
    if(listName==="Today")
    {
        Item.findById(checkedItem)
        .then((requiredItem)=>{
            Item.deleteOne(requiredItem).then(console.log("Deleted item successfully")).catch(console.error);}
        )
        .catch(console.error);
        res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}}).then(console.log("Done.")).catch(console.error);
        res.redirect('/'+listName);
    }
});
app.listen(3000,()=>{console.log("Server started at port 3000")});