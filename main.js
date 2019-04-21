// /*
// IDEAS:
// Top grossing actors/directors
// Most popular genres
// Genres gross by year (avg)
// Likes on facebook vs gross
// */

// (function () {
// 	var diff = d3.select('#inner-content').node().offsetTop + d3.select('#infographic').node().offsetTop
// 	var scrollPad = window.innerHeight - diff - .15 * window.innerHeight
// 	d3.select('#scroll-pad').style('height', scrollPad + 'px')
// })()

const margin = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
}
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let curPosStr,
	exploring, //true if we're on the last slide
	noGrouping, //true if we're on the first slide
	forceOn = true, //turn on to use force layout instead of static
	force = d3.layout.force();

loadData((data) => {
	// console.log(data);

	const svg = d3.select('#svg-container').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

	d3.select('#legend').style('margin-left', '80px');

	let stepDivs = d3.select('#steps').selectAll('.step')
		.data(steps).enter()

	let filteredData = data.filter((x) => {
		return x.gross > 100000000;
	});

	// filteredData.forEach((d) => {
	// 	d.profit = d.gross - d.budget;
	// });

	let grossScale = d3.scale.linear()
		.domain(d3.extent(filteredData, f('gross')))
		.range([1, 50]);

	let profitScale = d3.scale.linear()
		.domain(d3.extent(filteredData, f('profit')))
		.range([1, 50]);

	let contentScale = d3.scale.ordinal()
		.domain(d3.set(filteredData, f('content_rating')).values())
		.range(colorbrewer.Set1[9]);

	let ratingScale = d3.scale.linear()
		.domain(d3.extent(filteredData, f('imdb_score')))
		.range([d3.rgb('#c0392b'), d3.rgb('#2ecc71')]);

	let lengthScale = d3.scale.linear()
		.domain(d3.extent(filteredData, f('duration')))
		.range(colorbrewer.Greens[3]);

	force
		.nodes(filteredData)
		.size([width, height])
		.gravity(0.05)
		.charge((d) => {
			// console.log(d);
			return -Math.pow(d.radius, 2) * 2 / 5
		})
		.chargeDistance(10000)
		.on("tick", (e) => {
			if (!forceOn) {
				return
			}
			let k = .2 * e.alpha;

			// Push nodes toward their designated focus.
			data.forEach((d, i) => {
				// console.log(d['imdb_score']);
				d.color = ratingScale(d['imdb_score']);
				if (d.outtakePos) {
					d.x += (d.outtakePos - d.x) * k;
					d.y += ((exploring ? height * 1 / 2 : height * 3.7 / 6) + -d.y) * k;
					// console.log(d.x);
					// console.log(d.y);
				} else {
					d.x += (width / 2 + -d.x) * k;
					d.y += ((noGrouping ? height * 1 / 2 : height * 2.5 / 6) - d.y) * 1.5 * k;
					// console.log(d.x);
					// console.log(d.y);
				}
			});
			node
				.attr('transform', (d) => {
					return 'translate(' + d.x + ',' + d.y + ')'
				});
		});

	let node = svg.append('g').attr('id', 'm-group').selectAll('g')
		.data(filteredData).enter()
		.append('g')
		.each((d) => {
			d.radius = grossScale(d.gross);
			d.x = 0;
			d.y = 0;
		})
		.attr('class', 'node')
		.attr('transform', function (d) {
			return 'translate(' + (d.x + Math.random() * 0) + ',' + (d.y + Math.random() * 0) + ')'
		})
		.style('fill', (d) => {
			return ratingScale(d['imdb_score']);
		})
		.attr('fill', (d) => {
			return ratingScale(d['imdb_score']);
		})
		.attr('id', function (d, i) {
			return 'a' + i;
		})
		.on('click', function (d) {
			console.log(d);
		})
		.on('mouseover', ttDisplay)
		.on('mousemove', ttMove)
		.on('mouseout', ttHide);

	node.append('circle')
		.attr("r", f('radius'))
		.attr('fill', f('color'));

	let gs = gscroll()
		.container(d3.select('#graphic'))
		.fixed(d3.selectAll('#graph, #graph-space, .sticky-share'))

	gs(d3.selectAll('section.step'));

	gs.on('active', function (index) {
		curPosStr = index

		d3.selectAll('section.step')
			.transition().duration(function (d, i) {
				return i == index ? 0 : 200
			})
			.style('opacity', function (d, i) {
				return i == index ? 1 : i == index + 1 ? .1 : .001
			})

		d3.select('#legend').style('margin-left', '80px');
		if (index == 0) {
			d3.select('#legend-sizing').text("Movie revenue");
			d3.select('#legend-coloring').text("Rating on IMDB");
			filteredData.forEach((d) => {
				d.radius = grossScale(d.gross);
				d.color = ratingScale(d['imdb_score']);
			});
			node.selectAll('circle')
				.transition()
				.attr('fill', f('color'))
				.attr("r", f('radius'));
		} else if (index == 1) {
			d3.select('#legend').style('margin-left', '80px');
			d3.select('#legend-sizing').text("Movie revenue");
			d3.select('#legend-coloring').text("Rating on IMDB");
			filteredData.forEach((d) => {
				d.radius = grossScale(d.gross);
				d.color = ratingScale(d['imdb_score']);
			});
			node.selectAll('circle')
				.transition()
				.attr('fill', f('color'))
				.attr("r", f('radius'));
		} else if (index == 2) {
			d3.select('#legend-sizing').text("Movie profit");
			d3.select('#legend-coloring').text("Rating on IMDB");
			filteredData.forEach(function (d) {
				d.radius = profitScale(d.gross - d.budget);
				d.color = ratingScale(d['imdb_score']);
			});
			node.selectAll('circle')
				.transition()
				.attr('fill', f('color'))
				.attr("r", f('radius'));
		} else if (index == 3) {
			d3.select('#legend-sizing').text("Movie profit");
			d3.select('#legend-coloring').text("Content rating by the MPAA");
			filteredData.forEach(function (d) {
				d.radius = profitScale(d.gross - d.budget);
				d.color = contentScale(d['content_rating']);
			});
			node.selectAll('circle')
				.transition()
				.attr('fill', f('color'))
				.attr("r", f('radius'));
		} else if (index == 4) {
			d3.select('#legend-sizing').text("Movie profit");
			d3.select('#legend-coloring').text("Movie duration");
			filteredData.forEach(function (d) {
				d.radius = profitScale(d.gross - d.budget);
				d.color = lengthScale(d['duration']);
			});
			node.selectAll('circle')
				.transition()
				.attr("r", f('radius'))
				.attr('fill', f('color'));
		}
		force.start()
	});
	node.selectAll('circle')
		.transition()
		.attr('fill', f('color'));
});




