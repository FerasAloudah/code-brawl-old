var challengeRef = db.collection('challenges').doc(match_id);
var playerOne = "";
var playerTwo = "";

firebase.auth().onAuthStateChanged(function(user) {
    checkPlayer();
});

function getPlayer() {
    if (firebase.auth().currentUser == null) {
        return null;
    }

    return firebase.auth().currentUser.uid;
}

async function checkPlayer() {
    challengeRef.get().then(function(doc) {
        if (doc.exists) {
            var data = doc.data();
            var player = getPlayer();
            var playerOne = data.playerOne;
            var playerTwo = data.playerTwo;

            var result = player == playerOne || player == playerTwo;

            if (result) {
                document.getElementById('form').submit();
            } else {
                window.location.replace("http://localhost:5000");
            }

            console.log("Document data:", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}
