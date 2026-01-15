"""
Utility functions for payment validation
"""
from datetime import datetime


def validate_expiry_date(expiry_str):
    """
    Validate credit card expiration date
    
    Args:
        expiry_str: String in MM/YY format (e.g., "12/25")
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    if not expiry_str:
        return False, "Expiration date is required"
    
    # Check format
    if '/' not in expiry_str:
        return False, "Invalid format. Use MM/YY"
    
    parts = expiry_str.split('/')
    if len(parts) != 2:
        return False, "Invalid format. Use MM/YY"
    
    month_str, year_str = parts
    
    # Validate month
    try:
        month = int(month_str)
        if month < 1 or month > 12:
            return False, "Invalid month. Must be between 01 and 12"
    except ValueError:
        return False, "Invalid month format"
    
    # Validate year
    try:
        year = int(year_str)
        # Assume 20xx for years (e.g., 25 = 2025)
        if year < 100:
            year += 2000
    except ValueError:
        return False, "Invalid year format"
    
    # Check if card is expired
    current_date = datetime.now()
    current_year = current_date.year
    current_month = current_date.month
    
    # Card expires at the END of the expiration month
    if year < current_year:
        return False, "Card has expired"
    elif year == current_year and month < current_month:
        return False, "Card has expired"
    
    # Check reasonable future date (not more than 20 years in future)
    if year > current_year + 20:
        return False, "Invalid expiration year"
    
    return True, None


def format_expiry_date(expiry_str):
    """
    Format expiration date to MM/YY format
    
    Args:
        expiry_str: String containing digits
    
    Returns:
        str: Formatted string in MM/YY format
    """
    # Remove all non-digits
    digits = ''.join(c for c in expiry_str if c.isdigit())
    
    # Format as MM/YY
    if len(digits) >= 4:
        return f"{digits[:2]}/{digits[2:4]}"
    elif len(digits) >= 2:
        return f"{digits[:2]}/"
    else:
        return digits
