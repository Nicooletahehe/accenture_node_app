// // // create DB Movies
// // // table Genres
// // // name => required, min: 2, max: 50, lowercase, 
// // // subgenre =? array, min: 1, it will not duplicate record
// // // get records

// const mongooseDB = require('mongoose');

// //old js way to handle the promise
// mongooseDB
// .connect("mongodb://localhost:27017/movies", {
//     // properties
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => {
//     console.log("Movies DB connected");
// })
// .catch((err) => {
//     console.log("Movies DB not connected", err);
// });

// const schemaGenres = new mongooseDB.Schema({
//     name: {
//         type: String,
//         required: true,
//         minLength: 2, 
//         maxLength: 50, 
//         lowercase: true
//     },
//     subGenre: {
//         type: [String],
//         required: true,
//         validate: {
//             validator: function(v) {
//                 return Array.isArray(v) && v.length > 0
//             },
//             message: "At least one subgenre."
//         }
//     },
// });

// function arrayLimit(val) {
//     return val.length >= 0;
//   }

// const Genres = mongooseDB.model("Genres", schemaGenres);

// // async function CreateGenre() {
// //     try {
// //         // created instance
// //         const genre = new Genres({
// //             name: "Node.JS training",
// //             subGenre: "action"
// //         })

// //         await genre.validate();

// //         // async
// //         const result = await genre.save();
// //         console.log(result);

// //     } catch (error) {
// //         console.log(error);
// //     }
// // }

// // CreateGenre();

// /*****************************get*******************************/

// // async function GetMovies() {
// //     const movies = await Genres
// //     .find({ 
// //         // name: "Node.JS training"
// //         subGenre: /.*rom.*/
// //     })
// //     .sort({subGenre: 1});
// //     console.log(movies);
// // }

// // GetMovies();

// /*****************************update*******************************/

// // async function updateMovies(id) {
// //     const movie = await Genres.findById(id);
// //     if(movie) {
// //         movie.set({
// //             subGenre: 'action'
// //         })
// //         const result = await movie.save();
// //         console.log(result);
// //     } else {
// //         console.log("The movie doesn't exist");
// //     }
// // }

// // updateMovies('60d0bd4332c26e047065c7ac');

// /*****************************delete one*******************************/

// // async function deleteMovie(id) {
// //     const movie = await Genres.deleteOne({_id: id});
// // }

// // deleteMovie('60d0bd4332c26e047065c7ac');

// /*****************************delete many*******************************/

// // async function deleteMoviesWithoutSubGenre(){
// //     const movies = await Genres.deleteMany({
// //         subGenre: { $size: 0 }
// //     })
// // }

// // deleteMoviesWithoutSubGenre();

/*****************************from class*******************************/

const mongoose = require('mongoose');
const wait = (time) => new Promise(resolve => setTimeout(() => resolve, time));

mongoose.connect("mongodb://localhost:27017/playground", {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    console.log('mongodb connected');
})
.catch((err) => {
    console.error("could not connect to Mongodb", err);
})

// String, Number, Date, Bu8ffer, boolean, ObjectId, Array
const courseSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        minLength: 3, 
        maxLength: 100, 
        // matching: /pattern/
    },
    author: {
        type: String,
        validate: {
            validator: function(data){

            },
            message: "at least 3 cha"
        }
    },
    tags: {
        type: Array, 
        validate: {
            // validator: async function(data, callback) {
            validator: async function(data) {
                return await wait(3000);

                // setTimeout(() => {
                //     // api call
                //     const result = data && data.length > 0;
                //     callback(result);
                // }, 4000);
            },
            message: "at least one tag is required",
        }
    },
    date: { type: Date, default: Date.now },
    isPublished: Boolean,
    category: {
        type: String, 
        enum: ['tech', 'fiction', 'scifi'], 
        // uppercase: true, 
        lowercase: true},
    price: { 
        type: Number, 
        required: function() {
            return this.isPublished;
        },
        get: v => Math.abs(v),
        set: v => Math.abs(v),
    }
});

// model -> object
// created class
const Course = mongoose.model("Course", courseSchema);

async function CreateCourse() {
    try {
        // created instance
        const course = new Course({
            name: "Node.JS training",
            author: "Nicoleta",
            tags: ["node", "backend"],
            isPublished: true,
            category: "tech",
            price: 100
        })

        await course.validate();

        // async
        const result = await course.save();
        console.log(result);

    } catch (error) {
        console.log(error);
    }
}

// CreateCourse();

// options to find the data
// async function GetCourses() {
//     // const courses = await Course
//     // .find({
//     //     author: "Nicoleta",
//     //     category: 'Tech'
//     // }).skip(1).limit(1).sort({name: 1}).select({name: 1, author: 1});
//     // console.log(courses);

//     // eq, ne, gt, lt, gte, lte, in(for array), nin (not in)
//     // const courses = await Course
//     // .find({
//     //     // price: {$gt: 100}
//     //     price: {$in: [100, 120, 150]}
//     // }).limit(1).sort({name: 1}).select({name: 1, author: 1});
//     // console.log(courses);

//     // or, and, nor, not
//     // const courses = await Course
//     // .find({
//     //     price: {$in: [100, 120, 150]}
//     // })
//     // .or([
//     //     {author: 'Nicoleta'},
//     //     // {category: "Tech"}
//     //     {price: {$eq: 150}}
//     // ])
//     // .and([
//     //     {author: 'Nicoleta'},
//     //     // {category: "Tech"}
//     //     {price: {$eq: 150}}
//     // ])
//     // regex: ^-start, $-end, .*Nic.* - contains, i-ignore the capital letters
//     // 
//     // .find({author: /^Nic/})
//     // .sort({name: 1}).select({name: 1, author: 1});
//     // console.log(courses);

//     const pageNumber = 1;
//     const pageSize = 10;

//     const courses = await Course
//     .find({

//     }).skip((pageNumber - 1)*pageSize)
//     .limit(pageSize)
//     .sort({name: 1}).select({name: 1, author: 1});
//     console.log(courses);
// }


// async function updateCourse(id) {
//     // query, findByID, modify record, save it
//     // const course = await Course.findById(id);
//     // if(!course) {
//     //     return
//     // } else {
//     //     // course.isPublished = true;
//     //     course.set({
//     //         isPublished: true,
//     //     })
        
//     //     const result = await course.save();
//     //     console.log(result);
//     // }

//     // deprecated
//     // const result = await Course.update(
//     //     { _id: id}, 
//     //     { $set: {isPublished: false}}
//     // );

//     const result = await Course.updateOne(
//         { _id: id}, 
//         { $set: {isPublished: true}}
//     );
// }

// async function deleteCourse(id) {
//     const result = await Course.deleteOne(
//         { _id: id}
//     );
// }

// updateCourse('60cc7d78ebfdcb374063afc5');
// deleteCourse('60cc7cfc223ec00604cfcbbc');

// GetCourses();
