const fs = require('fs');
const STM32DFU = require('./stm32dfu.js'); // Import STM32DFU protocol
const { parseHexFileFromPath } = require('./hexparse.js'); // Import HEX parsing function

const firmwareFlasher = function (hexFilePath) {
    const stm32dfu = new STM32DFU(); // Create an instance of STM32DFU protocol

    // Step 1: Initialize the USB device
    try {
        stm32dfu.initializeDevice(); // Initialize the USB device
        console.log('Device initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize the USB device:', error.message);
        return;
    }

    if (!hexFilePath) {
        console.error('No file path provided. Please specify the HEX file path.');
        return;
    }

    // Step 2: Check if the file exists
    fs.access(hexFilePath, fs.F_OK, (err) => {
        if (err) {
            console.error('HEX file not found. Please provide a valid path.');
            return;
        }

        try {
            // Step 3: Parse the HEX file
            const parsedHex = parseHexFileFromPath(hexFilePath);

            if (!parsedHex) {
                console.error('Failed to parse the HEX file. The file might be invalid.');
                return;
            }

            console.log('HEX file parsed successfully. Starting firmware flashing...');
            
            // Step 4: Connect and flash firmware
            stm32dfu.connect(parsedHex);

        } catch (error) {
            console.error('An error occurred while reading or parsing the HEX file:', error);
        }
    });
};

module.exports = firmwareFlasher;
