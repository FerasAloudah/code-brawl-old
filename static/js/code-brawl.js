document.getElementById('timer').innerHTML = 03 + ":" + 00;
startTimer();

var challengeRef = db.collection('challenges').doc(match_id);

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
    // var remainingTime = await getRemainingTime();
    //
    // if (remainingTime > 300) {
    //     console.log("Time's up!");
    //     return;
    // }

    var url = 'http://localhost:5000/code-brawl'; // API url.
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
            return data.json()
        })
        .then(res => console.log(res))
        .catch(error => console.log(error))

    // Show alert after code submission with submission details...
}

function getData() {
    var player = getPlayer();

    var data = {
        'id': match_id,
        'player': player,
        'data': editor.getValue(),
        'language': getLanguage()
    };

    return data;
}

async function getTime() {
    await challengeRef.get().then(function(doc) {
        if (doc.exists) {
            return doc.data().startingTime;
            console.log("Document data:", doc.data());
        } else {
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

async function getRemainingTime() {
    var currentTime = new Date();
    var startingTime = await getTime();
    return (currentTime.getTime() - startingTime.getTime()) / 1000;
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

function save() {
    // save what? I forgot...
}

function startTimer() {
    var presentTime = document.getElementById('timer').innerHTML;
    var timeArray = presentTime.split(/[:]+/);
    var m = timeArray[0];
    var s = checkSecond((timeArray[1] - 1));
    if (s == 59) {
        m = m - 1
    }
    document.getElementById('timer').innerHTML =
        m + ":" + s;
    setTimeout(startTimer, 1000);
}

function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
        sec = "0" + sec
    }; // add zero in front of numbers < 10
    if (sec < 0) {
        sec = "59"
    };
    return sec;
}

function changeLang() {
    var choice = document.getElementById('langChoice').value.toLowerCase();
    var lang = getLanguage();

    if (lang == choice) {
        return;
    }

    if (choice == 'java') {
        python_code = editor.getValue();
        editor.setValue(java_code);
        editor.session.setMode("ace/mode/java");
    } else {
        java_code = editor.getValue();
        editor.setValue(python_code);
        editor.session.setMode("ace/mode/python");
    }
}

function changeWindow() {
    // Change to error page later?
    window.location.replace("http://localhost:5000");
}
