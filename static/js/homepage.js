var challengesRef = db.collection('challenges');
var usersRef = db.collection('users');
var id = '-1';

challengesRef.onSnapshot(snapshot => {
    snapshot.forEach(doc => {
        var data = doc.data();
        if (data.status == 'Started') {
            if (id != doc.id) {
                id = doc.id;
                initChallenge();
            }
        }
    })
});

async function initChallenge() {
    challengeRef = db.collection('challenges').doc(id);

    var playerOne = '';
    var playerTwo = '';
    var time = 300;

    await challengeRef.get().then(function(doc) {
	    if (doc.exists) {
			var data = doc.data();

            playerOne = data.playerOne;
            playerTwo = data.playerTwo;

	        console.log("Document data:", doc.data());
	    } else {
	        console.log("No such document!");
	    }
	}).catch(function(error) {
	    console.log("Error getting document:", error);
	});

    challengeRef.onSnapshot(doc => {
        var data = doc.data();

        if (data.status == 'Finished') {
            // finishChallenge();
            getLeaderboard();
        } else {
            // Points.
            var points = data.points;
            var playerOnePoints = points[0];
            var playerTwoPoints = points[1];

            // Current question.
            var progress = data.progress;
            var playerOneProgress = progress[0];
            var playerTwoProgress = progress[1];

            // TODO: Render information
        }
    });
}

function getLeaderboard() {
    var usersRef = db.collection('users').orderBy("points", "desc");

    usersRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = doc.data()
            console.log(doc.id, ' => ', data);

            var name = data.name;
            var points = data.points;

            // TODO: Render information
        });
    });
}
