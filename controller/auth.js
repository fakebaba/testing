const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signupUser = (req,res,next) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({ email: email })
		.then(user => {
			if(user){
				res.status(200)
        		.json({ error: 'Email Sudah Ada Harap Menggunakan Email Yang Lainnya!!!'});
			}else{
				bcrypt.hash(password,12)
					.then(hashedPw => {
						const user = new User({
							name: name,
							email: email,
							password: hashedPw
						});
						return user.save();
					})
					.then(result => {
						res.status(200)
			        	.json({ massage: 'Register Success', UserId: result._id });
					})
					.catch(err => {
						res.status(200)
			        	.json({ error: 'Error bcrypt password'});
					});
			}
		})
		.catch(err => {
			res.status(200)
        	.json({ error: 'Register Error'});
		});
}

exports.loginUser = (req,res,next) => {
	const email = req.body.email;
	const password = req.body.password;
	let data;

	User.findOne({ email: email })
		.then(user => {
			if(!user){
				res.status(200)
                .json({ error: 'Data user tidak di temukan!'});
			}else{
				data = user;
				return bcrypt.compare(password, data.password);
			}
		})
		.then(isEqual => {
			if(!isEqual){
				res.status(200)
                .json({ error: 'Password Salah'});
			}else{
				//instal jsonwebtoken
				const token = jwt.sign(
					{
						email : data.email,
						userId : data._id.toString()
					},
					'somesupersecretsecret', //(32 character hex string)
					{ expiresIn: '1h' }
				);

				res.status(200)
        		.json({ token: token, UserId: data._id.toString() });
			}
		})
		.catch(err => {
			res.status(200)
        	.json({ error: 'Login Error'});
		});
}