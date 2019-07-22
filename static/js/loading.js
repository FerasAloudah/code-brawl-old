var challengeRef = db.collection('challenges').doc(match_id);
var playerOne = "";
var playerTwo = "";
var playerNumber = 0;

firebase.auth().onAuthStateChanged(function(user) {
    checkPlayer();
});

function getPlayer() {
    if (firebase.auth().currentUser == null) {
        return null;
    }

    return firebase.auth().currentUser.uid;
}

function checkPlayer() {
    challengeRef.get().then(doc => {
        if (doc.exists) {
            var data = doc.data();
            var player = getPlayer();
            var playerOne = data.playerOne;
            var playerTwo = data.playerTwo;

            var result = (player == playerOne ? 1 : 0) + (player == playerTwo ? 2 : 0);

            if (result) {
                playerNumber = result;
                setUpPage()
            } else {
                $(".se-pre-con").fadeOut("slow");
                // changeWindow();
            }
        } else {
            $(".se-pre-con").fadeOut("slow");
            // changeWindow();
        }
    }).catch(function(error) {
        changeWindow();
    });
}

async function setUpPage() {
    // Change the page's content.
    $(".se-pre-con").fadeOut("slow");
}

function changeWindow() {
    // Change to error page later?
    window.location.replace("http://localhost:5000");
}
