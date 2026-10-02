import sys
from pathlib import Path


def minify_css(css):
    output = []
    pending_space = False
    quote = None
    index = 0

    while index < len(css):
        char = css[index]

        if quote:
            output.append(char)
            if char == "\\" and index + 1 < len(css):
                index += 1
                output.append(css[index])
            elif char == quote:
                quote = None
        elif char in ("'", '"'):
            if pending_space and output and output[-1] not in "{},;>:" and char not in "{},;>":
                output.append(" ")
            pending_space = False
            quote = char
            output.append(char)
        elif css.startswith("/*", index):
            end = css.find("*/", index + 2)
            if end == -1:
                raise ValueError("Unterminated CSS comment")
            pending_space = True
            index = end + 1
        elif char.isspace():
            pending_space = True
        else:
            if pending_space and output and output[-1] not in "{},;>:" and char not in "{},;>":
                output.append(" ")
            pending_space = False
            output.append(char)

        index += 1

    if quote:
        raise ValueError("Unterminated CSS string")

    return "".join(output).strip()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: minify_css.py INPUT.css OUTPUT.css")

    input_path, output_path = map(Path, sys.argv[1:])
    css = input_path.read_text(encoding="utf-8")
    output_path.write_text(minify_css(css), encoding="utf-8")
    print(f"{output_path.name} updated!")


if __name__ == "__main__":
    main()
