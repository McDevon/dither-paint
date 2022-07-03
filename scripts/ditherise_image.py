from optparse import OptionParser
from PIL import Image
import sys
import os

class pixel:
    def __init__(self, value, ditherValue, x, y):
        self.value = value
        self.ditherValue = ditherValue
        self.x = x
        self.y = y


def ditheriseImage(inputFileName, ditherFileName, outputFileName):
    inputImage = Image.open(inputFileName)
    input = inputImage.load()
    ditherImage = Image.open(ditherFileName)
    dither = ditherImage.load()

    if (inputImage.mode == 'P'):
        inputImage = inputImage.convert('RGBA')
    inputHasAlpha = inputImage.mode == 'RGBA'
    inputIsmonochrome = inputImage.mode == 'L'
    if (ditherImage.mode == 'P'):
        ditherImage = ditherImage.convert('RGBA')
    ditherHasAlpha = ditherImage.mode == 'RGBA'
    ditherIsmonochrome = ditherImage.mode == 'L'

    if (inputHasAlpha):
        red, green, blue, _ = inputImage.split()
        r = red.load()
        g = green.load()
        b = blue.load()
    elif (inputIsmonochrome):
        r = inputImage.load()
        g = r
        b = r
    else:
        red, green, blue = inputImage.split()
        r = red.load()
        g = green.load()
        b = blue.load()

    if (ditherHasAlpha):
        red, _, _, _ = ditherImage.split()
        ditherPixels = red.load()
    elif (ditherIsmonochrome):
        ditherPixels = ditherImage.load()
    else:
        red, _, _ = ditherImage.split()
        ditherPixels = red.load()

    width, height = inputImage.size
    ditherWidth, ditherHeight = ditherImage.size

    outputImage = Image.new(mode="L", size=inputImage.size)
    outputPixels = outputImage.load()
    
    inputArray = []

    for y in range(0, height):
        for x in range(0, width):
            inputArray.append(
                pixel(
                    (r[x, y] + g[x, y] + b[x, y]) / 3,
                    ditherPixels[x % ditherWidth, y % ditherHeight],
                    x,
                    y
                )
            )
    
    inputArray.sort(key=lambda x: (x.value, x.ditherValue))

    divider = len(inputArray) / 256

    for i in range(0, len(inputArray)):
        outputPixels[inputArray[i].x, inputArray[i].y] = int(i / divider)

    outputImage.save(outputFileName)


def main():
    parser = OptionParser(
        usage=(
            'usage: %s [input image] [dither image] [output image]'
            % sys.argv[0]
        )
    )

    (options, args) = parser.parse_args()
    if len(args) < 3:
        parser.print_help()
        return -1

    inputFileName = args[0]
    ditherFileName = args[1]
    outputFileName = args[2]

    ditheriseImage(inputFileName, ditherFileName, outputFileName)


if __name__ == '__main__':
    main()
