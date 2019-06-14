const jwt = require('jsonwebtoken');


module.exports = (req,res,next) =>{

	if(req.get('token')){
		const token = req.get('token');

		res.status(200)
	    .json({ token: token });	
	}else{
		res.status(200)
	    .json({ error:'error' });
	}
	
};