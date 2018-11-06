const { Collection } = require('../models');
const { to, ReE, ReS } = require('../services/util.service');

const create = async function(req, res){
	let err, collection;
	let user = req.user;

	let collection_info = req.body;

	[err, collection] = await to(Collection.create(collection_info));
	if(err) return ReE(res, err, 422);

	collection.addUser(user, { through: { status: 'started' }});

	[err, collection] = await to(collection.save());
	if(err) return ReE(res, err, 422);

	let collection_json = collection.toWeb();
	collection_json.users = [{user:user.id}];

	return ReS(res, {company:collection_json}, 201);
};
module.exports.create = create;

//TODO: done down to here so far, saving work for the night with a commit, will squash tomorrow

const getAll = async function(req, res){
	let user = req.user;
	let err, companies;

	[err, companies] = await to(user.getCompanies({include: [ {association: Company.Users} ] }));

	let companies_json =[]
	for( let i in companies){
		let company = companies[i];
		let users =  company.Users;
		let company_info = company.toWeb();
		let users_info = [];
		for (let i in users){
			let user = users[i];
			// let user_info = user.toJSON();
			users_info.push({user:user.id});
		}
		company_info.users = users_info;
		companies_json.push(company_info);
	}

	console.log('c t', companies_json);
	return ReS(res, {companies:companies_json});
}
module.exports.getAll = getAll;

const get = function(req, res){
	let company = req.company;

	return ReS(res, {company:company.toWeb()});
}
module.exports.get = get;

const update = async function(req, res){
	let err, company, data;
	company = req.company;
	data = req.body;
	company.set(data);

	[err, company] = await to(company.save());
	if(err){
		return ReE(res, err);
	}
	return ReS(res, {company:company.toWeb()});
}
module.exports.update = update;

const remove = async function(req, res){
	let company, err;
	company = req.company;

	[err, company] = await to(company.destroy());
	if(err) return ReE(res, 'error occured trying to delete the company');

	return ReS(res, {message:'Deleted Company'}, 204);
}
module.exports.remove = remove;