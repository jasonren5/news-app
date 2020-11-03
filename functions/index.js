//default code, needed to interface with firebase cloud functions
const functions = require('firebase-functions');

//needed to interface with firebase firestore
const admin = require('firebase-admin');
admin.initializeApp();

// Returns user data based on input UID that corresponds to a document ID (and auth ID)
exports.getUserById = functions.https.onRequest((req, res) => {
    // Grab the id parameter.
    const id = req.query.id;
    const db = admin.firestore();

    functions.logger.info("Getting user with id: '" + id + "'", { structuredData: true });

    // Get document from users collection with id == id
    db.collection("users").doc(id).get().then(doc => {
        if (doc.exists) {
            res.send(doc.data());
            return;
        } else {
            res.sendStatus(500);
            return;
        }
    }).catch(err => {
        functions.logger.info(err, { structuredData: true });
        res.sendStatus(500);
    });
});

// Returns user data based on input username that corresponds to a username stored in a document in the users collection
//  Note: this assumes that the 'users' collection exists, and that documents within that collection have a 'username' field.
exports.getUserByUsername = functions.https.onRequest((req, res) => {
    // Grab the username parameter.
    const username = req.query.username;
    const db = admin.firestore();

    functions.logger.info("Getting user with name: '" + username + "'", { structuredData: true });

    //get snapshot of users collection of all documents with field username == username
    db.collection("users").where("username", "==", username).get().then(querySnapshot => {
        //this is a little bad, but as long as usernames are unique this shouldn't be an issue... crosses fingers
        querySnapshot.forEach(doc => {
            res.send(doc.data());
        });
        return;
    }).catch(err => {
        functions.logger.info(err, { structuredData: true });
        res.sendStatus(500);
    });
});

// On auth creation, adds a document to the users collection with the same ID as the auth ID.
// Defaults username to the auth email and sets number of contributions to 0.
exports.createUserOnAuthCreation = functions.auth.user().onCreate((user) => {
    const db = admin.firestore();
    const uid = user.uid;
    functions.logger.info("Adding user to firestore with uid: '" + uid + "'", { structuredData: true });

    db.collection("users").doc(uid).set({
        username: user.email,
        number_of_contributions: 0
    });
});

// Get a full article by id
exports.getFullArticleByID = functions.https.onCall((data, context) => {
    const db = admin.firestore();
    let article_id = data.article_id;

    var promises = [];
    promises.push(db.collection("articles").doc(article_id).get());
    promises.push(db.collection("articles").doc(article_id).collection("sections").get());
    return Promise.all(promises).then(async (values) => {
        var articleData = values[0].data();
        articleData["article_id"] = values[0].id;

        let sectionData = values[1];

        let sections = await Promise.all(sectionData.docs.map(async (doc) => {
            const versions = await db.collection("articles").doc(article_id).collection("sections").doc(doc.id).collection("versions").orderBy('order', 'desc').get();
            var section = doc.data();
            let latestVersion = versions.docs[0];
            let latestVersionData = versions.docs[0].data();

            section["section_id"] = doc.id;
            section["current_version"] = latestVersion.id;
            section["body"] = latestVersionData.body;

            return section;
        }))

        let data = {
            article_data: articleData,
            section_data: sections
        }

        return data;
    }).catch(err => {
        return err;
    });
});


/*
*   Gets information for an article section from the client, and adds that information to the sections collection.
*   Params: article_id = id of article section is attached to, type = 0 for text, 1 for image,
*       body = either text (if type == 0) or image URL (if type == 1)
*/
exports.createSection = functions.https.onRequest((req, res) => {
    const db = admin.firestore();

    const article_id = req.article_id;
    const type = parseInt(req.type);
    const body = req.body;

    if (isNaN(type)) {
        //send bad request
        res.sendStatus(400);
        return;
    }

    //lack of edits implementation is fine for MVP
    const sectionToAdd = {
        article_id: article_id,
        type: type,
        body: body,
        edits: null
    };

    db.collection("sections").add(sectionToAdd)
        .then(docRef => {
            functions.logger.info("Seciton document written with ID: " + docRef.id, { structuredData: true });
            res.send(200);
            return;
        })
        .catch(error => {
            functions.logger.info("Error adding section with ID: " + docRef.id, { structuredData: true });
            res.send(200);
            return;
        });

});


/*
* Get the all of the articles in the collection. Just get the ID, title, and image URL
*/
exports.getAllArticles = functions.https.onCall((data, context) => {
    const db = admin.firestore();
    const articlesPromise = db.collection("articles").get();

    return articlesPromise.then(snapshot => {
        let resData = { "article_list": [] };
        snapshot.forEach(doc => {
            resData["article_list"].push({
                "id": doc.id,
                "title": doc.data().title,
                "image_url": doc.data().image_url
            });
        });

        return resData;
    }).catch(error => {
        console.log(error);
        return error;
    });
});

/*
* Get all the articles, as well as a short summary. Summary is pulled from the first section, and the latest version. This is pacckaged with id, title, and imageURL
*/
exports.getAllArticlesWithSummaries = functions.https.onCall((data, context) => {
    const db = admin.firestore();
    const articlesPromise = db.collection("articles").get();

    return articlesPromise.then(async (snapshot) => {
        let resData = { "article_list": [] };
        await Promise.all(snapshot.docs.map(async (article) => {

            // Default the snippet to having no summary data
            var snippet = "There is nothing written for this article yet. Be the first to contribute by editing!";

            // See if there is section data 
            const sectionQuery = await db.collection("articles").doc(article.id).collection("sections").where("type", "==", "text").orderBy("order", "asc").limit(1).get();
            var section = sectionQuery.docs[0];

            // If there is section data 
            if (section !== undefined) {
                // Get the most recent version, and retrieve body and save to snippet
                const versionQuery = await db.collection("articles").doc(article.id).collection("sections").doc(section.id).collection("versions").orderBy("order", "desc").limit(1).get();
                var latestVersion = versionQuery.docs[0];
                snippet = latestVersion.data().body;

                // If the snippet is over 30 characters, truncate it
                if (snippet.length > 250) {
                    snippet = snippet.substring(0, 249) + "...";
                }
            }
            // Push the article information to the array
            resData["article_list"].push({
                "id": article.id,
                "title": article.data().title,
                "image_url": article.data().image_url,
                "summary": snippet
            });
        }));
        // Send the array of articles
        return resData;
    }).catch(error => {
        console.log(error);
        return error;
    });
});

/*
* Test GET request for the getAllArticles
*/

// exports.getArticleListGetRequest = functions.https.onRequest(async (req, res) => {
//     // Get db and articles
//     const db = admin.firestore();
//     const articlesPromise = db.collection("articles").get();

//     // Articles promise
//     articlesPromise.then(async (snapshot) => {
//         // Preset return array
//         let resData = { "article_list": [] };
//         // For each article
//         await Promise.all(snapshot.docs.map(async (article) => {
//             // Default the snippet to having no summary data
//             var snippet = "There is nothing written yet for this article. Be the first to contribute!";

//             // See if there is section data 
//             const sectionQuery = await db.collection("articles").doc(article.id).collection("sections").where("type", "==", "text").orderBy("order", "asc").limit(1).get();
//             var section = sectionQuery.docs[0];

//             // If there is section data 
//             if (section !== undefined) {
//                 // Get the most recent version, and retrieve body and save to snippet
//                 const versionQuery = await db.collection("articles").doc(article.id).collection("sections").doc(section.id).collection("versions").orderBy("order", "desc").limit(1).get();
//                 var latestVersion = versionQuery.docs[0];
//                 snippet = latestVersion.data().body;

//                 // If the snippet is over 30 characters, trunacte it
//                 if (snippet.length > 30) {
//                     snippet = snippet.substring(0, 29) + "...";
//                 }
//             }
//             // Push the article information to the array
//             resData["article_list"].push({
//                 "id": article.id,
//                 "title": article.data().title,
//                 "image_url": article.data().image_url,
//                 "summary": snippet
//             });
//         }));
//         // send the array of articles
//         res.send(resData);
//     }).catch(error => {
//         console.log(error);
//         res.send(error);
//     });
// });