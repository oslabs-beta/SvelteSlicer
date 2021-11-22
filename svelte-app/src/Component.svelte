<script>
    import { parse } from "svelte/compiler";
    import { onMount } from 'svelte';

    let svelteFiles = []
    let parsedArray = []
    
    onMount(async () => {
        await chrome.devtools.inspectedWindow.getResources(resources => {
            svelteFiles = resources.filter(resource => resource.url.includes('.svelte'))
        
            svelteFiles.forEach(file => {
                file.getContent(source => {
                    const ast = parse(source)
                    console.log(file.url)
                    console.log(ast)
                    const parsedAST = parseAST(ast)
                    const bigObj = {
                        name: file.url, 
                        ast: ast, 
                        astData: parsedAST,
                        source: source}
                    parsedArray = [...parsedArray, bigObj]      
                })
            })
        })
    })
    
    function parseAST(ast) {
        let children = []
        let state = []
        let store = []
        let props = []
        let reactives = []

        ast.instance.content.body.forEach(declaration => {
            switch(declaration.type) {
                case "ImportDeclaration": {
                    if (declaration.source.value.includes('.svelte')) {
                        children = [...children, declaration.specifiers[0].local.name]
                    } else if (declaration.source.value.includes('stores.js')) {
                        store = [...store, declaration.specifiers[0].local.name]
                    }
                    break
                }
                case "VariableDeclaration": {
                    if (!declaration.declarations[0].init || (declaration.declarations[0].init.type === "Literal")) {
                        state = [... state, declaration.declarations[0].id.name]
                    }
                    break
                }
                case "ExportNamedDeclaration": {
                    if (declaration.declaration.type !== "FunctionDeclaration") {
                        props = [...props, declaration.declaration.declarations[0].id.name]
                    }
                    break
                }
                case "LabeledStatement": {
                     if (declaration.body.type === "ExpressionStatement" && declaration.body.expression.type === "AssignmentExpression") {
                         reactives = [...reactives, declaration.body.expression.left.name]
                     }
                     break
                }
            }
        })

        const astData = {
                children,
                state,
                store,
                props,
                reactives
        }

        return astData
    }


</script>

<div>
    <ul>
        {#each parsedArray as data}
            <li>{data.name}</li>
            <ul>
                {#if data.astData.children.length}
                <li>Children</li>
                <ul>
                    {#each data.astData.children as child}
                        <li>{child}</li>
                    {/each}
                </ul>
                {/if}
            </ul>
            <ul>
                {#if data.astData.state.length}
                <li>State Variables</li>
                <ul>
                    {#each data.astData.state as element}
                        <li>{element}</li>
                    {/each}
                </ul>
                {/if}
            </ul>
            <ul>
                {#if data.astData.store.length}
                <li>Store Variables</li>
                <ul>
                    {#each ast.astData.store as element}
                        <li>{element}</li>
                    {/each}
                </ul>
                {/if}
            </ul>
            <ul>
                {#if data.astData.props.length}
                <li>Props</li>
                <ul>
                    {#each ast.astData.props as prop}
                        <li>{prop}</li>
                    {/each}
                </ul>
                {/if}
            </ul> <ul>
                {#if data.astData.reactives.length}
                <li>Reactive Variables</li>
                <ul>
                    {#each data.astData.reactives as element}
                        <li>{element}</li>
                    {/each}
                </ul>
                {/if}
            </ul>
            <br>
            <hr>
        {/each}
    </ul>
    

</div>

