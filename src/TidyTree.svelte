<script>

    import * as d3 from 'd3';
    
    export let treeData;
    console.log('treeData',treeData)
    export let count;

    console.log("count",count)
    
    let margin = {top:20,right:90,bottom:20,left:90}
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top -margin.bottom;

        let svg;
    
    //check if dom already have 1 tidy tree    
     if(count<2){  
         
        svg = d3.select("body")
           .append('div')
           .attr('class','container')
           .append("svg")
           .attr('width',width + margin.right + margin.left)
           .attr('height',height+ margin.top + margin.bottom)
           .append('g')
           .attr('transform',"translate(" + margin.left+ ","+ margin.top + ")");
           let i = 0;
           let duration = 750;
           let root;
           //d3.tree() is tidy tree layout module
           let treemap = d3.tree().size([height,width]);
           //construct root node
           root = d3.hierarchy(treeData, function(d){
               return d.children;
           });
           root.x0 = height/2;
           root.y0 = 0;
    
           update(root);
           function update(src){
               let treeData = treemap(root)
               //nodes
               let nodes = treeData.descendants();
    
               //set depth
            //    nodes.forEach(function(d){
            //        d.y=d.depth*180;
            //    });
    
               let node = svg.selectAll('g.node').data(nodes,function(d){
                   return d.id || (d.id= ++i);
               });
               let nodeEnter = node
                  .enter()
                  .append('g')
                  .attr('class','node')
                  .attr('transform',function(d){
                      return "translate(" + src.y0 + ", " + src.x0 +")";
                  })
                  .on('click',click);
                  nodeEnter
                    .append('circle')
                    .attr('class','node')
                    .attr('r',0)
                    .style('fill',function(d){
                        return d._children? "red":"green";
                    })
    
                 //add text  to show the node data
                 nodeEnter
                   .append('text')
                   .attr('dy','.35em')
                   .attr('x',function(d){
                       return d.children ||d._children? -13:13;//has childern text on the left(not nesserary)
                   })
                   .attr('text-anchor',function(d){
                       return d.children ||d._children? "end":"start"
                   })
                   .text(function(d){
                       return d.data.id;
                   })
                 
    
                let nodeUpdate = nodeEnter.merge(node);
                nodeUpdate
                  .transition()
                  .duration(duration)
                  .attr('transform',function(d){
                      return 'translate(' +d.y+ ', ' +d.x+ ')';
                  });
                nodeUpdate
                  .select('circle.node')
                  .attr('r',10)
                  .style('fill',function(d){
                        return d._children? "red":"green";
                    })
                  .attr('cursor', 'pointer');
    
                  //remove exiting node;
               let nodeExit = node
                  .exit()
                  .transition()
                  .duration(duration)
                  .attr('transform',function(d){
                      //from child to parent
                      return "translate("+src.y + "," + src.x +")";
                  })
                  .remove();
                  //remove circle, dot starts at 0 it goes to 10 and when we click again it goes back to 0
                nodeExit.select('circle').attr('r',0);  
                //remove text
                nodeExit.select('text').style('fill-opacity',0);
    
                //links
                function diagonal(s,d){
                   let path = `M ${s.y} ${s.x}
                      C ${(s.y+d.y) / 2} ${s.x}
                        ${(s.y+d.y) / 2} ${d.x}
                        ${d.y} ${d.x}`;
                    return path;
                }
                 
                let links = treeData.descendants().slice(1);
                let link = svg.selectAll('path.link').data(links, function(d){
                    return d.id;
                })
    
                let linkEnter = link
                  .enter()
                  .insert('path','g')
                  .attr('class','link')
                  .attr('d',function(){
                      let o={x:src.x0, y:src.y0}//y0 or y? 12/22
                      return diagonal(o,o);
                  });
                
                let linkUpdate = linkEnter.merge(link);
                  linkUpdate
                    .transition()
                    .duration(duration)
                    .attr('d',function(d){
                        //transit from spot to its parent spot like src and destination
                        return diagonal(d,d.parent);
                    })
                let linkExit = link
                  .exit()
                  .transition()
                  .duration(duration)
                  .attr('d',function(d){
                      let o = {x:src.x0, y:src.y0};
                      return diagonal(o,o);
                  })
                  .remove();
                  
    
               nodes.forEach(function(d){
               d.x0=d.x;
               d.y0=d.y;
           });
           function click(event, d){
               if(d.children){
                   d._children=d.children;
                   d.children=null;
               }else{
                   d.children=d._children;
                   d._children=null;
               }
               update(d);
           }
           }
        }
        //    if(count>1){
        //    console.log("in remove tree")
            
        //     let el = document.getElementsByClassName('container');

        //     el.remove();
        // }
           
    </script>
    
    
    
    <!-- <div class="tidy" on:click> TidyTree {treeData.id}
       
    </div> -->
    <!-- <p class="test">Test CSS</p> -->
    
    <style>
        /* .xAxis path,
        .xAxis line {
            stroke:teal;
            shape-rendering: crispEdges;
        }
        .xAxis text {
            font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-weight: bold;
            font-size: 14px;
            fill:teal;
        }
        
        .node circle {
            fill:green;
            stroke: steelblue;
            stroke-width: 3px;
        }
    
        .node text {
            font:12px sans-serif;
        }
        .link{
            fill:none;
            stroke:rgb(153, 5, 5);
            stroke-width: 2px;
        } */
    
    
    /* .test{
        color: tomato;
        font:100px;
    } */
    </style>    
