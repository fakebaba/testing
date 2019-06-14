const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const BUCKET_NAME = 'babastudio-api';
const IAM_USER_KEY = 'AKIAZBYXYI2RX24JV75F';
const IAM_USER_SECRET = '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';

function uploadToS3(file) {
console.log('gambar');
 let s3bucket = new AWS.S3({
   accessKeyId: IAM_USER_KEY,
   secretAccessKey: IAM_USER_SECRET,
   Bucket: BUCKET_NAME,
 });
 s3bucket.createBucket(function () {
   var params = {
    Bucket: BUCKET_NAME,
    Key: file.name,
    Body: file.data,
   };
   s3bucket.upload(params, function (err, data) {
    if (err) {
     console.log('error in callback');
     console.log(err);
    }
    console.log('success');
    console.log(data);
   });
 });
}

exports.getPosts = (req, res, next) => {
    if(req.params.token){
        Post.find()
            .then(posts => {
                res.status(200)
                .json({ massage: 'Berhasil Menampilkan Data', posts: posts });
            })
            .catch(err => {
                res.status(200)
                .json({ error: 'Gagal Menampilkan Data Dari Database' });
            });
    }else{
        res.status(200)
        .json({ error: 'Tidak Ada Token' });
    }
};

exports.CreatePost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(200).json({
            error:'Gagal Menyimpan Data'
        })
    }else{
        if(req.body.token != ""){
            if(req.files){
                var img = req.files.image;
                var path = './images/' + img.name;

                img.mv(path,function(err){
                    if(err){
                        console.log(err);
                    }else{
                        // uploadToS3(img);
                        const titlepost = req.body.title;
                        const contentpost = req.body.content;

                        const post = new Post({
                            title: titlepost, 
                            content: contentpost,
                            imageUrl: img.name,
                            creator: {
                                name: 'Babastudio'
                            }
                        });

                        post.save()
                        .then(result => {
                            res.status(201).json({
                                massage: 'Sukses Menyimpan Data',
                                post: result
                            });
                        })
                        .catch(err => {
                            if(!err.statusCode){
                                err.statusCode = 500;
                            }
                            next(err);
                        })
                    }
                })
            }else{
                console.log('Gagal Menyimpan Data Image');
            }
            req.prevPath;
        } else{
             res.status(200).json({
                error:'Tidak ada Token'
            })
        }
    }
          
};

exports.getDetail = (req, res, next) => {
    if(req.params.token){
        const postId = req.params.postId;
        Post.findById(postId)
        .then(post => {
            if(!post){
                res.status(200)
                .json({ error: 'Data tidak di temukan!'});
            }else{
                res.status(200)
                .json({ massage: 'Sukses menampilkan detail post', post:post});
            }
        })
        .catch(err => {
            res.status(200)
            .json({ error: 'Gagal mengeksekusi data detail post'});
        })
    }else{
        res.status(200)
        .json({ error: 'Tidak ada token'});
    }
    
}

exports.editPost = (req, res, nex) => {
    if(req.body.token != ""){
        const postId = req.params.postId;
        Post.findById(postId)
        .then(post => {
            if(!post){
                res.status(200)
                .json({ error: 'Data tidak di temukan!'});
            }else{
                if(req.files){
                    var img = req.files.image;
                    var path = './images/' + img.name;

                    img.mv(path,function(err){
                        if(err){
                            console.log(err);
                        }else{
                            clearImage(post.imageUrl);
                            post.title = req.body.title;
                            post.content = req.body.content;
                            post.imageUrl = img.name;
                            return post.save();
                        }
                    });
                }else{
                    post.title = req.body.title;
                    post.content = req.body.content;
                    return post.save();
                }
            }
        })
        .then(result => {
            res.status(200)
            .json({ massage: 'Success'});
        })
        .catch(err => {
            res.status(200)
            .json({ error: 'Gagal mengeksekusi edit data post'});
        })
    }else{
        res.status(200)
        .json({ error: 'Tidak ada Token'});
    }
}

exports.deletePost = (req,res,next) => {
    const id = req.params.postId;
    Post.findById(id)
        .then(post => {
            if(!post){
                res.status(200)
                .json({ error: 'Data tidak di temukan!'});
            }else{
                clearImage(post.imageUrl);
                return Post.findByIdAndRemove(id);
            }
        })
        .then(result => {
            res.status(200)
            .json({ massage: 'Data Sukses Terhapus' });
        })
        .catch(err => {
            res.status(200)
            .json({ error: 'Gagal menghapus Data Post' });
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '../images/', filePath);
    fs.unlink(filePath, err => console.log(err));
}