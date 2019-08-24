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
    document.getElementById('timer').innerHTML = parseInt(remainingTime / 60) + ":" + parseInt(remainingTime % 60);
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
