'use strict';
const fs = require('fs'); // Import the file system module

// Define the HEX parsing function
function read_hex_file(data) {
    data = data.split("\n");

    if (data[data.length - 1] == "") {
        data.pop();
    }

    let hexfile_valid = true;

    const result = {
        data: [],
        end_of_file: false,
        bytes_total: 0,
        start_linear_address: 0,
    };

    let extended_linear_address = 0;
    let next_address = 0;

    for (let i = 0; i < data.length && hexfile_valid; i++) {
        const byte_count = parseInt(data[i].substr(1, 2), 16);
        const address = parseInt(data[i].substr(3, 4), 16);
        const record_type = parseInt(data[i].substr(7, 2), 16);
        const content = data[i].substr(9, byte_count * 2);
        const checksum = parseInt(data[i].substr(9 + byte_count * 2, 2), 16);

        switch (record_type) {
            case 0x00: // Data record
                if (address !== next_address || next_address === 0) {
                    result.data.push({
                        address: extended_linear_address + address,
                        bytes: 0,
                        data: [],
                    });
                }

                next_address = address + byte_count;

                let crc = byte_count +
                    parseInt(data[i].substr(3, 2), 16) +
                    parseInt(data[i].substr(5, 2), 16) +
                    record_type;

                for (let needle = 0; needle < byte_count * 2; needle += 2) {
                    const num = parseInt(content.substr(needle, 2), 16);
                    const data_block = result.data.length - 1;

                    result.data[data_block].data.push(num);
                    result.data[data_block].bytes++;
                    crc += num;
                    result.bytes_total++;
                }

                crc = (~crc + 1) & 0xFF;

                if (crc !== checksum) {
                    hexfile_valid = false;
                }
                break;
            case 0x01: // End of file record
                result.end_of_file = true;
                break;
            case 0x04: // Extended linear address record
                extended_linear_address =
                    (parseInt(content.substr(0, 2), 16) << 24) |
                    (parseInt(content.substr(2, 2), 16) << 16);
                break;
            case 0x05: // Start linear address record
                result.start_linear_address = parseInt(content, 16);
                break;
        }
    }

    if (result.end_of_file && hexfile_valid) {
        return result;
    } else {
        return false;
    }
}

// Utility function to read HEX files
function parseHexFileFromPath(filePath) {
    const hexData = fs.readFileSync(filePath, 'utf8');
    return read_hex_file(hexData);
}

module.exports = {
    read_hex_file,
    parseHexFileFromPath,
};
