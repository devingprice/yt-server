module.exports = function seed(models) {
    let dumbyUser = {
        first: 'Dumb',
        last: 'Dumby',
        email: 'dumbyTest@email.com',
        password: 's3cureP@ss',
        phone: '1234567890',
    };

    let collection = {
        name: 'Pew and Top',
    };

    let channels = [
        { name: 'PewDiePie', ytId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw' },
        { name: 'TopMovieClips', ytId: 'UClVbhSLxwws-KSsPKz135bw' },
    ];

    return models.Collection.create(
        {
            ...collection,
            owner: dumbyUser,
            Channels: channels,
        },
        {
            include: [{ model: models.User, as: 'owner' }, models.Channel],
        }
    )
        .then(() =>
            models.UserCollection.create({ CollectionId: 1, UserId: 1 })
        ) // may remove if db issue figured out
        .then(() =>
            models.User.create({
                email: 'dumber@email.com',
                password: 'sup3r$ecret',
            })
        )
        .catch((e) => console.log(e));
};
