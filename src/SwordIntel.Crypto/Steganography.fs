namespace SwordIntel.Crypto

open System
open System.IO
open SixLabors.ImageSharp
open SixLabors.ImageSharp.PixelFormats
open SixLabors.ImageSharp.Processing

/// LSB Steganography for hiding data in images
module Steganography =

    /// Embed data into image using LSB (Least Significant Bit) technique
    let embedLSB (imagePath: string) (data: byte[]) (outputPath: string) =
        use image = Image.Load<Rgba32>(imagePath)

        // Prepend data length (4 bytes) to payload
        let lengthBytes = BitConverter.GetBytes(data.Length)
        let payload = Array.concat [lengthBytes; data]

        let mutable bitIndex = 0
        let mutable embedded = false

        image.ProcessPixelRows(fun accessor ->
            for y = 0 to accessor.Height - 1 do
                let row = accessor.GetRowSpan(y)
                for x = 0 to row.Length - 1 do
                    if not embedded then
                        let mutable pixel = row.[x]

                        // Embed in RGB channels (not alpha)
                        for channel = 0 to 2 do
                            if bitIndex < payload.Length * 8 then
                                let byteIndex = bitIndex / 8
                                let bitPosition = bitIndex % 8
                                let bit = (payload.[byteIndex] >>> bitPosition) &&& 1uy

                                let channelValue =
                                    match channel with
                                    | 0 -> pixel.R
                                    | 1 -> pixel.G
                                    | 2 -> pixel.B
                                    | _ -> 0uy

                                let newValue = (channelValue &&& 0xFEuy) ||| bit

                                match channel with
                                | 0 -> pixel.R <- newValue
                                | 1 -> pixel.G <- newValue
                                | 2 -> pixel.B <- newValue
                                | _ -> ()

                                bitIndex <- bitIndex + 1
                            else
                                embedded <- true

                        row.[x] <- pixel
        )

        image.Save(outputPath)

    /// Extract hidden data from image using LSB technique
    let extractLSB (imagePath: string) =
        use image = Image.Load<Rgba32>(imagePath)

        // First extract length (4 bytes = 32 bits)
        let mutable lengthBits = Array.zeroCreate<byte> 4
        let mutable bitIndex = 0

        let mutable continueExtract = true
        image.ProcessPixelRows(fun accessor ->
            for y = 0 to accessor.Height - 1 do
                if continueExtract then
                    let row = accessor.GetRowSpan(y)
                    for x = 0 to row.Length - 1 do
                        if continueExtract then
                            let pixel = row.[x]

                            for channel = 0 to 2 do
                                if bitIndex < 32 then
                                    let channelValue =
                                        match channel with
                                        | 0 -> pixel.R
                                        | 1 -> pixel.G
                                        | 2 -> pixel.B
                                        | _ -> 0uy

                                    let bit = channelValue &&& 1uy
                                    let byteIndex = bitIndex / 8
                                    let bitPosition = bitIndex % 8

                                    lengthBits.[byteIndex] <- lengthBits.[byteIndex] ||| (bit <<< bitPosition)
                                    bitIndex <- bitIndex + 1
                                else
                                    continueExtract <- false
        )

        let dataLength = BitConverter.ToInt32(lengthBits, 0)

        // Now extract actual data
        let data = Array.zeroCreate<byte> dataLength
        bitIndex <- 0
        continueExtract <- true

        image.ProcessPixelRows(fun accessor ->
            let mutable skipBits = 32 // Skip the length prefix
            for y = 0 to accessor.Height - 1 do
                if continueExtract then
                    let row = accessor.GetRowSpan(y)
                    for x = 0 to row.Length - 1 do
                        if continueExtract then
                            let pixel = row.[x]

                            for channel = 0 to 2 do
                                if skipBits > 0 then
                                    skipBits <- skipBits - 1
                                elif bitIndex < dataLength * 8 then
                                    let channelValue =
                                        match channel with
                                        | 0 -> pixel.R
                                        | 1 -> pixel.G
                                        | 2 -> pixel.B
                                        | _ -> 0uy

                                    let bit = channelValue &&& 1uy
                                    let byteIndex = bitIndex / 8
                                    let bitPosition = bitIndex % 8

                                    data.[byteIndex] <- data.[byteIndex] ||| (bit <<< bitPosition)
                                    bitIndex <- bitIndex + 1
                                else
                                    continueExtract <- false
        )

        data

    /// Detect potential steganography by analyzing LSB patterns
    let analyzeLSB (imagePath: string) =
        use image = Image.Load<Rgba32>(imagePath)

        let mutable totalPixels = 0
        let mutable irregularPatterns = 0

        image.ProcessPixelRows(fun accessor ->
            for y = 0 to accessor.Height - 1 do
                let row = accessor.GetRowSpan(y)
                for x = 0 to row.Length - 1 do
                    let pixel = row.[x]
                    totalPixels <- totalPixels + 1

                    // Check if LSBs show non-random patterns
                    let rLSB = pixel.R &&& 1uy
                    let gLSB = pixel.G &&& 1uy
                    let bLSB = pixel.B &&& 1uy

                    // Simple heuristic: if all LSBs are same, might be suspicious
                    if rLSB = gLSB && gLSB = bLSB then
                        irregularPatterns <- irregularPatterns + 1
        )

        let suspicionScore = float irregularPatterns / float totalPixels

        {|
            TotalPixels = totalPixels
            IrregularPatterns = irregularPatterns
            SuspicionScore = suspicionScore
            LikelyContainsHiddenData = suspicionScore > 0.7
        |}
