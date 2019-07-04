var id = window.location.pathname.substring(url.lastIndexOf('/') + 1);
var challengeRef = db.collection('challenges').doc(id);

function submit(fileURL) async {
    var currentTime = firebase.firestore.FieldValue.serverTimestamp();
    var startTime = await getTime();
    var player = getPlayer();
    var url = 'http://localhost:5000/code-brawl';
    
    var data = {
        id: id,
        player: player,
        url: fileURL,
        time_left: currentTime.seconds - startTime.seconds,
    };

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
}

function getTime() {
    challengeRef.get().then(function(doc) {
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

function getPlayer() {
    return 0;
}

function save() {

}
