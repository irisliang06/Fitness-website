import data from './data.js'
import barchart from './barchart.js'

//barchart.init('chart-anchor', 500, 200);
//barchart.render(data);

barchart.init('chart-anchor', 500, 300);

window.renderGraph = function(x) {
  if (x === undefined) {
    x = data;
  }
  barchart.render(x);
};