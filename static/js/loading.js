var playerNumber = 0;
var progress = 0;
var problem = 0;
var cTimer = 0;
var eTimer = 0;

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
    challengeRef.get().then(async function(doc) {
        if (doc.exists) {
            var data = doc.data();

            var currentTime = new Date();
            var startingTime = data.startingTime;
            var remainingTime = 300 - (currentTime.getTime() - startingTime.toDate().getTime()) / 1000 + 5;

            var player = getPlayer();
            var playerOne = data.playerOne;
            var playerTwo = data.playerTwo;

            var result = (player == playerOne ? 1 : 0) + (player == playerTwo ? 2 : 0);

            if (result) {
                var playerStatus = result == 1 ? data.playerOneStatus : data.playerTwoStatus;

                if (remainingTime <= 0 || data.status == "Finished" || playerStatus == "Finished") {
                    // Change page.
                    var url = Flask.url_for("result", {
                        challenge_id: challenge_id
                    });
                    location.assign(location.origin + url);
                }


                playerNumber = result;
                progressListener();
                await setUpPlayers(data);
                await setUpTimer();
                startTimer();
                $(".se-pre-con").fadeOut("slow");
            } else {
                $(".se-pre-con").fadeOut("slow");
                // changeWindow();
            }
        } else {
            $(".se-pre-con").fadeOut("slow");
            // changeWindow();
        }
    }).catch(function(error) {
        console.log(error);
        // changeWindow();
    });
}

async function setUpPlayers(data) {
    var currentPlayer = await getPlayerInfo(playerNumber == 1 ? data.playerOne : data.playerTwo);
    var enemyPlayer = await getPlayerInfo(playerNumber == 1 ? data.playerTwo : data.playerOne);

    document.getElementById('currentPlayer').innerHTML = currentPlayer;
    document.getElementById('enemyPlayer').innerHTML = enemyPlayer;

    console.log(`Updated players: ${currentPlayer} vs ${enemyPlayer}`);
}

// 0 == player is on question one, 1 == player is on question two...
async function getProgress(playerNumber) {
    var playerProgress = 0;
    await challengeRef.get().then(doc => {
        var data = doc.data();
        playerProgress = playerNumber == 1 ? data.playerOneProgress : data.playerTwoProgress;
    }).catch(error => {
        console.log(error);
    });
    return playerProgress;
}

async function getPoints(playerNumber) {
    var playerPoints = [0, 0, 0];
    await challengeRef.get().then(doc => {
        var data = doc.data();
        playerPoints = playerNumber == 1 ? data.playerOnePoints : data.playerTwoPoints;
    }).catch(error => {
        console.log(error);
    });
    return playerPoints;
}

function progressListener() {
    challengeRef.onSnapshot(async(doc) => {
        var data = doc.data();

        var currentPlayer = data.playerOne;
        var currentPlayerPoints = data.playerOnePoints;
        var currentPlayerProgress = data.playerOneProgress;
        var currentPlayerStatus = data.playerOneStatus;
        var currentPlayerTime = data.playerOneTime;

        var enemyPlayer = data.playerTwo;
        var enemyPlayerPoints = data.playerTwoPoints;
        var enemyPlayerProgress = data.playerTwoProgress;
        var enemyPlayerStatus = data.playerTwoStatus;
        var enemyPlayerTime = data.playerTwoTime;

        if (playerNumber == 2) {
            currentPlayer = data.playerTwo;
            currentPlayerPoints = data.playerTwoPoints;
            currentPlayerProgress = data.playerTwoProgress;
            currentPlayerStatus = data.playerTwoStatus;
            currentPlayerTime = data.playerTwoTime;

            enemyPlayer = data.playerOne;
            enemyPlayerPoints = data.playerOnePoints;
            enemyPlayerProgress = data.playerOneProgress;
            enemyPlayerStatus = data.playerOneStatus;
            enemyPlayerTime = data.playerTwoTime;
        }

        await addPoints(currentPlayer, currentPlayerPoints, currentPlayerTime);

        // Status == 'Finished' when progress == 3.
        if (currentPlayerStatus == 'Finished') {
            // Finish the challenge.
            finished = true;
            console.log('Challenge has been finished!');

            if (enemyPlayerStatus == "Finished") {
                await finishChallenge();
            }

            // Change window.
            var url = Flask.url_for("result", {
                challenge_id: challenge_id
            });
            location.assign(location.origin + url);
        }

        for (var i = 0; i < 3; i++) {
            document.getElementById("cpQ" + (i + 1)).innerHTML = currentPlayerPoints[i];
            document.getElementById("epQ" + (i + 1)).innerHTML = enemyPlayerPoints[i];
        }

        progress = currentPlayerProgress; // This is used when reseting the starter code.

        switch (currentPlayerProgress) {
            case 1:
                changeProblem(1);
                break;
            case 2:
                changeProblem(2);
                break;
            case 3:
                // $('#descriptionText').innerHTML = descriptions[progress];
                // java.setValue(java_code[2]);
                // python.setValue(python_code[2]);
                // finished = true;
        }

        animateCircle(currentPlayerProgress, "cQuestion");
        animateCircle(enemyPlayerProgress, "eQuestion");

        problem = data.questions[currentPlayerProgress]; // This is used when submitting the answer.
    });
}

async function finishChallenge() {
    await db.runTransaction(function(transaction) {
        return transaction.get(challengeRef).then(function(doc) {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            var data = doc.data();
            var status = data.status;

            if (status != "Finished") {
                transaction.update(challengeRef, {
                    'status': "Finished"
                });

                return "Finished";
            } else {
                return Promise.reject("Sorry! Challenge has already been finished.");
            }
        });
    }).then(function(status) {
        console.log("Challenge status has been changed to ", status, "!");
    }).catch(function(err) {
        console.error(err);
    });
}

async function addPoints(playerId, playerPoints, currentPlayerTime) {
    var userRef = db.collection('users').doc(playerId);
    var points = playerPoints.reduce((a, b) => a + b, 0);
    var time = toSeconds(currentPlayerTime[2]);

    await userRef.update({
        'points': points,
        'time': time
    });
}

function toSeconds(elapsedTime) {
    if (elapsedTime) {
        var timeArray = elapsedTime.split(/[:]+/);
        return parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);
    } else {
        return 999;
    }
}

function changeProblem(progress) {
    $("#description").fadeOut("slow");
    $("#description").promise().done(function() {
        document.getElementById('descriptionText').innerHTML = descriptions[progress];
        java.setValue(java_code[progress]);
        python.setValue(python_code[progress]);
        $("#description").fadeIn("slow");
    });
}

function animateCircle(progress, problem) {
    var interval = 2000;

    switch (progress) {
        case 0:
            if (problem.startsWith("c")) {
                clearInterval(cTimer);
                cTimer = setInterval(runAnimation, interval, problem + "One");
            } else {
                clearInterval(eTimer);
                eTimer = setInterval(runAnimation, interval, problem + "One");
            }
            break;
        case 1:
            if (problem.startsWith("c")) {
                clearInterval(cTimer);
                cTimer = setInterval(runAnimation, interval, problem + "Two");
            } else {
                clearInterval(eTimer);
                eTimer = setInterval(runAnimation, interval, problem + "Two");
            }
            break;
        case 2:
            if (problem.startsWith("c")) {
                clearInterval(cTimer);
                cTimer = setInterval(runAnimation, interval, problem + "Three");
            } else {
                clearInterval(eTimer);
                eTimer = setInterval(runAnimation, interval, problem + "Three");
            }
            break;
        default:
            if (problem.startsWith("c")) {
                clearInterval(cTimer);
            } else {
                clearInterval(eTimer);
            }
    }
}

function runAnimation(problem) {
    $(`#${problem}`).fadeOut(750);
    $(`#${problem}`).fadeIn(750);
}

function getPlayerInfo(playerId) {
    var userRef = db.collection('users').doc(playerId);
    var playerName = userRef.get().then(doc => {
        return doc.data().name;
    }).catch(error => {
        console.log(error);
    });
    return playerName;
}

function changeWindow() {
    // Change to error page later?
    location.assign(location.origin);
}
