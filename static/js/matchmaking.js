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
        'playerOnePoints': 0,
        'playerOneProgress': 0,
        'questions': generateQuestions(),
        'status': 'Waiting'
    }

    var newChallengeRef = db.collection("challenges").doc();

    newChallengeRef.set(data)
        .then(function() {
            console.log("Document successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });;

    currentChallenge = newChallengeRef;

    newChallengeRef.onSnapshot(async function(doc) {
        data = doc.data();
        if (data.status == 'Started') {
            await createUser();
            console.log(doc.data().playerTwo + ' Joined!');

            // Change page.
            var url = Flask.url_for("challenge", {match_id: doc.id}).substring(1);
            window.location.replace(window.location.href + url);
        }
    });
}

async function joinChallenge(id) {
    var challengeRef = db.collection("challenges").doc(id);
    var name = document.getElementById("name").value;

    await challengeRef.update({
        'playerTwo': firebase.auth().currentUser.uid,
        'playerTwoPoints': 0,
        'playerTwoProgress': 0,
        'status': 'Started',
        'startingTime': firebase.firestore.FieldValue.serverTimestamp(),
    });

    challengeRef.get().then(async function(doc) {
        if (doc.exists) {
            await createUser();
            console.log('You Joined ' + doc.data().playerOne + '!');
            console.log("Document data:", doc.data());

            // Change page.
            var url = Flask.url_for("challenge", {match_id: doc.id}).substring(1);
            window.location.replace(window.location.href + url);
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function cancelChallenge() {
    currentChallenge.delete().then(function() {
        console.log("Document successfully deleted!");
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
}

function createUser() {
    var name = document.getElementById("name").value;
    var data = {
        'name': name,
        'points': 0,
        'java': 0,
        'java-complete': 0,
        'python': 0,
        'python-completed': 0
    }

    var newUserRef = db.collection("users").doc(firebase.auth().currentUser.uid);

    newUserRef.set(data)
        .then(function() {
            console.log("Document successfully written!");
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });;
}

function generateQuestions() {
    var questions = []
    for (var i = 0; i < 3; i++) {
        var question = Math.floor(Math.random() * 15);
        questions.push(question + 15 * i);
    }
    return questions;
}

function test() {

}
