<script>
  /* eslint no-unused-vars: 1 */

  export let I;
  import { snapshots } from "./stores";
  import * as d3 from "d3";
  import { afterUpdate } from "svelte";
  // acessing the snapshots data from store
  $: label = $snapshots[I].label;
  $: parent = $snapshots[I].parent;
  $: tree = JSON.parse(JSON.stringify($snapshots[I].data[parent]));

  let margin = { top: 40, right: 60, bottom: 20, left: 60 };
  const width = document.body.clientWidth * 0.7;
  const height = document.body.clientHeight;

  let svg;

  let preElement;
  let currElement;

  afterUpdate(() => {
    // remove references to inactive child components
    function trimTree(tree) {
      if (tree.children.length) {
        for (let i = tree.children.length - 1; i >= 0; i--) {
          if (!tree.children[i].active) {
            tree.children.splice(i, 1);
          } else {
            trimTree(tree.children[i]);
          }
        }
      }
    }

    trimTree(tree);

    //setting up chart DOM elements
    svg = d3
      .select("#chart")
      .append("div")
      .attr("class", I)
      .append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let i = 0;
    let duration = 750;
    let root;
    //d3.tree() is tidy tree layout module
    let treemap = d3.tree().size([width, height]);
    //construct root node
    root = d3.hierarchy(tree, function (d) {
      return d.children;
    });
    //setting root position
    root.x0 = 0;
    root.y0 = width / 2;

    update(root);
    function update(src) {
      let treeData = treemap(root);
      let nodes = treeData.descendants();

      //set depth
      nodes.forEach(function (d) {
        d.y = d.depth * 180;
      });

      let node = svg.selectAll("g.node").data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });
      //enter node and node start at the parent's position
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("id", function (d) {
          return d.data.id;
        })
        .attr("transform", function (d) {
          return "translate(" + src.x0 + ", " + src.y0 + ")";
        })
        .on("click", click);

      //create circles
      nodeEnter
        .append("circle")
        .attr("class", "node")
        .attr("r", 0)
        .style("fill", function (d) {
          return d._children ? "moccasin" : "rgb(238, 137, 5)";
        });

      //add text to show the node data (component name)
      nodeEnter
        .append("text")
        .attr("dx", ".35em")

        .attr("y", function (d) {
          return -12;
        })
        .attr("text-anchor", function (d) {
          return d.children || d._children ? "middle" : "middle";
        })
        .text(function (d) {
          return d.data.id;
        })
        .style("fill", "white");

      // text appearing on hover over node with node's data(variables and value)
      nodeEnter
        .append("g:title")
        .attr("transform", "translate(0,0)")
        .text(function (d) {
          //checking if variable objects have properities
          if (Object.keys(d.data.variables).length > 0) {
            let text = "";

            //recursively access the value of variables in nested data then assign the value to text
            Object.keys(d.data.variables).forEach((item) => {
              function nested(obj) {
                if (obj.value) {
                  text = text + obj.name + ":";
                  if (typeof obj.value !== "object") {
                    text = text + obj.value + "\n";
                  } else {
                    text = text + "\n";
                    for (let val in obj.value) {
                      nested(obj.value[val]);
                    }
                  }
                }
              }

              nested(d.data.variables[item]);
            });

            return text;
          } else {
            return `There are ${d.data.children.length} children`;
          }
        });

      //make transition node/ start from parent position to new position
      let nodeUpdate = nodeEnter.merge(node);
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + d.x + ", " + d.y + ")";
        });

      nodeUpdate
        .select("circle.node")
        .attr("r", 10)
        .style("fill", function (d) {
          return d._children ? "moccasin" : "rgb(238, 137, 5)";
        })
        .attr("cursor", "pointer");

      //remove exiting node;
      let nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function (d) {
          //from child to parent
          return "translate(" + src.x + "," + src.y + ")";
        })
        .remove();
      //remove circle, dot starts at 0 it goes to 10 and when we click again it goes back to 0
      nodeExit.select("circle").attr("r", 0);
      //remove text
      nodeExit.select("text").style("fill-opacity", 0);

      //links
      function diagonal(s, d) {
        //path is svg elm which draw lines. Start from M, move to C
        let path = `M ${s.x} ${s.y}
                  C ${(s.x + d.x) / 2} ${s.y}
                    ${(s.x + d.x) / 2} ${d.y}
                    ${d.x} ${d.y}`;
        return path;
      }

      let activelinks = treeData.descendants().slice(1);
      let links = [];
      activelinks.forEach((item) => {
        if (item.data.active) {
          links.push(item);
        }
      });

      let link = svg.selectAll("path.link").data(links, function (d) {
        return d.id;
      });

      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", function () {
          let o = { x: src.x0, y: src.y0 };
          return diagonal(o, o);
        });

      let linkUpdate = linkEnter.merge(link);
      linkUpdate
        .transition()
        .duration(duration)
        .attr("d", function (d) {
          //transit from spot to its parent spot
          return diagonal(d, d.parent);
        });
      let linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function (d) {
          let o = { x: src.x0, y: src.y0 };
          return diagonal(o, o);
        })
        .remove();

      //store the old position for transition to transition back
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
      function click(event, d, e) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }
    //render chart with most recent data in the browser and remove previous chart from DOM
    preElement = document.getElementsByClassName(`${I}`)[0].previousSibling;
    currElement = document.getElementsByClassName(`${I}`);
    if (preElement) {
      preElement.remove();
    }
  });
</script>

<main>
  <h2>Snapshot {I}: {label}</h2>

  <div bind:this={svg} id="chart" />
</main>
