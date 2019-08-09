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
function create(mark, small, progress) {
    //mark is the player name 
    //small is the player score 
    //progress for the progress bar
    let get = document.getElementById("orderlist")
    let c = document.createElement("li");
    get.appendChild(c);
    let mark = document.createElement("mark");
    let textformark = document.createTextNode(mark)
    c.append(mark)
    mark.appendChild(textformark)
    let small = document.createElement("small");
    let textforsmall = document.createTextNode(small)
    small.appendChild(textforsmall)
    c.appendChild(small)
    $("li").append(`<div class="progress">
    <div class="progress-bar bg-secondary" style="width:${progress}%"></div>
  </div>`);
}
