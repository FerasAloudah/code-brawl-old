// var url = window.location.href;
// var id = window.location.pathname.substring(url.lastIndexOf('/') + 1);
var challengeRef = db.collection('challenges').doc(match_id);

async function submit() {
    var remainingTime = await getRemainingTime();

    if (remainingTime > 300) {
        console.log("Time's up!");
        return;
    }

    var url = 'http://localhost:5000/code-brawl'; // API url.
    var data = getData(remainingTime);

    axios({
        method: post,
        url: url,
        data: {
            data
        }
      })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    })

    // Show alert after code submission with submission details...
}

function getData(remainingTime) {
    var player = getPlayer();

    var data = {
        id: match_id,
        player: player,
        data: editor.getValue(),
        time_left: remainingTime,
    };

    console.log(editor.getValue());

    console.log(data);
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
    // Edit to get player from firebase auth.
    return firebase.auth().currentUser.uid;
}

function save() {
    // save what? I forgot...
}
