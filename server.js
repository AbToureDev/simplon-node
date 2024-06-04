const express = require('express');
const app = express();
const axios =  require('axios');
const port = 8000
const multer = require('multer');
const {extname} = require("node:path");
// const upload = multer({ dest: 'uploads/' })
// app.use(Express.static())
app.use(express.json());
require('dotenv').config();
var fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage, limits:{ fileSize: 1048576},
    fileFilter: (req, file, callback) => {
        const acceptableExtensions = ['.png', '.jpeg', '.png'];
        if (!(acceptableExtensions.includes(extname(file.originalname)))) {
            return callback(new Error('...'));
        }
        // added this
        const fileSize = parseInt(req.headers['content-length']);
        if (fileSize > 1048576) {
            return callback(new Error('...'));
        }
        callback(null, true);
    }
})
 async function getPosts() {
     return  axios.get('https://jsonplaceholder.typicode.com/posts')
         .then(function (response) {
             return response.data.splice(0, 10);
         }).catch(function (err) {
             throw new Error;
         })

 }

async function getUsers() {
     return  axios.get('https://jsonplaceholder.typicode.com/users')
         .then(function (response) {
             return response.data.splice(0, 10);
         }).catch(function (err) {
             throw new Error;
         })
 }
 async function getUsersPost() {
     return  axios.get(' https://jsonplaceholder.typicode.com/posts')
         .then(function (response) {
             return response.data;
         }).catch(function (err) {
             throw new Error;
         })
 }

app.get('/', (req, res) => {
     res.status(200).send('BIenvenue sur node')
})
app.get('/users', async (req, res) => {
    let users = await getUsers();
    res.status(200).json(users)
})

app.get('/users/:id/posts', async (req, res) => {
    const {id} = req.params;
    let users = await getUsersPost();
    const filterUser = users.filter(user => user.userId === parseInt(id));
    res.status(200).json(filterUser)
})

// //
// // app.get("/todos/:id", async (req, res) => {
// //     try {
// //         const {id} = req.params;
// //         // console.log(id);
// //         console.time('todos2')
// //
// //         let todos1 = await getTodosById(id);
// //         let todos2 = await getTodos();
// //         console.timeEnd('todos2')
// //
// //         // console.log('one', todos1);
// //         // console.log('all',todos2)
// //         console.time('todos')
// //         let [{data: todos}, {data: todo}] = await Promise.all([getTodos(), getTodosById(id)]);
// //         console.timeEnd('todos')
// //         // console.log(todos);
// //         // console.log(todo)
// //         res.status(200).json(todo);
// //
// //     }catch (e) {
// //         res.status(500).send(e.message);
// //     }
// //
// //
// // })
//
//
// app.post('/profile', upload.single('avatar'), function (req, res, next) {
//     console.log(req.file)
// })
//
app.post('/api/file', upload.array('file', 12), function (req, res, next) {
    // req.files is array of `photos` files
    // req.body will contain the text fields, if there were any
})

app.post('/posts', async (req, res) => {
    let posts = await getPosts();
    fs.readFile("./data.json", 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
        }
        let dataArray = JSON.parse(data);
        for (let i = 0; i < posts.length; i++){
            dataArray.push(posts[i])
        }
        fs.writeFile("./data.json", JSON.stringify(dataArray), (err)=>{
            if (err) {
                console.log(err.message);
            }
            res.status(400).send(JSON.stringify(posts));
            console.log("done");
        })
    })
    res.status(200).json(posts)
})

 app.get("/posts", (req, res) => {
    fs.readFile("./data.json", 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
            res.status(500).send(err);
            return;
        }
        try {
            const userData = JSON.parse(data);
            if (userData) {
                res.json(userData);
            } else {
                res.status(404).send(`user not found: ${err}`);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send("Une erreu est survevenue");
        }
    });
});

app.get("/posts/:postId", (req, res) => {
    const { postId } = req.params;
    fs.readFile("./data.json", 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
            res.status(500).send(err);
            return;
        }
        try {
            const dataPost = JSON.parse(data);
            const postData = dataPost.find(data => data.id === parseInt(postId));
            if (postData) {
                res.json(postData);
            } else {
                res.status(404).send(`user not found: ${err}`);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send("Une erreu est survevenue");
        }
    });
});

// app.post('/user', (req, res)=>{
//     const user = req.body;
//     fs.readFile("./user.json", 'utf-8', (err, data)=>{
//         if (err) {
//             console.log(err.message);
//         }
//         let userArray = JSON.parse(data);
//         userArray.push(user);
//         fs.writeFile("./user.json", JSON.stringify(userArray), (err)=>{
//             if (err) {
//                 console.log(err.message);
//             }
//             res.status(400).send(JSON.stringify(user));
//             console.log("done");
//         })
//     })
//
// })


app.listen(process.env.PORT || 3000, ()=>{
    console.log('listening on port 8000')
})