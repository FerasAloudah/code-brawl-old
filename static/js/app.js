$(".time").css("display", "table");
$(".time").fadeOut(0);

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

let counter = 0;

function create(name, points) {
    let get = document.getElementById("orderlist")
    let c = document.createElement("li");
    c.className = `li${counter}`
    get.appendChild(c);
    let mark = document.createElement("mark");
    let textformark = document.createTextNode(name)
    c.append(mark)
    mark.appendChild(textformark)
    let small = document.createElement("small");
    let textforsmall = document.createTextNode(points)
    small.appendChild(textforsmall)
    c.appendChild(small)
    $(`.li${counter}`).append(`<div class="progress">
        <div class="progress-bar bg-secondary" style="width:${points / 600 * 100}%"></div>
      </div>`);
    counter++;
}
