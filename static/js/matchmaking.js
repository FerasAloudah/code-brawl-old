var getName = document.getElementById("name");
var getNumber = document.getElementById("number");
var button = document.getElementById("Login");
var clicked = false;

getName.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        button.click();
    }
});

getNumber.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        button.click();
    }
});

function isInputNumber(event) {
    var char = String.fromCharCode(event.which);
    if (!(/[0-9]/.test(char))) {
        event.preventDefault();
    }
}

button.addEventListener("click", async () => {
    if (clicked) {
        return;
    }

    if (getName.value == "" || getNumber.value.length < 10) {
        swal("Sorry", "You have to enter your name, and phone number first!", "error");
        return;
    }

    $("#Login").addClass("running");
    // $("#button-title").text("Now Loading...");
    clicked = true;

    await findChallenge();
    await createUser();

    await swal({
        title: "You successfully joined the room!",
        text: " Waiting for your friend!",
        icon: "success",
        button: "Cancel",
        closeOnClickOutside: false,
        dangerMode: false
    }).then(() => {
        cancelChallenge();
        deleteUser();
    })

    $("#Login").removeClass("running");
    // $("#button-title").text("Let me in!");
    clicked = false;
})

var currentChallenge = null;
var currentUser = null;
var challengeListener = null;
var joining = false;

async function findChallenge() {
    await signOut();
    await signIn();
    var challenges = db.collection("challenges").where("status", "==", 'Waiting');
    var challengeFound = false;

    await challenges.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
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
        'playerOneTime': ["", "", ""],
        'questions': generateQuestions(),
        'status': 'Waiting'
    }

    var newChallengeRef = db.collection("challenges").doc();
    currentChallenge = newChallengeRef;

    try {
        await newChallengeRef.set(data);
    } catch (error) {
        console.log(error);
        return;
    }

    newChallengeRef.onSnapshot(async function (doc) {
        data = doc.data();
        if (data.status == 'Started') {
            // await createUser();

            joining = true;

            console.log(data.playerTwo + ' Joined!');

            // Change page.
            var url = Flask.url_for("challenge", {
                challenge_id: doc.id
            });
            location.assign(location.origin + url);
        }
    });
}

async function joinChallenge(id) {
    var challengeRef = db.collection("challenges").doc(id);
    var name = document.getElementById("name").value;

    db.runTransaction(function (transaction) {
        return transaction.get(challengeRef).then(async function (doc) {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            var data = doc.data();

            console.log('You Joined ' + data.playerOne + '!');
            console.log("Document data:", data);

            var status = data.status;
            if (status == 'Waiting') {
                // await createUser();
                joining = true;

                transaction.update(challengeRef, {
                    'playerTwo': firebase.auth().currentUser.uid,
                    'playerTwoPoints': [0, 0, 0],
                    'playerTwoProgress': 0,
                    'playerTwoStatus': 'Playing',
                    'playerTwoTime': ["", "", ""],
                    'status': 'Started',
                    'startingTime': firebase.firestore.FieldValue.serverTimestamp(),
                });
                return doc.id;
            } else {
                return Promise.reject("Sorry! Challenge has already started.");
            }
        });
    }).then(function (id) {
        console.log("Challenge status has been changed to Started!");

        // Change page.
        var url = Flask.url_for("challenge", {
            challenge_id: id
        });
        location.assign(location.origin + url);
    }).catch(function (err) {
        console.error(err);
    });
}

function cancelChallenge() {
    if (joining) {
        return;
    }

    currentChallenge.delete().then(function () {
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}

async function createUser() {
    var name = document.getElementById("name").value;
    var number = document.getElementById("number").value;

    var data = {
        'name': name,
        'number': number,
        'points': 0,
        'time': 999
    }

    currentUser = db.collection("users").doc(firebase.auth().currentUser.uid);

    await currentUser.set(data)
        .then(function () {
            console.log("User's Document was successfully written!");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

function deleteUser() {
    if (joining) {
        return;
    }

    currentUser.delete().then(function () {
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
}

function generateQuestions() {
    var questions = []
    for (var i = 0; i < 3; i++) {
        var question = Math.floor(Math.random() * 10);
        questions.push(question + 10 * i);
    }
    return questions;
}
