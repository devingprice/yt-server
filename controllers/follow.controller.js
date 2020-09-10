const models = require('../models');
const Collection = models.Collection;
const { to, ReE, ReS } = require('../services/util.service');

const create = async function (req, res) {
    //#region get collections
    const parentId = req.params.parentId;
    const childId = req.params.childId;
    let err, parentColl, childColl;

    [err, parentColl] = await to(
        Collection.findOne({ where: { uniqueid: parentId } })
    );
    if (err) {
        return ReE(res, `err finding collection ${parentId}`);
    }

    [err, childColl] = await to(
        Collection.findOne({ where: { uniqueid: childId } })
    );
    if (err) {
        return ReE(res, `err finding collection ${childId}`);
    }
    //#endregion

    console.log(`Adding child ${childColl.id} to parent ${parentColl.id}`);

    childColl.addChild(parentColl);

    return ReS(res, {}, 201);
};

const remove = async function (req, res) {
    //#region get collections
    const parentId = req.params.parentId;
    const childId = req.params.childId;
    let err, parentColl, childColl;

    [err, parentColl] = await to(
        Collection.findOne({ where: { uniqueid: parentId } })
    );
    if (err) {
        return ReE(res, `err finding collection ${parentId}`);
    }

    [err, childColl] = await to(
        Collection.findOne({ where: { uniqueid: childId } })
    );
    if (err) {
        return ReE(res, `err finding collection ${childId}`);
    }
    //#endregion

    childColl.removeChild(parentColl);

    return ReS(res, {}, 201);
};

module.exports = { create, remove };
