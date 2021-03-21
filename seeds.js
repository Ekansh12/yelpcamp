const mongoose=require("mongoose");
const campground=require("./model/campground.js");
const user=require("./model/user.js");
const review=require("./model/review.js");
const { firstName,lastName }=require("./data/names.js");
const cities=require("./data/cities.js");

const imgs=["https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
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


const campSeed=[];
const Seeding = async ()=>{
    await review.deleteMany({});
    await user.deleteMany({});
    await campground.deleteMany({});

    const obj1= new user({
        email: "spiderman@avenger.com",
        username: "spiderman",
        name: "Peter Parker"
    })
    const user1= await user.register(obj1,"spiderman");
    

    const obj2= new user({
        email: "deadpool@xmen.com",
        username: "deadpool",
        name: "Wade"
    })
    const user2= await user.register(obj2,"deadpool");

    for(let i=0;i<imgs.length;i++){
        const first=Math.floor(Math.random()*firstName.length);
        const last=Math.floor(Math.random()*lastName.length);
        const num=Math.floor(Math.random()*cities.length);
        const price=Math.floor(Math.random()*10000 + 3000 + Math.random()*2000);
        const obj={
            name: `${firstName[first]} ${lastName[last]}`,
            price: price,
            location: `${cities[num].city}, ${cities[num].state}`,
            image: imgs[i],
            description: "Explore our campground and if you already visited then rate our campground",
            owner: user1._id,
            ratingSum: 0,
            avgRating: 0,
            totalReviews: 0
        }
        campSeed.push(obj);
    }

    await campground.insertMany(campSeed);
}

Seeding();
