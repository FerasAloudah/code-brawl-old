loadResults(challenge_id);

async function loadResults(challenge_id) {
    await db.collection('challenges').doc(challenge_id).get().then(async function(doc) {
        if (doc.exists) {
            var data = doc.data();

            var player = getPlayer();
            var playerOne = [data.playerOne, data.playerOneTime, data.playerOnePoints];
            var playerTwo = [data.playerTwo, data.playerTwoTime, data.playerTwoPoints];

            if (player == playerTwo[0]) {
                var temp = playerOne;
                playerOne = playerTwo;
                playerTwo = temp;
            }

            var playerOneName = await getPlayerInfo(playerOne[0]);
            var playerTwoName = await getPlayerInfo(playerTwo[0]);

            $("#player1").html(playerOneName);
            $("#player2").html(playerTwoName);

            $("#p1q1t").html(playerOne[1][0] || "-");
            $("#p1q2t").html(playerOne[1][1] || "-");
            $("#p1q3t").html(playerOne[1][2] || "-");

            $("#p1q1p").html(playerOne[2][0]);
            $("#p1q2p").html(playerOne[2][1]);
            $("#p1q3p").html(playerOne[2][2]);

            $("#p1tt").html(playerOne[1][2] || "5:00");
            $("#p1tp").html(playerOne[2].reduce((a, b) => a + b, 0));

            $("#p2q1t").html(playerTwo[1][0] || "-");
            $("#p2q2t").html(playerTwo[1][1] || "-");
            $("#p2q3t").html(playerTwo[1][2] || "-");

            $("#p2q1p").html(playerTwo[2][0]);
            $("#p2q2p").html(playerTwo[2][1]);
            $("#p2q3p").html(playerTwo[2][2]);

            $("#p2tt").html(playerTwo[1][2] || "5:00");
            $("#p2tp").html(playerTwo[2].reduce((a, b) => a + b, 0));

            // Start timer here.
            $(".se-pre-con").fadeOut("slow");
        } else {
            $(".se-pre-con").fadeOut("slow");
            // changeWindow();
        }
    }).catch(function(error) {
        console.log(error);
        // changeWindow();
    });
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
