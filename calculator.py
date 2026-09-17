def calculator():
    print("Simple Python Calculator")
    print("Operations: +, -, *, /")

    first = float(input("Enter first number: "))
    operator = input("Enter operation: ")
    second = float(input("Enter second number: "))

    if operator == "+":
        result = first + second
    elif operator == "-":
        result = first - second
    elif operator == "*":
        result = first * second
    elif operator == "/":
        if second == 0:
            print("Error: Cannot divide by zero.")
            return
        result = first / second
    else:
        print("Error: Invalid operation.")
        return

    print(f"Result: {result}")


if __name__ == "__main__":
    calculator()
