import { js as beautify } from "js-beautify";

export default function codeFormatter(code: string) {
    return beautify(code, {
        indent_size: 4,
        wrap_line_length: 80,
    });
}
