const vscode = require('vscode');
const usb = require('usb'); // Use the usb library to detect DFU devices
const firmwareFlasher = require('../JS/flasher.js'); // Adjust the path if needed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('STM32 DFU Flash extension is now active!');

  let disposable = vscode.commands.registerCommand('extension.flashHex', async () => {
    try {
      // Check if a DFU device is connected
      const devices = usb.getDeviceList();
      const dfuDevice = devices.find(
        (device) =>
          device.deviceDescriptor.idVendor === 0x0483 && // STM32 DFU Vendor ID
          device.deviceDescriptor.idProduct === 0xdf11 // STM32 DFU Product ID
      );

      if (!dfuDevice) {
        vscode.window.showErrorMessage('No STM32 DFU device connected. Please connect the device and try again.');
        return;
      }

      vscode.window.showInformationMessage('STM32 DFU device detected.');

      // Prompt the user to select the HEX file
      const hexFilePath = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: 'Select HEX File',
        filters: { 'HEX Files': ['hex'], 'All Files': ['*'] },
      });

      if (hexFilePath && hexFilePath[0]) {
        try {
          // Flash the selected HEX file
          firmwareFlasher(hexFilePath[0].fsPath.trim());
          vscode.window.showInformationMessage('Firmware flashing initiated.');
        } catch (error) {
          vscode.window.showErrorMessage(`Error during firmware flashing: ${error.message}`);
        }
      } else {
        vscode.window.showWarningMessage('No HEX file was selected.');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error checking for DFU device: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
