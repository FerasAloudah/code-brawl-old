var challengeRef = db.collection('challenges').doc(challenge_id);
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

function editProblem() {
    var url = window.location.origin + '/problem-editor'; // API url.
    var data = {
        'java': java.getValue(),
        'python': python.getValue(),
        'problem': problem,
    };

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
        })
        .catch(error => console.log(error))
}

function calculateScore(progress,remainingTime){
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
    return  Math.round(val + val * inBetween(remainingTime, min, max));
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
        .then(async(res) => {
            console.log(res);

            var statusCode = res.status_code;
            var consoleOutput = res.console_output;
            var statusMessage=res.status_message;
            switch (res.status_code) {
                case 201:
                    // Correct Answer
                    // TODO: Transition to the next problem.
                    await increaseProgress(remainingTime);
                    var score=calculateScore(await getProgress(1),remainingTime);
                    swal({
                        title: "Good job!",
                        text: "Your score is:"+score,
                        icon: "success",
                        button: "Go to the next question!",
                      }).then(() => {

                      });
                    break;
                case 400:
                    swal( "Oops" ,  " wrong answer!" ,  "error" ).then(()=>{
                        document.getElementById('resultsTab').style.display='';
                        document.getElementById('terminalBlock').style.display='';
                        $('#resultsLink').trigger('click');
                        for(var i=0;i<consoleOutput.length;i++){
                            document.getElementById('errors').innerHTML+=consoleOutput[i]+'<br>';
                        }
                    })
                    break;
                default:
                    // Error
                    // Show error in red?
                    swal ( "Oops" ,  "Something went wrong!" ,  "error" )

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
            var status = playerNumber == 1 ? data.playerOneStatus : data.playerTwoStatus;

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
        'challenge_id': challenge_id,
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

function changeLanguage(choice) {
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
        editor.setValue(java_code[progress], 1);
    } else {
        editor.setValue(python_code[progress], 1);
    }
}

function changeWindow() {
    // Change to error page later?
    window.location.replace(window.location.origin);
}
