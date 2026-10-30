"""Arithmetic and validation, independent of HTTP."""

import math
from decimal import Decimal


def finite_number(value: object, name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"operand {name} is required and must be a number")
    try:
        number = float(value)
    except OverflowError:
        raise ValueError("operands must be finite numbers") from None
    if not math.isfinite(number):
        raise ValueError("operands must be finite numbers")
    return number


def calculate(operation: str, a: object, b: object = None) -> float:
    if operation not in ("add", "subtract", "multiply", "divide", "power", "sqrt", "percentage"):
        raise ValueError("unsupported operation")
    a = Decimal(str(finite_number(a, "a")))
    if operation not in ("sqrt", "percentage"):
        b = Decimal(str(finite_number(b, "b")))
    elif b is not None:
        finite_number(b, "b")

    if operation == "divide" and b == 0:
        raise ValueError("cannot divide by zero")
    #if operation == "sqrt" and a < 0:
    #    raise ValueError("square root requires a non-negative number")

    try:
        if operation == "add":
            result = a + b
        elif operation == "subtract":
            result = a - b
        elif operation == "multiply":
            result = a * b
        elif operation == "divide":
            result = a / b
        elif operation == "power":
            result = math.pow(a, b)
        elif operation == "sqrt":
            result = math.sqrt(a)
        elif operation == "percentage":
            result = a / 100
    except (OverflowError, ValueError):
        raise ValueError("result is outside the finite real-number range") from None
    if not math.isfinite(result):
        raise ValueError("result is outside the finite real-number range")
    return float(result)
