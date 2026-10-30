import math
import unittest

from calculator import calculate


class CalculatorTests(unittest.TestCase):
    def test_operations(self):
        cases = [
            ("add", 1.5, 2.25, 3.75), ("subtract", -2, 3, -5),
            ("multiply", -3, 4, -12), ("divide", 7, 2, 3.5),
            ("divide", 0, 2, 0), ("power", 2, -2, .25),
            ("power", 0, 0, 1), ("sqrt", 9, None, 3),
            ("sqrt", 0, None, 0), ("sqrt", 9, 5, 3),
            ("percentage", 25, None, .25), ("percentage", -25, None, -.25),
            ("add", .1, .2, .3), ("subtract", .3, .1, .2),
            ("multiply", .1, .2, .02), ("divide", .3, .1, 3),
        ]
        for op, a, b, expected in cases:
            with self.subTest(op=op, a=a, b=b):
                self.assertEqual(calculate(op, a, b), expected)

    def test_invalid_operands_and_domains(self):
        cases = [
            ("divide", 2, 0), ("sqrt", -1, None), ("add", 2, None),
            ("unknown", 2, 1), (None, 2, 1), ([], 2, 1),
            ("sqrt", math.nan, None), ("add", 1, math.inf),
            ("sqrt", 10**400, None), ("sqrt", "9", None),
            ("add", True, 1), ("add", 1, False), ("sqrt", None, None),
            ("sqrt", 9, "ignored"), ("multiply", 1e308, 2),
            ("power", 1e308, 2), ("power", -1, .5), ("power", 0, -1),
        ]
        for op, a, b in cases:
            with self.subTest(op=op, a=a, b=b):
                with self.assertRaises(ValueError):
                    calculate(op, a, b)
