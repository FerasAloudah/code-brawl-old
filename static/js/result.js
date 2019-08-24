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

            for (let i = 0; i < 3; i++) {
                $(`#p1q${i+1}t`).html(playerOne[1][i] || "-");
                $(`#p1q${i+1}p`).html(playerOne[2][i] || "-");

                $(`#p2q${i+1}t`).html(playerTwo[1][i] || "-");
                $(`#p2q${i+1}p`).html(playerTwo[2][i] || "-");
            }

            $("#p1tt").html(playerOne[1][2] || "5:00");
            $("#p1tp").html(playerOne[2].reduce((a, b) => a + b, 0));

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
