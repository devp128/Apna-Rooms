const express=require("express");
const app=express();
const mongoose=require("mongoose");
const mongo= "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync =  require("./utils/wrapAsync.js");
const ExpressError =  require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch(err=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(mongo);
}

app.set("view engine", "ejs" );
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(8080,(req,res)=>{
    console.log("Listening");
})

app.get("/",(req,res)=>{
    res.redirect( "/listings");
})

const validateListing=(req,res,next)=>{
    let{error} = listingSchema.validate(req.body);
     if (error) {
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
     }else{
        next();
    }
}

//index route
app.get("/listing", wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))

//create route
app.get("/listings/new", wrapAsync(async(req,res)=>{
    res.render("new.ejs"); 
}))

app.post("/listings",validateListing,wrapAsync(async(req,res,next) =>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
        res.redirect("/listing");
})
);

//show route
app.get("/listings/:id" , wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("show.ejs",{listing});

}))

//review route

app.post("/listings/:id/reviews", async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        console.log("Review Saved");
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error("Error saving review:", error);
        // Handle the error, possibly render an error page
    }
});




//update
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const list= await Listing.findById(id);
    res.render("edit.ejs",{list});
}))


app.put("/listin/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listing");
}))

//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
}))

app.all("*",(req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"));
})

app.use((err, req, res, next)=>{
    let{statusCode=500,message="Something went wrong"}=err;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

// app.get("/testing", async(req,res)=>{
//     let samplelisting = new Listing({
//         title: "My new Vila",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("Successfull")
// });