<script>

import * as d3 from 'd3';
import { onMount } from 'svelte';

export let treeData;
console.log('treeData',treeData)
export let count;

console.log("count",count)

let margin = {top:20,right:0,bottom:20,left:0}
    // let width = 400 - margin.left - margin.right;
    // let height = 700 - margin.top -margin.bottom;
//1/3 
const width = document.body.clientWidth;
const height = document.body.clientHeight;

    let svg;

//check if dom already have 1 tidy tree  
//if(count<2){   
onMount(()=>{
  
     
    svg = d3.select("#chart")
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
       let treemap = d3.tree().size([width,height]);
       //construct root node
       root = d3.hierarchy(treeData, function(d){
           return d.children;
       });
       console.log('root',root)
       
    root.x0 = 0;
    root.y0 = width/2;

       update(root);
       function update(src){
           let treeData = treemap(root)
           //nodes //return thr arr of descendant nodes, staring with this node then followed by each child
           let nodes = treeData.descendants();
           console.log('nodes',nodes)
           //set depth
           nodes.forEach(function(d){
               d.y=d.depth*140;
           });

           let node = svg.selectAll('g.node').data(nodes,function(d){
               return d.id || (d.id= ++i); //return d.id or it has child 
           });
           //node start at the parent's position
           let nodeEnter = node
                  .enter()
                  .append('g')
                  .attr('class','node')
                  .attr('transform',function(d){
                      return "translate(" + src.x0 + ", " + src.y0 +")";
                  })
                  .on('click',click);
            //create circles (this might be the place to set the state datas to deliver to data panel )  
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
               .attr('dx','.35em')
            //    .attr('dx',function(d){
            //        console.log('d',d)
            //        return  d.children ||d._children? `.${d.data.id.length/0.2}em`:`.${d.data.id.length/0.2}em`
            //    })
               //.attr('y',-20)
               .attr('y',function(d){
                    //return d.children ||d._children? -20:0;//has childern text on the left(not nesserary)
                    return -12
               })
               .attr('text-anchor',function(d){
                   return d.children ||d._children? "middle":"middle" //text position with node
               })
               .text(function(d){
                   return d.data.id;
               })
             
            //make transition node/ start from parent position to new position
            let nodeUpdate = nodeEnter.merge(node);
            nodeUpdate
              .transition()
              .duration(duration)
              .attr('transform',function(d){
                  return 'translate(' +d.x+ ', ' +d.y+ ')';
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
                  return "translate("+src.x + "," + src.y +")";
              })
              .remove();
              //remove circle, dot starts at 0 it goes to 10 and when we click again it goes back to 0
            nodeExit.select('circle').attr('r',0);  
            //remove text
            nodeExit.select('text').style('fill-opacity',0);

            //links
            function diagonal(s,d){
               //path is svg elm which draw lines. Start from M, move to C 
               let path = `M ${s.x} ${s.y}
                  C ${(s.x+d.x) / 2} ${s.y}
                    ${(s.x+d.x) / 2} ${d.y}
                    ${d.x} ${d.y}`;
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
              
           //store the old position for transition to transition back
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
    
   
})  
//}    
</script>


<div bind:this={svg} id='chart'></div>



   