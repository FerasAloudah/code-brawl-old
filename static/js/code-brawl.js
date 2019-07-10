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
        body: JSON.stringify(data)  ,
        method: "POST"
    };

    fetch(url, otherPram)
    .then(data => {return data.json()})
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
