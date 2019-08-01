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
            var player = getPlayer();
            var playerOne = data.playerOne;
            var playerTwo = data.playerTwo;

            var result = (player == playerOne ? 1 : 0) + (player == playerTwo ? 2 : 0);

            if (result) {
                playerNumber = result;
                progressListener();
                await setUpPlayers(data);
                await setUpTimer();
                // Set up the rest of the page. (Progress, and points)

                // Start timer here.
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

async function setUpTimer() {
    var remainingTime = await getRemainingTime();
    if (remainingTime < 0) {
        // changeWindow();
    }

    document.getElementById('timer').innerHTML = parseInt(remainingTime / 60) + ":" + parseInt(remainingTime % 60);
    startTimer();
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
    challengeRef.onSnapshot(doc => {
        var data = doc.data();

        var currentPlayerPoints = data.playerOnePoints;
        var currentPlayerProgress = data.playerOneProgress;
        var currentPlayerStatus = data.playerOneStatus;

        var enemyPlayerPoints = data.playerTwoPoints;
        var enemyPlayerProgress = data.playerTwoProgress;
        var enemyPlayerStatus = data.playerTwoStatus;

        if (playerNumber == 2) {
            currentPlayerPoints = data.playerTwoPoints;
            currentPlayerProgress = data.playerTwoProgress;
            currentPlayerStatus = data.playerTwoStatus;

            enemyPlayerPoints = data.playerOnePoints;
            enemyPlayerProgress = data.playerOneProgress;
            enemyPlayerStatus = data.playerOneStatus;
        }

        // Status == 'Finished' when progress == 3.
        if (currentPlayerStatus == 'Finished' && enemyPlayerStatus == 'Finished') {
            // Finish the challenge.
            console.log('Challenge has been finished!');
            // Change window.
        }

        for (var i = 0; i < 3; i++) {
            document.getElementById("cpQ" + (i + 1)).innerHTML = currentPlayerPoints[i];
            document.getElementById("epQ" + (i + 1)).innerHTML = enemyPlayerPoints[i];
        }
        
        switch (currentPlayerProgress) {
            case 1:
                // Change question.
                document.getElementById("description").innerHTML = `<div>sadad</div>` + `<footer id="footer">
                                <button id="submit" type="button" class="btn btn-secondary" onclick="submit()">Submit</button>
                        </footer>`
                
                break;
            case 2:
                // Change question.
                document.getElementById("description").innerHTML = `<div>kjgkhgfkf</div>` + `<footer id="footer">
                      <button id="submit" type="button" class="btn btn-secondary" onclick="submit()">Submit</button>
              </footer>`
                break;
            case 3:
            $("#description").fadeOut("fast");
            document.getElementById("description").innerHTML = `<div>kjgkhgfkf</div>` + `<footer id="footer">
                      <button id="submit" type="button" class="btn btn-secondary" onclick="submit()">Submit</button>
              </footer>`
              $("#description").fadeIn("fast");
                finished = true;
        }

        animateCircle(currentPlayerProgress, "cQuestion");
        animateCircle(enemyPlayerProgress, "eQuestion");

        problem = data.questions[currentPlayerProgress]; // This is used when submitting the answer.

    });
}

function animateCircle(progress, problem) {
    if (problem.startsWith("c")) {
       var timer = cTimer;
    } else {
       var timer = eTimer;
    }
    switch (progress) {
        case 0:
            startAnimation(problem + "One");
            break;
        case 1:
            stopAnimation(timer);
            startAnimation(problem + "Two");
            break;
        case 2:
            stopAnimation(timer);
            startAnimation(problem + "Three");
            break;
        default:
            stopAnimation(timer);

    }
}

function stopAnimation(timer) {
    if (timer) {
        clearTimeout(timer);
        timer = 0;
    }
}

function startAnimation(problem) {
    var timer = 0;
    function run() {
        $(`#${problem}`).fadeOut("slow");
        $(`#${problem}`).fadeIn("slow");
    }

    if (problem.startsWith("c")) {
        cTimer = setTimeout(run, 1000, problem);
    } else {
        eTimer = setTimeout(run, 1000, problem);
    }
    
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
    window.location.replace(window.location.origin);
}
