export const calculateRowsAndColumnsToDisplay = (size, visibleArea, offset, cellOffset) => {
    const visible = [];
    //Now i want to store the start and end of each row and column
    const start = [];
    const end = [];


    let idx = cellOffset; //cellOffset means how many cells have go out from visible area
    let nextStart = offset; //i start from the offset because i want to left some space for 1,2,3,...infinity and A,B,C,...infinity

    //Here we are calculating the number of rows && columns to display
    while (nextStart < visibleArea) {
        visible.push(idx);
        start.push(nextStart);
        end.push(nextStart + size);

        idx++;
        nextStart += size;
    }

    return { visible, start, end };
}

export const resizeCanvas = (canvas) => {
    //This will fetch the dimensions of the canvas
    const { width, height } = canvas.getBoundingClientRect();

    const ratio = window.devicePixelRatio;

    const newCanvasWidth = Math.round(width * ratio);
    const newCanvasHeight = Math.round(height * ratio);

    const context = canvas.getContext('2d');
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    context.scale(ratio, ratio);

}

export const getEncoderCharacter = (num) => {
    let result = "";

    while (num > 0) {
        //we consider num-1 because previously we have calculate the cols as 1,2,3,4.. , we need to do num-1 so that we can get A,B,C,D... for example if num=1 then num-1=0 and 0+65=65 which is A
        const rem = (num - 1) % 26;
        result = String.fromCharCode(65 + rem) + result;
        num = Math.floor((num - 1) / 26);
    }

    return result;
}