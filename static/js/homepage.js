var challengesRef = db.collection('challenges');
var usersRef = db.collection('users');
var id = '-1';
var prevList = [];

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

    await challengeRef.get().then(async function(doc) {
	    if (doc.exists) {
			var data = doc.data();

            setUpTimer();
            playerOne = await getName(data.playerOne);
            playerTwo = await getName(data.playerTwo);

            document.getElementById("p1Name").innerHTML = playerOne;
            document.getElementById("p1Points").innerHTML = 0;

            document.getElementById("p2Name").innerHTML = playerTwo;
            document.getElementById("p2Points").innerHTML = 0;

            anima();

	        console.log("Player one:", playerOne);
            console.log("Player two:", playerTwo);
	    } else {
	        console.log("No such document!");
	    }
	}).catch(function(error) {
	    console.log("Error getting document:", error);
	});

    challengeRef.onSnapshot(doc => {
        var data = doc.data();

        if (data.status == 'Finished') {
            returnanima();
            id = -1;
            // finishChallenge();
            // getLeaderboard();
        } else {
            // Points.
            var playerOnePoints = data.playerOnePoints.reduce((a, b) => a + b, 0);
            var playerTwoPoints = data.playerTwoPoints.reduce((a, b) => a + b, 0);

            document.getElementById("p1Points").innerHTML = playerOnePoints;
            document.getElementById("p2Points").innerHTML = playerTwoPoints;

            console.log(playerOnePoints);
            console.log(playerTwoPoints);

            // Current question.
            var playerOneProgress = data.playerOneProgress;
            var playerTwoProgress = data.playerTwoProgress;

            // TODO: Render information
        }
    });
}

async function getName(userID) {
    var name = "";
    await usersRef.doc(userID).get().then(doc => {
        var data = doc.data();
        name = data.name;
    }).catch(error => {
        console.log(error);
    });
    return name;
}

async function getLeaderboard() {
    var usersRef = db.collection('users').orderBy("points", "desc").limit(10);
    var currentList = [];

    await usersRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = doc.data()

            var name = data.name;
            var points = data.points;
            console.log(name, points);
            currentList.push([name, points]);
        });
    });

    if (currentList.join('') != prevList.join('')) {
        $("#orderlist").fadeOut("fast");
        $("#orderlist").promise().done(() => {
            document.getElementById("orderlist").innerHTML = "";

            currentList.forEach((element, idx) => {
                create(element[0], element[1]);
            });

            $("#orderlist").fadeIn("slow");
        })
    }

    prevList = currentList;
}

function getTime() {
    var startingTime = challengeRef.get().then(function(doc) {
        if (doc.exists) {
            return doc.data().startingTime;
            console.log("Document data:", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

    return startingTime;
}

async function getRemainingTime() {
    var currentTime = new Date();
    var startingTime = await getTime();
    return 300 - (currentTime.getTime() - startingTime.toDate().getTime()) / 1000 + 5;
}

async function setUpTimer() {
    var remainingTime = await getRemainingTime();
    if (remainingTime < 0) {
        // changeWindow();
    }

    document.getElementById('timer').innerHTML = parseInt(remainingTime / 60) + ":" + parseInt(remainingTime % 60);
    startTimer();
}

function startTimer() {
    var presentTime = document.getElementById('timer').innerHTML;
    var timeArray = presentTime.split(/[:]+/);
    var min = timeArray[0];
    var sec = checkSecond((timeArray[1] - 1));

    if (sec == 59) {
        --min;
    }

    if (min < 0) {
        document.getElementById('timer').innerHTML = "0:00";
    } else {
        document.getElementById('timer').innerHTML = min + ":" + sec;
        setTimeout(startTimer, 1000);
    }
}

function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
        sec = "0" + sec; // Add a zero in front of numbers that are < 10
    }

    if (sec < 0) {
        sec = "59";
    }

    return sec;
}
