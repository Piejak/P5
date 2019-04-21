function loadData(callback) {
    d3.queue().defer(d3.csv, 'movies.csv')
    .await((error, response, positions) => {
        response.forEach((d) => {
            d.profit = d.gross - d.budget;
            d.duration = parseInt(d.duration);
        });
        callback(response);
    });
}

const f = R.prop;

//tooltip
var lastShow = new Date();

function ttDisplay(d) {
    var tt = d3.select('.tooltip')
    tt.classed('tooltip-hidden', false);
    d3.select(this).style('stroke-width', 3)
    window.setTimeout(function () {
        tt.classed('tooltip-hidden', false);
    }, 0)
    lastShow = new Date();
    [{
            id: 'title',
            prop: 'movie_title'
        },
        {
            id: 'genre',
            prop: 'genres'
        },
        {
            id: 'rating',
            prop: 'imdb_score'
        },
        {
            id: 'revenue',
            prop: 'gross'
        }, 
        {
            id: 'profit',
            prop: 'profit'
        },
        {
            id: 'content_rating',
            prop: 'content_rating'
        },
        {
            id: 'duration',
            prop: 'duration'
        }
    ].forEach(function (obj) {
        let text = d[obj.prop];
        text = String(text).replace(/\|/g, ' | ');
        if (obj.prop == 'gross' || obj.prop == 'profit') {
            text = parseFloat(text).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            text = '$' + String(text);
        }
        d3.select('#' + obj.id).text(text);
    })
}

function ttMove(d) {
    var tt = d3.select('.tooltip')
    var e = d3.event,
        x = e.clientX,
        y = e.clientY,
        doctop = (window.scrollY) ? window.scrollY : (document.documentElement && document.documentElement.scrollTop) ? document.documentElement.scrollTop : document.body.scrollTop;
    tt = d3.select('.tooltip'),
        n = tt.node(),
        nBB = n.getBoundingClientRect()

    tt.style('top', (y + doctop - nBB.height - 18) + "px");
    tt.style('left', Math.min(Math.max(0, (x - nBB.width / 2)), window.innerWidth - nBB.width) + "px");
}

function ttHide(d) {
    var tt = d3.select('.tooltip');
    d3.select(this).style('stroke-width', 1)
    if (new Date() - lastShow > 10) {
        tt.classed('tooltip-hidden', true);
    }
}

d3.select(window).on("scroll.tooltip", function (d, i) {
    // d3.select('.tooltip').classed('tooltip-hidden', false);
})