function anima() {
    $(".leaderboard").animate({
        top: '63%'
    }, "slow");
    $(".current1").fadeIn("slow");
    $(".time").fadeIn("slow");
    $(".current2").fadeIn("slow");
}

function returnanima() {
    $(".current1").fadeOut("slow");
    $(".time").fadeOut("slow");
    $(".current2").fadeOut("slow");
    $(".leaderboard").animate({
        top: '44%'
    }, "slow");
}
