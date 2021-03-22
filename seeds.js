const mongoose=require("mongoose");
const campground=require("./model/campground.js");
const user=require("./model/user.js");
const review=require("./model/review.js");
const { firstName,lastName }=require("./data/names.js");
const cities=require("./data/cities.js");
const { userData, userPassword}=require("./data/users.js");

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Mongoose Error..."));
db.once("open", () => {
    console.log("Mongoose Connected...");
});

const imgs=[
    "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1487730116645-74489c95b41b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1515444744559-7be63e1600de?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1475483768296-6163e08872a1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1464547323744-4edd0cd0c746?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1559521783-1d1599583485?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1444124818704-4d89a495bbae?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1504632348771-974e356b80af?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1050&q=80"
];


const Seeding = async ()=>{
    await review.deleteMany({});
    await user.deleteMany({});
    await campground.deleteMany({});

    const userSeed=[];
    for(let i=0;i<userData.length;i++){
        const userObj= new user(userData[i]);
        const fakeUser= await user.register(userObj,userPassword[i]);
        userSeed.push(fakeUser);
    }
    
    const campSeed=[];
    for(let i=0;i<imgs.length;i++){

        const revArray=[];
        const revNum= Math.floor(Math.random()*userData.length);
        const campOwner= Math.floor(Math.random()*userData.length);
        let sum=0;

        for(let j=1;j<=revNum;j++){
            const revRating= Math.floor(Math.random()*5 +1);
            const revOwner= (campOwner+j)%userData.length;
            sum+=revRating;

            const revObj=new review({
                rating: revRating,
                text: "I visited your campground and here is the review",
                owner: userSeed[revOwner]._id
            })

            const savedReview= await revObj.save();
            revArray.push(savedReview._id);
        }

        const first= Math.floor(Math.random()*firstName.length);
        const last= Math.floor(Math.random()*lastName.length);
        const num= Math.floor(Math.random()*cities.length);
        const price= Math.floor(Math.random()*10000 + 3000 + Math.random()*2000);
        const avgRate= revNum>0 ? Math.round(sum/revNum) :0 ;

        const campObj={
            name: `${firstName[first]} ${lastName[last]}`,
            price: price,
            location: `${cities[num].city}, ${cities[num].state}`,
            image: imgs[i],
            description: "Explore our campground and if you already visited then rate our campground",
            reviewsArray: revArray,
            owner: userSeed[campOwner]._id,
            ratingSum: sum,
            totalReviews: revNum,
            avgRating: avgRate
        }

        campSeed.push(campObj);
    }

    await campground.insertMany(campSeed);
}

console.log("seeding...")
Seeding().then(() => {
    db.close();
})
console.log("completed");
