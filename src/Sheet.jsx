import { useRef, useEffect, useState } from 'react';
import { calculateRowsAndColumnsToDisplay, resizeCanvas, getEncoderCharacter } from './Sheet.utils';

export const Sheet = (props) => {
    const canvasRef = useRef(null);

    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth); //same as 100% or 100vw
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight); //same as 100% or 100vh
    const [cellsOffset, setCellsOffset] = useState({ x: 0, y: 0 }) //initially kisi bhi direction offset nahi hua hai esiliye x=0,y=0
    const [maxScrollArea, setMaxScrollArea] = useState({ x: 5000, y: 5000 }); //This is the maximum area that can be scrolled in x and y direction , we are giving this because div ko with and height dynamic deni hai

    const [selectionInProgress, setSelectionInProgress] = useState(false); //This will tell us if the user is currently selecting the cells or not
    const [selection, setSelection] = useState({ x1: -1, y1: -1, x2: -1, y2: -1 }) //This will store the start and end of the selection [x1,y1] [x2,y2]

    const [editCell, setEditCell] = useState({ x: -1, y: -1 });
    const [editValue, setEditValue] = useState('');

    const cellWidth = 100;
    const cellHeight = 22;

    const rowHeaderWidth = 50;
    const columnHeaderHeight = 22;

    const headerColor = "#f8f9fa";
    const gridLineColor = "#e2e3e3";
    const headerTextColor = "#666666";
    const selectionColor = '#e9f0fd';
    const selectioBordernColor = '#1b73e7';

    const { visible: visibleColumns, start: columnStart, end: columnEnd } = calculateRowsAndColumnsToDisplay(cellWidth, canvasWidth, rowHeaderWidth, cellsOffset.x);
    const { visible: visibleRows, start: rowStart, end: rowEnd } = calculateRowsAndColumnsToDisplay(cellHeight, canvasHeight, columnHeaderHeight, cellsOffset.y);

    const coordinatesToCell = (x, y) => {
        let cellX = -1;
        let cellY = -1;

        for (let i = 0; i < visibleColumns.length; i++) {
            if (x >= columnStart[i] && x <= columnEnd[i]) {
                cellX = visibleColumns[i];
                break;
            }
        }

        for (let i = 0; i < visibleRows.length; i++) {
            if (y >= rowStart[i] && y <= rowEnd[i]) {
                cellY = visibleRows[i];
                break;
            }
        }

        return { x: cellX, y: cellY };
    }

    const cellToCoordinates = (cellX, cellY) => {
        let x = 0;
        let y = 0;
        let idx = visibleColumns.findIndex((col) => col === cellX);
        if (idx !== -1) {
            x = columnStart[idx];
        }
        else {
            //means the cell is outside the visible area
            x = (cellX - cellsOffset.x) * cellWidth;
        }

        idx = visibleRows.findIndex((row) => row === cellY);
        if (idx !== -1) {
            y = rowStart[idx];
        }
        else {
            //means the cell is outside the visible area
            y = (cellY - cellsOffset.y) * cellHeight;
        }

        return { x, y };
    }

    useEffect(() => {
        const id = requestAnimationFrame(() => {

            //Get the canvas
            const canvas = canvasRef.current;

            //Get the context of the canvas to draw => canvas context is a tool to draw on the canvas
            const context = canvas.getContext('2d');

            //Resize the canvas
            resizeCanvas(canvas);

            context.fillStyle = 'white';
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);

            //Here we highlight the selected cells when user is selecting the cells
            let selectionX1 = selection.x1;
            let selectionX2 = selection.x2;

            if (selectionX1 > selectionX2) {
                //means user has selected from right to left , so we need to swap the values
                //because we want to start from left and go to right
                selectionX1 = selection.x2;
                selectionX2 = selection.x1;
            }

            let selectionY1 = selection.y1;
            let selectionY2 = selection.y2;

            if (selectionY1 > selectionY2) {
                //means user has selected from bottom to top , so we need to swap the values
                //because we want to start from top and go to bottom
                selectionY1 = selection.y2;
                selectionY2 = selection.y1;
            }

            const point1 = cellToCoordinates(selectionX1, selectionY1);
            const point2 = cellToCoordinates(selectionX2, selectionY2);

            //check if the selection is active or not
            const isSelectionActive = selection.x1 !== -1 && selection.y1 !== -1 && selection.x2 !== -1 && selection.y2 !== -1;

            point2.x += cellWidth;
            point2.y += cellHeight;

            if (isSelectionActive) {
                //calculate the width and height of the selection
                const rectwidth = point2.x - point1.x;
                const rectHeight = point2.y - point1.y;

                context.fillStyle = selectionColor;
                context.fillRect(point1.x, point1.y, rectwidth, rectHeight);
            }



            //Draw Rows lines
            let startY = columnHeaderHeight; //as we move down, we need to increase the y coordinate
            context.strokeStyle = gridLineColor; //This will change the color of grid
            for (const row of visibleRows) {
                context.beginPath();
                context.moveTo(rowHeaderWidth, startY);
                context.lineTo(context.canvas.width, startY);
                context.stroke();
                startY += cellHeight;
            }



            //Draw Columns lines
            let startX = rowHeaderWidth; //as we move to the right, we need to increase the x coordinate
            for (const col of visibleColumns) {
                context.beginPath();

                //This is the starting point , we need to give (x,y) coordinates
                context.moveTo(startX, columnHeaderHeight);

                //This is the ending point , we need to give (x,y) coordinates
                context.lineTo(startX, context.canvas.height);

                //This will draw the line
                context.stroke();

                startX += cellWidth;
            }

            //Draw Row header
            startY = columnHeaderHeight; //as we move down, we need to increase the y coordinate
            context.fillStyle = headerColor;
            context.fillRect(0, 0, rowHeaderWidth, context.canvas.height);
            for (const row of visibleRows) {
                context.beginPath();
                context.moveTo(0, startY);
                context.lineTo(rowHeaderWidth, startY);
                context.stroke();
                startY += cellHeight;
            }

            //Draw Column header
            startX = rowHeaderWidth; //as we move to the right, we need to increase the x coordinate
            context.fillStyle = headerColor;
            context.fillRect(0, 0, context.canvas.width, columnHeaderHeight);
            for (const col of visibleColumns) {
                context.beginPath();
                context.moveTo(startX, 0);
                context.lineTo(startX, columnHeaderHeight);
                context.stroke();

                startX += cellWidth;
            }


            //Writing Col header text like 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15.... then we encode them into ASCII and display them
            startX = rowHeaderWidth;

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = '13px sans-serif';
            context.fillStyle = headerTextColor;
            for (const col of visibleColumns) {
                const centerX = startX + (cellWidth * 0.5);
                const centerY = columnHeaderHeight * 0.5;

                const content = getEncoderCharacter(col + 1); //we do +1 because i want to start from 1 (1 based indexing)
                context.fillText(content, centerX, centerY);

                startX += cellWidth;
            }

            //Writing Row header text like 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15....
            startY = columnHeaderHeight;

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = '13px sans-serif';
            context.fillStyle = headerTextColor;
            for (const row of visibleRows) {
                const centerX = rowHeaderWidth * 0.5;
                const centerY = startY + (cellHeight * 0.5);

                const content = row + 1; //we do +1 because i want to start from 1 (1 based indexing)
                context.fillText(content, centerX, centerY);

                startY += cellHeight;
            }

            //giving border to the selected cells
            if (isSelectionActive) {
                //calculate the width and height of the selection
                const rectwidth = point2.x - point1.x;
                const rectHeight = point2.y - point1.y;

                context.strokeStyle = selectioBordernColor;
                context.rect(point1.x, point1.y, rectwidth, rectHeight);
                context.stroke();
            }


            let yCoord = columnHeaderHeight;

            context.textBaseline = 'middle';
            context.textAlign = 'left';
            context.fillStyle = 'black';

            for (const row of visibleRows) {
                let xCoord = rowHeaderWidth;

                for (const col of visibleColumns) {
                    const content = props?.displayData?.[row]?.[col];

                    if (content) {
                        const x = xCoord + 5;
                        const y = yCoord + (cellHeight * 0.5);

                        context.fillText(content, x, y);
                    }

                    xCoord += cellWidth;
                }
                yCoord += cellHeight;
            }
        })

        return () => cancelAnimationFrame(id);
    }, [canvasWidth, canvasHeight, cellsOffset.x, cellsOffset.y, selection, props.displayData]) //we adding cellsOffset because we want to re-render the canvas whenever there is change in cellsOffset

    useEffect(() => {
        const resizeCanvas = () => {
            setCanvasWidth(window.innerWidth);
            setCanvasHeight(window.innerHeight);
        }
        window.addEventListener('resize', resizeCanvas);
        return () => window.addEventListener('resize', resizeCanvas);
    }, [])


    const onScroll = (e) => {
        const scrollX = e.target.scrollLeft; //scrollLeft means left se kitna scroll kar diya user ne
        const scrollY = e.target.scrollTop; //scrollTop means top se kitna scroll kar diya user ne

        const cellOffsetInX = Math.floor(scrollX / cellWidth); //This will give us the number of cells that have gone out of the visible area
        const cellOffsetInY = Math.floor(scrollY / cellHeight); //This will give us the number of cells that have gone out of the visible area
        setCellsOffset({ x: cellOffsetInX, y: cellOffsetInY });

        const newMaxScrollArea = { ...maxScrollArea };
        //if user has scrolled more than the maxScrollArea then we need to increase the maxScrollArea
        if (maxScrollArea.x / scrollX < 1) {
            newMaxScrollArea.x *= 2;
        }

        if (maxScrollArea.y / scrollY < 1) {
            newMaxScrollArea.y *= 2;
        }

        setMaxScrollArea({ ...newMaxScrollArea });
    }

    const onMouseDown = (e) => {
        const clientX = e.clientX; //This will give us the x coordinate of the mouse
        const clientY = e.clientY; //This will give us the y coordinate of the mouse

        setSelectionInProgress(true);
        const selectionPoint1 = coordinatesToCell(clientX, clientY);
        const selectionPoint2 = { ...selectionPoint1 };

        setSelection({ x1: selectionPoint1.x, y1: selectionPoint1.y, x2: selectionPoint2.x, y2: selectionPoint2.y });
    }

    const onMouseMove = (e) => {
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (selectionInProgress) {
            const newSelectionPoint2 = coordinatesToCell(clientX, clientY);
            setSelection({ ...selection, x2: newSelectionPoint2.x, y2: newSelectionPoint2.y });
        }
    }

    const onMouseUp = () => {
        setSelectionInProgress(false);
    }

    const onDoubleClick = (e) => {
        const x = e.clientX;
        const y = e.clientY;

        const cell = coordinatesToCell(x, y);
        setEditCell({ x: cell.x, y: cell.y });

        const content = props.displayData[cell.y][cell.x];
        if (content) {
            setEditValue(content);
        }
    }

    const onCellKeyDown = (e) => {
        if (e.key === 'Enter') {
            props.onChange?.([{ x: editCell.x, y: editCell.y, value: editValue }]);
            setEditValue('');
            setEditCell({ x: -1, y: -1 });
        }
    }

    const onCopy = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(JSON.stringify(selection));
    }

    const onPaste = (e) => {
        e.preventDefault();
        //this returns a promise
        navigator.clipboard.readText()
            .then(data => {
                try {
                    const copySelection = JSON.parse(data);

                    //Now normalize karna pdega , kyu ki selection kisi bhi direction me ho sakti hai
                    let selectionX1 = copySelection.x1;
                    let selectionX2 = copySelection.x2;

                    if (selectionX1 > selectionX2) {
                        //means user has selected from right to left , so we need to swap the values
                        //because we want to start from left and go to right
                        selectionX1 = copySelection.x2;
                        selectionX2 = copySelection.x1;
                    }

                    let selectionY1 = copySelection.y1;
                    let selectionY2 = copySelection.y2;

                    if (selectionY1 > selectionY2) {
                        //means user has selected from bottom to top , so we need to swap the values
                        //because we want to start from top and go to bottom
                        selectionY1 = copySelection.y2;
                        selectionY2 = copySelection.y1;
                    }

                    //Now Calculate number of rows and columns we need to paste
                    const xLen = Math.abs(selectionX2 - selectionX1);
                    const yLen = Math.abs(selectionY2 - selectionY1);

                    const changes = [];
                    for (let y = 0; y <= yLen; y++) {
                        for (let x = 0; x <= xLen; x++) {
                            //extract the content from the copied cell
                            const value = props.displayData?.[copySelection.y1 + y][copySelection.x1 + x];
                            //find newly selected portion where we need to paste the content
                            changes.push({ x: selection.x1 + x, y: selection.y1 + y, value });
                        }
                    }

                    props.onChange?.(changes);
                    //now highlight the pasted cells
                    setSelection({ x1: selection.x1, y1: selection.y1, x2: selection.x1 + xLen, y2: selection.y1 + yLen });
                }
                catch (e) {
                    console.log(e);
                }
            })
    }

    const editMode = editCell.x !== -1 && editCell.y !== -1;
    let position = { x: 0, y: 0 };
    let editCellWidth = 0;
    let editCellHeight = 0;

    if (editMode) {
        position = cellToCoordinates(editCell.x, editCell.y);
        position.x += 1; //because we want to give some padding , so that the text is not stick to the border
        position.y += 1; //because we want to give some padding , so that the text is not stick to the border

        editCellWidth = cellWidth - 2;
        editCellHeight = cellHeight - 2;
    }

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }} />
            <div
                onCopy={onCopy}
                onPaste={onPaste}
                onScroll={onScroll}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onDoubleClick={onDoubleClick}
                style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'scroll' }}
            >
                {/* For Horizontal Scrolling  */}
                <div style={{ width: maxScrollArea.x + 2000 + 'px', height: '1px' }}></div> {/*we giving more width to the div so that we can scroll horizontally , jyada height dene se iake parent par scrollbar attach ho jaayega*/}
                {/* For Vertical Scrolling */}
                <div style={{ width: '1px', height: maxScrollArea.y + 2000 + 'px' }}></div>
            </div>

            {
                editMode &&
                <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={onCellKeyDown}
                    style={{
                        position: 'absolute',
                        top: position.y,
                        left: position.x,
                        width: editCellWidth,
                        height: editCellHeight,
                        outline: 'none',
                        border: 'none',
                        color: 'black',
                        fontSize: '13px',
                        fontFamily: 'sans-serif'
                    }}
                />
            }


        </div>
    )
}
