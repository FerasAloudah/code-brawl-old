var button = document.getElementById("Login");

button.addEventListener("click", () => {
    findChallenge();
    swal({
        title: "You successfully joined the room!",
        text: " Waiting for your friend!",
        icon: "success",
        button: "Cancel",
    }).then(() => {
        cancelChallenge();
    })
})

var currentChallenge = null;
var challengeListener = null;

async function findChallenge() {
    await signOut();
    await signIn();
    var challenges = db.collection("challenges").where("status", "==", 'Waiting');
    var challengeFound = false;

    await challenges.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = doc.data()
            console.log(doc.id, ' => ', data);

            if (data.status == 'Waiting') {
                joinChallenge(doc.id);
                challengeFound = true;
            }
        });
    });

    if (!challengeFound) {
        createChallenge();
    }
}

async function createChallenge() {
    var data = {
        'playerOne': firebase.auth().currentUser.uid,
        'playerOnePoints': [0, 0, 0],
        'playerOneProgress': 0,
        'playerOneStatus': 'Playing',
        'questions': generateQuestions(),
        'status': 'Waiting'
    }

    var newChallengeRef = db.collection("challenges").doc();

    try {
        await newChallengeRef.set(data);
    } catch (error) {
        console.log(error);
        return;
    }

    newChallengeRef.onSnapshot(async function(doc) {
        data = doc.data();
        if (data.status == 'Started') {
            await createUser();
            console.log(data.playerTwo + ' Joined!');

            // Change page.
            var url = Flask.url_for("challenge", {
                match_id: doc.id
            });
            window.location.replace(window.location.origin + url);
        }
    });
}

async function joinChallenge(id) {
    var challengeRef = db.collection("challenges").doc(id);
    var name = document.getElementById("name").value;

    db.runTransaction(function(transaction) {
        return transaction.get(challengeRef).then(async function(doc) {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            var data = doc.data();

            console.log('You Joined ' + data.playerOne + '!');
            console.log("Document data:", data);

            var status = data.status;
            if (status == 'Waiting') {
                await createUser();

                transaction.update(challengeRef, {
                    'playerTwo': firebase.auth().currentUser.uid,
                    'playerTwoPoints': [0, 0, 0],
                    'playerTwoProgress': 0,
                    'playerTwoStatus': 'Playing',
                    'status': 'Started',
                    'startingTime': firebase.firestore.FieldValue.serverTimestamp(),
                });
                return doc.id;
            } else {
                return Promise.reject("Sorry! Challenge has already started.");
            }
        });
    }).then(function(id) {
        console.log("Challenge status has been changed to Started!");

        // Change page.
        var url = Flask.url_for("challenge", {
            match_id: id
        });
        window.location.replace(window.location.origin + url);
    }).catch(function(err) {
        console.error(err);
    });
}

function cancelChallenge() {
    currentChallenge.delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
}

async function createUser() {
    var name = document.getElementById("name").value;
    var data = {
        'name': name,
        // 'number': number,
        'points': 0,
    }

    var newUserRef = db.collection("users").doc(firebase.auth().currentUser.uid);

    await newUserRef.set(data)
        .then(function() {
            console.log("User's Document was successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
}

function generateQuestions() {
    var questions = []
    for (var i = 0; i < 3; i++) {
        var question = Math.floor(Math.random() * 15);
        questions.push(question + 15 * i);
    }
    return questions;
}
