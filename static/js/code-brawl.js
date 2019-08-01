var challengeRef = db.collection('challenges').doc(match_id);
var submitting = false;
var finished = false;

async function checkUser() {
    await challengeRef.get().then(function(doc) {
        if (doc.exists) {
            var data = doc.data();
            var player = getPlayer();

            return player == data.

            console.log("Document data:", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

async function submit() {
    var remainingTime = await getRemainingTime();

    // if (finished) {
    //     console.log("The challenge is over!");
    //     return;
    // }

    submitting = true;

    var url = window.location.origin + '/code-brawl'; // API url.
    var data = getData();

    var otherPram = {
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data),
        method: "POST"
    };

    fetch(url, otherPram)
        .then(data => {
            return data.json();
        })
        .then(res => {
            console.log(res);

            var statusCode = res.status_code;
            var consoleOutput = res.console_output;

            switch (res.status_code) {
                case 201:
                    // Correct Answer
                    // TODO: Transition to the next problem.
                    increaseProgress(remainingTime);
                    break;
                case 400:
                    // Wrong Answer
                    // Maybe show current in put / output?
                    break;
                default:
                    // Error
                    // Show error in red?
            }

            submitting = false;
        })
        .catch(error => console.log(error))

    // Show alert after code submission with submission details...
}

async function increaseProgress(remainingTime) {
    db.runTransaction(function(transaction) {
        return transaction.get(challengeRef).then(async function(doc) {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            var data = doc.data();

            var progress = playerNumber == 1 ? data.playerOneProgress : data.playerTwoProgress;
            var points = playerNumber == 1 ? data.playerOnePoints : data.playerTwoPoints;

            if (progress < 3) {
                var val = 50, min = 240, max = 270;

                switch (progress) {
                    case 1:
                        val = 100;
                        min = 150;
                        max = 210;
                        break;
                    case 2:
                        val = 150;
                        min = 0;
                        max = 120;
                        break;
                }

                points[progress] = Math.round(val + val * inBetween(remainingTime, min, max));

                var status = ++progress == 3 ? 'Finished' : 'Playing';

                if (playerNumber == 1) {
                    transaction.update(challengeRef, {
                        'playerOnePoints': points,
                        'playerOneProgress': progress,
                        'playerOneStatus': status
                    });
                } else {
                    transaction.update(challengeRef, {
                        'playerTwoPoints': points,
                        'playerTwoProgress': progress,
                        'playerTwoStatus': status
                    });
                }

                return progress;
            } else {
                return Promise.reject("Sorry! Player has already finished all of his questions.");
            }
        });
    }).then(function(progress) {
        console.log("Player's progress has been increased to ", progress, "!");
    }).catch(function(err) {
        console.error(err);
    });
}

function endPlayerSession() {
    db.runTransaction(function(transaction) {
        return transaction.get(challengeRef).then(async function(doc) {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            var data = doc.data();
            var status = playerNumber == 1 ? data.playerOneStatus : data.playerStatus;

            if (status != 'Finished') {
                if (playerNumber == 1) {
                    transaction.update(challengeRef, {
                        'playerOneStatus': 'Finished'
                    });
                } else {
                    transaction.update(challengeRef, {
                        'playerTwoStatus': 'Finished'
                    });
                }

                return 'Finished';
            } else {
                return Promise.reject("Sorry! Player status has already been set to Finished.");
            }
        });
    }).then(function(status) {
        console.log("Player's status has been changed to ", status, "!");
    }).catch(function(err) {
        console.error(err);
    });
}

function inBetween(val, min, max) {
    if (val > max) {
        return 1;
    } else if (val < min) {
        return 0;
    } else {
        return (val - min) / (max - min);
    }
}

function getData() {
    var player = getPlayer();

    var data = {
        'match_id': match_id,
        'player': player,
        'data': editor.getValue(),
        'problem': problem,
        'language': getLanguage()
    };

    return data;
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

function getPlayer() {
    if (firebase.auth().currentUser == null) {
        return null;
    }

    return firebase.auth().currentUser.uid;
}

function getLanguage() {
    return editor.session.getMode().$id.split('/')[2];
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
        if (submitting) {
            setTimeout(startTimer, 1000);
        } else {
            console.log('Challenge has been finished!');
            finished = true;
            endPlayerSession();
        }
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

function changeLanguage() {
    var choice = document.getElementById('langChoice').value.toLowerCase();
    var lang = getLanguage();

    if (lang == choice) {
        return;
    }

    if (choice == 'java') {
        editor.setSession(java);
    } else {
        editor.setSession(python);
    }
}

function restoreDefaultCode() {
    var lang = getLanguage();

    if (lang == 'java') {
        editor.setValue(java_code, 1);
    } else {
        editor.setValue(python_code, 1);
    }
}

$(document).on("click", "i", function(){
    restoreDefaultCode();
});

function changeWindow() {
    // Change to error page later?
    window.location.replace(window.location.origin);
}
