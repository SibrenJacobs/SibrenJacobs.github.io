function setup(){
    startGame(10,8);
    createCanvas(args.startPosition.x + (1 + getWidth(state.grid)) * args.lengthBox,(3.5 + getHeight(state.grid))* args.lengthBox);
    noStroke();
    noLoop();
}

function draw(){
    clear();
    drawGrid(state,args);
    drawGems(state,args);
    drawSelectedGem(state,args);
    drawScores(state,args);
    drawCount(state,args);
    if (state.gameOver){
        drawGameOver(state, args);
        drawRestartButton(state, args);
    }
    else drawHintButton(state,args);
}

const state = {rng: 0,count: {},highScore: 0, gameOver: true};
const args = {gemSelected1: "", gemSelected2: "",mousePosition: {x: 0, y: 0}};

/** VIEW */

function drawCount(state,args){
    const lengthBox = args.lengthBox;
    let x = 10;
    let y = 50;
    textAlign(LEFT,CENTER);
    fill("black");
    textSize(lengthBox *0.75 *0.5);
    text("Gems destroyed",x,y);
    x += lengthBox/2;
    y += lengthBox + lengthBox*0.25;
    let totalColors = 0;
    for (const color in state.count){
        drawGem(state,args,color,{x: x, y: y});
        fill("black");
        noStroke();
        text(`x ${state.count[color]}`,x + lengthBox/2,y);
        y += lengthBox;
        totalColors++;
    }
    stroke("black");
    strokeWeight(2);
    line(200,90,200,90 + totalColors * lengthBox + lengthBox);
}

function drawScores(state,args){
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const x = startPosition.x + getWidth(state.grid) * lengthBox * 0.5;
    let y = startPosition.y + getHeight(state.grid) * lengthBox + lengthBox/2;
    const h = lengthBox *0.75 *0.5;
    textSize(h);
    textAlign(CENTER,BASELINE);
    fill("black");
    noStroke();
    text(`Your score is: ${getScore(state)}`,x,y);
    y += lengthBox;
    text(`Your highscore is: ${state.highScore}`,x,y);
}

function drawButton(state,args,string){
    rectMode(CENTER);
    fill("white");
    stroke(1);
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const x = startPosition.x + getWidth(state.grid) * lengthBox * 0.5;
    const y = startPosition.y - lengthBox;
    const w = getWidth(state.grid) * lengthBox *0.75;
    const h = lengthBox * 0.75;
    rect(x,y,w,h);
    noStroke();
    textAlign(CENTER,CENTER);
    fill("black");
    textSize(h/2);
    text(string,x,y);
}

function drawHintButton(state,args){
    drawButton(state,args,"Hint");
}

function drawRestartButton(state,args){
    drawButton(state,args,"Restart Game");
}

function drawGameOver(state,args){
    fill("red");
    stroke("black");
    strokeWeight(6);
    rectMode(CENTER);
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const x = startPosition.x + lengthBox * getWidth(state.grid)/2;
    const y = startPosition.y + lengthBox * getHeight(state.grid)/2;
    const w = lengthBox * getWidth(state.grid) + lengthBox * 1.5;
    const h = lengthBox * getHeight(state.grid) / 4;
    rect(x,y,w,h);
    textAlign(CENTER,CENTER);
    fill("black");
    strokeWeight(4);
    textSize(h *(7/8));
    text("GAME OVER",x,y);
}

function drawGrid(state,args){
    stroke("black");
    strokeWeight(2);
    fill("white");
    rectMode(CORNER);
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const w = getWidth(state.grid) * lengthBox;
    const h = getHeight(state.grid) * lengthBox;
    rect (startPosition.x,startPosition.y,w,h)
}

function drawGems(state,args){
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    for (let y = 0; y < getHeight(state.grid); y++){
        for (let x = 0; x < getWidth(state.grid); x++){
            const position = {x: startPosition.x + x * lengthBox + lengthBox/2, y: startPosition.y + y * lengthBox + lengthBox/2};
            const color = state.grid[y][x].color;
            drawGem(state,args,color,position);
        }
    }
}

function drawSelectedGem(state,args){
    if (args.gemSelected1 !== ""){
        const startPosition = args.startPosition;
        const lengthBox = args.lengthBox;
        const gridPosition = args.gemSelected1;
        const color = state.grid[gridPosition.y][gridPosition.x].color;
        const x = startPosition.x + gridPosition.x * lengthBox + lengthBox/2;
        const y = startPosition.y + gridPosition.y * lengthBox + lengthBox/2;
        const w = lengthBox *0.8;
        stroke("black");
        fill(color);
        strokeWeight(6);
        rectMode(CENTER);
        rect(x,y,w,w,lengthBox/4)
    }
}

function drawGem(state,args,color,position){
    fill(color);
    stroke("black");
    strokeWeight(1);
    rectMode(CENTER);
    const w = args.lengthBox * 0.80;
    rect(position.x,position.y,w,w,20);
}


/** CONTROLLER */

function mouseClicked(){
    args.mousePosition = {x: mouseX, y : mouseY};
    if (!state.gameOver){
        if (isButtonPressed(state,args)){
            pressHint(state,args);
        }
        else selectGem(state,args);
        if (bothGemsChosen(args)){
            if (isSwapAllowed(state.grid,args.gemSelected1,args.gemSelected2)){
                swapGems(state,args);
                checkIfGameOver(state,args)
            }
            resetGems(args);
        }
    }
    else{
        if (isButtonPressed(state,args)){
            pressRestart(state,args);
        }
    }

}

/** MODEL */

function isButtonPressed(state,args){
    const mousePosition = args.mousePosition;
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const centerRestartX = startPosition.x + getWidth(state.grid) * lengthBox * 0.5;
    const centerRestartY = startPosition.y - lengthBox;
    const w = getWidth(state.grid) * lengthBox *0.75;
    const h = lengthBox * 0.75;
    const minX = centerRestartX - w/2;
    const maxX = centerRestartX + w/2;
    const minY = centerRestartY - h/2;
    const maxY = centerRestartY + h/2;
    return (minX <= mousePosition.x && mousePosition.x <= maxX) && (minY <= mousePosition.y && mousePosition.y <= maxY);
}

function pressHint(state,args){
    giveHint(state,args);
    redraw();
}

function pressRestart(state){
    startGame(getWidth(state.grid),getHeight(state.grid));
    redraw();
}

function swapGems(state,args){
    swap(state.grid,args.gemSelected1,args.gemSelected2);
    removeChainsAndRefill(state);
    resetGems(args);
}

function mousePositionToGridPosition(args){
    const mousePosition = args.mousePosition;
    const startPosition = args.startPosition;
    const lengthBox = args.lengthBox;
    const x = Math.floor((mousePosition.x - startPosition.x)/lengthBox);
    const y = Math.floor((mousePosition.y - startPosition.y)/lengthBox);
    return {x: x, y: y};
}

function bothGemsChosen(args){
    return args.gemSelected1 !== "" && args.gemSelected2 !== "";
}

function selectGem(state,args){
    const gridPosition = mousePositionToGridPosition(args);
    if (isInside(state.grid,gridPosition)){
        if (args.gemSelected1 === ""){
            args.gemSelected1 = gridPosition;
            redraw();
        }
        else if (args.gemSelected2 === ""){
            args.gemSelected2 = gridPosition;
        }
    }
    else resetGems(args);
}

function resetGems(args){
    args.gemSelected1 = "";
    args.gemSelected2 = "";
    redraw();
}

function setHighScore(state){
    if (getScore(state) > state.highScore){
        state.highScore = 0;
        state.highScore = getScore(state);
    }
}

function getScore(state){
    let result = 0;
    for (const color in state.count){
        result += state.count[color];
    }
    return result;
}

function giveHint(state,args){
    for (let y = 0; y < getHeight(state.grid); y++){
        for (let x = 0; x < getWidth(state.grid); x++){
            const position = {x: x, y: y};
            let testPosition = {x: x + 1, y: y};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    args.gemSelected1 = position;
                }
            }
            testPosition = {x: x - 1, y: y};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    args.gemSelected1 = position;
                }
            }
            testPosition = {x: x, y: y + 1};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    args.gemSelected1 = position;
                }
            }
            testPosition = {x: x, y: y - 1};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    args.gemSelected1 = position;
                }
            }
        }
    }
}

function checkIfGameOver(state){
    setHighScore(state);
    state.gameOver = true;
    for (let y = 0; y < getHeight(state.grid); y++){
        for (let x = 0; x < getWidth(state.grid); x++){
            const position = {x: x, y: y};
            let testPosition = {x: x + 1, y: y};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    state.gameOver = false;
                }
            }
            testPosition = {x: x - 1, y: y};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    state.gameOver = false;
                }
            }
            testPosition = {x: x, y: y + 1};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    state.gameOver = false;
                }
            }
            testPosition = {x: x, y: y - 1};
            if (isInside(state.grid,testPosition)){
                if (isSwapAllowed(state.grid,position,testPosition)){
                    state.gameOver = false;
                }
            }
        }
    }
}

function isSwapAllowed(grid,gem1,gem2){
    return isOneOfGemsInChainAfterSwap(grid,gem1,gem2) && areGemsNextTooEachOther(gem1,gem2);

    function isOneOfGemsInChainAfterSwap(grid,gem1,gem2){
        const copy = copyGrid(grid);
        swap(copy,gem1,gem2);
        return isInChain(copy,gem1) || isInChain(copy,gem2);
    }

    function areGemsNextTooEachOther(gem1,gem2){
        return (gem1.x + 1 === gem2.x && gem1.y === gem2.y) || (gem1.x - 1 === gem2.x && gem1.y === gem2.y) ||
            (gem1.x === gem2.x && gem1.y + 1 === gem2.y) || (gem1.x === gem2.x && gem1.y - 1 === gem2.y);
    }

    function copyGrid(grid){
        const result = new Array(getHeight(grid));
        for (let y = 0; y < getHeight(grid); y++){
            result[y] = new Array(getWidth(grid));
            for (let x = 0; x < getWidth(grid); x++){
                result[y][x] = grid[y][x];
            }
        }
        return result;
    }

}

function startGame(width,height){
    state.rng = Date.now();
    const currentHighScore = state.highScore;
    while (state.gameOver){
        state.grid = createGrid(width,height);
        removeChainsAndRefill(state);
        checkIfGameOver(state);
    }
    resetCount(state);
    state.highScore = currentHighScore;
    args.lengthBox = windowHeight/12;
    args.startPosition = {x: 500, y: args.lengthBox*1.8};
}

function resetCount(state){
    const gems = allGems();
    for (const gem of gems){
        state.count[gem] = 0;
    }
}

function createGrid(width,height){
    const result = new Array(height);
    for (let y = 0; y < height; y++){
        const row = new Array(width);
        for (let x = 0; x < width; x++){
            row[x] = {color: "", type: 0};
        }
        result[y] = row;
    }
    return result;
}

function getWidth(grid){
    return grid[0].length;
}

function getHeight(grid){
    return grid.length;
}

function isInside(grid,position){
    return (0 <= position.x && position.x < getWidth(grid) && (0 <= position.y && position.y < getHeight(grid)));
}

function swap(grid,p,q){
    const memory = grid[p.y][p.x];
    grid[p.y][p.x] = grid[q.y][q.x];
    grid[q.y][q.x] = memory;
}

function horizontalChainAt(grid,position){
    let result = 1;
    const color = grid[position.y][position.x].color;
    result += goLeft({x: position.x- 1, y: position.y},result);
    result += goRight({x: position.x + 1, y: position.y},result);
    return result;

    function goLeft(position,count){
        if (isInside(grid,position) && grid[position.y][position.x].color === color){
            const nextPosition = {x: position.x - 1, y: position.y};
            return 1 + goLeft(nextPosition,count);
        }
        return 0;
    }

    function goRight(position,count){
        if (isInside(grid,position) && grid[position.y][position.x].color === color){
            const nextPosition = {x: position.x + 1, y: position.y};
            return 1 + goRight(nextPosition,count);
        }
        return 0;
    }
}

function verticalChainAt(grid,position){
    let result = 1;
    const color = grid[position.y][position.x].color;
    result += goUp({x: position.x, y: position.y - 1},result);
    result += goDown({x: position.x, y: position.y + 1},result);
    return result;

    function goUp(position,count){
        if (isInside(grid,position) && grid[position.y][position.x].color === color){
            const nextPosition = {x: position.x, y: position.y - 1};
            return 1 + goUp(nextPosition,count);
        }
        return 0;
    }

    function goDown(position,count){
        if (isInside(grid,position) && grid[position.y][position.x].color === color){
            const nextPosition = {x: position.x, y: position.y + 1};
            return 1 + goDown(nextPosition,count);
        }
        return 0;
    }
}

function isInChain(grid,position){
    return (horizontalChainAt(grid,position) >= 3) || (verticalChainAt(grid,position) >= 3);
}

function removeChainsAndRefill(state){
    refillGrid(state);
    let gems = gemsInChain(state);
    countGems(state,gems);
    removeGems(state,gems);
    collapse(state);
    if (!isGridFull(state)){
        removeChainsAndRefill(state);
    }

    function refillGrid(state){
        for (let y = 0; y < getHeight(state.grid); y++){
            for (let x = 0; x < getWidth((state.grid)); x++){
                if (state.grid[y][x].color === ""){
                    state.grid[y][x] = createGem(state);
                }
            }
        }
    }

    function isGridFull(state){
        const totalSquares = getHeight(state.grid) * getWidth(state.grid);
        let count = 0;
        for (let y = 0; y < getHeight(state.grid); y++){
            for (let x = 0; x < getWidth(state.grid); x++){
                if (state.grid[y][x].color !== ""){
                    count++;
                }
            }
        }
        return count === totalSquares;
    }

    function gemsInChain(state){
        let result = [];
        for (let y = 0; y < getHeight(state.grid); y++){
            for (let x = 0; x < getWidth(state.grid); x++){
                const position = {x: x, y: y};
                if (horizontalChainAt(state.grid,position) >= 3){
                    result.push(position);
                }
                if (verticalChainAt(state.grid,position) >= 3){
                    result.push(position);
                }
            }
        }
        return result;
    }

    function countGems(state,gems){
        for (const gem of gems){
            const color = state.grid[gem.y][gem.x].color;
            if (color in state.count){
                state.count[color]++;
            }
            else state.count[color] = 1;
        }
    }

    function removeGems(state,gems){
        for (const gem of gems){
            state.grid[gem.y][gem.x].color = "";
        }
    }

    function collapse(state) {
        for (let y = 0; y < getHeight(state.grid); y++) {
            for (let x = 0; x < getWidth(state.grid); x++) {
                if (state.grid[y][x].color === "") {
                    fallGems({x: x, y: y});
                }
            }
        }

        function fallGems(position) {
            const nextPosition = {x: position.x, y: position.y - 1};
            if (isInside(state.grid,nextPosition)) {
                swap(state.grid,position,nextPosition);
                fallGems(nextPosition);
            }
        }
    }
}

function nextRandomNumber(n){
    return (4578 * n ** 2 - 976161 * n + 6156489) % 79729693;
}

function createGem(state){
    state.rng = nextRandomNumber(state.rng);
    const gems = allGems();
    const amount = gems.length;
    return {color: gems[state.rng % amount], type: 0};
}

function allGems(){
    return ['green','red','blue','LightSlateGray','DarkMagenta','Gold','DarkOrange']
}