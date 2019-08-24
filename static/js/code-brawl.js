var challengeRef = db.collection('challenges').doc(challenge_id);
var submitting = false;
var finished = false;

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

function calculateScore(progress, remainingTime) {
    var val = 50,
        min = 240,
        max = 270;
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
    return Math.round(val + val * inBetween(remainingTime, min, max));
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
        .then(async (res) => {
            console.log(res);

            var statusCode = res.status_code;
            var consoleOutput = res.console_output;
            var statusMessage = res.status_message;
            var lastInput = res.last_input;
            var lastExpectedOutput = res.last_expected_output;
            var lastOutput = res.last_output;
            var stdout = res.stdout;

            switch (res.status_code) {
                case 201:
                    // Correct Answer
                    // TODO: Transition to the next problem.
                    await increaseProgress(remainingTime);
                    var score = calculateScore(await getProgress(1), remainingTime);
                    document.getElementById('resultsTab').style.display = 'none';
                    swal({
                        title: "Good job!",
                        text: "Your score is:" + score,
                        icon: "success",
                        button: "Go to the next question!",
                    }).then(() => {

                    });
                    break;
                case 400:
                    swal("Oops", "Wrong Answer!", "error").then(() => {
                        document.getElementById('resultsTab').style.display = '';
                        document.getElementById('terminalBlock').innerHTML = getWrongAnswer(statusMessage, lastInput, stdout, lastOutput, lastExpectedOutput);
                         $('.nav-tabs a[href="#results"]').tab('show');
                    })
                    break;
                default:
                    // Error
                    // Show error in red?
                    swal("Oops", "Something went wrong!", "error").then(() => {
                        document.getElementById('resultsTab').style.display = '';
                        document.getElementById('terminalBlock').innerHTML = getError(statusMessage, consoleOutput);
                         $('.nav-tabs a[href="#results"]').tab('show');
                    })

            }

            submitting = false;
        })
        .catch(error => console.log(error))

    // Show alert after code submission with submission details...
}

function getWrongAnswer(title, input, stdout, output, expected) {
    var titleHTML = `<h4 class="result-title">${title}:</h4>`;
    var inputHTML = `<div class="container">
        <div class="row wrong-answer-row">
            <div class="col-3 wrong-answer-text">Input:</div>
            <div class="col-9 shadow-sm wrong-answer">
                <div class="wrong-answer-value">${input}</div>
            </div>
        </div>`;

    stdoutHTML = "";

    if (stdout) {
        var stdoutHTML = `<div class="row wrong-answer-row">
            <div class="col-3 wrong-answer-text">Stdout:</div>
            <div class="col-9 shadow-sm wrong-answer">
                <div class="wrong-answer-value">`;

        var i = 0;

        for (; i < stdout.length - 1; i++) {
            stdoutHTML += stdout[i] + '<br>';
        }

        stdoutHTML += stdout[i] + '</div>';

        stdoutHTML += `</div></div>`;
    }

    var outputHTML = `<div class="row wrong-answer-row">
        <div class="col-3 wrong-answer-text">Output:</div>
        <div class="col-9 shadow-sm wrong-answer">
            <div class="wrong-answer-value">${output}</div>
        </div>
    </div>`;
    var expectedHTML = `<div class="row wrong-answer-row">
        <div class="col-3 wrong-answer-text">Expected:</div>
        <div class="col-9 shadow-sm wrong-answer">
            <div class="wrong-answer-value">${expected}</div>
        </div>
        </div>
    </div>`;
    return titleHTML + inputHTML + stdoutHTML + outputHTML + expectedHTML;
}

function getError(title, error) {
    return `<h4 class="result-title">${title}:</h4>
    <div class="container">
        <div class="row error-row">
            <div class="error">
                <div class="error-value">${error}</div>
            </div>
        </div>
    </div>`
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
                var val = 50,
                    min = 240,
                    max = 270;

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
