export function startRunOutputStr(){
    let code_str;
    code_str =
`print(
"""
======================================
__   __  ___                _ _
\\ \\  \\ \\/ (_)_ __ ___ _   _(_) |_ ___
 \\ \\  \\  /| | '__/ __| | | | | __/ __|
 / /  /  \\| | | | (__| |_| | | |_\\__ \\\\
/_/  /_/\\_\\_|_|  \\___|\\__,_|_|\\__|___/

======================================
""")\n`
    code_str += "print('Xircuits is running...\\n')\n";

    return code_str;
}