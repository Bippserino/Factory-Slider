class Slider {
    sliderPositon
    sliderWidth
    offsetArray
    currentImage

    constructor() {
        this.offsetArray = new Array()
        this.currentImage = $(".row-1 img:first-child").attr("src")
        this.sliderPositon = $(".slider").offset()["left"]
        this.sliderWidth = parseFloat($(".slider").css("width").slice(0,-2),10)
    }
    

    // Get all pictures and their positions and save it in format [picture name, left edge offset, right edge offset] and get slider position
    getOffsetArray() {
        let pictures = $(".slider__row--img")

        for (let i = 0; i < pictures.length; i++) {
            pictures[i] = [$(pictures[i]).attr("src"), ($(pictures[i]).offset())["left"],($(pictures[i]).offset())["left"] + $(pictures[i]).width()] // Name, left edge offset and right edge offset
        }
        
        // Sort offset array by right edge offset
        pictures = pictures.sort((a, b) => {
            if (a[2] > b[2]) {
                return -1;
            }
            if (a[2] > b[2]) {
                return 1;
            }
            return 0;
        })

        this.sliderPositon = $(".slider").offset()["left"]
        this.sliderWidth = parseFloat($(".slider").css("width").slice(0,-2),10)
        this.offsetArray = pictures
    }

    // Get picture width
    getPictureWidth(picture) {
        return parseInt($(`img[src$='${picture}']`).css("width").slice(0,-2),10)
    }

    // Disable buttons and enable them after animation is done
    disableAndEnableButtons() {
        $(".slider--control").off()
        setTimeout(() => {
            this.enableButtons()
        },1000)
    }

    // Add picture to the back of the section
    addPictureToBack(picture, row) {
        $(row).append(picture)
    }

    // Add picture to section to the front of the section
    addPictureToFront(picture, row) {
        $(row).prepend(picture)
    }

    // Remove picture from page
    removePicture(picture) {
        $(`img[src$='${picture}']`)[0].remove()
    }

    // Check if pictures are out of viewport and if they aren't, remove them
    checkIfInsideViewport() {
        let previousOffsetRow1; let previousOffsetRow2; let pictureOutOfViewport; let pictureHTML; let pictureParent;
        this.getOffsetArray()
        $(".slider__row").css("transition","none")

        for (let i = 0; i < this.offsetArray.length; i++) {
            if ((this.sliderPositon + this.sliderWidth - 5) <= this.offsetArray[i][1] ) {
                
                previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
                previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)
                pictureOutOfViewport = this.offsetArray[i]
                pictureHTML = $(`img[src$='${pictureOutOfViewport[0]}']`)[0].outerHTML
                pictureParent = $(`img[src$='${pictureOutOfViewport[0]}']`)[0].offsetParent

                // Reduce the offset of a row by a picture width and a margin
                if (pictureParent.classList[1] === "row-1") {
                    $(pictureParent).css("left",`${previousOffsetRow1 - (pictureOutOfViewport[2] - pictureOutOfViewport[1]) - 5}px`)
                }
                else {
                    $(pictureParent).css("left",`${previousOffsetRow2 - (pictureOutOfViewport[2] - pictureOutOfViewport[1]) - 5}px`)
                }

                this.removePicture(pictureOutOfViewport[0])
                this.addPictureToBack(pictureHTML, pictureParent)    
            }
        }
    }

    // Returns rigth edge offset of the previous picture
    findPreviousPicture() {
        let index = 0
        let value
        this.getOffsetArray()
        for (let i = 0; i< this.offsetArray.length; i++) {
            if ((((this.sliderWidth + this.sliderPositon) - this.offsetArray[i][2] > value) && ((this.sliderWidth + this.sliderPositon) - this.offsetArray[i][2]) <= 0 && this.offsetArray[i][0] !== this.currentImage) || i === 0) {
                index = i
                value = (this.sliderWidth + this.sliderPositon) - this.offsetArray[i][2]
            }
        }
        this.currentImage = this.offsetArray[index][0]
        return this.offsetArray[index][2]
    }

    // Returns right edge offset of the next picture in line
    findNextPicture() {
        let distanceArray = []
        this.getOffsetArray()

        for (let i = 0; i< this.offsetArray.length; i++) {
            if ((this.sliderWidth + this.sliderPositon) - this.offsetArray[i][2] > 0 && this.offsetArray[i][0] !== this.currentImage){
                this.currentImage = this.offsetArray[i][0]
                return (this.sliderWidth + this.sliderPositon) - this.offsetArray[i][2]
            } 
        }
    }

    // Enables button event listener
    enableButtons() {
        $(".slider--control").click((event) => {
            let previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
            let previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)

            this.getOffsetArray()

            $(".slider__row").css("transition","1s")

            if (event.target.classList[1] === "next") {
                let nextPictureOffset = this.findNextPicture()
                $(".row-1").css("left",`${previousOffsetRow1 + nextPictureOffset}px`)
                $(".row-2").css("left", `${previousOffsetRow2 + nextPictureOffset}px`)
            }
            
            else if (event.target.classList[1] === "previous") {
                $(".slider__row").css("transition","none")
                
                this.addPictureToFront($(`.row-1 img:last-child`)[0].outerHTML, $(".row-1"))
                this.addPictureToFront($(`.row-2 img:last-child`)[0].outerHTML, $(".row-2"))
                
                $(".row-1").css("left", `${previousOffsetRow1 + $(`.row-1 img:last-child`).width() + 5}px`)
                $(".row-2").css("left", `${previousOffsetRow2 + $(`.row-2 img:last-child`).width() + 5}px`)
                
                
                $(`.row-1 img:last-child`).remove()
                $(`.row-2 img:last-child`).remove()
                this.getOffsetArray()

                $(".slider__row").css("transition","1s")
                previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
                previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)

                let previousPicture = this.findPreviousPicture()
                $(".row-1").css("left",`${previousOffsetRow1 - (previousPicture - (this.sliderPositon + this.sliderWidth))}px`)
                $(".row-2").css("left", `${previousOffsetRow2 - (previousPicture - (this.sliderPositon + this.sliderWidth))}px`)   
            }
            setTimeout(() => {
                this.checkIfInsideViewport()
            }, 1000)
            this.disableAndEnableButtons()
        })
            
    }
}
var slider
$(document).ready(() => {
    slider = new Slider()
    slider.enableButtons()
});