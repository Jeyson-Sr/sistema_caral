/**
 * Formats a number with thousand separators and optional symbol
 * @param value - Number to format
 * @param symbol - Optional symbol to add (e.g. '%')
 * @param position - Symbol position: 1 for after number, 0 for before number
 * @returns Formatted string
 */
export const formatNumber = (
    value: number | string,
    symbol: string = '',
    position: 0 | 1 = 1
): string => {
    if (!value && value !== 0) return '';

    // Convert to string and handle decimals
    let numStr = value.toString();
    
    // Handle decimal numbers less than 1
    if (numStr.startsWith('.')) {
        numStr = '0' + numStr;
    }

    // Split number into integer and decimal parts
    const parts = numStr.split('.');
    
    // Add thousand separators to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Rejoin with decimal if exists
    const formattedNum = parts.join('.');

    // Add symbol based on position if provided
    if (symbol) {
        return position === 1 ? `${symbol}${formattedNum}` : `${formattedNum}${symbol}`;
    }

    return formattedNum;
}

// Usage examples:
// formatNumber(1234567.89)          -> "1,234,567.89"
// formatNumber(1234.56, '%')        -> "1,234.56%"
// formatNumber(1234.56, '$', 1)     -> "$1,234.56"
// formatNumber(.5)                  -> "0.5"
// formatNumber(1000000)             -> "1,000,000"
