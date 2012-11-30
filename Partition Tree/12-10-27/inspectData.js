(function () {
  var root = this;

  function run () {
    var body = d3.select("body");
    body.html("");

    var fileList = body.append("select");
    fileList.selectAll("option")
        .data([
           "Select a Data file",
           "flare.json",
           "flare-imports.json",
           "miserables.json",
           "cars.csv",
           "stocks.csv",
           "charlie.json",
           "us-pres.json"
        ])
      .enter()
        .append("option")
        .attr({
          value: function(d) { return d; }
        })
        .text(function(d) { return d; });

    var dl = body.append("dl");

    function toggle(el) {
      if(el.style.display === "none") {
        el.style.display = "block";
      }
      else {
        el.style.display = "none";
      }
    }

    function inspect(obj, parent) {
      for (var k in obj) {
        if(obj.hasOwnProperty(k)) {
          (function () {
            var type = typeof obj[k];
            var dt = parent.append("dt");
            dt.style({
              margin: 10
            });
            dt.html(k + ' (' + type + ')');
            var dd = parent.append("dd");
            dd.style({
              padding: 10,
              border: "1px solid"
            });

            dt.on('click', function () {
              toggle(dd.node());
            });

            if(type === 'object') {
              inspect(obj[k], dd)
            }
            else {
              dd.append("div")
                .style({
                   "font-family": "Monospace"
                 })
                .html(obj[k].toString());
            }
          })();
        }
      }
    }

    fileList.on("change", function() {

      if(/\.json$/.test(this.value)) {
        document.title = this.value;
        d3.json(this.value, function (data) {
          dl.html("");
          inspect(data, dl);
        });
      }

      if(/\.csv$/.test(this.value)) {
        document.title = this.value;
        d3.csv(this.value, function (data) {
          dl.html("");
          inspect(data, dl);
        });
      }

    });
  }

  function load() {
    function route(hash, title) {
      if(document.location.hash === hash) {
        document.title = title;
        if(typeof d3 === "undefined") {
          var js = document.createElement("script");
          js.src = "d3.v2.js";
          js.onload = run;
          document.body.appendChild(js);
        }
        else {
          run();
        }
      }
    }

    route("#inspectData", "Inspect Data");
  }

  root.addEventListener("hashchange", load);
  root.addEventListener("load", load);

}).call(this);


