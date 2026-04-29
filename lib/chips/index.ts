import sql from '../db';

// جميع الشيبسات المدعومة
export async function getAllSupportedChips() {
  const chips = await sql`SELECT * FROM supported_chips WHERE is_active = true ORDER BY family, name`;
  return chips;
}

export async function getChipsByFamily(family: string) {
  const chips = await sql`
    SELECT * FROM supported_chips 
    WHERE is_active = true AND family = ${family} 
    ORDER BY name
  `;
  return chips;
}

export async function getChipById(id: number) {
  const chips = await sql`
    SELECT * FROM supported_chips WHERE id = ${id}
  `;
  return chips[0] || null;
}

export async function seedChips() {
  const existingCount = await sql`SELECT COUNT(*) FROM supported_chips`;
  if (existingCount[0].count > 0) return;

  const chips = [
    // ===== SPI NOR Flash =====
    // Winbond
    { name: 'W25Q80DV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '1MB', package: 'SOIC-8', manufacturer: 'Winbond' },
    { name: 'W25Q16DV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '2MB', package: 'SOIC-8', manufacturer: 'Winbond' },
    { name: 'W25Q32FV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'Winbond' },
    { name: 'W25Q64FV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8/WSON-8', manufacturer: 'Winbond' },
    { name: 'W25Q64JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8/WSON-8', manufacturer: 'Winbond' },
    { name: 'W25Q128FV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8/WSON-8', manufacturer: 'Winbond' },
    { name: 'W25Q128JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8/WSON-8', manufacturer: 'Winbond' },
    { name: 'W25Q256FV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'WSON-8/BGA', manufacturer: 'Winbond' },
    { name: 'W25Q256JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'WSON-8/BGA', manufacturer: 'Winbond' },
    { name: 'W25Q512JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '64MB', package: 'BGA', manufacturer: 'Winbond' },
    { name: 'W25Q01JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '128MB', package: 'BGA', manufacturer: 'Winbond' },
    { name: 'W25Q02JV', family: 'W25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '256MB', package: 'BGA', manufacturer: 'Winbond' },
    
    // Macronix
    { name: 'MX25L1606E', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '2MB', package: 'SOIC-8', manufacturer: 'Macronix' },
    { name: 'MX25L3206E', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'Macronix' },
    { name: 'MX25L6406E', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'Macronix' },
    { name: 'MX25L12805D', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8', manufacturer: 'Macronix' },
    { name: 'MX25L25635F', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'SOP-16/BGA', manufacturer: 'Macronix' },
    { name: 'MX25L51245G', family: 'MX25L', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '64MB', package: 'BGA', manufacturer: 'Macronix' },
    { name: 'MX66U1G45G', family: 'MX66U', type: 'SPI_NOR', protocol: 'QSPI', voltage: '1.7V-2.0V', size: '128MB', package: 'BGA', manufacturer: 'Macronix' },
    
    // Spansion / Cypress / Infineon
    { name: 'S25FL032P', family: 'S25FL', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'Spansion/Cypress' },
    { name: 'S25FL064P', family: 'S25FL', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'Spansion/Cypress' },
    { name: 'S25FL128S', family: 'S25FL', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8/WSON-8', manufacturer: 'Spansion/Cypress' },
    { name: 'S25FL256S', family: 'S25FL', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'WSON-8/BGA', manufacturer: 'Spansion/Cypress' },
    { name: 'S25FL512S', family: 'S25FL', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '64MB', package: 'BGA', manufacturer: 'Spansion/Cypress' },
    { name: 'S25HS512T', family: 'S25HS', type: 'SPI_NOR', protocol: 'HyperBus', voltage: '1.8V', size: '64MB', package: 'BGA', manufacturer: 'Infineon/Cypress' },
    
    // Micron
    { name: 'N25Q032A13', family: 'N25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'Micron' },
    { name: 'N25Q064A13', family: 'N25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'Micron' },
    { name: 'N25Q128A13', family: 'N25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8', manufacturer: 'Micron' },
    { name: 'N25Q256A13', family: 'N25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'BGA', manufacturer: 'Micron' },
    { name: 'MT25Q128ABA', family: 'MT25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '1.7V-2.0V', size: '16MB', package: 'BGA', manufacturer: 'Micron' },
    { name: 'MT25Q256ABA', family: 'MT25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '1.7V-2.0V', size: '32MB', package: 'BGA', manufacturer: 'Micron' },
    
    // GigaDevice
    { name: 'GD25Q32', family: 'GD25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'GigaDevice' },
    { name: 'GD25Q64', family: 'GD25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'GigaDevice' },
    { name: 'GD25Q128', family: 'GD25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8', manufacturer: 'GigaDevice' },
    { name: 'GD25Q256', family: 'GD25Q', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'WSON-8', manufacturer: 'GigaDevice' },
    { name: 'GD5F1GQ4', family: 'GD5F', type: 'SPI_NAND', protocol: 'SPI', voltage: '2.7V-3.6V', size: '128MB', package: 'WSON-8', manufacturer: 'GigaDevice' },
    
    // EON
    { name: 'EN25Q32A', family: 'EN25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'EON' },
    { name: 'EN25Q64A', family: 'EN25Q', type: 'SPI_NOR', protocol: 'SPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'EON' },
    { name: 'EN25QH128A', family: 'EN25QH', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8', manufacturer: 'EON' },
    
    // XMC
    { name: 'XM25QH32', family: 'XM25QH', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '4MB', package: 'SOIC-8', manufacturer: 'XMC' },
    { name: 'XM25QH64', family: 'XM25QH', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '8MB', package: 'SOIC-8', manufacturer: 'XMC' },
    { name: 'XM25QH128', family: 'XM25QH', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '16MB', package: 'SOIC-8', manufacturer: 'XMC' },
    { name: 'XM25QH256', family: 'XM25QH', type: 'SPI_NOR', protocol: 'SPI/QPI', voltage: '2.7V-3.6V', size: '32MB', package: 'WSON-8', manufacturer: 'XMC' },
    
    // ===== I2C EEPROM =====
    { name: 'AT24C01', family: 'AT24C', type: 'I2C_EEPROM', protocol: 'I2C', voltage: '1.8V-5.5V', size: '128B', package: 'SOIC-8/DIP-8', manufacturer: 'Microchip/Atmel' },
    { name: 'AT24C02', family: 'AT24C', type: 'I2C_EEPROM', protocol: 'I2C', voltage: '1.8V-5.5V', size: '256B', package: 'SOIC-8/DIP-8', manufacturer: 'Microchip/Atmel' },
    { name: 'AT24C04', family: 'AT24C', type: 'I2C_EEPROM', protocol: 'I2C', voltage: '1.8V-5.5V', size: '512B', package: 'SOIC-8/DIP-8', manufacturer: 'Microchip/Atmel' },
    { name: 'AT24C08', family: 'AT24C', type: 'I2C_EEPROM', protocol: 'I2C', voltage: '1.8V-5.5V', size: '1KB', package: 'SOIC-8/DIP-8', manufacturer: 'Microchip/Atmel' },
    { name: 'AT24C16', family: 'AT24C', type: 'I2C_EEPROM', protocol: 'I2C', voltage: '1.8V-5.5V', size: '2KB', package: 'SOIC-8/DIP-8', manufacturer: 'Microchip/Atmel' },
    { name: 'AT24C32', family: 'AT24C', type: 'I2C_EEP
