class Slider {
    sliderPositon
    sliderWidth
    offsetArray
    currentImage

    constructor() {
        this.offsetArray = new Array()
        this.currentImage = $(".row-1 img:first-child").attr("src")
        this.sliderPositon = $(".container__slider").offset()["left"]
        this.sliderWidth = parseFloat($(".container__slider").css("width").slice(0,-2),10)
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

        this.sliderPositon = $(".container__slider").offset()["left"]
        this.sliderWidth = parseFloat($(".container__slider").css("width").slice(0,-2),10)
        this.offsetArray = pictures
    }

    // Disable buttons and enable them after animation is done
    disableAndEnableButtons() {
        $(".button").off()
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
        $(".container__slider--row-images").css("transition","none")

        for (let i = 0; i < this.offsetArray.length; i++) {
            if ((this.sliderPositon + this.sliderWidth) <= this.offsetArray[i][1] ) {
                
                previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
                previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)
                pictureOutOfViewport = this.offsetArray[i]
                pictureHTML = $(`img[src$='${pictureOutOfViewport[0]}']`)[0].outerHTML
                pictureParent = $(`img[src$='${pictureOutOfViewport[0]}']`)[0].offsetParent

                // Reduce the offset of a row by a picture width and a margin
                if (pictureParent.classList[1] === "row-1") {
                    $(pictureParent).css("left",`${previousOffsetRow1 - (pictureOutOfViewport[2] - pictureOutOfViewport[1]) - 8}px`)
                }
                else {
                    $(pictureParent).css("left",`${previousOffsetRow2 - (pictureOutOfViewport[2] - pictureOutOfViewport[1]) - 8}px`)
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

    // At first, only enable next button
    firstClick() {
        $(".next").click((event) => {
            $(".next").off()
            $(".gray").css("background-image",`url("img/arrow-blue-left.png")`)
            $(".gray").removeClass("gray")
            this.buttonsHandler(event)
            setTimeout(() => {
                this.enableButtons()
            }, 1000)
        })
    }

    buttonsHandler(event) {
        let previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
        let previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)
        this.getOffsetArray()

        $(".container__slider--row-images").css("transition","1s")

        if (event.target.classList.contains("next")) {
            let nextPictureOffset = this.findNextPicture()
            $(".row-1").css("left",`${previousOffsetRow1 + nextPictureOffset}px`)
            $(".row-2").css("left", `${previousOffsetRow2 + nextPictureOffset}px`)
        }
        
        else if (event.target.classList.contains("previous")) {
            // Disable animations while in preparation
            $(".container__slider--row-images").css("transition","none")
            
            // Add last pictures of each row to the front
            this.addPictureToFront($(`.row-1 img:last-child`)[0].outerHTML, $(".row-1"))
            this.addPictureToFront($(`.row-2 img:last-child`)[0].outerHTML, $(".row-2"))
            
            // Prepare it for animation transition
            $(".row-1").css("left", `${previousOffsetRow1 + $(`.row-1 img:last-child`).width() + 5}px`)
            $(".row-2").css("left", `${previousOffsetRow2 + $(`.row-2 img:last-child`).width() + 5}px`)
            
            this.getOffsetArray()

            // Turn on animation transition and refresh row offsets
            $(".container__slider--row-images").css("transition","1s")
            previousOffsetRow1 = parseInt($(".row-1").css("left").slice(0,-2),10)
            previousOffsetRow2 = parseInt($(".row-2").css("left").slice(0,-2),10)

            // Find picture to go back to and move animation
            let previousPicture = this.findPreviousPicture()
            $(".row-1").css("left",`${previousOffsetRow1 - (previousPicture - (this.sliderPositon + this.sliderWidth))}px`)
            $(".row-2").css("left", `${previousOffsetRow2 - (previousPicture - (this.sliderPositon + this.sliderWidth))}px`)
            
            // After animation remove them
            setTimeout(() => {
                $(`.row-1 img:last-child`).remove()
                $(`.row-2 img:last-child`).remove() 
            }, 1000)
            
        }
        
        // After animations are done, remove those outside of the viewport on the right side of the screen
        setTimeout(() => {
            this.checkIfInsideViewport()
        }, 1000)
    }

    // Enables button event listener
    enableButtons() {
        $(".button").click((event) => {
            this.disableAndEnableButtons()
            this.buttonsHandler(event)
        })
    }
}
var slider
$(document).ready(() => {
    slider = new Slider()
    slider.firstClick()
});