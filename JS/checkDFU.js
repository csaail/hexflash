
const usb = require('usb'); // Import the USB library

const STM32DFU = {
    usbdev: null, // Initialize the usbdev property
};

function checkDFU() {
    /**
     * Check if a DFU device with specific vendor and product IDs is connected.
     * @returns {boolean} - True if the device is found, False otherwise.
     */
    // Get the list of connected USB devices
    const devices = usb.getDeviceList();

    // Define the target vendor and product IDs
    const targetVendorId = 0x0483; // Example: 1155 in hex
    const targetProductId = 0xDF11; // Example: 57105 in hex

    // Find a device with the specified vendor and product IDs
    const device = devices.find(
        (dev) =>
            dev.deviceDescriptor.idVendor === targetVendorId &&
            dev.deviceDescriptor.idProduct === targetProductId
    );

    if (device) {
        // If a matching device is found
        STM32DFU.usbdev = device; // Assign the device to STM32DFU
        console.log("Device found:", STM32DFU.usbdev);
        return true;
    } else {
        // If no matching device is found
        STM32DFU.usbdev = null; // Reset the device to null
        console.log("No DFU device found.");
        return false;
    }
}

// Example usage
if (checkDFU()) {
    console.log("DFU device is connected.");
} else {
    console.log("No DFU device found.");
}
